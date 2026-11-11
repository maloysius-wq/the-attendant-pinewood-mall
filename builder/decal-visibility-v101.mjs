/**
 * Visibility rescue for legacy ambientCG dirt decals that were stored with
 * nearly transparent source alpha. Strengthens real CC0 source photos without
 * modifying the pinned original files; non-grime posters remain unmodified.
 */
export function isGrimeDecalV101(item){
 return item?.category==='Surface Decals & Grime'&&
  item?.path?.startsWith('assets/vendor/builder/decals-v97/');
}
export function prepareGrimeTextureV101(THREE,source,item){
 if(!isGrimeDecalV101(item))return source;
 const original=source.image;
 if(!original?.width||!original?.height)throw Error('Missing source ambientCG decal image');
 const canvas=document.createElement('canvas');
 canvas.width=original.width;canvas.height=original.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 if(!ctx)throw Error('Cannot create photograph-derived dirt map');
 ctx.drawImage(original,0,0);
 const frame=ctx.getImageData(0,0,canvas.width,canvas.height);
 const d=frame.data;
 // The previous alpha masks were so feathered that 100% opacity looked faint.
 // Expand only nonzero source alpha. The editor's user-selected opacity still
 // scales the whole image continuously from 0.08 to 1.
 const dust=/dust|powder/.test(item.id);
 const water=/water|leak|puddle/.test(item.id);
 const dark=water?0.54:dust?0.73:0.39;
 for(let i=0;i<d.length;i+=4){
  const a=d[i+3]/255;
  if(a<=0)continue;
  const gain=Math.min(1,Math.pow(a,.38)*(water?.94:dust?.92:1.1));
  d[i+3]=Math.round(gain*255);
  // Retain source photo's spatial details, but apply readable neutral grime
  // whose pigment darkens the actual wall/floor rather than glowing.
  const l=(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])/255;
  const v=Math.round(255*(dark*.60+dark*.40*l));
  d[i]=v;
  d[i+1]=Math.round(v*(water?.94:dust?1:.96));
  d[i+2]=Math.round(v*(water?1.02:.94));
 }
 ctx.putImageData(frame,0,0);
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
 texture.minFilter=THREE.LinearMipmapLinearFilter;
 texture.anisotropy=4;
 texture.userData={...texture.userData,enhancedCC0V101:true,
  originalSourceUrl:original.currentSrc||original.src||null,
  alphaBoostExponent:.38,
  note:'Source CC0 pixels and silhouette, visibility rebalanced in-memory only'};
 return texture;
}
