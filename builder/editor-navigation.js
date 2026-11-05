import * as THREE from '../vendor/three/build/three.module.js';
import {MALL} from '../mall/masterplan-v66.mjs';
import {buildGameplayLayoutV70} from '../mall/gameplay-layout-v70.mjs';
import {doorDescriptors,findGroundBelow,resolveFlyLanding,crossesClosedDoor} from '../mall/editor-traversal-v1.mjs';

const EYE=1.7;
const shellLevel=y=>y>3?'M1':y<-1.5?'B1':'G';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const valid=v=>Number.isFinite(v);
export function createEditorNavigation({camera,orbit,domElement,shells,scene,onChange=()=>{},onDoorChange=()=>{}}){
 const doors=doorDescriptors(shells),doorMap=new Map();
 const layouts=new Map(MALL.levels.map(l=>[l.id,buildGameplayLayoutV70({chapter:6,level:l.id})]));
 const keys=new Set(),up=new THREE.Vector3(0,1,0);
 let mode='orbit',floor='G',lastGrounded={x:0,y:EYE,z:-60},gravityTarget=null;
 let unlockAll=true,dragMouse=false,lastPointer={x:0,y:0};
 const doorMaterial=new THREE.MeshStandardMaterial({color:0x334345,metalness:.27,roughness:.83,transparent:true,opacity:.87,side:THREE.DoubleSide});
 const doorGroup=new THREE.Group();doorGroup.name='Builder-only operable doors';scene.add(doorGroup);
 for(const d of doors){
  const root=new THREE.Group();root.name='builder_door_'+d.id;
  root.position.set(d.axis==='z'?d.start:d.at,d.y,d.axis==='z'?d.at:d.start);
  root.rotation.y=d.axis==='x'?-Math.PI/2:0;
  const leaves=[],count=d.width>2.65?2:1,leafWidth=d.width/count;
  for(let n=0;n<count;n++){
   const right=n===1,hinge=new THREE.Group();
   hinge.position.x=right?d.width:0;
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(leafWidth-.06,d.height-.16,.08),doorMaterial);
   mesh.position.set(right?-leafWidth/2:leafWidth/2,d.height/2,0);
   mesh.name='leaf_'+d.id+'_'+n;
   mesh.userData.editorDoorId=d.id;
   hinge.add(mesh);root.add(hinge);leaves.push({hinge,right});
  }
  const open=d.id!=='main_entry';
  for(const l of leaves)l.hinge.rotation.y=open?(l.right?-.5:.5)*Math.PI:0;
  doorGroup.add(root);doorMap.set(d.id,{...d,root,leaves,open,target:open});
 }
 const snapshot=()=>({mode,floor,unlockAll,doorCount:doorMap.size,
  position:{x:camera.position.x,y:camera.position.y,z:camera.position.z}});
 const notify=()=>onChange(snapshot());
 function updateFloor(){
  const feet=camera.position.y-EYE;
  const ground=findGroundBelow(camera.position.x,feet+.25,camera.position.z,shells);
  floor=ground===null?shellLevel(camera.position.y):shellLevel(ground);
 }
 function roomCenter(id){
  const room=MALL.rooms.find(r=>r.id===id);
  if(!room)throw Error('Unknown Pinewood room '+id);
  const l=MALL.levels.find(x=>x.id===room.level);
  return {room,x:(room.x1+room.x2)/2,y:l.y+EYE,z:(room.z1+room.z2)/2};
 }
 function gotoRoom(id){
  const p=roomCenter(id);floor=p.room.level;
  camera.position.set(p.x,p.y,p.z);
  const view=new THREE.Vector3(p.x,p.y,p.z-5);
  camera.lookAt(view);
  if(mode==='orbit'){
   orbit.target.copy(view);orbit.update();
  }else{
   lastGrounded={x:p.x,y:p.y,z:p.z};gravityTarget=null;
  }
  notify();return true;
 }
 function setMode(next){
  if(!['orbit','walk','fly'].includes(next))throw Error('Unknown editor navigation mode '+next);
  if(next===mode)return snapshot();
  if(next==='walk'&&mode==='orbit'){
   // Start in an authored collision-safe public corridor, not inside a prop.
   camera.position.set(0,EYE,-60);
   camera.lookAt(0,EYE,-64);
   lastGrounded={x:0,y:EYE,z:-60};
   floor='G';
  }
  if(next==='orbit'){
   if(document.pointerLockElement===domElement)document.exitPointerLock();
   orbit.enabled=true;orbit.target.copy(camera.position).add(new THREE.Vector3(0,0,-5));orbit.update();
   gravityTarget=null;
  }else if(next==='fly'){
   orbit.enabled=false;gravityTarget=null;
  }else if(mode==='fly'){
   gravityTarget=resolveFlyLanding(camera.position,lastGrounded,shells);
   orbit.enabled=false;
  }else orbit.enabled=false;
  mode=next;notify();return snapshot();
 }
 function toggleFly(){return setMode(mode==='fly'?'walk':'fly')}
 function setDoorOpen(id,open){
  const d=doorMap.get(id);if(!d)throw Error('No physical doorway '+id);
  d.target=!!open;return d.target;
 }
 function doorsOpenSet(){return new Set([...doorMap.values()].filter(d=>d.target).map(d=>d.id))}
 function setUnlockAll(value){
  unlockAll=!!value;
  if(!unlockAll){
   for(const d of doorMap.values())if(d.kind==='interior'&&d.id.includes('east_wing'))d.target=false;
  }
  notify();
 }
 function nearestDoor(){
  let found=null,min=4.2;
  for(const d of doorMap.values()){
   const x=d.axis==='z'?(d.start+d.end)/2:d.at;
   const z=d.axis==='x'?(d.start+d.end)/2:d.at;
   const distance=Math.hypot(camera.position.x-x,camera.position.z-z,camera.position.y-d.y-EYE);
   if(distance<min){min=distance;found=d}
  }
  return found;
 }
 function clickDoor(id){const d=doorMap.get(id);if(!d)return false;return setDoorOpen(id,!d.target)}
 function onKeyDown(e){
  const tag=document.activeElement?.tagName;
  if(['INPUT','SELECT','TEXTAREA'].includes(tag))return;
  if(mode==='orbit')return;
  keys.add(e.code);
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(e.code==='KeyF'){toggleFly();return}
  if(e.code==='KeyE'){
   const d=nearestDoor();
   if(d){const open=clickDoor(d.id);onDoorChange(d.id,open);notify()}
  }
 }
 function onKeyUp(e){keys.delete(e.code)}
 function onPointerDown(e){
  if(mode==='orbit')return;
  if(e.button===2){dragMouse=true;lastPointer={x:e.clientX,y:e.clientY}}
  if(e.button===0&&document.pointerLockElement!==domElement&&domElement.requestPointerLock)domElement.requestPointerLock();
 }
 function onPointerMove(e){
  if(mode==='orbit')return;
  if(document.pointerLockElement!==domElement&&!dragMouse)return;
  const dx=document.pointerLockElement===domElement?e.movementX:e.clientX-lastPointer.x;
  const dy=document.pointerLockElement===domElement?e.movementY:e.clientY-lastPointer.y;
  lastPointer={x:e.clientX,y:e.clientY};
  camera.rotation.order='YXZ';
  camera.rotation.y-=dx*.002;
  camera.rotation.x=clamp(camera.rotation.x-dy*.002,-1.48,1.48);
 }
 function onPointerUp(){dragMouse=false}
 function onContext(e){if(mode!=='orbit')e.preventDefault()}
 function step(delta){
  const dt=clamp(delta,0,.05);
  for(const d of doorMap.values()){
   for(const l of d.leaves){
    const goal=d.target?(l.right?-.5:.5)*Math.PI:0;
    l.hinge.rotation.y+=clamp(goal-l.hinge.rotation.y,-dt*2.6,dt*2.6);
   }
   d.open=d.target;
  }
  if(mode==='orbit')return;
  if(mode==='walk'&&gravityTarget){
   const target=gravityTarget;
   if(target.y>=camera.position.y||Math.abs(target.y-camera.position.y)<.04){
    camera.position.set(target.x,target.y,target.z);gravityTarget=null;
    lastGrounded={...target};updateFloor();notify();
   }else{
    camera.position.y=Math.max(target.y,camera.position.y-9.8*dt);
   }
   return;
  }
  const speed=(keys.has('ControlLeft')?12:5.2)*dt;
  const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
  const forward=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  if(mode==='walk'){right.y=0;forward.y=0;right.normalize();forward.normalize();}
  const deltaPos=new THREE.Vector3();
  if(keys.has('KeyW')||keys.has('ArrowUp'))deltaPos.add(forward);
  if(keys.has('KeyS')||keys.has('ArrowDown'))deltaPos.sub(forward);
  if(keys.has('KeyA')||keys.has('ArrowLeft'))deltaPos.sub(right);
  if(keys.has('KeyD')||keys.has('ArrowRight'))deltaPos.add(right);
  if(mode==='fly'){
   if(keys.has('Space'))deltaPos.add(up);
   if(keys.has('ShiftLeft')||keys.has('ShiftRight'))deltaPos.sub(up);
  }
  if(deltaPos.lengthSq()<.00001)return;
  deltaPos.normalize().multiplyScalar(speed);
  const next=camera.position.clone().add(deltaPos);
  if(mode==='walk'){
   const ground=findGroundBelow(next.x,camera.position.y-EYE+.3,next.z,shells);
   const possibleLevel=ground===null?floor:shellLevel(ground);
   const layout=layouts.get(possibleLevel);
   const from={x:camera.position.x,z:camera.position.z},to={x:next.x,z:next.z};
   if(crossesClosedDoor(from,to,doors,doorsOpenSet()))return;
   if(ground===null||!layout?.canStand(next.x,next.z)){
    // Exterior apron is walkable even though it isn't a named interior room.
    if(!(next.z>-22.5&&next.z<43&&next.x>=-50&&next.x<=90))return;
   }
   next.y=(ground??0)+EYE;
   lastGrounded={x:next.x,y:next.y,z:next.z};floor=possibleLevel;
  }
  if(valid(next.x)&&valid(next.y)&&valid(next.z))camera.position.copy(next);
 }
 document.addEventListener('keydown',onKeyDown);
 document.addEventListener('keyup',onKeyUp);
 domElement.addEventListener('pointerdown',onPointerDown);
 domElement.addEventListener('pointermove',onPointerMove);
 domElement.addEventListener('pointerup',onPointerUp);
 domElement.addEventListener('contextmenu',onContext);
 return {getState:snapshot,getDoorList:()=>doors.map(x=>({...x})),gotoRoom,setMode,toggleFly,setDoorOpen,
  clickDoor,getDoorState:id=>doorMap.get(id)?.target??null,setUnlockAll,update:step,
  dispose(){
   document.removeEventListener('keydown',onKeyDown);document.removeEventListener('keyup',onKeyUp);
   domElement.removeEventListener('pointerdown',onPointerDown);domElement.removeEventListener('pointermove',onPointerMove);
   domElement.removeEventListener('pointerup',onPointerUp);domElement.removeEventListener('contextmenu',onContext);
   if(document.pointerLockElement===domElement)document.exitPointerLock();
   scene.remove(doorGroup);doorMaterial.dispose();
   doorGroup.traverse(o=>{if(o.geometry)o.geometry.dispose()});
  }
 };
}
