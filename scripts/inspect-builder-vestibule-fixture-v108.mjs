import {readFileSync} from 'node:fs';
const paths=[
'assets/vendor/builder/models/liminal-spaces-kit/three-d-liminal-spaces-kit-liminal-spaces-kit-ceiling-fluorescent-0299417a.glb',
'assets/vendor/builder/models/furniture-kit/kenney-furniture-kit-lampsquareceiling.glb'
];
for(const path of paths){
 const raw=readFileSync(path);
 if(raw.toString('ascii',0,4)!=='glTF')throw Error('Not a GLB '+path);
 const len=raw.readUInt32LE(12),parsed=JSON.parse(raw.subarray(20,20+len).toString('utf8'));
 const a=parsed.accessors||[];
 console.log('PINNED_LAMP_ASSET',JSON.stringify({
  path,bytes:raw.length,scenes:parsed.scenes,nodes:parsed.nodes?.map(x=>({name:x.name,mesh:x.mesh,
    translation:x.translation,rotation:x.rotation,scale:x.scale,matrix:x.matrix})),
  materials:parsed.materials?.map((x,i)=>({i,name:x.name,
   baseColor:x.pbrMetallicRoughness?.baseColorFactor,emissive:x.emissiveFactor,
   alphaMode:x.alphaMode,textures:x.pbrMetallicRoughness?.baseColorTexture})),
  textures:parsed.textures?.length,images:parsed.images?.length,
  meshes:parsed.meshes?.map((x,i)=>({i,name:x.name,primitives:x.primitives?.map(p=>({
    material:p.material,position: a[p.attributes?.POSITION]&&{
     min:a[p.attributes.POSITION].min,max:a[p.attributes.POSITION].max
    },indices:a[p.indices]?.count
   }))}))
 }));
}
