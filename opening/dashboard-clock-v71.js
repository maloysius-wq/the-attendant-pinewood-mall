/**
 * Small 12:47 AM factory readout. Its bezel is seated on a measured
 * upward-facing dashboard surface of the original licensed sedan, not suspended in
 * empty space or attached to a replacement dashboard.
 */
import * as THREE from '../vendor/three/build/three.module.js';

const local=(car,p)=>car.localToWorld(new THREE.Vector3(...p));
export function installDashboardClockV71(car){
 const model=car?.children?.find(child=>child.name==='Complete scailman CC-BY-4.0 Low-Poly Sedan');
 if(!car?.isGroup||!model||car.children.filter(x=>x.name===model.name).length!==1)
  throw Error('The dashboard clock needs the complete imported sedan');
 car.updateWorldMatrix(true,true);
 // The old driver eye looked through front-seat upholstery and the mount
 // search selected a seat-depth triangle (z=-.186) as "dashboard".
 const driverEye=local(car,[-.33,1.22,-.08]);
 // All clock coordinates (point, normal, eye and quaternion) must use the
 // sedan group's LOCAL frame. The car is rotated 180 degrees in the lot.
 const eyeLocal=new THREE.Vector3(-.33,1.22,-.08);
 const upWorld=local(car,[0,1,0]).sub(local(car,[0,0,0])).normalize();
 const localNormal=hit=>{
  const p=car.worldToLocal(hit.point.clone());
  const world=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  if(world.dot(driverEye.clone().sub(hit.point).normalize())<0)world.negate();
  return car.worldToLocal(hit.point.clone().add(world)).sub(p).normalize();
 };
 // Prefer an actual upward-facing surface on TOP of the imported dashboard,
 // rather than the raised, driver-facing console panel used by v71.
 const topHits=[];
 for(const x of[-.30,-.22,-.14,-.06,.02,.10,.18]){
  for(const z of[-.78,-.86,-.94,-1.02,-1.10,-1.18]){
   const origin=local(car,[x,1.48,z]);
   const direction=local(car,[x,.52,z]).sub(origin).normalize();
   const ray=new THREE.Raycaster(origin,direction,.10,1.06);
   const hits=ray.intersectObject(model,true);
   for(const hit of hits){
    if(!hit.face||/window|wheel|tire|rim|door|roof|chassis/i.test(hit.object.name))continue;
    const point=car.worldToLocal(hit.point.clone());
    if(point.x<-.4||point.x>.38||point.y<.79||point.y>1.16||
       point.z>-.76||point.z<-1.32)continue;
    const worldNormal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    if(worldNormal.dot(upWorld)<.52)continue;
    const normal=localNormal(hit);
    const score=Math.abs(point.x+.14)*1.8+Math.abs(point.z+.95)*.9+
     Math.abs(point.y-.95)*.8+(1-worldNormal.dot(upWorld))*.5;
    topHits.push({score,p:point,normal,mesh:hit.object.name,
     kind:'dashboard-top',hitDistance:hit.distance});
    break;
   }
  }
 }
 topHits.sort((a,b)=>a.score-b.score);
 // Readable forward-facing panels remain a strictly-local fallback for older
 // vendor mesh variants, but the chosen original car has a real dash top.
 const panelHits=[];
 for(const x of[-.30,-.20,-.10,0,.10,.20,.30]){
  for(const y of[.77,.83,.89,.95,1.01,1.07]){
   for(const z of[-.50,-.62,-.74,-.86,-.98,-1.10]){
    const direction=local(car,[x,y,z]).sub(driverEye).normalize();
    const hit=new THREE.Raycaster(driverEye,direction,.18,3)
     .intersectObject(model,true)
     .find(h=>!/window|wheel|tire|rim|door/i.test(h.object.name));
    if(!hit?.face)continue;
    const point=car.worldToLocal(hit.point.clone());
    if(point.x<-.45||point.x>.48||point.y<.68||point.y>1.14||
       point.z>-.42||point.z<-1.30||hit.distance<.45)continue;
    const normal=localNormal(hit);
    const toEye=eyeLocal.clone().sub(point).normalize();
    // Reject lateral console sidewalls: the face of a factory readout
    // belongs against the dash's driver-facing front, not its left edge.
    if(normal.dot(toEye)<.35||normal.z<.38)continue;
    const score=Math.abs(point.x+.14)*2+Math.abs(point.y-.93)*2+
     Math.abs(point.z+.9)*1.2+(1-normal.dot(toEye))*.6;
    panelHits.push({score,p:point,normal,mesh:hit.object.name,
     kind:'driver-facing-panel',hitDistance:hit.distance});
   }
  }
 }
 panelHits.sort((a,b)=>a.score-b.score);
 if(!topHits.length&&!panelHits.length)throw Error('No visible authentic dashboard mount surface');
 let mount=(topHits[0]||panelHits[0]);const clock=new THREE.Group();
 // The thin LCD bezel is seated against the imported surface. Angle its
 // face toward the driver rather than leaving it flat on the dashboard top.
 const eyeVector=eyeLocal.clone().sub(mount.p).normalize();
 let displayNormal=mount.normal.clone().multiplyScalar(.25)
  .addScaledVector(eyeVector,.75).normalize();
 let displayReadableAngle=displayNormal.dot(eyeVector);
 clock.name='Factory-sized recessed digital dashboard readout';
 // Bury the back/lower edge of the clock housing into the original dash
 // surface. Its raised face stays entirely clear of the top panel instead of
 // clipping through it at the readout's lower half.
 clock.position.copy(mount.p).addScaledVector(mount.normal,.028);
 clock.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),displayNormal);
 const plastic=new THREE.Mesh(new THREE.BoxGeometry(.168,.073,.072),
  new THREE.MeshStandardMaterial({color:0x11181b,roughness:.83,metalness:.035}));
 plastic.name='Slim factory bezel seated into imported dashboard';
 clock.add(plastic);
 const canvas=document.createElement('canvas');
 canvas.width=600;canvas.height=218;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#05090b';ctx.fillRect(0,0,600,218);
 ctx.strokeStyle='#323d41';ctx.lineWidth=7;ctx.strokeRect(7,7,586,204);
 ctx.fillStyle='#ef704e';ctx.shadowColor='#ef4d30';ctx.shadowBlur=18;
 ctx.font='bold 115px monospace';ctx.textAlign='center';
 ctx.fillText('12:47',278,149);
 ctx.font='bold 48px monospace';ctx.fillText('AM',522,156);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.151,.060),
  new THREE.MeshBasicMaterial({map,toneMapped:false}));
 face.name='12:47 AM inset display';
 face.position.z=.040;clock.add(face);
 car.add(clock);
 // A top-surface hit may be mathematically valid but hidden behind the dash
 // brow from the actual driver's eye. Check every candidate before settling
 // the bezel; do not accept a clipped display or a floating compromise.
 const corners=[[-.0755,-.030],[.0755,-.030],[-.0755,.030],[.0755,.030]];
 const rejectionSummary=[];
 let clockDistance=0,unobstructedFromDriver=false;
 // A lower, driver-facing dashboard recess is more believable from the seated
 // viewpoint than an upper dash crown beside the windshield. Prefer the
 // original sedan's LOWER, forward panel while still ray-checking every
 // display corner; retain upper surfaces as a safe fallback only.
 const isLowDash=hit=>hit.p.y<.93&&hit.p.z<-.80;
 const candidates=[...topHits.filter(isLowDash),...panelHits.filter(isLowDash),
  ...topHits.filter(hit=>!isLowDash(hit)),...panelHits.filter(hit=>!isLowDash(hit))];
 for(const candidate of candidates){
  const fromMount=eyeLocal.clone().sub(candidate.p).normalize();
  const facing=candidate.normal.clone().multiplyScalar(.25)
   .addScaledVector(fromMount,.75).normalize();
  clock.position.copy(candidate.p).addScaledVector(candidate.normal,
   candidate.kind==='dashboard-top'?.039:.028);
  clock.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),facing);
  clock.updateWorldMatrix(true,true);
  const obscured=corners.filter(([x,y])=>{
   const target=face.localToWorld(new THREE.Vector3(x,y,0));
   const ray=target.sub(driverEye),distance=ray.length();
   return new THREE.Raycaster(driverEye,ray.normalize(),.18,distance-.012)
    .intersectObject(model,true)
    .some(h=>!/window|wheel|tire|rim/i.test(h.object.name));
  });
  if(obscured.length){
   if(rejectionSummary.length<5)rejectionSummary.push({
    kind:candidate.kind,p:candidate.p.toArray(),corners:obscured.length});
   continue;
  }
  const displayCenter=face.localToWorld(new THREE.Vector3(0,0,0));
  const ray=displayCenter.sub(driverEye);
  const distance=ray.length();
  const blockers=new THREE.Raycaster(driverEye,ray.normalize(),.18,distance-.012)
   .intersectObject(model,true)
   .filter(h=>!/window|wheel|tire|rim/i.test(h.object.name));
  if(blockers.length){
   if(rejectionSummary.length<5)rejectionSummary.push({
    kind:candidate.kind,p:candidate.p.toArray(),blocker:blockers[0].object.name});
   continue;
  }
  mount=candidate;displayNormal=facing;displayReadableAngle=facing.dot(fromMount);
  clockDistance=distance;unobstructedFromDriver=true;
  break;
 }
 if(!unobstructedFromDriver)throw Error('No unobstructed imported dashboard clock mount: '+
  JSON.stringify({top:topHits.length,panel:panelHits.length,rejected:rejectionSummary}));
 return Object.freeze({
  time:'12:47 AM',localPosition:clock.position.toArray(),importedCarPreserved:true,
  mountedToImportedDash:mount.p.z<-.42,unobstructedFromDriver,surfaceGap:0,displayWidth:.151,visibleDisplayCorners:4,
  mountDepth:mount.p.z,clockDistance,interiorNearPlane:.18,
  mountCandidates:{dashboardTop:topHits.length,frontPanel:panelHits.length,
   checked:candidates.indexOf(mount)+1},
  hitMesh:mount.mesh,mountKind:mount.kind,displayNormal:displayNormal.toArray(),
  importedSurfaceNormal:mount.normal.toArray(),displayReadableAngle
 });
}
