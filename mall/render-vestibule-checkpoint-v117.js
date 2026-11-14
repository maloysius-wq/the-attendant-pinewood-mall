/**
 * V117 fixed, source-aligned checkpoint trim. No movable furniture or new
 * meshes pretending to be rooms: actual walls, glass and false ceilings are
 * owned by constructPhysicalShell and shared by game, film and Builder.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {CHECKPOINT_V117} from './vestibule-checkpoint-v117.mjs';

function box(group,name,x,y,z,width,height,depth,material){
 const m=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),material);
 m.name=name;m.position.set(x,y,z);m.receiveShadow=true;group.add(m);return m;
}
function signTexture(title,subtitle){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
 const ctx=canvas.getContext('2d');
 if(!ctx)throw Error('V117 checkpoint label requires 2D canvas');
 ctx.fillStyle='#3a4340';ctx.fillRect(0,0,1024,256);
 ctx.fillStyle='#a79f82';ctx.fillRect(14,17,996,5);
 ctx.fillStyle='#dfd7c3';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 75px Arial,sans-serif';ctx.fillText(title,512,105,975);
 ctx.font='bold 29px Arial,sans-serif';ctx.fillText(subtitle,512,187,965);
 ctx.fillStyle='#8a88755a';
 for(let i=0;i<115;i++)ctx.fillRect((i*311)%1024,(i*97)%256,2+(i%4),1+(i%3));
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 return texture;
}
function sign(group,name,x,z,face,title,subtitle,materials,textures){
 const texture=signTexture(title,subtitle);
 textures.push(texture);
 const mat=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
 materials.push(mat);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(1.65,.42),mat);
 m.name='v117_'+name;
 m.position.set(x,2.77,z);
 m.rotation.y=face==='east'?Math.PI/2:-Math.PI/2;
 group.add(m);
}
/** Visible in all three environments. Every trim piece attaches to a real
 * interior partition with measured positions. No collider comes from here.
 */
export function renderVestibuleCheckpointV117(ground,plan=CHECKPOINT_V117){
 if(!ground?.isObject3D)throw Error('V117 requires actual ground-floor scene');
 const group=new THREE.Group();group.name='V117 after-hours service checkpoint finishes';
 ground.add(group);
 const steel=new THREE.MeshStandardMaterial({color:0x676e69,metalness:.54,roughness:.72});
 const skirting=new THREE.MeshStandardMaterial({color:0x484e4a,roughness:.88,metalness:.21});
 const materials=[steel,skirting],textures=[];
 const {window:w,approach}=plan;
 const zMid=(w.start+w.end)/2,length=w.end-w.start,faceX=w.at-.068;
 // West side of actual observation glazing faces the narrow contractor route.
 box(group,'v117_window_sill',faceX,w.bottom-.025,zMid,.10,.095,length+.14,steel);
 box(group,'v117_window_head',faceX,w.top+.025,zMid,.10,.095,length+.14,steel);
 for(const edge of [w.start,w.end])
  box(group,'v117_window_jamb_'+edge,faceX,(w.bottom+w.top)/2,edge,.10,w.top-w.bottom+.12,.08,steel);
 box(group,'v117_window_mullion',faceX,(w.bottom+w.top)/2,zMid,.10,w.top-w.bottom,.075,steel);
 // Structural base kick trim is keyed to the two original partitions, not
 // floating in the path or applied over the three-dimensional fire door.
 const wallLen=approach.endZ-approach.startZ;
 box(group,'v117_west_corridor_skirting',approach.west+.11,.115,
  (approach.startZ+approach.endZ)/2,.08,.19,wallLen-.04,skirting);
 box(group,'v117_east_corridor_skirting',approach.east-.11,.115,
  (approach.startZ+approach.endZ)/2,.08,.19,wallLen-.04,skirting);
 sign(group,'riser_notice',approach.west+.125,-28.1,'east',
  'SERVICE RISER','SEALED · MAINTENANCE ONLY',materials,textures);
 sign(group,'checkin_notice',approach.east-.125,-27.2,'west',
  'CHECK-IN OFFICE','AFTER HOURS · CLOSED',materials,textures);
 return {group,window:w,cells:plan.cells.length,clearWidth:approach.east-approach.west,
  dispose(){textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());}};
}
