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
 constructor(worldCamera){
  // The rig is an actual child of the world camera in the same scene as the
  // physical keypad. A second renderer pass previously never showed its skin.
  this.camera=worldCamera;
  this.root=new THREE.Group();this.root.name='Anatomical contractor forearm reaching for access digits';
  this.camera.add(this.root);
  this.fill=new THREE.PointLight(0xffdbbf,1.7,1.6,2);
  this.fill.position.set(.2,0,-.25);this.camera.add(this.fill);
  this.fill.visible=false;
  this.hand=new RiggedPlayerHand(this.root);
  this.ready=this.hand.load();
  this.root.visible=false;
  this.digit=null;this.press=0;this.inFrame=false;this.displayPoint=[0,0];
 }
 update(progress,active,worldCamera){
  const p=clamp(progress,0,1);
  this.root.visible=!!active&&p>0&&p<1&&this.hand.state==='ready';
  this.fill.visible=this.root.visible;
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
  let skinSamplesInView=0,skinSamples=0;
  const mesh=this.hand.skinnedMesh;
  if(this.root.visible&&mesh){
   this.camera.updateWorldMatrix(true,false);
   mesh.updateMatrixWorld(true);mesh.skeleton.update();
   const attr=mesh.geometry.getAttribute('position');
   const pt=new THREE.Vector3();
   for(let i=0;i<attr.count;i+=37){
    pt.fromBufferAttribute(attr,i);mesh.applyBoneTransform(i,pt);
    mesh.localToWorld(pt);pt.project(this.camera);skinSamples++;
    if(Math.abs(pt.x)<1&&Math.abs(pt.y)<1&&pt.z>=-1&&pt.z<=1)
     skinSamplesInView++;
   }
  }
  return {visible:this.root.visible,source:this.hand.state,skinSamplesInView,skinSamples,
   digit:this.digit,press:this.press,inFrame:this.inFrame,
   targetViewport:this.displayPoint,realAnatomicalForearm:!!bone?.hasForearm,
   wristViewport:bone?.gripWristPosition?toViewport(bone.gripWristPosition):null,
   thumbViewport:bone?.gripThumbTipPosition?toViewport(bone.gripThumbTipPosition):null,
   gripFingerViewport:bone?.gripFingerTips?.Point?toViewport(bone.gripFingerTips.Point):null,
   rootPosition:this.root.position.toArray()};
 }
}
