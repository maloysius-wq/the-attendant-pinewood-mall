import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const root=process.cwd();
for(const tool of ['ffmpeg','ffprobe','espeak-ng']){
  const arg=tool==='espeak-ng'?'--version':'-version';
  if(spawnSync(tool,[arg],{stdio:'ignore'}).status!==0)throw new Error(`${tool} is required.`);
}

const dialogueText=await readFile(path.join(root,'story','dialogue.js'),'utf8');
const sandbox={};vm.createContext(sandbox);
vm.runInContext(dialogueText.replace('export const DIALOGUE_V17=','globalThis.DIALOGUE_V17='),sandbox);
const dialogue=sandbox.DIALOGUE_V17;
if(!dialogue)throw new Error('Could not load DIALOGUE_V17');

const sources=JSON.parse(await readFile(path.join(root,'story','renee-voice-sources-v27.json'),'utf8'));
if(sources.version!==27||sources.voiceId!=='crisp'||sources.approvedTake!==1)throw new Error('Approved Renee Crisp Take 1 source manifest missing.');

const outDir=path.join(root,'assets','audio','characters');
const tempDir=path.join(root,'.tmp-renee-neural-v27');
await rm(tempDir,{recursive:true,force:true});
await mkdir(tempDir,{recursive:true});
await mkdir(outDir,{recursive:true});

const manifestPath=path.join(outDir,'manifest.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
const sha256=data=>createHash('sha256').update(data).digest('hex');
const stableSeed=id=>Math.max(1,Number.parseInt(createHash('sha256').update(id).digest('hex').slice(0,7),16));
const probeDuration=file=>{
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',file],{encoding:'utf8'}));
  const duration=Number(probe?.format?.duration||0);
  if(!Number.isFinite(duration)||duration<=0)throw new Error(`Could not determine positive duration for ${file}.`);
  return duration;
};
const roundedDuration=value=>Number(Number(value).toFixed(3));
const assertDurationSafe=(label,sourceDuration,outputDuration)=>{
  if(outputDuration+.05<sourceDuration)throw new Error(`${label} render truncated source audio: source ${sourceDuration.toFixed(3)}s, output ${outputDuration.toFixed(3)}s.`);
};

const genuine=Object.values(dialogue).filter(line=>line.medium==='radio'&&line.speaker==='RENEE');
const fake=Object.values(dialogue).filter(line=>line.medium==='radio'&&line.speaker==='RENEE?');
const overlap=Object.values(dialogue).find(line=>line.id==='ch6_radio_overlap');
if(genuine.length!==42)throw new Error(`Expected 42 genuine Renee lines, found ${genuine.length}.`);
if(fake.length!==2)throw new Error(`Expected 2 fake-Renee lines, found ${fake.length}.`);
if(!overlap)throw new Error('Chapter 6 overlap dialogue missing.');

for(const line of [...genuine,...fake]){
  if(!sources.sources?.[line.id])throw new Error(`Missing neural source URL for ${line.id}.`);
}
if(!sources.sources?.ch6_radio_overlap_renee)throw new Error('Missing neural Renee source for Chapter 6 overlap.');

async function download(url,dest,label){
  let lastError;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      console.log(`Downloading ${label} (${attempt}/3)...`);
      const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000)});
      if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);
      const bytes=Buffer.from(await response.arrayBuffer());
      if(bytes.length<1000)throw new Error(`source is unexpectedly small (${bytes.length} bytes)`);
      await writeFile(dest,bytes);
      return;
    }catch(error){
      lastError=error;
      console.warn(`Download attempt ${attempt} failed for ${label}: ${error.message}`);
      if(attempt<3)await new Promise(resolve=>setTimeout(resolve,1000*attempt));
    }
  }
  throw new Error(`Failed to download ${label} after 3 attempts: ${lastError?.message||lastError}`);
}

// Renee should remain recognizably human, but read clearly as a handheld dispatch radio.
// IMPORTANT: dynamic loudnorm internally changes sample rate. Always resample its output
// back to 44.1 kHz before feeding it into amix with the 44.1 kHz radio-noise stream.
// Without this explicit boundary FFmpeg shortens the finite voice timeline by ~2.8 seconds.
const reneeCore='aresample=44100,highpass=f=340,lowpass=f=2950,acompressor=threshold=0.070:ratio=5.4:attack=3:release=70,equalizer=f=900:t=q:w=1.0:g=1.8,equalizer=f=1850:t=q:w=0.9:g=4.4,acrusher=bits=13:mode=lin:aa=1:mix=0.040';
const realFx=`[0:a]${reneeCore},loudnorm=I=-20.0:LRA=4.5:TP=-2.0,aresample=44100[voice];[1:a]aresample=44100,highpass=f=600,lowpass=f=3800,volume=0.16[noise];[voice][noise]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.92,apad=pad_dur=0.14[out]`;
const fakeFx='[0:a]aresample=44100,asetrate=42600,aresample=44100,highpass=f=250,lowpass=f=3150,acompressor=threshold=0.06:ratio=6.2:attack=4:release=80,equalizer=f=1750:t=q:w=1.0:g=3.0,acrusher=bits=10:mode=lin:aa=1:mix=0.19,tremolo=f=12:d=0.085,aecho=0.70:0.24:43|107:0.16|0.07,loudnorm=I=-18.5:LRA=4:TP=-1.8,aresample=44100[voice];[1:a]aresample=44100,highpass=f=500,lowpass=f=4200,volume=0.15[noise];[voice][noise]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.94,apad=pad_dur=0.14[out]';

function renderRadio(source,output,fx,id,noiseAmplitude=0.007){
  execFileSync('ffmpeg',[
    '-hide_banner','-loglevel','error','-y',
    '-i',source,
    '-f','lavfi','-i',`anoisesrc=color=pink:amplitude=${noiseAmplitude}:r=44100:seed=${stableSeed(id)}`,
    '-filter_complex',fx,
    '-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',output
  ]);
}

async function updateEntry(line,profile,sourceUrl){
  const source=path.join(tempDir,`${line.id}.mp3`);
  const output=path.join(outDir,`${line.id}.ogg`);
  await download(sourceUrl,source,line.id);
  const sourceDuration=probeDuration(source);
  renderRadio(source,output,profile==='renee'?realFx:fakeFx,line.id,profile==='renee'?0.007:0.006);
  const outputDuration=probeDuration(output);
  assertDurationSafe(line.id,sourceDuration,outputDuration);
  const bytes=await readFile(output);
  manifest.files[line.id]={
    file:`${line.id}.ogg`,
    text:line.text,
    speaker:profile==='renee'?'RENEE WARD':'RENEE?',
    profile,
    sourceVoice:'AI Voice Generator Crisp / approved Take 1',
    sourceDuration:roundedDuration(sourceDuration),
    sha256:sha256(bytes),
    duration:roundedDuration(outputDuration)
  };
}

for(const line of genuine)await updateEntry(line,'renee',sources.sources[line.id]);
for(const line of fake)await updateEntry(line,'fake-renee',sources.sources[line.id]);

// Chapter 6 intentionally overlaps the real Renee transmission with an inhuman counterfeit.
// Preserve Renee's approved neural performance as the foreground and keep the counterfeit
// as a separately processed local voice so the scene remains legible and uncanny.
const overlapReneeMp3=path.join(tempDir,'ch6-radio-overlap-renee.mp3');
const overlapReneeWav=path.join(tempDir,'ch6-radio-overlap-renee.wav');
const overlapUnknownWav=path.join(tempDir,'ch6-radio-overlap-unknown.wav');
const overlapOut=path.join(outDir,'ch6_radio_overlap.ogg');
await download(sources.sources.ch6_radio_overlap_renee,overlapReneeMp3,'ch6_radio_overlap_renee');
const overlapSourceDuration=probeDuration(overlapReneeMp3);
execFileSync('ffmpeg',[
  '-hide_banner','-loglevel','error','-y','-i',overlapReneeMp3,
  '-af',`${reneeCore},loudnorm=I=-20.0:LRA=4.5:TP=-2.0,aresample=44100`,
  '-ac','1','-ar','44100',overlapReneeWav
]);
assertDurationSafe('ch6_radio_overlap_renee intermediate',overlapSourceDuration,probeDuration(overlapReneeWav));
execFileSync('espeak-ng',[
  '-v','en-us+m3','-s','132','-p','16','-a','170','-g','2','-w',overlapUnknownWav,
  'Fourteen, Ward on dispatch. Return to assigned station. Return to assigned station.'
]);
// Mix the two finite voice layers first. Then use that finite mix as the duration master
// when adding the intentionally infinite noise generator. The final loudnorm is followed
// by an explicit 44.1 kHz resample before limiting, keeping timestamps and duration stable.
const overlapFx='[0:a]adelay=0,volume=0.90[a];[1:a]adelay=1650,asetrate=40100,aresample=44100,highpass=f=135,lowpass=f=2750,acompressor=threshold=0.055:ratio=7:attack=4:release=90,acrusher=bits=9:mode=lin:aa=1:mix=0.23,tremolo=f=11:d=0.12,aecho=0.72:0.28:49|117:0.18|0.08,volume=0.52[b];[a][b]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0[voices];[2:a]aresample=44100,highpass=f=550,lowpass=f=3900,volume=0.15[n];[voices][n]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,loudnorm=I=-19.5:LRA=4:TP=-2.0,aresample=44100,alimiter=limit=0.92,apad=pad_dur=0.15[out]';
execFileSync('ffmpeg',[
  '-hide_banner','-loglevel','error','-y','-i',overlapReneeWav,'-i',overlapUnknownWav,
  '-f','lavfi','-i',`anoisesrc=color=pink:amplitude=0.007:r=44100:seed=${stableSeed('ch6_radio_overlap')}`,
  '-filter_complex',overlapFx,'-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',overlapOut
]);
{
  const outputDuration=probeDuration(overlapOut);
  assertDurationSafe('ch6_radio_overlap',overlapSourceDuration,outputDuration);
  const bytes=await readFile(overlapOut);
  manifest.files.ch6_radio_overlap={
    file:'ch6_radio_overlap.ogg',
    text:overlap.text,
    speaker:'RENEE / UNKNOWN',
    profile:'overlap',
    sourceVoice:'AI Voice Generator Crisp / approved Take 1 foreground + local counterfeit layer',
    sourceDuration:roundedDuration(overlapSourceDuration),
    sha256:sha256(bytes),
    duration:roundedDuration(outputDuration)
  };
}

manifest.version=27;
manifest.generatedAt=new Date().toISOString();
manifest.source='story/dialogue.js + story/renee-voice-sources-v27.json + authored recorded evidence';
manifest.engine={
  name:'Mixed pre-rendered voices',
  renee:'AI Voice Generator Crisp / approved Take 1',
  archivalAndCounterfeit:'eSpeak NG retained only for Jo/Eli archival recordings and the Chapter 6 counterfeit layer'
};
manifest.processing={
  name:'FFmpeg',
  description:'approved Renee Take 1 pronounced dispatch-radio chain at reduced level; duration-safe 44.1 kHz normalization/mix boundary with source/output duration guard; deterministic radio noise; corrupted neural-base fake Renee; finite layered Chapter 6 overlap; archival recording chains retained'
};

await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(outDir,'README.md'),`# Pinewood Character Voice Assets

Pre-rendered, repository-local dialogue for Audio Direction v27.

## Renee Ward

Renee uses the user-approved **AI Voice Generator Crisp, Take 1** performance direction: a professional overnight dispatcher maintaining control while fear increasingly leaks through her cadence. Her final files use a pronounced handheld walkie-talkie treatment: tighter communications bandwidth, stronger dispatch compression/presence, modest transmission grit, and clearly audible but still low-level deterministic radio noise. Her integrated level is reduced from the first neural production pass so she sits more naturally inside the mall soundscape instead of riding above it.

The production renderer explicitly returns dynamic loudness-normalization output to 44.1 kHz before mixing the radio-noise stream. This prevents FFmpeg's internal loudnorm sample-rate change from shortening the finite voice timeline. Every neural Renee/fake-Renee render is also rejected if its final duration is shorter than its downloaded source, so a clipped production line cannot silently ship again.

The radio treatment remains deliberately lighter than the supernatural processing on fake-Renee and distinctly more human than PCAS. Fake-Renee lines begin from the same Crisp neural voice so the imitation is recognizably Renee before receiving more aggressive corruption. Chapter 6 keeps Renee's neural performance in the foreground while a separately rendered counterfeit transmission overlaps it.

Jo Alvarez and Eli Mercer remain distinct local archival-recording voices.

## Runtime and provenance

All game playback uses local OGG files from this directory. There are no runtime cloud TTS calls, browser speech synthesis calls, or remote audio requests.

Renee source performances were generated with AI Voice Generator by Level 2 Labs / AI Doc Maker. Their Terms of Service state that users retain rights to content they generate. Attribution is included here to satisfy the provider's published free-tier commercial-use attribution requirement as a conservative baseline.

- Provider: AI Doc Maker / Level 2 Labs
- Voice tool: AI Voice Generator
- Approved voice: Crisp, Take 1
- Terms: https://www.aidocmaker.com/terms-of-service
- Pricing / attribution note: https://www.aidocmaker.com/pricing
- Development-time source manifest: \`story/renee-voice-sources-v27.json\`
- Production renderer: \`scripts/render-renee-neural-v27.mjs\`

`);
await rm(tempDir,{recursive:true,force:true});
console.log(`Rendered ${genuine.length} genuine Renee clips, ${fake.length} fake-Renee clips, and the Chapter 6 overlap with duration-safe radio processing.`);
