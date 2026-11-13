/**
 * V115 physically grounded retail shopfront assembly.
 *
 * The real transparent panes are rendered by render-shell-v67.js from the
 * canonical physical wall solids. This layer supplies the *architectural*
 * framing and original canvas-drawn tenant fascia, never fake opaque glass or
 * decorative blocks floating in the walking line.
 */
import * as THREE from '../vendor/three/build/three.module.js';

const n=(value,label)=>{if(!Number.isFinite(value))throw Error('Invalid storefront '+label);return value;};
function bar(group,id,x,y,z,width,height,depth,mat){
 const object=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),mat);
 object.name=id;object.position.set(n(x,'x'),n(y,'y'),n(z,'z'));
 object.castShadow=false;object.receiveShadow=true;
 group.add(object);return object;
}
function tenantTexture(spec){
 const c=document.createElement('canvas');c.width=2048;c.height=256;
 const context=c.getContext('2d');
 if(!context)throw Error('Storefront sign canvas unavailable');
 context.fillStyle='#182326';context.fillRect(0,0,c.width,c.height);
 const color='#'+spec.color.toString(16).padStart(6,'0');
 context.fillStyle=color;context.fillRect(0,0,2048,14);
 context.fillStyle='#a5a38d';context.fillRect(34,231,1980,3);
 // Lettering is a single storefront-scaled canvas, not arbitrary 3D billboards
 // repeatedly laid across floors or room openings.
 context.textAlign='center';context.textBaseline='middle';
 context.font='bold 106px Arial, sans-serif';
 while(context.measureText(spec.name).width>1850&&parseInt(context.font,10)>45){
  context.font='bold '+(parseInt(context.font,10)-6)+'px Arial, sans-serif';
 }
 context.fillStyle='#e0dac9';context.fillText(spec.name,1024,94,1880);
 context.font='bold 36px Arial, sans-serif';context.fillStyle='#b8a98c';
 context.fillText(spec.subtitle,1024,182,1880);
 // Weathering belongs to the old enamel sign itself, not floating stains.
 for(let i=0;i<190;i++){
  const x=52+(i*379)%1942,y=35+(i*89)%186;
  context.fillStyle=i%3?'#203032c9':'#a3a18b56';
  context.fillRect(x,y,1+(i%7),1+(i%3));
 }
 const texture=new THREE.CanvasTexture(c);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=4;
 return texture;
}
export function renderStorefrontsV115(layer,storefronts){
 if(!layer||!layer.isObject3D)throw TypeError('Physical G floor layer required');
 if(!Array.isArray(storefronts)||storefronts.length!==7)
  throw Error('Missing canonical seven storefront openings');
 const group=new THREE.Group();group.name='V115 measured retail shopfronts';
 layer.add(group);
 const metal=new THREE.MeshStandardMaterial({color:0x565d59,roughness:.66,metalness:.58});
 const brass=new THREE.MeshStandardMaterial({color:0x9b8f73,roughness:.73,metalness:.48});
 const rust=new THREE.MeshStandardMaterial({color:0x706b60,roughness:.85,metalness:.38});
 const charcoal=new THREE.MeshStandardMaterial({color:0x1d2729,roughness:.81,metalness:.22});
 const textures=[],signMaterials=[],manifest=[];
 for(const f of storefronts){
  const entranceWidth=f.doorEnd-f.doorStart;
  if(entranceWidth<3.6)throw Error('Unsafe shop access '+f.room);
  const outward=f.at+f.facing*.16;
  const id=(part,position)=>'v115_'+f.room+'_'+part+'_'+position.toFixed(2);
  const frontGroup=new THREE.Group();frontGroup.name='v115_shopfront_'+f.room;group.add(frontGroup);
  // Pilasters have genuine matching walls behind them. Architectural trim
  // remains surface mounted and not a phantom gameplay collider.
  for(const z of [f.start+.2,f.end-.2]){
   bar(frontGroup,id('pilaster',z),outward,2.0,z,.12,4.0,.25,rust);
   bar(frontGroup,id('pilaster-cap',z),outward,4.0,z,.18,.12,.33,brass);
  }
  // Two real shop windows, separated by the source's clear original doorway.
  for(const [a,b]of [[f.start+.44,f.doorStart],[f.doorEnd,f.end-.44]]){
   if(b-a<.5)continue;
   const mid=(a+b)/2;
   bar(frontGroup,id('sill',a),outward,.46,mid,.12,.07,b-a,metal);
   bar(frontGroup,id('sash',a),outward,3.5,mid,.12,.09,b-a,brass);
   bar(frontGroup,id('transom',a),outward,2.74,mid,.10,.06,b-a,metal);
   // Truly measured mullion rhythm, no random poles beyond the building.
   const sections=Math.max(1,Math.ceil((b-a)/2.7));
   for(let k=1;k<sections;k++){
    const z=a+(b-a)*k/sections;
    bar(frontGroup,id('mullion',z),outward,1.96,z,.095,3.08,.10,metal);
   }
  }
  // The original portal remains open at foot height, including the full
  // Chapter 1 retail entrances and the gated Annex route in Chapter 4.
  for(const z of [f.doorStart,f.doorEnd]){
   bar(frontGroup,id('entry-jamb',z),outward,1.78,z,.11,3.52,.09,brass);
  }
  bar(frontGroup,id('entry-head',f.doorStart),outward,3.56,
   (f.doorStart+f.doorEnd)/2,.12,.09,entranceWidth,brass);
  // A continuous wall-mounted fascia sits BELOW the known physical shop
  // ceiling. Its backplane covers ordinary masonry *above* the openings,
  // never the 4.2m playable opening and never the glass panes.
  const span=f.end-f.start-.85,mid=(f.start+f.end)/2;
  bar(frontGroup,id('sign-band',mid),outward,4.44,mid,.13,.98,span,charcoal);
  const texture=tenantTexture(f);
  const signMat=new THREE.MeshBasicMaterial({map:texture,transparent:false,side:THREE.DoubleSide});
  textures.push(texture);signMaterials.push(signMat);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(span-.25,.81),signMat);
  sign.name='v115_shop_sign_'+f.room;
  sign.rotation.y=f.facing>0?Math.PI/2:-Math.PI/2;
  sign.position.set(f.at+f.facing*.241,4.46,mid);
  frontGroup.add(sign);
  // Trim is attached to the fascia and exposes the 1979 original / 1992
  // later wing material differences without changing the canonical story.
  bar(frontGroup,id('fascia-top',mid),outward,4.97,mid,.12,.065,span,brass);
  bar(frontGroup,id('fascia-bottom',mid),outward,3.93,mid,.12,.08,span,metal);
  manifest.push({id:f.room,sign:f.name,entryWidth:entranceWidth,windowSpan:span-entranceWidth,
   axis:'x',x:f.at,from:f.start,to:f.end,level:'G'});
 }
 return {group,manifest,dispose(){
  // Building owns the actual geometry; dispose the unique sign materials and
  // generated sign textures here, once, in the existing building teardown.
  for(const t of textures)t.dispose();
  for(const m of signMaterials)m.dispose();
  for(const m of [metal,brass,rust,charcoal])m.dispose();
 }};
}
