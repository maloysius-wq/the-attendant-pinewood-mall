/** V129 original hand-lettered 1997 service fascia, mounted on the
 * REAL source masonry at the newly sealed 85m² Fallow's north firebreak.
 * It is signage, never a procedural stand-in for licensed furniture. */
import * as THREE from '../vendor/three/build/three.module.js';
import {FIREBREAK_PLATE_V129,validateFirebreakV129} from './residual-firebreak-plan-v129.mjs';
export function renderFirebreakPlateV129(ground,plan=FIREBREAK_PLATE_V129,sourceWalls=[]){
 if(!ground?.isObject3D)throw TypeError('original ground-floor source group missing');
 const physical=sourceWalls.find(w=>w.role==='v129-firebreak-partition'&&
  w.axis==='x'&&Math.abs(w.at-plan.wallX)<.001&&
  w.start<=plan.z-plan.width/2&&w.end>=plan.z+plan.width/2);
 if(!physical||plan.face!==1)throw Error('original firebreak plate has no REAL source masonry');
 const errors=validateFirebreakV129({plate:plan});
 if(errors.length)throw Error('source V129 plate invalid '+errors.join(' | '));
 const root=new THREE.Group();
 root.name='v129_original_Fallows_north_wall_fixed_closure_sign';
 const backing=new THREE.Mesh(new THREE.BoxGeometry(.10,plan.height,plan.width),
  new THREE.MeshStandardMaterial({color:0x454846,roughness:.90,metalness:.14}));
 backing.name='actual_masonry_attached_Fallows_stock_plate_backing';
 backing.position.set(plan.wallX+.16,plan.y,plan.z);
 backing.receiveShadow=true;root.add(backing);
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=256;
 const ctx=canvas.getContext('2d');
 if(!ctx)throw Error('original 1997 sign rendering unavailable');
 ctx.fillStyle='#333a36';ctx.fillRect(0,0,1536,256);
 ctx.fillStyle='#9c9177';ctx.fillRect(10,13,1516,6);
 ctx.fillStyle='#c4c0b0';ctx.textAlign='center';
 ctx.font='bold 81px Arial,sans-serif';ctx.fillText(plan.header,768,109,1440);
 ctx.font='bold 55px Arial,sans-serif';ctx.fillText(plan.subtitle,768,204,1400);
 for(let i=0;i<46;i++){
  const x=5+(i*127)%1511,y=4+(i*71)%246;
  ctx.fillStyle=i%2?'#e9e4cc16':'#050c0b2a';ctx.fillRect(x,y,3+i%5,1+i%3);
 }
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const print=new THREE.Mesh(new THREE.PlaneGeometry(plan.width-.11,plan.height-.07),
  new THREE.MeshStandardMaterial({map:tex,roughness:.96,side:THREE.FrontSide}));
 print.rotation.y=Math.PI/2;
 print.position.set(plan.wallX+.215,plan.y,plan.z);
 print.name='original_1997_letterpress_Fallows_north_stock_transfer';
 root.add(print);ground.add(root);
 return {root,manifest:{id:plan.id,room:'v129_fallows_north_firebreak',
  sourceWallId:physical.id,wallX:plan.wallX,backX:backing.position.x,
  face:plan.face,y:plan.y,z:plan.z,width:plan.width,
  originalArtwork:true,actualMasonry:true,permanentlySealed:true},
  dispose(){root.removeFromParent();backing.geometry.dispose();backing.material.dispose();
   print.geometry.dispose();print.material.dispose();tex.dispose();}};
}
