/**
 * The Call v56: one authentic, high-detail CC0 MakeHuman/Innerscene right
 * forearm and hand with all original skin weights and finger joints.
 * No hand-only mesh, generated knuckles, nail proxies or capsule fingers.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';

const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const thumbNames=['finger1-1.R','finger1-2.R','finger1-3.R'];
const fingerNames=['finger2','finger3','finger4','finger5'];
const sourceText='MakeHuman/Innerscene CC0 continuous right forearm v56';

export class RiggedPlayerHand {
 constructor(phoneRoot){
  this.phoneRoot=phoneRoot;
  this.holder=new THREE.Group();
  this.holder.name='Connected CC0 right forearm and hand, high-detail source skin';
  phoneRoot.add(this.holder);
  this.state='loading';this.bones={};this.meshCount=0;
  this.hoverJoint=v(.086,-.151,.095);
  this.hover=null;
  this.target=v(.055,-.135,.028);
  this.thumbTipDistance=null;this.lastTap=0;
 }
 point(name){
  const bone=this.bones[name];
  if(!bone)return null;
  return this.phoneRoot.worldToLocal(bone.getWorldPosition(new THREE.Vector3())).clone();
 }

 // Original source SKIN, not the terminal-bone origin: every source vertex
 // in this probe is actually weighted to the original distal thumb bone.
 _probe(){
  const mesh=this.skinnedMesh,position=mesh.geometry.getAttribute('position');
  this.model.updateMatrixWorld(true);mesh.skeleton.update();
  const p=new THREE.Vector3(),pad=new THREE.Vector3();
  let minZ=Infinity,inFace=0,penetrated=0,buttonMinZ=Infinity,buttonCount=0;
  const buttonMinPoint=new THREE.Vector3();
  for(const i of this.thumbIndices){
   p.fromBufferAttribute(position,i);
   mesh.applyBoneTransform(i,p);
   mesh.localToWorld(p);this.phoneRoot.worldToLocal(p);
   if(i===this.thumbPadIndex)pad.copy(p);
   if(p.x>=-.109&&p.x<=.109&&p.y>=-.198&&p.y<=.188){
    inFace++;minZ=Math.min(minZ,p.z);
    if(p.z<.025)penetrated++;
   }
   if(p.x>=-.097&&p.x<=.097&&p.y>=-.158&&p.y<=-.113){
    buttonCount++;
    if(p.z<buttonMinZ){buttonMinZ=p.z;buttonMinPoint.copy(p);}
   }
  }
  return {pad,minZ:inFace?minZ:null,inFace,penetrated,
   buttonMinZ:buttonCount?buttonMinZ:null,buttonMinPoint:buttonCount?buttonMinPoint:null,
   buttonCount,patchCount:this.thumbIndices.length};
 }
 async load(){
  try{
   const manifestURL=new URL('./assets/v54/manifest.json',import.meta.url);
   const response=await fetch(manifestURL,{cache:'no-store'});
   if(!response.ok)throw Error('Missing locally vendored anatomical right forearm manifest');
   const manifest=await response.json();
   if(manifest.version!==54||manifest.license!=='CC0-1.0'
     ||manifest.model!=='makehuman-right-forearm.glb'
     ||!/^[a-f0-9]{64}$/.test(manifest.sha256)
     ||manifest.vertexCount<6000||manifest.triangles<10000)throw Error('Invalid MakeHuman v54 asset pin');
   const url=new URL('./assets/v54/makehuman-right-forearm.glb',import.meta.url);
   url.searchParams.set('v',manifest.sha256.slice(0,16));
   const gltf=await new GLTFLoader().loadAsync(url.href);
   const model=gltf.scene;model.name='CC0 MakeHuman real connected right arm skin and bone hierarchy';
   const bones={};let meshes=0,skinned=0,vertices=0;
   model.traverse(obj=>{
    // Three.js r180 PropertyBinding.sanitizeNodeName REMOVES source dots:
    // finger1-1.R is imported as finger1-1R. Restore source joint IDs.
    if(obj.isBone)bones[obj.name.replace(/([a-z0-9])([RL])$/, '$1.$2')]=obj;
    if(!obj.isMesh)return;
    meshes++;vertices+=obj.geometry?.getAttribute('position')?.count||0;
    if(obj.isSkinnedMesh&&obj.skeleton?.bones?.length>=100)skinned++;
    for(const mat of Array.isArray(obj.material)?obj.material:[obj.material]){
     if(!mat)continue;
     // The source thumb inner/nail faces otherwise look like a black hole
     // as it flexes: render its REAL backface skin, not an added cap.
     mat.side=THREE.DoubleSide;mat.depthTest=true;mat.depthWrite=true;
     mat.roughness=.88;
     mat.color.set('#ad765b');
     mat.needsUpdate=true;
    }
    obj.renderOrder=10030;
    obj.frustumCulled=false;
   });
   for(const name of ['lowerarm01.R','lowerarm02.R','wrist.R',...thumbNames,
      ...fingerNames.flatMap(base=>['-1.R','-2.R','-3.R'].map(s=>base+s))]){
    if(!bones[name])throw Error('Missing source anatomical joint '+name+'; imported bones='+Object.keys(bones).slice(0,170).join('|')+'; rendered meshes='+meshes+'; skinned='+skinned);
   }
   if(skinned!==1||meshes!==1||vertices<6000)throw Error('Not the verified single real skinned forearm');
   this.bones=bones;this.model=model;this.vertexCount=vertices;this.meshCount=meshes;
   this.holder.add(model);
   model.scale.setScalar(2.4);
   // The four source finger chains are curved around the back of the case
   // BEFORE computing the anatomical wrist-to-fingertip grip axes.
   for(const n of ['2','3','4','5']){
    bones['finger'+n+'-1.R'].rotateX(.40);
    bones['finger'+n+'-2.R'].rotateX(.52);
    bones['finger'+n+'-3.R'].rotateX(.16);
   }
   model.updateWorldMatrix(true,true);
   // Orient the WHOLE ORIGINAL skeleton, not its thumb or wrist, by two
   // independently observed anatomical directions: middle fingertip and
   // native thumb tip. Bone-local bind rotations remain completely intact.
   const wrist=this.point('wrist.R');
   const middle=this.point('finger3-3.R');
   const thumb=this.point('finger1-3.R');
   const sourceFinger=middle.clone().sub(wrist).normalize();
   const targetFinger=v(-.83,.55,-.10).normalize();
   model.quaternion.premultiply(
    new THREE.Quaternion().setFromUnitVectors(sourceFinger,targetFinger));
   model.updateWorldMatrix(true,true);
   const sourceThumb=this.point('finger1-3.R').sub(this.point('wrist.R'));
   const sourceSide=sourceThumb.clone().projectOnPlane(targetFinger).normalize();
   // Thumb remains on FRONT/RIGHT side while the four fingers wrap BEHIND.
   const desiredSide=v(0,0,1).projectOnPlane(targetFinger).normalize();
   if(sourceSide.lengthSq()>.5&&desiredSide.lengthSq()>.5){
    const cross=new THREE.Vector3().crossVectors(sourceSide,desiredSide);
    const roll=Math.atan2(targetFinger.dot(cross),sourceSide.dot(desiredSide));
    model.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(targetFinger,roll));
   }
   model.updateWorldMatrix(true,true);
   // Anchor the *unmodified source thumb tip* on the real check-in button.
   // This avoids the previous CCD inversion where the nail and thumb joint
   // traded places in order to hit a numerical target.
   model.position.add(this.hoverJoint.clone().sub(this.point('finger1-3.R')));
   model.updateWorldMatrix(true,true);
   // The thumb remains in its source shape at rest, still joined to the palm.
   model.updateWorldMatrix(true,true);
   // Select ORIGINAL distal skin vertices by the model's real weights.
   // The terminal joint is a pivot, NOT the flesh/nail that touches glass.
   const mesh=model.getObjectByProperty('type','SkinnedMesh');
   const si=mesh.geometry.getAttribute('skinIndex'),sw=mesh.geometry.getAttribute('skinWeight');
   const distalId=mesh.skeleton.bones.indexOf(bones['finger1-3.R']);
   const read=(attr,i)=>[attr.getX(i),attr.getY(i),attr.getZ(i),attr.getW(i)];
   const indices=[];
   for(let i=0;i<vertices;i++){
    const joints=read(si,i),weights=read(sw,i);
    if(joints.some((j,k)=>j===distalId&&weights[k]>=.30))indices.push(i);
   }
   if(indices.length<50)throw Error('Missing real source distal thumb pad patch: '+indices.length);
   this.skinnedMesh=mesh;this.thumbIndices=indices;
   // SkinnedMesh.updateMatrixWorld refreshes attached bindMatrixInverse.
   // updateWorldMatrix alone bypasses that subclass override until render.
   model.updateMatrixWorld(true);
   // Stable source vertex farthest beyond the terminal/thumb middle joint.
   const middleJoint=this.point('finger1-2.R'),lastJoint=this.point('finger1-3.R');
   const direction=lastJoint.clone().sub(middleJoint).normalize();
   const position=mesh.geometry.getAttribute('position');
   const p=new THREE.Vector3(),delta=new THREE.Vector3();
   let max=-Infinity,padId=indices[0];
   for(const i of indices){
    p.fromBufferAttribute(position,i);mesh.applyBoneTransform(i,p);
    mesh.localToWorld(p);this.phoneRoot.worldToLocal(p);
    const advance=delta.copy(p).sub(lastJoint).dot(direction);
    if(advance>max){max=advance;padId=i;}
   }
   this.thumbPadIndex=padId;
   const bone=bones['finger1-3.R'],rest=bone.quaternion.clone();
   const phoneQ=this.phoneRoot.getWorldQuaternion(new THREE.Quaternion());
   const parentQ=bone.parent.getWorldQuaternion(new THREE.Quaternion());
   const axes=[v(1,0,0),v(0,1,0),v(0,0,1)];
   const options=axes.map(a=>a.applyQuaternion(phoneQ).applyQuaternion(parentQ.clone().invert()).normalize());
   const hoverRaw=this._probe();
   const hoverBeforeSweep=JSON.stringify({pad:hoverRaw.pad.toArray(),min:hoverRaw.minZ,face:hoverRaw.inFace});
   const wristZ=this.point('wrist.R').z;
   const candidates=[],diagnostics=[];let firstPoseRecord=null;
   const samplePose=(axis,angle)=>{
    bone.quaternion.copy(rest).premultiply(
     new THREE.Quaternion().setFromAxisAngle(axis,angle));
    model.updateWorldMatrix(true,true);
    return this._probe();
   };
   // A flexion around the distal joint is the ONLY moving thumb DOF.
   // The complete skinned patch must stay outside the actual LCD plane at
   // every interpolation sample, not merely at the final bone coordinate.
   for(let axis=0;axis<options.length;axis++){
    for(let n=-29;n<=29;n++){
     if(Math.abs(n)<5)continue;
     const angle=n*.05,pose=samplePose(options[axis],angle);
     if(!firstPoseRecord)firstPoseRecord={axis,angle,pad:pose.pad.toArray(),min:pose.minZ,tipPoint:this.point('finger1-3.R').toArray()};
     const dz=this.target.z-pose.pad.z;
     const hoverPadZ=hoverRaw.pad.z+dz;
     const minAtContact=(pose.minZ??Infinity)+dz;
     const baseOK=wristZ+dz<-.015;
     const xyOK=pose.pad.x>=-.097&&pose.pad.x<=.097
       &&pose.pad.y>=-.158&&pose.pad.y<=-.113;
     const hoverOK=hoverPadZ>=.059&&(hoverRaw.minZ??Infinity)+dz>=.035;
     let safe=xyOK&&hoverOK&&baseOK&&pose.inFace>=10&&minAtContact>=.025;
     if(safe){
      const tap=bone.quaternion.clone();
      for(let step=1;step<=12;step++){
       bone.quaternion.slerpQuaternions(rest,tap,step/12);
       model.updateWorldMatrix(true,true);
       const mid=this._probe();
       if(mid.inFace&&mid.minZ+dz<.025-1e-5){safe=false;break;}
      }
      bone.quaternion.copy(tap);
     }
     if(safe){
      const xy=Math.hypot(pose.pad.x-this.target.x,pose.pad.y-this.target.y);
      candidates.push({axis,angle,dz,xy,score:xy*2+Math.abs(angle)*.004+Math.abs(dz)*.03});
     }else if(Math.abs(n)%5===0){
      diagnostics.push({axis,angle,z:+minAtContact.toFixed(3),
       hover:+hoverPadZ.toFixed(3),x:+pose.pad.x.toFixed(3),
       y:+pose.pad.y.toFixed(3),wrist:+(wristZ+dz).toFixed(3)});
     }
    }
   }
   bone.quaternion.copy(rest);model.updateWorldMatrix(true,true);
   candidates.sort((a,b)=>a.score-b.score);
   if(!candidates.length)throw Error('No anatomically safe distal-only tip contact. Context '+JSON.stringify({
      padId:this.thumbPadIndex,distalId,hoverBeforeSweep,firstPoseRecord,
      hoverPad:hoverRaw.pad.toArray(),restAfter:this._probe().pad.toArray(),
      hoverMin:hoverRaw.minZ,restJoint:this.point('finger1-3.R').toArray(),
      middleJoint:this.point('finger1-2.R').toArray(),
      wrist:this.point('wrist.R').toArray(),boneLocal:bone.position.toArray(),
      bindMatrix:mesh.bindMatrix.elements.map(v=>+v.toFixed(4)),
      inverse:mesh.skeleton.boneInverses[distalId].elements.map(v=>+v.toFixed(4))
     })+' Probe '+JSON.stringify(diagnostics.slice(0,48)));
   const best=candidates[0];
   // The body/forearm stays stationary: the entire tap happens at the
   // native distal thumb joint, with its real source skin still attached.
   model.position.z+=best.dz;
   model.updateMatrixWorld(true);
   bone.quaternion.copy(rest).premultiply(
    new THREE.Quaternion().setFromAxisAngle(options[best.axis],best.angle));
   model.updateMatrixWorld(true);
   const tapPose=bone.quaternion.clone(),tapPatch=this._probe();
   // The idle pose is intentionally UP AND AWAY from the button in the
   // phone's image plane, not lying visually across CHECK IN. Scan modest
   // native distal joint rotations about the local screen normal. A natural
   // single-joint arc from the raised pose to contact must remain collision
   // safe at every point, including before the LCD's click state changes.
   const raised=[];
   for(let k=-20;k<=20;k++){
    if(Math.abs(k)<3)continue;
    const angle=k*.05;
    bone.quaternion.copy(rest).premultiply(
     new THREE.Quaternion().setFromAxisAngle(options[2],angle));
    model.updateMatrixWorld(true);
    const q=bone.quaternion.clone(),probe=this._probe();
    if(probe.pad.y<tapPatch.pad.y+.016||probe.pad.z<.09
      ||probe.minZ===null||probe.minZ<.059||probe.penetrated)continue;
    let clear=true;
    for(let step=0;step<=20;step++){
     bone.quaternion.slerpQuaternions(q,tapPose,step/20);
     model.updateMatrixWorld(true);
     const p=this._probe();
     if(p.inFace&&p.minZ<.0249){clear=false;break;}
    }
    if(clear)raised.push({q,angle,hover:probe,score:
     (probe.pad.y-tapPatch.pad.y)*3+Math.min(.10,probe.minZ)*.08-Math.abs(angle)*.005});
   }
   raised.sort((a,b)=>b.score-a.score);
   if(!raised.length)throw Error('No collision-safe raised distal hover with visible y lift. Contact '+
    JSON.stringify({tapPad:tapPatch.pad.toArray(),touch:tapPatch.buttonMinPoint?.toArray(),
     minZ:tapPatch.minZ,sourceHover:this._probe().pad.toArray()}));
   const up=raised[0];
   // At doubled human-hand scale the native terminal joint originally sat
   // INSIDE the active glass. Park the whole static grip just beyond the
   // right bezel, leaving CHECK IN readable until the distal tip dips in.
   // This offset never animates; only the real terminal bone moves.
   this.gripStaticOffsetX=.045;
   model.position.x+=this.gripStaticOffsetX;
   bone.quaternion.copy(tapPose);model.updateMatrixWorld(true);
   const shiftedTap=this._probe();
   if(shiftedTap.buttonCount<10||shiftedTap.buttonMinZ===null
     ||shiftedTap.buttonMinZ<.0249||shiftedTap.buttonMinZ>.034)
    throw Error('Outward static grip cannot reach button safely: '+
     JSON.stringify({count:shiftedTap.buttonCount,z:shiftedTap.buttonMinZ,
      point:shiftedTap.buttonMinPoint?.toArray()}));
   bone.quaternion.copy(up.q);model.updateMatrixWorld(true);
   this.thumbHoverPose=Object.fromEntries(thumbNames.map(n=>[n,bones[n].quaternion.clone()]));
   this.thumbTapPose=tapPose;
   this.thumbTipBend=up.q.angleTo(tapPose);
   this.hover=this._probe().pad.clone();
   this.selectedTipSolver={...best,hoverAngle:up.angle,
    hoverPad:this.hover.toArray(),tapPad:tapPatch.pad.toArray(),
    actualContact:shiftedTap.buttonMinPoint?.toArray(),
    gripStaticOffsetX:this.gripStaticOffsetX,hoverCandidates:raised.length};
   for(let step=0;step<=32;step++){
    bone.quaternion.slerpQuaternions(up.q,tapPose,step/32);
    model.updateMatrixWorld(true);
    const check=this._probe();
    if(check.inFace&&check.minZ<.0249)throw Error(
     'Raised thumb penetration at phase '+step+'/32, minimum '+check.minZ);
   }
   bone.quaternion.copy(up.q);model.updateMatrixWorld(true);
   this.state='ready';this.update(0);
   return this.status;
  }catch(e){
   this.state='failed';this.error=String(e);
   console.error('[The Call] CC0 v56 anatomical forearm load failure:',e);
   throw e;
  }
 }
 update(tap=0){
  this.lastTap=clamp(tap,0,1);
  if(this.state!=='ready')return this.status;
  this.bones['finger1-3.R'].quaternion.slerpQuaternions(
   this.thumbHoverPose['finger1-3.R'],this.thumbTapPose,ease(this.lastTap));
  this.model.updateWorldMatrix(true,true);
  const probe=this._probe();
  this.thumbSurfaceStatus={minZ:probe.minZ,buttonMinZ:probe.buttonMinZ,
   buttonMinPoint:probe.buttonMinPoint?.toArray()||null,penetrated:probe.penetrated,
   inFace:probe.inFace,patchCount:probe.patchCount,pad:probe.pad.toArray()};
  const desired=this.hover.clone().lerp(this.target,ease(this.lastTap));
  this.thumbTipDistance=+probe.pad.distanceTo(desired).toFixed(4);
  return this.status;
 }
 get status(){
  const ready=this.state==='ready';
  const pt=n=>ready?this.point(n).toArray():null;
  const diff=(a,b)=>ready?this.point(a).sub(this.point(b)).toArray():null;
  const fingers=ready?Object.fromEntries(fingerNames.map((name,i)=>[
   ['Point','Finger','Ring','Pinky'][i],pt(name+'-3.R')])):null;
  return {
   state:this.state,source:sourceText,hasForearm:ready&&!!this.bones['lowerarm01.R'],
   skinnedMeshes:this.meshCount,boneCount:Object.keys(this.bones).length,vertexCount:this.vertexCount,
   thumbBones:ready?thumbNames.length:0,
   gripWristPosition:pt('wrist.R'),
   gripThumbBasePosition:pt('finger1-1.R'),
   gripThumbMiddlePosition:pt('finger1-2.R'),
   gripThumbTipPosition:pt('finger1-3.R'),
   gripThumbDirection:diff('finger1-1.R','wrist.R'),
   gripFingerDirection:diff('finger3-3.R','wrist.R'),
   gripFingerTips:fingers,
   gripThumbJointAngles:ready?{
    ThumbA:this.thumbHoverPose['finger1-1.R'].angleTo(this.bones['finger1-1.R'].quaternion),
    ThumbB:this.thumbHoverPose['finger1-2.R'].angleTo(this.bones['finger1-2.R'].quaternion),
    ThumbTip:this.thumbHoverPose['finger1-3.R'].angleTo(this.bones['finger1-3.R'].quaternion)
   }:null,
   thumbSurface:ready?this.thumbSurfaceStatus:null,
   handModelScale:ready?this.model.scale.x:null,
   gripStaticOffsetX:ready?this.gripStaticOffsetX:null,
   selectedTipSolver:ready?this.selectedTipSolver:null,
   sourceThumbContinuity:ready&&thumbNames.every(n=>this.bones[n]?.isBone),
   thumbTarget:this.target.toArray(),hoverTarget:this.hover?.toArray()||null,
   thumbTipDistance:this.thumbTipDistance,tapProgress:this.lastTap,error:this.error||null
  };
 }
}
