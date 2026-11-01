/**
 * The Call v54: one authentic, high-detail CC0 MakeHuman/Innerscene right
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
const sourceText='MakeHuman/Innerscene CC0 continuous right forearm v54';

export class RiggedPlayerHand {
 constructor(phoneRoot){
  this.phoneRoot=phoneRoot;
  this.holder=new THREE.Group();
  this.holder.name='Connected CC0 right forearm and hand, high-detail source skin';
  phoneRoot.add(this.holder);
  this.state='loading';this.bones={};this.meshCount=0;
  this.hover=v(.086,-.151,.052);
  this.target=v(.061,-.135,.032);
  this.thumbTipDistance=null;this.lastTap=0;
 }
 point(name){
  const bone=this.bones[name];
  if(!bone)return null;
  return this.phoneRoot.worldToLocal(bone.getWorldPosition(new THREE.Vector3())).clone();
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
     mat.side=THREE.FrontSide;mat.depthTest=true;mat.depthWrite=true;
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
   model.scale.setScalar(1.2);
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
   model.position.add(this.hover.clone().sub(this.point('finger1-3.R')));
   model.updateWorldMatrix(true,true);
   // The thumb remains in its source shape at rest, still joined to the palm.
   model.updateWorldMatrix(true,true);
   this.thumbHoverPose=Object.fromEntries(thumbNames.slice(0,2).map(n=>[n,bones[n].quaternion.clone()]));
   // At rest the connected thumb waits off the right/lower button edge;
   // pressing flexes two source joints inward/down against the glass.
   // Optimize two native joints in local bone axes, each <=.23 rad from
   // their bind poses, and penalize any visible sideways slide.
   const names=thumbNames.slice(0,2),axes=[v(1,0,0),v(0,1,0),v(0,0,1)];
   let params=[0,0,0,0,0,0];
   const apply=()=>{
    for(let n=0;n<2;n++){
     const bone=bones[names[n]];
     bone.quaternion.copy(this.thumbHoverPose[names[n]]);
     for(let axis=0;axis<3;axis++)bone.quaternion.multiply(
      new THREE.Quaternion().setFromAxisAngle(axes[axis],params[3*n+axis]));
    }
    model.updateWorldMatrix(true,true);
   };
   const objective=()=>{
    const p=this.point('finger1-3.R');
    const dx=p.x-this.target.x,dy=p.y-this.target.y,dz=p.z-this.target.z;
    return 3.0*(dx*dx+dy*dy)+dz*dz+
      .00008*params.reduce((sum,x)=>sum+x*x,0);
   };
   apply();
   for(const step of [.11,.055,.0275,.014]){
    for(let pass=0;pass<3;pass++){
     let changed=false;
     for(let i=0;i<6;i++){
      let best=params[i],bestLoss=objective();
      for(const direction of [-1,1]){
       const candidate=clamp(params[i]+direction*step,-.23,.23);
       const old=params[i];params[i]=candidate;apply();
       const loss=objective();
       if(loss<bestLoss-1e-10){bestLoss=loss;best=candidate;}
       params[i]=old;apply();
      }
      if(Math.abs(params[i]-best)>1e-8){params[i]=best;apply();changed=true;}
     }
     if(!changed)break;
    }
   }
   this.thumbTapPose=Object.fromEntries(names.map(n=>[n,bones[n].quaternion.clone()]));
   this.thumbJointOffsets=Object.fromEntries(names.map(n=>[
    n,this.thumbHoverPose[n].angleTo(this.thumbTapPose[n])]));
   this.state='ready';this.update(0);
   return this.status;
  }catch(e){
   this.state='failed';this.error=String(e);
   console.error('[The Call] CC0 v54 anatomical forearm load failure:',e);
   throw e;
  }
 }
 update(tap=0){
  this.lastTap=clamp(tap,0,1);
  if(this.state!=='ready')return this.status;
  for(const n of thumbNames.slice(0,2))this.bones[n].quaternion.slerpQuaternions(
   this.thumbHoverPose[n],this.thumbTapPose[n],ease(this.lastTap));
  this.model.updateWorldMatrix(true,true);
  const desired=this.hover.clone().lerp(this.target,ease(this.lastTap));
  this.thumbTipDistance=+this.point('finger1-3.R').distanceTo(desired).toFixed(4);
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
    ThumbB:this.thumbHoverPose['finger1-2.R'].angleTo(this.bones['finger1-2.R'].quaternion)
   }:null,
   sourceThumbContinuity:ready&&thumbNames.every(n=>this.bones[n]?.isBone),
   thumbTarget:this.target.toArray(),hoverTarget:this.hover.toArray(),
   thumbTipDistance:this.thumbTipDistance,tapProgress:this.lastTap,error:this.error||null
  };
 }
}
