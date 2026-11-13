/**
 * V116 enclosed, unlit ancillary stores and staff bays.
 * Source-measured wall solids are supplied by sealedBayWallsV116. This
 * renderer adds the real false ceiling, shutter ribs, door jambs and period
 * enamel fascia attached to each real public/staff corridor frontage.
 */
import * as THREE from '../vendor/three/build/three.module.js';

const createMaterial=(color,metalness=0,roughness=.85)=>
 new THREE.MeshStandardMaterial({color,metalness,roughness});
function panel(parent,id,x,y,z,sx,sy,sz,material){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);
 mesh.name=id;mesh.position.set(x,y,z);mesh.receiveShadow=true;
 mesh.castShadow=false;parent.add(mesh);return mesh;
}
function signTexture(bay){
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=256;
 const c=canvas.getContext('2d');if(!c)throw Error('V116 sign canvas could not initialize');
 c.fillStyle=bay.kind==='retail'?'#273235':'#3c4544';c.fillRect(0,0,1536,256);
 c.fillStyle=bay.kind==='retail'?'#b29c7b':'#788c7e';c.fillRect(10,16,1516,7);
 c.fillStyle='#b6ac91';c.fillRect(12,232,1512,4);
 c.textAlign='center';c.textBaseline='middle';
 let fontSize=90;
 do{c.font='bold '+fontSize+'px Arial,sans-serif';fontSize-=3}
 while(c.measureText(bay.front.sign).width>1410&&fontSize>38);
 c.fillStyle='#e5ddc5';c.fillText(bay.front.sign,768,104,1425);
 c.fillStyle='#c4bca8';c.font='bold 31px Arial,sans-serif';
 c.fillText(bay.front.tag,768,181,1425);
 for(let i=0;i<140;i++){
  const x=25+(i*307)%1492,y=42+(i*73)%158;
  c.fillStyle=i%3?'#192527bb':'#ada68a55';c.fillRect(x,y,1+(i%5),1+(i%2));
 }
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 return texture;
}
export function renderSealedBaysV116(ground,bays){
 if(!ground?.isObject3D||!Array.isArray(bays)||bays.length!==13)
  throw Error('V116 requires canonical 13 ancillary ground bays');
 const group=new THREE.Group();group.name='V116 genuine closed secondary mall interiors';
 ground.add(group);
 const concrete=createMaterial(0x666d67,.05,.96);
 const ceiling=createMaterial(0x8d8880,.02,.98);
 const steel=createMaterial(0x525e5b,.61,.74);
 const edge=createMaterial(0x8a806e,.55,.78);
 const base=createMaterial(0x484c48,.24,.91);
 const mats=[concrete,ceiling,steel,edge,base],textures=[],signMats=[],manifest=[];
 for(const bay of bays){
  const sect=new THREE.Group();sect.name='v116_sealed_'+bay.id;group.add(sect);
  const w=bay.x2-bay.x1,d=bay.z2-bay.z1;
  // These are true enclosed rooms with physical ceiling undersides, not
  // graphics over the mall's entire 12m atrium or over elevator voids.
  panel(sect,'v116_ceiling_'+bay.id,(bay.x1+bay.x2)/2,bay.ceilingY,
   (bay.z1+bay.z2)/2,w,.16,d,ceiling);
  const f=bay.front;
  if(!f){manifest.push({id:bay.id,name:bay.label,open:false,front:null,area:w*d});continue}
  const start=f.axis==='x'?bay.z1:bay.x1,end=f.axis==='x'?bay.z2:bay.x2;
  const mid=(start+end)/2,doorWidth=Math.min(3.8,end-start-1.6);
  const lo=mid-doorWidth/2,hi=mid+doorWidth/2;
  const facing=f.at+f.side*.17;
  const trim=(name,s,y,height,width,material)=>{
   if(f.axis==='x')panel(sect,'v116_'+name+'_'+bay.id,facing,y,s,.085,height,width,material);
   else panel(sect,'v116_'+name+'_'+bay.id,s,y,facing,width,height,.085,material);
  };
  trim('sill',mid,.14,.16,doorWidth,base);
  trim('shutter-head',mid,2.99,.16,doorWidth,edge);
  for(const bound of [lo,hi])trim('door-track',bound,1.47,2.94,.095,steel);
  // Source-measured roll-down shutter: ribs are physically on the existing
  // closed steel wall, not pasted across the entrance of a playable store.
  for(let i=0;i<17;i++){
   const height=.14+i*.163;
   trim('slat-'+i,mid,height,.028,doorWidth-.12,i%4===0?edge:steel);
  }
  const span=end-start-.9;
  trim('fascia',mid,3.19,.39,span,base);
  trim('fascia-cap',mid,3.44,.045,span,edge);
  const tex=signTexture(bay),signMat=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});
  textures.push(tex);signMats.push(signMat);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(span-.16,.34),signMat);
  sign.name='v116_sign_'+bay.id;
  if(f.axis==='x'){
   sign.rotation.y=f.side>0?Math.PI/2:-Math.PI/2;
   sign.position.set(f.at+f.side*.23,3.20,mid);
  }else{
   sign.rotation.y=f.side>0?0:Math.PI;
   sign.position.set(mid,3.20,f.at+f.side*.23);
  }
  sect.add(sign);
  // The sealed store remains closed, regardless of the current story chapter.
  manifest.push({id:bay.id,name:bay.label,open:false,front:f.adjacent,
   shutterWidth:doorWidth,area:w*d});
 }
 return {group,manifest,dispose(){
  for(const t of textures)t.dispose();
  for(const m of [...mats,...signMats])m.dispose();
 }};
}
