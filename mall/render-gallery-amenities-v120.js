/**
 * V120: source-anchored, local-only real CC0 public gallery seating and
 * functional 1989 mall directories. Benches are ACTUAL pinned Kenney GLBs,
 * never generated cube stand-ins; directory frames are real grounded kiosks.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {GALLERY_AMENITIES_V120,BENCH_ASSET_V120,BIN_ASSET_V163,validateGalleryAmenitiesV120,publicAmenityBoundsV163,benchApproachV163}
 from './gallery-amenities-v120.mjs';
import {GALLERY_COLUMNS_V118} from './gallery-columns-v118.mjs';
import {DIRECTORY_PRINT_V163,DIRECTORY_TENANTS_V163,directoryLayoutV163} from './gallery-directory-v163.mjs';

function cuboid(g,name,x,y,z,w,h,d,material){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.name=name;mesh.position.set(x,y,z);mesh.receiveShadow=true;g.add(mesh);return mesh;
}
function canvasTexture(canvas){
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function printCanvas(lines){
 const canvas=document.createElement('canvas');canvas.width=1190;canvas.height=290;
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 if(!ctx)throw Error('Gallery sign texture unavailable');
 ctx.fillStyle='#263a36';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#a89d80';ctx.lineWidth=8;ctx.strokeRect(12,12,w-24,h-24);
 ctx.fillStyle='#dfd5b8';ctx.textBaseline='middle';ctx.textAlign='center';
 ctx.font='bold 59px Arial';ctx.fillText(lines[0],w/2,106,w-58);
 ctx.font='bold 43px Arial';ctx.fillText(lines[1],w/2,200,w-64);
 return canvasTexture(canvas);
}
function printDirectory(plan,face){
 const layout=directoryLayoutV163(plan,face),canvas=document.createElement('canvas');
 canvas.width=DIRECTORY_PRINT_V163.width;canvas.height=DIRECTORY_PRINT_V163.height;
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;if(!ctx)throw Error('Directory canvas missing');
 const label=(s,x,y,size,color='#e4dac0',align='center',maxWidth=w-40)=>{
  ctx.font='bold '+size+'px Arial';ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(s,x,y,maxWidth);
 };
 ctx.fillStyle='#253832';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#b1a07c';ctx.lineWidth=6;ctx.strokeRect(15,15,w-30,h-30);
 label('PINEWOOD MALL',w/2,78,60);label('ORIGINAL GALLERIES  ·  GROUND FLOOR',w/2,142,25);
 ctx.fillStyle='#172723';ctx.fillRect(45,188,670,654);
 label(layout.orientation+' ↑',w-95,216,25);
 for(const r of layout.rooms){
  ctx.fillStyle=r.id==='boarded_lobby'?'#565651':r.number?'#777d65':'#49625a';
  ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle='#d0c6a7';ctx.lineWidth=2.5;ctx.strokeRect(r.x,r.y,r.w,r.h);
  if(r.number)label(String(r.number),r.x+r.w/2,r.y+r.h/2,29);
  if(r.id==='boarded_lobby'){label('MAIN ENTRY',r.x+r.w/2,r.y+r.h/2-12,18);label('CLOSED',r.x+r.w/2,r.y+r.h/2+12,16,'#d8b983')}
 }
 ctx.beginPath();ctx.arc(layout.fountain.x,layout.fountain.y,layout.fountain.radius,0,Math.PI*2);
 ctx.fillStyle='#9c9a7d';ctx.fill();ctx.strokeStyle='#e3d9bd';ctx.lineWidth=2;ctx.stroke();
 label('FOUNTAIN',layout.fountain.x,layout.fountain.y,13,'#202c25');
 ctx.beginPath();ctx.arc(layout.marker.x,layout.marker.y,9,0,Math.PI*2);
 ctx.fillStyle='#e9b65c';ctx.fill();ctx.strokeStyle='#1c2923';ctx.lineWidth=3;ctx.stroke();
 ctx.beginPath();ctx.arc(98,879,9,0,Math.PI*2);ctx.fillStyle='#e9b65c';ctx.fill();
 label('YOU ARE HERE',120,879,30,'#e9b65c','left');
 for(const [i,t] of DIRECTORY_TENANTS_V163.entries()){
  const x=i<3?70:390,y=958+(i%3)*63;
  ctx.fillStyle='#777d65';ctx.fillRect(x,y-20,42,40);label(String(t.number),x+21,y,24);
  label(t.label,x+56,y,25,'#e4dac0','left',260);
 }
 ctx.strokeStyle='#9a8c6e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(60,1149);ctx.lineTo(700,1149);ctx.stroke();
 label('EAST WING  ·  STAFF ACCESS ONLY',w/2,1191,27,'#c7b891');
 label(plan.id==='main_entrance_directory'?'SOUTH ATRIUM DIRECTORY':'NORTH ATRIUM DIRECTORY',w/2,1262,25);
 label('PINEWOOD PROPERTY MANAGEMENT',w/2,1348,20,'#a79b7e');
 ctx.fillStyle='#d4c6a512';for(let i=0;i<85;i++)ctx.fillRect((i*173+7)%w,(i*97+13)%h,2+(i%6),1+(i%3));
 return {texture:canvasTexture(canvas),layout};
}
function ageSource(source,owned){
 const cache=new Map();
 const age=original=>{
  if(cache.has(original))return cache.get(original);
  const m=original.clone();
  if(m.name==='chrome'){m.color.set('#77736b');m.metalness=.28;m.roughness=.85}
  else if(m.name==='wood'){m.color.multiplyScalar(.72);m.roughness=.94}
  else if(m.name==='teal'){m.color.set('#426a63');m.roughness=.94}
  cache.set(original,m);owned.push(m);return m;
 };
 source.scene.traverse(o=>{if(o.isMesh)o.material=Array.isArray(o.material)?o.material.map(age):age(o.material)});
}
function fitActualFixture(g,source,f,asset,kind){
 const model=source.scene.clone(true);model.rotation.y=f.yaw||0;model.updateMatrixWorld(true);
 let b=new THREE.Box3().setFromObject(model),s=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());
 const [w,h,d]=asset.size,c=Math.abs(Math.cos(f.yaw)),sn=Math.abs(Math.sin(f.yaw));
 const expected=[w*c+d*sn,h,w*sn+d*c];
 if(s.toArray().some((v,i)=>Math.abs(v-expected[i])>.025))throw Error('Measured V163 model size changed '+f.id+' '+s.toArray());
 model.position.set(f.x-center.x,-b.min.y,f.z-center.z);model.updateMatrixWorld(true);
 b=new THREE.Box3().setFromObject(model);s=b.getSize(new THREE.Vector3());
 const collider=publicAmenityBoundsV163(f);
 if(Math.abs(b.min.y)>.006||b.min.x<collider.minX||b.max.x>collider.maxX||b.min.z<collider.minZ||b.max.z>collider.maxZ)
  throw Error('Gallery fixture outside measured collision '+f.id);
 model.name=(kind==='bench'?'v120_real_CC0_bench_':'v163_real_CC0_bin_')+f.id;
 model.userData.cc0Provenance={id:asset.catalogId,sha256:asset.sha256};
 model.userData.structuralFurnitureV120={id:f.id,room:f.room,radius:f.collisionRadius};
 model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true}});
 g.add(model);
 return {id:f.id,room:f.room,x:f.x,z:f.z,height:s.y,width:s.x,depth:s.z,baseY:b.min.y,
  yaw:f.yaw,station:f.station,model:asset.path,realCC0:true,collider,
  ...(kind==='bench'?{approach:benchApproachV163(f)}:{})};
}
function placeDirectory(g,plan,mats,textures){
 const root=new THREE.Group();root.name='v120_directory_'+plan.id;
 root.position.set(plan.x,0,plan.z);root.rotation.y=plan.facing==='north'?Math.PI:0;
 g.add(root);
 cuboid(root,'directory_plinth',0,.11,0,1.36,.22,.80,mats.stone);
 cuboid(root,'directory_real_back',0,1.18,0,plan.width,2.12,plan.depth,mats.steel);
 const faces=[];
 // Source's free-standing kiosk is accessible from EITHER mall direction.
 // Mirrored framed faces are real printed mesh planes at the two actual
 // cabinet surfaces, not a double-sided plane whose back is still hidden
 // behind the opaque source steel case.
 for(const face of [1,-1]){
  const z=face*.34;
  cuboid(root,'directory_frame_top',0,2.27,z,plan.width+.12,.09,.10,mats.stone);
  for(const x of [-.58,.58])
   cuboid(root,'directory_side_stanchion',x,1.14,z,.08,2.12,.10,mats.stone);
  const {texture,layout}=printDirectory(plan,face);textures.push(texture);
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.FrontSide});mats.owned.push(material);
  faces.push({face,northUp:layout.northUp,markerWorld:layout.markerWorld,marker:layout.marker,roomIds:layout.rooms.map(r=>r.id),textureWidth:texture.image.width,textureHeight:texture.image.height,meshWidth:.95,meshHeight:1.78});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.95,1.78),material);
  p.name=face===1?'printed_original_mall_map_front':'printed_original_mall_map_back';
  p.position.set(0,1.22,face*.342);
  if(face===-1)p.rotation.y=Math.PI;
  root.add(p);
  cuboid(root,'directory_lower_mailslot',0,.26,z,.66,.04,.05,mats.stone);
 }
 const printedFaces=root.children.filter(x=>x.name.startsWith('printed_original_mall_map_'));
 if(printedFaces.length!==2||!printedFaces.every(x=>x.isMesh&&x.material.map)||printedFaces[0].material.map===printedFaces[1].material.map)
  throw Error('Free-standing mall directory lost one authentic printed side '+plan.id);
 return {id:plan.id,room:plan.room,x:plan.x,z:plan.z,
  height:plan.height,collisionRadius:plan.collisionRadius,physicalDirectory:true,
  printedFaces:printedFaces.length,faces};
}
function placeWayfinding(g,entry,mats,textures){
 const c=GALLERY_COLUMNS_V118.find(x=>x.id===entry.columnId);
 if(!c)throw Error('V120 sign lost its actual load-bearing column '+entry.id);
 const face=entry.facing==='east'?1:-1;
 const root=new THREE.Group();
 root.name='v120_source_column_sign_'+entry.id;
 root.position.set(c.x+face*.44,2.59,c.z);
 root.rotation.y=face*Math.PI/2;g.add(root);
 // Bracket penetrates the original pier, so the sign is never free-floating.
 cuboid(root,'pillar_fixed_bracket',0,0,-.014,2.48,.61,.12,mats.steel);
 cuboid(root,'column_sign_edge',0,0,.072,2.56,.67,.07,mats.stone);
 const tex=printCanvas([entry.line1,entry.line2]);
 textures.push(tex);
 const mat=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});
 mats.owned.push(mat);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.38,.58),mat);
 sign.name='original_galleries_wayfinding';sign.position.set(0,0,.12);root.add(sign);
 return {id:entry.id,sourceColumn:entry.columnId,room:entry.room,
  x:c.x,z:c.z,height:2.59,period:'1989-wall-mounted-direction'};
}

export async function renderGalleryAmenitiesV120(ground,plan=GALLERY_AMENITIES_V120){
 if(!ground?.isObject3D)throw Error('V120 requires actual source ground-floor group');
 const issues=validateGalleryAmenitiesV120(plan);
 if(issues.length)throw Error('V120 source amenity layout failed: '+issues.join(' | '));
 const loader=new GLTFLoader();
 const [benchGLB,binGLB]=await Promise.all([BENCH_ASSET_V120,BIN_ASSET_V163].map(a=>loader.loadAsync(new URL('../'+a.path,import.meta.url).href)));
 const group=new THREE.Group();group.name='V120 original period mall public benches and directories';
 const stone=new THREE.MeshStandardMaterial({color:0xa4977b,metalness:.05,roughness:.84});
 const steel=new THREE.MeshStandardMaterial({color:0x394a4a,metalness:.52,roughness:.72});
 const mats={stone,steel,owned:[stone,steel]},textures=[];
 ageSource(benchGLB,mats.owned);ageSource(binGLB,mats.owned);
 const benchManifest=plan.benches.map(f=>fitActualFixture(group,benchGLB,f,BENCH_ASSET_V120,'bench'));
 const binManifest=plan.bins.map(f=>fitActualFixture(group,binGLB,f,BIN_ASSET_V163,'bin'));
 const directoryManifest=plan.directories.map(d=>placeDirectory(group,d,mats,textures));
 const signs=plan.wayfinding.map(s=>placeWayfinding(group,s,mats,textures));
 // No half-loaded objects may be visible before all source model and map
 // materials are validated and measured.
 ground.add(group);
 return {group,manifest:{benches:benchManifest,bins:binManifest,directories:directoryManifest,wayfinding:signs},
  dispose(){
   ground.remove(group);
   textures.forEach(t=>t.dispose());
   mats.owned.forEach(m=>m.dispose());
   // The original GLB geometry and its local-mapped materials are not owned.
  }};
}
