/** V127 period service plates and shutter ribs physically attached to
 * the new walls of actual rooms. Geometry/collision live in physical shell. */
import * as THREE from '../vendor/three/build/three.module.js';
function box(parent,name,x,y,z,w,h,d,material){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.name=name;mesh.position.set(x,y,z);mesh.receiveShadow=true;
 parent.add(mesh);return mesh;
}
function sign(label){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=180;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('staff signage canvas unavailable');
 ctx.fillStyle='#293738';ctx.fillRect(0,0,1024,180);
 ctx.fillStyle='#b7a781';ctx.fillRect(15,15,994,4);ctx.fillRect(15,160,994,3);
 ctx.fillStyle='#e3dfd0';ctx.font='bold 59px Arial,sans-serif';
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,512,90,950);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 return tex;
}
export function renderStaffServiceV127(parent,cells){
 if(!parent?.isObject3D||cells?.length!==5)throw Error('five original staff suites required');
 const root=new THREE.Group();root.name='V127 original attached service suites';parent.add(root);
 const metal=new THREE.MeshStandardMaterial({color:0x515b58,roughness:.82,metalness:.58});
 const trim=new THREE.MeshStandardMaterial({color:0x807969,roughness:.83,metalness:.33});
 const dark=new THREE.MeshStandardMaterial({color:0x333e3e,roughness:.9});
 const textures=[],signMaterials=[],manifest=[];
 for(const c of cells){
  const mid=(c.z1+c.z2)/2,lo=mid-c.doorWidth/2,hi=mid+c.doorWidth/2;
  for(const z of [lo,hi])
   box(root,'v127_jamb_'+c.id,c.x1-.12,1.32,z,.075,2.64,.1,metal);
  box(root,'v127_band_'+c.id,c.x1-.14,3.035,mid,.08,.35,
   Math.min(c.z2-c.z1-.7,6),dark);
  const texture=sign(c.label),m=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
  textures.push(texture);signMaterials.push(m);
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(c.z2-c.z1-.9,5.9),.30),m);
  mesh.name='v127_staff_sign_'+c.id;
  mesh.rotation.y=-Math.PI/2;mesh.position.set(c.x1-.195,3.035,mid);
  root.add(mesh);
  if(c.kind==='locked'){
   for(let i=0;i<16;i++)
    box(root,'v127_shutter_rib_'+c.id+'_'+i,c.x1-.086,.12+i*.158,mid,
     .045,.025,c.doorWidth-.12,i%4===0?trim:metal);
   box(root,'v127_shutter_sill_'+c.id,c.x1-.12,.06,mid,.15,.12,c.doorWidth,trim);
  }
  manifest.push({id:c.id,room:c.room,kind:c.kind,doorWidth:c.doorWidth,
   area:(c.x2-c.x1)*(c.z2-c.z1),frontX:c.x1,attached:true});
 }
 return {root,manifest,dispose(){
  for(const t of textures)t.dispose();
  for(const m of [metal,trim,dark,...signMaterials])m.dispose();
 }};
}
