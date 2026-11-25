/** Source-geometry media shelving, shared by legacy V69 and V124/V125.
 * Products stand ONLY on upward source surfaces with sampled support and
 * access from the measured open front. No substitute trays or arbitrary Y.
 */
import * as THREE from '../vendor/three/build/three.module.js';
const box=o=>new THREE.Box3().setFromObject(o);
const size=b=>b.getSize(new THREE.Vector3());
const center=b=>b.getCenter(new THREE.Vector3());
const ray=new THREE.Raycaster();
const normalMatrix=new THREE.Matrix3();
const N=new THREE.Vector3();
const down=new THREE.Vector3(0,-1,0);
function hits(object,origin,direction){
 ray.set(origin,direction);
 return ray.intersectObject(object,true);
}
function uprightSurfaces(model,b,x,z){
 const out=[];
 for(const h of hits(model,new THREE.Vector3(x,b.max.y+.05,z),down)){
  if(!h.face)continue;
  N.copy(h.face.normal).applyMatrix3(normalMatrix.getNormalMatrix(h.object.matrixWorld)).normalize();
  if(N.y<.85)continue;
  const y=h.point.y;
  if(!out.some(n=>Math.abs(n-y)<.008))out.push(y);
 }
 return out.sort((a,b)=>a-b);
}
function inferFront(model){
 model.updateMatrixWorld(true);
 const b=box(model),c=center(b),d=size(b),directions=[[0,1],[0,-1],[1,0],[-1,0]];
 const scores=directions.map(([x,z])=>{
  const depth=x?d.x:d.z,width=x?d.z:d.x;
  let sum=0,count=0;
  for(const h of [.18,.29,.39,.49,.59,.69,.79,.88])for(const k of [-.22,0,.22]){
   const origin=new THREE.Vector3(c.x+x*(depth/2+.03)+z*width*k,b.min.y+d.y*h,c.z+z*(depth/2+.03)-x*width*k);
   const hit=hits(model,origin,new THREE.Vector3(-x,0,-z))[0];
   sum+=hit?Math.max(0,Math.min(1,(hit.distance-.03)/depth)):1;count++;
  }
  return {direction:[x,z],score:sum/count};
 }).sort((a,b)=>b.score-a.score);
 return {front:scores[0].direction,scores};
}
const specifications={
 cassette:{w:.109,h:.069,d:.017,gap:.017,colors:[0x6f8781,0x9b7772,0x667e98,0xb09c70,0x7d6883,0x7a8456],
  titles:['NIGHT BUS','RIVER STATIC','SIDE B','GLASS ENGINE','PAPER STARS','NORTH END']},
 video:{w:.135,h:.205,d:.032,gap:.018,colors:[0x596f80,0x6d585e,0x687c60,0x9b8060,0x77708f,0x46686f],
  titles:['SILENT FREQUENCY','LAST LIGHTHOUSE','WILLOW STREET','NIGHT SHIFT','STATIC CITY','BLUE HORIZON']}
};
export function createMediaShelfResourcesV158(kind){
 const spec=specifications[kind];if(!spec)throw Error('Unknown period media '+kind);
 const bodyGeo=new THREE.BoxGeometry(spec.w,spec.h,spec.d);
 const coverGeo=new THREE.PlaneGeometry(spec.w*.91,spec.h*.9);
 const bodyMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.83});
 const covers=spec.colors.map((color,i)=>{
  const canvas=document.createElement('canvas');
  canvas.width=256;canvas.height=Math.round(256*spec.h/spec.w);
  const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  c.fillStyle='#'+color.toString(16).padStart(6,'0');c.fillRect(0,0,w,h);
  c.fillStyle='#e4d2ad';c.fillRect(10,10,w-20,3);c.fillRect(10,h-13,w-20,3);
  c.globalAlpha=.34;c.beginPath();c.arc(w*.5,h*.43,Math.min(w,h)*.27,0,Math.PI*2);c.fill();c.globalAlpha=1;
  c.textAlign='center';c.textBaseline='middle';
  const words=spec.titles[i].split(' '),font=Math.floor(Math.min(h*.15,w*.12));
  c.font='bold '+font+'px Arial';
  words.forEach((word,j)=>c.fillText(word,w/2,h*.63+j*font*.98));
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
  return new THREE.MeshStandardMaterial({map:t,roughness:.9});
 });
 return {spec,bodyGeo,coverGeo,bodyMaterial,covers,dispose(){
  bodyGeo.dispose();coverGeo.dispose();bodyMaterial.dispose();
  covers.forEach(m=>{m.map.dispose();m.dispose()});
 }};
}
function supportedSlots(model,b,spec){
 const d=size(b);
 const placements=[];
 for(const depthFraction of [.72,.62,.82,.52]){
  const z=b.min.z+d.z*depthFraction;
  const levels=uprightSurfaces(model,b,center(b).x,z);
  const slots=[];
  for(const y of levels){
   // Never fill the top of the cabinet or obstruct a low clearance shelf.
   if(y<b.min.y+.09||y>b.max.y-spec.h-.025)continue;
   const next=levels.find(level=>level>y+.02)??b.max.y;
   if(next-y<spec.h+.045)continue;
   const pitch=spec.w+spec.gap,n=Math.floor((d.x-.12)/pitch);
   for(let i=0;i<n;i++){
    const x=center(b).x+(i-(n-1)/2)*pitch;
    const corners=[[-1,-1],[-1,1],[1,-1],[1,1],[0,0]];
    if(!corners.every(([dx,dz])=>uprightSurfaces(model,b,x+dx*spec.w*.47,z+dz*spec.d*.47).some(level=>Math.abs(level-y)<.012)))continue;
    // Reject slots behind a solid cabinet front or through an upright.
    const sight=hits(model,new THREE.Vector3(x,y+spec.h*.55,b.max.z+.04),new THREE.Vector3(0,0,-1))[0];
    if(sight&&sight.point.z>z-spec.d*.52)continue;
    slots.push({x,y,z,row:y});
   }
  }
  placements.push(slots);
 }
 return placements.sort((a,b)=>b.length-a.length)[0]||[];
}
/** The source is normalized in a local +Z-forward frame, uniformly scaled,
 * then the complete grounded shelf + merchandise is turned toward its aisle.
 * Caller applies canonical world position after measuring original bounds.
 */
export function makeMeasuredMediaRackV158(source,{id,targetHeight,yaw=0,radius,resources}){
 const model=source.clone(true);model.updateMatrixWorld(true);
 const {front,scores}=inferFront(model);
 const turn=-Math.atan2(front[0],front[1]);
 model.rotation.y+=turn;model.updateMatrixWorld(true);
 let b=box(model),d=size(b);
 if(d.y<.05)throw Error('Invalid original open shelf '+id);
 const scale=targetHeight/d.y;model.scale.multiplyScalar(scale);model.updateMatrixWorld(true);
 b=box(model);d=size(b);
 if(Math.hypot(d.x/2,d.z/2)>radius+.015)throw Error('Full-size media rack exceeds its physical footprint '+id+' '+JSON.stringify(d.toArray()));
 const c=center(b);model.position.x-=c.x;model.position.y-=b.min.y;model.position.z-=c.z;model.updateMatrixWorld(true);
 b=box(model);
 const slots=supportedSlots(model,b,resources.spec);
 const {spec,bodyGeo,coverGeo,bodyMaterial,covers}=resources;
 const root=new THREE.Group();root.add(model);
 // All packages fit within source shelf geometry. Batching stock avoids
 // hundreds of new draw calls per store and preserves real product size.
 const body=new THREE.InstancedMesh(bodyGeo,bodyMaterial,slots.length);
 body.name='v158_measured_period_media_packages';
 const dummy=new THREE.Object3D(),tint=new THREE.Color();
 const artwork=Array.from({length:covers.length},()=>[]);
 for(let i=0;i<slots.length;i++){
  const p=slots[i],type=(i+id.length)%covers.length;
  dummy.position.set(p.x,p.y+spec.h/2+.002,p.z);dummy.updateMatrix();
  body.setMatrixAt(i,dummy.matrix);body.setColorAt(i,tint.setHex(spec.colors[type]));
  artwork[type].push(p);
 }
 if(slots.length){body.instanceMatrix.needsUpdate=true;root.add(body);}
 for(let i=0;i<artwork.length;i++){
  if(!artwork[i].length)continue;
  const prints=new THREE.InstancedMesh(coverGeo,covers[i],artwork[i].length);
  prints.name='v158_original_period_package_art';
  artwork[i].forEach((p,j)=>{
   dummy.position.set(p.x,p.y+spec.h/2+.002,p.z+spec.d/2+.001);dummy.updateMatrix();
   prints.setMatrixAt(j,dummy.matrix);
  });prints.instanceMatrix.needsUpdate=true;root.add(prints);
 }
 const rows=[...new Set(slots.map(p=>Number(p.y.toFixed(3))))];
 root.userData.mediaShelfV158={id,measuredFront:front,frontScores:scores,sourceDimensions:d.toArray(),supportRows:rows,
  products:slots.length,omitted:slots.length===0,productSize:[spec.w,spec.h,spec.d],
  supportMethod:'upward source triangles at four footprint corners plus open-front ray'};
 root.rotation.y=yaw;root.updateMatrixWorld(true);
 return root;
}
