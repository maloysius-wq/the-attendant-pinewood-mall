import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
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
  ['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9'],
  ['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],
  ['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],
  ['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],
  ['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],
  ['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']
];
function normalizeImports(source){return source
  .replace(/import \{ GLTFLoader \} from ['"][^'"]*\/GLTFLoader\.js['"];?/,"import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
  .replace(/import \{ EffectComposer \} from ['"][^'"]*\/EffectComposer\.js['"];?/,"import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
  .replace(/import \{ RenderPass \} from ['"][^'"]*\/RenderPass\.js['"];?/,"import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
  .replace(/import \{ UnrealBloomPass \} from ['"][^'"]*\/UnrealBloomPass\.js['"];?/,"import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function patch(source,path,name,...args){
  const text=await readFile(path,'utf8'),context=vm.createContext({console});
  vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});
  if(typeof context.__patch!=='function')throw new Error(`${path} missing ${name}`);
  return context.__patch(source,...args);
}
function replaceFoodCourt(source,replacement){const a=source.indexOf('async function buildFoodCourt(world){'),b=source.indexOf('async function buildMusic(world){',a);if(a<0||b<0)throw new Error('Food Court markers missing');return source.slice(0,a)+replacement.trim()+'\n\n'+source.slice(b);}
const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(t=>t.trim()).join('');
let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [path,name] of PATCHES.slice(0,9))source=await patch(source,path,name);
source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
for(const [path,name] of PATCHES.slice(9))source=await patch(source,path,name);
const manifest=JSON.parse(await readFile('assets/vendor/runtime/manifest.json','utf8'));
source=await patch(source,'patches/local-assets-v15.js.txt','applyLocalAssetsV15',manifest);
source=await patch(source,'patches/retail-geometry-v16.js.txt','applyRetailGeometryV16');
const start=source.indexOf('async function buildArcade(world){'),end=source.indexOf('\nasync function buildVHS(world){',start);
if(start<0||end<0)throw new Error('Sunburst Arcade builder markers missing');
const arcade=source.slice(start,end);
await mkdir('diagnostics',{recursive:true});
await writeFile('diagnostics/arcade-current-source.txt',arcade);
console.log('Wrote diagnostics/arcade-current-source.txt ('+arcade.length+' chars).');
