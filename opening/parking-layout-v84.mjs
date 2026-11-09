/**
 * Pinewood's single authoritative front parking-lot paint plan (metres).
 * This describes ONLY painted linework. Nothing in this module creates
 * furniture, curbs, landscape meshes, signage, or other authored assets.
 *
 * Asphalt slab: x=-57.5..57.5, z=-19.5..68.5; walking frontage is
 * x=-51.5..51.5, z=-22.35..-12.75. 90-degree stalls face two-way aisles.
 * The licensed sedan remains centered in a real stall at x=-10,z=17.5.
 */
export const PARKING_LOT_V84=Object.freeze({
 bounds:Object.freeze({x1:-57.5,x2:57.5,z1:-19.5,z2:68.5}),
 width:115,depth:88,
 stallDepth:5.6,driveAisle:7.4,
 frontDrive:Object.freeze({z1:-12.75,z2:-4.5}),
 blocks:Object.freeze([
  Object.freeze({x1:-47.5,x2:-25.5,spaces:8}),
  Object.freeze({x1:-20.5,x2:-2.5,spaces:6}),
  Object.freeze({x1:2.5,x2:20.5,spaces:6}),
  Object.freeze({x1:25.5,x2:47.5,spaces:8})
 ]),
 // Back-to-back modules leave 7.4 m, two-way aisles. The central
 // rows are aligned to the sedan and preserve the cinematic approach.
 rows:Object.freeze([
  Object.freeze({id:'front',z1:-4.5,z2:1.1,openAt:'z1'}),
  Object.freeze({id:'near-north',z1:8.5,z2:14.1,openAt:'z1'}),
  Object.freeze({id:'sedan-row',z1:14.1,z2:19.7,openAt:'z2'}),
  Object.freeze({id:'middle-north',z1:27.1,z2:32.7,openAt:'z1'}),
  Object.freeze({id:'middle-south',z1:32.7,z2:38.3,openAt:'z2'}),
  Object.freeze({id:'rear-north',z1:45.7,z2:51.3,openAt:'z1'}),
  Object.freeze({id:'rear-south',z1:51.3,z2:56.9,openAt:'z2'})
 ]),
 cinematicCar:Object.freeze({x:-10,z:17.5}),
 serviceApproach:Object.freeze({x:12,z:-19.5})
});

const line=(kind,x1,z1,x2,z2,width=.12)=>Object.freeze({kind,x1,z1,x2,z2,width});
const bounds=PARKING_LOT_V84.bounds;
const within=(x,z)=>x>=bounds.x1&&x<=bounds.x2&&z>=bounds.z1&&z<=bounds.z2;
const lines=[];
const add=(kind,x1,z1,x2,z2,width=.12)=>{
 if(![x1,z1,x2,z2,width].every(Number.isFinite)||!within(x1,z1)||!within(x2,z2)||width<=0)
  throw Error('Parking marking exceeds actual cinematic asphalt slab');
 lines.push(line(kind,x1,z1,x2,z2,width));
};
// Actual open-front 90-degree parking stalls, not enclosed rectangles.
// Each stall has two longitudinal dividers and only its CLOSED rear line.
// The drive-in end faces an aisle and deliberately has NO transverse stripe.
// Back-to-back rows share one rear paint line, not two overlapping strokes.
const backlineKeys=new Set();
for(const row of PARKING_LOT_V84.rows){
 if(!['z1','z2'].includes(row.openAt))throw Error('Parking row must name its open aisle-facing end');
 const rearZ=row.openAt==='z1'?row.z2:row.z1;
 for(const block of PARKING_LOT_V84.blocks){
  const step=(block.x2-block.x1)/block.spaces;
  for(let j=0;j<=block.spaces;j++){
   const x=block.x1+j*step;
   add('stall',x,row.z1,x,row.z2,.105);
  }
  const key=[block.x1,block.x2,rearZ].join(':');
  if(!backlineKeys.has(key)){
   add('stall-back',block.x1,rearZ,block.x2,rearZ,.095);
   backlineKeys.add(key);
  }
 }
}
// Dashed two-way circulation lane through the original mall-front apron.
for(let x=-46;x<47;x+=6.6)add('lane',x,-8.55,Math.min(x+3.05,48),-8.55,.12);
// Pedestrian crossing aligned to the ACTUAL contractor service door, not
// a free-floating pedestrian path between parking-space dividers.
for(let z=-12.15;z<=-5.75;z+=1.04)add('crosswalk',9.65,z,14.35,z,.48);
// A clear stop bar beside the pedestrian crossing, not a fabricated sign.
add('stop',6.5,-5.15,17.5,-5.15,.18);
// Subtle side-edge paint visually separates circulating traffic from stalls.
for(const x of [-50,50]){
 for(let z=-4;z<61;z+=8.8)add('lane',x,z,x,Math.min(z+4.1,64),.11);
}
export const PARKING_MARKINGS_V84=Object.freeze(lines);
export const PARKING_MARKING_COUNTS_V84=Object.freeze({
 stalls:PARKING_LOT_V84.rows.length*PARKING_LOT_V84.blocks.reduce((sum,b)=>sum+b.spaces,0),
 segments:lines.length
});

/**
 * All parking decoration is sourced from verified local CC0 GLBs, already
 * catalogued in assets/vendor/builder/catalog-v1.json (with source and hash).
 * No original asset models are designed or generated for this update.
 */
export const PARKING_PROPS_V84=Object.freeze([
 // Genuine source-authored leafless dead trees, not needles, green pines,
 // foliage recolors, or procedural substitutes. In the landscaped islands
 // and at the outer edge, far from the licensed sedan/service-door approach.
 Object.freeze({id:'bare-west',assetId:'cc0-dead-tree-gothic',x:-23,z:35.4,targetHeight:5.7,yaw:.28}),
 Object.freeze({id:'bare-east',assetId:'cc0-dead-tree-survival',x:23,z:35.4,targetHeight:4.9,yaw:-.57}),
 Object.freeze({id:'bare-back',assetId:'cc0-dead-tree-gothic',x:0,z:53.9,targetHeight:5.5,yaw:1.5}),
 Object.freeze({id:'bare-perimeter',assetId:'cc0-dead-tree-survival',x:-52,z:60,targetHeight:4.5,yaw:1.1}),
 // Existing Kenney CC0 trash receptacle, physically sized to ~1 m high.
 Object.freeze({id:'trash-front-west',assetId:'kenney-furniture-kit-trashcan',x:-40,z:-10.65,targetHeight:1.05,yaw:.2}),
 Object.freeze({id:'trash-front-east',assetId:'kenney-furniture-kit-trashcan',x:33,z:-10.65,targetHeight:1.05,yaw:-.14}),
 Object.freeze({id:'trash-back-west',assetId:'kenney-furniture-kit-trashcan',x:-50.5,z:43,targetHeight:1.02,yaw:1.2}),
 Object.freeze({id:'trash-back-east',assetId:'kenney-furniture-kit-trashcan',x:50.5,z:58,targetHeight:1.02,yaw:-.35})
]);
