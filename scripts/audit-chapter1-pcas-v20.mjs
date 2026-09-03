import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const PARTS=['bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt','bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt','bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'];
const PATCHES=[['patches/worldprops-v1.js.txt','applyWorldPropsV1'],['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],['patches/store-polish-v2.js.txt','applyStorePolishV2'],['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],['patches/reliability-v4.js.txt','applyReliabilityV4'],['patches/status-lights-v5.js.txt','applyStatusLightsV5'],['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']];
const TAIL=[['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']];
const fail=msg=>{throw new Error('Chapter 1 PCAS v20 audit failed: '+msg);};
function normalizeImports(source){return source.replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';").replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';").replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';").replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8'),context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const s=source.indexOf('async function buildFoodCourt(world){'),e=source.indexOf('async function buildMusic(world){',s);if(s<0||e<0)fail('Food Court markers missing');return source.slice(0,s)+replacement.trim()+'\n\n'+source.slice(e);}
async function loadStoryData(){const paths=['story/characters.js','story/evidence.js','story/chapters.js','story/timeline.js','story/dialogue.js'];let code='';for(const path of paths)code+=(await readFile(path,'utf8')).replace(/export const /g,'const ')+'\n';code+=(await readFile('story/story-data.js','utf8')).replace(/^import .*$/gm,'').replace(/export const /g,'const ')+'\nthis.__story=STORY_DATA_V17;';const context=vm.createContext({});vm.runInContext(code,context,{filename:'story/story-data.v20.audit.js'});return JSON.parse(JSON.stringify(context.__story));}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v20-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source);const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||'');fail('assembled v20 runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}

const prior=spawnSync(process.execPath,['scripts/audit-pcas-voice-v19.mjs'],{encoding:'utf8'});
if(prior.status!==0){process.stderr.write(prior.stdout||'');process.stderr.write(prior.stderr||'');fail('v19 prerequisite audit failed');}

const loader=await readFile('game.js','utf8');
for(const marker of [
  "const CHAPTER1_V20_PATCH='./patches/chapter1-pcas-escalation-v20.js.txt';",
  'async function applyChapter1PcasEscalationV20Runtime(source,patchText)',
  'getText(CHAPTER1_V20_PATCH)',
  'const chapter1V20Source=await applyChapter1PcasEscalationV20Runtime(pcasV19Source,chapter1V20Patch);',
  'const chapter2V21Source=await applyChapter2BelowGradeV21Runtime(chapter1V20Source,chapter2V21Patch);'
])if(!loader.includes(marker))fail('game.js live v20 loader marker missing: '+marker);
if(loader.includes("const source=pcasV19Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js still boots directly from v19');

const story=await loadStoryData();
const paSpec=JSON.parse(await readFile('story/pa-lines.json','utf8'));
const voiceManifest=JSON.parse(await readFile('assets/audio/pa/manifest.json','utf8'));
const paById=Object.fromEntries((paSpec.lines||[]).map(line=>[line.id,line]));
for(const id of ['ch1_pcas_route_deviation','ch1_elevator_denied']){
  if(story.dialogue[id]?.medium!=='intercom')fail(id+' must remain an intercom line');
  if(story.dialogue[id]?.text!==paById[id]?.text||story.dialogue[id]?.text!==voiceManifest.files?.[id]?.text)fail(id+' spoken/story text drift detected');
}
for(const id of ['ambient_ch1_camera_view','ambient_ch1_departure_pending'])if(!paById[id]||!voiceManifest.files?.[id])fail('missing generated reactive PCAS line '+id);
for(const id of ['ch1_second_power','ch1_key_reaction','ch1_elevator_reaction']){
  const line=story.dialogue[id];if(line?.speaker!=='RENEE'||line?.medium!=='radio')fail(id+' must be a Renee radio line');
  if(!line.text.startsWith('Fourteen, Ward on dispatch.'))fail(id+' must preserve Renee authentication phrasing');
}
if(story.dialogue.ch4_fake_route?.speaker!=='RENEE?')fail('later voice-imitation setup was altered');

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
source=(await loadPatch('patches/chapter1-pcas-escalation-v20.js.txt','applyChapter1PcasEscalationV20'))(source);

for(const marker of [
  'window.__PINEWOOD_CH1_V20__={version:20,reactivePcas:true,reneeAware:true,voiceImitation:false}',
  'SAVE.story.flags[STORY_DATA_V17.flags.contractor14Active]=true',
  "this.levelIndex===0&&this.breakers===2",
  "queueDialogue('ch1_pcas_route_deviation',.8)",
  "queueDialogue('ch1_second_power',10.0)",
  "queueDialogue('ch1_key_reaction',11.7)",
  "queueDialogue('ch1_elevator_denied',.5)",
  "queueDialogue('ch1_elevator_reaction',8.8)",
  "else if(this.breakers===2)ids=['ambient_ch1_camera_view','ambient_ch1_customer_service']",
  "else ids=['ambient_ch1_departure_pending','ambient_ch1_camera_view']"
])if(!source.includes(marker))fail('assembled runtime missing v20 marker: '+marker);
if(source.includes('voiceImitation:true'))fail('Chapter 1 introduced voice imitation too early');
for(const forbidden of ['speechSynthesis','SpeechSynthesisUtterance','https://api.elevenlabs','https://api.openai.com','https://translate.google'])if(source.includes(forbidden))fail('runtime speech/network path survived: '+forbidden);
for(const protectedMarker of ['physicalBlock:false','footprintRadius:1.64',"gain=(sprint?.14:.09)","tag:'perimeter-rack-v14'",'cassetteShelfModelPromisesV16','class StoryEventManagerV17',"this.nextStalk=rand(2.5,4.5);",'window.__PINEWOOD_PCAS_V19__'])if(!source.includes(protectedMarker))fail('protected earlier-system marker missing: '+protectedMarker);
const externalMedia=(source.match(/https:\/\/[^'"`\\s)]+\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#][^'"`\\s)]*)?/gi)||[]);if(externalMedia.length)fail('external runtime media survived: '+[...new Set(externalMedia)].join(', '));
await syntaxCheck(source);
console.log(`Chapter 1 PCAS v20 PASS: ${Object.keys(voiceManifest.files||{}).length} local PCAS clips remain verified; Contractor Fourteen becomes persistent story state; the second circuit, service key and freight elevator now escalate PCAS from generic closing automation into reactive accountability surveillance; Renee explicitly recognizes the discrepancy and contradicts PCAS; Chapter 1 voice imitation remains disabled; and protected gameplay/local-runtime invariants survive.`);
