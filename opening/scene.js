import * as THREE from '../vendor/three/build/three.module.js';
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
function phoneTexture(){
 const cv=document.createElement('canvas');cv.width=560;cv.height=1000;const c=cv.getContext('2d');
 const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;const draw=(x,y,t,sz=23,color='#d9e5dd',bold=false)=>{c.fillStyle=color;c.font=(bold?'bold ':'')+sz+'px Arial';c.fillText(t,x,y);};
 function update(mode='ticket'){
  c.fillStyle='#101a23';c.fillRect(0,0,560,1000);
  c.fillStyle='#2f505c';c.fillRect(0,0,560,105);
  draw(30,43,'FIELD SERVICE',29,'#f0e9db',true);draw(30,78,'DISPATCH / WORK ORDER',21,'#afcad0');
  c.fillStyle='#e2c778';c.fillRect(30,130,500,54);draw(54,166,'PRIORITY  •  ACCEPTED',25,'#182027',true);
  draw(29,246,'PINEWOOD MALL',43,'#f0f0e5',true);draw(30,288,'WO-28417 / EMERGENCY ELECTRICAL',19);
  c.fillStyle='#263c48';c.fillRect(28,316,504,88);draw(46,353,'PROPERTY CLOSED',28,'#d8b89d',true);draw(46,385,'AUTHORIZED SERVICE ENTRY',20);
  draw(32,472,'CIRCUIT STATUS',29,'#c1cfcb',true);
  ['CONCOURSE / LIGHTING','RETAIL / PA BRANCH','SERVICE / FREIGHT'].forEach((name,i)=>{
    const y=491+87*i;c.fillStyle='#20303b';c.fillRect(29,y,504,77);
    c.fillStyle='#d3a873';c.fillRect(43,y+17,41,39);draw(55,y+44,'ABC'[i],23,'#1e2120',true);
    draw(102,y+30,name,22);draw(103,y+59,'OFFLINE / INSPECT',18,'#f1a8a3');
  });
  draw(33,815,mode==='entry'?'CONTRACTOR ACCESS':mode==='checkin'?'ARRIVAL CONFIRMED':'ASSIGNED TASKS',25,'#c5d9d3',true);
  draw(33,854,mode==='entry'?'ENTRY PIN 2841':mode==='checkin'?'STATUS / ON SITE':'RESTORE A-C / TEST FREIGHT',22);
  c.fillStyle='#31534c';c.fillRect(30,901,499,68);draw(72,946,mode==='entry'?'CODE ACCEPTED':mode==='checkin'?'CHECK-IN COMPLETE':'OPEN SITE DIRECTORY',26,'#edf2e7',true);
  tx.needsUpdate=true;
 }
 update();return{texture:tx,update};
}
export const shots={
 car:{pos:v(-10.54,1.59,18.08),end:v(-10.53,1.57,18.04),look:v(-7,2.45,-22),endLook:v(0,2.85,-22)},
 phone:{pos:v(-10.54,1.57,18.08),end:v(-9.95,1.42,18.01),look:v(-9.30,1.08,17.56),endLook:v(-9.30,1.08,17.56)},
 lot:{pos:v(-9,1.72,15),end:v(-6,1.72,12),look:v(12,2,-22),endLook:v(12,1.5,-22)},
 walk:{pos:v(-5,1.71,11),end:v(5,1.71,-9),look:v(12,1.5,-22),endLook:v(12,1.6,-22)},
 entrance:{pos:v(5,1.7,-9),end:v(9,1.7,-15.8),look:v(12,1.6,-22),endLook:v(13.65,1.4,-22)},
 keypad:{pos:v(11.4,1.70,-18.6),end:v(12.6,1.63,-20.1),look:v(13.65,1.37,-21.8),endLook:v(13.65,1.37,-21.8)},
 inside:{pos:v(12,1.73,-24.2),end:v(10,1.73,-26.1),look:v(0,2.4,-40),endLook:v(0,2.4,-40)},
 interiorWide:{pos:v(10,1.73,-26.1),end:v(6.7,1.73,-28.1),look:v(0,2.5,-39),endLook:v(0,2.5,-39)}
};
export function makeOpeningScene(){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x111a22);scene.fog=new THREE.FogExp2(0x18242a,.010);
 const world=new THREE.Group();scene.add(world);
 const concrete=mat(0x727069,.96),steel=mat(0x48545a,.72,.37),facade=mat(0x586367,.96),dark=mat(0x1d292d,.92),windowMat=glass();
 box(world,0,-.22,16,115,.43,105,mat(0x171e20,.99));box(world,0,-.07,-17.7,103,.22,10.2,concrete);
 box(world,0,.07,-13.75,103,.24,.35,concrete);
 for(let x=-39;x<45;x+=6){const p=box(world,x,.012,13,2.6,.018,.1,mat(0x898779));p.rotation.y=-.1;}
 // Store facade has an actual two-metre opening.
 box(world,-17,4,-22.5,55,8.2,.9,facade);
 box(world,31,4,-22.5,34,8.2,.9,facade);
 box(world,12,6.35,-22.5,2.2,3.5,.9,facade);
 box(world,0,8.55,-22.48,106,1.1,.96,mat(0x55615d));
 for(let x=-42;x<43;x+=8.4){box(world,x,4,-21.91,.22,6.7,.37,concrete);}
 for(let x=-40;x<43;x+=9){if(x>9&&x<16)continue;box(world,x,3.9,-21.89,5.9,4.3,.11,dark);box(world,x,3.9,-21.8,5.5,4,.035,windowMat);}
 sign(world,'PINEWOOD MALL',0,7.58,-21.86,20,1.55);
 notice(world,'A PLACE TO\nBELONG',['SHOP • EAT • MEET','PINEWOOD MALL','A PLACE FOR EVERYONE'],-17,3.1,-21.72,2.0,2.28,{bg:'#c4c2bc'});
 notice(world,'GRAND HOLIDAY\nSALE',['CASSETTE CASTLE','NOVEMBER 1997','EVERYTHING MUST GO'],-28,2.95,-21.72,2.05,2.20,{bg:'#bd9ba9'});
 // Service door with actual swinging hinge and display.
 box(world,12.15,3.15,-20.7,7.2,.30,3.15,concrete);
 const pivot=new THREE.Group();pivot.position.set(11,0,-22.05);world.add(pivot);
 box(pivot,1.0,1.14,.08,1.95,2.27,.14,steel);box(pivot,1.0,1.59,.17,1.54,1.0,.032,windowMat);
 box(pivot,1.7,1.06,.21,.12,.28,.05,concrete);
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
 // The vehicle is a complete procedural model, not an inaccessible remote download.
 const car=new THREE.Group();car.position.set(-10,0,17.5);world.add(car);
 const paint=mat(0x3f4648,.5,.4),seat=mat(0x2c3031,.98);
 // Hollow cockpit: the original solid body intersected POV and hid the windshield.
 box(car,0,.58,0,2.28,.74,4.6,paint);
 box(car,0,1.00,-1.72,2.16,.42,1.13,paint);
 for(const side of [-1,1])box(car,side*1.08,1.07,.10,.10,.58,2.45,paint);
 box(car,0,.88,1.27,2.03,.25,.09,paint);
 // Hollow cab: four pillars and a thin roof. Never place an opaque cabin cube around the camera.
 box(car,0,2.08,.16,2.07,.14,2.45,paint);
 // Narrow pillars and low crossbraces, avoiding solid door geometry at eye height.
 for(const sx of[-.97,.97])for(const sz of[-1.08,1.08])box(car,sx,1.68,sz,.11,.65,.11,paint);
 // The rear frame sits below eye level so the first-person camera can see the windshield.
 box(car,0,1.02,1.28,2.03,.12,.10,paint);
 for(const x of[-1.04,1.04])for(const z of[-1.42,1.40]){const p=cyl(car,x,.47,z,.49,.25,seat);p.rotation.z=Math.PI/2;}
 box(car,0,1.47,-1.09,1.78,.77,.03,windowMat);
 box(car,0,1.03,-.78,2.1,.26,.72,seat);
 const wheel=new THREE.Mesh(new THREE.TorusGeometry(.34,.055,8,30),seat);wheel.position.set(-.57,1.23,-.55);wheel.rotation.x=.33;car.add(wheel);
 box(car,.55,1.12,-.59,.61,.22,.05,lit(0x2b5664,.28));
 box(car,-.56,1.38,1.12,.66,.55,.10,seat);
 box(car,.55,1.38,1.12,.66,.55,.10,seat);
 box(car,0,2.01,-1.10,1.99,.10,.12,paint);
 // Physical dash-mounted phone: bracket, adjustable neck, spring clips and lit LCD.
 // The driver's camera sees this through the windshield. It never floats in the seat.
 const phoneUi=phoneTexture(),holder=new THREE.Group();
 holder.position.set(.36,1.17,-.53);car.add(holder);
 const rubber=mat(0x171b1d,.96),mount=mat(0x353c40,.51,.4);
 const mountBase=box(holder,0,0,-.005,.37,.085,.30,rubber);
 const stem=box(holder,0,.17,.035,.075,.29,.075,mount);
 stem.rotation.x=-.14;
 const socket=box(holder,0,.30,.095,.18,.12,.12,mount);
 const cradle=new THREE.Group();cradle.position.set(0,.38,.09);
 cradle.rotation.y=-.28;cradle.rotation.x=-.06;holder.add(cradle);
 box(cradle,0,0,-.050,.50,.88,.075,mount);
 for(const x of[-.256,.256])for(const y of[-.28,.28]){
  box(cradle,x,y,.005,.058,.17,.075,rubber);
 }
 box(cradle,0,-.433,.02,.36,.067,.09,rubber);
 // The work order is the literal mesh texture, not the old floating HTML sheet.
 const phone=new THREE.Group();phone.position.set(0,0,.027);cradle.add(phone);
 box(phone,0,0,-.028,.437,.813,.047,rubber);
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.411,.775),new THREE.MeshBasicMaterial({map:phoneUi.texture}));
 face.position.set(0,0,.009);phone.add(face);
 box(phone,0,.386,.020,.094,.012,.014,mat(0x050a0c));
 box(world,-9.2,.45,18.75,1.1,.5,.84,mat(0x5a5549));
 // Parking fixtures.
 for(const [x,z] of[[-21,9],[28,5],[0,28]]){cyl(world,x,3.9,z,.09,7.8,steel);box(world,x,7.75,z,.8,.2,.5,concrete);lamp(scene,x,7.3,z,0xd9c6a3,3.2,19);}
 for(let i=0;i<7;i++){const x=-32+i*10;box(world,x,.38,-13.7,4.2,.55,1.35,concrete);for(let k=-1;k<=1;k++)cyl(world,x+k*.9,.86,-13.7,.55,.7,mat(0x2a382e));}
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
 return{scene,pivot,rain,phoneUi,phoneMount:holder};
}
