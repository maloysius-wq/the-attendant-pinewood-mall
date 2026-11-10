/**
 * One-time development-only CC0 material vendor. ALL visitor-browser textures
 * remain repository local. Source index is verified against official Poly Haven
 * texture API; every downloaded JPEG is content-hashed in manifest-v91.json.
 * This file never runs from the game or Builder.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const DIR='assets/vendor/builder/materials-v91';
const API='https://api.polyhaven.com/assets?t=textures';
const SOURCE='https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/';
const license='https://creativecommons.org/publicdomain/zero/1.0/';
// Genuine late-1980s/1990s mall materials, aged indoor finish alternatives,
// and distinct wood/metal/cloth/plastic/stone materials for untextured props.
// Entries are [official Poly Haven asset ID, descriptive label, room part(s), role].
const candidates=[
 ['painted_plaster_wall','Aged painted plaster',['wall','ceiling']],
 ['damaged_plaster','Flaking damaged plaster',['wall','ceiling']],
 ['plastered_wall_05','Weathered cream plaster',['wall','ceiling']],
 ['plastered_wall_04','Scuffed pale plaster',['wall','ceiling']],
 ['blue_plaster_wall','Faded blue plaster',['wall']],
 ['blue_plaster_weathered','Blue painted wall, peeling',['wall']],
 ['red_plaster_weathered','Worn red accent wall',['wall']],
 ['white_plaster_02','Cracked white plaster',['wall','ceiling']],
 ['white_plaster','White plaster',['wall','ceiling']],
 ['plastered_wall','Worn retail plaster',['wall','ceiling']],
 ['cracked_concrete_wall','Cracked utilitarian concrete',['wall']],
 ['concrete_wall_009','Water-streaked concrete',['wall']],
 ['brick_wall_006','1970s brick',['wall']],
 ['brick_wall_02','Dark red brick',['wall']],
 ['brick_wall_10','Worn commercial brick',['wall']],
 ['plaster_brick_pattern','Painted brickwork',['wall']],
 ['broken_wall','Broken plaster and exposed brick',['wall']],
 ['weathered_plank_siding','Weathered wood panel wall',['wall']],
 ['wood_plank_wall','Aged tongue-and-groove panelling',['wall']],
 ['painted_metal_shutter','Worn retail security shutter',['wall']],
 ['polystyrene','Old acoustic foam / insulation',['ceiling'],'plastic'],
 ['wooden_panels','Wood-panelled retail ceiling',['wall','ceiling']],
 ['laminate_floor_02','1990s commercial laminate',['floor']],
 ['laminate_floor_03','Dark laminate floor',['floor']],
 ['wood_floor_worn','Scuffed strip wood floor',['floor']],
 ['wood_floor','Worn varnished wood floor',['floor']],
 ['old_wooden_floor_01','Aged parquet boards',['floor']],
 ['wooden_floor_02','Old wood plank floor',['floor']],
 ['herringbone_parquet','Herringbone parquet',['floor']],
 ['rectangular_parquet','Rectangular wood block floor',['floor']],
 ['large_floor_tiles_02','Large 1980s ceramic tile',['floor']],
 ['tiled_floor_001','Chipped stone tiles',['floor']],
 ['concrete_floor_worn_001','Scuffed service concrete',['floor']],
 ['concrete_tiles_02','Stained square concrete tiles',['floor']],
 ['patterned_terracotta_tiling','Retro patterned terracotta',['floor']],
 ['granite_tile','Faded granite tile',['floor']],
 ['wood_table_worn','Desk wood veneer, worn',[],'wood'],
 ['wood_cabinet_worn_long','Worn wooden cabinet veneer',[],'woodDark'],
 ['oak_veneer_01','Light oak veneer',[],'woodLight'],
 ['cherry_veneer','Cherry veneer',[],'woodCherry'],
 ['plywood','Utility plywood',[],'plywood'],
 ['wood_planks','Old timber grain',[],'woodOld'],
 ['rusty_metal_02','Weathered steel',[],'metal'],
 ['rusty_metal_04','Rusted drawer pulls',[],'metalRusted'],
 ['rusty_painted_metal','Scratched painted metal',[],'paintedMetal'],
 ['blue_metal_plate','Painted industrial metal',[],'paintedMetalBlue'],
 ['rough_linen','Worn woven upholstery',[],'fabric'],
 ['denim_fabric_04','Faded heavy cloth',[],'fabricBlue'],
 ['velour_velvet','Old velvet upholstery',[],'velvet'],
 ['scuba_suede','Textured faux leather',[],'leather'],
 ['wood_table','Old varnished wood tabletop',[],'woodTable'],
 ['brushed_concrete','Rough stone and masonry',[],'stone'],
 ['wood_floor_worn','Weathered wood flooring',['floor'],'woodFloor']
];
const unique=new Map();
for(const [id,label,roomParts=[],role=null] of candidates){
 if(!unique.has(id))unique.set(id,{id,label,roomParts:[...roomParts],propRoles:[]});
 else unique.get(id).roomParts=[...new Set([...unique.get(id).roomParts,...roomParts])];
 if(role)unique.get(id).propRoles.push(role);
}
const response=await fetch(API,{signal:AbortSignal.timeout(35000)});
if(!response.ok)throw Error('Cannot verify official Poly Haven CC0 asset catalog: '+response.status);
const catalog=await response.json();
const ids=Object.keys(catalog);
const selections=[...unique.values()].filter(x=>ids.includes(x.id));
console.log('PINEWOOD_V91_MATERIAL_SELECTION '+JSON.stringify({
  available:selections.length,requested:unique.size,notFound:[...unique.keys()].filter(x=>!ids.includes(x))
}));
if(selections.length<27)throw Error('Too few verified CC0 material source IDs');
await fs.mkdir(DIR,{recursive:true});
async function fetchTexture(entry){
 const file=entry.id+'_diff_1k.jpg',url=SOURCE+entry.id+'/'+file;
 let error;
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const res=await fetch(url,{signal:AbortSignal.timeout(60000),
    headers:{'User-Agent':'Pinewood-Mall-CC0-Material-Vendor/1.0'}});
   if(!res.ok)throw Error('HTTP '+res.status);
   const bytes=Buffer.from(await res.arrayBuffer());
   if(bytes.length<5000||bytes.length>3_500_000||
      bytes[0]!==0xff||bytes[1]!==0xd8||bytes.at(-2)!==0xff||bytes.at(-1)!==0xd9)
    throw Error('Invalid JPEG bytes '+bytes.length);
   const path=DIR+'/'+file;
   await fs.writeFile(path,bytes);
   return {...entry,path,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
    bytes:bytes.length,source:'https://polyhaven.com/a/'+entry.id,downloadSource:url,
    license:'CC0-1.0',licenseUrl:license};
  }catch(e){error=e;if(attempt===3)console.warn('PINEWOOD_V91_MATERIAL_SKIPPED '+entry.id+': '+e.message)}
 }
 return null;
}
const result=[];let cursor=0;
await Promise.all(Array.from({length:6},async()=>{
 while(cursor<selections.length){
  const e=selections[cursor++];
  const v=await fetchTexture(e);
  if(v)result.push(v);
 }
}));
result.sort((a,b)=>a.id.localeCompare(b.id));
const counts={wall:0,floor:0,ceiling:0,prop:0};
for(const x of result){
 for(const part of x.roomParts)counts[part]++;
 if(x.propRoles.length)counts.prop++;
}
if(result.length<25||counts.wall<8||counts.floor<8||counts.ceiling<3||counts.prop<6)
 throw Error('Insufficient valid CC0 material set: '+JSON.stringify({total:result.length,...counts}));
const manifest={version:91,generatedOn:'2026-11-10',sourceApi:API,materialCount:result.length,
 materials:result};
await fs.writeFile(DIR+'/manifest-v91.json',JSON.stringify(manifest,null,2)+'\n');
// A source-controlled ES module means UI and schema can use a synchronous,
// closed allowlist (no dynamic untrusted material paths or save migration).
const room={wall:[],floor:[],ceiling:[]};
const props={};
for(const e of result){
 for(const part of e.roomParts)room[part].push({id:'v91-'+e.id,label:e.label,path:e.path});
 for(const role of e.propRoles)props[role]=e.path;
}
const text=[
 '/** Auto-generated from the locally pinned Poly Haven v91 CC0 manifest. */',
 'export const ROOM_MATERIALS_V91=Object.freeze('+JSON.stringify(room,null,2)+');',
 'export const PROP_MATERIALS_V91=Object.freeze('+JSON.stringify(props,null,2)+');'
].join('\n')+'\n';
await fs.writeFile('builder/material-options-v91.mjs',text);
console.log('PINEWOOD_V91_MATERIAL_VENDOR_PASS '+JSON.stringify({total:result.length,...counts,
 files:result.map(x=>({id:x.id,bytes:x.bytes,sha256:x.sha256}))}));
