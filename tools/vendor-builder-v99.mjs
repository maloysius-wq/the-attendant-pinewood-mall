#!/usr/bin/env node
/**
 * One-time v99 replacement of v98 generated contractor GLBs with real third-party
 * CC0 model files. Never loaded or run in the production browser. No model
 * geometry is authored or fabricated here. Existing ids/paths are preserved.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const ROOT='assets/vendor/builder/vestibule-v98';
const MANIFEST=ROOT+'/manifest-v98.json';
const AGENT='PinewoodMallModelVendor/99 (commercial CC0 asset archiving)';
const shasum=b=>crypto.createHash('sha256').update(b).digest('hex');
const md5=b=>crypto.createHash('md5').update(b).digest('hex');
const candidates=[
  {slug:'compact-forklift',provider:'Innerscene',sourceSlug:'electric-counterbalance-forklift-7acc0547',author:'Innerscene',label:'Electric warehouse forklift'},
  {slug:'manual-pallet-jack',provider:'Innerscene',sourceSlug:'manual-pallet-jack-5ff28a4a',author:'Innerscene',label:'Manual hydraulic pallet jack'},
  {slug:'service-stepladder',provider:'Innerscene',sourceSlug:'step-fold-step-ladder-acbe7baf',author:'Innerscene',label:'Aluminum folding step ladder'},
  {slug:'rolling-tool-chest',provider:'Innerscene',sourceSlug:'rolling-tool-chest-c23c4e4c',author:'Innerscene',label:'Rolling workshop tool chest'},
  {slug:'metal-toolbox',provider:'Poly Haven',sourceSlug:'metal_toolbox',author:'Mateusz Sadek',label:'Worn vintage metal toolbox'},
  {slug:'electrical-cable-reel',provider:'Innerscene',sourceSlug:'cord-reel-utility-organizer-258e2bfe',author:'Innerscene',label:'Utility electric cord reel'},
  {slug:'utility-push-cart',provider:'Poly Haven',sourceSlug:'industrial_storage_cart',author:'Jule Bielitz',label:'Weathered industrial storage cart'},
  {slug:'tripod-work-light',provider:'Innerscene',sourceSlug:'work-stand-portable-work-light-1befa4ba',author:'Innerscene',label:'Portable unpowered work light'},
  {slug:'maintenance-broom',provider:'Poly Haven',sourceSlug:'plastic_broom',author:'L',label:'Worn industrial push broom'},
  {slug:'spare-conduit',provider:'Poly Haven',sourceSlug:'modular_electric_cables',author:'Kuutti Siitonen',label:'Loose cable conduit sections'}
];
const expectedOriginal=new Set(candidates.map(c=>'vestibule-'+c.slug));
const manifest=JSON.parse(await fs.readFile(MANIFEST,'utf8'));
const replaced=manifest.models.filter(x=>expectedOriginal.has(x.id));
if(replaced.length!==10||replaced.some(x=>x.license!=='Original-Pinewood'))throw Error('v98 base changed; refusing replacements');

async function download(url,max=25000000){
  const response=await fetch(url,{headers:{'User-Agent':AGENT},signal:AbortSignal.timeout(100000)});
  if(!response.ok)throw Error('source '+response.status+' '+url);
  const b=Buffer.from(await response.arrayBuffer());
  if(b.length<64||b.length>max)throw Error('source bytes out of bounds '+url+' '+b.length);
  return {b,url:response.url};
}
function glbInfo(b,label){
  if(b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)
    throw Error('Not a complete glTF2 GLB: '+label);
  const n=b.readUInt32LE(12),tag=b.toString('ascii',16,20);
  if(tag!=='JSON')throw Error('Missing GLB JSON: '+label);
  const j=JSON.parse(b.subarray(20,20+n).toString('utf8'));
  if(!(j.meshes?.length>0)||!(j.nodes?.length>0)||!(j.scenes?.length>0))throw Error('Empty model '+label);
  const tris=j.meshes.reduce((sum,m)=>sum+(m.primitives||[]).length,0);
  if(tris<1)throw Error('No primitives '+label);
  return {meshCount:j.meshes.length,nodeCount:j.nodes.length,primitiveCount:tris,textureCount:j.textures?.length||0,embeddedImageCount:j.images?.length||0,materialCount:j.materials?.length||0,
    gltfGenerator:j.asset?.generator||null};
}
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pinewood-cc0-v99-'));
const updates=[];
for(const c of candidates){
 console.log('DOWNLOAD',c.slug,c.provider,c.sourceSlug);
 let bytes,sourceFiles=[],page,sourceUrl;
 if(c.provider==='Innerscene'){
   page='https://www.innerscene.com/tools/library/3d-parts/'+c.sourceSlug;
   sourceUrl='https://www.innerscene.com/api/library/'+c.sourceSlug+'/download';
   const r=await download(sourceUrl,20000000);bytes=r.b;
   glbInfo(bytes,c.slug);
   sourceFiles=[{name:path.basename(new URL(r.url).pathname),url:r.url,bytes:bytes.length,sha256:shasum(bytes)}];
 } else {
   page='https://polyhaven.com/a/'+c.sourceSlug;
   const api='https://api.polyhaven.com/files/'+c.sourceSlug;
   const response=await download(api,10000000);
   const apiPayload=JSON.parse(response.b.toString());
   const variant=apiPayload?.gltf?.['1k']?.gltf;
   if(!variant?.url||!variant?.include)throw Error('Missing Poly Haven 1K GLTF dependencies: '+c.slug);
   sourceUrl=variant.url;
   const basedir=path.join(dir,c.sourceSlug);
   await fs.mkdir(basedir,{recursive:true});
   const entries=[[path.basename(new URL(variant.url).pathname),variant],...Object.entries(variant.include)];
   for(const [relative,entry] of entries){
     if(relative.includes('..')||path.isAbsolute(relative))throw Error('Unsafe include path '+relative);
     const dest=path.join(basedir,relative);
     await fs.mkdir(path.dirname(dest),{recursive:true});
     const {b,url}=await download(entry.url,25000000);
     if(b.length!==entry.size||md5(b)!==entry.md5)throw Error('Poly Haven API file checksum mismatch '+entry.url);
     await fs.writeFile(dest,b);
     sourceFiles.push({name:relative,url,bytes:b.length,sha256:shasum(b),officialMd5:entry.md5});
   }
   const gltfPath=path.join(basedir,entries[0][0]);
   if(c.slug==='spare-conduit'){
     // Select actual preexisting straight source meshes, not invented tubing.
     const gltf=JSON.parse(await fs.readFile(gltfPath,'utf8'));
     const wanted=['cable_straight_long','cable_straight_medium','cable_straight_short'];
     const selected=gltf.nodes.map((n,i)=>wanted.includes(n.name)?i:-1).filter(i=>i>=0);
     if(selected.length!==3)throw Error('Source kit no longer has all three straight segments');
     for(const scene of gltf.scenes)scene.nodes=selected;
     await fs.writeFile(gltfPath,JSON.stringify(gltf));
   }
   const output=path.join(dir,c.slug+'.glb');
   execFileSync('npx',['--no-install','gltf-transform','copy',gltfPath,output],{stdio:'inherit',timeout:120000});
   bytes=await fs.readFile(output);
   glbInfo(bytes,c.slug);
 }
 const info=glbInfo(bytes,c.slug);
 const target=ROOT+'/models/'+c.slug+'.glb';
 await fs.writeFile(target,bytes);
 const old=replaced.find(m=>m.id==='vestibule-'+c.slug);
 if(!old)throw Error('Missing old id '+c.slug);
 const replacement={...old,label:c.label,materialStyle:info.embeddedImageCount?'image-mapped':'color-only',
   skipMaterialEnhancement:true,license:'CC0-1.0',originalAuthor:c.author,originalSource:page,
   sourceProvider:c.provider,sourceMirror:sourceUrl,sourceSHA256:sourceFiles[0].sha256,sourceBytes:sourceFiles[0].bytes,
   sourceFiles,sourceModelInfo:info,conversion:c.provider==='Poly Haven'?'gltf-transform copy (source meshes and images)':'Unmodified source GLB',
   bytes:bytes.length,sha256:shasum(bytes)};
 updates.push(replacement);
 console.log('PINNED',replacement.id,replacement.bytes,replacement.sha256,JSON.stringify(info));
}
const byId=new Map(updates.map(x=>[x.id,x]));
manifest.models=manifest.models.map(x=>byId.get(x.id)||x);
manifest.provenance={...manifest.provenance,v99Replacement:'All ten v98 generated contractor 3D props replaced with retrieved CC0 third-party GLB source models, original IDs preserved, local and source SHA-256 pinned. Four Poly Haven glTF models are merely packaged into GLB; straight conduit kit shows only three selected existing mesh nodes. No new mesh primitives created.'};
await fs.writeFile(MANIFEST,JSON.stringify(manifest,null,2)+'\n');
console.log('DONE',updates.length,'replacements',manifest.models.filter(x=>x.license==='CC0-1.0').length,'source-backed models');
