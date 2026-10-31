/**
 * v53: Original CC0 OpenGameArt Playerhands, including its FOREARM.
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
  this.hover=v(.061,-.135,.050);
  this.target=v(.061,-.135,.044);
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
     // Draw the real finger mesh AFTER the flat LCD texture, while depth
     // testing against the solid case so the grip stays physically layered.
     obj.renderOrder=10030;
     obj.frustumCulled=false;
    }
   });
   for(const name of ['ArmUp','ArmDown','Hand','ThumbA','ThumbB','ThumbTip','PointTip'])
    if(!bones[name])throw Error('Missing original Playerhands bone '+name);
   if(skinned<1)throw Error('The actual forearm is not skinned to its armature');
   this.holder.add(model);
   // The Blender source uses oversized working units; normalize measured
   // real mesh bounds, NOT per-bone arbitrary sizes, to a 66cm adult-scale foreground hand/forearm view.
   model.updateWorldMatrix(true,true);
   const box=new THREE.Box3().setFromObject(model);
   const sourceSize=box.getSize(new THREE.Vector3());
   const sourceWorldLong=Math.max(sourceSize.x,sourceSize.y,sourceSize.z);
   const phoneWorldScale=this.phoneRoot.getWorldScale(new THREE.Vector3()).x;
   // Normalize in PHONE-LOCAL meters so a 0.57x mobile phone doesn't get a
   // disproportionately gigantic fixed-world-size hand.
   const sourceLong=sourceWorldLong/phoneWorldScale;
   if(!(sourceLong>0)||!(phoneWorldScale>0))throw Error('Empty Playerhands skinned forearm');
   model.scale.multiplyScalar(.66/sourceLong);
   model.updateWorldMatrix(true,true);
   // Set the source full-length forearm upright below the PHONE'S RIGHT
   // edge. Only the anatomical Hand/finger/thumb joints make a grip.
   const phonePoint=bone=>this.phoneRoot.worldToLocal(bone.getWorldPosition(new THREE.Vector3()));
   const phoneRotation=this.phoneRoot.getWorldQuaternion(new THREE.Quaternion());
   const wrist=bones.Hand.getWorldPosition(new THREE.Vector3());
   const fingertip=bones.PointTip.getWorldPosition(new THREE.Vector3());
   const fingerDirection=fingertip.clone().sub(wrist)
    .applyQuaternion(phoneRotation.clone().invert()).normalize();
   const uprightForearm=v(.10,.98,-.15).normalize();
   if(fingerDirection.lengthSq()>.9){
    model.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(fingerDirection,uprightForearm));
   }
   model.updateWorldMatrix(true,true);
   const rotateWrist=(phoneLocalDelta)=>{
    const worldDelta=phoneRotation.clone().multiply(phoneLocalDelta)
     .multiply(phoneRotation.clone().invert());
    const parentWorld=bones.Hand.parent.getWorldQuaternion(new THREE.Quaternion());
    const localDelta=parentWorld.clone().invert().multiply(worldDelta).multiply(parentWorld);
    bones.Hand.quaternion.premultiply(localDelta);
    model.updateWorldMatrix(true,true);
   };
   // Temporarily curl the four ORIGINAL finger chains before solving the
   // wrist, so the fully curled, not merely straight, fingertips finish
   // leftward and behind the chassis. Restore before capturing bind poses.
   const curlBones=[];
   for(const base of ['Pinky','Ring','Finger','Point']){
    for(const [suffix,angle] of [['A',.70],['B',.80],['Tip',.25]]){
     const bone=bones[base+suffix];
     if(!bone)continue;
     curlBones.push([bone,bone.quaternion.clone()]);
     bone.rotateX(angle);
    }
   }
   model.updateWorldMatrix(true,true);
   const currentFingers=phonePoint(bones.PointTip).sub(phonePoint(bones.Hand)).normalize();
   // Natural RIGHT-HAND grip: the four fingers travel leftward and backward
   // across the REAR of the handset. The old upward target projected them as
   // exposed fingertips outside the phone's right edge.
   const gripFingers=v(-.85,.18,-.49).normalize();
   if(currentFingers.lengthSq()>.9){
    rotateWrist(new THREE.Quaternion().setFromUnitVectors(currentFingers,gripFingers));
   }
   // A right-hand thumb reaches INWARD from the right edge while the four
   // bent fingers and palm stay on the back side of the physical handset.
   // Anchor the wrist outside the RIGHT edge so ThumbA sits at the edge
   // and its tip can fold LEFT onto the glass; a too-inward thumb base
   // produced a horizontal, outward-pointing thumb over CHECK IN.
   const across=phonePoint(bones.ThumbA).sub(phonePoint(bones.Hand))
    .projectOnPlane(gripFingers).normalize();
   const desiredThumb=v(.68,.02,.73).projectOnPlane(gripFingers).normalize();
   if(across.lengthSq()>.9&&desiredThumb.lengthSq()>.9){
    const cross=new THREE.Vector3().crossVectors(across,desiredThumb);
    const angle=Math.atan2(gripFingers.dot(cross),across.dot(desiredThumb));
    rotateWrist(new THREE.Quaternion().setFromAxisAngle(gripFingers,angle));
   }
   for(const [bone,pose] of curlBones)bone.quaternion.copy(pose);
   model.updateWorldMatrix(true,true);
   // Align the original anatomical ThumbA knuckle, not the fingertip.
   // Its length scales with the source rig across viewport sizes, so keep
   // the knuckle just OUTSIDE the right case and BELOW the button. The palm
   // remains physically attached and behind the case; no detached thumb.
   const thumbSpan=phonePoint(bones.ThumbTip).distanceTo(phonePoint(bones.ThumbA));
   const thumbBaseAnchor=v(this.target.x+.65*thumbSpan,
    this.target.y-.30*thumbSpan,-.024);
   model.position.add(thumbBaseAnchor.sub(phonePoint(bones.ThumbA)));
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
   // Solve two modest poses ONCE against the original source rig. No
   // per-frame, unlimited 3D CCD: the old solver could reach the button
   // while twisting the painted nail back toward the thumb's base.
   const solveThumb=(goal,seed=null)=>{
    for(const name of ['ThumbA','ThumbB'])
     bones[name].quaternion.copy(seed?.[name]||this.bindPoses[name]);
    model.updateWorldMatrix(true,true);
    const targetWorld=this.phoneRoot.localToWorld(goal.clone());
    for(let iteration=0;iteration<32;iteration++){
     for(const name of ['ThumbB','ThumbA']){
      const joint=bones[name],tip=bones.ThumbTip;
      joint.updateWorldMatrix(true,true);tip.updateWorldMatrix(true,true);
      const pivot=joint.getWorldPosition(new THREE.Vector3());
      const current=tip.getWorldPosition(new THREE.Vector3()).sub(pivot);
      const toGoal=targetWorld.clone().sub(pivot);
      if(current.length()<.001||toGoal.length()<.001)continue;
      const delta=new THREE.Quaternion().setFromUnitVectors(current.normalize(),toGoal.normalize());
      const step=2*Math.acos(clamp(delta.w,-1,1));
      if(step>.16)delta.setFromAxisAngle(
       new THREE.Vector3(delta.x,delta.y,delta.z).normalize(),.16);
      const parentQ=joint.parent.getWorldQuaternion(new THREE.Quaternion());
      const localDelta=parentQ.clone().invert().multiply(delta).multiply(parentQ);
      const trial=localDelta.multiply(joint.quaternion.clone());
      const rest=this.bindPoses[name];
      const offset=rest.angleTo(trial);
      if(offset>.98)trial.copy(rest).slerp(trial,.98/offset);
      joint.quaternion.copy(trial);
      joint.updateWorldMatrix(true,true);
     }
     if(this.thumbPos().distanceTo(goal)<.004)break;
    }
    return {
     ThumbA:bones.ThumbA.quaternion.clone(),ThumbB:bones.ThumbB.quaternion.clone(),
     error:+this.thumbPos().distanceTo(goal).toFixed(4)
    };
   };
   this.thumbHoverPose=solveThumb(this.hover);
   this.thumbTapPose=solveThumb(this.target,this.thumbHoverPose);
   this.thumbPoseFit={hover:this.thumbHoverPose.error,tap:this.thumbTapPose.error};
   // The forearm remains one continuous skinned source hand.
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
  // Curl original weighted finger joints around the BACK/right side of the
  // phone rather than leaving four long straight fingers over the app.
  for(const base of ['Pinky','Ring','Finger','Point']){
   if(this.bones[base+'A'])this.bones[base+'A'].rotateX(.70);
   if(this.bones[base+'B'])this.bones[base+'B'].rotateX(.80);
   if(this.bones[base+'Tip'])this.bones[base+'Tip'].rotateX(.25);
  }
  this.model.updateWorldMatrix(true,true);
  // The button is directly beneath the resting thumb. Animate only
  // the bounded source thumb joints, pressing a few millimetres in Z
  // and retracting; never sweep an inverted finger across the glass.
  const t=eased(this.lastTap);
  for(const name of ['ThumbA','ThumbB']){
   this.bones[name].quaternion.slerpQuaternions(
    this.thumbHoverPose[name],this.thumbTapPose[name],t);
  }
  this.model.updateWorldMatrix(true,true);
  const desired=this.hover.clone().lerp(this.target,t);
  this.thumbTipDistance=+this.thumbPos().distanceTo(desired).toFixed(4);
  return this.status;
 }
 get status(){
  // Read-only anatomical probe for deterministic visual regression checks.
  const inPhone=bone=>this.phoneRoot.worldToLocal(bone.getWorldPosition(new THREE.Vector3()));
  const fingerDirection=this.state==='ready'
   ?inPhone(this.bones.PointTip).sub(inPhone(this.bones.Hand)).toArray():null;
  const thumbDirection=this.state==='ready'
   ?inPhone(this.bones.ThumbA).sub(inPhone(this.bones.Hand)).toArray():null;
  const fingerTips=this.state==='ready'?Object.fromEntries(
   ['Pinky','Ring','Finger','Point'].map(name=>[name,inPhone(this.bones[name+'Tip']).toArray()])
  ):null;
  return {gripFingerDirection:fingerDirection,gripThumbDirection:thumbDirection,
   gripFingerTips:fingerTips,
   gripThumbTipPosition:this.state==='ready'?this.thumbPos().toArray():null,
   gripThumbMiddlePosition:this.state==='ready'?inPhone(this.bones.ThumbB).toArray():null,
   gripThumbJointAngles:this.state==='ready'?{
    ThumbA:this.bindPoses.ThumbA.angleTo(this.bones.ThumbA.quaternion),
    ThumbB:this.bindPoses.ThumbB.angleTo(this.bones.ThumbB.quaternion)
   }:null,
   thumbPoseFit:this.thumbPoseFit||null,
   state:this.state,source:'OpenGameArt CC0 Playerhands (sandsound)',
   hasForearm:this.state==='ready'&&!!this.bones.ArmDown,
   skinnedMeshes:this.meshCount,boneCount:Object.keys(this.bones).length,
   thumbBones:['ThumbA','ThumbB','ThumbTip'].filter(n=>this.bones[n]).length,
   gripWristPosition:this.state==='ready'?inPhone(this.bones.Hand).toArray():null,
   thumbTarget:this.target.toArray(),hoverTarget:this.hover.toArray(),
   thumbTipDistance:this.thumbTipDistance,tapProgress:this.lastTap,error:this.error||null};
 }
}