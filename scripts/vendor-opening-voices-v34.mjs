// DEVELOPMENT-TIME ONLY: retrieve eleven user-generated Renee Crisp takes,
// radio-master them and vendor local OGG assets to the feature branch.
// The production browser never fetches external voices or uses text-to-speech.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync,execFileSync} from 'node:child_process';
import path from 'node:path';

const root=process.cwd();
const sources=JSON.parse(await readFile(path.join(root,'opening/voice-sources-v34.json'),'utf8'));
const script=JSON.parse(await readFile(path.join(root,'opening/script.json'),'utf8'));
if(sources.version!==34||script.version!==34)throw Error('Unexpected script version');
for(const binary of ['ffmpeg','ffprobe'])if(spawnSync(binary,['-version'],{stdio:'ignore'}).status!==0)throw Error(binary+' not installed');
const out=path.join(root,'opening/audio');await mkdir(out,{recursive:true});
const manifest={version:34,source:'Pre-rendered Renee Crisp user-requested cinematic voice clips, mastered into local radio transmission OGG.',files:{}};
function probe(file){
 const p=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',file],{encoding:'utf8'}));
 const duration=Number(p.format?.duration||0);if(!(duration>0))throw Error('Invalid voice duration '+file);return duration;
}
const voiceChain='aresample=44100,highpass=f=310,lowpass=f=3100,acompressor=threshold=0.075:ratio=3.7:attack=7:release=85,equalizer=f=1650:t=q:w=1.0:g=2.1,loudnorm=I=-21:LRA=5:TP=-2,aresample=44100,alimiter=limit=.91';
for(const line of script.lines){
 const entry=sources.lines[line.id];if(!entry||entry.transcript!==line.text)throw Error('Missing or mismatched generated source: '+line.id);
 const raw=path.join(out,line.id+'-source.mp3'),final=path.join(out,line.id+'.ogg');
 let successful=false,reason='';
 for(let attempt=0;attempt<9;attempt++){
  try{
   const response=await fetch(entry.source,{redirect:'follow',signal:AbortSignal.timeout(40000),headers:{Accept:'audio/mpeg,audio/*;q=0.9,*/*;q=0.1'}});
   if(!response.ok)throw Error('Source HTTP '+response.status);
   const typ=response.headers.get('content-type')||'';
   const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<2000)throw Error('Source audio too short '+bytes.length+' bytes');
   if(typ.includes('text/html')||bytes.subarray(0,20).toString('utf8').toLowerCase().includes('<!doctype'))throw Error('Source returned HTML instead of voice');
   await writeFile(raw,bytes);
   const sourceDuration=probe(raw);
   execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-af',voiceChain,'-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',final]);
   const duration=probe(final);if(duration+.12<sourceDuration)throw Error('Source got clipped');
   const output=await readFile(final);manifest.files[line.id]={file:line.id+'.ogg',text:line.text,speaker:'RENEE WARD',duration:Number(duration.toFixed(2)),sha256:createHash('sha256').update(output).digest('hex')};
   successful=true;break;
  }catch(e){reason=String(e.message||e);console.warn('[VOICE] '+line.id+' attempt '+(attempt+1)+' unavailable: '+reason);await new Promise(r=>setTimeout(r,10000));}
 }
 if(!successful)throw Error('Could not vendor voice '+line.id+': '+reason);
 console.log('[VOICE] '+line.id+' '+manifest.files[line.id].duration+' seconds mastered');
}
const {rm}=await import('node:fs/promises');
for(const line of script.lines)await rm(path.join(out,line.id+'-source.mp3'),{force:true});
await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('READY '+script.lines.length+' locally vendored Renee voice clips; no browser cloud dependencies.');
