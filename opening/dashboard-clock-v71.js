/**
 * Factory-sized 12:47 AM clock, mounted directly below the sedan's central
 * horizontal grille. Coordinates are measured against the pinned original
 * low-poly_sedan_car.glb; the car mesh itself remains untouched.
 */
import * as THREE from '../vendor/three/build/three.module.js';

const local=(car,p)=>car.localToWorld(new THREE.Vector3(...p));
// Original Interior_InteriorPanel_0 slat center, measured in car-local
// coordinates after sedan scale and 180-degree vehicle rotation.
const VENT_CENTER=new THREE.Vector3(0,1.0534,-.74935);
const VENT_FACE_NORMAL=new THREE.Vector3(0,.202,.979).normalize();
const VENT_BELOW_Y=[.945,.937,.928]; // narrow visibility fallback, same centerline

export function installDashboardClockV71(car){
 const model=car?.children?.find(child=>child.name==='Complete scailman CC-BY-4.0 Low-Poly Sedan');
 if(!car?.isGroup||!model||car.children.filter(x=>x.name===model.name).length!==1)
  throw Error('The dashboard clock needs the complete imported sedan');
 car.updateWorldMatrix(true,true);
 const eyeLocal=new THREE.Vector3(-.33,1.22,-.08);
 const driverEye=local(car,eyeLocal.toArray());
 const clock=new THREE.Group();
 clock.name='Factory-sized digital clock directly below center dash vent';
 const displayNormal=VENT_FACE_NORMAL.clone();
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

 const corners=[[-.0755,-.030],[.0755,-.030],[-.0755,.030],[.0755,.030]];
 const rejected=[];
 let mount,clockDistance=0,displayReadableAngle=0;
 for(const y of VENT_BELOW_Y){
  // Cast straight toward the actual imported dashboard panel. No candidate
  // search across unrelated roof, seat or steering-column triangles.
  const start=local(car,[VENT_CENTER.x,y,-.4]);
  const end=local(car,[VENT_CENTER.x,y,-1.1]);
  const direction=end.sub(start).normalize();
  const hit=new THREE.Raycaster(start,direction,.08,1.0)
   .intersectObject(model,true)
   .find(h=>h.object.name==='Interior_InteriorPanel_0' &&
    car.worldToLocal(h.point.clone()).z<-.65);
  if(!hit?.face){rejected.push({y,reason:'no imported center panel'});continue;}
  const surface=car.worldToLocal(hit.point.clone());
  const faceToEye=eyeLocal.clone().sub(surface).normalize();
  displayReadableAngle=displayNormal.dot(faceToEye);
  // The bezel's 36mm back reaches the vendor dash; its 40mm front carries
  // the LCD ahead of the panel, with the same pitch as the vent.
  clock.position.copy(surface).addScaledVector(displayNormal,.038);
  clock.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),displayNormal);
  clock.updateWorldMatrix(true,true);
  const targets=[...corners,[0,0]].map(([x,y])=>face.localToWorld(new THREE.Vector3(x,y,0)));
  const blocked=targets.filter(target=>{
   const ray=target.clone().sub(driverEye);
   const distance=ray.length();
   if(distance<=.20)return true;
   return new THREE.Raycaster(driverEye,ray.normalize(),.18,distance-.012)
    .intersectObject(model,true)
    .some(h=>!/window|wheel|tire|rim/i.test(h.object.name));
  });
  if(blocked.length||displayReadableAngle<.75){
   rejected.push({y,reason:'occlusion or unreadable angle',blocked:blocked.length});
   continue;
  }
  mount={p:surface,mesh:hit.object.name,kind:'center-console-under-vent',
   normal:displayNormal.clone()};
  clockDistance=targets[4].distanceTo(driverEye);
  break;
 }
 if(!mount)throw Error('Under-vent clock obstructed by imported sedan: '+JSON.stringify(rejected));
 return Object.freeze({
  time:'12:47 AM',localPosition:clock.position.toArray(),importedCarPreserved:true,
  mountedToImportedDash:true,unobstructedFromDriver:true,surfaceGap:.002,
  displayWidth:.151,visibleDisplayCorners:4,
  mountDepth:mount.p.z,clockDistance,interiorNearPlane:.18,
  mountCandidates:{dashboardTop:0,frontPanel:1,checked:rejected.length+1},
  hitMesh:mount.mesh,mountKind:mount.kind,
  displayNormal:displayNormal.toArray(),importedSurfaceNormal:mount.normal.toArray(),
  ventCenter:VENT_CENTER.toArray(),ventNormal:VENT_FACE_NORMAL.toArray(),
  ventCenterOffsetX:Math.abs(clock.position.x-VENT_CENTER.x),
  displayVentNormalDot:displayNormal.dot(VENT_FACE_NORMAL),
  displayReadableAngle
 });
}
