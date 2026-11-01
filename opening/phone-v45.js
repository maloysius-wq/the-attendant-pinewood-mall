/**
 * The Call v45: first-person, handheld FIELD SERVICE phone.
 * Original scene prop and locally drawn CanvasTexture, NEVER a car mount or
 * duplicate vehicle. Animated against Renee's voice clock for repeatable QA.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {RiggedPlayerHand} from './makehuman-forearm-v54.js?v=54';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const paintRound=(c,x,y,w,h,r,color)=>{
 c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();
};
function makePhoneFace(){
 const canvas=document.createElement('canvas');canvas.width=600;canvas.height=1120;
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=8;
 return {canvas,texture};
}
function drawApp(canvas,state){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 c.fillStyle='#09151b';c.fillRect(0,0,w,h);
 c.fillStyle='#152e37';c.fillRect(0,0,w,150);
 c.fillStyle='#a3d2ca';c.font='bold 25px Arial';c.fillText('FIELD SERVICE',38,67);
 c.fillStyle='#eaf3f1';c.font='bold 37px Arial';c.fillText('Dispatch',38,120);
 c.fillStyle='#97aab0';c.font='23px Arial';c.fillText('AFTER-HOURS  /  WO-28417',36,203);
 c.fillStyle='#ffffff';c.font='bold 39px Arial';c.fillText('PINEWOOD MALL',36,278);
 c.fillStyle='#b3c2c6';c.font='24px Arial';c.fillText('EMERGENCY ELECTRICAL',36,325);
 c.strokeStyle='#315058';c.lineWidth=2;c.beginPath();c.moveTo(36,361);c.lineTo(w-36,361);c.stroke();
 if(state==='ticket'){
  c.fillStyle='#a7d2c6';c.font='bold 27px Arial';c.fillText('ASSIGNED SERVICE WORK',36,420);
  [['A','CONCOURSE LIGHTS'],['B','RETAIL / PA BRANCH'],['C','SERVICE / FREIGHT']].forEach(([id,label],i)=>{
   const y=466+i*130;paintRound(c,32,y,w-64,112,14,'#193039');
   c.fillStyle='#fad18c';c.font='bold 42px Arial';c.fillText(id,54,y+69);
   c.fillStyle='#eaf3f1';c.font='bold 24px Arial';c.fillText(label,116,y+66);
  });
  c.fillStyle='#ccd8d7';c.font='bold 24px Arial';c.fillText('VERIFY EAST FREIGHT ELEVATOR',38,918);
  paintRound(c,32,970,w-64,91,16,'#315f59');c.fillStyle='#e8fff7';c.font='bold 27px Arial';
  c.textAlign='center';c.fillText('VIEW SERVICE NOTES',w/2,1027);c.textAlign='left';
 }else{
  paintRound(c,34,408,w-68,200,18,'#162d34');
  c.fillStyle='#aabdc0';c.font='25px Arial';c.fillText('WORK ORDER STATUS',61,467);
  c.font='bold 42px Arial';c.fillStyle=state==='confirmed'?'#aef4c6':'#f5d29b';
  c.fillText(state==='confirmed'?'CHECKED IN':'AWAITING ARRIVAL',61,534);
  c.fillStyle='#b3c7c8';c.font='26px Arial';c.fillText('Property access: authorized',39,685);
  c.fillText('After-hours rate: approved',39,733);
  c.fillText('Dispatcher: Renee Ward',39,781);
  paintRound(c,32,873,w-64,130,20,state==='confirmed'?'#336357':'#c4a36d');
  c.textAlign='center';
  c.font='bold 35px Arial';c.fillStyle=state==='confirmed'?'#effff1':'#111c20';
  c.fillText(state==='confirmed'?'✓  DISPATCH NOTIFIED':'CHECK IN',w/2,947);
  c.textAlign='left';
 }
 c.fillStyle='#dce9e5';c.fillRect(246,1092,108,5);
}
function roundedSlab(w,h,depth,radius,material){
 const s=new THREE.Shape(),x=-w/2,y=-h/2,r=radius;
 s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
 s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
 s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
 s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
 const geo=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:2,steps:1,
  bevelSize:.003,bevelThickness:.003,curveSegments:6});
 const mesh=new THREE.Mesh(geo,material);mesh.position.z=-depth/2;return mesh;
}
export class HandheldCheckInPhone {
 constructor(camera){
  this.root=new THREE.Group();this.root.name='First-person handheld work-order phone';
  // This is an independent first-person prop, never part of the hatchback.
  camera.add(this.root);this.camera=camera;
  const body=new THREE.MeshStandardMaterial({color:0x222b30,roughness:.37,metalness:.48});
  const edge=new THREE.MeshStandardMaterial({color:0x61737a,roughness:.25,metalness:.75});
  this.root.add(roundedSlab(.245,.447,.027,.025,edge));
  const back=roundedSlab(.235,.435,.029,.021,body);back.position.z=.002;this.root.add(back);
  const {canvas,texture}=makePhoneFace();this.canvas=canvas;this.texture=texture;
  this.screen=new THREE.Mesh(new THREE.PlaneGeometry(.218,.386),
    new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false}));
  this.screen.position.set(0,-.005,.024);this.screen.name='Lit field service app screen';this.root.add(this.screen);
  const speaker=new THREE.Mesh(new THREE.BoxGeometry(.052,.003,.002),
    new THREE.MeshBasicMaterial({color:0x061115}));
  speaker.position.set(0,.208,.029);this.root.add(speaker);
  const lens=new THREE.Mesh(new THREE.SphereGeometry(.004,10,7),
    new THREE.MeshBasicMaterial({color:0x0c1417}));
  lens.position.set(-.070,.209,.027);this.root.add(lens);
  // Real CC0 rigged forearm and hand. The old capsule wrist/palm/thumb have
  // been REMOVED, not hidden beneath the imported arm.
  this.playerHand=new RiggedPlayerHand(this.root);
  this.handLoad=this.playerHand.load().catch(()=>null);
  // The app glass is 4.5mm in front of the chassis. Force the LCD pass
  // AFTER the case, writing the real plane depth for the skinned fingers
  // rendered afterward. Ordinary LEQUAL incorrectly hid the whole LCD
  // behind the case in this imported/foreground composition.
  this.screen.material.depthTest=true;
  this.screen.material.depthFunc=THREE.AlwaysDepth;
  this.screen.material.depthWrite=true;
  this.screen.renderOrder=10010;
  this.state='none';this.raised=false;this.tap=false;this.progress=0;this.root.visible=false;
  this.renderApp('pending');
 }
 renderApp(state){
  if(this.state===state)return;
  this.state=state;drawApp(this.canvas,state);this.texture.needsUpdate=true;
 }
 update(cue,seconds,voiceDuration,{reducedMotion=false}={}){
  const f=clamp(seconds/Math.max(.1,voiceDuration),0,1);
  let visibility=0,tap=0,state='pending';
  if(cue==='arrival'){
   visibility=ease((f-.24)/.19);
   tap=ease((f-.69)/.075)*(1-ease((f-.79)/.10));
   state=f>=.77?'confirmed':'pending';
  }else if(cue==='clock'){
   visibility=1-ease((f-.10)/.27);state='confirmed';
  }else if(cue==='work'){
   visibility=ease((f-.08)/.17)*(1-ease((f-.65)/.18));state='ticket';
  }
  this.progress=+visibility.toFixed(3);this.tap=tap>.08;this.raised=visibility>.05;
  this.root.visible=this.raised;
  this.renderApp(state);
  // Device lives BELOW the actual forward-looking driver camera, with no
  // dashboard attachment. Preserve a clear windshield when it is stowed.
  const compact=this.camera.aspect<1.15;
  const portrait=this.camera.aspect<.7;
  // Keep the phone in the lower-right quarter, sized like a handheld prop
  // across 390px mobile, narrow windows, and normal widescreen desktops.
  this.root.scale.setScalar(portrait?.48:compact?.56:.71);
  this.root.position.set(portrait?.06:compact?.105:.20,
    (compact?-.11:-.095)-.49*(1-visibility),
    -.51+.06*(1-visibility));
  this.root.rotation.set(-.075+.05*(1-visibility),-.14,-.09-.23*(1-visibility));
  this.playerHand.update(tap);
  if(!reducedMotion&&this.raised){
   this.root.position.y+=Math.sin(seconds*2.1)*.0018*visibility;
  }
  return this.status;
 }
 get status(){
  this.root.updateWorldMatrix(true,true);
  const corners=[[-.109,-.193],[.109,-.193],[-.109,.193],[.109,.193]]
   .map(([x,y])=>this.screen.localToWorld(new THREE.Vector3(x,y,0)).project(this.camera));
  const xs=corners.map(q=>(q.x+1)/2),ys=corners.map(q=>(1-q.y)/2);
  const screenViewport={left:+Math.min(...xs).toFixed(3),right:+Math.max(...xs).toFixed(3),
   top:+Math.min(...ys).toFixed(3),bottom:+Math.max(...ys).toFixed(3)};
  return {visible:this.root.visible,raised:this.raised,screenState:this.state,
   tap:this.tap,visibility:this.progress,screenViewport,screenPixels:[this.canvas.width,this.canvas.height],
   parent:this.root.parent?.isCamera?'camera':'unexpected',mounts:0,
   hand:this.playerHand.status};
 }
 dispose(){this.texture.dispose();}
}