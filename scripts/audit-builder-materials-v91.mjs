import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync('assets/vendor/builder/catalog-v1.json','utf8')).models;
const index=JSON.parse(fs.readFileSync('assets/vendor/builder/material-index-v1.json','utf8'));
const colorOnly=catalog.filter(m=>!index.imageBearingIds.includes(m.id));
function parseGlb(file){
 const b=fs.readFileSync(file);
 if(b.toString('ascii',0,4)!=='glTF')throw Error(file);
 return JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
}
const records=colorOnly.map(m=>{
 const g=parseGlb(m.path);
 return {id:m.id,label:m.label,category:m.category,
  materials:(g.materials||[]).map(v=>({name:v.name||'unnamed',
   base:v.pbrMetallicRoughness?.baseColorFactor||[1,1,1,1],
   rough:v.pbrMetallicRoughness?.roughnessFactor??1,
   metal:v.pbrMetallicRoughness?.metallicFactor??1,
   alpha:v.alphaMode||'OPAQUE',
   double:v.doubleSided||false})),
  meshNames:(g.meshes||[]).map(x=>x.name||'').slice(0,8),
  uvPrimitives:(g.meshes||[]).flatMap(x=>x.primitives||[]).filter(p=>p.attributes?.TEXCOORD_0!==undefined).length,
  primitives:(g.meshes||[]).flatMap(x=>x.primitives||[]).length
 }
});
const matNames={},categories={},numMaterials={};
let totalPrimitives=0,withUV=0;
for(const r of records){
 categories[r.category]=(categories[r.category]||0)+1;
 numMaterials[r.materials.length]=(numMaterials[r.materials.length]||0)+1;
 totalPrimitives+=r.primitives;withUV+=r.uvPrimitives;
 for(const m of r.materials)matNames[m.name]=(matNames[m.name]||0)+1;
}
console.log('MATERIAL_V91_POPULATION '+JSON.stringify({models:records.length,byCategory:categories,
 materialCounts:numMaterials,totalPrimitives,primitivesWithUV:withUV,
 topNames:Object.entries(matNames).sort((a,b)=>b[1]-a[1]).slice(0,70)}));
const groups=[
 /kenney-furniture-kit-desk/,/kenney-furniture-kit-sidetable/,/kenney-furniture-kit-chair/,
 /kenney-furniture-kit-kitchencabinetdrawer/,
 /kenney-nature-kit-tree/,/kenney-graveyard-kit-bench/,/kenney-graveyard-kit-stone/,
 /kenney-city-kit-commercial/,/three-d-retail/,/three-d-christmas/,
 /three-d-zombie/,/three-d-liminal/,/three-d-retro/
];
for(const g of groups)for(const item of records.filter(x=>g.test(x.id)).slice(0,3))
 console.log('MATERIAL_V91_SAMPLE '+JSON.stringify(item).slice(0,1800));
