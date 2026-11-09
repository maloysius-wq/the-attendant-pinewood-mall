import * as THREE from '../vendor/three/build/three.module.js';
import {PARKING_MARKINGS_V84,PARKING_MARKING_COUNTS_V84} from './parking-layout-v84.mjs';

/**
 * The ONLY new authored geometry in the exterior upgrade is thin PAINT.
 * Rendered as instanced, surface-hugging lines. The same staging is visible
 * in the opening cinematic and the standalone Builder.
 */
export function installParkingMarkingsV84(world){
 const group=new THREE.Group();
 group.name='V84 coherent mall parking-space and street PAINT';
 group.userData.paintedOnly=true;
 // Muted and weathered-looking without making new decal/texture assets.
 const styles={
  stall:{color:0xc0bdb0,opacity:.66},
  'stall-back':{color:0xb0b1a6,opacity:.50},
  lane:{color:0xc7bd88,opacity:.58},
  crosswalk:{color:0xcecbbf,opacity:.70},
  stop:{color:0xc5c0aa,opacity:.55}
 };
 const cube=new THREE.BoxGeometry(1,1,1);
 const y=.024; // above -0.005 m asphalt upper surface; no Z-fighting
 const registry={};
 for(const [kind,style] of Object.entries(styles)){
  const segments=PARKING_MARKINGS_V84.filter(s=>s.kind===kind);
  const material=new THREE.MeshBasicMaterial({
   color:style.color,transparent:true,opacity:style.opacity,
   depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2
  });
  const mesh=new THREE.InstancedMesh(cube,material,segments.length);
  mesh.name='V84 painted '+kind+' markings';
  mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=false;
  mesh.renderOrder=3;
  const dummy=new THREE.Object3D();
  for(let i=0;i<segments.length;i++){
   const s=segments[i],dx=s.x2-s.x1,dz=s.z2-s.z1;
   const length=Math.hypot(dx,dz);
   dummy.position.set((s.x1+s.x2)/2,y,(s.z1+s.z2)/2);
   dummy.rotation.set(0,Math.atan2(-dz,dx),0);
   dummy.scale.set(length,.009,s.width);
   dummy.updateMatrix();
   mesh.setMatrixAt(i,dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate=true;
  group.add(mesh);registry[kind]=segments.length;
 }
 group.userData.markingCounts={...PARKING_MARKING_COUNTS_V84,...registry};
 world.add(group);
 return group;
}
