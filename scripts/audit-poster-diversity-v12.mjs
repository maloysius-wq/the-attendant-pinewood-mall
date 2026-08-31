import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const PARTS=[
  'bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt',
  'bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt',
  'bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'
];
const PATCHES=[
  ['patches/worldprops-v1.js.txt','applyWorldPropsV1'],
  ['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],
  ['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],
  ['patches/store-polish-v2.js.txt','applyStorePolishV2'],
  ['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],
  ['patches/reliability-v4.js.txt','applyReliabilityV4'],
  ['patches/status-lights-v5.js.txt','applyStatusLightsV5'],
  ['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],
  ['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],
  ['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],
  ['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']
];
const TAIL_PATCHES=[
  ['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],
  ['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],
  ['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12']
];
function fail(msg){throw new Error('Poster Diversity v12 audit failed: '+msg);}
function normalizeImports(source){return source
  .replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
  .replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
  .replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
  .replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8');const context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const start=source.indexOf('async function buildFoodCourt(world){'),end=source.indexOf('async function buildMusic(world){',start);if(start<0||end<0)fail('Food Court markers missing');return source.slice(0,start)+replacement.trim()+'\n\n'+source.slice(end);}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v12-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source,'utf8');const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||'');fail('final runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}
function section(source,a,b,label){const s=source.indexOf(a),e=source.indexOf(b,s+a.length);if(s<0||e<0)fail(label+' section missing');return source.slice(s,e);}

const loader=await readFile('game.js','utf8');
for(const marker of [
  "const POSTER_DIVERSITY_PATCH='./patches/poster-diversity-v12.js.txt';",
  'const posterDiversitySource=await applyPosterDiversity(footstepSource,posterDiversityPatch);',
  'const cassetteV13Source=await applyCassetteCastleV13(posterDiversitySource,cassetteV13Patch);'
])if(!loader.includes(marker))fail('game.js marker missing: '+marker);

const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(t=>t.trim()).join('');
let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [path,name] of PATCHES)source=(await loadPatch(path,name))(source);
source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
for(const [path,name] of TAIL_PATCHES)source=(await loadPatch(path,name))(source);

for(const marker of [
  "posterDesign=variant===0?'v10-hero'",'v12-alt-a','v12-alt-b',
  'function drawArcadeTokenPoster(','function drawArcadePrizePoster(',
  'function drawVideoMidnightPoster(','function drawVideoDealPoster(',
  'function drawFoodPolarPoster(','function drawFoodWokPoster(',
  'function drawMusicListenPoster(','function drawMusicChartPoster(',
  "gain=(sprint?.14:.09)"
])if(!source.includes(marker))fail('final runtime marker missing: '+marker);

const sets=[
  ['Sunburst Arcade','async function buildArcade(world){','async function buildVHS(world){',['GALAXY STRIKE','TOKEN FRENZY','PRIZE VAULT']],
  ['Video Planet','async function buildVHS(world){','async function buildFoodCourt(world){',['BE KIND • REWIND','MIDNIGHT RENTALS','2 NIGHTS • 1 PRICE']],
  ['Food Court','async function buildFoodCourt(world){','async function buildMusic(world){',['SLICE CITY','POLAR POP','WOK THIS WAY']],
  ['Cassette Castle','async function buildMusic(world){','\n\nfunction makeShutter(',['NEW WAVE','LISTEN BEFORE YOU BUY','PINEWOOD TOP 40']]
];
for(const [label,a,b,campaigns] of sets){const s=section(source,a,b,label);for(const campaign of campaigns)if(!s.includes(campaign))fail(`${label} missing ${campaign}`);for(const variant of [',0)',',1)',',2)'])if(!s.includes(variant))fail(`${label} missing poster variant ${variant}`);}

if(source.includes('function makePoster('))fail('retired generic poster renderer returned');
await syntaxCheck(source);
console.log('Poster Diversity v12 PASS: all four stores retain one v10 hero design and use two unique v12 alternate poster systems; v13 follows v12 in the loader; v12 runtime syntax is valid.');
