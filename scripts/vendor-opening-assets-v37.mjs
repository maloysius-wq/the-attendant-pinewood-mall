import {mkdir,writeFile,rm,readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve('opening/assets/v37');
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifest={version:37,license:'CC0-1.0',runtime:'LOCAL ASSETS ONLY',assets:[]};
const request=async url=>{
 const u=new URL(url);
 if(u.protocol!=='https:'||!['grab3d.com','api.polyhaven.com','dl.polyhaven.org'].includes(u.hostname))throw Error('Unapproved host: '+url);
 const r=await fetch(url,{signal:AbortSignal.timeout(75000),headers:{'User-Agent':'PinewoodMall-Asset-Vendor/37'}});
 if(!r.ok)throw Error('HTTP '+r.status+' '+url);
 return r;
};
const json=async url=>(await request(url)).json();
const save=async(name,b,url)=>{
 if(!Buffer.isBuffer(b))b=Buffer.from(b);
 if(b.length<300||b.length>24000000)throw Error('Invalid bytes for '+name+': '+b.length);
 await mkdir(path.dirname(path.join(root,name)),{recursive:true});
 await writeFile(path.join(root,name),b);
 manifest.assets.push({file:name,sha256:sha(b),bytes:b.length,source:url,license:'CC0-1.0'});
};
const checkGLB=b=>{
 if(b.length<20||b.readUInt32LE(0)!==0x46546c67||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw Error('Invalid GLB');
 const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString('utf8'));
 if(!g.meshes?.length||!g.scenes?.length)throw Error('GLB empty');
 if(g.images?.some(x=>/^(https?:)?\/\//.test(x.uri||'')))throw Error('GLB contains remote images');
 return {meshes:g.meshes.length,nodes:g.nodes?.length||0};
};
async function grab(slug,file){
 const info=await json('https://grab3d.com/api/v1/models/'+slug+'.json');
 if(info.license!=='CC0-1.0')throw Error('No explicit CC0 '+slug);
 const f=info.files?.find(x=>x.format==='glb'&&x.variant==='light')||info.files?.find(x=>x.format==='glb'&&x.variant==='full');
 if(!f||!f.url.startsWith('https://grab3d.com/dl/'+slug+'/'))throw Error('Invalid first-party GLB '+slug);
 const data=Buffer.from(await (await request(f.url)).arrayBuffer());
 console.log('Grab3D',slug,checkGLB(data));
 await save(file,data,f.url);
}
function flatten(x,out=[]){if(!x||typeof x!=='object')return out;if(typeof x.url==='string'){out.push(x);return out;}for(const v of Object.values(x))flatten(v,out);return out;}
async function poly(id,prefix){
 const info=await json('https://api.polyhaven.com/info/'+id);
 if(info.type!==1)throw Error('Wrong Poly Haven asset type: '+id);
 const records=flatten(await json('https://api.polyhaven.com/files/'+id));
 for(const kind of ['diff','nor_gl','rough']){
  const re=new RegExp('_'+kind+'_1k\\.(?:jpg|png)(?:\\?|$)','i');
  const f=records.find(x=>re.test(x.url)&&x.url.includes('/'+id+'/'));
  if(!f)throw Error('Missing Poly Haven '+id+' '+kind+'; candidates '+records.slice(0,15).map(x=>x.url).join(', '));
  const data=Buffer.from(await (await request(f.url)).arrayBuffer());
  const ext=f.url.split('?')[0].toLowerCase().endsWith('.png')?'png':'jpg';
  if(ext==='jpg'&&(data[0]!==255||data[1]!==216))throw Error('Not JPEG '+f.url);
  if(ext==='png'&&data.subarray(1,4).toString()!=='PNG')throw Error('Not PNG '+f.url);
  const md5=createHash('md5').update(data).digest('hex');
  if(f.md5&&md5!==f.md5)throw Error('Poly Haven checksum mismatch '+f.url);
  await save(prefix+'_'+kind+'.'+ext,data,f.url);
 }
}
await rm(root,{recursive:true,force:true});
await mkdir(root,{recursive:true});
await grab('1990s-car-interior','1990s-car-interior.glb');
await grab('car-phone-holder','car-phone-holder.glb');
await poly('asphalt_02','asphalt');
await poly('cracked_concrete_wall','wall');
await poly('rusty_metal','rust');
/* Optional premium-quality street fixture: preserve only verified glTF and its assets. */
try{
 const list=flatten(await json('https://api.polyhaven.com/files/street_lamp_01'));
 const zip=list.find(x=>/\.zip(?:\?|$)/i.test(x.url)&&/gltf/i.test(x.url));
 if(zip){
  const bytes=Buffer.from(await (await request(zip.url)).arrayBuffer());
  const dir=path.resolve('.tmp-v37-streetlamp');await rm(dir,{recursive:true,force:true});await mkdir(dir,{recursive:true});
  const archive=path.join(dir,'lamp.zip');await writeFile(archive,bytes);
  const r=spawnSync('unzip',['-q',archive,'-d',path.join(dir,'extract')],{encoding:'utf8'});
  if(r.status!==0)throw Error(r.stderr||'Failed to extract glTF');
  const walk=async(d,arr=[])=>{for(const n of await readdir(d)){const p=path.join(d,n),s=await stat(p);if(s.isDirectory())await walk(p,arr);else arr.push(p);}return arr;};
  const files=await walk(path.join(dir,'extract')),gltf=files.find(f=>f.endsWith('.gltf'));
  if(gltf){
   const base=path.dirname(gltf);
   for(const f of await walk(base)){
    if(!/\.(gltf|bin|jpg|jpeg|png|webp)$/i.test(f))continue;
    await save('streetlamp/'+path.relative(base,f).replaceAll('\\','/'),await readFile(f),zip.url);
   }
   manifest.streetLamp='streetlamp/'+path.basename(gltf);
  }
  await rm(dir,{recursive:true,force:true});
 }
}catch(e){console.warn('Streetlamp GLTF unavailable; keep locally authored full-scale light poles:',String(e));}
manifest.assets.sort((a,b)=>a.file.localeCompare(b.file));
await writeFile(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(root,'SOURCES.md'),'# Opening cinematic v37 CC0 asset provenance\n\nThe 1990s car cabin and physical car phone holder are from Grab3D (CC0-1.0). The asphalt, facade and rust PBR maps are from Poly Haven (CC0). Optional streetlamp glTF is also Poly Haven (CC0).\n\nSee manifest.json for exact original download URLs, byte lengths and SHA-256 digests. All runtime files are served from the repository, not their original hosts. Acquisition tooling is development-only.\n');
console.log('V37 locally vendored CC0 assets: '+manifest.assets.length);
