/**
 * V120 source-bound original 1979 public mall amenities.
 * Circulation stays open and new GLB uses a CC0 asset already pinned in
 * the 638-model Builder vendor catalog. Nothing is owner Builder draft data.
 */
import {MALL} from './masterplan-v66.mjs';
import {GALLERY_COLUMNS_V118} from './gallery-columns-v118.mjs';

export const BENCH_ASSET_V120=Object.freeze({
 path:'assets/vendor/builder/models/furniture-kit/kenney-furniture-kit-bench.glb',
 catalogId:'kenney-furniture-kit-bench',license:'CC0-1.0',
 sha256:'ba05a6d23a5a5a44da016757632070e47ff7587ce10e2f6d6d52328b4cf5489b'
});
const bench=(id,room,x,z,yaw)=>Object.freeze({
 id,room,x,z,yaw,baseY:0,model:BENCH_ASSET_V120.path,
 height:.95,collisionRadius:2.10,period:'1979-original-mall'
});
const directory=(id,x,z,facing)=>Object.freeze({
 id,room:'central_gallery',x,z,baseY:0,
 facing,height:2.25,width:1.18,depth:.58,collisionRadius:.88,
 title:'PINEWOOD MALL',period:'1989-directory-refit'
});
export const GALLERY_AMENITIES_V120=Object.freeze({
 benches:Object.freeze([
  bench('atrium_lounge_southwest','central_gallery',-5,-58,Math.PI/2),
  bench('atrium_lounge_southeast','central_gallery',5,-58,-Math.PI/2),
  bench('atrium_lounge_northwest','central_gallery',-5,-84,Math.PI/2),
  bench('atrium_lounge_northeast','central_gallery',5,-84,-Math.PI/2),
  bench('west_shop_recess','west_gallery',-15.8,-87,Math.PI/2),
  bench('east_shop_recess','east_gallery',15.8,-87,-Math.PI/2)
 ]),
 directories:Object.freeze([
  directory('main_entrance_directory',-3,-52,'south'),
  directory('north_retail_directory',3,-101,'north')
 ]),
 wayfinding:Object.freeze([
  Object.freeze({id:'west_retail_direction',columnId:'v118_west_inner_03',
   room:'west_gallery',facing:'west',
   line1:"CASSETTE CASTLE  /  FALLOW'S",line2:'SUNBURST ARCADE   ←'}),
  Object.freeze({id:'east_retail_direction',columnId:'v118_east_inner_03',
   room:'east_gallery',facing:'east',
   line1:'VIDEO PLANET  /  FOOD COURT',line2:'EAST WING   →'})
 ])
});

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
 const issues=[],physical=[...plan.benches,...plan.directories],ids=new Set();
 for(const site of CENTRAL_STORY_SITES){
  const canonical=MALL.evidence.find(e=>e.id===site.id);
  if(!canonical||canonical.room!=='central_gallery')
   issues.push('V69 narrative evidence no longer belongs to the source atrium '+site.id);
 }
 if(plan.benches.length!==6||plan.directories.length!==2||plan.wayfinding.length!==2)
  issues.push('V120 public amenities missing measured 6 benches, 2 directories, 2 column signs');
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
  if(dist(physical[i],physical[j])<=physical[i].collisionRadius+physical[j].collisionRadius+.4)
   issues.push('two public amenities overlap '+physical[i].id+'/'+physical[j].id);
 for(const b of plan.benches){
  if(b.model!==BENCH_ASSET_V120.path||b.height<.85||b.height>1.05||b.baseY!==0)
   issues.push('unpinned or badly scaled original-era bench '+b.id);
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
