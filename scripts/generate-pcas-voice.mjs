import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const specPath=path.join(root,'story','pa-lines.json');
const outDir=path.join(root,'assets','audio','pa');
const tempDir=path.join(root,'.tmp-pcas-voice');
const spec=JSON.parse(await readFile(specPath,'utf8'));
if(spec.version!==19||!Array.isArray(spec.lines)||!spec.lines.length)throw new Error('PCAS voice spec v19 with at least one line is required.');
const ids=new Set();
for(const line of spec.lines){
  if(!line?.id||!line?.text)throw new Error('Every PCAS line requires id and text.');
  if(ids.has(line.id))throw new Error('Duplicate PCAS line id: '+line.id);ids.add(line.id);
  if(!/^[a-z0-9_]+$/.test(line.id))throw new Error('Unsafe PCAS line id: '+line.id);
}

const probes={
  'espeak-ng':['--version'],
  ffmpeg:['-version'],
  ffprobe:['-version']
};
for(const [tool,args] of Object.entries(probes)){
  const check=spawnSync(tool,args,{stdio:'ignore'});
  if(check.status!==0)throw new Error(tool+' is required to generate PCAS voice assets.');
}

await rm(tempDir,{recursive:true,force:true});
await mkdir(tempDir,{recursive:true});
await mkdir(outDir,{recursive:true});

const voice=spec.voice||{};
const filter=[
  '[0:a]aresample=44100,highpass=f=220,lowpass=f=4550,acompressor=threshold=0.085:ratio=6.5:attack=5:release=75,asplit=3[dry][lower][upper]',
  '[lower]asetrate=43220,aresample=44100,adelay=26,volume=0.22[lowghost]',
  '[upper]asetrate=45120,aresample=44100,adelay=41,volume=0.14[highghost]',
  '[dry][lowghost][highghost]amix=inputs=3:normalize=0,acrusher=bits=11:mode=lin:aa=1:mix=0.19,tremolo=f=13.7:d=0.055,equalizer=f=1050:t=q:w=1.1:g=3.2,equalizer=f=2920:t=q:w=1.25:g=2.4,aecho=0.74:0.31:54|137:0.20|0.095,loudnorm=I=-20:LRA=5:TP=-2,apad=pad_dur=0.14[out]'
].join(';');

const sha256=data=>createHash('sha256').update(data).digest('hex');
const files={};
for(const line of spec.lines){
  const raw=path.join(tempDir,line.id+'.wav');
  const output=path.join(outDir,line.id+'.ogg');
  execFileSync('espeak-ng',[
    '-v',String(voice.voice||'en-us+f3'),
    '-s',String(voice.speed??138),
    '-p',String(voice.pitch??34),
    '-a',String(voice.amplitude??168),
    '-g',String(voice.wordGap??7),
    '-w',raw,
    line.text
  ],{stdio:'inherit'});
  execFileSync('ffmpeg',[
    '-hide_banner','-loglevel','error','-y','-i',raw,
    '-filter_complex',filter,'-map','[out]','-ac','1','-ar','44100','-c:a','libvorbis','-q:a','5',output
  ],{stdio:'inherit'});
  const bytes=await readFile(output);
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',output],{encoding:'utf8'}));
  files[line.id]={
    file:line.id+'.ogg',
    text:line.text,
    textSha256:sha256(Buffer.from(line.text,'utf8')),
    sha256:sha256(bytes),
    duration:Number(Number(probe?.format?.duration||0).toFixed(3))
  };
}

const toolVersion=execFileSync('espeak-ng',['--version'],{encoding:'utf8'}).trim().split('\n')[0];
const ffmpegVersion=execFileSync('ffmpeg',['-version'],{encoding:'utf8'}).trim().split('\n')[0];
const manifest={
  version:19,
  generatedAt:new Date().toISOString(),
  source:'story/pa-lines.json',
  engine:{name:'eSpeak NG',version:toolVersion,license:'GPL-3.0-or-later build-time tool'},
  processing:{name:'FFmpeg',version:ffmpegVersion,description:'mono ceiling-speaker bandpass, compression, detuned doubles, 11-bit degradation, electrical flutter, dual slapback echo, EQ, -20 LUFS normalization'},
  voice,
  files
};
await writeFile(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
await writeFile(path.join(outDir,'README.md'),`# Pinewood PCAS Voice Assets\n\nThese are pre-rendered, repository-local voice lines for the Pinewood Closing and Accountability System (PCAS). Runtime playback never calls a cloud TTS service or the browser speech-synthesis API.\n\nSource text: \`story/pa-lines.json\`  \nGenerator: \`scripts/generate-pcas-voice.mjs\`  \nTTS: eSpeak NG, used only at build time  \nProcessing: FFmpeg band-limited ceiling-speaker chain with compression, detuned doubles, light bit reduction, electrical flutter, slapback echo, EQ and loudness normalization.\n\nThe authored spoken text and resulting Pinewood-specific processed voice assets are part of the game content. eSpeak NG and FFmpeg are not shipped as runtime dependencies.\n`,'utf8');
await rm(tempDir,{recursive:true,force:true});
console.log(`Generated ${spec.lines.length} PCAS voice lines in ${path.relative(root,outDir)}.`);
