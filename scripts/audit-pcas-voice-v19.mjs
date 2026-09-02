import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const PARTS=['bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt','bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt','bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'];
const PATCHES=[['patches/worldprops-v1.js.txt','applyWorldPropsV1'],['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],['patches/store-polish-v2.js.txt','applyStorePolishV2'],['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],['patches/reliability-v4.js.txt','applyReliabilityV4'],['patches/status-lights-v5.js.txt','applyStatusLightsV5'],['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']];
const TAIL=[['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']];
const fail=msg=>{throw new Error('PCAS Voice v19 audit failed: '+msg);};
const sha256=data=>createHash('sha256').update(data).digest('hex');
function normalizeImports(source){return source.replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';").replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';").replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';").replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8'),context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const s=source.indexOf('async function buildFoodCourt(world){'),e=source.indexOf('async function buildMusic(world){',s);if(s<0||e<0)fail('Food Court markers missing');return source.slice(0,s)+replacement.trim()+'\n\n'+source.slice(e);}
async function loadStoryData(){const paths=['story/characters.js','story/evidence.js','story/chapters.js','story/timeline.js','story/dialogue.js'];let code='';for(const path of paths)code+=(await readFile(path,'utf8')).replace(/export const /g,'const ')+'\n';code+=(await readFile('story/story-data.js','utf8')).replace(/^import .*$/gm,'').replace(/export const /g,'const ')+'\nthis.__story=STORY_DATA_V17;';const context=vm.createContext({});vm.runInContext(code,context,{filename:'story/story-data.v19.audit.js'});return JSON.parse(JSON.stringify(context.__story));}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v19-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source);const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||'');fail('assembled v19 runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}

const paSpec=JSON.parse(await readFile('story/pa-lines.json','utf8'));
const voiceManifest=JSON.parse(await readFile('assets/audio/pa/manifest.json','utf8'));
if(paSpec.version!==19||voiceManifest.version!==19)fail('PA source and generated manifest must both be version 19');
if(!Array.isArray(paSpec.lines)||paSpec.lines.length!==19)fail(`expected exactly 19 authored PA lines, found ${paSpec.lines?.length}`);
const specById=Object.fromEntries(paSpec.lines.map(line=>[line.id,line]));
if(Object.keys(specById).length!==19)fail('PA line IDs are not unique');
if(Object.keys(voiceManifest.files||{}).length!==19)fail('generated voice manifest does not contain exactly 19 files');
for(const [id,line] of Object.entries(specById)){
  const entry=voiceManifest.files[id];if(!entry)fail('voice manifest missing '+id);
  if(entry.text!==line.text)fail(id+' generated text differs from canonical PA source');
  if(entry.textSha256!==sha256(Buffer.from(line.text,'utf8')))fail(id+' text hash is stale');
  if(!/^[a-z0-9_]+\.ogg$/.test(entry.file)||entry.file!==id+'.ogg')fail(id+' has unsafe or unexpected file name');
  if(!Number.isFinite(entry.duration)||entry.duration<1||entry.duration>20)fail(id+' has implausible duration '+entry.duration);
  const bytes=await readFile('assets/audio/pa/'+entry.file);
  if(bytes.length<1000)fail(id+' audio file is unexpectedly small');
  if(bytes.subarray(0,4).toString('ascii')!=='OggS')fail(id+' is not an Ogg stream');
  if(sha256(bytes)!==entry.sha256)fail(id+' audio SHA-256 does not match manifest');
}
for(const required of ['ch1_pcas_hold','ch1_contractor_registered','ch1_key_discrepancy','ch2_maintenance_eval','ch3_accountability_zero','ambient_ch1_public_exit','ambient_ch2_stairwell','ambient_ch3_unaccounted','ending_override','ending_closed'])if(!specById[required])fail('missing required PCAS line '+required);
if(!String(voiceManifest.engine?.name).includes('eSpeak'))fail('generated manifest does not identify eSpeak NG');
if(!String(voiceManifest.processing?.description).includes('ceiling-speaker'))fail('generated manifest does not record the ceiling-speaker processing chain');

const story=await loadStoryData();
for(const id of ['ch1_pcas_hold','ch1_contractor_registered','ch1_key_discrepancy']){
  if(story.dialogue[id]?.medium!=='intercom')fail(id+' is no longer an intercom dialogue line');
  if(story.dialogue[id]?.text!==specById[id]?.text)fail(id+' story dialogue and generated spoken line have drifted apart');
}

const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(v=>v.trim()).join('');let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [path,name] of PATCHES)source=(await loadPatch(path,name))(source);
source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
for(const [path,name] of TAIL)source=(await loadPatch(path,name))(source);
const localManifest=JSON.parse(await readFile('assets/vendor/runtime/manifest.json','utf8'));
source=(await loadPatch('patches/local-assets-v15.js.txt','applyLocalAssetsV15'))(source,localManifest);
source=(await loadPatch('patches/retail-geometry-v16.js.txt','applyRetailGeometryV16'))(source);
source=(await loadPatch('patches/story-foundation-v17.js.txt','applyStoryFoundationV17'))(source,story);
source=(await loadPatch('patches/chapter1-story-v18.js.txt','applyChapter1StoryV18'))(source);
source=(await loadPatch('patches/pcas-voice-v19.js.txt','applyPcasVoiceV19'))(source,voiceManifest);

for(const marker of [
  'const PCAS_VOICE_V19=',
  "const PCAS_AUDIO_BASE=new URL('./assets/audio/pa/',location.href).href;",
  'async loadPcas(id)',
  'async pcas(id)',
  "fetch(PCAS_AUDIO_BASE+entry.file,{cache:'force-cache'})",
  "line.medium==='intercom'?id:null",
  'queueStory(delay,kind,who,text,audioKey=null)',
  'audio.pcas(l.audioKey)',
  'audio.pcasDuration(l.audioKey)',
  'playPcasLineV19(id)',
  "'ambient_ch1_public_exit'",
  "'ambient_ch2_stairwell'",
  "'ambient_ch3_unaccounted'",
  "this.playPcasLineV19('ending_override')",
  "this.playPcasLineV19('ending_closed')",
  'window.__PINEWOOD_PCAS_V19__'
])if(!source.includes(marker))fail('assembled runtime missing v19 marker: '+marker);
for(const forbidden of ['speechSynthesis','SpeechSynthesisUtterance','https://api.elevenlabs','https://api.openai.com','https://translate.google'])if(source.includes(forbidden))fail('runtime TTS/network speech path survived: '+forbidden);
for(const protectedMarker of ['physicalBlock:false','footprintRadius:1.64',"gain=(sprint?.14:.09)","tag:'perimeter-rack-v14'",'cassetteShelfModelPromisesV16','class StoryEventManagerV17',"SAVE.story.people.renee='known'",'this.nextStalk=rand(2.5,4.5);'])if(!source.includes(protectedMarker))fail('protected earlier-system marker missing: '+protectedMarker);
const externalMedia=(source.match(/https:\/\/[^'"`\\s)]+\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#][^'"`\\s)]*)?/gi)||[]);if(externalMedia.length)fail('external runtime media survived: '+[...new Set(externalMedia)].join(', '));
await syntaxCheck(source);
console.log('PCAS Voice v19 PASS: 19 authored announcements have hash-verified repository-local Ogg voice assets; eSpeak NG/FFmpeg generation provenance is recorded; story text matches spoken text; v18 + v19 reconstruct cleanly; intercom story and ambient chatter route through local processed voice with duration-aware subtitles; browser/cloud TTS is absent; and all protected gameplay/local-runtime invariants survive.');
