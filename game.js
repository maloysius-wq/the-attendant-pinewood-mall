// Deployment loader for The Attendant: Pinewood Mall.
// Reassembles the verified storefront-polish source and normalizes Three.js imports before boot.
const PARTS = [
  './bundle/polish-g1-1.txt',
  './bundle/polish-g1-2.txt',
  './bundle/polish-g1-3.txt',
  './bundle/polish-g1-4.txt',
  './bundle/group-02.txt',
  './bundle/group-03.txt',
];

async function decodeSource(){
  const payload=(await Promise.all(PARTS.map(async url=>{
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok) throw new Error(`Bundle segment failed: ${url} (HTTP ${response.status})`);
    return (await response.text()).trim();
  }))).join('');
  const bytes=Uint8Array.from(atob(payload),c=>c.charCodeAt(0));
  if('DecompressionStream' in window){
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  }
  const {ungzip}=await import('https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm');
  return new TextDecoder().decode(ungzip(bytes));
}

function normalizeGameSource(source){
  return source
    .replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';", "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
    .replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';", "import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
    .replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';", "import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
    .replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';", "import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");
}

async function preflightThree(){
  const checks=[
    ['three','three'],
    ['GLTFLoader','three/addons/loaders/GLTFLoader.js'],
    ['EffectComposer','three/addons/postprocessing/EffectComposer.js'],
    ['RenderPass','three/addons/postprocessing/RenderPass.js'],
    ['UnrealBloomPass','three/addons/postprocessing/UnrealBloomPass.js'],
  ];
  for(const [name,specifier] of checks){
    try{await import(specifier);}
    catch(cause){
      const err=new Error(`Three.js dependency failed at ${name}: ${cause?.message||cause}`);
      err.cause=cause;
      throw err;
    }
  }
}

try{
  await preflightThree();
  const source=normalizeGameSource(await decodeSource())+'\n//# sourceURL=pinewood-runtime.js\n';
  const moduleUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  try{await import(moduleUrl);}
  finally{URL.revokeObjectURL(moduleUrl);}
}catch(err){
  console.error('Pinewood game bundle failed to start',err);
  if(err?.cause)console.error('Underlying module error',err.cause);
  if(err?.stack)console.error(err.stack);
  const status=document.getElementById('assetStatus');
  if(status)status.textContent=`Game failed to start: ${err?.message||err}`;
}
