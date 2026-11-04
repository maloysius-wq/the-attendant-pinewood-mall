/**
 * Reuses the SAME connected, locally licensed anatomical right hand which is
 * visibly proven during the check-in phone shot. During access-code entry the
 * phone case is hidden: the native INDEX finger points and presses each key.
 * The remaining fingers curl, then the calibrated phone grip is restored.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {ENTRY_CODE,keypadCenter} from './keypad-spec-v72.mjs';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export class KeypadReachHandV72{
 constructor(phoneCamera,handheld,stageScene){
  this.scene=stageScene;
  this.camera=phoneCamera;
  this.handheld=handheld;
  this.root=handheld.root;
  this.hand=handheld.playerHand;
  this.ready=handheld.handLoad;
  this.handOnly=false;this.digit=null;this.press=0;
  this.inFrame=false;this.displayPoint=[0,0];
 }
 showHandOnly(on){
  if(this.handOnly===on)return;
  this.handOnly=on;
  for(const part of this.root.children)
   part.visible=!on||part===this.hand.holder;
 }

 // Keep the same skinned CC0 hand, with a separate pointing pose for keypad.
 _capturePose(){
  const pose={bones:{},model:this.hand.model.quaternion.clone()};
  for(let n=1;n<=5;n++)for(let k=1;k<=3;k++){
   const id=`finger${n}-${k}.R`;
   pose.bones[id]=this.hand.bones[id].quaternion.clone();
  }
  return pose;
 }
 _applyPose(pose){
  for(const [id,q] of Object.entries(pose.bones))
   this.hand.bones[id].quaternion.copy(q);
  this.hand.model.quaternion.copy(pose.model);
  this.hand.model.updateMatrixWorld(true);
 }
 // Rotate a real bone by a vector measured in local phone coordinates.
 _aimJoint(id,from,to){
  if(from.lengthSq()<1e-9||to.lengthSq()<1e-9)return;
  const joint=this.hand.bones[id];
  this.hand.model.updateMatrixWorld(true);
  const frame=this.root.getWorldQuaternion(new THREE.Quaternion());
  const parent=joint.parent.getWorldQuaternion(new THREE.Quaternion());
  const turn=new THREE.Quaternion().setFromUnitVectors(from.normalize(),to.normalize());
  joint.quaternion.premultiply(parent.clone().invert().multiply(frame)
   .multiply(turn).multiply(frame.clone().invert()).multiply(parent));
  this.hand.model.updateMatrixWorld(true);
 }
 _beginPoint(){
  if(this.pointing)return;
  this.pointing=true;
  const hand=this.hand,b=hand.bones,at=id=>hand.point(id);
  this.phonePose=this._capturePose();
  // Release the index MCP from the back-of-phone grip. Its proximal
  // phalanx should follow the adjacent native finger before it points.
  this._aimJoint('finger2-1.R',
   at('finger2-2.R').sub(at('finger2-1.R')),
   at('finger3-2.R').sub(at('finger3-1.R')));
  // Extend the index: straighten its genuine interphalangeal joint.
  this._aimJoint('finger2-2.R',
   at('finger2-3.R').sub(at('finger2-2.R')),
   at('finger2-2.R').sub(at('finger2-1.R')));
  // The other three source fingers are flexed toward the palm at both
  // the knuckle and the middle joint, ending in a natural loose fist.
  for(const n of [3,4,5]){
   const root=`finger${n}-1.R`,pip=`finger${n}-2.R`,dip=`finger${n}-3.R`;
   const palm=at('wrist.R').sub(at(root)).normalize();
   const first=at(pip).sub(at(root));
   this._aimJoint(root,first.clone(),first.clone()
    .addScaledVector(palm,first.length()*.4));
   const outward=at(dip).sub(at(pip));
   const inward=at('wrist.R').sub(at(pip));
   let axis=outward.clone().cross(inward);
   if(axis.lengthSq()<1e-8)axis=outward.clone().cross(new THREE.Vector3(0,0,1));
   if(axis.lengthSq()<1e-8)axis=outward.clone().cross(new THREE.Vector3(0,1,0));
   this._aimJoint(pip,outward.clone(),outward.clone()
    .applyAxisAngle(axis.normalize(),1.25));
   b[dip].rotateX(.45);
   hand.model.updateMatrixWorld(true);
  }
  // Thumb curls in instead of continuing the phone-button tap.
  this._aimJoint('finger1-1.R',
   at('finger1-2.R').sub(at('finger1-1.R')),
   at('finger3-1.R').sub(at('finger1-1.R')));
  const thumbOut=at('finger1-3.R').sub(at('finger1-2.R'));
  const thumbIn=at('wrist.R').sub(at('finger1-2.R'));
  let thumbAxis=thumbOut.clone().cross(thumbIn);
  if(thumbAxis.lengthSq()<1e-8)thumbAxis=thumbOut.clone().cross(new THREE.Vector3(0,0,1));
  this._aimJoint('finger1-2.R',thumbOut.clone(),thumbOut.clone()
   .applyAxisAngle(thumbAxis.normalize(),1.12));
  b['finger1-3.R'].rotateX(.34);
  hand.model.updateMatrixWorld(true);
  const index=at('finger2-3.R').sub(at('finger2-1.R')).normalize();
  hand.model.quaternion.premultiply(new THREE.Quaternion()
   .setFromUnitVectors(index,new THREE.Vector3(-.035,-.095,-1).normalize()));
  hand.model.updateMatrixWorld(true);
  // Press using the farthest original index-skin vertex weighted to
  // its terminal bone, not a floating proxy or the thumb's phone target.
  const mesh=hand.skinnedMesh,g=mesh.geometry;
  const skin=g.getAttribute('skinIndex'),weight=g.getAttribute('skinWeight'),
   positions=g.getAttribute('position');
  const nativeId=mesh.skeleton.bones.indexOf(b['finger2-3.R']);
  const end=at('finger2-3.R'),
   dir=at('finger2-3.R').sub(at('finger2-2.R')).normalize();
  let far=-Infinity,chosen=null;const p=new THREE.Vector3();
  for(let i=0;i<positions.count;i++){
   if(![0,1,2,3].some(k=>skin.getComponent(i,k)===nativeId
    &&weight.getComponent(i,k)>=.30))continue;
   p.fromBufferAttribute(positions,i);mesh.applyBoneTransform(i,p);
   mesh.localToWorld(p);this.root.worldToLocal(p);
   const distance=p.sub(end).dot(dir);
   if(distance>far){far=distance;chosen=i;}
  }
  this.indexSkinVertex=chosen;
  // Straighten the final (DIP) segment as well: align the actual
  // skin-covered fingertip with the extended index bone chain.
  if(chosen!==null)this._aimJoint('finger2-3.R',
   this._indexTip().sub(at('finger2-3.R')),
   at('finger2-3.R').sub(at('finger2-2.R')));
  this.pointPose=this._capturePose();
 }
 _indexTip(){
  if(this.indexSkinVertex==null)return this.hand.point('finger2-3.R');
  const mesh=this.hand.skinnedMesh,p=new THREE.Vector3();
  p.fromBufferAttribute(mesh.geometry.getAttribute('position'),this.indexSkinVertex);
  this.hand.model.updateMatrixWorld(true);
  mesh.applyBoneTransform(this.indexSkinVertex,p);
  mesh.localToWorld(p);return this.root.worldToLocal(p);
 }
 _endPoint(){
  if(!this.pointing)return;
  this._applyPose(this.phonePose);
  this.pointing=false;this.phonePose=null;this.pointPose=null;this.indexSkinVertex=null;
  this.hand.update(0);
 }
 update(progress,active,worldCamera){
  const p=clamp(progress,0,1);
  // The player must first have reached the pad. Bring the existing connected
  // anatomical forearm in from the camera-side sleeve, then withdraw it.
  const reach=!!active&&p>.005&&p<.995&&this.hand.state==='ready';
  if(reach){this._beginPoint();this._applyPose(this.pointPose);}
  else this._endPoint();
  this.showHandOnly(reach);
  if(reach&&this.root.parent!==this.scene)this.scene.add(this.root);
  if(!reach&&this.root.parent!==this.camera)this.camera.add(this.root);
  if(!reach){
   this.root.visible=!!this.handheld.raised;
   this.digit=null;this.press=0;
   return;
  }
  // The forearm belongs to the REAL 3D world for physical keypad entry.
  // Moving the proven phone skin from the foreground camera to the same
  // stage as the keys gives it proper lighting, occlusion and actual contact.
  const slot=Math.min(3,Math.floor(p*4));
  const digit=ENTRY_CODE[slot],center=keypadCenter(digit);
  worldCamera.updateWorldMatrix(true,false);
  const normalized=new THREE.Vector3(...center).project(worldCamera);
  const sx=(normalized.x+1)/2,sy=(1-normalized.y)/2;
  this.worldCamera=worldCamera;
  this.digit=digit;this.displayPoint=[sx,sy];
  this.inFrame=sx>.02&&sx<.98&&sy>.02&&sy<.98;
  const scale=.96;
  this.root.visible=true;
  this.root.scale.setScalar(scale);
  this.root.quaternion.copy(worldCamera.getWorldQuaternion(new THREE.Quaternion()));
  const contact=new THREE.Vector3(...center);
  const towardEye=worldCamera.position.clone().sub(contact).normalize();
  const phase=p*4-slot;
  this.press=Math.max(0,Math.sin(phase*Math.PI));
  // Contact is made by INDEX skin, with a short lift between presses.
  const extended=contact.clone().addScaledVector(towardEye,.026*(1-this.press));
  const fromEye=worldCamera.position.clone()
   .addScaledVector(new THREE.Vector3(1,0,0).applyQuaternion(this.root.quaternion),.34)
   .addScaledVector(new THREE.Vector3(0,1,0).applyQuaternion(this.root.quaternion),-.34)
   .addScaledVector(new THREE.Vector3(0,0,-1).applyQuaternion(this.root.quaternion),.30);
  const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
  const reachWeight=ease(p/.11)*ease((1-p)/.055);
  this.root.position.copy(fromEye.lerp(extended,reachWeight))
   .sub(this._indexTip().multiplyScalar(scale).applyQuaternion(this.root.quaternion));
 }
 get status(){
  const renderCamera=this.handOnly?this.worldCamera:this.camera;
  renderCamera.updateWorldMatrix(true,false);
  const toViewport=point=>{
   const p=this.root.localToWorld(new THREE.Vector3(...point)).project(renderCamera);
   return [(p.x+1)/2,(1-p.y)/2,p.z];
  };
  const bone=this.hand.state==='ready'?this.hand.status:null;
  const indexSkinWorld=this.handOnly?this.root.localToWorld(this._indexTip()).toArray():null;
  let skinSamplesInView=0,skinSamples=0;
  const mesh=this.hand.skinnedMesh;
  if(this.handOnly&&mesh){
   mesh.updateMatrixWorld(true);mesh.skeleton.update();
   const attr=mesh.geometry.getAttribute('position'),pt=new THREE.Vector3();
   for(let i=0;i<attr.count;i+=37){
    pt.fromBufferAttribute(attr,i);mesh.applyBoneTransform(i,pt);
    mesh.localToWorld(pt);pt.project(renderCamera);skinSamples++;
    if(Math.abs(pt.x)<1&&Math.abs(pt.y)<1&&pt.z>=-1&&pt.z<=1)
     skinSamplesInView++;
   }
  }
  return {visible:this.handOnly&&this.root.visible,source:this.hand.state,
   digit:this.digit,press:this.press,inFrame:this.inFrame,
   targetViewport:this.displayPoint,realAnatomicalForearm:!!bone?.hasForearm,
   wristViewport:bone?.gripWristPosition?toViewport(bone.gripWristPosition):null,
   thumbViewport:bone?.gripThumbTipPosition?toViewport(bone.gripThumbTipPosition):null,
   gripFingerViewport:bone?.gripFingerTips?.Point?toViewport(bone.gripFingerTips.Point):null,
   indexSkinWorld,
   skinSamplesInView,skinSamples,rootPosition:this.root.position.toArray()};
 }
}
