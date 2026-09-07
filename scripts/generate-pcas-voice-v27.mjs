import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const specPath=path.join(root,'story','pa-lines-v27.json');
const outDir=path.join(root,'assets','audio','pa');
const tempDir=path.join(root,'.tmp-pcas-voice-v27');
const spec=JSON.parse(await readFile(specPath,'utf8'));
if(spec.version!==27||!Array.isArray(spec.lines)||!spec.lines.length)throw new Error('PCAS v27 voice spec is required.');
if(spec.voice?.engine!=='flite'||spec.voice?.voice!=='rms'||spec.voice?.profile!=='pcas-b-deep-mechanical')throw new Error('Approved PCAS B Flite RMS profile is required.');
for(const tool of ['ffmpeg','ffprobe'])if(spawnSync(tool,['-version'],{stdio:'ignore'}).status!==0)throw new Error(tool+' is required.');
const fliteCheck=spawnSync('ffmpeg',['-hide_banner','-h','filter=flite'],{encoding:'utf8'});
if(fliteCheck.status!==0||!String(fliteCheck.stdout||'').includes('Synthesize voice from text'))throw new Error('FFmpeg with the libflite filter is required.');
await rm(tempDir,{recursive:true,force:true});await mkdir(tempDir,{recursive:true});await mkdir(outDir,{recursive:true});
const voice=spec.voice||{};
const filter=[
  '[0:a]asetrate=32634,aresample=44100,atempo=1.24,highpass=f=58,lowpass=f=2700,acompressor=threshold=0.055:ratio=7.5:attack=4:release=100,asplit=3[dry][ghost][echo]',
  '[ghost]asetrate=41800,aresample=44100,adelay=31,volume=0.22[ghost2]',
  '[echo]aecho=0.72:0.26:92|205:0.18|0.075,volume=0.34[echo2]',
  '[dry][ghost2][echo2]amix=inputs=3:normalize=0,equalizer=f=95:t=q:w=1.0:g=7.0,equalizer=f=650:t=q:w=1.0:g=2.8,acrusher=bits=10:mode=lin:aa=1:mix=0.16,loudnorm=I=-18.5:LRA=3.5:TP=-1.8,apad=pad_dur=0.18[out]'
].join(';');
const sha256=data=>createHash('sha256').update(data).digest('hex');
const files={};
for(const line of spec.lines){
  if(!/^[a-z0-9_]+$/.test(line.id)||!line.text)throw new Error('Invalid line '+line.id);
  const textPath=path.join(tempDir,line.id+'.txt'),raw=path.join(tempDir,line.id+'.wav'),output=path.join(outDir,line.id+'.ogg');
  await writeFile(textPath,line.text);
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i',`flite=textfile=${textPath}:voice=${String(voice.voice||'rms')}`,'-ar','44100','-ac','1',raw],{stdio:'inherit'});
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-filter_complex',filter,'-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',output],{stdio:'inherit'});
  const bytes=await readFile(output);const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',output],{encoding:'utf8'}));
  files[line.id]={file:line.id+'.ogg',text:line.text,textSha256:sha256(Buffer.from(line.text)),sha256:sha256(bytes),duration:Number(Number(probe?.format?.duration||0).toFixed(3))};
}
const manifest={version:19,audioDirectionRevision:27,generatedAt:new Date().toISOString(),source:'story/pa-lines-v27.json',engine:{name:'Flite RMS (current; eSpeak NG retained as historical v19 provenance)',license:'BSD-style Flite/CMU build-time voice engine'},processing:{name:'FFmpeg',description:'ceiling-speaker processing chain, approved PCAS B deep-mechanical revision: RMS male source, aggressive pitch lowering, low-register reinforcement, subtle machine double, 10-bit degradation, PA band-limit and dual echo'},voice,files};
await writeFile(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(outDir,'README.md'),'# Pinewood PCAS Voice Assets\n\nPre-rendered repository-local PCAS lines. The approved v27 PCAS B direction uses the Flite RMS male source with aggressive pitch lowering, a subtle mechanical double, PA band-limiting, 10-bit degradation, low-register reinforcement, and dual echo. This is the exact production treatment approved from the PCAS B audition. No browser or cloud speech synthesis runs during gameplay.\n\nSource: `story/pa-lines-v27.json`  \nGenerator: `scripts/generate-pcas-voice-v27.mjs`  \nBuild-time tools: FFmpeg with libflite.\n');
await rm(tempDir,{recursive:true,force:true});console.log(`Generated ${spec.lines.length} approved PCAS B lines.`);
