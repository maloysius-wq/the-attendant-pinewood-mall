import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell} from '../mall/physical-shell-v67.mjs';
import {getCinematicFrontWallV90,planRoomWallFacesV90} from '../builder/room-wall-layout-v90.mjs';

const shells=new Map(['G','B1','M1'].map(level=>
 [level,constructPhysicalShell({level,chapter:6})]));
const vestibule=MALL.rooms.find(r=>r.id==='service_vestibule');
const portalLeft=12-1.78/2-.018,portalRight=12+1.78/2+.018;
const portalTop=.006+2.27+.018;
function mockFrontStage(){
 const material={};const z=-22.5,depth=.9;
 const block=(x,y,width,height)=>({
  isMesh:true,position:{x,y,z},material,
  geometry:{parameters:{width,height,depth}}
 });
 const left=block(-17,4,55,8.2),right=block(31,4,34,8.2);
 const l=block((10.5+portalLeft)/2,4,portalLeft-10.5,8.2);
 const r=block((14+portalRight)/2,4,14-portalRight,8.2);
 const h=block(12,(8.1+portalTop)/2,portalRight-portalLeft,8.1-portalTop);
 return {world:{children:[left,right,l,r,h]},
  serviceEntry:{opening:{wallZ:z},leftInfill:l,rightInfill:r,headerInfill:h}};
}
const front=getCinematicFrontWallV90(mockFrontStage());
const overlap=(a,b,c,d)=>Math.max(0,Math.min(b,d)-Math.max(a,c));
const covers=(plans,axis,side,at,y)=>
 plans.some(p=>p.axis===axis&&p.side===side&&at>=p.start-.0001&&at<=p.end+.0001&&
  y>=p.bottom-.0001&&y<=p.top+.0001);
const planFor=id=>{
 const room=MALL.rooms.find(r=>r.id===id);
 return planRoomWallFacesV90(room,shells.get(room.level),front);
};

test('actual cinematic facade depth and doorway head are recovered from five mesh blocks',()=>{
 assert.equal(front.segments.length,5);
 assert.equal(front.at,-22.5);
 assert.ok(Math.abs(front.interiorFaceZ-(-22.95))<.0001);
 const roomPlan=planFor('service_vestibule'),boundary=roomPlan.filter(p=>p.side==='z-end');
 assert.ok(boundary.length>=4,'vestibule front includes separate door-side and head surfaces');
 assert.ok(covers(roomPlan,'z','z-end',9.5,1),'west of service door is covered');
 assert.ok(covers(roomPlan,'z','z-end',15.5,1),'east of service door is covered');
 assert.equal(covers(roomPlan,'z','z-end',12,1),false,
  'never paint over the actual working service doorway');
 assert.equal(covers(roomPlan,'z','z-end',12,2.8),true,
  'the real header above the door must receive the room wall finish');
 assert.ok(boundary.every(p=>Math.abs(p.z-(-22.963))<.0001),
  'front finish must be ON the visible facade, not buried in the old wall');
 const ceiling=shells.get('G').ceilings.find(p=>p.room===vestibule.id);
 assert.ok(boundary.every(p=>p.top<=ceiling.y-ceiling.thickness/2+.00001),
  'finish must stop below the actual vestibule ceiling');
 assert.ok(planFor('boarded_lobby').some(p=>p.side==='z-end'&&p.z< -22.95),
  'adjacent main entry receives same corrected visible front finish');
});

test('every original mall room is audited for interior wall finishes across all three floors',()=>{
 assert.equal(MALL.rooms.length,41);
 let total=0,exterior=0,wallless=[],layered=0;
 for(const room of MALL.rooms){
  const shell=shells.get(room.level),planned=planRoomWallFacesV90(room,shell,front);
  total+=planned.length;
  if(planned.length===0)wallless.push(room.id);
  for(const p of planned){
   assert.equal(p.room,room.id);
   assert.ok([p.x,p.y,p.z,p.width,p.height,p.start,p.end,p.top,p.bottom].every(Number.isFinite));
   assert.ok(p.width>.06&&p.height>.06,room.id+' degenerate finish');
   assert.ok(p.bottom>=shell.y-.0001);
   assert.ok(p.start>=((p.axis==='x')?room.z1:room.x1)-.0001);
   assert.ok(p.end<=((p.axis==='x')?room.z2:room.x2)+.0001);
   assert.ok(p.source&&typeof p.source==='string');
   if(p.source.startsWith('cinematic_front_'))exterior++;
   const ceiling=shell.ceilings.filter(c=>c.room===room.id);
   if(ceiling.length){
    const under=Math.min(...ceiling.map(c=>c.y-c.thickness/2));
    assert.ok(p.top<=under+.00001,room.id+' wall bleeds above its ceiling');
   }else if(room.level==='B1'||room.level==='M1'){
    const maxTop=shell.y+(room.level==='B1'?3.45:3);
    assert.ok(p.top<=maxTop+.00001,room.id+' wall leaks above floor height');
   }
  }
  // No overlapping coplanar painted faces even if neighboring rooms have
  // different partition heights. This checks ALL original 41-room outlines.
  for(let i=0;i<planned.length;i++)for(let j=i+1;j<planned.length;j++){
   const a=planned[i],b=planned[j];if(a.side!==b.side)continue;
   if(overlap(a.start,a.end,b.start,b.end)>.001&&
      overlap(a.bottom,a.top,b.bottom,b.top)>.001)layered++;
  }
  // Independently sample the centre of every real wall strip along the
  // room's four boundaries, excluding the five-piece facade override.
  const sides=[
   {axis:'x',at:room.x1,lo:room.z1,hi:room.z2,side:'x-start'},
   {axis:'x',at:room.x2,lo:room.z1,hi:room.z2,side:'x-end'},
   {axis:'z',at:room.z1,lo:room.x1,hi:room.x2,side:'z-start'},
   {axis:'z',at:room.z2,lo:room.x1,hi:room.x2,side:'z-end'}
  ];
  const slabs=shell.ceilings.filter(c=>c.room===room.id);
  const maxY=slabs.length?Math.min(...slabs.map(c=>c.y-c.thickness/2)):
   room.level==='B1'?shell.y+3.45:room.level==='M1'?shell.y+3:Infinity;
  const physical=[...shell.walls.filter(w=>w.role!=='gate'&&w.role!=='railing'&&
   !(room.level==='G'&&w.role==='exterior'&&w.axis==='z'&&Math.abs(w.at-front.at)<.07)),
   ...(room.level==='G'?front.segments:[])];
  for(const side of sides)for(const w of physical){
   if(w.axis!==side.axis||Math.abs(w.at-side.at)>=.07)continue;
   const start=Math.max(side.lo,w.start),end=Math.min(side.hi,w.end);
   const bottom=Math.max(shell.y,w.bottom),top=Math.min(w.top,maxY);
   if(end-start<=.06||top-bottom<=.06)continue;
   for(const fraction of [.25,.5,.75]){
    const at=start+(end-start)*fraction,y=bottom+(top-bottom)/2;
    assert.ok(covers(planned,side.axis,side.side,at,y),
     room.id+' fails to paint existing wall '+w.id+' at '+at.toFixed(2));
   }
  }
 }
 assert.equal(layered,0,'wall finishes must not overlap/z-fight on the same room face');
 assert.ok(total>100,'the full mall should have substantial editable wall surface');
 assert.ok(exterior>0,'cinematic front surfaces must be included');
 console.log('PINEWOOD_41_ROOM_WALL_AUDIT',JSON.stringify({
  rooms:MALL.rooms.length,wallPanels:total,cinematicPanels:exterior,
  walllessRooms:wallless,overlappingFaces:layered
 }));
});
