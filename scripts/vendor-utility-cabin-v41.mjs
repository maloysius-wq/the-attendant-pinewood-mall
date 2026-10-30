import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve('opening/assets/v41'),slug='truck-cabin-interior';
const sha=b=>createHash('sha256').update(b).digest('hex');
const get=async url=>{
 const u=new URL(url);
 if(u.protocol!=='https:'||u.hostname!=='grab3d.com')throw Error('Unapproved asset source '+url);
 const r=await fetch(url,{signal:AbortSignal.timeout(90000),headers:{'User-Agent':'PinewoodMall-CC0-Utility-Cabin/41'}});
 if(!r.ok)throw Error('HTTP '+r.status+' '+url);
 return r;
};
const data=await(await get('https://grab3d.com/api/v1/models/'+slug+'.json')).json();
if(data.license!=='CC0-1.0')throw Error('Missing explicit CC0 license');
const file=data.files?.find(x=>x.format==='glb'&&x.variant==='light')||
 data.files?.find(x=>x.format==='glb'&&x.variant==='full');
if(!file?.url?.startsWith('https://grab3d.com/dl/'+slug+'/'))throw Error('No first-party GLB available');
const bytes=Buffer.from(await(await get(file.url)).arrayBuffer());
if(bytes.length<10000||bytes.length>20000000)throw Error('Unexpected GLB length '+bytes.length);
if(bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('Invalid GLB header');
const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
if(!gltf.meshes?.length||!gltf.scenes?.length)throw Error('GLB has no meshes');
if(gltf.images?.some(x=>/^(https?:)?\/\//.test(x.uri||'')))throw Error('GLB loads remote image');
await mkdir(root,{recursive:true});
await writeFile(path.join(root,'truck-cabin-interior.glb'),bytes);
const manifest={version:41,asset:'truck-cabin-interior.glb',license:'CC0-1.0',source:file.url,info:'https://grab3d.com/models/vehicles/truck-cabin-interior/',sha256:sha(bytes),bytes:bytes.length,meshes:gltf.meshes.length,materials:gltf.materials?.length||0,note:'Only source truck cabin; no procedural or mounted phone models'};
await writeFile(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(root,'SOURCES.md'),'# The Call v41: CC0 utility truck cabin\n\nSource: https://grab3d.com/models/vehicles/truck-cabin-interior/\nLicense: CC0 1.0 public domain\nExact original download URL, checksums, GLB stats: manifest.json\nThe 1990s car and car-phone-holder assets are no longer used by the preview.\n');
console.log('CC0 utility cabin verified',JSON.stringify(manifest));
