import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const PARTS=['bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt','bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt','bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'];
const PATCHES=[['patches/worldprops-v1.js.txt','applyWorldPropsV1'],['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],['patches/store-polish-v2.js.txt','applyStorePolishV2'],['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],['patches/reliability-v4.js.txt','applyReliabilityV4'],['patches/status-lights-v5.js.txt','applyStatusLightsV5'],['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']];
const TAIL=[['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']];
const fail=msg=>{throw new Error('Chapter 3 Security readability v22c audit failed: '+msg);};
function normalizeImports(source){return source.replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';").replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';").replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';").replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8'),context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const s=source.indexOf('async function buildFoodCourt(world){'),e=source.indexOf('async function buildMusic(world){',s);if(s<0||e<0)fail('Food Court markers missing');return source.slice(0,s)+replacement.trim()+'\n\n'+source.slice(e);}
async function loadStoryData(){const paths=['story/characters.js','story/evidence.js','story/chapters.js','story/timeline.js','story/dialogue.js'];let code='';for(const path of paths)code+=(await readFile(path,'utf8')).replace(/export const /g,'const ')+'\n';code+=(await readFile('story/story-data.js','utf8')).replace(/^import .*$/gm,'').replace(/export const /g,'const ')+'\nthis.__story=STORY_DATA_V17;';const context=vm.createContext({});vm.runInContext(code,context);return JSON.parse(JSON.stringify(context.__story));}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v22c-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source);const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||'');fail('assembled v22c runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}

const prior=spawnSync(process.execPath,['scripts/audit-chapter3-east-wing-handoff-v22b.mjs'],{encoding:'utf8'});
if(prior.status!==0){process.stderr.write(prior.stdout||'');process.stderr.write(prior.stderr||'');fail('v22b prerequisite audit failed');}

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
source=(await loadPatch('patches/chapter3-security-readability-v22c.js.txt','applyChapter3SecurityReadabilityV22C'))(source);

for(const marker of [
  'function addSecurityReadabilityV22C(world)',"chapter3LightV22C='cctv'","chapter3LightV22C='west-shutter'","chapter3LightV22C='east-shutter'","chapter3LightV22C='secondary-security'","chapter3LightV22C='east-wing-exit'","chapter3LightV22C='route-guide'","chapter3Setpiece='east-wing-sign-v22c'","readabilityLighting:true","addSecurityReadabilityV22C(world)","emissiveIntensity:.76,roughness:.29"
])if(!source.includes(marker))fail('assembled runtime missing readability marker: '+marker);
const helper=source.slice(source.indexOf('function addSecurityReadabilityV22C'),source.indexOf('window.__PINEWOOD_CH3_V22__',source.indexOf('function addSecurityReadabilityV22C')));
const pointLights=(helper.match(/new THREE\.PointLight/g)||[]).length;if(pointLights<7)fail('readability helper must provide localized CCTV/shutter/Luis/exit lighting, found '+pointLights+' PointLights');
if(!helper.includes("securityLabelTextureV22('EAST WING','EMPLOYEE ACCESS')"))fail('East Wing exit lacks readable local sign treatment');
if(!source.includes('eastWingHandoff:true')||!source.includes('completeSecurityV22(){'))fail('readability pass regressed East Wing handoff');
if(!source.includes('securityFeedStatusV22(game,feed)')||!source.includes("securityRouteV22='west'")||!source.includes("securityRouteV22='east'"))fail('readability pass regressed Security systems');
if(source.includes('voiceImitation:true'))fail('readability pass introduced voice imitation early');
for(const forbidden of ['speechSynthesis','SpeechSynthesisUtterance','https://api.elevenlabs','https://api.openai.com','https://translate.google'])if(source.includes(forbidden))fail('runtime speech/network path survived: '+forbidden);
const externalMedia=(source.match(/https:\/\/[^'"`\\s)]+\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#][^'"`\\s)]*)?/gi)||[]);if(externalMedia.length)fail('external runtime media survived: '+[...new Set(externalMedia)].join(', '));
await syntaxCheck(source);

const loader=await readFile('game.js','utf8');
const live=loader.includes("const CHAPTER3_V22C_PATCH='./patches/chapter3-security-readability-v22c.js.txt';");
if(live){for(const marker of ['async function applyChapter3SecurityReadabilityV22CRuntime(source,patchText)','getText(CHAPTER3_V22C_PATCH)','const chapter3V22CSource=await applyChapter3SecurityReadabilityV22CRuntime(chapter3V22BSource,chapter3V22CPatch);',"const source=chapter3V22CSource+'\\n//# sourceURL=pinewood-runtime.js\\n';"])if(!loader.includes(marker))fail('game.js partial/incorrect live v22c marker: '+marker);}
else if(loader.includes('applyChapter3SecurityReadabilityV22CRuntime')||loader.includes('chapter3V22CSource'))fail('game.js contains partial v22c wiring');

console.log(`Chapter 3 Security readability v22c PASS (${live?'LIVE':'STAGED'}): localized readable lighting now covers CCTV, both route shutters, Luis secondary Security and the East Wing exit; the CCTV screens and exit sign are legible; v22/v22b gameplay, story, local-runtime and no-early-imitation invariants survive.`);
