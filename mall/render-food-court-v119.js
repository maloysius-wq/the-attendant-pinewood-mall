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
function menuCanvas(booth,width,height){
 const canvas=document.createElement('canvas');canvas.height=256;canvas.width=Math.round(canvas.height*width/height);
 const w=canvas.width,h=canvas.height,ctx=canvas.getContext('2d');
 if(!ctx)throw Error('Food court canvas menu board unavailable');
 const themes={slice:['#612e27','#d5ba84','Georgia, serif'],coffee:['#3c3026','#e0c9a7','Georgia, serif'],grill:['#344740','#e8d9b7','Arial, sans-serif']};
 const [background,ink,font]=themes[booth.id];
 ctx.fillStyle=background;ctx.fillRect(0,0,w,h);
 ctx.fillStyle=ink;ctx.fillRect(0,0,w,16);ctx.fillRect(24,h-22,w-48,4);
 ctx.textAlign='center';ctx.textBaseline='middle';
 const fit=(label,y,max)=>{
  let px=max;do{ctx.font='bold '+px+'px '+font;if(ctx.measureText(label).width<=w-96)break;px--;}while(px>12);
  ctx.fillStyle=ink;ctx.fillText(label,w/2,y);return ctx.measureText(label).width;
 };
 const nameWidth=fit(booth.name,108,96);fit(booth.subtitle,188,36);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 return {texture,nameWidth,pixelWidth:w,pixelHeight:h};
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
 const counterStone=new THREE.MeshStandardMaterial({color:0x9e9582,roughness:.87});
 owned.push(steel,edge,faded,fixtureGlass,counterStone);
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
  const signHeight=.68,signWidth=Math.min(4.45,length-.25,6.0*signHeight);
  const print=menuCanvas(b,signWidth,signHeight),mat=new THREE.MeshBasicMaterial({
   map:print.texture,side:THREE.FrontSide,transparent:false
  });
  textures.push(print.texture);owned.push(mat);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(signWidth,signHeight),mat);
  sign.name=prefix+'_concession_brand';
  sign.rotation.y=-Math.PI/2;sign.position.set(x-.204,4.12,mid);
  group.add(sign);
  // The counter is a walk-blocking physical building element registered
  // in the canonical shell. These finishes attach to its actual coordinates.
  const counterLength=b.end-b.start-.84;
  box(group,prefix+'_fixed_counter_worktop',b.counter.x,.97,b.counter.z,
   1.05,.12,counterLength+.11,counterStone);
  box(group,prefix+'_counter_edge',b.counter.x-.485,.90,b.counter.z,
   .045,.082,counterLength+.11,edge);
  for(let i=0;i<3;i++)box(group,prefix+'_counter_face_trim_'+i,
   b.counter.x-.442,.15+i*.27,b.counter.z,.05,.024,counterLength-.12,steel);
  // House a spent/muted fluorescent tube under each closed kiosk overhang.
  box(group,prefix+'_fluorescent_housing',x-.35,3.49,mid,.42,.13,1.84,edge);
  box(group,prefix+'_fluorescent_diffuser',x-.35,3.385,mid,.32,.056,1.73,fixtureGlass);
  // Keep lighting low; there is no magically glowing operating restaurant.
  const lamp=new THREE.PointLight(0xf0dbb3,2.7,7.2,2);
  lamp.position.set(x-.63,3.3,mid);
  lamp.name=prefix+'_failing_fixture';group.add(lamp);
  manifest.push({id:b.id,name:b.name,x,z:mid,frontLength:length,shutterClosed:true,builtInCounter:true,
   fasciaHeight:4.12,counter:b.counter,signWidth,signHeight,textureWidth:print.pixelWidth,textureHeight:print.pixelHeight,nameWidthPx:print.nameWidth});
 }
 return {group,manifest,dispose(){
  textures.forEach(t=>t.dispose());
  owned.forEach(m=>m.dispose());
 }};
}
