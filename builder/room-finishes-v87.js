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
 // The structural exterior mesh is intentionally shared. Its interior-facing
 // paint is NOT the same thing as its weathered outside facade. Keep these
 // original room-side coatings distinct from explicit authoring overrides.
 const originalRoomWalls=new THREE.Group();
 originalRoomWalls.name='Builder-only original interior shell wall coverings';
 building.group.add(originalRoomWalls);
 const COMMON_MALL_ROOM_IDS=new Set(['central_gallery','west_gallery','east_gallery','boarded_lobby']);
 const shellExteriorIds=new Set(building.shells.flatMap(shell=>
  shell.walls.filter(w=>w.role==='exterior').map(w=>w.id)));
 const isExteriorFace=p=>shellExteriorIds.has(p.source)||p.source.startsWith('cinematic_front_');
 const interiorDefaultId=room=>room.level==='B1'?'concrete':
  room.level==='M1'?'worn-plaster':room.kind==='staff'?'painted-wall':'worn-plaster';
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
 function renderWalls(room,id,texture,{originalExteriorOnly=false}={}){
  // The front-facing cinematic facade replaces the hidden shell wall.
  // Never repaint the physical outside with an internal room finish.
  for(const p of wallPlan(room.id)){
   if(originalExteriorOnly&&!isExteriorFace(p))continue;
   paint(originalExteriorOnly?originalRoomWalls:finishes.wall,
    'wall',room,id,texture,p.width,p.height,p.x,p.y,p.z,p.rotationY);
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
  for(const g of [...Object.values(finishes),originalRoomWalls]){
   for(const mesh of [...g.children]){mesh.removeFromParent();mesh.geometry.dispose();mesh.material.dispose();}
  }
 }
 async function apply(surfaceMap={},mallWallFinish='original'){
  if(mallWallFinish!=='original'&&!ROOM_FINISHES_V87.wall.some(f=>f.id===mallWallFinish))
   throw Error('Invalid common mall wall finish '+mallWallFinish);
  const batch=[],originalShell=[];
  // Resolve all 41 room-facing surfaces independently, so 'Original' means
  // the room's indoor wall covering, not an exposed weathered exterior shell.
  for(const room of MALL.rooms){
   const surfaces=surfaceMap[room.id]||{};
   const explicit=surfaces.wall;
   const common=COMMON_MALL_ROOM_IDS.has(room.id)?mallWallFinish:'original';
   const wallId=explicit&&explicit!=='original'?explicit:common;
   if(wallId!=='original'){
    batch.push({part:'wall',room,id:wallId,texture:await textureFor('wall',wallId)});
   }else{
    const id=interiorDefaultId(room);
    originalShell.push({room,id,texture:await textureFor('wall',id)});
   }
   for(const part of ['floor','ceiling']){
    const id=surfaces[part];
    if(id&&id!=='original')batch.push({part,room,id,texture:await textureFor(part,id)});
   }
  }
  // Explicit room walls trump the common-mall finish; 'Original' does not
  // erase other sides of a shared wall or write through to outdoors.
  clear();
  for(const {room,id,texture} of originalShell)
   renderWalls(room,id,texture,{originalExteriorOnly:true});
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
  for(const g of [...Object.values(finishes),originalRoomWalls])g.removeFromParent();
  for(const promise of textureCache.values())promise.then(t=>t.dispose()).catch(()=>{});
  textureCache.clear();
 }
 return {apply,counts,
  setCinematicFrontWall:front=>{cinematicFrontWall=front;},
  getWallPlans:wallPlan,
  getCounts:()=>({
  floor:finishes.floor.children.length,wall:finishes.wall.children.length,
  originalInteriorShell:originalRoomWalls.children.length,
  ceiling:finishes.ceiling.children.length}),dispose};
}
