/**
 * Small 12:47 AM factory readout. Its bezel is seated against a measured
 * surface of the original licensed enclosed hatchback, not suspended in
 * empty space or attached to a replacement dashboard.
 */
import * as THREE from '../vendor/three/build/three.module.js';

const local=(car,p)=>car.localToWorld(new THREE.Vector3(...p));
export function installDashboardClockV71(car){
 const model=car?.children?.find(child=>child.name==='Complete Grab3D CC0 1990s Hatchback');
 if(!car?.isGroup||!model||car.children.filter(x=>x.name===model.name).length!==1)
  throw Error('The dashboard clock needs the complete imported hatchback');
 car.updateWorldMatrix(true,true);
 // The old driver eye looked through front-seat upholstery and the mount
 // search selected a seat-depth triangle (z=-.186) as "dashboard".
 const driverEye=local(car,[-.38,1.26,-.45]);
 const hits=[];
 // Search real dashboard faces ahead of the seats, from the new driver eye.
 // Only the nearest visible non-glass triangle may hold the clock.
 for(const x of[.05,-.05,.15,-.15,.25,.35]){
  for(const y of[.85,.80,.75,.90,.95]){
   for(const z of[-1.0,-1.15,-1.30,-1.45]){
    const direction=local(car,[x,y,z]).sub(driverEye).normalize();
    const hit=new THREE.Raycaster(driverEye,direction,.08,3)
     .intersectObject(model,true)
     .find(h=>!/window|wheel|tire|rim/i.test(h.object.name));
    if(!hit)continue;
    const point=car.worldToLocal(hit.point.clone());
    if(point.x<-.45||point.x>.48||point.y<.73||point.y>1.05||
       point.z>-.80||point.z<-1.50||hit.distance<.64)continue;
    const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    const toEye=driverEye.clone().sub(hit.point).normalize();
    if(normal.dot(toEye)<0)normal.negate();
    if(normal.dot(toEye)<.35)continue;
    const score=Math.abs(point.x-.05)*2+Math.abs(point.y-.87)*2+
     Math.abs(point.z+1.0)*.7+(1-normal.dot(toEye))*.6;
    hits.push({score,p:point,normal,mesh:hit.object.name,
     kind:'driver-facing-panel',hitDistance:hit.distance});
   }
  }
 }
 hits.sort((a,b)=>a.score-b.score);
 if(!hits.length)throw Error('No visible dashboard face forward of the original seats');
 const mount=hits[0],clock=new THREE.Group();
 // The thin LCD bezel is seated against the imported surface. Angle its
 // face toward the driver rather than leaving it flat on the dashboard top.
 const eyeVector=driverEye.clone().sub(local(car,mount.p.toArray())).normalize();
 const displayNormal=mount.normal.clone().multiplyScalar(.25)
  .addScaledVector(eyeVector,.75).normalize();
 const displayReadableAngle=displayNormal.dot(eyeVector);
 clock.name='Factory-sized recessed digital dashboard readout';
 clock.position.copy(mount.p).addScaledVector(mount.normal,.005);
 clock.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),displayNormal);
 const plastic=new THREE.Mesh(new THREE.BoxGeometry(.238,.091,.009),
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
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.218,.077),
  new THREE.MeshBasicMaterial({map,toneMapped:false}));
 face.name='12:47 AM inset display';
 face.position.z=.0053;clock.add(face);
 car.add(clock);
 const visibleClockPoint=local(car,clock.position.toArray());
 const viewRay=visibleClockPoint.clone().sub(driverEye);
 const clockDistance=viewRay.length();
 const blockers=new THREE.Raycaster(driverEye,viewRay.normalize(),.03,clockDistance-.018)
  .intersectObject(model,true).filter(h=>!/window|wheel|tire|rim/i.test(h.object.name));
 const unobstructedFromDriver=blockers.length===0;
 if(!unobstructedFromDriver)throw Error('Dashboard clock is hidden behind original car geometry');
 return Object.freeze({
  time:'12:47 AM',localPosition:clock.position.toArray(),importedCarPreserved:true,
  mountedToImportedDash:mount.p.z<-.80,unobstructedFromDriver,surfaceGap:.005,displayWidth:.218,
  mountDepth:mount.p.z,clockDistance,
  hitMesh:mount.mesh,mountKind:mount.kind,displayNormal:displayNormal.toArray(),
  importedSurfaceNormal:mount.normal.toArray(),displayReadableAngle
 });
}
