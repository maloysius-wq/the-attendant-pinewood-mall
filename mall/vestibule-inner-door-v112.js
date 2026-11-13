import * as THREE from '../vendor/three/build/three.module.js';
import {vestibuleInnerPortalV112} from './vestibule-handoff-v112.mjs';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const metal=(color,roughness=.86)=>new THREE.MeshStandardMaterial({
 color,roughness,metalness:.38
});

// Structural door located in the EXISTING measured shell portal, not a second
// doorway cut through an arbitrary wall. Shared between cinematic and game.
export function mountVestibuleInnerDoorV112(building){
 if(!building?.group)throw TypeError('Shared Pinewood physical building is required');
 const portal=vestibuleInnerPortalV112();
 const group=new THREE.Group();group.name='V112 contractor vestibule to mall fire door';
 building.group.add(group);
 const frame=metal(0x353b39),leafMat=metal(0x45504c),trim=metal(0x74746a);
 const dark=metal(0x202727),glass=new THREE.MeshStandardMaterial({
  color:0x2b3c41,metalness:.18,roughness:.3,transparent:true,opacity:.86,
  side:THREE.DoubleSide
 });
 const owned=[frame,leafMat,trim,dark,glass],width=portal.width-.105;
 const box=(parent,name,w,h,d,x,y,z,material)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.name=name;mesh.position.set(x,y,z);
  mesh.castShadow=false;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 };
 const openingZ=portal.z+.025,hinge=portal.start+.052;
 // The existing physical portal is 2.5 m tall. Stay below its header.
 box(group,'service to mall steel left jamb',.064,2.45,.17,portal.start+.02,1.225,openingZ,frame);
 box(group,'service to mall steel right jamb',.064,2.45,.17,portal.end-.02,1.225,openingZ,frame);
 box(group,'service to mall steel header',portal.width,.09,.19,portal.x,2.405,openingZ,frame);
 const pivot=new THREE.Group();pivot.name='service to mall hinged fire leaf';
 pivot.position.set(hinge,0,openingZ);group.add(pivot);
 box(pivot,'closed interior fire door',width,2.32,.075,width/2,1.18,0,leafMat);
 box(pivot,'lower scuffed metal kickplate',width-.16,.42,.009,width/2,.30,.045,trim);
 box(pivot,'raised upper door panel',width-.21,1.10,.014,width/2,1.58,.049,frame);
 box(pivot,'narrow smoked safety glazing',.43,.50,.020,width/2,1.70,.060,glass);
 box(pivot,'safety window bottom frame',.47,.027,.028,width/2,1.43,.071,trim);
 box(pivot,'safety window top frame',.47,.027,.028,width/2,1.96,.071,trim);
 box(pivot,'push bar on vestibule face',width-.23,.048,.065,width/2,1.06,.104,trim);
 box(pivot,'door latch hardware',.062,.18,.083,width-.18,1.09,.080,dark);
 // A modest locally rendered inscription, not an external image request.
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
 const c=canvas.getContext('2d');
 if(!c)throw Error('Canvas texture unavailable for service fire door');
 c.fillStyle='#b7b5a4';c.fillRect(0,0,512,160);
 c.fillStyle='#26302d';c.textAlign='center';c.font='bold 32px sans-serif';
 c.fillText('MAIN CONCOURSE',256,66);
 c.font='22px sans-serif';c.fillText('FIRE DOOR  •  KEEP CLOSED',256,112);
 const signTexture=new THREE.CanvasTexture(canvas);
 signTexture.colorSpace=THREE.SRGBColorSpace;
 const signMat=new THREE.MeshStandardMaterial({map:signTexture,roughness:.89,metalness:.08});
 owned.push(signMat);
 box(pivot,'fire door concourse notice',.81,.25,.009,width/2,2.13,.061,signMat);
 let fraction=0,target=0,disposed=false;
 const control={
  portal,group,pivot,
  get state(){return {portal,angle:pivot.rotation.y,openFraction:fraction,
    closed:fraction<.001,opening:target>fraction,opened:target===1};},
  open(){if(disposed)return false;target=1;return true;},
  close(){if(disposed)return false;target=0;fraction=0;pivot.rotation.y=0;return true;},
  update(dt){
   if(disposed||fraction===target)return;
   fraction=clamp(fraction+Math.sign(target-fraction)*Math.min(Math.max(Number(dt)||0,0),.15)*1.65,0,1);
   if(Math.abs(fraction-target)<.001)fraction=target;
   // Positive yaw swings the real physical leaf away from the vestibule
   // into the atrium, leaving the measured x=9.1..10.9 passage clear.
   const eased=fraction*fraction*(3-2*fraction);
   pivot.rotation.y=Math.PI*.53*eased;
  },
  dispose(){
   if(disposed)return;disposed=true;building.group.remove(group);
   group.traverse(obj=>obj.geometry?.dispose?.());
   for(const mat of owned)mat.dispose();
   signTexture.dispose();
  }
 };
 return control;
}
