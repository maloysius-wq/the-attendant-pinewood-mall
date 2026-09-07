import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,rm,rename,writeFile} from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
for(const tool of ['ffmpeg','ffprobe'])if(spawnSync(tool,['-version'],{stdio:'ignore'}).status!==0)throw new Error(`${tool} is required.`);
const outDir=path.join(root,'assets','audio','characters');
const tempDir=path.join(root,'.tmp-renee-walkie-v29');
await rm(tempDir,{recursive:true,force:true});
await mkdir(tempDir,{recursive:true});
const manifestPath=path.join(outDir,'manifest.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
if(manifest.version!==27)throw new Error('Character voice manifest v27 is required.');
const sha256=data=>createHash('sha256').update(data).digest('hex');
const seed=id=>Math.max(1,Number.parseInt(createHash('sha256').update('walkie-v29:'+id).digest('hex').slice(0,7),16));
const duration=file=>{
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',file],{encoding:'utf8'}));
  const d=Number(probe?.format?.duration||0);if(!Number.isFinite(d)||d<=0)throw new Error(`Invalid duration for ${file}`);return d;
};

// Intentionally extreme handheld-radio signature. The goal is immediate recognition as a
// cheap communications speaker, not a clean voice with tasteful EQ. Keep Renee human under
// the transmission damage, but allow bandwidth loss, compression, grit, hiss and squelch to show.
function genuineFx(d){
  const endDelay=Math.max(0,Math.round((d-0.14)*1000));
  return `[0:a]aresample=44100,highpass=f=650,lowpass=f=2150,acompressor=threshold=0.040:ratio=12:attack=1:release=48,equalizer=f=900:t=q:w=1.0:g=4.0,equalizer=f=1550:t=q:w=.82:g=8.0,equalizer=f=2050:t=q:w=.72:g=5.0,acrusher=bits=9:mode=lin:aa=1:mix=.28,aecho=.34:.08:18:.045,loudnorm=I=-22.5:LRA=2.6:TP=-3.0,aresample=44100[voice];[1:a]aresample=44100,highpass=f=760,lowpass=f=3000,volume=.42[bed];[2:a]aresample=44100,highpass=f=820,lowpass=f=3700,atrim=duration=0.135,afade=t=out:st=0.050:d=0.085,volume=.72[s0];[3:a]aresample=44100,highpass=f=820,lowpass=f=3700,atrim=duration=0.145,afade=t=in:st=0:d=0.020,afade=t=out:st=0.065:d=0.080,adelay=${endDelay},volume=.64[s1];[voice][bed][s0][s1]amix=inputs=4:duration=first:dropout_transition=0:normalize=0,alimiter=limit=.86,apad=pad_dur=0.18[out]`;
}
function overlapFx(d){
  const endDelay=Math.max(0,Math.round((d-0.14)*1000));
  return `[0:a]aresample=44100,highpass=f=590,lowpass=f=2250,acompressor=threshold=0.042:ratio=10.5:attack=1:release=52,equalizer=f=1500:t=q:w=.85:g=6.5,equalizer=f=2050:t=q:w=.75:g=4.0,acrusher=bits=9:mode=lin:aa=1:mix=.22,loudnorm=I=-22.0:LRA=2.8:TP=-2.8,aresample=44100[voice];[1:a]aresample=44100,highpass=f=720,lowpass=f=3100,volume=.34[bed];[2:a]aresample=44100,highpass=f=820,lowpass=f=3700,atrim=duration=0.125,afade=t=out:st=0.045:d=0.080,volume=.62[s0];[3:a]aresample=44100,highpass=f=820,lowpass=f=3700,atrim=duration=0.140,adelay=${endDelay},afade=t=out:st=0.060:d=0.080,volume=.56[s1];[voice][bed][s0][s1]amix=inputs=4:duration=first:dropout_transition=0:normalize=0,alimiter=limit=.88,apad=pad_dur=0.18[out]`;
}

let processed=0;
for(const [id,entry] of Object.entries(manifest.files||{})){
  if(!['renee','overlap'].includes(entry.profile))continue;
  const input=path.join(outDir,entry.file),output=path.join(tempDir,entry.file);
  const inputDuration=duration(input),fx=entry.profile==='renee'?genuineFx(inputDuration):overlapFx(inputDuration);
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,
    '-f','lavfi','-i',`anoisesrc=color=pink:amplitude=${entry.profile==='renee'?0.035:0.028}:r=44100:seed=${seed(id)}`,
    '-f','lavfi','-i',`anoisesrc=color=white:amplitude=.080:r=44100:seed=${seed(id+'-start')}`,
    '-f','lavfi','-i',`anoisesrc=color=white:amplitude=.070:r=44100:seed=${seed(id+'-end')}`,
    '-filter_complex',fx,'-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',output]);
  const outDuration=duration(output);
  if(outDuration+.05<inputDuration)throw new Error(`${id} extreme-radio render truncated: ${outDuration}s < ${inputDuration}s`);
  await rename(output,input);
  const bytes=await readFile(input);
  entry.sha256=sha256(bytes);entry.duration=Number(outDuration.toFixed(3));entry.walkiePostProcess='v29-extreme-handheld';
  processed++;
}
if(processed!==43)throw new Error(`Expected 43 genuine/overlap Renee files, processed ${processed}.`);
manifest.generatedAt=new Date().toISOString();
manifest.processing={
  name:'FFmpeg',
  description:'approved Renee Take 1 extreme handheld walkie-talkie post-pass; 650-2150 Hz communications band, 12:1 hard compression, strong small-speaker midrange, 9-bit transmission grit, persistent deterministic filtered hiss and obvious edge squelch; runtime Renee playback gain is 75 percent of the previous level; duration-safe neural source pipeline retained; fake-Renee corruption and archival recording chains retained'
};
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
const readmePath=path.join(outDir,'README.md');
let readme=await readFile(readmePath,'utf8');
const note='\n## Walkie hardening v29\n\nRenee now receives an intentionally extreme handheld-radio post-pass after the approved neural render: a 650-2150 Hz communications band, 12:1 compression, strong small-speaker midrange, much heavier transmission grit, a persistent filtered hiss bed, and obvious squelch bursts at both transmission edges. Runtime playback is separately reduced to 75 percent of the previous Renee gain. Character audio URLs are hash-versioned so browsers cannot continue replaying stale pre-hardening OGG files after a production re-render.\n';
if(!readme.includes('## Walkie hardening v29'))readme+=note;
await writeFile(readmePath,readme);
await rm(tempDir,{recursive:true,force:true});
console.log(`Applied extreme walkie v29 post-process to ${processed} Renee/overlap clips.`);
