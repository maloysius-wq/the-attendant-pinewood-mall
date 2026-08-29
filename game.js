// Deployment loader for The Attendant: Pinewood Mall.
// Runtime bundle stays immutable; authored room and world-prop overrides live in /patches.
const PARTS=[
  './bundle2/part-01.txt','./bundle2/part-02.txt','./bundle2/part-03.txt',
  './bundle2/p4-1.txt','./bundle2/p4-2.txt','./bundle2/p4-3.txt','./bundle2/p4-4.txt','./bundle2/p4-5.txt',
  './bundle2/p5-1.txt','./bundle2/p5-2.txt','./bundle2/p5-3.txt','./bundle2/p5-4.txt','./bundle2/p5-5.txt'
];
const WORLD_PATCH='./patches/worldprops-v1.js.txt';
const INDUSTRIAL_PATCH='./patches/industrial-cc0-v1.js.txt';
const VISUAL_FIX_PATCH='./patches/visual-fixes-v1.js.txt';
const FOOD_PATCH='./patches/foodcourt-v3.js.txt';

async function getText(url){
  const r=await fetch(url,{cache:'no-store'});
  if(!r.ok)throw new Error(`Failed to load ${url}: HTTP ${r.status}`);
  return await r.text();
}

async function decodeSource(){
  const payload=(await Promise.all(PARTS.map(getText))).map(s=>s.trim()).join('');
  const bytes=Uint8Array.from(atob(payload),c=>c.charCodeAt(0));
  if('DecompressionStream' in window){
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  }
  const {ungzip}=await import('https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm');
  return new TextDecoder().decode(ungzip(bytes));
}

function normalizeImports(source){
  return source
    .replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
    .replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
    .replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
    .replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");
}

async function applyWorldProps(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyWorldPropsV1 };\n'],{type:'text/javascript'}));
  try{
    const mod=await import(patchUrl);
    if(typeof mod.applyWorldPropsV1!=='function')throw new Error('World Props v1 patch did not export its patch function.');
    return mod.applyWorldPropsV1(source);
  }finally{URL.revokeObjectURL(patchUrl);}
}

async function applyIndustrialCc0(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyIndustrialCc0V1 };\n'],{type:'text/javascript'}));
  try{
    const mod=await import(patchUrl);
    if(typeof mod.applyIndustrialCc0V1!=='function')throw new Error('Industrial CC0 v1 patch did not export its patch function.');
    return mod.applyIndustrialCc0V1(source);
  }finally{URL.revokeObjectURL(patchUrl);}
}

async function applyVisualFixes(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyVisualFixesV1 };\n'],{type:'text/javascript'}));
  try{
    const mod=await import(patchUrl);
    if(typeof mod.applyVisualFixesV1!=='function')throw new Error('Visual Fixes v1 patch did not export its patch function.');
    return mod.applyVisualFixesV1(source);
  }finally{URL.revokeObjectURL(patchUrl);}
}

function replaceFoodCourt(source,replacement){
  const start=source.indexOf('async function buildFoodCourt(world){');
  const end=source.indexOf('async function buildMusic(world){',start);
  if(start<0||end<0)throw new Error('Food Court runtime markers missing. Refusing to boot a stale layout.');
  const patched=source.slice(0,start)+replacement.trim()+'\n\n'+source.slice(end);
  const section=patched.slice(start,start+replacement.length+32);
  if(!section.includes("'qTableRound'")||!section.includes("'qChair'"))throw new Error('Food Court new furniture is missing.');
  if(section.includes("placeModel(world.root,'table'")||section.includes("placeModel(world.root,'chair'"))throw new Error('Retired Food Court table/chair models detected.');
  if(!section.includes('frontL=')||!section.includes('frontR=')||!section.includes('doorway jambs'))throw new Error('Food Court wall coverage verification failed.');
  if(section.includes('THREE.RepeatWrapping'))throw new Error('Repeating Food Court wallpaper detected. Refusing to boot.');
  if(!section.includes('THREE.ClampToEdgeWrapping'))throw new Error('Food Court wall texture is not clamped edge-to-edge.');
  return patched;
}

async function preflightThree(){
  for(const [name,specifier] of [
    ['three','three'],['GLTFLoader','three/addons/loaders/GLTFLoader.js'],
    ['EffectComposer','three/addons/postprocessing/EffectComposer.js'],
    ['RenderPass','three/addons/postprocessing/RenderPass.js'],
    ['UnrealBloomPass','three/addons/postprocessing/UnrealBloomPass.js']
  ]){
    try{await import(specifier);}catch(cause){const err=new Error(`Three.js dependency failed at ${name}: ${cause?.message||cause}`);err.cause=cause;throw err;}
  }
}

try{
  await preflightThree();
  const [base,worldPatch,industrialPatch,visualFixPatch,foodPatch]=await Promise.all([decodeSource(),getText(WORLD_PATCH),getText(INDUSTRIAL_PATCH),getText(VISUAL_FIX_PATCH),getText(FOOD_PATCH)]);
  const worldSource=await applyWorldProps(normalizeImports(base),worldPatch);
  const industrialSource=await applyIndustrialCc0(worldSource,industrialPatch);
  const visualSource=await applyVisualFixes(industrialSource,visualFixPatch);
  const source=replaceFoodCourt(visualSource,foodPatch)+'\n//# sourceURL=pinewood-runtime.js\n';
  const moduleUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  try{await import(moduleUrl);}finally{URL.revokeObjectURL(moduleUrl);}
}catch(err){
  console.error('Pinewood game bundle failed to start',err);if(err?.cause)console.error('Underlying module error',err.cause);if(err?.stack)console.error(err.stack);
  const status=document.getElementById('assetStatus');if(status)status.textContent=`Game failed to start: ${err?.message||err}`;
}
