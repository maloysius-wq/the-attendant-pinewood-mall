import * as THREE from '../vendor/three/build/three.module.js';
import {makeAreaSignPlanV104} from './area-sign-layout-v104.mjs';

// Development-only, non-colliding labels. The source text comes directly
// from the 41 authoritative room names, not from invented storefront names.
const COLORS={
 retail:['#293c3a','#e8d8b6','#b59264'],
 public:['#253c40','#dbe7de','#86aa9b'],
 staff:['#3c3731','#e5dbcc','#bca37e'],
 admin:['#303e43','#e4e1d3','#99a7a4'],
 plant:['#35403a','#dfdeca','#a2ac91'],
 stairs:['#394044','#e5dfcc','#a6b5b1'],
 egress:['#344b46','#e2eadc','#aac1a8'],
 sealed:['#443f3c','#e0d1c3','#bc9485'],
 control:['#36454c','#dce1df','#9fbdc2']
};
function canvasSign(p){
 const c=document.createElement('canvas');
 c.width=1024;c.height=320;
 const ctx=c.getContext('2d');
 if(!ctx)throw Error('Builder area sign canvas unavailable');
 const [ground,ink,accent]=COLORS[p.kind]||COLORS.staff;
 ctx.fillStyle=ground;ctx.fillRect(0,0,1024,320);
 ctx.strokeStyle=accent;ctx.lineWidth=10;ctx.strokeRect(14,14,996,292);
 ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=2;ctx.strokeRect(30,28,964,262);
 ctx.fillStyle=accent;ctx.textBaseline='middle';ctx.textAlign='left';
 ctx.font='600 26px Arial, sans-serif';
 ctx.fillText('PINEWOOD MALL   /   '+p.level+'   /   '+p.kind.toUpperCase(),57,55);
 ctx.textAlign='center';ctx.fillStyle=ink;
 const words=p.label.split(/\s+/);
 let fontSize=90,lines=[];
 const wrap=()=>{
  ctx.font='bold '+fontSize+'px Arial, sans-serif';
  const tentative=[];
  for(const word of words){
   const last=tentative.at(-1)||'';
   if(last&&ctx.measureText(last+' '+word).width<910)tentative[tentative.length-1]=last+' '+word;
   else tentative.push(word);
  }
  return tentative;
 };
 do{lines=wrap();if(lines.length<=2&&lines.every(line=>ctx.measureText(line).width<920))break;fontSize-=3}while(fontSize>36);
 if(lines.length>2){
  // Names may have lengthy archival qualifiers. Fit those without silently
  // truncating their canonical text.
  while(lines.length>2&&fontSize>27){fontSize-=2;lines=wrap()}
 }
 ctx.font='bold '+fontSize+'px Arial, sans-serif';
 const step=Math.min(96,fontSize*1.14),base=185-(lines.length-1)*step/2;
 for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],512,base+i*step);
 ctx.fillStyle=accent;ctx.font='500 22px Arial, sans-serif';
 ctx.fillText('AREA IDENTIFICATION  ·  BUILDER VIEW',512,287);
 const t=new THREE.CanvasTexture(c);
 t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
 t.userData.builderAreaSignV104=true;
 return t;
}

export function createAreaSignsV104({building}){
 if(!building?.group)throw TypeError('Loaded Pinewood building required');
 const placements=makeAreaSignPlanV104();
 const root=new THREE.Group();
 root.name='BUILDER ONLY · Canonical area signs';
 root.userData.builderAreaSignsV104=true;
 const backMaterial=new THREE.MeshStandardMaterial({
  color:0x263031,metalness:.12,roughness:.94,emissive:0x000000
 });
 const geometry=[];
 const materials=[backMaterial],textures=[];
 for(const p of placements){
  const marker=new THREE.Group();
  marker.name='AREA · '+p.label;
  marker.userData.builderAreaSignV104={id:p.id,label:p.label,level:p.level,portalId:p.portalId};
  marker.position.set(p.position.x,p.position.y,p.position.z);
  marker.rotation.y=p.axis==='x'?Math.PI/2:0;
  const frameGeo=new THREE.BoxGeometry(p.width+.1,p.height+.1,.065);
  const faceGeo=new THREE.PlaneGeometry(p.width,p.height);
  geometry.push(frameGeo,faceGeo);
  const frame=new THREE.Mesh(frameGeo,backMaterial);
  frame.name='area_sign_backer_'+p.id;marker.add(frame);
  const texture=canvasSign(p);textures.push(texture);
  const faceMaterial=new THREE.MeshStandardMaterial({
   name:'Physically lit area sign '+p.id,map:texture,metalness:0,roughness:1,
   emissive:0x000000,emissiveIntensity:0,side:THREE.FrontSide
  });
  materials.push(faceMaterial);
  for(const dir of [1,-1]){
   const face=new THREE.Mesh(faceGeo,faceMaterial);
   face.name='area_sign_face_'+p.id+(dir===1?'_front':'_back');
   face.position.z=dir*.037;
   face.rotation.y=dir===1?0:Math.PI;
   face.castShadow=false;face.receiveShadow=false;
   marker.add(face);
  }
  root.add(marker);
 }
 building.group.add(root);
 let visible=true;
 const getState=()=>({
  visible,count:placements.length,faceCount:placements.length*2,
  nonEmissive:materials.every(m=>!m.emissive||m.emissive.getHex()===0),
  labels:placements.map(p=>p.label),
  placements:placements.map(p=>({...p,position:{...p.position}}))
 });
 return{
  getState,
  setVisible(value){visible=!!value;root.visible=visible;return getState()},
  dispose(){
   root.removeFromParent();
   for(const g of geometry)g.dispose();
   for(const m of materials)m.dispose();
   for(const t of textures)t.dispose();
  }
 };
}
