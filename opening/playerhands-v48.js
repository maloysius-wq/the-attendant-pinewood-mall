/**
 * v48: Original CC0 OpenGameArt Playerhands, including its FOREARM.
 * Retains the source's actual skin + armature. No procedural fingers, pills
 * or proxy arm meshes; joint-driven tap targets the button on the existing app.
 * Source/provenance: opening/assets/v48/manifest.json + LICENSES.md.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';

const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const eased=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};

export class RiggedPlayerHand {
 constructor(phoneRoot){
  this.phoneRoot=phoneRoot;
  this.holder=new THREE.Group();
  this.holder.name='CC0 Playerhands attached forearm and skinned hand';
  phoneRoot.add(this.holder);
  this.state='loading';this.meshCount=0;this.bones={};
  this.thumbTipDistance=null;this.lastTap=0;
  this.target=v(-.061,-.135,.044);
 }
 async load(){
  try{
   const uri=new URL('./assets/v48/manifest.json',import.meta.url);
   const res=await fetch(uri,{cache:'no-store'});
   if(!res.ok)throw Error('Missing locally vendored CC0 forearm manifest');
   const meta=await res.json();
   if(meta.version!==48||meta.license!=='CC0-1.0'||meta.model!=='playerhands-forearm.glb'
      ||!(/^[0-9a-f]{64}$/).test(meta.sha256))throw Error('Unverified CC0 forearm provenance');
   const modelUrl=new URL('./assets/v48/playerhands-forearm.glb',import.meta.url);
   modelUrl.searchParams.set('v',meta.sha256.slice(0,16));
   const gltf=await new GLTFLoader().loadAsync(modelUrl.href);
   const model=gltf.scene;
   model.name='sandsound CC0 Playerhands continuous forearm, real weighted mesh';
   const bones={};
   let skinned=0,meshes=0;
   model.traverse(obj=>{
    if(obj.isBone)bones[obj.name]=obj;
    if(obj.isMesh){
     meshes++;
     if(obj.isSkinnedMesh&&obj.skeleton?.bones?.length>=12)skinned++;
     // Foreground is rendered in its own depth-cleared pass. Preserve the
     // source mesh's front faces and real depth buffering: forcing DoubleSide
     // with depth disabled showed internal triangles through the skin.
     for(const material of Array.isArray(obj.material)?obj.material:[obj.material]){
      if(!material)continue;
      material.depthTest=true;material.depthWrite=true;
      material.side=THREE.FrontSide;
      material.needsUpdate=true;
     }
     obj.frustumCulled=false;
    }
   });
   for(const name of ['ArmUp','ArmDown','Hand','ThumbA','ThumbB','ThumbTip','PointTip'])
    if(!bones[name])throw Error('Missing original Playerhands bone '+name);
   if(skinned<1)throw Error('The actual forearm is not skinned to its armature');
   this.holder.add(model);
   // The Blender source uses oversized working units; normalize measured
   // real mesh bounds, NOT per-bone arbitrary sizes, to a 36cm forearm view.
   model.updateWorldMatrix(true,true);
   const box=new THREE.Box3().setFromObject(model);
   const sourceSize=box.getSize(new THREE.Vector3());
   const sourceWorldLong=Math.max(sourceSize.x,sourceSize.y,sourceSize.z);
   const phoneWorldScale=this.phoneRoot.getWorldScale(new THREE.Vector3()).x;
   // Normalize in PHONE-LOCAL meters so a 0.57x mobile phone doesn't get a
   // disproportionately gigantic fixed-world-size 0.37m arm.
   const sourceLong=sourceWorldLong/phoneWorldScale;
   if(!(sourceLong>0)||!(phoneWorldScale>0))throw Error('Empty Playerhands skinned forearm');
   model.scale.multiplyScalar(.37/sourceLong);
   model.updateWorldMatrix(true,true);
   // First align the source's knuckles toward the phone's left edge, then
   // put the actual hand/wrist bone at its natural device support point.
   const wrist=bones.Hand.getWorldPosition(new THREE.Vector3());
   const fingertip=bones.PointTip.getWorldPosition(new THREE.Vector3());
   const fingerDirection=fingertip.clone().sub(wrist).normalize();
   const intendedFingerDirection=v(.16,.97,.19).normalize();
   if(fingerDirection.lengthSq()>.9){
    const q=new THREE.Quaternion().setFromUnitVectors(fingerDirection,intendedFingerDirection);
    model.quaternion.premultiply(q);
   }
   model.updateWorldMatrix(true,true);
   // All model translations are in PHONE-LOCAL coordinates. In particular,
   // mobile scales the phone root to 0.57, so mixing a world delta here made
   // thumb placement screen-size dependent.
   const current=this.phoneRoot.worldToLocal(bones.Hand.getWorldPosition(new THREE.Vector3()));
   model.position.add(v(-.124,-.136,.070).sub(current));
   model.updateWorldMatrix(true,true);
   // Phone grip is constrained by the actual SOURCE thumb-tip vertex bone:
   // align its idle hover just left/above CHECK IN. This prevents the
   // 20-bone arm from reaching over the phone and missing the button.
   const currentTip=this.phoneRoot.worldToLocal(bones.ThumbTip.getWorldPosition(new THREE.Vector3()));
   model.position.add(v(-.086,-.098,.075).sub(currentTip));
   // The wrist and curled fingers support the BACK of the handset. Only
   // the thumb should travel in front of its glass during the check-in tap.
   model.position.z-=.055;
   model.updateWorldMatrix(true,true);
   this.model=model;this.bones=bones;this.meshCount=meshes;
   this.bindPoses={};
   for(const name of [
    'PinkyA','PinkyB','PinkyTip',
    'RingA','RingB','RingTip','FingerA','FingerB','FingerTip',
    'PointA','PointB','PointTip','ThumbA','ThumbB','ThumbTip'
   ]){
    if(bones[name])this.bindPoses[name]=bones[name].quaternion.clone();
   }
   // The forearm must remain physically continuous to the skinned hand.
   this.state='ready';
   this.update(this.lastTap);
   return this.status;
  }catch(error){
   this.state='failed';this.error=String(error);
   console.error('[The Call] CC0 Playerhands forearm load/rig failure:',error);
   throw error;
  }
 }
 thumbPos(){
  const bone=this.bones.ThumbTip;
  if(!bone)return null;
  return this.phoneRoot.worldToLocal(bone.getWorldPosition(new THREE.Vector3())).clone();
 }
 update(tap=0){
  this.lastTap=clamp(tap,0,1);
  if(this.state!=='ready')return this.status;
  for(const [name,q] of Object.entries(this.bindPoses))this.bones[name].quaternion.copy(q);
  // Curl original weighted finger joints around the BACK/left side of the
  // phone rather than leaving four long straight fingers over the app.
  for(const base of ['Pinky','Ring','Finger','Point']){
   if(this.bones[base+'A'])this.bones[base+'A'].rotateX(.38);
   if(this.bones[base+'B'])this.bones[base+'B'].rotateX(.42);
   if(this.bones[base+'Tip'])this.bones[base+'Tip'].rotateX(.12);
  }
  this.model.updateWorldMatrix(true,true);
  const start=this.thumbPos();
  // The thumb's actual three weighted bones approach the left half of the
  // screen's Check In button and withdraw. A four-iteration CCD pose solves
  // joint rotations toward the real on-screen target.
  const desired=start.clone().lerp(this.target,eased(this.lastTap));
  const worldGoal=this.phoneRoot.localToWorld(desired.clone());
  for(let iteration=0;iteration<5;iteration++){
   for(const name of ['ThumbTip','ThumbB','ThumbA']){
    const joint=this.bones[name];const tip=this.bones.ThumbTip;
    joint.updateWorldMatrix(true,true);tip.updateWorldMatrix(true,true);
    const pivot=joint.getWorldPosition(new THREE.Vector3());
    const end=tip.getWorldPosition(new THREE.Vector3());
    const current=end.sub(pivot),target=worldGoal.clone().sub(pivot);
    if(current.length()<.001||target.length()<.001)continue;
    const q=new THREE.Quaternion().setFromUnitVectors(current.normalize(),target.normalize());
    const angle=2*Math.acos(clamp(q.w,-1,1));
    if(angle>.24){const axis=new THREE.Vector3(q.x,q.y,q.z).normalize();q.setFromAxisAngle(axis,.24)}
    const parentQ=joint.parent.getWorldQuaternion(new THREE.Quaternion());
    const localDelta=parentQ.clone().invert().multiply(q).multiply(parentQ);
    joint.quaternion.premultiply(localDelta);
    joint.updateWorldMatrix(true,true);
   }
  }
  this.thumbTipDistance=+this.thumbPos().distanceTo(desired).toFixed(4);
  return this.status;
 }
 get status(){
  return {state:this.state,source:'OpenGameArt CC0 Playerhands (sandsound)',
   hasForearm:this.state==='ready'&&!!this.bones.ArmDown,
   skinnedMeshes:this.meshCount,boneCount:Object.keys(this.bones).length,
   thumbBones:['ThumbA','ThumbB','ThumbTip'].filter(n=>this.bones[n]).length,
   thumbTipDistance:this.thumbTipDistance,tapProgress:this.lastTap,error:this.error||null};
 }
}