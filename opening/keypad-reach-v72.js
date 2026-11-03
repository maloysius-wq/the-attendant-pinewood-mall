/**
 * A second presentation of the locally licensed, continuous right forearm
 * for the keypad. It is camera-composited against the real physical key
 * coordinates (no procedural fingers, external asset, or fake keypad image).
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {RiggedPlayerHand} from './makehuman-forearm-v58.js?v=58';
import {ENTRY_CODE,keypadCenter} from './keypad-spec-v72.mjs';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export class KeypadReachHandV72{
 constructor(){
  this.scene=new THREE.Scene();
  this.camera=new THREE.PerspectiveCamera(66,1,.05,10);
  this.scene.add(this.camera);
  this.scene.add(new THREE.AmbientLight(0xffffff,1.5));
  const key=new THREE.DirectionalLight(0xffead5,1.8);
  key.position.set(-1.4,2,3);this.scene.add(key);
  this.root=new THREE.Group();this.root.name='Anatomical contractor forearm reaching for access digits';
  this.camera.add(this.root);
  this.hand=new RiggedPlayerHand(this.root);
  this.ready=this.hand.load();
  this.root.visible=false;
  this.digit=null;this.press=0;this.inFrame=false;this.displayPoint=[0,0];
 }
 resize(aspect){this.camera.aspect=aspect;this.camera.updateProjectionMatrix()}
 update(progress,active,worldCamera){
  const p=clamp(progress,0,1);
  this.root.visible=!!active&&p>0&&p<1&&this.hand.state==='ready';
  if(!this.root.visible){this.digit=null;this.hand.update(0);return}
  const slot=Math.min(3,Math.floor(p*4));
  const digit=ENTRY_CODE[slot],center=keypadCenter(digit);
  worldCamera.updateWorldMatrix(true,false);
  const normalized=new THREE.Vector3(...center).project(worldCamera);
  const screenX=(normalized.x+1)/2,screenY=(1-normalized.y)/2;
  this.digit=digit;this.displayPoint=[screenX,screenY];
  this.inFrame=screenX>.02&&screenX<.98&&screenY>.02&&screenY<.98;
  const scale=.55,depth=.68,tangent=Math.tan(this.camera.fov*Math.PI/360);
  const target=this.hand.target;
  this.root.scale.setScalar(scale);
  this.root.position.set(normalized.x*depth*tangent*this.camera.aspect-target.x*scale,
   normalized.y*depth*tangent-target.y*scale,-depth-target.z*scale);
  const phase=p*4-slot;
  this.press=Math.max(0,Math.sin(phase*Math.PI));
  this.hand.update(this.press);
 }
 get status(){
  const toViewport=point=>{
   const p=this.root.localToWorld(new THREE.Vector3(...point)).project(this.camera);
   return [(p.x+1)/2,(1-p.y)/2,p.z];
  };
  const bone=this.hand.state==='ready'?this.hand.status:null;
  return {visible:this.root.visible,source:this.hand.state,
   digit:this.digit,press:this.press,inFrame:this.inFrame,
   targetViewport:this.displayPoint,realAnatomicalForearm:!!bone?.hasForearm,
   wristViewport:bone?.gripWristPosition?toViewport(bone.gripWristPosition):null,
   thumbViewport:bone?.gripThumbTipPosition?toViewport(bone.gripThumbTipPosition):null,
   gripFingerViewport:bone?.gripFingerTips?.Point?toViewport(bone.gripFingerTips.Point):null,
   rootPosition:this.root.position.toArray()};
 }
}
