/**
 * V120: source-anchored, local-only real CC0 public gallery seating and
 * functional 1989 mall directories. Benches are ACTUAL pinned Kenney GLBs,
 * never generated cube stand-ins; directory frames are real grounded kiosks.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {GALLERY_AMENITIES_V120,BENCH_ASSET_V120,validateGalleryAmenitiesV120}
 from './gallery-amenities-v120.mjs';
import {GALLERY_COLUMNS_V118} from './gallery-columns-v118.mjs';

function cuboid(g,name,x,y,z,w,h,d,material){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.name=name;mesh.position.set(x,y,z);mesh.receiveShadow=true;g.add(mesh);return mesh;
}
function printCanvas(lines,{portrait=false}={}){
 const canvas=document.createElement('canvas');
 canvas.width=portrait?768:1024;canvas.height=portrait?1024:256;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Gallery directory texture context unavailable');
 const w=canvas.width,h=canvas.height;
 ctx.fillStyle='#223435';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#95866b';ctx.fillRect(0,0,w,portrait?32:18);
 ctx.strokeStyle='#afaa8c';ctx.lineWidth=8;ctx.strokeRect(17,17,w-34,h-34);
 ctx.textBaseline='middle';ctx.textAlign='center';
 if(!portrait){
  ctx.fillStyle='#dcd5b9';ctx.font='bold 57px Arial';ctx.fillText(lines[0],w/2,108,w-45);
  ctx.font='bold 34px Arial';ctx.fillText(lines[1],w/2,186,w-60);
 }else{
  ctx.fillStyle='#e1d6b9';ctx.font='bold 65px Arial';ctx.fillText('PINEWOOD MALL',w/2,118,w-42);
  ctx.font='bold 30px Arial';ctx.fillText('EST. 1979    ·    DIRECTORY',w/2,172,w-30);
  ctx.fillStyle='#3b5555';ctx.fillRect(77,238,614,550);
  ctx.strokeStyle='#acb4aa';ctx.lineWidth=7;ctx.strokeRect(77,238,614,550);
  ctx.strokeStyle='#7d9791';ctx.lineWidth=4;
  ctx.strokeRect(315,268,138,490);
  ctx.fillStyle='#a7aa8d';ctx.fillRect(345,474,80,65);
  ctx.font='bold 30px Arial';ctx.fillStyle='#eee6cf';ctx.fillText('FOUNTAIN',384,566,235);
  ctx.font='bold 32px Arial';ctx.fillText('WEST',194,298,190);ctx.fillText('EAST',570,298,190);
  ctx.font='bold 22px Arial';ctx.fillText("FALLOW'S",194,396,190);
  ctx.fillText('CASSETTE',194,485,190);ctx.fillText('ARCADE',194,641,190);
  ctx.fillText('VIDEO PLANET',565,431,205);ctx.fillText('FOOD COURT',565,617,205);
  ctx.fillStyle='#e4b66a';ctx.font='bold 38px Arial';ctx.fillText('YOU ARE HERE',w/2,876,w-50);
  ctx.font='bold 22px Arial';ctx.fillStyle='#c6baa0';ctx.fillText(lines[0],w/2,931,w-50);
 }
 // Small deterministic physical fading chips, not random transient noise.
 ctx.fillStyle='#7c877540';
 for(let i=0;i<65;i++)ctx.fillRect((i*173+7)%w,(i*97+13)%h,2+(i%7),1+(i%3));
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function fitActualBench(g,source,f){
 const model=source.scene.clone(true);
 model.rotation.y=f.yaw||0;
 model.updateMatrixWorld(true);
 let b=new THREE.Box3().setFromObject(model),s=b.getSize(new THREE.Vector3());
 if(Math.max(s.x,s.y,s.z)<.02||s.y<.02)throw Error('Pinned CC0 bench source has impossible dimensions '+f.id);
 const maxFootprint=f.collisionRadius*1.3;
 const scale=Math.min(f.height/s.y,maxFootprint/Math.max(s.x,s.z));
 if(!(scale>0&&Number.isFinite(scale)))throw Error('Cannot physically scale real CC0 bench '+f.id);
 model.scale.setScalar(scale);model.updateMatrixWorld(true);
 b=new THREE.Box3().setFromObject(model);s=b.getSize(new THREE.Vector3());
 if(s.y<f.height*.80)throw Error('Pinned original Kenney bench would be a toy at '+f.id);
 const center=b.getCenter(new THREE.Vector3());
 model.position.set(f.x-center.x,-b.min.y,f.z-center.z);
 model.updateMatrixWorld(true);
 b=new THREE.Box3().setFromObject(model);s=b.getSize(new THREE.Vector3());
 if(Math.hypot(s.x/2,s.z/2)>f.collisionRadius+.015)
  throw Error('Actual licensed bench protrudes outside source walking collider '+f.id);
 model.name='v120_real_CC0_bench_'+f.id;
 model.userData.cc0Provenance={id:BENCH_ASSET_V120.catalogId,sha256:BENCH_ASSET_V120.sha256};
 model.userData.structuralFurnitureV120={id:f.id,room:f.room,radius:f.collisionRadius};
 model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true}});
 g.add(model);
 return {id:f.id,room:f.room,x:f.x,z:f.z,height:s.y,width:s.x,depth:s.z,
  model:BENCH_ASSET_V120.path,realCC0:true};
}
function placeDirectory(g,plan,mats,textures){
 const root=new THREE.Group();root.name='v120_directory_'+plan.id;
 root.position.set(plan.x,0,plan.z);root.rotation.y=plan.facing==='north'?Math.PI:0;
 g.add(root);
 cuboid(root,'directory_plinth',0,.11,0,1.36,.22,.80,mats.stone);
 cuboid(root,'directory_real_back',0,1.18,0,plan.width,2.12,plan.depth,mats.steel);
 const texture=printCanvas([plan.id==='main_entrance_directory'?'MAIN SOUTH ENTRANCE':'NORTH GALLERY'],{portrait:true});
 textures.push(texture);
 const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
 mats.owned.push(material);
 // Source's free-standing kiosk is accessible from EITHER mall direction.
 // Mirrored framed faces are real printed mesh planes at the two actual
 // cabinet surfaces, not a double-sided plane whose back is still hidden
 // behind the opaque source steel case.
 for(const face of [1,-1]){
  const z=face*.34;
  cuboid(root,'directory_frame_top',0,2.27,z,plan.width+.12,.09,.10,mats.stone);
  for(const x of [-.58,.58])
   cuboid(root,'directory_side_stanchion',x,1.14,z,.08,2.12,.10,mats.stone);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.95,1.78),material);
  p.name=face===1?'printed_original_mall_map_front':'printed_original_mall_map_back';
  p.position.set(0,1.22,face*.342);
  if(face===-1)p.rotation.y=Math.PI;
  root.add(p);
  cuboid(root,'directory_lower_mailslot',0,.26,z,.66,.04,.05,mats.stone);
 }
 const printedFaces=root.children.filter(x=>x.name.startsWith('printed_original_mall_map_'));
 if(printedFaces.length!==2||!printedFaces.every(x=>x.isMesh&&x.material.map===texture))
  throw Error('Free-standing mall directory lost one authentic printed side '+plan.id);
 return {id:plan.id,room:plan.room,x:plan.x,z:plan.z,
  height:plan.height,collisionRadius:plan.collisionRadius,physicalDirectory:true,
  printedFaces:printedFaces.length};
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
 const path=BENCH_ASSET_V120.path;
 const loader=new GLTFLoader();
 const gltf=await loader.loadAsync(new URL('../'+path,import.meta.url).href);
 const group=new THREE.Group();group.name='V120 original period mall public benches and directories';
 const stone=new THREE.MeshStandardMaterial({color:0xa4977b,metalness:.05,roughness:.84});
 const steel=new THREE.MeshStandardMaterial({color:0x394a4a,metalness:.52,roughness:.72});
 const mats={stone,steel,owned:[stone,steel]},textures=[];
 const benchManifest=plan.benches.map(f=>fitActualBench(group,gltf,f));
 const directoryManifest=plan.directories.map(d=>placeDirectory(group,d,mats,textures));
 const signs=plan.wayfinding.map(s=>placeWayfinding(group,s,mats,textures));
 // No half-loaded objects may be visible before all source model and map
 // materials are validated and measured.
 ground.add(group);
 return {group,manifest:{benches:benchManifest,directories:directoryManifest,wayfinding:signs},
  dispose(){
   ground.remove(group);
   textures.forEach(t=>t.dispose());
   mats.owned.forEach(m=>m.dispose());
   // The original GLB geometry and its local-mapped materials are not owned.
  }};
}
