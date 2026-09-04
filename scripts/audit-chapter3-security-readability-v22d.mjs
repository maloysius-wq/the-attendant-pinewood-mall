import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const PARTS=['bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt','bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt','bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'];
const BASE=[['patches/worldprops-v1.js.txt','applyWorldPropsV1'],['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],['patches/store-polish-v2.js.txt','applyStorePolishV2'],['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],['patches/reliability-v4.js.txt','applyReliabilityV4'],['patches/status-lights-v5.js.txt','applyStatusLightsV5'],['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']];
const TAIL=[['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']];
const fail=msg=>{throw new Error('Chapter 3 Security readability v22d audit failed: '+msg);};
function normalizeImports(source){return source.replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';").replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';").replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';").replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8'),ctx=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,ctx,{filename:path});if(typeof ctx.__patch!=='function')fail(`${path} missing ${name}`);return ctx.__patch;}
function replaceFoodCourt(source,replacement){const s=source.indexOf('async function buildFoodCourt(world){'),e=source.indexOf('async function buildMusic(world){',s);if(s<0||e<0)fail('Food Court markers missing');return source.slice(0,s)+replacement.trim()+'\n\n'+source.slice(e);}
async function storyData(){const paths=['story/characters.js','story/evidence.js','story/chapters.js','story/timeline.js','story/dialogue.js'];let code='';for(const p of paths)code+=(await readFile(p,'utf8')).replace(/export const /g,'const ')+'\n';code+=(await readFile('story/story-data.js','utf8')).replace(/^import .*$/gm,'').replace(/export const /g,'const ')+'\nthis.__story=STORY_DATA_V17;';const ctx=vm.createContext({});vm.runInContext(code,ctx);return JSON.parse(JSON.stringify(ctx.__story));}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v22d-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source);const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||'');fail('assembled v22d runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}

const prior=spawnSync(process.execPath,['scripts/audit-chapter3-security-readability-v22c.mjs'],{encoding:'utf8'});if(prior.status!==0){process.stderr.write(prior.stdout||'');process.stderr.write(prior.stderr||'');fail('v22c prerequisite audit failed');}
const story=await storyData(),voice=JSON.parse(await readFile('assets/audio/pa/manifest.json','utf8')),local=JSON.parse(await readFile('assets/vendor/runtime/manifest.json','utf8'));
const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(v=>v.trim()).join('');let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [p,n] of BASE)source=(await loadPatch(p,n))(source);source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));for(const [p,n] of TAIL)source=(await loadPatch(p,n))(source);
for(const [p,n,args] of [
 ['patches/local-assets-v15.js.txt','applyLocalAssetsV15',[local]],['patches/retail-geometry-v16.js.txt','applyRetailGeometryV16',[]],['patches/story-foundation-v17.js.txt','applyStoryFoundationV17',[story]],['patches/chapter1-story-v18.js.txt','applyChapter1StoryV18',[]],['patches/pcas-voice-v19.js.txt','applyPcasVoiceV19',[voice]],['patches/chapter1-pcas-escalation-v20.js.txt','applyChapter1PcasEscalationV20',[]],['patches/chapter2-below-grade-v21.js.txt','applyChapter2BelowGradeV21',[]],['patches/chapter3-eyes-security-v22.js.txt','applyChapter3EyesSecurityV22',[]],['patches/chapter3-east-wing-handoff-v22b.js.txt','applyChapter3EastWingHandoffV22B',[]],['patches/chapter3-security-readability-v22c.js.txt','applyChapter3SecurityReadabilityV22C',[]],['patches/chapter3-security-readability-v22d.js.txt','applyChapter3SecurityReadabilityV22D',[]]
])source=(await loadPatch(p,n))(source,...args);

for(const marker of ["readabilityLighting:true,readabilityPolish:true","1.72,8.4,coolPanel,'west-shutter'","1.72,8.4,coolPanel,'east-shutter'","1.58,7.4,coolPanel,'secondary-security'","chapter3LightV22D='ambient-fill'","chapter3LightV22D='luis-fill'","chapter3LightV22D='vcr-fill'","new THREE.HemisphereLight(0x647b75,0x050606,.115)","'security-shutters':{chapter:2,p:[-8.0,1.70,3.8],yaw:Math.PI,pitch:-.06}","emissiveIntensity:.90,roughness:.3","emissiveIntensity:.88,roughness:.29"])if(!source.includes(marker))fail('assembled runtime missing v22d marker: '+marker);
for(const marker of ['securityFeedStatusV22(game,feed)',"securityRouteV22='west'","securityRouteV22='east'","completeSecurityV22(){","SAVE.story.chapterCheckpoint='east_wing'","o.userData.label==='LS-05'",'s.drainElapsed/9.0',"tag:'perimeter-rack-v14'",'reactivePcas:true','contractor13:true'])if(!source.includes(marker))fail('protected system marker missing: '+marker);
if(source.includes('voiceImitation:true'))fail('v22d introduced voice imitation before Chapter 4');
for(const forbidden of ['speechSynthesis','SpeechSynthesisUtterance','https://api.elevenlabs','https://api.openai.com','https://translate.google'])if(source.includes(forbidden))fail('runtime speech/network path survived: '+forbidden);
const externalMedia=(source.match(/https:\/\/[^'"`\\s)]+\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#][^'"`\\s)]*)?/gi)||[]);if(externalMedia.length)fail('external runtime media survived: '+[...new Set(externalMedia)].join(', '));
await syntaxCheck(source);

const loader=await readFile('game.js','utf8');
const live=loader.includes("const CHAPTER3_V22D_PATCH='./patches/chapter3-security-readability-v22d.js.txt';");
const v23=loader.includes("const CHAPTER4_V23_PATCH='./patches/chapter4-east-wing-v23.js.txt';");
const v23b=loader.includes("const CHAPTER4_V23B_PATCH='./patches/chapter4-east-wing-readability-v23b.js.txt';");
const v24=loader.includes("const CHAPTER5_V24_PATCH='./patches/chapter5-accountability-v24.js.txt';");
if(live){
  for(const marker of ['async function applyChapter3SecurityReadabilityV22DRuntime(source,patchText)','getText(CHAPTER3_V22D_PATCH)','const chapter3V22DSource=await applyChapter3SecurityReadabilityV22DRuntime(chapter3V22CSource,chapter3V22DPatch);'])if(!loader.includes(marker))fail('game.js partial/incorrect live v22d marker: '+marker);
  if(v23b&&!v23)fail('game.js cannot wire v23b without v23');
  if(v24&&!v23b)fail('game.js cannot wire v24 without v23b');
  if(v23){
    for(const marker of ['async function applyChapter4EastWingV23Runtime(source,patchText)','getText(CHAPTER4_V23_PATCH)','const chapter4V23Source=await applyChapter4EastWingV23Runtime(chapter3V22DSource,chapter4V23Patch);'])if(!loader.includes(marker))fail('game.js invalid v22d→v23 feed-forward marker: '+marker);
    if(loader.includes("const source=chapter3V22DSource+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js still boots terminal v22d while v23 is present');
    if(v23b){
      for(const marker of ['async function applyChapter4EastWingReadabilityV23BRuntime(source,patchText)','getText(CHAPTER4_V23B_PATCH)','const chapter4V23BSource=await applyChapter4EastWingReadabilityV23BRuntime(chapter4V23Source,chapter4V23BPatch);'])if(!loader.includes(marker))fail('game.js invalid v23→v23b feed-forward marker: '+marker);
      if(loader.includes("const source=chapter4V23Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js still boots terminal v23 while v23b is present');
      if(v24){
        for(const marker of ['async function applyChapter5AccountabilityV24Runtime(source,patchText)','getText(CHAPTER5_V24_PATCH)','const chapter5V24Source=await applyChapter5AccountabilityV24Runtime(chapter4V23BSource,chapter5V24Patch);',"const source=chapter5V24Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"])if(!loader.includes(marker))fail('game.js invalid v23b→v24 feed-forward marker: '+marker);
        if(loader.includes("const source=chapter4V23BSource+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js still boots terminal v23b while v24 is present');
      }else if(!loader.includes("const source=chapter4V23BSource+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js missing terminal v23b source marker');
    }else if(!loader.includes("const source=chapter4V23Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js missing terminal v23 source marker');
  }else if(!loader.includes("const source=chapter3V22DSource+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js missing terminal v22d source marker');
}else if(loader.includes('applyChapter3SecurityReadabilityV22DRuntime')||loader.includes('chapter3V22DSource'))fail('game.js contains partial v22d wiring');
console.log(`Chapter 3 Security readability v22d PASS (${live?'LIVE':'STAGED'}${v23?'→V23':''}${v23b?'→V23B':''}${v24?'→V24':''}): Security readability, navigation/story invariants, local-only media, and ordered loader feed-forward all survive.`);
