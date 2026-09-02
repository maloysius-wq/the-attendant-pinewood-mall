import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
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
const MEDIA_EXT_RE=/\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#].*)?$/i;
function fail(msg){throw new Error('Local Assets v15 audit failed: '+msg);}
function sha256(bytes){return createHash('sha256').update(bytes).digest('hex');}
function gitBlobSha1(bytes){return createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');}
function normalizeImports(source){return source
  .replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
  .replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
  .replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
  .replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8');const context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const start=source.indexOf('async function buildFoodCourt(world){'),end=source.indexOf('async function buildMusic(world){',start);if(start<0||end<0)fail('Food Court markers missing');return source.slice(0,start)+replacement.trim()+'\n\n'+source.slice(end);}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-local-v15-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source,'utf8');const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stdout||'');process.stderr.write(r.stderr||'');fail('final localized runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}

const manifest=JSON.parse(await readFile('assets/vendor/runtime/manifest.json','utf8'));
if(manifest.version!==15)fail('manifest version is not 15');
const entries=Object.entries(manifest.assets||{});
if(entries.length<50)fail(`manifest unexpectedly small: ${entries.length} top-level assets`);
for(const [remote,entry] of entries){
  if(!entry.local?.startsWith('./assets/vendor/runtime/'))fail('invalid local top-level path for '+remote);
  const topPath=entry.local.replace(/^\.\//,'');
  const topBytes=await readFile(topPath);
  if(sha256(topBytes)!==entry.sha256)fail('hash mismatch for '+topPath);
  for(const dep of entry.dependencies||[]){
    const clean=decodeURIComponent(dep.uri.split('#')[0].split('?')[0]).replace(/\\/g,'/');
    const depPath=resolve(dirname(topPath),clean),root=resolve(dirname(topPath));
    if(depPath!==root&&!depPath.startsWith(root+'/'))fail('dependency escapes vendored asset directory: '+dep.uri);
    const depBytes=await readFile(depPath);
    if(sha256(depBytes)!==dep.sha256)fail('dependency hash mismatch for '+depPath);
  }
}
for(const file of [
  'vendor/three/build/three.module.js',
  'vendor/three/build/three.core.js',
  'vendor/three/examples/jsm/loaders/GLTFLoader.js',
  'vendor/three/examples/jsm/postprocessing/EffectComposer.js',
  'vendor/three/examples/jsm/postprocessing/RenderPass.js',
  'vendor/three/examples/jsm/postprocessing/UnrealBloomPass.js',
  'vendor/pako/pako.esm.mjs'
]){const b=await readFile(file);if(!b.length)fail('vendored browser library missing/empty: '+file);}
const threeModule=await readFile('vendor/three/build/three.module.js','utf8');
if(!threeModule.includes("from './three.core.js'"))fail('Three.js r180 module no longer declares expected local three.core.js dependency');
const threeCore=await readFile('vendor/three/build/three.core.js');
if(gitBlobSha1(threeCore)!=='7dcd0fbcbc04b8d9a20ecb96c1ce344cb55150d5')fail('vendored Three.js r180 core blob identity mismatch');

const loader=await readFile('game.js','utf8'),index=await readFile('index.html','utf8');
for(const marker of [
  "const LOCAL_ASSETS_PATCH='./patches/local-assets-v15.js.txt';",
  "const LOCAL_ASSETS_MANIFEST='./assets/vendor/runtime/manifest.json';",
  "import('./vendor/pako/pako.esm.mjs')",
  'applyLocalAssetsV15Runtime(cassetteV14Source,localAssetsPatch,localAssetsManifest)',
  'const source=storyV17Source+'
])if(!loader.includes(marker))fail('game.js local-v15 marker missing: '+marker);
for(const forbidden of ['cdn.jsdelivr.net/npm/pako','unpkg.com/three@','cdn.jsdelivr.net/npm/three@'])if(loader.includes(forbidden))fail('game.js still contains remote browser dependency: '+forbidden);
if(!index.includes('"three":"./vendor/three/build/three.module.js"')||!index.includes('"three/addons/":"./vendor/three/examples/jsm/"'))fail('index local Three.js import map missing');
for(const forbidden of ['unpkg.com/three@','cdn.jsdelivr.net/npm/three@'])if(index.includes(forbidden))fail('index still contains remote Three.js dependency: '+forbidden);

const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(t=>t.trim()).join('');
let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [path,name] of PATCHES)source=(await loadPatch(path,name))(source);
source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
for(const [path,name] of TAIL_PATCHES)source=(await loadPatch(path,name))(source);
const localPatch=await loadPatch('patches/local-assets-v15.js.txt','applyLocalAssetsV15');
source=localPatch(source,manifest);

const surviving=(source.match(/https:\/\/[^'"`\\s)]+/g)||[]).filter(u=>MEDIA_EXT_RE.test(u));
if(surviving.length)fail('external runtime media URLs survived: '+[...new Set(surviving)].join(', '));
const modelStart=source.indexOf('const MODEL_URLS={'),modelEnd=source.indexOf('\n};',modelStart);
if(modelStart<0||modelEnd<0)fail('MODEL_URLS section missing');
if(source.slice(modelStart,modelEnd).includes('https://'))fail('MODEL_URLS still contains remote URL');
const texStart=source.indexOf('const TEXTURE_SETS={'),texEnd=source.indexOf('\n};',texStart);
if(texStart<0||texEnd<0)fail('TEXTURE_SETS section missing');
if(source.slice(texStart,texEnd).includes('https://'))fail('TEXTURE_SETS still contains remote URL');
if(source.includes("FOUNTAIN_PH_BASE+'/'+assetId"))fail('old dynamic remote fountain texture loader survived');
if(!source.includes('FOUNTAIN_LOCAL_PBR='))fail('localized fountain PBR map missing');
if(!source.includes('./assets/vendor/runtime/'))fail('localized runtime paths missing');
for(const protectedMarker of [
  "assetModel:'kenney-imported-freight-elevator-v2'",'physicalBlock:false','footprintRadius:1.64',
  "tag:'perimeter-rack-v14'",'inCassetteCastle?.62:1',"gain=(sprint?.14:.09)",
  'window.__PINEWOOD_VISUAL_READY__=true'
])if(!source.includes(protectedMarker))fail('protected pre-v15 runtime marker missing: '+protectedMarker);
await syntaxCheck(source);
console.log(`Local Assets v15 PASS: ${entries.length} top-level assets plus dependencies are present and hash-verified; Three.js/Pako are local including the exact pinned Three.js r180 core dependency; final runtime model, PBR, music and authored asset loads contain no external media URL; protected v14/elevator/fountain/audio invariants survive; syntax is valid.`);
