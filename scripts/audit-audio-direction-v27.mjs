import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const root=process.cwd();
const game=await readFile(path.join(root,'game.js'),'utf8');
const patch=await readFile(path.join(root,'patches','audio-direction-v27.js.txt'),'utf8');
const pcasSpec=JSON.parse(await readFile(path.join(root,'story','pa-lines-v27.json'),'utf8'));
const pcasManifest=JSON.parse(await readFile(path.join(root,'assets','audio','pa','manifest.json'),'utf8'));
const charManifest=JSON.parse(await readFile(path.join(root,'assets','audio','characters','manifest.json'),'utf8'));
const fail=m=>{throw new Error('Audio Direction v27 audit failed: '+m);};

if(pcasSpec.version!==27)fail('PCAS v27 spec missing');
if(pcasManifest.version!==19||pcasManifest.audioDirectionRevision!==27)fail('deep PCAS manifest revision missing');
if(charManifest.version!==27)fail('character manifest v27 missing');
for(const id of ['ch1_start','ch2_start','ch3_start','ch4_start','ch5_start','ch4_fake_route','ch4_fake_auth','ch6_radio_overlap','recording_jo_ls06','recording_eli_ls08'])if(!charManifest.files[id])fail('character voice missing '+id);
for(const entry of Object.values({...pcasManifest.files,...charManifest.files}))if(!entry.file||!entry.duration||!entry.sha256)fail('invalid generated voice manifest entry');
for(const marker of [
  "const AUDIO_DIRECTION_V27_PATCH='./patches/audio-direction-v27.js.txt';",
  "const CHARACTER_VOICE_MANIFEST='./assets/audio/characters/manifest.json';",
  'applyAudioDirectionV27Runtime',
  'audioDirectionV27Source',
  "const source=audioDirectionV27Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
])if(!game.includes(marker))fail('loader marker missing '+marker);
for(const marker of ['rand(72,118)','this.time<45','voiceBusyV27()','loadCharacterV27(id)','this.reserveVoiceV27(Number(entry.duration||0),.42);','this.voiceBusyUntilV27=Math.max(this.voiceBusyUntilV27||0,this.ctx.currentTime+buffer.duration+.42);','recording_jo_ls06','recording_eli_ls08','serializedVoices:true','deepPcas:true'])if(!patch.includes(marker))fail('patch marker missing '+marker);
if(patch.includes('Object.keys(CHARACTER_VOICE_V27.files).map(id=>this.loadCharacterV27(id))'))fail('character voices must lazy-load on demand, not decode all 47 clips during boot');
const legacyCadenceMentions=(patch.match(/rand\(18,30\)/g)||[]).length;
if(legacyCadenceMentions!==1||!patch.includes("if(source.includes('this.nextAnnouncement=this.time+rand(18,30)'))fail('legacy rapid PCAS cadence survived v27');"))fail('legacy cadence may exist outside its explicit rejection guard');
const speechGuard="if(/speechSynthesis|SpeechSynthesisUtterance/.test(source))fail('runtime browser speech synthesis is forbidden');";
if(!patch.includes(speechGuard))fail('runtime speech-synthesis rejection guard missing');
if(/speechSynthesis|SpeechSynthesisUtterance/.test(patch.replace(speechGuard,'')))fail('runtime speech synthesis appears outside its explicit rejection guard');
if(!/"voice": "en-us\+m3"/.test(await readFile(path.join(root,'story','pa-lines-v27.json'),'utf8')))fail('PCAS is not using the deep male base voice');

for(const auditPath of ['scripts/audit-chapter3-security-readability-v22d.mjs','scripts/audit-chapter6-last-shift-v25.mjs']){
  const audit=await readFile(path.join(root,auditPath),'utf8');
  for(const marker of [
    "loader.includes(\"const AUDIO_DIRECTION_V27_PATCH='./patches/audio-direction-v27.js.txt';\")",
    'getText(AUDIO_DIRECTION_V27_PATCH)',
    'applyAudioDirectionV27Runtime',
    'audioDirectionV27Source',
    'while v27 is present'
  ])if(!audit.includes(marker))fail(`${auditPath} does not feed forward through v27: ${marker}`);
}

const temp='/tmp/pinewood-audio-direction-v27.mjs';await writeFile(temp,patch);execFileSync('node',['--check',temp],{stdio:'inherit'});
console.log(`Audio Direction v27 audit passed: ${Object.keys(charManifest.files).length} lazy-loaded character clips, ${Object.keys(pcasManifest.files).length} PCAS clips; character playback reserves its channel before first-load decode, rapid cadence and browser TTS tokens exist only inside explicit rejection guards, and historical loader audits feed forward through v27.`);
