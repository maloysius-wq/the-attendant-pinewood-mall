/** Fallow-only, already vendored CC0 retail sources. Bounds decoded from
 * actual glTF node transformations and normalized POSITION accessors.
 */
export const FALLOWS_SOURCES_V160=Object.freeze([
 Object.freeze({shortName:'wall_cubbies',name:'Full-height cubby wall bay',path:'assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-wall-bay-cubbies-e16c3314.glb',sha256:'302a1829606a5a2617606cbac593c5284896f676e2c704d3be0afa2d351ab3f9',targetHeight:2.12,role:'perimeter',license:'CC0-1.0',size:[1.175844,2.12,.348341]}),
 Object.freeze({shortName:'gondola',name:'Double-sided retail gondola',path:'assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-mid-floor-gondola-630432ab.glb',sha256:'abba57a2ce341a8f143a65e399ab0d15b1174bc33d3415521ccf83b24b8e5c91',targetHeight:1.48,role:'freestanding',license:'CC0-1.0',size:[1.334381,1.48,.651102]})
]);
export const FALLOWS_SOURCE_DIMENSIONS_V160=Object.freeze({wall_cubbies:FALLOWS_SOURCES_V160[0].size,gondola:FALLOWS_SOURCES_V160[1].size,table_large:[1.519918,.95,1.013341]});
export function anchorBoundsV160(f,pad=.09){
 const s=['west_anchor','east_original_anchor'].includes(f.room)&&FALLOWS_SOURCE_DIMENSIONS_V160[f.source];
 if(!s){const r=f.collisionRadius;return {minX:f.x-r,maxX:f.x+r,minZ:f.z-r,maxZ:f.z+r}}
 const c=Math.abs(Math.cos(f.yaw)),n=Math.abs(Math.sin(f.yaw));
 const x=(s[0]*c+s[2]*n)/2+pad,z=(s[0]*n+s[2]*c)/2+pad;
 return {minX:f.x-x,maxX:f.x+x,minZ:f.z-z,maxZ:f.z+z};
}
export function anchorSegmentBlockedV160(f,from,to,pad=.09){
 const b=anchorBoundsV160(f,pad);let low=0,high=1;
 for(const [p,d,min,max] of [[from.x,to.x-from.x,b.minX,b.maxX],[from.z,to.z-from.z,b.minZ,b.maxZ]]){
  if(Math.abs(d)<1e-9){if(p<=min||p>=max)return false;continue}
  const a=(min-p)/d,c=(max-p)/d;low=Math.max(low,Math.min(a,c));high=Math.min(high,Math.max(a,c));
  if(low>=high)return false;
 }
 return low<high;
}
