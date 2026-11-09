// Development-time only. Fetch actual third-party CC0 GLBs, verify their
// structure, and commit the untouched originals to the repository. Nothing
// here is fetched by the shipped cinematic or Builder at runtime.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';

const models=[
 {id:'cc0-dead-tree-gothic',file:'dead-tree-gothic.glb',
  source:'https://3dassets.dev/assets/vampire-crypt-and-gothic-cathedral-dead-tree-0c7883bc',
  sourceModel:'https://cdn.3dassets.dev/assets/23051/v1/model.glb',
  sourceDescription:'Gnarled 5.42-metre leafless dead tree with twelve bare limbs and surface roots',
  author:'3DAssets.dev',upstreamAssetId:23051,version:1},
 {id:'cc0-dead-tree-survival',file:'dead-tree-survival.glb',
  source:'https://3dassets.dev/assets/wipe-day-survival-island-dead-tree-c66812b4',
  sourceModel:'https://cdn.3dassets.dev/assets/27431/v1/model.glb',
  sourceDescription:'Bare, four-fork 4.48-metre dead tree with no foliage',
  author:'3DAssets.dev',upstreamAssetId:27431,version:1}
];
const base='opening/assets/v85',out=[];
for(const item of models){
 const response=await fetch(item.sourceModel,{redirect:'follow',signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('Unable to fetch licensed CC0 model '+item.id+': HTTP '+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length<1000||bytes.length>3_000_000)throw Error('Suspicious GLB size '+item.id);
 if(bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)
  throw Error('Invalid GLB header '+item.id);
 const jsonLength=bytes.readUInt32LE(12);
 if(bytes.toString('ascii',16,20)!=='JSON'||20+jsonLength>bytes.length)
  throw Error('Invalid GLB JSON segment '+item.id);
 const gltf=JSON.parse(bytes.toString('utf8',20,20+jsonLength));
 const meshes=gltf.meshes||[],images=gltf.images||[],materials=gltf.materials||[];
 if(!meshes.length||!materials.length||!meshes.some(x=>x.primitives?.length))
  throw Error('No real source-authored tree mesh/material in '+item.id);
 if(images.some(i=>i.uri&&!i.uri.startsWith('data:')))
  throw Error('Tree has external texture dependency: '+item.id);
 const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
 const filename=path.join(base,item.file);
 await fs.mkdir(base,{recursive:true});
 await fs.writeFile(filename,bytes);
 out.push({id:item.id,path:filename,sha256,bytes:bytes.length,
  sourcePage:item.source,sourceModel:item.sourceModel,author:item.author,
  description:item.sourceDescription,license:'CC0-1.0',
  licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',
  upstreamAssetId:item.upstreamAssetId,version:item.version,
  meshCount:meshes.length,materials:materials.length,images:images.length,
  original:true,leafless:true});
 console.log('PINNED_CC0_DEAD_TREE',JSON.stringify({id:item.id,sha256,bytes:bytes.length,meshes:meshes.length}));
}
const manifest={version:85,license:'CC0-1.0',models:out};
await fs.writeFile(path.join(base,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('PINEWOOD_DEAD_TREE_VENDOR_PASS',JSON.stringify(out.map(x=>({id:x.id,sha256:x.sha256,bytes:x.bytes}))));
