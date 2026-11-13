/** Inspect the existing CC0 GLB rather than guessing how the real mesh is rigged. */
import {readFileSync} from 'node:fs';
const paths=[
 'assets/vendor/builder/models/liminal-spaces-kit/three-d-liminal-spaces-kit-liminal-spaces-kit-doorway-door-fad0eb36.glb',
 'assets/vendor/builder/models/liminal-spaces-kit/three-d-liminal-spaces-kit-liminal-spaces-kit-doorway-open-1c3ac0ea.glb',
 'assets/vendor/builder/models/furniture-kit/kenney-furniture-kit-doorway.glb',
 'assets/vendor/builder/models/furniture-kit/kenney-furniture-kit-doorwayfront.glb'
];
for(const path of paths){
 const data=readFileSync(new URL('../'+path,import.meta.url));
 if(data.toString('ascii',0,4)!=='glTF')throw Error('Invalid GLB '+path);
 const jsonLength=data.readUInt32LE(12);
 const doc=JSON.parse(data.subarray(20,20+jsonLength).toString('utf8'));
 console.log('V113_SOURCE_GLB',JSON.stringify({path,size:data.length,
  scenes:doc.scenes,
  materials:doc.materials?.map((m,i)=>({i,name:m.name,pbr:m.pbrMetallicRoughness?.baseColorFactor,alpha:m.alphaMode})),
  nodes:doc.nodes?.map((n,i)=>({i,name:n.name,mesh:n.mesh,children:n.children,
   translation:n.translation,rotation:n.rotation,scale:n.scale,
   primitives:n.mesh===undefined?undefined:doc.meshes[n.mesh]?.primitives?.map(p=>({
     mode:p.mode,material:p.material,accessor:p.attributes?.POSITION,
     min:doc.accessors[p.attributes?.POSITION]?.min,
     max:doc.accessors[p.attributes?.POSITION]?.max
   }))
  }))
 }));
}
