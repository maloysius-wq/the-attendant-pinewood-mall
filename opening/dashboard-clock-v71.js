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
 const hits=[];
 const driverEye=local(car,[-.20,1.24,.19]);
 // Prefer the ORIGINAL driver's visible center-stack panel over the
 // horizontal windshield ledge. Shoot rays out of the seated driver's eye,
 // using actual GLB triangles; a front-facing body hit is physically visible.
 for(const x of [.34,.44,.24,.54,.14,.05]){
  for(const y of [.94,.88,1.01,.81,1.08]){
   for(const z of [-.35,-.46,-.57,-.25,-.68]){
    const direction=local(car,[x,y,z]).sub(driverEye).normalize();
    const first=new THREE.Raycaster(driverEye,direction,.06,2)
     .intersectObject(model,true)
     .find(hit=>!/window|wheel|tire|rim/i.test(hit.object.name));
    if(!first)continue;
    const p=car.worldToLocal(first.point.clone());
    if(p.y<.73||p.y>1.16||p.z>-.14||p.z<-.96)continue;
    const normal=first.face.normal.clone().transformDirection(first.object.matrixWorld);
    const toEye=driverEye.clone().sub(first.point).normalize();
    if(normal.dot(toEye)<0)normal.negate();
    if(normal.z<.27||normal.dot(toEye)<.20)continue;
    const score=-10+Math.abs(p.x-.04)*5+Math.abs(p.z+.39)*.7+
     Math.abs(p.y-1.07)*5+(1-normal.dot(toEye))*.15;
    hits.push({score,p,normal,mesh:first.object.name,kind:'driver-facing-panel'});
   }
  }
 }
 // Accept only dash surfaces on the first visible line of sight from the
 // driver's eye. The nearest top hit was behind the wheel/other car meshes.
 // Probe across the passenger side of the original center dashboard.
 // All positions are in the imported vehicle's measured, full-size meters.
 for(const x of [.39,.33,.47,.26,.18,.11,.05,-.05]){
  for(const z of [-.62,-.70,-.53,-.43,-.82,-.30]){
   const ray=new THREE.Raycaster(local(car,[x,1.26,z]),new THREE.Vector3(0,-1,0),.05,.68);
   for(const hit of ray.intersectObject(model,true)){
    if(/window|wheel|tire|rim/i.test(hit.object.name))continue;
    const p=car.worldToLocal(hit.point.clone());
    if(p.y<.68||p.y>1.16||p.z>-.25||p.z<-.98)continue;
    const direct=hit.point.clone().sub(driverEye),distance=direct.length();
    const blockers=new THREE.Raycaster(driverEye,direct.normalize(),.02,distance-.035)
     .intersectObject(model,true).filter(h=>!/window|wheel|tire|rim/i.test(h.object.name));
    if(blockers.length)continue; // Genuine occlusion, not an unobstructed insert.
    const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    const toEye=driverEye.clone().sub(hit.point).normalize();
    if(normal.dot(toEye)<0)normal.negate();
    // A near-vertical center stack is ideal, but the real dash top is valid.
    const score=Math.abs(p.x-.34)*1.2+Math.abs(p.z+.61)*.48+
     Math.abs(p.y-.89)*.8+(1-Math.max(0,normal.dot(toEye)))*.08;
    hits.push({score,p,normal,mesh:hit.object.name,kind:'dashboard-top'});
    break;
   }
  }
 }
 hits.sort((a,b)=>a.score-b.score);
 if(!hits.length)throw Error('Cannot locate a real imported dashboard mounting surface; refusing to float the clock');
 const mount=hits[0],clock=new THREE.Group();
 // The mounting foot touches the imported dashboard, while the shallow
 // factory LCD is angled toward the actual driver (like an inset clock).
 const eyeVector=driverEye.clone().sub(local(car,mount.p.toArray())).normalize();
 const displayNormal=mount.normal.clone().normalize();
 const displayReadableAngle=displayNormal.dot(eyeVector);
 clock.name='Factory-sized recessed digital dashboard readout';
 // The thin bezel seats into the actual mesh. It is not a freestanding box.
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
 return Object.freeze({
  time:'12:47 AM',localPosition:clock.position.toArray(),importedCarPreserved:true,
  mountedToImportedDash:true,unobstructedFromDriver:true,surfaceGap:.005,displayWidth:.218,
  hitMesh:mount.mesh,mountKind:mount.kind,displayNormal:displayNormal.toArray(),
  importedSurfaceNormal:mount.normal.toArray(),displayReadableAngle
 });
}
