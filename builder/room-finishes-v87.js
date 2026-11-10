import * as THREE from '../vendor/three/build/three.module.js';
import {MALL} from '../mall/masterplan-v66.mjs';
import {ROOM_FINISHES_V87} from './room-finishes-options-v87.mjs';
import {planRoomWallFacesV90} from './room-wall-layout-v90.mjs';
import {roomFinishRepeatsV92} from './material-scale-v92.mjs';

/**
 * Builder-only cosmetic finishes. Never change the canonical shared
 * architecture materials. Each room gets its OWN thin surface overlays,
 * clipped to the real shell floor plates/wall spans/room ceiling pieces.
 * No real walls, floor collision, door, skylight or roof is changed.
 */
export function createRoomFinishesV87(building){
 const levelShells=new Map(building.shells.map(shell=>[shell.level,shell]));
 const roomById=new Map(MALL.rooms.map(r=>[r.id,r]));
 const finishes={floor:new THREE.Group(),wall:new THREE.Group(),ceiling:new THREE.Group()};
 for(const [name,g] of Object.entries(finishes)){
  g.name='Builder-only '+name+' room finishes';
  (name==='ceiling'?building.ceilings:building.group).add(g);
 }
 const textureCache=new Map();
 let cinematicFrontWall=null;
 const wallPlan=id=>{
  const room=roomById.get(id);
  return room?planRoomWallFacesV90(room,levelShells.get(room.level),cinematicFrontWall):[];
 };
 const scaleUV=(geo,width,height,part,id)=>{
  // V91 repeated every 2.6 metres, including mottled carpet and plaster.
  // Limit copies per panel for organic finishes while keeping a realistic
  // pattern on intentional terrazzo/tile and acoustic ceiling grids.
  const repeats=roomFinishRepeatsV92(part,id,width,height),uv=geo.getAttribute('uv');
  for(let i=0;i<uv.count;i++){
   uv.setXY(i,uv.getX(i)*repeats.u,uv.getY(i)*repeats.v);
  }
  uv.needsUpdate=true;return geo;
 };
 async function textureFor(part,id){
  const source=ROOM_FINISHES_V87[part]?.find(x=>x.id===id)?.path;
  if(!source)throw Error('Unknown/empty finish '+part+' '+id);
  if(!/^(assets\/vendor\/(?:builder\/(?:finishes|materials-v91)|runtime)\/|opening\/assets\/v80\/)[\w/-]+\.jpe?g$/.test(source))
   throw Error('Nonlocal room material blocked: '+source);
  if(!textureCache.has(source)){
   const pending=new THREE.TextureLoader().loadAsync(new URL('../'+source,import.meta.url).href)
    .then(t=>{t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;
      t.anisotropy=4;return t});
   textureCache.set(source,pending);
  }
  return textureCache.get(source);
 }
 function paint(group,part,room,id,texture,w,h,x,y,z,ry=0,rx=0){
  const geo=scaleUV(new THREE.PlaneGeometry(w,h),w,h,part,id);
  const mat=new THREE.MeshStandardMaterial({color:0xffffff,map:texture,
   roughness:part==='floor'?.82:.96,metalness:0,side:THREE.DoubleSide,
   polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const mesh=new THREE.Mesh(geo,mat);
  mesh.name='builder-finish_'+room.id+'_'+part+'_'+id;
  mesh.userData.builderFinish={room:room.id,part,id};
  mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,0);
  mesh.receiveShadow=true;mesh.renderOrder=1;
  // Overlays must never become placement colliders or selection handles.
  mesh.raycast=()=>{};
  group.add(mesh);
 }
 const overlap=(a,b,c,d)=>[Math.max(a,c),Math.min(b,d)];
 function renderFloor(room,id,texture){
  const shell=levelShells.get(room.level),layer=finishes.floor;
  for(const p of shell.floorPlates){
   const [x1,x2]=overlap(room.x1,room.x2,p.x1,p.x2);
   const [z1,z2]=overlap(room.z1,room.z2,p.z1,p.z2);
   if(x2-x1<.06||z2-z1<.06)continue;
   const w=x2-x1,d=z2-z1;
   paint(layer,'floor',room,id,texture,w,d,(x1+x2)/2,p.y+.018,(z1+z2)/2,0,-Math.PI/2);
  }
 }
 function renderWalls(room,id,texture){
  // The front-facing cinematic facade replaces the hidden shell wall.
  // The shared planner also clips wall finish to each room's actual ceiling
  // and resolves overlaps between differently sized adjacent partitions.
  for(const p of wallPlan(room.id)){
   paint(finishes.wall,'wall',room,id,texture,p.width,p.height,
    p.x,p.y,p.z,p.rotationY);
  }
 }
 function renderCeiling(room,id,texture){
  const shell=levelShells.get(room.level),layer=finishes.ceiling;
  for(const p of shell.ceilings.filter(x=>x.room===room.id)){
   const w=p.x2-p.x1,d=p.z2-p.z1;
   if(w<.1||d<.1)continue;
   // Bottom surface only. Never paint roof, walls, or the upper face of
   // another floor. This also respects the existing cutaway toggle.
   paint(layer,'ceiling',room,id,texture,w,d,(p.x1+p.x2)/2,
    p.y-p.thickness/2-.012,(p.z1+p.z2)/2,0,Math.PI/2);
  }
 }
 function counts(roomId){
  const room=roomById.get(roomId);if(!room)return null;
  const shell=levelShells.get(room.level);
  return {wall:wallPlan(roomId).length,
   floor:shell.floorPlates.filter(p=>p.x1<room.x2&&p.x2>room.x1&&p.z1<room.z2&&p.z2>room.z1).length,
   ceiling:shell.ceilings.filter(p=>p.room===room.id).length};
 }
 function clear(){
  for(const g of Object.values(finishes)){
   for(const mesh of [...g.children]){mesh.removeFromParent();mesh.geometry.dispose();mesh.material.dispose();}
  }
 }
 async function apply(surfaceMap={}){
  const batch=[];
  for(const [roomId,surfaces] of Object.entries(surfaceMap)){
   const room=roomById.get(roomId);
   if(!room)throw Error('Unknown room surface target '+roomId);
   for(const part of ['wall','floor','ceiling']){
    const id=surfaces?.[part];
    if(!id||id==='original')continue;
    batch.push({part,room,id,texture:await textureFor(part,id)});
   }
  }
  clear();
  for(const {part,room,id,texture} of batch){
   if(part==='floor')renderFloor(room,id,texture);
   else if(part==='wall')renderWalls(room,id,texture);
   else renderCeiling(room,id,texture);
  }
  return {floor:finishes.floor.children.length,wall:finishes.wall.children.length,
   ceiling:finishes.ceiling.children.length};
 }
 function dispose(){
  clear();
  for(const g of Object.values(finishes))g.removeFromParent();
  for(const promise of textureCache.values())promise.then(t=>t.dispose()).catch(()=>{});
  textureCache.clear();
 }
 return {apply,counts,
  setCinematicFrontWall:front=>{cinematicFrontWall=front;},
  getWallPlans:wallPlan,
  getCounts:()=>({
  floor:finishes.floor.children.length,wall:finishes.wall.children.length,
  ceiling:finishes.ceiling.children.length}),dispose};
}
