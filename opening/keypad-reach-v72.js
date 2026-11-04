/**
 * Reuses the SAME connected, locally licensed anatomical right hand which is
 * visibly proven during the check-in phone shot. During access-code entry the
 * phone case is hidden, leaving the native hand skin and thumb to press the
 * real physical keypad. No duplicate GLB, fake fingers or remote asset.
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
 update(progress,active,worldCamera){
  const p=clamp(progress,0,1);
  // The player must first have reached the pad. Bring the existing connected
  // anatomical forearm in from the camera-side sleeve, then withdraw it.
  const reach=!!active&&p>.005&&p<.995&&this.hand.state==='ready';
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
  const target=this.hand.target;
  this.root.quaternion.copy(worldCamera.getWorldQuaternion(new THREE.Quaternion()));
  const contact=new THREE.Vector3(...center);
  const towardEye=worldCamera.position.clone().sub(contact).normalize();
  const extended=contact.clone().addScaledVector(towardEye,.12);
  const fromEye=worldCamera.position.clone()
   .addScaledVector(new THREE.Vector3(1,0,0).applyQuaternion(this.root.quaternion),.34)
   .addScaledVector(new THREE.Vector3(0,1,0).applyQuaternion(this.root.quaternion),-.34)
   .addScaledVector(new THREE.Vector3(0,0,-1).applyQuaternion(this.root.quaternion),.30);
  const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
  const reachWeight=ease(p/.11)*ease((1-p)/.055);
  this.root.position.copy(fromEye.lerp(extended,reachWeight))
   .sub(target.clone().multiplyScalar(scale).applyQuaternion(this.root.quaternion));
  const phase=p*4-slot;
  this.press=Math.max(0,Math.sin(phase*Math.PI));
  this.hand.update(this.press);
 }
 get status(){
  const renderCamera=this.handOnly?this.worldCamera:this.camera;
  renderCamera.updateWorldMatrix(true,false);
  const toViewport=point=>{
   const p=this.root.localToWorld(new THREE.Vector3(...point)).project(renderCamera);
   return [(p.x+1)/2,(1-p.y)/2,p.z];
  };
  const bone=this.hand.state==='ready'?this.hand.status:null;
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
   skinSamplesInView,skinSamples,rootPosition:this.root.position.toArray()};
 }
}
