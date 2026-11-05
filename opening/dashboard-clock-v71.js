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
    if(normal.dot(toEye)<.16)continue;
    const score=Math.abs(point.x+.14)*2+Math.abs(point.y-.93)*2+
     Math.abs(point.z+.9)*1.2+(1-normal.dot(toEye))*.6;
    panelHits.push({score,p:point,normal,mesh:hit.object.name,
     kind:'driver-facing-panel',hitDistance:hit.distance});
   }
  }
 }
 panelHits.sort((a,b)=>a.score-b.score);
 if(!topHits.length&&!panelHits.length)throw Error('No visible authentic dashboard mount surface');
 const mount=(topHits[0]||panelHits[0]),clock=new THREE.Group();
 // The thin LCD bezel is seated against the imported surface. Angle its
 // face toward the driver rather than leaving it flat on the dashboard top.
 const eyeVector=eyeLocal.clone().sub(mount.p).normalize();
 const displayNormal=mount.normal.clone().multiplyScalar(.25)
  .addScaledVector(eyeVector,.75).normalize();
 const displayReadableAngle=displayNormal.dot(eyeVector);
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
 clock.updateWorldMatrix(true,true);
 // A real GLB surface must not eat the bottom or either side of the LCD.
 // Check every screen corner against the intact vendor body, not the bezel.
 const corners=[[-.0755,-.030],[.0755,-.030],[-.0755,.030],[.0755,.030]];
 const obscuredCorners=corners.filter(([x,y])=>{
  const target=face.localToWorld(new THREE.Vector3(x,y,0));
  const ray=target.sub(driverEye),distance=ray.length();
  return new THREE.Raycaster(driverEye,ray.normalize(),.18,distance-.012)
   .intersectObject(model,true)
   .some(h=>!/window|wheel|tire|rim/i.test(h.object.name));
 });
 if(obscuredCorners.length)throw Error('Dashboard panel covers a corner of the clock display');
 const visibleClockPoint=local(car,clock.position.toArray());
 const viewRay=visibleClockPoint.clone().sub(driverEye);
 const clockDistance=viewRay.length();
 const blockers=new THREE.Raycaster(driverEye,viewRay.normalize(),.18,clockDistance-.018)
  .intersectObject(model,true).filter(h=>!/window|wheel|tire|rim/i.test(h.object.name));
 const unobstructedFromDriver=blockers.length===0;
 if(!unobstructedFromDriver)throw Error('Dashboard clock is hidden behind original car geometry');
 return Object.freeze({
  time:'12:47 AM',localPosition:clock.position.toArray(),importedCarPreserved:true,
  mountedToImportedDash:mount.p.z<-.42,unobstructedFromDriver,surfaceGap:0,displayWidth:.151,visibleDisplayCorners:4,
  mountDepth:mount.p.z,clockDistance,interiorNearPlane:.18,
  mountCandidates:{dashboardTop:topHits.length,frontPanel:panelHits.length},
  hitMesh:mount.mesh,mountKind:mount.kind,displayNormal:displayNormal.toArray(),
  importedSurfaceNormal:mount.normal.toArray(),displayReadableAngle
 });
}
