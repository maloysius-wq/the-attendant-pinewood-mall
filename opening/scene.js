import * as THREE from '../vendor/three/build/three.module.js';
import {upgradeOpeningSceneV37} from './environment-v37.js?v=43';
import {installMallPlantersV63} from './landscape-v63.js?v=63';
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const mat=(color,roughness=.85,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const lit=(color,intensity=.4)=>new THREE.MeshStandardMaterial({color,roughness:.73,emissive:color,emissiveIntensity:intensity});
function box(g,x,y,z,sx,sy,sz,m){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),m);o.position.set(x,y,z);g.add(o);return o;}
function cyl(g,x,y,z,r,h,m){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),m);o.position.set(x,y,z);g.add(o);return o;}
function lamp(s,x,y,z,color,intensity,range){const o=new THREE.PointLight(color,intensity,range,2);o.position.set(x,y,z);s.add(o);}
function canvasText(title,lines,opt={}){
 const cv=document.createElement('canvas');cv.width=opt.w||720;cv.height=opt.h||880;const c=cv.getContext('2d');
 c.fillStyle=opt.bg||'#ded8c9';c.fillRect(0,0,cv.width,cv.height);
 for(let i=0;i<55;i++){c.fillStyle='rgba(25,20,19,.055)';c.fillRect((i*97)%cv.width,(i*173)%cv.height,i%3+1,1);}
 c.lineWidth=5;c.strokeStyle='rgba(43,39,34,.55)';c.strokeRect(28,28,cv.width-56,cv.height-56);
 c.fillStyle=opt.accent||'#7b3338';c.fillRect(48,55,cv.width-96,13);
 c.textAlign='left';c.fillStyle=opt.fg||'#242b30';c.font='bold '+Math.floor(cv.width*.052)+'px Arial';
 let yy=135;for(const t of title.split('\n')){c.fillText(t,58,yy);yy+=52;}
 c.font=Math.floor(cv.width*.032)+'px Arial';yy+=32;
 for(const line of lines){const words=line.split(' ');let row='';for(const word of words){const next=row?row+' '+word:word;if(c.measureText(next).width>cv.width-110){c.fillText(row,58,yy);row=word;yy+=40;}else row=next;}c.fillText(row,58,yy);yy+=69;}
 const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function notice(g,title,lines,x,y,z,w=.9,h=1.15,options={}){
 // The backplate embeds in the solid wall, paper and fasteners sit on its exposed face.
 const b=box(g,x,y,z-.035,w+.06,h+.06,.055,mat(0x554c45));
 const tx=canvasText(title,lines,options);const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tx,roughness:.93,side:THREE.DoubleSide}));
 face.position.set(x,y,z+.004);face.userData.openingWallPaper=title;g.add(face);
 const nail=mat(0xaaa59d,.25,.6);
 for(const dx of[-w*.4,w*.4]){const p=cyl(g,x+dx,y+h*.43,z+.02,.018,.025,nail);p.rotation.x=Math.PI/2;}
 return face;
}
function sign(g,words,x,y,z,w,h){
 const tx=canvasText(words,[],{w:1024,h:180,bg:'#293e43',fg:'#dfd8b9',accent:'#94856c'});
 const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tx,emissive:0x3b3228,emissiveIntensity:.13,roughness:.67}));
 o.position.set(x,y,z);g.add(o);return o;
}
function glass(){return new THREE.MeshPhysicalMaterial({color:0x354d5c,roughness:.13,metalness:0,transparent:true,opacity:.30,depthWrite:false,side:THREE.DoubleSide});}
export const shots={
 car:{pos:v(-10.54,1.59,18.08),end:v(-10.53,1.57,18.04),look:v(-7,2.45,-22),endLook:v(0,2.85,-22)},
 lot:{pos:v(-9,1.72,15),end:v(-6,1.72,12),look:v(12,2,-22),endLook:v(12,1.5,-22)},
 walk:{pos:v(-5,1.71,11),end:v(5,1.71,-9),look:v(12,1.5,-22),endLook:v(12,1.6,-22)},
 entrance:{pos:v(5,1.7,-9),end:v(9,1.7,-15.8),look:v(12,1.6,-22),endLook:v(13.65,1.4,-22)},
 keypad:{pos:v(11.4,1.70,-18.6),end:v(12.6,1.63,-20.1),look:v(13.65,1.37,-21.8),endLook:v(13.65,1.37,-21.8)},
 inside:{pos:v(12,1.73,-24.2),end:v(10,1.73,-26.1),look:v(0,2.4,-40),endLook:v(0,2.4,-40)},
 interiorWide:{pos:v(10,1.73,-26.1),end:v(6.7,1.73,-28.1),look:v(0,2.5,-39),endLook:v(0,2.5,-39)}
};
export function makeOpeningScene({useImportedLandscape=false}={}){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x111a22);scene.fog=new THREE.FogExp2(0x18242a,.010);
 const world=new THREE.Group();scene.add(world);
 const concrete=mat(0x727069,.96),steel=mat(0x48545a,.72,.37),facade=mat(0x586367,.96),dark=mat(0x1d292d,.92),windowMat=glass();
 const lotMaterial=mat(0x171e20,.99);
 box(world,0,-.22,16,115,.43,105,lotMaterial);box(world,0,-.07,-17.7,103,.22,10.2,concrete);
 box(world,0,.07,-13.75,103,.24,.35,concrete);
 for(let x=-39;x<45;x+=6){const p=box(world,x,.012,13,2.6,.018,.1,mat(0x898779));p.rotation.y=-.1;}
 // V46: One authoritative door dimension set drives the slab, the wall
 // cutout, the steel jambs, header, reveal and sill. Do not independently
 // resize the frame: it used to leave a glaring ~90mm gap on EACH side.
 // Owner wants a slightly narrower, physically thinner door with snug trim.
 const serviceDoor={
  centerX:12,width:1.78,height:2.27,thickness:.095,
  base:.006,sideClearance:.018,headClearance:.018
 };
 const serviceOpening={
  centerX:serviceDoor.centerX,
  left:serviceDoor.centerX-serviceDoor.width/2-serviceDoor.sideClearance,
  right:serviceDoor.centerX+serviceDoor.width/2+serviceDoor.sideClearance,
  bottom:0,top:serviceDoor.base+serviceDoor.height+serviceDoor.headClearance,
  wallZ:-22.5
 };
 box(world,-17,4,-22.5,55,8.2,.9,facade);
 box(world,31,4,-22.5,34,8.2,.9,facade);
 const serviceLeftInfill=box(world,(10.5+serviceOpening.left)/2,4,-22.5,serviceOpening.left-10.5,8.2,.9,facade);
 const serviceRightInfill=box(world,(14+serviceOpening.right)/2,4,-22.5,14-serviceOpening.right,8.2,.9,facade);
 const serviceHeaderInfill=box(world,serviceDoor.centerX,(8.1+serviceOpening.top)/2,-22.5,serviceOpening.right-serviceOpening.left,8.1-serviceOpening.top,.9,facade);
 box(world,0,8.55,-22.48,106,1.1,.96,mat(0x55615d));
 for(let x=-42;x<43;x+=8.4){box(world,x,4,-21.91,.22,6.7,.37,concrete);}
 for(let x=-40;x<43;x+=9){if(x>9&&x<16)continue;box(world,x,3.9,-21.89,5.9,4.3,.11,dark);box(world,x,3.9,-21.8,5.5,4,.035,windowMat);}
 sign(world,'PINEWOOD MALL',0,7.58,-21.86,20,1.55);
 notice(world,'A PLACE TO\nBELONG',['SHOP • EAT • MEET','PINEWOOD MALL','A PLACE FOR EVERYONE'],-17,3.1,-21.72,2.0,2.28,{bg:'#c4c2bc'});
 notice(world,'GRAND HOLIDAY\nSALE',['CASSETTE CASTLE','NOVEMBER 1997','EVERYTHING MUST GO'],-28,2.95,-21.72,2.05,2.20,{bg:'#bd9ba9'});
 // Compact weather canopy: roughly 1.6x the door width, not a 7.2m awning.
 const serviceCanopy=box(world,12,2.82,-21.25,3.10,.18,1.80,concrete);
 const canopyFascia=box(world,12,2.72,-20.36,3.10,.15,.07,mat(0x283135,.82,.28));
 // Frame inner edges terminate at the actual aperture, with only 18mm of
 // clearance around the 1.78m slab. Closed door sits INSIDE the jamb faces,
 // not in a 2.13m black hole. Head and posts share the same outer corners.
 const frameMat=mat(0x30383a,.72,.22);
 const jambWidth=.11,headHeight=.11,frameZ=-21.97;
 const serviceLeftJamb=box(world,serviceOpening.left-jambWidth/2,serviceOpening.top/2,
  frameZ,jambWidth,serviceOpening.top,.115,frameMat);
 const serviceRightJamb=box(world,serviceOpening.right+jambWidth/2,serviceOpening.top/2,
  frameZ,jambWidth,serviceOpening.top,.115,frameMat);
 const serviceDoorHead=box(world,serviceDoor.centerX,serviceOpening.top+headHeight/2,
  frameZ,serviceOpening.right-serviceOpening.left+jambWidth*2,headHeight,.115,frameMat);
 const serviceSill=box(world,serviceDoor.centerX,.015,-21.99,
  serviceOpening.right-serviceOpening.left+.07,.03,.13,mat(0x515753,.89,.12));
 // The hinge runs at the door's OWN left edge. Door and its trim remain
 // square at rest; the existing cinematic swing still uses this pivot.
 const pivot=new THREE.Group();
 pivot.position.set(serviceDoor.centerX-serviceDoor.width/2,0,-22.05);world.add(pivot);
 const doorMid=serviceDoor.width/2;
 const serviceDoorSlab=box(pivot,doorMid,serviceDoor.base+serviceDoor.height/2,
  .079,serviceDoor.width,serviceDoor.height,serviceDoor.thickness,steel);
 box(pivot,doorMid,1.59,.17,1.38,1.0,.032,windowMat);
 box(pivot,serviceDoor.width-.25,1.06,.17,.12,.28,.05,concrete);
 box(world,13.65,1.38,-21.81,.46,.81,.18,steel);
 box(world,13.65,1.50,-21.67,.32,.25,.03,lit(0x648677,.45));
 for(let r=0;r<3;r++)for(let col=0;col<3;col++)box(world,13.52+col*.13,1.30-r*.11,-21.67,.075,.066,.025,concrete);
 notice(world,'AUTHORIZED\nCONTRACTORS',['REPORT ELECTRICAL HAZARDS','DO NOT PROP FIRE DOORS','ENTRY IS RECORDED'],15.5,1.76,-21.72,1.14,1.32);
 notice(world,'BUILDING\nNOTICE',['PROPERTY CLOSED TO PUBLIC','SERVICE ENTRY ONLY','VERIFY DISPATCH AUTHORIZATION'],9.25,1.75,-21.72,1.06,1.27);
 for(let x of[9,15])cyl(world,x,.68,-18.5,.16,1.35,mat(0x595c4f,.55,.24));
 // Concrete/steel mall structures continue into real 3D interior.
 box(world,0,-.09,-38.9,38,.2,36,mat(0x5e5b55,.97));
 box(world,-19,3.5,-39,.4,7,36,facade);box(world,19,3.5,-39,.4,7,36,facade);
 box(world,0,3.5,-56,.45,7,.45,facade);
 for(let x of[-13,13])for(let z of[-31,-39,-47]){
  box(world,x,2.95,z,9,5.7,.23,dark);box(world,x,2.75,z+.17,8.5,4.35,.06,steel);
  for(let k=0;k<13;k++)box(world,x-3.8+k*.62,2.75,z+.22,.021,4,.025,dark);
  sign(world,z===-39?'CASSETTE CASTLE':'PINEWOOD RETAIL',x,5.51,z+.23,5.3,.58);
 }
 cyl(world,0,.31,-39,2.8,.58,concrete);cyl(world,0,.61,-39,2.25,.13,mat(0x263237,.96));
 box(world,0,2.4,-31.2,3.5,3,.2,concrete);sign(world,'DIRECTORY',0,3.6,-31.05,3,.55);
 notice(world,'PINEWOOD\nSERVICE MAP',['A  CONCOURSE / EMERGENCY','B  RETAIL / PA','C  SERVICE / FREIGHT','EAST WING  AUTHORIZED'],0,2.2,-31.01,2.45,1.98,{h:700});
 notice(world,'STAFF\nNOTICE',['VERIFY DOORS','RETURN ALL KEYS','CLOCK OUT BEFORE LEAVING'],9.3,1.8,-55.73,1.14,1.39);
 for(const z of[-32,-43,-52])for(const x of[-8,8]){box(world,x,6.5,z,2.8,.14,.55,mat(0x646960));lamp(scene,x,6.25,z,0xb9c3b4,.8,9);}
 // Complete enclosed CC0 1990s hatchback: real roof, seats, transparent glass.
 // No procedural car shell, truck cutaway or phone mount.
 const car=new THREE.Group();car.name='Sole full 1990s hatchback placement';car.position.set(-10,0,17.5);world.add(car);
 // Parking fixtures.
 for(const [x,z] of[[-21,9],[28,5],[0,28]]){cyl(world,x,3.9,z,.09,7.8,steel);box(world,x,7.75,z,.8,.2,.5,concrete);lamp(scene,x,7.3,z,0xd9c6a3,3.2,19);}
 // Keep primitive planters solely for legacy/production scenes; v63 is model-only.
 if(!useImportedLandscape){for(let i=0;i<7;i++){const x=-32+i*10;box(world,x,.38,-13.7,4.2,.55,1.35,concrete);for(let k=-1;k<=1;k++)cyl(world,x+k*.9,.86,-13.7,.55,.7,mat(0x2a382e));}}
 box(world,-37,.72,-17,2.8,1.4,1.7,mat(0x24423c,.8,.5));
 lamp(scene,12,3.0,-19.4,0xb9d9bc,3.2,22);lamp(scene,0,4.3,-42,0xb9c6bb,1.4,18);
 lamp(scene,0,5,-15.0,0xc6c4b5,5.2,36);
 lamp(scene,-17,3,-17.4,0x93b6c0,1.4,24);
 lamp(scene,1,3.8,-33,0xd6d3c0,2.8,18);
 scene.add(new THREE.HemisphereLight(0xb8cad4,0x373631,2.4));scene.add(new THREE.AmbientLight(0x8ba19b,.58));
 // Atmospheric rain dots. No ambience audio yet.
 const rainCount=650,positions=new Float32Array(rainCount*3);
 for(let i=0;i<rainCount;i++){positions[i*3]=((i*41.71)%108)-54;positions[i*3+1]=((i*17.23)%13)+.3;positions[i*3+2]=((i*29.31)%55)-11;}
 const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const rain=new THREE.Points(geom,new THREE.PointsMaterial({color:0x93aec0,size:.055,transparent:true,opacity:.52,depthWrite:false}));world.add(rain);
 const stage={scene,world,pivot,rain,
  serviceEntry:{
   opening:serviceOpening,doorSpecs:serviceDoor,doorSlab:serviceDoorSlab,
   leftInfill:serviceLeftInfill,rightInfill:serviceRightInfill,
   headerInfill:serviceHeaderInfill,leftJamb:serviceLeftJamb,
   rightJamb:serviceRightJamb,head:serviceDoorHead,sill:serviceSill,
   canopy:serviceCanopy,canopyFascia
  }
 };
 const environmentReady=upgradeOpeningSceneV37({
  scene,world,car,stage,materials:{facade,steel},lotMaterial
 });
 // The opaque v63 preload awaits vendored third-party models before reveal.
 stage.assetReady=useImportedLandscape
  ?Promise.all([environmentReady,installMallPlantersV63(world)]).then(([status,landscape])=>{
    status.landscape=landscape;return status;
   })
  :environmentReady;
 return stage;
}
