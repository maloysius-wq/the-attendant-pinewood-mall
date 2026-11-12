#!/usr/bin/env node
// Archive original Poly Haven CC0 geometry/PBR maps. No procedural 3D.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const ROOT='assets/vendor/builder/decay-v105';
const specs=[
 {slug:'trashbag',label:'Realistic dusty black garbage bag',author:'Benny Weimer',height:.64,radius:.70},
 {slug:'plastic_bottle_gallon',label:'Dirty discarded plastic bottle',author:'Rahul Chaudhary',height:.31,radius:.35}
];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const md5=b=>crypto.createHash('md5').update(b).digest('hex');
async function fetchBytes(url,limit=25000000){
 const r=await fetch(url,{headers:{'User-Agent':'PinewoodMatureCC0Archive/105'},
  signal:AbortSignal.timeout(100000)});
 if(!r.ok)throw Error('CC0 download failed '+r.status+' '+url);
 const b=Buffer.from(await r.arrayBuffer());
 if(b.length<100||b.length>limit)throw Error('Invalid CC0 file size '+url+' '+b.length);
 return {b,url:r.url};
}
function describeGLB(b,slug){
 if(b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||
  b.readUInt32LE(8)!==b.length)throw Error('Invalid complete source GLB '+slug);
 const size=b.readUInt32LE(12);
 const j=JSON.parse(b.subarray(20,20+size).toString('utf8'));
 if(!j.meshes?.length||!j.images?.length||!j.materials?.length||
  !j.textures?.length)throw Error('Untextured 3D source rejected '+slug);
 return{meshes:j.meshes.length,images:j.images.length,materials:j.materials.length,
  primitives:j.meshes.flatMap(x=>x.primitives).length};
}
const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'pinewood-v105-source-'));
const manifestPath=path.join(ROOT,'manifest-v105.json');
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
if(manifest.version!==105||manifest.models.length)throw Error('Invalid fresh v105 base manifest');
for(const spec of specs){
 const response=await fetchBytes('https://api.polyhaven.com/files/'+spec.slug,2000000);
 const api=JSON.parse(response.b.toString());
 const variant=api?.gltf?.['1k']?.gltf;
 if(!variant?.url||!variant?.include)throw Error('Official Poly Haven GLTF 1K archive missing '+spec.slug);
 const srcRoot=path.join(tmp,spec.slug);
 await fs.mkdir(srcRoot,{recursive:true});
 const files=[[path.basename(new URL(variant.url).pathname),variant],...Object.entries(variant.include)];
 const sources=[];
 for(const [relative,entry]of files){
  if(relative.includes('..')||path.isAbsolute(relative))throw Error('Unsafe Poly Haven path');
  const local=path.join(srcRoot,relative);
  await fs.mkdir(path.dirname(local),{recursive:true});
  const result=await fetchBytes(entry.url,25000000);
  if(result.b.length!==entry.size||md5(result.b)!==entry.md5)
   throw Error('Official Poly Haven checksum changed: '+relative);
  await fs.writeFile(local,result.b);
  sources.push({name:relative,url:result.url,bytes:result.b.length,
   sha256:sha(result.b),officialMd5:entry.md5});
 }
 const localGLTF=path.join(srcRoot,files[0][0]);
 const compiled=path.join(tmp,spec.slug+'.glb');
 execFileSync('npx',['--no-install','gltf-transform','copy',localGLTF,compiled],
  {stdio:'inherit',timeout:120000});
 const b=await fs.readFile(compiled);
 const anatomy=describeGLB(b,spec.slug);
 const target=ROOT+'/models/'+spec.slug+'.glb';
 await fs.writeFile(target,b);
 manifest.models.push({
  id:'decay-v105-'+spec.slug.replaceAll('_','-'),label:spec.label,
  category:'Scattered Trash & Debris',kind:'model',condition:'weathered',
  materialStyle:'image-mapped',skipMaterialEnhancement:true,
  path:target,license:'CC0-1.0',sourceProvider:'Poly Haven',
  originalAuthor:spec.author,originalSource:'https://polyhaven.com/a/'+spec.slug,
  downloadUrl:variant.url,sourceFiles:sources,sourceAnatomy:anatomy,
  sourceSHA256:sources[0].sha256,sourceBytes:sources[0].bytes,
  targetHeight:spec.height,radius:spec.radius,
  bytes:b.length,sha256:sha(b),
  conversion:'gltf-transform copy (original CC0 meshes, UVs and images)'
 });
 console.log('V105_REAL_TRASH',spec.slug,b.length,anatomy,flush=true);
}
await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('V105_MODELS_DONE',manifest.models.length,manifest.posters.length,manifest.decals.length);
