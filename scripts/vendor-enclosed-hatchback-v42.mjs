/**
 * Only approved model: a COMPLETE enclosed CC0 1990s hatchback with a
 * roof, transparent windows, steering wheel, visible front seats/rear bench.
 * This is not any open/cutaway "Car Interior" or "Truck Cabin Interior".
 * Development-time downloader; browser always loads committed local assets.
 */
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const slug='1990s-hatchback',out=path.resolve('opening/assets/v42');
const req=async(url)=>{
 const u=new URL(url);
 if(u.protocol!=='https:'||u.hostname!=='grab3d.com')throw Error('Untrusted source: '+url);
 const response=await fetch(url,{signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw Error('GET '+response.status+' '+url);
 return response;
};
const data=await(await req('https://grab3d.com/api/v1/models/'+slug+'.json')).json();
if(data.license!=='CC0-1.0')throw Error('CC0 license absent');
const f=data.files?.find(x=>x.format==='glb'&&x.variant==='full')||
data.files?.find(x=>x.format==='glb'&&x.variant==='light');
if(!f?.url?.startsWith('https://grab3d.com/dl/'+slug+'/'))throw Error('Missing verified full vehicle GLB');
const b=Buffer.from(await(await req(f.url)).arrayBuffer());
if(b.length<100000||b.length>15000000)throw Error('Unexpected file size '+b.length);
if(b.readUInt32LE(0)!==0x46546c67||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length||b.readUInt32LE(16)!==0x4e4f534a)
 throw Error('Invalid binary glTF');
const gltf=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString('utf8'));
if(!gltf.meshes?.length||!gltf.scenes?.length)throw Error('GLB lacks geometry');
if(gltf.images?.some(x=>/^(?:https?:)?\/\//.test(x.uri||'')))throw Error('Remote glTF image reference');
const materials=(gltf.materials||[]).map((m,i)=>({index:i,name:m.name||'',alphaMode:m.alphaMode||'OPAQUE',doubleSided:!!m.doubleSided}));
const meshes=gltf.meshes.map((m,i)=>({index:i,name:m.name||'',materials:[...new Set(m.primitives.map(x=>x.material).filter(x=>x!=null))]}));
const nodes=(gltf.nodes||[]).map((n,i)=>({i,name:n.name||'',mesh:n.mesh,translation:n.translation,rotation:n.rotation,scale:n.scale})).filter(n=>n.mesh!==undefined);
const sha256=createHash('sha256').update(b).digest('hex');
await mkdir(out,{recursive:true});
await writeFile(path.join(out,'1990s-hatchback.glb'),b);
const manifest={version:42,model:'1990s-hatchback.glb',slug,source:f.url,license:'CC0-1.0',sha256,bytes:b.length,meshes:meshes.length,materials,meshList:meshes,nodes,
 description:'Full covered 1990s five-door car with seats, steering wheel, roof, side/rear/windshield glass. Not an open cutaway.'};
await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(out,'SOURCES.md'),'# Enclosed 1990s hatchback: The Call v42\n\nProvider: Grab3D, CC0 1.0. https://grab3d.com/models/vehicles/1990s-hatchback/\n\nFull enclosed five-door car with roof, windows and seats; no extra procedural vehicle geometry. Original GLB download link, SHA-256, and model material/node census are preserved in manifest.json. All runtime assets stored locally.\n');
console.log('CC0 complete car acquired',JSON.stringify({source:f.url,bytes:b.length,sha256,meshes,materials,nodes}));
