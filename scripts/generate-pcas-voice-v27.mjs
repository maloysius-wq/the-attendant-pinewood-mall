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
for(const tool of ['espeak-ng','ffmpeg','ffprobe'])if(spawnSync(tool,[tool==='espeak-ng'?'--version':'-version'],{stdio:'ignore'}).status!==0)throw new Error(tool+' is required.');
await rm(tempDir,{recursive:true,force:true});await mkdir(tempDir,{recursive:true});await mkdir(outDir,{recursive:true});
const voice=spec.voice||{};
const filter=[
  '[0:a]aresample=44100,asetrate=38200,aresample=44100,highpass=f=72,lowpass=f=3150,acompressor=threshold=0.055:ratio=8:attack=4:release=95,asplit=4[dry][low][metal][echo]',
  '[low]asetrate=41600,aresample=44100,adelay=24,volume=0.28[lowghost]',
  '[metal]asetrate=46800,aresample=44100,adelay=39,volume=0.10[metalghost]',
  '[echo]aecho=0.72:0.28:71|156:0.22|0.10,volume=0.32[echowet]',
  '[dry][lowghost][metalghost][echowet]amix=inputs=4:normalize=0,acrusher=bits=9:mode=lin:aa=1:mix=0.25,tremolo=f=11.8:d=0.085,equalizer=f=118:t=q:w=1.2:g=5.5,equalizer=f=690:t=q:w=1.0:g=3.0,equalizer=f=2150:t=q:w=1.15:g=2.2,loudnorm=I=-19:LRA=4:TP=-2,apad=pad_dur=0.18[out]'
].join(';');
const sha256=data=>createHash('sha256').update(data).digest('hex');
const files={};
for(const line of spec.lines){
  if(!/^[a-z0-9_]+$/.test(line.id)||!line.text)throw new Error('Invalid line '+line.id);
  const raw=path.join(tempDir,line.id+'.wav'),output=path.join(outDir,line.id+'.ogg');
  execFileSync('espeak-ng',['-v',String(voice.voice||'en-us+m3'),'-s',String(voice.speed??122),'-p',String(voice.pitch??10),'-a',String(voice.amplitude??186),'-g',String(voice.wordGap??9),'-w',raw,line.text],{stdio:'inherit'});
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-filter_complex',filter,'-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',output],{stdio:'inherit'});
  const bytes=await readFile(output);const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',output],{encoding:'utf8'}));
  files[line.id]={file:line.id+'.ogg',text:line.text,textSha256:sha256(Buffer.from(line.text)),sha256:sha256(bytes),duration:Number(Number(probe?.format?.duration||0).toFixed(3))};
}
const manifest={version:19,audioDirectionRevision:27,generatedAt:new Date().toISOString(),source:'story/pa-lines-v27.json',engine:{name:'eSpeak NG',license:'GPL-3.0-or-later build-time tool'},processing:{name:'FFmpeg',description:'ceiling-speaker processing chain, v27 deep robotic revision: pitch-lowered male source, low-register reinforcement, mechanical double, 9-bit degradation, flutter, PA band-limit and dual echo'},voice,files};
await writeFile(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(outDir,'README.md'),'# Pinewood PCAS Voice Assets\n\nPre-rendered repository-local PCAS lines. The v27 audio-direction pass preserves the established ceiling-speaker presentation while using a much deeper male eSpeak NG source and a heavier robotic PA treatment. No browser or cloud speech synthesis runs during gameplay.\n\nSource: `story/pa-lines-v27.json`  \nGenerator: `scripts/generate-pcas-voice-v27.mjs`  \nBuild-time tools: eSpeak NG + FFmpeg.\n');
await rm(tempDir,{recursive:true,force:true});console.log(`Generated ${spec.lines.length} deep PCAS lines.`);
