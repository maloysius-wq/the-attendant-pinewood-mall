/** Original 1997 fictional graphics applied DIRECTLY to measured front
 * triangles of the genuine licensed cabinet. No separate floating planes,
 * no rescaled cabinet meshes and no external textures. */
import * as THREE from '../vendor/three/build/three.module.js';
const seedFor=s=>[...s].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,2166136261);
function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
const palette=[['#a7ccc3','#274047','#c18254'],['#e5ac69','#482c3b','#618d9c'],['#d4c6a1','#30334c','#ab648c'],['#b3c98c','#243b36','#c39964']];
const poweredIds=new Set(['cab_stellar','center_tide','drive_duo','skee_ball_2','coin_machine']);
export const arcadePoweredV159=f=>poweredIds.has(f.id);
function textureFor(f,type,aspect,assets){
 const c=document.createElement('canvas');c.width=512;c.height=Math.max(16,Math.round(512/aspect));
 const ctx=c.getContext('2d'),w=c.width,h=c.height;
 const r=rng(seedFor(f.id)),[ink,bg,accent]=palette[seedFor(f.id)%palette.length],powered=arcadePoweredV159(f);
 const fit=(label,y,sz,color,weight='bold')=>{
  let px=Math.floor(sz);do{ctx.font=weight+' '+px+'px Arial, sans-serif';if(ctx.measureText(label).width<=w*.85)break;px--;}while(px>8);
  ctx.fillStyle=color;ctx.fillText(label,w/2,y);
 };
 ctx.textAlign='center';ctx.textBaseline='middle';
 if(type==='marquee'){
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.fillStyle=accent;ctx.fillRect(0,0,w,h*.08);ctx.fillRect(0,h*.92,w,h*.08);
  ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.strokeRect(10,h*.14,w-20,h*.72);
  fit(f.title,h*.44,Math.min(h*.46,w*.09),ink);
  fit('SUNBURST  ·  25¢',h*.76,h*.15,'#d9c7a3','normal');
 }else{
  ctx.fillStyle=powered?'#111820':'#111818';ctx.fillRect(0,0,w,h);
  const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,powered?'#253946':'#273235');g.addColorStop(.46,'#121719');g.addColorStop(1,'#080b0d');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  if(powered){
   ctx.fillStyle=ink;for(let k=0;k<62;k++){let x=r()*w,y=r()*h;ctx.fillRect(x,y,1+Math.floor(r()*3),1+Math.floor(r()*3));}
   ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(w*.07,h*.10,w*.86,h*.80);
   fit(f.node==='driving_cab'?'TIME TRIAL':f.title,h*.25,h*.12,ink);
   ctx.strokeStyle='#68949b';ctx.lineWidth=3;ctx.beginPath();
   if(f.node==='driving_cab'){ctx.moveTo(w*.42,h*.48);ctx.lineTo(w*.16,h*.83);ctx.moveTo(w*.58,h*.48);ctx.lineTo(w*.84,h*.83);}
   else{ctx.moveTo(w*.47,h*.48);ctx.lineTo(w*.54,h*.67);ctx.lineTo(w*.39,h*.67);ctx.closePath();}
   ctx.stroke();fit('INSERT COIN',h*.79,h*.095,'#cdb68e');
  }else{
   // Old powered-down CRT glass: slight reflection, not glowing white.
   ctx.strokeStyle='#29363a';ctx.lineWidth=Math.max(1,h*.012);ctx.strokeRect(w*.035,h*.05,w*.93,h*.90);
   ctx.fillStyle='rgba(122,153,160,.035)';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w*.48,0);ctx.lineTo(w*.16,h);ctx.lineTo(0,h);ctx.fill();
  }
  ctx.fillStyle='rgba(0,0,0,.19)';for(let y=1;y<h;y+=4)ctx.fillRect(0,y,w,1);
 }
 // Subtle deterministic print wear on the original face.
 ctx.globalAlpha=.10;for(let i=0;i<85;i++){ctx.fillStyle=r()>.5?'#e9dfc0':'#050608';ctx.fillRect(r()*w,r()*h,1+r()*5,1+r()*2);}
 ctx.globalAlpha=1;
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;assets.textures.push(texture);
 const material=new THREE.MeshStandardMaterial({map:texture,color:type==='marquee'?0xb8b1a0:0xffffff,
  roughness:type==='marquee'?.72:.40,metalness:0,
  emissive:powered?0xffffff:0x000000,emissiveMap:powered?texture:null,
  emissiveIntensity:powered?(type==='marquee'?.16:.39):0});
 assets.materials.push(material);return material;
}
const posKey=v=>[v.x,v.y,v.z].map(n=>Math.round(n*10000)).join(',');
function faceCandidates(mesh){
 const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone(),p=g.getAttribute('position');
 const triangles=[],byVertex=new Map();
 for(let i=0;i+2<p.count;i+=3){
  const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(mesh.matrixWorld));
  const cross=new THREE.Vector3().subVectors(v[1],v[0]).cross(new THREE.Vector3().subVectors(v[2],v[0]));
  const area=cross.length()/2;if(area<.000001)continue;
  const normal=cross.normalize();
  if(normal.z<.55||Math.abs(normal.x)>.20)continue;
  const t={i,v,normal,area},idx=triangles.length;triangles.push(t);
  for(const a of v){const k=posKey(a);if(!byVertex.has(k))byVertex.set(k,[]);byVertex.get(k).push(idx);}
 }
 const used=new Set(),out=[];
 for(let i=0;i<triangles.length;i++){
  if(used.has(i))continue;
  const seed=triangles[i],group=[i];used.add(i);
  for(let j=0;j<group.length;j++){
   const a=triangles[group[j]];
   for(const v of a.v)for(const n of byVertex.get(posKey(v))||[]){
    if(used.has(n))continue;const t=triangles[n];
    if(seed.normal.dot(t.normal)<.994||Math.abs(seed.normal.dot(new THREE.Vector3().subVectors(t.v[0],seed.v[0])))>.003)continue;
    used.add(n);group.push(n);
   }
  }
  const ts=group.map(n=>triangles[n]),points=ts.flatMap(t=>t.v),bounds=new THREE.Box3().setFromPoints(points);
  // Measure width/height IN THE SURFACE PLANE: even a slanted marquee
  // gets square raster pixels rather than a projected-height stretch.
  const uAxis=new THREE.Vector3(1,0,0).addScaledVector(seed.normal,-seed.normal.x).normalize();
  const vAxis=seed.normal.clone().cross(uAxis).normalize();
  const u=points.map(p=>p.dot(uAxis)),v=points.map(p=>p.dot(vAxis));
  const uMin=Math.min(...u),vMin=Math.min(...v),w=Math.max(...u)-uMin,h=Math.max(...v)-vMin,area=ts.reduce((n,t)=>n+t.area,0);
  if(w<.20||h<.055||area<.022||area/(w*h)<.69||area/(w*h)>1.1)continue;
  out.push({mesh,g,triangles:ts,bounds,w,h,area,uAxis,vAxis,uMin,vMin,normalZ:seed.normal.z,centerY:(bounds.min.y+bounds.max.y)/2});
 }
 return {g,out};
}
function summary(face,type){return {type,width:face.w,height:face.h,normalZ:face.normalZ,textureSize:face.textureSize||null,triangles:face.triangles.length,min:face.bounds.min.toArray(),max:face.bounds.max.toArray()};}
export function applyOriginalArcadeArtworkV159(model,f,assets){
 const upright=f.node.startsWith('arcade_upright'),screenOnly=['driving_cab','pinball','dance_stage','skee_ball'].includes(f.node);
 if(!upright&&!screenOnly)return {powered:arcadePoweredV159(f),faces:[],candidates:[]};
 model.updateMatrixWorld(true);
 const candidates=[],prepared=new Map();
 model.traverse(o=>{
  if(!o.isMesh||Array.isArray(o.material)||o.material?.name!=='pack_emissive')return;
  const result=faceCandidates(o);prepared.set(o,result.g);candidates.push(...result.out);
 });
 const byY=[...candidates].sort((a,b)=>a.centerY-b.centerY),selected=[];
 if(upright&&byY.length>=2){
  // Actual source panel groups, not guessed absolute label positions.
  // The lower, larger face is the screen, and the highest is the marquee.
  const marquee=byY.at(-1),screen=byY.slice(0,-1).sort((a,b)=>b.area-a.area)[0];
  selected.push([screen,'screen'],[marquee,'marquee']);
 }else if(screenOnly&&byY.length){
  selected.push([[...byY].sort((a,b)=>b.area-a.area)[0],'screen']);
 }
 const byMesh=new Map();
 for(const [face,type] of selected){if(!byMesh.has(face.mesh))byMesh.set(face.mesh,[]);byMesh.get(face.mesh).push([face,type]);}
 for(const [mesh,g] of prepared){
  const faces=byMesh.get(mesh);
  if(!faces){g.dispose();continue;}
  const mats=[mesh.material],indices=new Map(),position=g.getAttribute('position');
  let uv=g.getAttribute('uv');if(!uv){uv=new THREE.BufferAttribute(new Float32Array(position.count*2),2);g.setAttribute('uv',uv);}
  for(const [face,type] of faces){
   const matIndex=mats.length,material=textureFor(f,type,face.w/face.h,assets);mats.push(material);
   face.textureSize=[material.map.image.width,material.map.image.height];
   for(const tri of face.triangles){indices.set(tri.i,matIndex);
    for(let j=0;j<3;j++){const v=tri.v[j];uv.setXY(tri.i+j,(v.dot(face.uAxis)-face.uMin)/face.w,(v.dot(face.vAxis)-face.vMin)/face.h);}
   }
  }
  uv.needsUpdate=true;g.clearGroups();
  let first=0,last=indices.get(0)||0;
  for(let i=3;i<position.count;i+=3){const m=indices.get(i)||0;if(m!==last){g.addGroup(first,i-first,last);first=i;last=m;}}
  g.addGroup(first,position.count-first,last);
  mesh.geometry=g;mesh.material=mats;
 }
 return {powered:arcadePoweredV159(f),faces:selected.map(([f,t])=>summary(f,t)),candidates:byY.map(f=>summary(f,'candidate'))};
}
export function makeSunburstCarpetTextureV159(source){
 const c=document.createElement('canvas');c.width=c.height=768;
 const ctx=c.getContext('2d'),r=rng(1997);
 ctx.fillStyle='#242539';ctx.fillRect(0,0,768,768);
 const colors=['#46595d','#62424e','#6b594a','#3a5369','#70604d'];
 // Real 1990s-scale abstract contract carpet pattern: subdued, worn
 // teal/rust/gold shapes, repeating every three metres on the source slab.
 for(let i=0;i<110;i++){
  const x=20+r()*728,y=20+r()*728;ctx.save();ctx.translate(x,y);ctx.rotate(r()*Math.PI*2);
  ctx.strokeStyle=colors[i%colors.length];ctx.fillStyle=colors[i%colors.length];ctx.lineWidth=2+r()*3;
  ctx.globalAlpha=.55;
  if(i%4===0){ctx.beginPath();ctx.arc(0,0,6+r()*9,.4,Math.PI*1.6);ctx.stroke();}
  else if(i%4===1){ctx.beginPath();ctx.moveTo(-11,4);ctx.lineTo(-4,-5);ctx.lineTo(3,4);ctx.lineTo(12,-5);ctx.stroke();}
  else if(i%4===2){ctx.fillRect(-3,-7,6,14);ctx.fillRect(-8,-1,16,3);}
  else{ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(9,8);ctx.lineTo(-7,5);ctx.closePath();ctx.stroke();}
  ctx.restore();
 }
 // Use the already pinned dirt/fibre image as a subtle textile layer.
 ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=.48;
 ctx.drawImage(source.image,0,0,768,768);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;return tex;
}
