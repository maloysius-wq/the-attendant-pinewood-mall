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

async function download(url,dest){
  const response=await fetch(url,{redirect:'follow'});
  if(!response.ok)throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length<1000)throw new Error(`Downloaded source is unexpectedly small: ${url}`);
  await writeFile(dest,bytes);
}

const realFx='[0:a]aresample=44100,highpass=f=300,lowpass=f=3250,acompressor=threshold=0.075:ratio=4.8:attack=4:release=75,equalizer=f=1850:t=q:w=1.0:g=3.6,acrusher=bits=14:mode=lin:aa=1:mix=0.018,loudnorm=I=-18.5:LRA=5:TP=-1.8[voice];[1:a]highpass=f=650,lowpass=f=3900,volume=0.11[noise];[voice][noise]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.94,apad=pad_dur=0.12[out]';
const fakeFx='[0:a]aresample=44100,asetrate=42600,aresample=44100,highpass=f=250,lowpass=f=3150,acompressor=threshold=0.06:ratio=6.2:attack=4:release=80,equalizer=f=1750:t=q:w=1.0:g=3.0,acrusher=bits=10:mode=lin:aa=1:mix=0.19,tremolo=f=12:d=0.085,aecho=0.70:0.24:43|107:0.16|0.07,loudnorm=I=-18.5:LRA=4:TP=-1.8[voice];[1:a]highpass=f=500,lowpass=f=4200,volume=0.15[noise];[voice][noise]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.94,apad=pad_dur=0.14[out]';

function renderRadio(source,output,fx){
  execFileSync('ffmpeg',[
    '-hide_banner','-loglevel','error','-y',
    '-i',source,
    '-f','lavfi','-i','anoisesrc=color=pink:amplitude=0.006:r=44100',
    '-filter_complex',fx,
    '-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',output
  ]);
}

async function updateEntry(line,profile,sourceUrl){
  const source=path.join(tempDir,`${line.id}.mp3`);
  const output=path.join(outDir,`${line.id}.ogg`);
  await download(sourceUrl,source);
  renderRadio(source,output,profile==='renee'?realFx:fakeFx);
  const bytes=await readFile(output);
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',output],{encoding:'utf8'}));
  manifest.files[line.id]={
    file:`${line.id}.ogg`,
    text:line.text,
    speaker:profile==='renee'?'RENEE WARD':'RENEE?',
    profile,
    sourceVoice:'AI Voice Generator Crisp / approved Take 1',
    sha256:sha256(bytes),
    duration:Number(Number(probe?.format?.duration||0).toFixed(3))
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
await download(sources.sources.ch6_radio_overlap_renee,overlapReneeMp3);
execFileSync('ffmpeg',[
  '-hide_banner','-loglevel','error','-y','-i',overlapReneeMp3,
  '-af','aresample=44100,highpass=f=300,lowpass=f=3250,acompressor=threshold=0.075:ratio=4.8:attack=4:release=75,equalizer=f=1850:t=q:w=1.0:g=3.6',
  '-ac','1','-ar','44100',overlapReneeWav
]);
execFileSync('espeak-ng',[
  '-v','en-us+m3','-s','132','-p','16','-a','170','-g','2','-w',overlapUnknownWav,
  'Fourteen, Ward on dispatch. Return to assigned station. Return to assigned station.'
]);
const overlapFx='[0:a]adelay=0,volume=1.0[a];[1:a]adelay=1650,asetrate=40100,aresample=44100,highpass=f=135,lowpass=f=2750,acompressor=threshold=0.055:ratio=7:attack=4:release=90,acrusher=bits=9:mode=lin:aa=1:mix=0.23,tremolo=f=11:d=0.12,aecho=0.72:0.28:49|117:0.18|0.08,volume=0.56[b];[2:a]highpass=f=550,lowpass=f=4000,volume=0.12[n];[a][b][n]amix=inputs=3:duration=longest:normalize=0,loudnorm=I=-18.5:LRA=4:TP=-1.8,alimiter=limit=0.94,apad=pad_dur=0.15[out]';
execFileSync('ffmpeg',[
  '-hide_banner','-loglevel','error','-y','-i',overlapReneeWav,'-i',overlapUnknownWav,
  '-f','lavfi','-i','anoisesrc=color=pink:amplitude=0.006:r=44100',
  '-filter_complex',overlapFx,'-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',overlapOut
]);
{
  const bytes=await readFile(overlapOut);
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',overlapOut],{encoding:'utf8'}));
  manifest.files.ch6_radio_overlap={
    file:'ch6_radio_overlap.ogg',
    text:overlap.text,
    speaker:'RENEE / UNKNOWN',
    profile:'overlap',
    sourceVoice:'AI Voice Generator Crisp / approved Take 1 foreground + local counterfeit layer',
    sha256:sha256(bytes),
    duration:Number(Number(probe?.format?.duration||0).toFixed(3))
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
  description:'approved Renee Take 1 natural dispatch-radio chain; corrupted neural-base fake Renee; layered Chapter 6 overlap; archival recording chains retained'
};

await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(outDir,'README.md'),`# Pinewood Character Voice Assets

Pre-rendered, repository-local dialogue for Audio Direction v27.

## Renee Ward

Renee uses the user-approved **AI Voice Generator Crisp, Take 1** performance direction: a professional overnight dispatcher maintaining control while fear increasingly leaks through her cadence. Her final files use restrained walkie-talkie processing: narrow speech bandwidth, communications compression, light presence emphasis, extremely mild transmission grit, and low-level radio noise. The processing deliberately avoids robotic tremolo, heavy bitcrushing, or pitch effects that would make her resemble PCAS.

Fake-Renee lines begin from the same Crisp neural voice so the imitation is recognizably Renee before receiving more aggressive corruption. Chapter 6 keeps Renee's neural performance in the foreground while a separately rendered counterfeit transmission overlaps it.

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
console.log(`Rendered ${genuine.length} genuine Renee clips, ${fake.length} fake-Renee clips, and the Chapter 6 overlap.`);
