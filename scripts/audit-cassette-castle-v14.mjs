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
  ['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],
  ['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],
  ['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']
];
function fail(msg){throw new Error('Cassette Castle v14 audit failed: '+msg);}
function normalizeImports(source){return source
  .replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
  .replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
  .replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
  .replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8');const context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const start=source.indexOf('async function buildFoodCourt(world){'),end=source.indexOf('async function buildMusic(world){',start);if(start<0||end<0)fail('Food Court markers missing');return source.slice(0,start)+replacement.trim()+'\n\n'+source.slice(end);}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v14-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source,'utf8');const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stdout||'');process.stderr.write(r.stderr||'');fail('final runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}
function section(source,a,b,label){const s=source.indexOf(a),e=source.indexOf(b,s+a.length);if(s<0||e<0)fail(label+' section missing');return source.slice(s,e);}

const loader=await readFile('game.js','utf8');
for(const marker of [
  "const CASSETTE_V13_PATCH='./patches/cassette-castle-rebuild-v13.js.txt';",
  "const CASSETTE_V14_PATCH='./patches/cassette-castle-rebuild-v14.js.txt';",
  'const cassetteV13Source=await applyCassetteCastleV13(posterDiversitySource,cassetteV13Patch);',
  'const cassetteV14Source=await applyCassetteCastleV14(cassetteV13Source,cassetteV14Patch);',
  "const LOCAL_ASSETS_PATCH='./patches/local-assets-v15.js.txt';",
  'const localAssetsV15Source=await applyLocalAssetsV15Runtime(cassetteV14Source,localAssetsPatch,localAssetsManifest);',
  "const source=storyV17Source+"
])if(!loader.includes(marker))fail('game.js marker missing: '+marker);

const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(t=>t.trim()).join('');
let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [path,name] of PATCHES)source=(await loadPatch(path,name))(source);
source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
for(const [path,name] of TAIL_PATCHES)source=(await loadPatch(path,name))(source);

for(const banned of [
  'cassetteShelfLarge','cassetteShelfSmall','Shelf%20Large.glb','Shelf%20Small.glb','Shelf Large.glb','Shelf Small.glb',
  'async function stockRealCassetteFixture(','async function addCassetteDisplayFixture(','async function dressCassetteListeningTable(','async function placeCassetteCc0('
])if(source.includes(banned))fail('banned or retired Cassette Castle marker survived: '+banned);

for(const marker of [
  "cassetteShelfLow:`https://raw.githubusercontent.com/RetroDECK/RetroQUEST/dfa19a5602a31f64bd890d15279a61f43b127328/assets/kenney_furniture-kit/Models/GLTF%20format/bookcaseOpenLow.glb`",
  "cassetteServiceCounter:`https://raw.githubusercontent.com/vinhelysia/godot-fps-cogito/1268440e90e370db6c3351ec4cd7429f3ca278b3/addons/cogito/Assets/Models/Kenney/SpaceInterior/GLTF%20format/KSI_counter.glb`",
  'function addCassetteStoreFinishV14(','async function addCassetteLowFixtureV14(','async function buildCassetteListeningBarV14(','async function buildCassetteCheckoutV14(',
  'poly-haven-cassette-tape-stock-v13','cassetteGrounded=true','cassetteSupported=true',
  'inCassetteCastle?.62:1',"gain=(sprint?.14:.09)",
  "posterDesign=variant===0?'v10-hero'",'v12-alt-a','v12-alt-b',
  "assetModel:'kenney-imported-freight-elevator-v2'",'physicalBlock:false','eu.navExclusion=world.addCollider',
  "assetModel:'kenney-city-builder-pavement-fountain'",'footprintRadius:1.64',
  'window.__PINEWOOD_VISUAL_READY__=true'
])if(!source.includes(marker))fail('final runtime marker missing: '+marker);

const music=section(source,'async function buildMusic(world){','\n\nfunction makeShutter(','Cassette Castle');
for(const marker of [
  'addCassetteStoreFinishV14(world)','addCassetteFullRack(world','addCassetteLowFixtureV14(world,x,z,r)','buildCassetteListeningBarV14(world)','buildCassetteCheckoutV14(world)',
  "makeMarketingPoster('music','NEW WAVE'","makeMarketingPoster('music','LISTEN BEFORE YOU BUY'","makeMarketingPoster('music','PINEWOOD TOP 40'",
  '[11.52,22.55,Math.PI/2]','[16.25,30.48,Math.PI]','[15.35,23.75,0]','[17.35,27.10,Math.PI/2]','25.85,0,30.25'
])if(!music.includes(marker))fail('Cassette Castle v14 layout marker missing: '+marker);
for(const forbidden of [
  'addCassetteDoubleRackBay(world','dressGroundedListeningStation(world','buildGroundedCheckout(world)',
  'cassetteShelfLarge','cassetteShelfSmall','stockRealCassetteFixture','addCassetteDisplayFixture','dressCassetteListeningTable',"'marketShelfEnd'",'fallbackCassette','new THREE.TorusGeometry'
])if(music.includes(forbidden))fail('retired/cramped Cassette Castle layout marker returned: '+forbidden);

const finish=section(source,'function addCassetteStoreFinishV14(world){','async function addCassetteLowFixtureV14(','Cassette Castle finish');
for(const marker of ['new THREE.PlaneGeometry(16.55,11.45)','visualOnly=true','0x18232b','0x9a713d'])if(!finish.includes(marker))fail('store finish marker missing: '+marker);
if(finish.includes('addCollider'))fail('visual store finish must never modify collision or navigation');

if(source.includes('function makePoster('))fail('retired generic poster renderer returned');
await syntaxCheck(source);
console.log('Cassette Castle v14 PASS: final runtime syntax is valid; the center maze is gone; low Kenney fixtures, the CC0 Kenney service/listening counters, grounded real cassette stock, localized quieter ambience, visual-only store finishes, v12 poster diversity, v11 footstep mix, elevator invariants, and fountain invariants all survive.');
