import * as THREE from '../vendor/three/build/three.module.js';
import {FACADE_V68,validateFacadeV68} from './facade-plan-v68.mjs';

// Facade treatments are surface-bound architectural objects. No unattached
// decorative blocks and no downloadable runtime textures or fonts.
function canvas(w,h,draw){
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const ctx=c.getContext('2d');if(!ctx)throw Error('2D canvas unavailable');
 draw(ctx,w,h);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
 return t;
}
function agedSign(){
 return canvas(2048,512,(ctx,w,h)=>{
  const bg=ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,'#243535');bg.addColorStop(.54,'#172826');bg.addColorStop(1,'#111b1b');
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.lineWidth=12;ctx.strokeStyle='#8c7b5a';ctx.strokeRect(29,28,w-58,h-56);
  ctx.lineWidth=3;ctx.strokeStyle='#35413a';ctx.strokeRect(50,48,w-100,h-96);
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.shadowColor='#061211';ctx.shadowBlur=10;ctx.shadowOffsetY=6;
  ctx.fillStyle='#c5c5a3';ctx.font='bold 205px Georgia, serif';
  ctx.fillText('PINEWOOD',w/2,215);
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  ctx.fillStyle='#b69a68';ctx.font='bold 101px Arial, sans-serif';
  ctx.fillText('M A L L',w/2,391);
  // Deterministic scratches, old enamel chips and faded installation marks.
  for(let i=0;i<220;i++){
   const x=65+(i*431)%1912,y=59+(i*197)%387;
   ctx.fillStyle=i%3===0?'#101b1b9a':'#a3ac98a0';
   ctx.fillRect(x,y,1+(i%7),1+(i%3));
  }
  for(let x=230;x<1900;x+=241){
   ctx.strokeStyle='#06110c2f';ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(x,35);ctx.lineTo(x-14,482);ctx.stroke();
  }
 });
}
function agedPlywood(){
 return canvas(768,1024,(ctx,w,h)=>{
  const base=ctx.createLinearGradient(0,0,w,0);
  base.addColorStop(0,'#594739');base.addColorStop(.3,'#796149');
  base.addColorStop(.63,'#66513d');base.addColorStop(1,'#41382f');
  ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
  for(let i=0;i<145;i++){
   const x=(i*53)%w,y=(i*127)%h;
   ctx.strokeStyle=i%4===0?'#281f1f44':'#b49c7652';
   ctx.lineWidth=.7+(i%4)*.4;
   ctx.beginPath();ctx.moveTo(x,y);
   ctx.bezierCurveTo(x+30,y-19,x+26,y+18,x+13+(i%60),y+84);ctx.stroke();
  }
  for(const y of[11,269,519,758,1007]){
   ctx.strokeStyle='#261d1a77';ctx.lineWidth=4;
   ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+6);ctx.stroke();
  }
 });
}
function plaqueTexture(){
 return canvas(1152,240,(ctx,w,h)=>{
  ctx.fillStyle='#101f21';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#889f98';ctx.lineWidth=13;ctx.strokeRect(14,14,w-28,h-28);
  ctx.fillStyle='#d9e0d4';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='bold 51px Arial, sans-serif';
  ctx.fillText('AUTHORIZED CONTRACTORS',w/2,94);
  ctx.font='38px Arial, sans-serif';ctx.fillText('SERVICE ACCESS',w/2,169);
 });
}
function weatherTexture(){
 return canvas(128,1024,(ctx,w,h)=>{
  // Edges fade to alpha zero so these read as water staining rather than
  // rectangles or detached geometry.
  const cross=ctx.createLinearGradient(0,0,w,0);
  cross.addColorStop(0,'#0b111100');cross.addColorStop(.27,'#0b11112c');
  cross.addColorStop(.5,'#111c2075');cross.addColorStop(.75,'#111c2022');
  cross.addColorStop(1,'#0b111100');
  ctx.fillStyle=cross;ctx.fillRect(0,0,w,h);
  const vertical=ctx.createLinearGradient(0,0,0,h);
  vertical.addColorStop(0,'#00000000');vertical.addColorStop(.17,'#00000033');
  vertical.addColorStop(.66,'#00000000');vertical.addColorStop(1,'#00000088');
  ctx.globalCompositeOperation='destination-in';ctx.fillStyle=vertical;
  ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';
 });
}
function box(group,id,x,y,z,w,h,d,mat){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
 mesh.name=id;mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=true;
 mesh.userData.facadeArchitectural=true;group.add(mesh);return mesh;
}
function plane(group,id,x,y,z,w,h,mat){
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
 mesh.name=id;mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=true;
 mesh.userData.facadeArchitectural=true;group.add(mesh);return mesh;
}
export function buildWeatheredFacade(parent){
 const defects=validateFacadeV68();
 if(defects.length)throw Error('Invalid v68 facade: '+defects.join(' | '));
 const f=FACADE_V68,group=new THREE.Group();group.name='v68 1979 Pinewood architectural facade';
 const signTexture=agedSign(),plywoodTexture=agedPlywood(),
  serviceTexture=plaqueTexture(),runoffTexture=weatherTexture();
 const materials={
  agedMetal:new THREE.MeshStandardMaterial({color:0x353c39,metalness:.56,roughness:.81}),
  backing:new THREE.MeshStandardMaterial({color:0x101717,metalness:.14,roughness:.96}),
  bronze:new THREE.MeshStandardMaterial({color:0x6f684c,metalness:.48,roughness:.79}),
  wood:new THREE.MeshStandardMaterial({color:0xc0b49c,map:plywoodTexture,roughness:1,side:THREE.DoubleSide}),
  beam:new THREE.MeshStandardMaterial({color:0x79644a,roughness:1}),
  nail:new THREE.MeshStandardMaterial({color:0x424c4a,metalness:.7,roughness:.7}),
  sign:new THREE.MeshStandardMaterial({map:signTexture,roughness:.81,metalness:.08,emissive:0x12201c,emissiveIntensity:.07}),
  plaque:new THREE.MeshStandardMaterial({map:serviceTexture,roughness:.75}),
  grime:new THREE.MeshBasicMaterial({map:runoffTexture,transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide})
 };
 // One big recognizable mall sign, attached below the actual roofline.
 box(group,'PINEWOOD_MALL_SIGN_BACKER',f.sign.x,f.sign.y,-22.20,f.sign.width+.65,f.sign.height+.45,.18,materials.agedMetal);
 plane(group,'PINEWOOD_MALL_1979_SIGN',f.sign.x,f.sign.y,f.sign.z,f.sign.width,f.sign.height,materials.sign);
 for(const m of f.weathering){
  const mark=plane(group,'aged_masonry_'+m.id,m.x,(m.y1+m.y2)/2,-22.238,m.width*5,m.y2-m.y1,materials.grime);
  mark.userData.wallAttachedZ=m.z;
 }
 const main=f.boarded;
 box(group,'recessed_closed_public_lobby',main.x,main.planeY,-22.12,main.width,main.height,.13,materials.backing);
 for(const p of main.panels){
  plane(group,'plywood_main_'+p.id,p.x,main.planeY,-21.995,p.width-.027,main.height-.08,materials.wood);
  for(const y of[.24,5.38]){
   for(const dx of[-p.width/2+.13,p.width/2-.13]){
    const nail=new THREE.Mesh(new THREE.CylinderGeometry(.049,.049,.028,8),materials.nail);
    nail.name='plywood_fastener_'+p.id;nail.rotation.x=Math.PI/2;
    nail.position.set(p.x+dx,y,-21.963);group.add(nail);
   }
  }
 }
 for(const b of main.braces){
  const [x1,y1]=b.from,[x2,y2]=b.to,dx=x2-x1,dy=y2-y1;
  const brace=box(group,'real_board_brace_'+b.id,(x1+x2)/2,(y1+y2)/2,-21.91,
   Math.hypot(dx,dy),b.width,.13,materials.beam);
  brace.rotation.z=Math.atan2(dy,dx);
 }
 box(group,'boarded_lobby_left_jamb',-15.43,2.85,-22.025,.22,5.8,.34,materials.agedMetal);
 box(group,'boarded_lobby_right_jamb',-5.57,2.85,-22.025,.22,5.8,.34,materials.agedMetal);
 box(group,'boarded_lobby_header',-10.5,5.79,-22.025,10.03,.2,.34,materials.agedMetal);
 // The service entry is genuinely open in the v67 shell: its trim
 // deliberately sits outside the 1.78 x 2.27 m cinematic aperture.
 for(const b of f.service.frame){
  box(group,'service_frame_'+b.id,(b.x1+b.x2)/2,(b.y1+b.y2)/2,-22.08,
   b.x2-b.x1,b.y2-b.y1,.34,materials.agedMetal);
 }
 box(group,'service_entry_plaque_back',12,3.26,-22.13,4.14,.94,.15,materials.agedMetal);
 plane(group,'service_entry_legible_plaque',12,3.26,-22.014,4,.76,materials.plaque);
 // The 1988–94 annex exit remains an actual aperture, gated by chapter.
 const exit=f.employeeExit;
 for(const z of[exit.z-exit.width/2-.2,exit.z+exit.width/2+.2]){
  box(group,'annex_exit_metal_jamb',86.27,1.32,z,.36,2.65,.2,materials.agedMetal);
 }
 box(group,'annex_exit_lintel',86.27,2.66,exit.z,.36,.18,exit.width+.55,materials.agedMetal);
 parent.add(group);
 const owned=[signTexture,plywoodTexture,serviceTexture,runoffTexture];
 return {group,facadeFeatures:group.children.length,signText:f.sign.lettering,
  entryBoarded:true,serviceOpen:true,employeeExit:exit,
  dispose(){parent.remove(group);group.traverse(o=>o.geometry?.dispose());Object.values(materials).forEach(m=>m.dispose());owned.forEach(t=>t.dispose());}
 };
}
