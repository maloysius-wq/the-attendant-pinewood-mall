/**
 * V120 source-bound original 1979 public mall amenities.
 * Circulation stays open and new GLB uses a CC0 asset already pinned in
 * the 638-model Builder vendor catalog. Nothing is owner Builder draft data.
 */
import {MALL} from './masterplan-v66.mjs';
import {GALLERY_COLUMNS_V118} from './gallery-columns-v118.mjs';

// V163: replace the outdoor-style bench with the already pinned 1989 mall
// bench and add matched period bins. Sizes decoded from normalized GLB vertices.
const PREFIX='three-d-retro-arcade-and-mall-1989-retro-arcade-and-mall-1989-';
const asset=(name,sha256,size)=>Object.freeze({catalogId:PREFIX+name,
 path:'assets/vendor/builder/models/retro-arcade-and-mall-1989/'+PREFIX+name+'.glb',
 sha256,license:'CC0-1.0',size:Object.freeze(size)});
export const BENCH_ASSET_V120=asset('mall-bench-1c2eb350','633f077a40467d64d0bd7928f45392148edfa0f72c32f07293a8ef4e9749f0f6',[1.8,.97,.6]);
export const BIN_ASSET_V163=asset('mall-bin-816b3425','37227067b795e103d67ccac530b22310eaef413c45415bb0c2f392f5ebbb5ef3',[.6,.78,.6]);
const fixture=(id,room,x,z,yaw,source,station)=>Object.freeze({
 id,room,x,z,yaw,baseY:0,model:source.path,sourceSize:source.size,height:source.size[1],
 collisionRadius:Math.ceil((Math.hypot(source.size[0],source.size[2])/2+.1)*100)/100,
 station,period:'1989-common-gallery-refit'
});
const directory=(id,x,z,facing)=>Object.freeze({
 id,room:'central_gallery',x,z,baseY:0,facing,yaw:facing==='north'?Math.PI:0,
 height:2.25,width:1.18,depth:.58,sourceSize:Object.freeze([1.36,2.315,.8]),collisionRadius:.89,
 title:'PINEWOOD MALL',period:'1989-directory-refit'
});
// Two 1.8m benches per station, .98m between ends; bins are behind rather
// than in front of the usable seats. Source +Z is the open seat side.
const stations=[
 ['atrium_sw','central_gallery',-5.6,-59.8,Math.PI/2,-7.3,'atrium_lounge_southwest'],
 ['atrium_se','central_gallery',5.6,-59.8,-Math.PI/2,7.3,'atrium_lounge_southeast'],
 ['atrium_nw','central_gallery',-5.6,-85.1,Math.PI/2,-7.3,'atrium_lounge_northwest'],
 ['atrium_ne','central_gallery',5.6,-85.1,-Math.PI/2,7.3,'atrium_lounge_northeast'],
 ['west_south','west_gallery',-16.2,-59.8,-Math.PI/2,-14.6,'west_south_seat'],
 ['west_mid','west_gallery',-16.2,-85.4,-Math.PI/2,-14.6,'west_shop_recess'],
 ['west_north','west_gallery',-16.2,-98.8,-Math.PI/2,-14.6,'west_north_seat'],
 ['east_south','east_gallery',16.2,-59.8,Math.PI/2,14.6,'east_south_seat'],
 ['east_mid','east_gallery',16.2,-85.4,Math.PI/2,14.6,'east_shop_recess'],
 ['east_north','east_gallery',16.2,-98.8,Math.PI/2,14.6,'east_north_seat']
];
export const GALLERY_AMENITIES_V120=Object.freeze({
 benches:Object.freeze(stations.flatMap(([id,room,x,z,yaw,,legacy])=>[
  fixture(legacy,room,x,z+1.4,yaw,BENCH_ASSET_V120,id),
  fixture(id+'_second_seat',room,x,z-1.4,yaw,BENCH_ASSET_V120,id)
 ])),
 bins:Object.freeze(stations.map(([id,room,,z,,x])=>fixture(id+'_litter',room,x,z,0,BIN_ASSET_V163,id))),
 directories:Object.freeze([directory('main_entrance_directory',-3,-52,'south'),directory('north_retail_directory',3,-101,'north')]),
 wayfinding:Object.freeze([
  Object.freeze({id:'west_retail_direction',columnId:'v118_west_inner_03',room:'west_gallery',facing:'west',
   line1:"← SUNBURST  |  FALLOW'S →",line2:'CASSETTE CASTLE  ·  WEST WALK'}),
  Object.freeze({id:'east_retail_direction',columnId:'v118_east_inner_03',room:'east_gallery',facing:'east',
   line1:'← EAST DEPT / VIDEO PLANET',line2:'FOOD COURT →  ·  EAST WALK'})
 ])
});
export const publicAmenitiesV163=plan=>[...(plan?.benches||[]),...(plan?.bins||[]),...(plan?.directories||[])];
export function publicAmenityBoundsV163(f){
 const [w,,d]=f.sourceSize,c=Math.abs(Math.cos(f.yaw||0)),s=Math.abs(Math.sin(f.yaw||0));
 const x=(w*c+d*s)/2+.10,z=(w*s+d*c)/2+.10;
 return {minX:f.x-x,maxX:f.x+x,minZ:f.z-z,maxZ:f.z+z};
}
export function publicAmenitySegmentBlockedV163(f,from,to){
 const b=publicAmenityBoundsV163(f);let low=0,high=1;
 for(const [p,d,min,max] of [[from.x,to.x-from.x,b.minX,b.maxX],[from.z,to.z-from.z,b.minZ,b.maxZ]]){
  if(Math.abs(d)<1e-9){if(p<=min||p>=max)return false;continue}
  const a=(min-p)/d,c=(max-p)/d;low=Math.max(low,Math.min(a,c));high=Math.min(high,Math.max(a,c));
  if(low>=high)return false;
 }
 return low<high;
}
export function benchApproachV163(b){return {x:b.x+Math.sin(b.yaw)*1.3,z:b.z+Math.cos(b.yaw)*1.3}}
const EPS=1e-5,roomById=new Map(MALL.rooms.map(r=>[r.id,r]));
// Coordinates are the original V69 furnished-room story anchors, with the
// canonical MALL evidence IDs checked below. MALL.evidence alone has no x/z.
const CENTRAL_STORY_SITES=Object.freeze([
 Object.freeze({id:'LS-01',x:7,z:-66}),
 Object.freeze({id:'LS-02',x:7,z:-94})
]);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const segmentDistance=(p,a,b)=>{
 const dx=b.x-a.x,dz=b.z-a.z,den=dx*dx+dz*dz;
 const t=den?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/den)):0;
 return Math.hypot(p.x-(a.x+t*dx),p.z-(a.z+t*dz));
};
export function validateGalleryAmenitiesV120(plan=GALLERY_AMENITIES_V120,{portals=[],galleryColumns=GALLERY_COLUMNS_V118}={}){
 const issues=[],physical=publicAmenitiesV163(plan),ids=new Set();
 for(const site of CENTRAL_STORY_SITES){
  const canonical=MALL.evidence.find(e=>e.id===site.id);
  if(!canonical||canonical.room!=='central_gallery')
   issues.push('V69 narrative evidence no longer belongs to the source atrium '+site.id);
 }
 if(plan.benches.length!==20||plan.bins?.length!==10||plan.directories.length!==2||plan.wayfinding.length!==2)
  issues.push('V163 requires ten two-bench stations, ten bins, two directories and two column signs');
 for(const a of physical){
  if(ids.has(a.id))issues.push('duplicate public fixture '+a.id);
  ids.add(a.id);
  const room=roomById.get(a.room),r=a.collisionRadius;
  if(!room||room.level!=='G'||!['central_gallery','west_gallery','east_gallery'].includes(a.room))
   {issues.push('fixture not anchored to original public mall '+a.id);continue}
  if(!(a.x>room.x1+r+.2&&a.x<room.x2-r-.2&&a.z>room.z1+r+.2&&a.z<room.z2-r-.2))
   issues.push('amenity clips original room edge '+a.id);
  if(a.room==='central_gallery'){
   if(dist(a,{x:0,z:-71})<=5.1+r+1.1)
    issues.push('amenity crowds the original 5.1m dry fountain '+a.id);
   for(const site of CENTRAL_STORY_SITES)
    if(dist(a,site)<=r+2.15)issues.push('amenity blocks original evidence '+a.id+'/'+site.id);
  }else{
   const spine=a.room==='west_gallery'?-20:20;
   if(Math.abs(a.x-spine)<=r+.85)issues.push('amenity closes original long shopping spine '+a.id);
  }
  for(const pillar of galleryColumns){
   if(dist(a,pillar)<=r+pillar.collisionRadius+.65)
    issues.push('public amenity and source support overlap '+a.id+'/'+pillar.id);
  }
  for(const p of portals.filter(p=>p.type==='doorway'&&[p.from,p.to].includes(a.room))){
   const a0=p.axis==='x'?{x:p.at,z:p.start}:{x:p.start,z:p.at};
   const a1=p.axis==='x'?{x:p.at,z:p.end}:{x:p.end,z:p.at};
   if(segmentDistance(a,a0,a1)<=r+.8)issues.push('amenity blocks original shop doorway '+a.id+'/'+p.id);
  }
 }
 for(let i=0;i<physical.length;i++)for(let j=i+1;j<physical.length;j++)
  {
   const a=publicAmenityBoundsV163(physical[i]),b=publicAmenityBoundsV163(physical[j]);
   if(a.minX<b.maxX+.25&&a.maxX>b.minX-.25&&a.minZ<b.maxZ+.25&&a.maxZ>b.minZ-.25)issues.push('two public amenities overlap '+physical[i].id+'/'+physical[j].id);
  }
 for(const b of plan.benches){
  if(b.model!==BENCH_ASSET_V120.path||b.height<.85||b.height>1.05||b.baseY!==0)
   issues.push('unpinned or badly scaled original-era bench '+b.id);
 }
 for(const b of plan.bins||[])if(b.model!==BIN_ASSET_V163.path||b.height!==.78||b.baseY!==0)
  issues.push('unpinned or badly scaled bin '+b.id);
 for(const b of plan.benches){
  const a=benchApproachV163(b);
  for(const f of physical){
   const q=publicAmenityBoundsV163(f);
   if(a.x>q.minX-.45&&a.x<q.maxX+.45&&a.z>q.minZ-.45&&a.z<q.maxZ+.45)
    issues.push('seat approach blocked '+b.id+'/'+f.id);
  }
  if(plan.benches.filter(x=>x.station===b.station).length!==2||plan.bins.filter(x=>x.station===b.station).length!==1)
   issues.push('unpaired station '+b.station);
 }
 for(const w of plan.wayfinding){
  const col=galleryColumns.find(c=>c.id===w.columnId);
  if(!col||col.room!==w.room||col.topY<4.8||!['east','west'].includes(w.facing))
   issues.push('wayfinding sign missing authentic load-bearing gallery post '+w.id);
  if(ids.has(w.id))issues.push('duplicate wayfinding '+w.id);
  ids.add(w.id);
 }
 return issues;
}
