import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),audioDir=path.join(root,'opening','audio');
const manifestPath=path.join(audioDir,'manifest.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
const script=JSON.parse(await readFile(path.join(root,'opening','script.json'),'utf8'));
if(manifest.version!==34||script.lines.length!==11)throw Error('Only the approved eleven Renee opening lines may be radio-mastered');
for(const binary of ['ffmpeg','ffprobe'])if(spawnSync(binary,['-version'],{stdio:'ignore'}).status!==0)throw Error('Missing '+binary);
const temp=path.join(root,'.tmp-opening-walkie-v34b');await rm(temp,{recursive:true,force:true});await mkdir(temp,{recursive:true});
const hash=buf=>createHash('sha256').update(buf).digest('hex');
const duration=file=>{
 const p=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',file],{encoding:'utf8'}));
 const d=Number(p.format?.duration||0);if(!(d>0))throw Error('No valid duration for '+file);return d;
};
const seed=id=>Math.max(1,Number.parseInt(createHash('sha256').update('walkie-v29:'+id).digest('hex').slice(0,7),16));
// Identical to the production game's genuine Renee walkie chain (scripts/reprocess-renee-walkie-v28.mjs):
// 650–2150 Hz, 12:1 compression, harsh mid boosts, 9-bit grit, echo, pink hiss, edge squelch.
function genuineFx(d){
 const endDelay=Math.max(0,Math.round((d-0.14)*1000));
 return `[0:a]aresample=44100,highpass=f=650,lowpass=f=2150,acompressor=threshold=0.040:ratio=12:attack=1:release=48,equalizer=f=900:t=q:w=1.0:g=4.0,equalizer=f=1550:t=q:w=.82:g=8.0,equalizer=f=2050:t=q:w=.72:g=5.0,acrusher=bits=9:mode=lin:aa=1:mix=.28,aecho=.34:.08:18:.045,loudnorm=I=-22.5:LRA=2.6:TP=-3.0,aresample=44100[voice];[1:a]aresample=44100,highpass=f=760,lowpass=f=3000,volume=.42[bed];[2:a]aresample=44100,highpass=f=820,lowpass=f=3700,atrim=duration=0.135,afade=t=out:st=0.050:d=0.085,volume=.72[s0];[3:a]aresample=44100,highpass=f=820,lowpass=f=3700,atrim=duration=0.145,afade=t=in:st=0:d=0.020,afade=t=out:st=0.065:d=0.080,adelay=${endDelay},volume=.64[s1];[voice][bed][s0][s1]amix=inputs=4:duration=first:dropout_transition=0:normalize=0,alimiter=limit=.86,apad=pad_dur=0.18[out]`;
}
let processed=0;
for(const line of script.lines){
 const entry=manifest.files[line.id];
 if(!entry||entry.text!==line.text||entry.file!==line.id+'.ogg')throw Error('Voice/source mismatch '+line.id);
 if(entry.walkiePostProcess==='v29-extreme-handheld')continue;
 const input=path.join(audioDir,entry.file),output=path.join(temp,entry.file);
 const before=duration(input);
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,
 '-f','lavfi','-i',`anoisesrc=color=pink:amplitude=0.035:r=44100:seed=${seed(line.id)}`,
 '-f','lavfi','-i',`anoisesrc=color=white:amplitude=.080:r=44100:seed=${seed(line.id+'-start')}`,
 '-f','lavfi','-i',`anoisesrc=color=white:amplitude=.070:r=44100:seed=${seed(line.id+'-end')}`,
 '-filter_complex',genuineFx(before),'-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',output]);
 const after=duration(output);if(after+0.05<before)throw Error('Voice clipped '+line.id);
 const data=await readFile(output);await writeFile(input,data);
 entry.sha256=hash(data);entry.duration=Number(after.toFixed(3));
 entry.walkiePostProcess='v29-extreme-handheld';entry.estimatedIntegratedLUFS=-22.5;
 console.log('Radio master:',line.id,entry.duration,'s',data.length,'bytes');
 processed++;
}
await rm(temp,{recursive:true,force:true});
manifest.processing={version:'v34b',name:'Genuine Renee Walkie v29',voiceMixGain:0.75,details:'Exact existing production 650-2150 Hz / 12:1 / 9-bit / filtered pink noise / two squelches / -22.5 LUFS post-pass'};
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('COMPLETE',processed,'opening Renee cues reprocessed; total',script.lines.length);
