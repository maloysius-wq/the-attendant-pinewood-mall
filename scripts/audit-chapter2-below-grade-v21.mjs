import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const PARTS=['bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt','bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt','bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'];
const PATCHES=[['patches/worldprops-v1.js.txt','applyWorldPropsV1'],['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],['patches/store-polish-v2.js.txt','applyStorePolishV2'],['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],['patches/reliability-v4.js.txt','applyReliabilityV4'],['patches/status-lights-v5.js.txt','applyStatusLightsV5'],['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']];
const TAIL=[['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']];
const fail=msg=>{throw new Error('Chapter 2 Below Grade v21 audit failed: '+msg);};
function normalizeImports(source){return source.replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';").replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';").replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';").replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8'),context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const s=source.indexOf('async function buildFoodCourt(world){'),e=source.indexOf('async function buildMusic(world){',s);if(s<0||e<0)fail('Food Court markers missing');return source.slice(0,s)+replacement.trim()+'\n\n'+source.slice(e);}
async function loadStoryData(){const paths=['story/characters.js','story/evidence.js','story/chapters.js','story/timeline.js','story/dialogue.js'];let code='';for(const path of paths)code+=(await readFile(path,'utf8')).replace(/export const /g,'const ')+'\n';code+=(await readFile('story/story-data.js','utf8')).replace(/^import .*$/gm,'').replace(/export const /g,'const ')+'\nthis.__story=STORY_DATA_V17;';const context=vm.createContext({});vm.runInContext(code,context,{filename:'story/story-data.v21.audit.js'});return JSON.parse(JSON.stringify(context.__story));}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v21-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source);const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||'');fail('assembled v21 runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}

const prior=spawnSync(process.execPath,['scripts/audit-chapter1-pcas-v20.mjs'],{encoding:'utf8'});
if(prior.status!==0){process.stderr.write(prior.stdout||'');process.stderr.write(prior.stderr||'');fail('v20 prerequisite audit failed');}

const story=await loadStoryData();
const paSpec=JSON.parse(await readFile('story/pa-lines.json','utf8'));
const voiceManifest=JSON.parse(await readFile('assets/audio/pa/manifest.json','utf8'));
const paById=Object.fromEntries((paSpec.lines||[]).map(line=>[line.id,line]));
for(const id of ['ch2_maintenance_eval','ch2_pump_violation','ch2_route_deviation']){
  const line=story.dialogue[id];
  if(line?.speaker!=='PCAS'||line?.medium!=='intercom')fail(id+' must be a PCAS intercom line');
  if(line.text!==paById[id]?.text||line.text!==voiceManifest.files?.[id]?.text)fail(id+' spoken/story text drift detected');
}
const reneeLines=['ch2_start','ch2_feeder_found','ch2_relay_d','ch2_1997_ticket','ch2_pump_ready','ch2_mask_tutorial','ch2_gavin_body','ch2_gavin_ticket','ch2_contractor13','ch2_relay_e','ch2_exit'];
for(const id of reneeLines){const line=story.dialogue[id];if(line?.speaker!=='RENEE'||line?.medium!=='radio')fail(id+' must be a Renee radio line');}
for(const id of reneeLines.filter(id=>id!=='ch2_contractor13'))if(!story.dialogue[id].text.startsWith('Fourteen, Ward on dispatch.'))fail(id+' must preserve Renee authentication phrasing');
const contractorReveal=story.dialogue.ch2_contractor13.text;
if(!contractorReveal.includes('CONTRACTOR 13')||!contractorReveal.includes('Yours says CONTRACTOR 14')||!contractorReveal.includes('You are not the first person'))fail('Contractor 13 reveal lost its numbered-session discovery');
if(story.dialogue.ch4_fake_route?.speaker!=='RENEE?')fail('later voice-imitation setup was altered');
if(!voiceManifest.files?.ch2_pump_violation||!voiceManifest.files?.ch2_route_deviation)fail('new Chapter 2 local PCAS recordings are missing');

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
source=(await loadPatch('patches/chapter2-below-grade-v21.js.txt','applyChapter2BelowGradeV21'))(source);

for(const marker of [
  "name:'Chapter 2: Below Grade'",
  'window.__PINEWOOD_CH2_V21__={version:21,machineryMasking:true,relayRouting:true,dynamicFlood:true,gavinSetpiece:true,contractor13:true,voiceImitation:false,sceneBuilt:false}',
  "controlId==='feeder'",
  "controlId==='pump'",
  'Relay D is still fed. Isolate Feeder 4 in Loading first.',
  'Relay E is beyond the flooded low corridor. Run Sump 2 first.',
  's.drainElapsed/9.0',
  'floodBlocker.disabled=true',
  "type==='step'?(this.ch2V21?.mask||0)",
  "this.startLoop('buzz','machineryV21'",
  'this.threatVol*(1-machinery*.76)',
  "o.userData.label==='GAVIN-TICKET'",
  'STORY_DATA_V17.flags.contractor13',
  "SAVE.story.people.gavin='body_found'",
  "queueDialogue('ch2_contractor13',6.4)",
  "queueDialogue('ch2_relay_e',.8)",
  "'below-grade-pump'",
  "'below-grade-gavin'",
  "'below-grade-flood'"
])if(!source.includes(marker))fail('assembled runtime missing v21 marker: '+marker);
if(source.includes("Chapter 2: Service Level"))fail('prototype Service Level identity survived');
if(source.includes("[-6,23,'LS-05'")||source.includes("[18,8,'LS-06'"))fail('prototype LS-05/06 placement survived in Below Grade');
if(source.includes('voiceImitation:true'))fail('Below Grade introduced Renee voice imitation before Chapter 4');

for(const protectedMarker of [
  'physicalBlock:false','footprintRadius:1.64',"gain=(sprint?.14:.09)","tag:'perimeter-rack-v14'",'cassetteShelfModelPromisesV16','class StoryEventManagerV17',"this.nextStalk=rand(2.5,4.5);",'window.__PINEWOOD_PCAS_V19__','window.__PINEWOOD_CH1_V20__={version:20,reactivePcas:true,reneeAware:true,voiceImitation:false}'
])if(!source.includes(protectedMarker))fail('protected earlier-system marker missing: '+protectedMarker);
for(const forbidden of ['speechSynthesis','SpeechSynthesisUtterance','https://api.elevenlabs','https://api.openai.com','https://translate.google'])if(source.includes(forbidden))fail('runtime speech/network path survived: '+forbidden);
const externalMedia=(source.match(/https:\/\/[^'"`\\s)]+\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#][^'"`\\s)]*)?/gi)||[]);if(externalMedia.length)fail('external runtime media survived: '+[...new Set(externalMedia)].join(', '));
await syntaxCheck(source);

const loader=await readFile('game.js','utf8');
const live=loader.includes("const CHAPTER2_V21_PATCH='./patches/chapter2-below-grade-v21.js.txt';");
if(live){
  for(const marker of [
    'async function applyChapter2BelowGradeV21Runtime(source,patchText)',
    'getText(CHAPTER2_V21_PATCH)',
    'const chapter2V21Source=await applyChapter2BelowGradeV21Runtime(chapter1V20Source,chapter2V21Patch);',
    "const source=chapter2V21Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
  ])if(!loader.includes(marker))fail('game.js partial/incorrect live v21 loader marker: '+marker);
  if(loader.includes("const source=chapter1V20Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js declares v21 but still boots directly from v20');
}else if(loader.includes('applyChapter2BelowGradeV21Runtime')||loader.includes('chapter2V21Source'))fail('game.js contains partial v21 wiring without the v21 patch constant');

console.log(`Chapter 2 Below Grade v21 PASS (${live?'LIVE':'STAGED'}): full runtime reconstructs and parses through v21; Feeder 4 gates Relay D; Relay D powers Sump 2; the nine-second drain gates Relay E; machinery masks footsteps while suppressing threat cues; Gavin Cole and CONTRACTOR 13 persist into story state; Chapter 2 PCAS audio matches local generated assets; Renee authentication remains intact; voice imitation stays deferred; and protected gameplay/local-runtime invariants survive.`);
