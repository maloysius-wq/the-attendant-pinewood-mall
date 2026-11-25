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
// Distinct period merchandise families, still within the verified .22 × .15 × .14m
// supported package envelope. Colors and sizes vary by real department, not random clutter.
const designs=[
 {brand:'FALLOW’S',title:'GIFT SOAP',color:'#866454',size:[.92,.83,.95]},
 {brand:'HARTWELL',title:'HAND CREAM',color:'#746d55',size:[.78,.92,.84]},
 {brand:'MILL & CO.',title:'GIFT SET',color:'#496b66',size:[1,.90,1]},
 {brand:'FALLOW’S',title:'HOSIERY',color:'#794e58',size:[.82,.94,.80]},
 {brand:'ASHFORD',title:'HANDKERCHIEFS',color:'#4c6779',size:[1,.55,.98]},
 {brand:'FIELDSTONE',title:'COTTON KNIT',color:'#5e6b68',size:[.98,.50,1],fabric:true},
 {brand:'FIELDSTONE',title:'RIBBED KNIT',color:'#775e51',size:[1,.55,1],fabric:true},
 {brand:'FALLOW’S',title:'COTTON SCARF',color:'#75586e',size:[.92,.42,.96],fabric:true},
 {brand:'HARTWELL',title:'BATH LINEN',color:'#687957',size:[1,.63,1],fabric:true},
 {brand:'MILL & CO.',title:'TABLE LINEN',color:'#85815e',size:[1,.51,1],fabric:true},
 {brand:'FALLOW’S',title:'GIFT WRAP',color:'#79604c',size:[.90,.68,.92]},
 {brand:'PINE & BAY',title:'HOME FRAGRANCE',color:'#6a5360',size:[.76,1,.85]}
];
function materials(){
 return designs.map(({brand,title,color,fabric},i)=>{
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=160;
  const c=canvas.getContext('2d');c.fillStyle=color;c.fillRect(0,0,256,160);
  if(fabric){
   // Woven textile with repeated knit stitches, folded-edge shadow and
   // a narrow paper retail band. Source geometry is never replaced.
   c.strokeStyle='#ded0b72b';c.lineWidth=1.5;
   for(let y=3;y<160;y+=7)for(let x=2;x<256;x+=7){
    c.beginPath();c.moveTo(x,y);c.lineTo(x+3,y+3);c.lineTo(x+6,y);c.stroke();
   }
   c.fillStyle='#231c183e';c.fillRect(0,139,256,13);c.fillRect(0,153,256,3);
   c.fillStyle='#c6bda4';c.fillRect(89,0,78,160);
   c.fillStyle='#454238';c.textAlign='center';c.font='bold 10px Georgia';c.fillText(brand,128,59,71);
   c.font='bold 9px Arial';c.fillText(title,128,76,71);
   c.font='9px Arial';c.fillText('100% COTTON',128,92,70);
  }else{
   c.strokeStyle='#d8c9a9';c.lineWidth=2;c.strokeRect(7,7,242,146);
   if(i%2){c.fillStyle='#d8c9a935';c.fillRect(9,99,238,34);}
   else{c.fillStyle='#e9dcc241';c.beginPath();c.arc(128,54,27,0,Math.PI*2);c.fill();}
   c.fillStyle='#e8dac3';c.textAlign='center';c.font='bold 24px Georgia';c.fillText(brand,128,40,225);
   c.font='bold 18px Arial';c.fillText(title,128,87,222);
   c.font='12px Arial';c.fillText(i%2?'FINE GOODS':'FALLOW’S DEPARTMENT STORE',128,124,225);
   c.font='10px Arial';c.fillText(i%2?'$ 8.95':'1997 COLLECTION',128,142,225);
  }
  for(let n=0;n<30;n++){
   c.fillStyle=n%2?'#170f1020':'#e5d7bc22';
   c.fillRect((n*53+i*7)%251,(n*37)%157,2+n%4,1+n%2);
  }
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  return new THREE.MeshStandardMaterial({map:tex,roughness:fabric?.98:.86});
 });
}
function merchandiseFor(f,s,i){
 // Northern clothing/linen, southern gifts/beauty. Repeat SKUs in short
 // runs within each shelf, rather than making every adjacent box a new item.
 const north=f.z<-60.5,choices=north?[3,4,5,6,7,8,9]:[0,1,2,10,11,8,9];
 const row=Math.round(s.y*10),run=Math.floor(i/2);
 return choices[(row+run+f.id.length)%choices.length];
}
export function stockFallowDisplaysV160(group,fixtures,manifest){
 group.updateMatrixWorld(true);
 const root=new THREE.Group();root.name='v160_fallows_original_printed_gift_cartons';
 const mats=materials(),geometry=new THREE.BoxGeometry(.22,.15,.14);
 const placements=mats.map(()=>[]),report=[];
 for(const f of fixtures.filter(f=>f.room==='west_anchor'&&['table_large','wall_cubbies','gondola'].includes(f.source))){
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
   // Distinct measured shelf faces. No stock inside the central gondola
   // backing or without real upward source triangle support.
   for(const side of (f.source==='gondola'?[0,Math.PI]:[0])){
    const yaw=f.yaw+side,fx=Math.sin(yaw),fz=Math.cos(yaw),sideX=Math.cos(yaw),sideZ=-Math.sin(yaw);
    const width=turn?size.z:size.x,depth=turn?size.x:size.z;
    const halfW=turn?.07:.11,halfD=turn?.11:.07;
    let best=[];
    for(const fraction of (f.source==='gondola'?[.32,.27,.22]:[.19,.08,-.08])){
     const trial=[],n=Math.floor((width-.09)/.235);
     for(let i=0;i<n;i++){
      const offset=(i-(n-1)/2)*.235;
      const x=center.x+sideX*offset+fx*depth*fraction,z=center.z+sideZ*offset+fz*depth*fraction;
      const ys=surfaces(model,b,x,z);
      for(const y of ys){
       if(y<b.min.y+.12||y>b.max.y-.17)continue;
       if(!supported(model,b,x,z,halfW*2,halfD*2,y))continue;
       if(ys.some(h=>h>y+.012&&h<y+.175))continue;
       ray.set(new THREE.Vector3(x+fx*(depth+.18),y+.077,z+fz*(depth+.18)),new THREE.Vector3(-fx,0,-fz));
       const obstruction=ray.intersectObject(model,true)[0];
       if(obstruction&&(obstruction.point.x-x)*fx+(obstruction.point.z-z)*fz>-.065)continue;
       trial.push({x,y,z,yaw});
      }
     }
     if(trial.length>best.length)best=trial;
    }
    slots.push(...best.filter(p=>!slots.some(q=>Math.abs(q.y-p.y)<.16&&Math.hypot(q.x-p.x,q.z-p.z)<.15)));
   }
  }
  const accepted=[];
  for(const [i,s] of slots.entries()){
   const sku=merchandiseFor(f,s,i),d=designs[sku].size;
   // Smaller footprints are independently checked, not assumed to have
   // solid contact merely because the previous larger carton did.
   if(!supported(model,b,s.x,s.z,(turn?.14*d[2]:.22*d[0]),(turn?.22*d[0]:.14*d[2]),s.y))continue;
   // Deterministic gaps on long banks suggest picked-over stock; keep all
   // table displays and preserve both gondola sides.
   if(!table&&i%9===7)continue;
   placements[sku].push(s);accepted.push({...s,sku:designs[sku].title});
  }
  slots.length=0;slots.push(...accepted);
  report.push({id:f.id,cartons:slots.length,slots:slots.map(s=>({x:s.x,z:s.z,supportY:s.y,sku:s.sku})),support:'five upward source-triangle contacts',centerReserved:table,fixtureType:f.source,stockedFaces:[...new Set(slots.map(s=>Math.round(s.yaw*1000)/1000))].length});
 }
 const dummy=new THREE.Object3D();
 for(let i=0;i<mats.length;i++){
  const slots=placements[i];if(!slots.length)continue;
  const mesh=new THREE.InstancedMesh(geometry,mats[i],slots.length);
  mesh.name='v160_original_period_carton_batch_'+i;
  slots.forEach((s,j)=>{const d=designs[i].size;dummy.position.set(s.x,s.y+.15*d[1]/2+.002,s.z);dummy.rotation.y=s.yaw;dummy.scale.set(...d);dummy.updateMatrix();mesh.setMatrixAt(j,dummy.matrix)});
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();root.add(mesh);
 }
 group.add(root);
 for(const m of manifest){const entry=report.find(a=>a.id===m.id);if(entry)m.fallowCartonsV160=entry}
 return {root,report,dispose(){root.removeFromParent();geometry.dispose();mats.forEach(m=>{m.map.dispose();m.dispose()})}};
}
