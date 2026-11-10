/**
 * Builder-only rotation support probes. A newly placed or moved prop uses its
 * entire world AABB footprint, to keep existing strict placement safeguards.
 * An already placed prop rotated about its vertical world-space anchor instead
 * keeps a small, rotation-invariant contact patch on the same real desk/floor.
 * The caller always checks collision against real architectural walls first.
 */
export function isStableYawEditV94(before,next){
 const same=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-7;
 return ['x','y','z'].every(k=>same(before.position[k],next.position[k]))&&
  same(before.scale,next.scale)&&
  same(before.rotation.x,next.rotation.x)&&same(before.rotation.z,next.rotation.z)&&
  Number.isFinite(next.rotation.y)&&Math.abs(before.rotation.y-next.rotation.y)>=1e-7;
}
export function supportProbePointsV94(box,rotationAnchor=null){
 if(rotationAnchor){
  if(!Number.isFinite(rotationAnchor.x)||!Number.isFinite(rotationAnchor.z))
   throw Error('Invalid rotation anchor');
  const {x,z}=rotationAnchor;
  // A stable 7 cm contact patch rather than imaginary far-out AABB corners.
  return [[x,z],[x-.035,z],[x+.035,z],[x,z-.035],[x,z+.035]];
 }
 const inset=Math.min(.04,(box.max.x-box.min.x)/4,(box.max.z-box.min.z)/4);
 return [
  [box.min.x+inset,box.min.z+inset],[box.max.x-inset,box.min.z+inset],
  [box.min.x+inset,box.max.z-inset],[box.max.x-inset,box.max.z-inset],
  [(box.min.x+box.max.x)/2,(box.min.z+box.max.z)/2]
 ];
}
