import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,rm,rename,writeFile} from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
for(const tool of ['ffmpeg','ffprobe'])if(spawnSync(tool,['-version'],{stdio:'ignore'}).status!==0)throw new Error(`${tool} is required.`);
const outDir=path.join(root,'assets','audio','characters');
const tempDir=path.join(root,'.tmp-renee-walkie-v28');
await rm(tempDir,{recursive:true,force:true});
await mkdir(tempDir,{recursive:true});
const manifestPath=path.join(outDir,'manifest.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
if(manifest.version!==27)throw new Error('Character voice manifest v27 is required.');
const sha256=data=>createHash('sha256').update(data).digest('hex');
const seed=id=>Math.max(1,Number.parseInt(createHash('sha256').update('walkie-v28:'+id).digest('hex').slice(0,7),16));
const duration=file=>{
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',file],{encoding:'utf8'}));
  const d=Number(probe?.format?.duration||0);if(!Number.isFinite(d)||d<=0)throw new Error(`Invalid duration for ${file}`);return d;
};

// Deliberately aggressive handheld-radio signature. This is meant to read as a small,
// overdriven communications speaker immediately, not as a clean voice with subtle EQ.
function genuineFx(d){
  const endDelay=Math.max(0,Math.round((d-.12)*1000));
  return `[0:a]aresample=44100,highpass=f=480,lowpass=f=2450,acompressor=threshold=0.055:ratio=8.2:attack=2:release=58,equalizer=f=1180:t=q:w=1.0:g=2.6,equalizer=f=1980:t=q:w=.82:g=5.8,acrusher=bits=11:mode=lin:aa=1:mix=.105,aecho=.46:.10:27:.055,loudnorm=I=-22.5:LRA=3.2:TP=-2.5,aresample=44100[voice];[1:a]aresample=44100,highpass=f=680,lowpass=f=3100,volume=.26[bed];[2:a]aresample=44100,highpass=f=900,lowpass=f=3600,atrim=duration=.105,afade=t=out:st=.040:d=.065,volume=.54[s0];[3:a]aresample=44100,highpass=f=900,lowpass=f=3600,atrim=duration=.115,afade=t=in:st=0:d=.025,afade=t=out:st=.055:d=.060,adelay=${endDelay},volume=.46[s1];[voice][bed][s0][s1]amix=inputs=4:duration=first:dropout_transition=0:normalize=0,alimiter=limit=.89,apad=pad_dur=.16[out]`;
}
function overlapFx(d){
  const endDelay=Math.max(0,Math.round((d-.12)*1000));
  return `[0:a]aresample=44100,highpass=f=430,lowpass=f=2600,acompressor=threshold=0.052:ratio=7.4:attack=2:release=62,equalizer=f=1900:t=q:w=.9:g=4.6,acrusher=bits=11:mode=lin:aa=1:mix=.075,loudnorm=I=-21.8:LRA=3.3:TP=-2.4,aresample=44100[voice];[1:a]aresample=44100,highpass=f=650,lowpass=f=3200,volume=.22[bed];[2:a]aresample=44100,highpass=f=900,lowpass=f=3600,atrim=duration=.10,afade=t=out:st=.04:d=.06,volume=.45[s0];[3:a]aresample=44100,highpass=f=900,lowpass=f=3600,atrim=duration=.11,adelay=${endDelay},afade=t=out:st=.05:d=.06,volume=.40[s1];[voice][bed][s0][s1]amix=inputs=4:duration=first:dropout_transition=0:normalize=0,alimiter=limit=.90,apad=pad_dur=.16[out]`;
}

let processed=0;
for(const [id,entry] of Object.entries(manifest.files||{})){
  if(!['renee','overlap'].includes(entry.profile))continue;
  const input=path.join(outDir,entry.file),output=path.join(tempDir,entry.file);
  const inputDuration=duration(input),fx=entry.profile==='renee'?genuineFx(inputDuration):overlapFx(inputDuration);
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,
    '-f','lavfi','-i',`anoisesrc=color=pink:amplitude=${entry.profile==='renee'?0.016:0.013}:r=44100:seed=${seed(id)}`,
    '-f','lavfi','-i',`anoisesrc=color=white:amplitude=.035:r=44100:seed=${seed(id+'-start')}`,
    '-f','lavfi','-i',`anoisesrc=color=white:amplitude=.032:r=44100:seed=${seed(id+'-end')}`,
    '-filter_complex',fx,'-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',output]);
  const outDuration=duration(output);
  if(outDuration+.05<inputDuration)throw new Error(`${id} hard-radio render truncated: ${outDuration}s < ${inputDuration}s`);
  await rename(output,input);
  const bytes=await readFile(input);
  entry.sha256=sha256(bytes);entry.duration=Number(outDuration.toFixed(3));entry.walkiePostProcess='v28-hard-handheld';
  processed++;
}
if(processed!==43)throw new Error(`Expected 43 genuine/overlap Renee files, processed ${processed}.`);
manifest.generatedAt=new Date().toISOString();
manifest.processing={
  name:'FFmpeg',
  description:'approved Renee Take 1 hard handheld walkie-talkie post-pass at substantially reduced level; 480-2450 Hz communications band, hard compression, transmission grit, deterministic filtered noise bed and edge squelch; duration-safe neural source pipeline retained; fake-Renee corruption and archival recording chains retained'
};
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
const readmePath=path.join(outDir,'README.md');
let readme=await readFile(readmePath,'utf8');
const note='\n## Walkie hardening v28\n\nRenee now receives an intentionally aggressive handheld-radio post-pass after the approved neural render: a 480–2450 Hz communications band, hard compression, stronger speaker grit, a persistent filtered transmission-noise bed, short squelch bursts at the transmission edges, and a lower final loudness target. This pass exists because the subtler radio treatment did not read convincingly enough as a physical walkie-talkie in play.\n';
if(!readme.includes('## Walkie hardening v28'))readme+=note;
await writeFile(readmePath,readme);
await rm(tempDir,{recursive:true,force:true});
console.log(`Applied hard walkie v28 post-process to ${processed} Renee/overlap clips.`);
