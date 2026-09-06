import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const root=process.cwd();
for(const tool of ['espeak-ng','ffmpeg','ffprobe'])if(spawnSync(tool,[tool==='espeak-ng'?'--version':'-version'],{stdio:'ignore'}).status!==0)throw new Error(tool+' is required.');
const dialogueText=await readFile(path.join(root,'story','dialogue.js'),'utf8');
const sandbox={};vm.createContext(sandbox);vm.runInContext(dialogueText.replace('export const DIALOGUE_V17=','globalThis.DIALOGUE_V17='),sandbox);
const dialogue=sandbox.DIALOGUE_V17;
if(!dialogue)throw new Error('Could not load DIALOGUE_V17');
const lines=[];
for(const line of Object.values(dialogue)){
  if(line.medium!=='radio')continue;
  if(line.speaker==='RENEE')lines.push({id:line.id,text:line.text,speaker:'RENEE WARD',profile:'renee'});
  else if(line.speaker==='RENEE?')lines.push({id:line.id,text:line.text,speaker:'RENEE?',profile:'fake-renee'});
  else if(line.speaker==='RENEE / UNKNOWN')lines.push({id:line.id,text:line.text,speaker:'RENEE / UNKNOWN',profile:'overlap'});
}
lines.push(
  {id:'recording_jo_ls06',text:'You are outside when I say you are outside, not when that machine says it.',speaker:'JO ALVAREZ',profile:'cassette'},
  {id:'recording_eli_ls08',text:'Power-off is not clearing the closing hold. It resumes the checklist when emergency circuits return. The count is the problem. I am going for PA records control. If I can finish the shift in order, maybe it lets go.',speaker:'ELI MERCER',profile:'recorder'}
);
const profiles={
  renee:{voice:'en-us+f4',speed:158,pitch:48,amp:178,filter:'aresample=44100,highpass=f=260,lowpass=f=3600,acompressor=threshold=0.07:ratio=5.2:attack=5:release=70,acrusher=bits=14:mode=lin:aa=1:mix=0.05,tremolo=f=18:d=0.018,equalizer=f=1800:t=q:w=1.2:g=2.4,aecho=0.68:0.18:38:0.08,loudnorm=I=-19:LRA=5:TP=-2,apad=pad_dur=0.12'},
  'fake-renee':{voice:'en-us+f4',speed:155,pitch:45,amp:180,filter:'aresample=44100,asetrate=42300,aresample=44100,highpass=f=240,lowpass=f=3300,acompressor=threshold=0.06:ratio=6.5:attack=4:release=80,acrusher=bits=10:mode=lin:aa=1:mix=0.22,tremolo=f=13:d=0.11,aecho=0.72:0.30:47|113:0.18|0.08,loudnorm=I=-19:LRA=4:TP=-2,apad=pad_dur=0.15'},
  cassette:{voice:'en-us+f2',speed:146,pitch:42,amp:174,filter:'aresample=44100,highpass=f=150,lowpass=f=4300,acompressor=threshold=0.08:ratio=4:attack=8:release=90,tremolo=f=.72:d=.025,acrusher=bits=13:mode=lin:aa=1:mix=0.08,aecho=0.64:0.12:71:0.07,loudnorm=I=-20:LRA=6:TP=-2,apad=pad_dur=0.16'},
  recorder:{voice:'en-us+m2',speed:149,pitch:34,amp:178,filter:'aresample=44100,highpass=f=210,lowpass=f=3400,acompressor=threshold=0.075:ratio=5:attack=6:release=80,acrusher=bits=12:mode=lin:aa=1:mix=0.10,aecho=0.66:0.14:52:0.06,loudnorm=I=-20:LRA=5:TP=-2,apad=pad_dur=0.15'}
};
const outDir=path.join(root,'assets','audio','characters'),tempDir=path.join(root,'.tmp-character-voices-v27');await rm(tempDir,{recursive:true,force:true});await mkdir(tempDir,{recursive:true});await mkdir(outDir,{recursive:true});
const sha256=data=>createHash('sha256').update(data).digest('hex');const files={};
for(const line of lines){
  const output=path.join(outDir,line.id+'.ogg');
  if(line.profile==='overlap'){
    const a=path.join(tempDir,line.id+'-a.wav'),b=path.join(tempDir,line.id+'-b.wav');
    execFileSync('espeak-ng',['-v','en-us+f4','-s','158','-p','48','-a','178','-w',a,line.text]);
    execFileSync('espeak-ng',['-v','en-us+m3','-s','132','-p','16','-a','170','-w',b,line.text]);
    const fx='[0:a]highpass=f=260,lowpass=f=3600,acompressor=threshold=.07:ratio=5[a];[1:a]adelay=150,asetrate=40000,aresample=44100,highpass=f=130,lowpass=f=2800,acrusher=bits=9:mix=.2,volume=.52[b];[a][b]amix=inputs=2:normalize=0,aecho=.7:.2:51:.09,loudnorm=I=-19:LRA=4:TP=-2,apad=pad_dur=.15[out]';
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',a,'-i',b,'-filter_complex',fx,'-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',output]);
  }else{
    const p=profiles[line.profile],raw=path.join(tempDir,line.id+'.wav');execFileSync('espeak-ng',['-v',p.voice,'-s',String(p.speed),'-p',String(p.pitch),'-a',String(p.amp),'-g','3','-w',raw,line.text]);
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-af',p.filter,'-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',output]);
  }
  const bytes=await readFile(output);const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',output],{encoding:'utf8'}));files[line.id]={file:line.id+'.ogg',text:line.text,speaker:line.speaker,profile:line.profile,sha256:sha256(bytes),duration:Number(Number(probe?.format?.duration||0).toFixed(3))};
}
const manifest={version:27,generatedAt:new Date().toISOString(),source:'story/dialogue.js + authored recorded evidence',engine:{name:'eSpeak NG',license:'GPL-3.0-or-later build-time tool'},processing:{name:'FFmpeg',description:'distinct radio, corrupted-radio, cassette and work-recorder voice chains'},files};
await writeFile(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(outDir,'README.md'),'# Pinewood Character Voice Assets\n\nPre-rendered, repository-local human dialogue for Audio Direction v27. Renee uses a narrow-band dispatch-radio treatment; fake Renee uses the same recognizable base voice with degraded timing/pitch artifacts; Jo and Eli use distinct archival-recording treatments. No runtime cloud or browser speech synthesis is used.\n\nGenerator: `scripts/generate-character-voices-v27.mjs`\n');
await rm(tempDir,{recursive:true,force:true});console.log(`Generated ${lines.length} character voice clips.`);
