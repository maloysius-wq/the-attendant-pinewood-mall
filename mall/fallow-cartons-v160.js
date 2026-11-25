/** V160 original period gift/accessory cartons on real Fallow's GLB surfaces.
 * No fabricated primary fittings. Each carton needs five upward triangle
 * contacts at one level; inaccessible, occupied and unsupported slots are omitted.
 * Coordinate calculations take place in the actual assembled source group.
 */
import * as THREE from '../vendor/three/build/three.module.js';
const ray=new THREE.Raycaster(),normalMatrix=new THREE.Matrix3(),normal=new THREE.Vector3();
const down=new THREE.Vector3(0,-1,0);
function surfaces(model,b,x,z){
 ray.set(new THREE.Vector3(x,b.max.y+.05,z),down);
 const levels=[];
 for(const hit of ray.intersectObject(model,true)){
  if(!hit.face)continue;
  normal.copy(hit.face.normal).applyMatrix3(normalMatrix.getNormalMatrix(hit.object.matrixWorld)).normalize();
  if(normal.y<.85)continue;
  if(!levels.some(y=>Math.abs(y-hit.point.y)<.008))levels.push(hit.point.y);
 }
 return levels.sort((a,b)=>b-a);
}
function supported(model,b,x,z,w,d,y){
 return [[0,0],[-.47,-.47],[-.47,.47],[.47,-.47],[.47,.47]].every(([a,c])=>
  surfaces(model,b,x+a*w,z+c*d).some(h=>Math.abs(h-y)<.012));
}
const designs=[
 ['FALLOW’S','GIFT SOAP','#8e7967'],['FALLOW’S','HOSIERY','#765b59'],
 ['FALLOW’S','HANDKERCHIEFS','#657a73'],['FALLOW’S','GIFT SET','#897f55']
];
function materials(){
 return designs.map(([brand,title,color])=>{
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const c=canvas.getContext('2d');c.fillStyle=color;c.fillRect(0,0,256,128);
  c.strokeStyle='#d8c9a9';c.lineWidth=3;c.strokeRect(7,7,242,114);
  c.fillStyle='#e8dac3';c.textAlign='center';c.font='bold 27px Georgia';c.fillText(brand,128,42);
  c.font='bold 18px Arial';c.fillText(title,128,70);c.font='13px Arial';c.fillText('DEPARTMENT STORE · 1997',128,103);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  return new THREE.MeshStandardMaterial({map:tex,roughness:.86});
 });
}
export function stockFallowDisplaysV160(group,fixtures,manifest){
 group.updateMatrixWorld(true);
 const root=new THREE.Group();root.name='v160_fallows_original_printed_gift_cartons';
 const mats=materials(),geometry=new THREE.BoxGeometry(.22,.10,.14);
 const placements=mats.map(()=>[]),report=[];
 for(const f of fixtures.filter(f=>f.room==='west_anchor'&&['table_large','wall_bay'].includes(f.source))){
  const model=group.getObjectByName('v121_original_store_fixture_'+f.id);
  if(!model)throw Error('V160 missing original stock support '+f.id);
  const b=new THREE.Box3().setFromObject(model),center=b.getCenter(new THREE.Vector3()),size=b.getSize(new THREE.Vector3());
  const table=f.source==='table_large',turn=Math.abs(Math.sin(f.yaw))>.5;
  const slots=[];
  if(table){
   // Existing V123 center stock (up to .69m wide) stays independent and clear.
   // Use the outer edges of the real large tabletop, not its reserved center.
   for(const dx of [-.53,.53])for(const dz of [-.25,.25]){
    const x=center.x+dx,z=center.z+dz,y=b.max.y;
    if(supported(model,b,x,z,.22,.14,y))slots.push({x,y,z,yaw:0});
   }
  }else{
   // Source wall bays may be rails rather than shelves. Test the actual
   // horizontal support and open customer-facing ray, never invent a shelf.
   const yaw=f.yaw,fx=Math.sin(yaw),fz=Math.cos(yaw),sideX=Math.cos(yaw),sideZ=-Math.sin(yaw);
   const width=turn?size.z:size.x,depth=turn?size.x:size.z;
   const halfW=turn?.07:.11,halfD=turn?.11:.07;
   for(const fraction of [.22,.08,-.08]){
    const trial=[];
    for(let i=0;i<Math.floor((width-.12)/.24);i++){
     const n=Math.floor((width-.12)/.24),offset=(i-(n-1)/2)*.24;
     const x=center.x+sideX*offset+fx*depth*fraction,z=center.z+sideZ*offset+fz*depth*fraction;
     for(const y of surfaces(model,b,x,z)){
      if(y<b.min.y+.20||y>b.max.y-.12)continue;
      if(!supported(model,b,x,z,halfW*2,halfD*2,y))continue;
      ray.set(new THREE.Vector3(x+fx*(depth+.18),y+.055,z+fz*(depth+.18)),new THREE.Vector3(-fx,0,-fz));
      const obstruction=ray.intersectObject(model,true)[0];
      if(obstruction&&(obstruction.point.x-x)*fx+(obstruction.point.z-z)*fz>-.06)continue;
      trial.push({x,y,z,yaw});
     }
    }
    if(trial.length>slots.length){slots.length=0;slots.push(...trial)}
   }
  }
  for(const [i,s] of slots.entries())placements[(f.id.length+i)%mats.length].push(s);
  report.push({id:f.id,cartons:slots.length,slots:slots.map(s=>({x:s.x,z:s.z,supportY:s.y})),support:'five upward source-triangle contacts',centerReserved:table});
 }
 const dummy=new THREE.Object3D();
 for(let i=0;i<mats.length;i++){
  const slots=placements[i];if(!slots.length)continue;
  const mesh=new THREE.InstancedMesh(geometry,mats[i],slots.length);
  mesh.name='v160_original_period_carton_batch_'+i;
  slots.forEach((s,j)=>{dummy.position.set(s.x,s.y+.052,s.z);dummy.rotation.y=s.yaw;dummy.updateMatrix();mesh.setMatrixAt(j,dummy.matrix)});
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();root.add(mesh);
 }
 group.add(root);
 for(const m of manifest){const entry=report.find(a=>a.id===m.id);if(entry)m.fallowCartonsV160=entry}
 return {root,report,dispose(){root.removeFromParent();geometry.dispose();mats.forEach(m=>{m.map.dispose();m.dispose()})}};
}
