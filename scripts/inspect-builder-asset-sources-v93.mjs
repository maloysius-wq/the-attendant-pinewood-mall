import fs from 'node:fs';
import {materialRoleV91} from '../builder/prop-materials-v91.js';
import {keepPeripheralColorsV92,isFurnitureV92} from '../builder/material-scale-v92.mjs';
const catalog=JSON.parse(fs.readFileSync('assets/vendor/builder/catalog-v1.json','utf8')).models;
const era=JSON.parse(fs.readFileSync('assets/vendor/builder/era-catalog-v87.json','utf8')).models;
const ids=['kenney-furniture-kit-cardboardboxopen','kenney-furniture-kit-cardboardboxclosed',
 'kenney-furniture-kit-computerkeyboard','kenney-furniture-kit-computermouse',
 'kenney-furniture-kit-desk','retro-crt-pc-1990s'];
for(const id of ids){
 const model=[...catalog,...era].find(x=>x.id===id);
 if(!model)throw Error('Absent GLB '+id);
 const bytes=fs.readFileSync(model.path);
 const json=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
 const meshes=(json.meshes||[]).map(m=>({
   name:m.name,primitives:(m.primitives||[]).map(p=>({
    material:p.material,attributes:Object.keys(p.attributes||{}),
    positionAccessor:p.attributes?.POSITION,mode:p.mode??4
   }))
 }));
 const mats=(json.materials||[]).map((m,index)=>({
   index,name:m.name,shader:m.extensions?.KHR_materials_unlit?'unlit':'standard',
   color:m.pbrMetallicRoughness?.baseColorFactor,
   metal:m.pbrMetallicRoughness?.metallicFactor,
   rough:m.pbrMetallicRoughness?.roughnessFactor,
   image:m.pbrMetallicRoughness?.baseColorTexture?.index??null,
   role:materialRoleV91(m.name,model.label)
 }));
 const nodes=(json.nodes||[]).map(n=>({name:n.name,mesh:n.mesh,children:n.children?.length??0}));
 const accessors=(json.accessors||[]).map((a,i)=>({i,count:a.count,type:a.type,min:a.min,max:a.max}));
 console.log('PINEWOOD_V93_SOURCE '+JSON.stringify({
  id,sourcePath:model.path,sourceLabel:model.label,primitives:meshes.reduce((n,m)=>n+m.primitives.length,0),
  meshes,materials:mats,nodes,accessors:accessors.filter(a=>meshes.some(m=>m.primitives.some(p=>p.positionAccessor===a.i))),
  images:json.images?.length??0,textures:json.textures?.length??0,
  peripheralBypass:keepPeripheralColorsV92(model.label),furniture:isFurnitureV92(model.label)
 }));
}
