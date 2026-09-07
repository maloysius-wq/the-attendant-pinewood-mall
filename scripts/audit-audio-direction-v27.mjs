import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const root=process.cwd();
const game=await readFile(path.join(root,'game.js'),'utf8');
const patch=await readFile(path.join(root,'patches','audio-direction-v27.js.txt'),'utf8');
const reneeRenderer=await readFile(path.join(root,'scripts','render-renee-neural-v27.mjs'),'utf8');
const pcasSpec=JSON.parse(await readFile(path.join(root,'story','pa-lines-v27.json'),'utf8'));
const pcasManifest=JSON.parse(await readFile(path.join(root,'assets','audio','pa','manifest.json'),'utf8'));
const charManifest=JSON.parse(await readFile(path.join(root,'assets','audio','characters','manifest.json'),'utf8'));
const fail=m=>{throw new Error('Audio Direction v27 audit failed: '+m);};

if(pcasSpec.version!==27)fail('PCAS v27 spec missing');
if(pcasSpec.voice?.engine!=='flite'||pcasSpec.voice?.voice!=='rms'||pcasSpec.voice?.profile!=='pcas-b-deep-mechanical')fail('approved PCAS B source profile missing');
if(pcasManifest.version!==19||pcasManifest.audioDirectionRevision!==27)fail('deep PCAS manifest revision missing');
if(pcasManifest.voice?.engine!=='flite'||pcasManifest.voice?.voice!=='rms'||pcasManifest.voice?.profile!=='pcas-b-deep-mechanical')fail('approved PCAS B manifest profile missing');
if(!String(pcasManifest.engine?.name||'').includes('Flite RMS'))fail('approved PCAS B Flite RMS engine provenance missing');
if(!String(pcasManifest.processing?.description||'').includes('approved PCAS B deep-mechanical revision'))fail('approved PCAS B processing provenance missing');
if(charManifest.version!==27)fail('character manifest v27 missing');
if(!String(charManifest.engine?.renee||'').includes('Crisp / approved Take 1'))fail('approved Renee Crisp Take 1 provenance missing');
if(!String(charManifest.processing?.description||'').includes('pronounced dispatch-radio chain at reduced level'))fail('strengthened Renee radio processing provenance missing');
if(!String(charManifest.processing?.description||'').includes('duration-safe 44.1 kHz normalization/mix boundary with source/output duration guard'))fail('duration-safe Renee render provenance missing');
for(const id of ['ch1_start','ch2_start','ch3_start','ch4_start','ch5_start','ch4_fake_route','ch4_fake_auth','ch6_radio_overlap','recording_jo_ls06','recording_eli_ls08'])if(!charManifest.files[id])fail('character voice missing '+id);
for(const entry of Object.values({...pcasManifest.files,...charManifest.files}))if(!entry.file||!entry.duration||!entry.sha256)fail('invalid generated voice manifest entry');

const neuralEntries=Object.entries(charManifest.files).filter(([,entry])=>['renee','fake-renee','overlap'].includes(entry.profile));
if(neuralEntries.length!==45)fail(`expected 45 neural Renee-derived entries, found ${neuralEntries.length}`);
for(const [id,entry] of neuralEntries){
  if(!(Number(entry.sourceDuration)>0))fail(`neural source duration missing for ${id}`);
  if(Number(entry.duration)+.05<Number(entry.sourceDuration))fail(`neural production render is truncated for ${id}: ${entry.duration}s < ${entry.sourceDuration}s source`);
}
if(Number(charManifest.files.ch1_start?.sourceDuration)<10||Number(charManifest.files.ch1_start?.duration)<10)fail('opening Renee line regressed to the historical truncated render');
if(Number(charManifest.files.ch1_first_power?.sourceDuration)<7||Number(charManifest.files.ch1_first_power?.duration)<7)fail('first-power Renee line regressed to the historical truncated render');

for(const marker of [
  "loudnorm=I=-20.0:LRA=4.5:TP=-2.0,aresample=44100[voice]",
  "loudnorm=I=-18.5:LRA=4:TP=-1.8,aresample=44100[voice]",
  'amix=inputs=2:duration=first:dropout_transition=0:normalize=0',
  'assertDurationSafe(',
  'sourceDuration:roundedDuration(sourceDuration)',
  "duration-safe 44.1 kHz normalization/mix boundary with source/output duration guard"
])if(!reneeRenderer.includes(marker))fail('duration-safe Renee renderer marker missing '+marker);

for(const marker of [
  "const AUDIO_DIRECTION_V27_PATCH='./patches/audio-direction-v27.js.txt';",
  "const CHARACTER_VOICE_MANIFEST='./assets/audio/characters/manifest.json';",
  'applyAudioDirectionV27Runtime',
  'audioDirectionV27Source',
  "const source=audioDirectionV27Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
])if(!game.includes(marker))fail('loader marker missing '+marker);
for(const marker of [
  'rand(72,118)',
  'this.time<45',
  'voiceBusyV27()',
  'voiceLoadingV27',
  'loadCharacterV27(id)',
  'characterV27(id,onStart=null,onUnavailable=null)',
  'this.reserveVoiceV27(total,.42);',
  'onStart?.({duration:buffer.duration,startDelay,total,source:src});',
  'subtitleTracksVoice:true',
  'retainedCharacterSources:true',
  'activeCharacterSourcesV27',
  'endedNaturally',
  'spokenDuration=Math.max(3400,(timing.total+.65)*1000)',
  'g.gain.value=.90',
  'recording_jo_ls06',
  'recording_eli_ls08',
  'serializedVoices:true',
  'deepPcas:true'
])if(!patch.includes(marker))fail('patch marker missing '+marker);
const preloadReservation="this.reserveVoiceV27(Number(entry.duration||0),.42);";
const preloadReservationGuard=`if(source.includes('${preloadReservation}'))fail('character voice lifetime may not begin before lazy load completes');`;
const preloadReservationMentions=patch.split(preloadReservation).length-1;
if(preloadReservationMentions!==1||!patch.includes(preloadReservationGuard))fail('legacy pre-load character reservation exists outside its explicit rejection guard');
if(patch.includes('this.voiceBusyUntilV27=Math.max(this.voiceBusyUntilV27||0,this.ctx.currentTime+buffer.duration+.42);'))fail('legacy character timer survived after actual-start synchronization');
if(patch.includes('Object.keys(CHARACTER_VOICE_V27.files).map(id=>this.loadCharacterV27(id))'))fail('character voices must lazy-load on demand, not decode all 47 clips during boot');
const legacyCadenceMentions=(patch.match(/rand\(18,30\)/g)||[]).length;
if(legacyCadenceMentions!==1||!patch.includes("if(source.includes('this.nextAnnouncement=this.time+rand(18,30)'))fail('legacy rapid PCAS cadence survived v27');"))fail('legacy cadence may exist outside its explicit rejection guard');
const speechGuard="if(/speechSynthesis|SpeechSynthesisUtterance/.test(source))fail('runtime browser speech synthesis is forbidden');";
if(!patch.includes(speechGuard))fail('runtime speech-synthesis rejection guard missing');
if(/speechSynthesis|SpeechSynthesisUtterance/.test(patch.replace(speechGuard,'')))fail('runtime speech synthesis appears outside its explicit rejection guard');

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
console.log(`Audio Direction v27 audit passed: approved PCAS B Flite RMS profile with ${Object.keys(pcasManifest.files).length} local PCAS clips, ${Object.keys(charManifest.files).length} lazy-loaded character clips; all ${neuralEntries.length} Renee-derived neural radio renders preserve their source duration across the duration-safe 44.1 kHz loudnorm/amix boundary, character loading is serialized and retained through natural completion, subtitle lifetime begins at actual voice playback, rapid cadence and browser TTS tokens exist only inside explicit rejection guards, and historical loader audits feed forward through v27.`);
