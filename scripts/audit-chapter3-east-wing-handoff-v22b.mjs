import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const PARTS=['bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt','bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt','bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'];
const PATCHES=[['patches/worldprops-v1.js.txt','applyWorldPropsV1'],['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],['patches/store-polish-v2.js.txt','applyStorePolishV2'],['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],['patches/reliability-v4.js.txt','applyReliabilityV4'],['patches/status-lights-v5.js.txt','applyStatusLightsV5'],['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']];
const TAIL=[['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']];
const fail=msg=>{throw new Error('Chapter 3 East Wing handoff v22b audit failed: '+msg);};
function normalizeImports(source){return source.replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';").replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';").replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';").replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8'),context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const s=source.indexOf('async function buildFoodCourt(world){'),e=source.indexOf('async function buildMusic(world){',s);if(s<0||e<0)fail('Food Court markers missing');return source.slice(0,s)+replacement.trim()+'\n\n'+source.slice(e);}
async function loadStoryData(){const paths=['story/characters.js','story/evidence.js','story/chapters.js','story/timeline.js','story/dialogue.js'];let code='';for(const path of paths)code+=(await readFile(path,'utf8')).replace(/export const /g,'const ')+'\n';code+=(await readFile('story/story-data.js','utf8')).replace(/^import .*$/gm,'').replace(/export const /g,'const ')+'\nthis.__story=STORY_DATA_V17;';const context=vm.createContext({});vm.runInContext(code,context,{filename:'story/story-data.v22b.audit.js'});return JSON.parse(JSON.stringify(context.__story));}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v22b-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source);const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||'');fail('assembled v22b runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}

const prior=spawnSync(process.execPath,['scripts/audit-chapter3-eyes-security-v22.mjs'],{encoding:'utf8'});
if(prior.status!==0){process.stderr.write(prior.stdout||'');process.stderr.write(prior.stderr||'');fail('v22 prerequisite audit failed');}

const story=await loadStoryData();
const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(v=>v.trim()).join('');let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [path,name] of PATCHES)source=(await loadPatch(path,name))(source);
source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
for(const [path,name] of TAIL)source=(await loadPatch(path,name))(source);
source=(await loadPatch('patches/local-assets-v15.js.txt','applyLocalAssetsV15'))(source,JSON.parse(await readFile('assets/vendor/runtime/manifest.json','utf8')));
source=(await loadPatch('patches/retail-geometry-v16.js.txt','applyRetailGeometryV16'))(source);
source=(await loadPatch('patches/story-foundation-v17.js.txt','applyStoryFoundationV17'))(source,story);
source=(await loadPatch('patches/chapter1-story-v18.js.txt','applyChapter1StoryV18'))(source);
source=(await loadPatch('patches/pcas-voice-v19.js.txt','applyPcasVoiceV19'))(source,JSON.parse(await readFile('assets/audio/pa/manifest.json','utf8')));
source=(await loadPatch('patches/chapter1-pcas-escalation-v20.js.txt','applyChapter1PcasEscalationV20'))(source);
source=(await loadPatch('patches/chapter2-below-grade-v21.js.txt','applyChapter2BelowGradeV21'))(source);
source=(await loadPatch('patches/chapter3-eyes-security-v22.js.txt','applyChapter3EyesSecurityV22'))(source);
source=(await loadPatch('patches/chapter3-east-wing-handoff-v22b.js.txt','applyChapter3EastWingHandoffV22B'))(source);

for(const marker of [
  "name:'Chapter 3: Eyes in Security'",
  "exitGate.userData.chapter3ExitV22=true",
  "world.addCollider(29.35,26.0,.28,5.15,{navBlock:true,owner:exitGate",
  "GAME.exitObject=exitGate",
  "this.levelIndex===2&&this.exitObject===o&&!this.ch3V22?.luisEvidence",
  "this.levelIndex===2&&this.exitObject===o&&o.userData.open",
  "completeSecurityV22(){",
  "SAVE.story.completedEvents.ch3_complete=true",
  "SAVE.story.chapterCheckpoint='east_wing'",
  "return'Reach the East Wing fire door'",
  "eastWingHandoff:true",
  "queueDialogue('ch3_exit',.35)"
])if(!source.includes(marker))fail('assembled runtime missing handoff marker: '+marker);
if(source.includes("queueDialogue('ch3_exit',15.0)"))fail('Chapter 3 exit still fires on a timer after LS-05');
const completion=source.slice(source.indexOf('completeSecurityV22(){'),source.indexOf('updateSecurityV22(dt){'));
if(completion.includes('winChapter()')||completion.includes('END OF SHIFT'))fail('Chapter 3 checkpoint routes through obsolete final-ending logic');
if(!completion.includes("chapterCheckpoint='east_wing'")||!completion.includes("chapterTitle').textContent='Chapter 3 complete'"))fail('Chapter 3 checkpoint does not persist/display the East Wing handoff');
if(source.includes('voiceImitation:true'))fail('Chapter 3 handoff introduced voice imitation early');
for(const protectedMarker of ['window.__PINEWOOD_CH3_V22__','securityFeedStatusV22(game,feed)',"securityRouteV22='west'","securityRouteV22='east'","o.userData.label==='LS-05'",'s.drainElapsed/9.0',"tag:'perimeter-rack-v14'"])if(!source.includes(protectedMarker))fail('protected earlier marker missing: '+protectedMarker);
for(const forbidden of ['speechSynthesis','SpeechSynthesisUtterance','https://api.elevenlabs','https://api.openai.com','https://translate.google'])if(source.includes(forbidden))fail('runtime speech/network path survived: '+forbidden);
const externalMedia=(source.match(/https:\/\/[^'"`\\s)]+\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#][^'"`\\s)]*)?/gi)||[]);if(externalMedia.length)fail('external runtime media survived: '+[...new Set(externalMedia)].join(', '));
await syntaxCheck(source);

const loader=await readFile('game.js','utf8');
const live=loader.includes("const CHAPTER3_V22B_PATCH='./patches/chapter3-east-wing-handoff-v22b.js.txt';");
if(live){
  for(const marker of [
    'async function applyChapter3EastWingHandoffV22BRuntime(source,patchText)',
    'getText(CHAPTER3_V22B_PATCH)',
    'const chapter3V22BSource=await applyChapter3EastWingHandoffV22BRuntime(chapter3V22Source,chapter3V22BPatch);',
    'const chapter3V22CSource=await applyChapter3SecurityReadabilityV22CRuntime(chapter3V22BSource,chapter3V22CPatch);'
  ])if(!loader.includes(marker))fail('game.js partial/incorrect live v22b loader marker: '+marker);
  if(loader.includes("const source=chapter3V22Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js declares v22b but still boots directly from v22');
}else if(loader.includes('applyChapter3EastWingHandoffV22BRuntime')||loader.includes('chapter3V22BSource'))fail('game.js contains partial v22b wiring without its patch constant');

console.log(`Chapter 3 East Wing handoff v22b PASS (${live?'LIVE':'STAGED'}): LS-05 gates a physical East Wing fire door; opening that door triggers authenticated Chapter 3 exit dialogue and a saved east_wing checkpoint rather than the obsolete three-level final ending; v22 CCTV, route shutters, Luis evidence, local-runtime and earlier chapter invariants survive.`);
