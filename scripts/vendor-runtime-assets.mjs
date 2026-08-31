import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { dirname, join, resolve, basename } from 'node:path';
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

const OUTPUT_ROOT='assets/vendor/runtime';
const MEDIA_URL_RE=/https:\/\/[^'"`\s)]+/g;
const MEDIA_EXT_RE=/\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#].*)?$/i;

// Development-time source repairs belong here when a historically pinned runtime URL has gone stale.
// The original URL remains the manifest key so the local-assets patch can replace the exact runtime literal.
const SOURCE_OVERRIDES={};

function normalizeImports(source){return source
  .replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
  .replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
  .replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
  .replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}

async function loadPatch(path,name){
  const text=await readFile(path,'utf8');
  const context=vm.createContext({console});
  vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});
  if(typeof context.__patch!=='function')throw new Error(`${path} missing ${name}`);
  return context.__patch;
}
function replaceFoodCourt(source,replacement){
  const start=source.indexOf('async function buildFoodCourt(world){');
  const end=source.indexOf('async function buildMusic(world){',start);
  if(start<0||end<0)throw new Error('Food Court markers missing while reconstructing runtime');
  return source.slice(0,start)+replacement.trim()+'\n\n'+source.slice(end);
}
async function reconstructV14(){
  const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(t=>t.trim()).join('');
  let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
  for(const [path,name] of PATCHES)source=(await loadPatch(path,name))(source);
  source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
  for(const [path,name] of TAIL_PATCHES)source=(await loadPatch(path,name))(source);
  return source;
}

function sha256(bytes){return createHash('sha256').update(bytes).digest('hex');}
function shortHash(text){return createHash('sha256').update(text).digest('hex').slice(0,16);}
function safeName(url){
  let name;
  try{name=decodeURIComponent(basename(new URL(url).pathname));}catch{name='asset';}
  name=name.replace(/[^A-Za-z0-9._-]+/g,'_');
  return name||'asset';
}
function stripFragment(url){const u=new URL(url);u.hash='';return u.href;}

async function fetchBytes(url){
  let last;
  for(let attempt=1;attempt<=4;attempt++){
    try{
      const r=await fetch(url,{headers:{'user-agent':'pinewood-vendor-assets/1.0','accept':'*/*'}});
      if(r.ok)return Buffer.from(await r.arrayBuffer());
      const e=new Error(`HTTP ${r.status} ${r.statusText}`);e.status=r.status;throw e;
    }catch(err){
      last=err;
      if(err?.status===404||err?.status===410)break;
      if(attempt<4)await new Promise(r=>setTimeout(r,attempt*1200));
    }
  }
  throw new Error(`download failed: ${url} (${last?.message||last})`);
}

function externalUrisFromGltfJson(json){
  const out=[];
  for(const item of [...(json.buffers||[]),...(json.images||[])]){
    const uri=item?.uri;
    if(typeof uri==='string'&&!uri.startsWith('data:'))out.push(uri);
  }
  return [...new Set(out)];
}
function parseGlbExternalUris(bytes){
  if(bytes.length<20||bytes.readUInt32LE(0)!==0x46546c67)return [];
  let off=12;
  while(off+8<=bytes.length){
    const len=bytes.readUInt32LE(off),type=bytes.readUInt32LE(off+4);off+=8;
    if(type===0x4e4f534a){
      const text=bytes.subarray(off,off+len).toString('utf8').replace(/\u0000+$/,'').trim();
      return externalUrisFromGltfJson(JSON.parse(text));
    }
    off+=len;
  }
  return [];
}
function relativeDependencyTarget(assetDir,uri){
  const clean=decodeURIComponent(uri.split('#')[0].split('?')[0]).replace(/\\/g,'/');
  if(/^https?:\/\//i.test(clean))return null;
  const target=resolve(assetDir,clean);
  const root=resolve(assetDir);
  if(target!==root&&!target.startsWith(root+'/'))throw new Error(`dependency escapes asset directory: ${uri}`);
  return target;
}

async function vendorOne(originalUrl){
  const sourceUrl=stripFragment(SOURCE_OVERRIDES[originalUrl]||originalUrl);
  const assetDir=join(OUTPUT_ROOT,shortHash(originalUrl));
  const topName=safeName(sourceUrl);
  const topPath=join(assetDir,topName);
  await mkdir(assetDir,{recursive:true});
  const bytes=await fetchBytes(sourceUrl);
  await writeFile(topPath,bytes);
  const dependencies=[];
  let uris=[];
  if(/\.gltf(?:[?#].*)?$/i.test(sourceUrl)){
    const json=JSON.parse(bytes.toString('utf8'));
    uris=externalUrisFromGltfJson(json);
  }else if(/\.glb(?:[?#].*)?$/i.test(sourceUrl)){
    uris=parseGlbExternalUris(bytes);
  }
  for(const uri of uris){
    if(/^https?:\/\//i.test(uri))throw new Error(`absolute GLTF/GLB dependency requires explicit localization: ${sourceUrl} -> ${uri}`);
    const depUrl=new URL(uri,sourceUrl).href;
    const target=relativeDependencyTarget(assetDir,uri);
    await mkdir(dirname(target),{recursive:true});
    const depBytes=await fetchBytes(depUrl);
    await writeFile(target,depBytes);
    dependencies.push({uri,source:depUrl,local:'./'+target.replace(/\\/g,'/'),sha256:sha256(depBytes),bytes:depBytes.length});
  }
  return {
    source:originalUrl,
    fetchedFrom:sourceUrl,
    local:'./'+topPath.replace(/\\/g,'/'),
    sha256:sha256(bytes),
    bytes:bytes.length,
    dependencies
  };
}

const source=await reconstructV14();
const allUrls=[...new Set(source.match(MEDIA_URL_RE)||[])].filter(u=>MEDIA_EXT_RE.test(u)).sort();
console.log(`Pinewood runtime v14 external media inventory: ${allUrls.length} top-level URL(s)`);
for(const u of allUrls)console.log('  '+u);

await rm(OUTPUT_ROOT,{recursive:true,force:true});
await mkdir(OUTPUT_ROOT,{recursive:true});
const entries=[];
const failures=[];
for(const url of allUrls){
  try{
    const entry=await vendorOne(url);entries.push(entry);
    console.log(`vendored ${url} -> ${entry.local} (${entry.bytes} bytes, ${entry.dependencies.length} dependency file(s))`);
  }catch(err){
    failures.push({url,error:String(err?.message||err)});
    console.error(`FAILED ${url}: ${err?.message||err}`);
  }
}
if(failures.length){
  await writeFile(join(OUTPUT_ROOT,'FAILED.json'),JSON.stringify(failures,null,2)+'\n');
  throw new Error(`${failures.length} runtime asset(s) could not be vendored; see failures above`);
}
const manifest={
  version:15,
  generatedFrom:'assembled-v14-runtime',
  policy:'All runtime media is served locally. Source URLs are provenance/development-time inputs only.',
  assets:Object.fromEntries(entries.map(e=>[e.source,{local:e.local,sha256:e.sha256,bytes:e.bytes,fetchedFrom:e.fetchedFrom,dependencies:e.dependencies}]))
};
await writeFile(join(OUTPUT_ROOT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Vendoring complete: ${entries.length} top-level assets, ${entries.reduce((n,e)=>n+e.dependencies.length,0)} dependency files.`);
