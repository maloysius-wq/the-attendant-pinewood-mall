import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const PARTS=['bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt','bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt','bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'];
const PATCHES=[['patches/worldprops-v1.js.txt','applyWorldPropsV1'],['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],['patches/store-polish-v2.js.txt','applyStorePolishV2'],['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],['patches/reliability-v4.js.txt','applyReliabilityV4'],['patches/status-lights-v5.js.txt','applyStatusLightsV5'],['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']];
const TAIL=[['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']];
const fail=msg=>{throw new Error('Chapter 3 Eyes in Security v22 audit failed: '+msg);};
function normalizeImports(source){return source.replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';").replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';").replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';").replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8'),context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const s=source.indexOf('async function buildFoodCourt(world){'),e=source.indexOf('async function buildMusic(world){',s);if(s<0||e<0)fail('Food Court markers missing');return source.slice(0,s)+replacement.trim()+'\n\n'+source.slice(e);}
async function loadStoryData(){const paths=['story/characters.js','story/evidence.js','story/chapters.js','story/timeline.js','story/dialogue.js'];let code='';for(const path of paths)code+=(await readFile(path,'utf8')).replace(/export const /g,'const ')+'\n';code+=(await readFile('story/story-data.js','utf8')).replace(/^import .*$/gm,'').replace(/export const /g,'const ')+'\nthis.__story=STORY_DATA_V17;';const context=vm.createContext({});vm.runInContext(code,context,{filename:'story/story-data.v22.audit.js'});return JSON.parse(JSON.stringify(context.__story));}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v22-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source);const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||'');fail('assembled v22 runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}

const prior=spawnSync(process.execPath,['scripts/audit-chapter2-below-grade-v21.mjs'],{encoding:'utf8'});
if(prior.status!==0){process.stderr.write(prior.stdout||'');process.stderr.write(prior.stderr||'');fail('v21 prerequisite audit failed');}

const story=await loadStoryData();
const ch3=story.chapters?.[2];
if(ch3?.id!=='eyes_in_security'||ch3?.primaryMechanic!=='cctv_shutters')fail('Chapter 3 story definition is not Eyes in Security / cctv_shutters');
const ls05=story.evidence?.['LS-05'];
if(ls05?.chapter!==2||!String(ls05?.title||'').includes('Luis Ortega Security VHS'))fail('LS-05 is not the Chapter 3 Luis Security VHS');
for(const id of ['ch3_start','ch3_cctv_online','ch3_shutter_interlock','ch3_auth','ch3_luis_body','ch3_luis_pattern','ch3_exit']){
  const line=story.dialogue?.[id];if(line?.speaker!=='RENEE'||line?.medium!=='radio')fail(id+' must be a Renee radio line');
  if(!line.text.startsWith('Fourteen, Ward on dispatch.'))fail(id+' must preserve Renee authentication phrasing');
}
if(story.dialogue.ch4_fake_route?.speaker!=='RENEE?')fail('Chapter 4 imitation setup was altered');
if(!story.dialogue.ch3_luis_pattern.text.includes('Pinewood calls. The Attendant answers.'))fail('Luis pattern conclusion drifted');

const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(v=>v.trim()).join('');let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [path,name] of PATCHES)source=(await loadPatch(path,name))(source);
source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
for(const [path,name] of TAIL)source=(await loadPatch(path,name))(source);
const localManifest=JSON.parse(await readFile('assets/vendor/runtime/manifest.json','utf8'));
const voiceManifest=JSON.parse(await readFile('assets/audio/pa/manifest.json','utf8'));
source=(await loadPatch('patches/local-assets-v15.js.txt','applyLocalAssetsV15'))(source,localManifest);
source=(await loadPatch('patches/retail-geometry-v16.js.txt','applyRetailGeometryV16'))(source);
source=(await loadPatch('patches/story-foundation-v17.js.txt','applyStoryFoundationV17'))(source,story);
source=(await loadPatch('patches/chapter1-story-v18.js.txt','applyChapter1StoryV18'))(source);
source=(await loadPatch('patches/pcas-voice-v19.js.txt','applyPcasVoiceV19'))(source,voiceManifest);
source=(await loadPatch('patches/chapter1-pcas-escalation-v20.js.txt','applyChapter1PcasEscalationV20'))(source);
source=(await loadPatch('patches/chapter2-below-grade-v21.js.txt','applyChapter2BelowGradeV21'))(source);
source=(await loadPatch('patches/chapter3-eyes-security-v22.js.txt','applyChapter3EyesSecurityV22'))(source);

for(const marker of [
  "name:'Chapter 3: Eyes in Security'",
  'window.__PINEWOOD_CH3_V22__={version:22,cctvFeeds:4,nonOmniscient:true,interlockedShutters:true,luisSetpiece:true,lastShiftEvidence:\'LS-05\',voiceImitation:false,sceneBuilt:false}',
  "{id:'CAM 02',label:'WEST JUNCTION'",
  "{id:'CAM 05',label:'RECEIVING'",
  "{id:'CAM 09',label:'NORTH SECURITY HALL'",
  "{id:'CAM 12',label:'SECONDARY SECURITY'",
  'securityFeedStatusV22(game,feed)',
  "west.userData.securityRouteV22='west'",
  "east.userData.securityRouteV22='east'",
  'world.addCollider(-8,8,5.15,.28,{navBlock:true,owner:west',
  'world.addCollider(18,8,5.15,.28,{navBlock:true,owner:east',
  "s.westShutter.userData.open=westOpen;s.eastShutter.userData.open=!westOpen",
  "chapter3Setpiece='primary-security-cctv-v22'",
  "chapter3Setpiece='luis-remains-v22'",
  "chapter3Setpiece='disconnected-pa-chain-v22'",
  "chapter3Setpiece='luis-vhs-station-v22'",
  "makePickup('tape',new THREE.Vector3(24.15,.16,26.15),'LS-05'",
  "o.userData.label==='LS-05'",
  'STORY_DATA_V17.flags.luisPattern',
  "SAVE.story.people.luis='body_found'",
  "queueDialogue('ch3_auth',7.4)",
  'this.updateSecurityV22(dt)',
  'this.chapter3ObjectiveV22()',
  "'security-cctv':{chapter:2",
  "'security-shutters':{chapter:2",
  "'security-luis':{chapter:2"
])if(!source.includes(marker))fail('assembled runtime missing v22 marker: '+marker);

const feedFn=source.slice(source.indexOf('function securityFeedStatusV22'),source.indexOf('function makeSecurityConsoleV22'));
if(!feedFn.includes('a?.root?.visible')||!feedFn.includes('securityFeedContainsV22(feed,a.root.position)'))fail('CCTV feed detection must depend on visible Attendant position inside the selected feed');
for(const forbidden of ['GAME.controls.yaw.position','playerPos','navDistance','hasLOS'])if(feedFn.includes(forbidden))fail('CCTV feed became omniscient via '+forbidden);
if(source.includes('Three actual tapes gate the ending.'))fail('prototype Chapter 3 tape-finale scene survived');
if(source.includes('Recover Last Shift tapes ${this.tapes}/3'))fail('prototype Chapter 3 tape HUD survived');
if(source.includes('Reach PA control and end the shift'))fail('prototype Chapter 3 finale objective survived');
if(source.includes('voiceImitation:true'))fail('Chapter 3 introduced Renee voice imitation before Chapter 4');

for(const protectedMarker of [
  'physicalBlock:false','footprintRadius:1.64',"gain=(sprint?.14:.09)","tag:'perimeter-rack-v14'",'cassetteShelfModelPromisesV16','class StoryEventManagerV17','window.__PINEWOOD_PCAS_V19__','window.__PINEWOOD_CH1_V20__={version:20,reactivePcas:true,reneeAware:true,voiceImitation:false}','window.__PINEWOOD_CH2_V21__={version:21,machineryMasking:true,relayRouting:true,dynamicFlood:true,gavinSetpiece:true,contractor13:true,voiceImitation:false,sceneBuilt:false}','s.drainElapsed/9.0','this.threatVol*(1-machinery*.76)'
])if(!source.includes(protectedMarker))fail('protected earlier-system marker missing: '+protectedMarker);
for(const forbidden of ['speechSynthesis','SpeechSynthesisUtterance','https://api.elevenlabs','https://api.openai.com','https://translate.google'])if(source.includes(forbidden))fail('runtime speech/network path survived: '+forbidden);
const externalMedia=(source.match(/https:\/\/[^'"`\\s)]+\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#][^'"`\\s)]*)?/gi)||[]);if(externalMedia.length)fail('external runtime media survived: '+[...new Set(externalMedia)].join(', '));
await syntaxCheck(source);

const loader=await readFile('game.js','utf8');
const live=loader.includes("const CHAPTER3_V22_PATCH='./patches/chapter3-eyes-security-v22.js.txt';");
if(live){
  for(const marker of [
    'async function applyChapter3EyesSecurityV22Runtime(source,patchText)',
    'getText(CHAPTER3_V22_PATCH)',
    'const chapter3V22Source=await applyChapter3EyesSecurityV22Runtime(chapter2V21Source,chapter3V22Patch);',
    "const source=chapter3V22Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
  ])if(!loader.includes(marker))fail('game.js partial/incorrect live v22 loader marker: '+marker);
  if(loader.includes("const source=chapter2V21Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js declares v22 but still boots directly from v21');
}else if(loader.includes('applyChapter3EyesSecurityV22Runtime')||loader.includes('chapter3V22Source'))fail('game.js contains partial v22 wiring without the v22 patch constant');

console.log(`Chapter 3 Eyes in Security v22 PASS (${live?'LIVE':'STAGED'}): full runtime reconstructs and parses through v22; Chapter 3 replaces the prototype Last Shift finale with four named non-omniscient CCTV groups, complementary nav-blocking route shutters, Luis Ortega's secondary-Security remains/PA/VHS set piece, LS-05 story persistence, and authenticated Renee dialogue; voice imitation remains deferred to Chapter 4; and v14/v20/v21/local-runtime invariants survive.`);
