/**
 * V119 original food-court concession architecture. Source's closed steel
 * shutter, ceramic kick and lintel are REAL shell walls. This component adds
 * only applied 1990s fascia, shutter ribbing, measured fixture housings and
 * mounted labels; it does not invent a second portal or a standalone mall.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {FOOD_COURT_V119} from './food-court-plan-v119.mjs';

function box(root,id,x,y,z,dx,dy,dz,mat){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(dx,dy,dz),mat);
 mesh.name=id;mesh.position.set(x,y,z);mesh.receiveShadow=true;root.add(mesh);return mesh;
}
function menuCanvas(booth){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
 const ctx=canvas.getContext('2d');
 if(!ctx)throw Error('Food court canvas menu board unavailable');
 ctx.fillStyle='#292e2d';ctx.fillRect(0,0,1024,256);
 ctx.fillStyle=booth.id==='coffee'?'#9b8265':booth.id==='slice'?'#98755f':'#75857a';
 ctx.fillRect(0,0,1024,24);
 ctx.fillStyle='#d5d0b5';ctx.fillRect(18,234,988,5);
 ctx.fillStyle='#e6e0cf';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 86px Arial,sans-serif';ctx.fillText(booth.name,512,110,967);
 ctx.font='bold 39px Arial,sans-serif';ctx.fillText(booth.subtitle,512,188,950);
 ctx.fillStyle='#958c7270';
 for(let i=0;i<90;i++)ctx.fillRect((i*131)%1024,(i*71)%250,2+(i%5),1+(i%3));
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 return texture;
}

export function renderFoodCourtV119(ground,plan=FOOD_COURT_V119){
 if(!ground?.isObject3D||plan.booths.length!==3)
  throw Error('V119 must mount against real sourced original ground-floor retail');
 const group=new THREE.Group();group.name='V119 closed food court kiosk fascia and fixtures';
 ground.add(group);
 const textures=[],owned=[];
 const steel=new THREE.MeshStandardMaterial({color:0x686960,roughness:.75,metalness:.55});
 const edge=new THREE.MeshStandardMaterial({color:0x343b3b,roughness:.66,metalness:.48});
 const faded=new THREE.MeshStandardMaterial({color:0xa49d84,roughness:.94});
 const fixtureGlass=new THREE.MeshStandardMaterial({color:0xb4b5a3,roughness:.35,
  emissive:0x564a34,emissiveIntensity:.45});
 owned.push(steel,edge,faded,fixtureGlass);
 const x=plan.vendorFrontX,manifest=[];
 for(const b of plan.booths){
  const length=b.end-b.start,mid=(b.start+b.end)/2,prefix='v119_'+b.id;
  // These strips ride ON the real shutter, not in front of invisible walls.
  for(let i=0;i<11;i++)
   box(group,prefix+'_roller_crease_'+i,x-.095,1.18+i*.175,mid,
    .055,.028,length-.09,steel);
  for(const z of [b.start+.07,b.end-.07]){
   box(group,prefix+'_shutter_track_'+z,x-.125,2.12,z,.09,2.36,.075,edge);
  }
  // A solid original-era tenant fascia, not a detached billboard.
  box(group,prefix+'_faded_fascia',x-.12,4.13,mid,.13,.89,length-.22,faded);
  const texture=menuCanvas(b),mat=new THREE.MeshBasicMaterial({
   map:texture,side:THREE.DoubleSide,transparent:false
  });
  textures.push(texture);owned.push(mat);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(4.45,length-.25),.68),mat);
  sign.name=prefix+'_concession_brand';
  sign.rotation.y=-Math.PI/2;sign.position.set(x-.204,4.12,mid);
  group.add(sign);
  // House a spent/muted fluorescent tube under each closed kiosk overhang.
  box(group,prefix+'_fluorescent_housing',x-.35,3.49,mid,.42,.13,1.84,edge);
  box(group,prefix+'_fluorescent_diffuser',x-.35,3.385,mid,.32,.056,1.73,fixtureGlass);
  // Keep lighting low; there is no magically glowing operating restaurant.
  const lamp=new THREE.PointLight(0xf0dbb3,2.7,7.2,2);
  lamp.position.set(x-.63,3.3,mid);
  lamp.name=prefix+'_failing_fixture';group.add(lamp);
  manifest.push({id:b.id,name:b.name,x,z:mid,frontLength:length,shutterClosed:true,
   fasciaHeight:4.12,counter:b.counter});
 }
 return {group,manifest,dispose(){
  textures.forEach(t=>t.dispose());
  owned.forEach(m=>m.dispose());
 }};
}
