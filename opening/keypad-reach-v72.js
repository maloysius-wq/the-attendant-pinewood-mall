/**
 * Independent native CC0 MakeHuman pointing arm for the contractor keypad.
 * The check-in phone keeps its own untouched grip and thumb animation.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {ENTRY_CODE,keypadCenter} from './keypad-spec-v72.mjs';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const fingerIds=Array.from({length:5},(_,i)=>i+1).flatMap(n=>[1,2,3].map(k=>'finger'+n+'-'+k+'.R'));

export class KeypadReachHandV72{
 constructor(phoneCamera,handheld,stageScene){
  this.scene=stageScene;this.camera=phoneCamera;this.handheld=handheld;
  this.root=new THREE.Group();this.root.name='Original CC0 keypad pointing forearm';
  this.root.visible=false;stageScene.add(this.root);
  this.hand={state:'loading',bones:{}};this.handOnly=false;
  this.digit=null;this.press=0;this.inFrame=false;this.displayPoint=[0,0];
  this.ready=this._load();
 }
 _point(name){
  const bone=this.hand.bones[name];
  if(!bone)return null;
  this.hand.model.updateMatrixWorld(true);
  return this.root.worldToLocal(bone.getWorldPosition(new THREE.Vector3()));
 }
 _bend(n){
  const p=k=>this._point('finger'+n+'-'+k+'.R');
  const a=p(1),b=p(2),c=p(3);
  return b.sub(a).angleTo(c.sub(p(2)));
 }
 _aimJoint(id,from,to){
  if(from.lengthSq()<1e-9||to.lengthSq()<1e-9)return;
  this.hand.model.updateMatrixWorld(true);
  const bone=this.hand.bones[id],parent=bone.parent.getWorldQuaternion(new THREE.Quaternion());
  const turn=new THREE.Quaternion().setFromUnitVectors(from.normalize(),to.normalize());
  bone.quaternion.premultiply(parent.clone().invert().multiply(turn).multiply(parent));
  this.hand.model.updateMatrixWorld(true);
 }
 _curl(n){
  const b=this.hand.bones,pip=b['finger'+n+'-2.R'],rest=pip.quaternion.clone();
  const distance=()=>this._point('finger'+n+'-3.R').distanceTo(this._point('wrist.R'));
  const options=[-.63,.63].map(angle=>{
   pip.quaternion.copy(rest).multiply(new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(1,0,0),angle));
   this.hand.model.updateMatrixWorld(true);
   return {angle,distance:distance()};
  }).sort((a,b)=>a.distance-b.distance);
  pip.quaternion.copy(rest).multiply(new THREE.Quaternion()
   .setFromAxisAngle(new THREE.Vector3(1,0,0),options[0].angle));
  b['finger'+n+'-3.R'].rotateX(options[0].angle*.20);
  this.hand.model.updateMatrixWorld(true);
 }
 _indexTip(){
  const mesh=this.hand.skinnedMesh,i=this.skinIndex;
  if(i==null)return this._point('finger2-3.R');
  const p=new THREE.Vector3().fromBufferAttribute(mesh.geometry.getAttribute('position'),i);
  this.hand.model.updateMatrixWorld(true);
  mesh.skeleton.update();mesh.applyBoneTransform(i,p);
  mesh.localToWorld(p);return this.root.worldToLocal(p);
 }
 _chooseSkin(){
  const mesh=this.hand.skinnedMesh,g=mesh.geometry,
   skin=g.getAttribute('skinIndex'),weights=g.getAttribute('skinWeight'),
   positions=g.getAttribute('position');
  const boneId=mesh.skeleton.bones.indexOf(this.hand.bones['finger2-3.R']);
  const end=this._point('finger2-3.R'),direction=end.clone()
   .sub(this._point('finger2-2.R')).normalize(),p=new THREE.Vector3();
  let far=-Infinity,chosen=null;
  for(let i=0;i<positions.count;i++){
   if(![0,1,2,3].some(k=>skin.getComponent(i,k)===boneId
     &&weights.getComponent(i,k)>=.30))continue;
   p.fromBufferAttribute(positions,i);mesh.applyBoneTransform(i,p);
   mesh.localToWorld(p);this.root.worldToLocal(p);
   const distance=p.sub(end).dot(direction);
   if(distance>far){far=distance;chosen=i}
  }
  if(chosen==null)throw Error('No weighted native index fingertip');
  this.skinIndex=chosen;
 }
 _orient(){
  const desired=new THREE.Vector3(-.27,.20,-.94).normalize(),model=this.hand.model;
  const finger=this._indexTip().sub(this._point('wrist.R')).normalize();
  model.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(finger,desired));
  model.updateMatrixWorld(true);
  // The pinky knuckle should be screen-right of the index knuckle.
  const side=this._point('finger5-1.R').sub(this._point('finger2-1.R'))
   .projectOnPlane(desired).normalize();
  const right=new THREE.Vector3(1,0,0).projectOnPlane(desired).normalize();
  if(side.lengthSq()>.5){
   const roll=Math.atan2(desired.dot(new THREE.Vector3().crossVectors(side,right)),side.dot(right));
   model.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(desired,roll));
  }
  model.updateMatrixWorld(true);
 }
 async _load(){
  try{
   const url=new URL('./assets/v54/makehuman-right-forearm.glb',import.meta.url);
   const gltf=await new GLTFLoader().loadAsync(url.href);
   const model=gltf.scene,bones={};let mesh=null,count=0;
   model.traverse(o=>{
    if(o.isBone)bones[o.name.replace(/([a-z0-9])([RL])$/,'$1.$2')]=o;
    if(!o.isMesh)return;
    count++;if(o.isSkinnedMesh)mesh=o;
    for(const mat of Array.isArray(o.material)?o.material:[o.material]){
     if(!mat)continue;
     mat.side=THREE.DoubleSide;mat.depthTest=true;mat.depthWrite=true;
     mat.roughness=.88;mat.color.set('#ad765b');mat.needsUpdate=true;
    }
    o.renderOrder=10030;o.frustumCulled=false;
   });
   if(count!==1||!mesh||mesh.geometry.getAttribute('position').count<6000
      ||fingerIds.some(id=>!bones[id])||!bones['wrist.R']||!bones['lowerarm01.R'])
    throw Error('Missing original continuous CC0 MakeHuman skin and native bones');
   this.root.add(model);model.scale.setScalar(2.4);model.updateMatrixWorld(true);
   this.hand.model=model;this.hand.bones=bones;this.hand.skinnedMesh=mesh;
   this.hand.nativePose=Object.fromEntries(fingerIds.map(n=>[n,bones[n].quaternion.toArray()]));
   // The index stays almost completely in its original straight pose.
   if(this._bend(2)>.22){
    const first=this._point('finger2-2.R').sub(this._point('finger2-1.R'));
    const second=this._point('finger2-3.R').sub(this._point('finger2-2.R'));
    this._aimJoint('finger2-2.R',second,first);
   }
   // Three loose, modest flexes: no phone grip and no clenched fist.
   for(const n of [3,4,5])this._curl(n);
   const base=bones['finger1-1.R'],original=base.quaternion.clone(),
    origin=this._point('finger1-1.R'),thumb=this._point('finger1-3.R').sub(origin),
    palm=this._point('finger3-1.R').sub(origin);
   if(thumb.angleTo(palm)>.65){
    const first=this._point('finger1-2.R').sub(origin);
    const aim=first.clone().lerp(palm.clone().setLength(first.length()),.40);
    this._aimJoint('finger1-1.R',first,aim);
    const delta=original.angleTo(base.quaternion);
    if(delta>.70)base.quaternion.slerpQuaternions(original,base.quaternion,.7/delta);
   }
   this._chooseSkin();this._orient();
   this.hand.state='ready';return this.status;
  }catch(error){
   this.hand.state='failed';this.hand.error=String(error);
   console.error('[Pinewood keypad] Native forearm failed:',error);throw error;
  }
 }
 update(progress,active,worldCamera){
  const p=clamp(progress,0,1),reach=!!active&&p>.005&&p<.995&&this.hand.state==='ready';
  this.handOnly=reach;this.root.visible=reach;
  if(!reach){this.digit=null;this.press=0;return}
  const slot=Math.min(3,Math.floor(p*4)),digit=ENTRY_CODE[slot],
    contact=new THREE.Vector3(...keypadCenter(digit));
  worldCamera.updateWorldMatrix(true,false);this.worldCamera=worldCamera;
  const ndc=contact.clone().project(worldCamera);
  this.displayPoint=[(ndc.x+1)/2,(1-ndc.y)/2];
  this.inFrame=Math.abs(ndc.x)<.96&&Math.abs(ndc.y)<.96;
  this.digit=digit;this.root.scale.setScalar(.96);
  this.root.quaternion.copy(worldCamera.getWorldQuaternion(new THREE.Quaternion()));
  const towardEye=worldCamera.position.clone().sub(contact).normalize();
  const phase=p*4-slot;this.press=Math.max(0,Math.sin(phase*Math.PI));
  const target=contact.clone().addScaledVector(towardEye,.026*(1-this.press));
  const fromEye=worldCamera.position.clone()
   .addScaledVector(new THREE.Vector3(1,0,0).applyQuaternion(this.root.quaternion),.34)
   .addScaledVector(new THREE.Vector3(0,1,0).applyQuaternion(this.root.quaternion),-.34)
   .addScaledVector(new THREE.Vector3(0,0,-1).applyQuaternion(this.root.quaternion),.30);
  const weight=smooth(p/.11)*smooth((1-p)/.055);
  this.root.position.copy(fromEye.lerp(target,weight))
   .sub(this._indexTip().multiplyScalar(this.root.scale.x).applyQuaternion(this.root.quaternion));
 }
 get status(){
  const ready=this.hand.state==='ready',camera=this.handOnly?this.worldCamera:this.camera;
  camera.updateWorldMatrix(true,false);
  const viewport=name=>{
   const point=this._point(name);
   if(point)this.root.localToWorld(point).project(camera);
   return point?[(point.x+1)/2,(1-point.y)/2,point.z]:null;
  };
  let skinSamplesInView=0,skinSamples=0;
  if(ready&&this.handOnly){
   const mesh=this.hand.skinnedMesh,pos=mesh.geometry.getAttribute('position'),pt=new THREE.Vector3();
   mesh.updateMatrixWorld(true);mesh.skeleton.update();
   for(let i=0;i<pos.count;i+=37){
    pt.fromBufferAttribute(pos,i);mesh.applyBoneTransform(i,pt);
    mesh.localToWorld(pt).project(camera);skinSamples++;
    if(Math.abs(pt.x)<1&&Math.abs(pt.y)<1&&pt.z>=-1&&pt.z<=1)skinSamplesInView++;
   }
  }
  return {visible:ready&&this.root.visible,source:this.hand.state,digit:this.digit,press:this.press,
   inFrame:this.inFrame,targetViewport:this.displayPoint,realAnatomicalForearm:ready,
   wristViewport:ready?viewport('wrist.R'):null,
   thumbViewport:ready?viewport('finger1-3.R'):null,
   gripFingerViewport:ready?viewport('finger2-3.R'):null,
   indexSkinWorld:ready&&this.handOnly?this.root.localToWorld(this._indexTip()).toArray():null,
   skinSamplesInView,skinSamples,rootPosition:this.root.position.toArray()};
 }
}
