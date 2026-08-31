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
function fail(msg){throw new Error('Retail Geometry v16 audit failed: '+msg);}
function normalizeImports(source){return source
  .replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
  .replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
  .replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
  .replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8');const context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const start=source.indexOf('async function buildFoodCourt(world){'),end=source.indexOf('async function buildMusic(world){',start);if(start<0||end<0)fail('Food Court markers missing');return source.slice(0,start)+replacement.trim()+'\n\n'+source.slice(end);}
function section(source,a,b,label){const s=source.indexOf(a),e=source.indexOf(b,s+a.length);if(s<0||e<0)fail(label+' section missing');return source.slice(s,e);}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v16-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source,'utf8');const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stdout||'');process.stderr.write(r.stderr||'');fail('final runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}

const loader=await readFile('game.js','utf8');
for(const marker of [
  "const RETAIL_V16_PATCH='./patches/retail-geometry-v16.js.txt';",
  'applyRetailGeometryV16Runtime(source,patchText)',
  'const retailV16Source=await applyRetailGeometryV16Runtime(localAssetsV15Source,retailV16Patch);',
  'const source=retailV16Source+'
])if(!loader.includes(marker))fail('game.js v16 marker missing: '+marker);

const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(t=>t.trim()).join('');
let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [path,name] of PATCHES)source=(await loadPatch(path,name))(source);
source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
for(const [path,name] of TAIL_PATCHES)source=(await loadPatch(path,name))(source);
const manifest=JSON.parse(await readFile('assets/vendor/runtime/manifest.json','utf8'));
source=(await loadPatch('patches/local-assets-v15.js.txt','applyLocalAssetsV15'))(source,manifest);
source=(await loadPatch('patches/retail-geometry-v16.js.txt','applyRetailGeometryV16'))(source);

const stock=section(source,'async function stockCassetteFixture(','\nasync function addCassetteFullRack(','cassette stock');
for(const marker of ['cassette-case-stock-v16','cassette-case-spines-v16','organized-case-stock-v16','new THREE.InstancedMesh','cassetteShelfLevels(fixture,rows)'])if(!stock.includes(marker))fail('organized cassette-case marker missing: '+marker);
if(stock.includes('getCassetteTapeTemplate()')||stock.includes('addAnchoredCassette('))fail('loose tape component still used as shelf stock');

const fullRack=section(source,'async function addCassetteFullRack(','\nasync function addCassetteDoubleRackBay(','full cassette rack');
if(!fullRack.includes('blackenCassetteFixtureV16(placed.obj)'))fail('full racks are not forced to matte black');
const lowRack=section(source,'async function addCassetteLowFixtureV14(','\nasync function buildCassetteListeningBarV14(','low cassette rack');
if(!lowRack.includes('blackenCassetteFixtureV16(placed.obj)')||!lowRack.includes("tag:'low-merch-fixture-v16'"))fail('low fixtures are not matte-black v16 fixtures');

const finish=section(source,'function addCassetteStoreFinishV14(world){','\nasync function addCassetteLowFixtureV14(','Cassette Castle finish');
for(const marker of ['store-finish-v16','wallOverlayRemoved=true','new THREE.PlaneGeometry(16.55,11.45)'])if(!finish.includes(marker))fail('v16 finish marker missing: '+marker);
for(const forbidden of ['const wallMat=','panel(','rail(','PlaneGeometry(w,h),wallMat'])if(finish.includes(forbidden))fail('half-height wall overlay survived: '+forbidden);
if(finish.includes('addCollider'))fail('visual-only finish must not modify collision/navigation');

const arcade=section(source,'async function buildArcade(world){','\nasync function buildVHS(world){','Arcade');
if(!arcade.includes("makeSharedRetailCheckoutV16(world,-14.1,-29,0,'arcadeCash'"))fail('Arcade is not using shared restaurant-style checkout');
if(arcade.includes("placeModel(world.root,'counterDesk'"))fail('Arcade legacy desk checkout survived');
const video=section(source,'async function buildVHS(world){','\nasync function buildFoodCourt(world){','Video Planet');
if(!video.includes("makeSharedRetailCheckoutV16(world,12.3,-20.7,-.08,'marketCash'"))fail('Video Planet is not using shared restaurant-style checkout');
if(video.includes("placeModel(world.root,'counterDesk'"))fail('Video Planet legacy desk checkout survived');
const checkout=section(source,'async function buildCassetteCheckoutV14(world){','\nasync function makeSharedRetailCheckoutV16(','Cassette checkout');
if(!checkout.includes("makeSharedRetailCheckoutV16(world,13.40,28.72,0,'arcadeCash'"))fail('Cassette Castle is not using shared restaurant-style checkout');
if(source.includes("placeCassetteGrounded(world.root,'cassetteServiceCounter',new THREE.Vector3(12.05,0,28.72)"))fail('Cassette legacy KSI checkout survived');

const elevator=section(source,"function makeExitElevator(pos,face='west'){",'\n\nasync function decorateLevel','elevator');
for(const marker of [
  'left.position.set(0,0,closedL);right.position.set(0,0,closedR)',
  "new THREE.Vector3(.09,2.80,.92),new THREE.Vector3(0,1.40,0)",
  "new THREE.Vector3(2.10,.085,1.88),new THREE.Vector3(1.12,2.80,0)",
  "new THREE.Vector3(.10,2.76,1.88),new THREE.Vector3(2.17,1.38,0)"
])if(!elevator.includes(marker))fail('elevator centering/full-height marker missing: '+marker);
if(!source.includes("'elevator-front':{p:[23.55,1.70,0],yaw:-Math.PI/2,pitch:-.02}"))fail('elevator deterministic visual view missing');

for(const protectedMarker of [
  'physicalBlock:false','footprintRadius:1.64',"gain=(sprint?.14:.09)","tag:'perimeter-rack-v14'",'inCassetteCastle?.62:1','window.__PINEWOOD_VISUAL_READY__=true'
])if(!source.includes(protectedMarker))fail('protected earlier-system marker missing: '+protectedMarker);
const externalMedia=(source.match(/https:\/\/[^'"`\\s)]+\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#][^'"`\\s)]*)?/gi)||[]);
if(externalMedia.length)fail('external runtime media URL survived v16: '+[...new Set(externalMedia)].join(', '));
await syntaxCheck(source);
console.log('Retail Geometry v16 PASS: cassette stock is organized upright in cases, full/low cassette fixtures are matte black, Cassette wall overlays no longer cover posters, all retail checkouts use the Food Court counter design, the elevator facade/leaves are centered and full-height, protected navigation/audio/local-assets invariants survive, and final runtime syntax is valid.');
