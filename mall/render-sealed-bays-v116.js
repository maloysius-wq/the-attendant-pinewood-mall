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
function signTexture(bay,width,height){
 const canvas=document.createElement('canvas');canvas.height=256;canvas.width=Math.round(256*width/height);
 const w=canvas.width,h=canvas.height,c=canvas.getContext('2d');if(!c)throw Error('V116 sign canvas could not initialize');
 c.fillStyle=bay.kind==='retail'?'#273235':'#3c4544';c.fillRect(0,0,w,h);
 c.fillStyle=bay.kind==='retail'?'#b29c7b':'#788c7e';c.fillRect(10,16,w-20,7);
 c.fillStyle='#b6ac91';c.fillRect(12,232,w-24,4);
 c.textAlign='center';c.textBaseline='middle';
 const line=(text,y,max,color)=>{
  let px=max;do{c.font='bold '+px+'px Arial,sans-serif';if(c.measureText(text).width<=w-86)break;px--;}while(px>12);
  c.fillStyle=color;c.fillText(text,w/2,y);
  return c.measureText(text).width;
 };
 const nameWidth=line(bay.front.sign,104,100,'#e5ddc5');
 line(bay.front.tag,188,36,'#c4bca8');
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 return {texture,nameWidth,pixelWidth:w,pixelHeight:h};
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
  const signHeight=.34,signWidth=Math.min(span-.16,6.2*signHeight);
  const print=signTexture(bay,signWidth,signHeight),signMat=new THREE.MeshBasicMaterial({map:print.texture,side:THREE.FrontSide});
  textures.push(print.texture);signMats.push(signMat);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(signWidth,signHeight),signMat);
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
   shutterWidth:doorWidth,area:w*d,signWidth,signHeight,textureWidth:print.pixelWidth,textureHeight:print.pixelHeight,nameWidthPx:print.nameWidth});
 }
 return {group,manifest,dispose(){
  for(const t of textures)t.dispose();
  for(const m of [...mats,...signMats])m.dispose();
 }};
}
