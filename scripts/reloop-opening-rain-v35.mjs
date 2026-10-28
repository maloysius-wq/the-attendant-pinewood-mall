/**
 * Deterministic v35 rain mastering using LOCAL user-owned v34b OGG clips.
 *
 * 1. Decode mono float PCM for adaptive edge-silence detection.
 * 2. Trim genuinely quiet beginnings/endings only (never delete quiet interior).
 * 3. Overlap and crossfade the former tail into the head so the NEW buffer
 *    ends on the very waveform that begins it.
 * 4. Store complete local OGG, decoded by AudioContext for sample-accurate looping.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=process.cwd();
const folder=path.join(root,'opening/audio');
for(const name of ['ffmpeg','ffprobe'])if(spawnSync(name,['-version'],{stdio:'ignore'}).status!==0)throw Error(name+' missing');

const describe=file=>JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',file],{encoding:'utf8'})).format;
function decode(file){
 const binary=execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',file,'-vn','-ac','1','-ar','22050','-f','f32le','pipe:1'],{maxBuffer:20_000_000});
 return new Float32Array(binary.buffer.slice(binary.byteOffset,binary.byteOffset+binary.byteLength));
}
function boundaries(pcm,rate=22050){
 const hop=Math.round(rate*.04),rms=[];
 for(let i=0;i<pcm.length;i+=hop){
  let energy=0,n=Math.min(hop,pcm.length-i);
  for(let k=0;k<n;k++){const a=pcm[i+k];energy+=a*a;}
  rms.push(Math.sqrt(energy/n));
 }
 const nonzero=rms.slice().sort((a,b)=>a-b),median=nonzero[Math.floor(nonzero.length/2)];
 const quiet=Math.max(.00004,median*.14);
 const minimum=3; // at least 120 ms of true quiet before trimming
 let start=0,end=rms.length;
 while(start<rms.length-minimum&&rms[start]<quiet)start++;
 while(end>start+minimum&&rms[end-1]<quiet)end--;
 // Preserve one 40-ms boundary sample on either side as a natural lead.
 start=Math.max(0,start-1);end=Math.min(rms.length,end+1);
 return {start:Number((start*hop/rate).toFixed(4)),end:Number(Math.min(pcm.length/rate,end*hop/rate).toFixed(4)),median,quiet,headRMS:rms[0],tailRMS:rms.at(-1)};
}
function rmsAt(pcm,from,length){let sum=0;const end=Math.min(pcm.length,from+length);for(let i=from;i<end;i++)sum+=pcm[i]*pcm[i];return Math.sqrt(sum/Math.max(1,end-from));}
const completed={version:35,source:'User supplied car-rain and outside-rain, previously normalized as local v34b OGG',method:'adaptive only-edge trim + periodic overlap crossfade + uncompressed browser PCM buffer loop',files:{}};
for(const name of ['car','outside']){
 const input=path.join(folder,name+'-rain.ogg');
 const output=path.join(folder,name+'-rain-v35.ogg');
 const samples=decode(input),b=boundaries(samples);
 const full=Number(describe(input).duration),trimmed=b.end-b.start;
 if(trimmed<2.0)throw Error(name+' trimmed clip too short');
 const overlap=Math.min(.68,Math.max(.30,trimmed*.045));
 const tailBegin=b.end-overlap,headEnd=b.start+overlap;
 const coreBegin=headEnd,coreEnd=tailBegin;
 if(coreEnd<=coreBegin)throw Error(name+' overlap eats main clip');
 // Construct the periodic overlap in actual PCM. FFmpeg's acrossfade can silently
 // drop one branch when both excerpts come from the same source graph.
 // Here the last output sample is the input sample just BEFORE the first output
 // sample, with a constant-power blend over the original recording's seam.
 const stereoBuffer=execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',input,'-vn','-ac','2','-ar','44100','-f','f32le','pipe:1'],{maxBuffer:30_000_000});
 const stereo=new Float32Array(stereoBuffer.buffer.slice(stereoBuffer.byteOffset,stereoBuffer.byteOffset+stereoBuffer.byteLength));
 const sampleRate=44100,totalFrames=Math.floor(stereo.length/2);
 const sFrame=Math.max(0,Math.round(b.start*sampleRate));
 const eFrame=Math.min(totalFrames,Math.round(b.end*sampleRate));
 const overlapFrames=Math.round(overlap*sampleRate);
 const coreFrames=eFrame-sFrame-2*overlapFrames;
 if(coreFrames<sampleRate*1.5)throw Error(name+' no room for a natural loop');
 const raw=new Float32Array((coreFrames+overlapFrames)*2);
 raw.set(stereo.subarray((sFrame+overlapFrames)*2,(eFrame-overlapFrames)*2),0);
 for(let i=0;i<overlapFrames;i++){
  const angle=((i+1)/(overlapFrames+1))*Math.PI*.5;
  const tail=Math.cos(angle)**2,head=Math.sin(angle)**2;
  for(let ch=0;ch<2;ch++){
   raw[(coreFrames+i)*2+ch]=stereo[(eFrame-overlapFrames+i)*2+ch]*tail+
     stereo[(sFrame+i)*2+ch]*head;
  }
 }
 const proc=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',
  '-f','f32le','-ar','44100','-ac','2','-i','pipe:0',
  '-af','loudnorm=I=-26:LRA=8:TP=-2.5,alimiter=limit=.90',
  '-c:a','libvorbis','-q:a','5','-ar','44100',output],
 {input:Buffer.from(raw.buffer),maxBuffer:5_000_000});
 if(proc.status!==0)throw Error(name+' audio encode failed: '+String(proc.stderr));
 const finalSamples=decode(output);const duration=Number(describe(output).duration);
 const expectedSeconds=raw.length/2/44100;
 if(duration<2||Math.abs(duration-expectedSeconds)>.11)throw Error(name+' seam render not included: '+duration+' expected '+expectedSeconds);
 const window=Math.floor(22050*.12);
 const first=rmsAt(finalSamples,0,window),last=rmsAt(finalSamples,finalSamples.length-window,window);
 if(!first||!last||first<b.median*.06||last<b.median*.06)throw Error(name+' still has dead air near seam: '+first+', '+last);
 const boundaryClick=Math.abs(finalSamples[0]-finalSamples.at(-1));
 const peak=Math.max(...finalSamples.subarray(0,Math.min(1000,finalSamples.length)).map(Math.abs)); // safeguard first sample region
 const bytes=fs.readFileSync(output);
 completed.files[name]={file:path.basename(output),input:path.basename(input),sourceDuration:full,duration,originalEdgeTrim:{start:b.start,end:Math.max(0,full-b.end)},overlapSeconds:overlap,boundarySampleDelta:Number(boundaryClick.toFixed(6)),edgeRMS:{first:Number(first.toFixed(6)),last:Number(last.toFixed(6))},sha256:createHash('sha256').update(bytes).digest('hex'),size:bytes.length};
 console.log('[LOOP] '+name+' '+JSON.stringify(completed.files[name]));
}
fs.writeFileSync(path.join(folder,'rain-v35-manifest.json'),JSON.stringify(completed,null,2)+'\n');
console.log('[LOOP] READY: two locally mastered rain beds with no silent boundaries and stitched repeat points.');
