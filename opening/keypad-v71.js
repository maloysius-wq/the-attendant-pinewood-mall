/**
 * V71 contractor access: authentic vendored MakeHuman right arm presses the
 * EXISTING physical keypad after Renee finishes her warning. No extra speech.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';

export const CONTRACTOR_ACCESS_CODE='2841';
const keys={'1':[0,0],'2':[1,0],'3':[2,0],'4':[0,1],'5':[1,1],
 '6':[2,1],'7':[0,2],'8':[1,2],'9':[2,2]};
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

function screenTexture(){
 const canvas=document.createElement('canvas');canvas.width=320;canvas.height=150;
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 return {canvas,texture};
}

export class ContractorKeypadV71{
 constructor(stage){
  this.stage=stage;this.state='loading';this.entered='';this.confirmed=false;
  this.pressingDigit=null;this.pressCount=0;this.buttons=stage.serviceEntry.keypadButtons;
  const {canvas,texture}=screenTexture();this.canvas=canvas;this.texture=texture;
  const face=new THREE.Mesh(new THREE.PlaneGeometry(.32,.154),
   new THREE.MeshBasicMaterial({map:texture,side:THREE.FrontSide,depthTest:true}));
  face.name='Live contractor keypad numeric entry display';
  face.position.set(13.65,1.505,-21.63);stage.world.add(face);
  this.face=face;
  this.handRoot=new THREE.Group();
  this.handRoot.name='Player visibly enters contractor access code with licensed real arm';
  this.handRoot.visible=false;stage.world.add(this.handRoot);
  this.draw();
  this.ready=this.load();
 }
 draw(){
  const c=this.canvas.getContext('2d');
  c.fillStyle=this.confirmed?'#0d3726':'#0b2521';c.fillRect(0,0,320,150);
  c.textAlign='center';c.textBaseline='middle';
  c.font='bold 27px monospace';c.fillStyle='#8bc5ae';c.fillText('ACCESS',160,37);
  c.font='bold 54px monospace';c.shadowColor='#a8ffcc';c.shadowBlur=9;
  c.fillStyle=this.confirmed?'#c9ffd7':'#e1fae3';
  c.fillText(this.confirmed?'OPEN':this.entered.padEnd(4,'_'),160,97);
  this.texture.needsUpdate=true;
 }
 async load(){
  const url=new URL('./assets/v54/makehuman-right-forearm.glb',import.meta.url);
  const model=(await new GLTFLoader().loadAsync(url.href)).scene;
  model.name='Real CC0 MakeHuman keypad-pressing forearm';
  let bones={},skin=0;
  model.traverse(o=>{
   if(o.isBone)bones[o.name.replace(/([a-z0-9])([RL])$/,'$1.$2')]=o;
   if(o.isSkinnedMesh){
    skin++;o.frustumCulled=false;
    for(const material of Array.isArray(o.material)?o.material:[o.material]){
     material.side=THREE.DoubleSide;material.roughness=.88;
     material.color.set('#ad765b');material.needsUpdate=true;
    }
   }
  });
  if(skin!==1||!bones['wrist.R']||!bones['finger2-3.R'])
   throw Error('Keypad requires continuous CC0 rigged right forearm');
  this.handRoot.add(model);model.scale.setScalar(2.3);
  model.updateMatrixWorld(true);
  const wrist=bones['wrist.R'].getWorldPosition(new THREE.Vector3());
  const tip=bones['finger2-3.R'].getWorldPosition(new THREE.Vector3());
  const incoming=tip.clone().sub(wrist).normalize();
  const desired=new THREE.Vector3(.15,.08,-1).normalize();
  model.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(incoming,desired));
  model.updateMatrixWorld(true);
  const alignedTip=bones['finger2-3.R'].getWorldPosition(new THREE.Vector3());
  model.position.sub(alignedTip);model.updateMatrixWorld(true);
  this.hand=model;this.state='ready';return this;
 }
 update(cue,elapsed,voiceSeconds){
  if(this.state!=='ready')return;
  if(cue==='inside'||cue==='promise'||cue==='direction'){
   this.handRoot.visible=false;
   if(!this.confirmed){this.entered=CONTRACTOR_ACCESS_CODE;this.confirmed=true;this.draw();}
   return;
  }
  if(cue!=='lights'){
   this.handRoot.visible=false;
   if(!this.confirmed){this.entered='';this.pressCount=0;this.draw();}
   return;
  }
  // One second for the camera to finish its walk under the canopy.
  const after=elapsed-voiceSeconds-1.05;
  if(after<.10){
   this.handRoot.visible=false;this.entered='';this.confirmed=false;this.pressCount=0;
   this.pressingDigit=null;this.draw();return;
  }
  this.confirmed=after>=3.36;
  const pressed=CONTRACTOR_ACCESS_CODE.split('').filter((_,i)=>after>=.20+(i+.65)*.67).length;
  const next=CONTRACTOR_ACCESS_CODE.slice(0,pressed);
  if(this.entered!==next||this.pressCount!==pressed||this.confirmed){
   const changed=this.entered!==next||this.confirmed!==this.wasConfirmed;
   this.entered=next;this.pressCount=pressed;
   if(changed)this.draw();
  }
  this.wasConfirmed=this.confirmed;
  const step=clamp((after-.20)/.67,0,3.999);
  const index=Math.min(3,Math.floor(step));
  const digit=CONTRACTOR_ACCESS_CODE[index];
  const [col,row]=keys[digit];
  const cycle=step-index;
  const depression=Math.sin(Math.PI*clamp((cycle-.15)/.60,0,1));
  const x=13.52+col*.13,y=1.30-row*.11;
  this.handRoot.visible=after<3.1;
  this.handRoot.position.set(x,y,-21.54-depression*.12);
  this.pressingDigit=after<3.1?digit:null;
  for(const b of this.buttons){
   const currentlyPressed=this.pressingDigit===b.digit&&depression>.55;
   b.mesh.material.color.setHex(currentlyPressed?0x98d0af:0x727776);
   b.mesh.position.z=currentlyPressed?-21.683:-21.67;
  }
 }
 get status(){
  return {state:this.state,codeLength:CONTRACTOR_ACCESS_CODE.length,
   entered:this.entered,pressCount:this.pressCount,confirmed:this.confirmed,
   pressingDigit:this.pressingDigit,realHand:!!this.hand};
 }
}
