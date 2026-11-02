/**
 * V65 review-only Pinewood Mall exterior.
 * A shuttered late-1970s/1980s regional shopping mall: heavy concrete masses,
 * very few clerestory lights, a boarded public entry, and a legible period sign.
 * Never alter the authorized service entrance at x=12 or the walking path.
 * All material assets load locally before the cinematic preload cover lifts.
 */
import * as THREE from '../vendor/three/build/three.module.js';
const box=(g,name,x,y,z,w,h,d,material)=>{
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.name=name;mesh.position.set(x,y,z);g.add(mesh);return mesh;
};
const surface=(color,roughness=.9,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const sand=surface(0x9e9886);
const oxidized=surface(0x4b514c,.85,.24);
const deep=surface(0x101a1b,.99);
const gold=surface(0x927b4f,.92,.18);
const leaf=surface(0x192e2c,.95);
const stained=surface(0x414c48,.96);
const file=new URL('./assets/v65/weathered_planks_diff_1k.jpg',import.meta.url);

function woodMaterial(texture,repeatX=1,repeatY=1){
 const map=texture.clone();map.needsUpdate=true;
 map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(repeatX,repeatY);
 map.anisotropy=4;
 return new THREE.MeshStandardMaterial({color:0xaba391,map,roughness:.98,side:THREE.DoubleSide});
}
function signTexture(){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=400;
 const c=canvas.getContext('2d');
 const bg=c.createLinearGradient(0,0,0,400);
 bg.addColorStop(0,'#263e39');bg.addColorStop(.55,'#21332f');bg.addColorStop(1,'#0e201e');
 c.fillStyle=bg;c.fillRect(0,0,2048,400);
 c.lineWidth=11;c.strokeStyle='#8c7955';c.strokeRect(15,15,2018,370);
 c.lineWidth=3;c.strokeStyle='#b4a47b';c.strokeRect(35,35,1978,330);
 // Period geometric pine emblem: simple flat metal-screenprint silhouette.
 c.fillStyle='#c5bb90';
 const pine=(x,y,s)=>{
  c.beginPath();c.moveTo(x,y-130*s);c.lineTo(x-69*s,y+41*s);
  c.lineTo(x-28*s,y+31*s);c.lineTo(x-76*s,y+87*s);
  c.lineTo(x+76*s,y+87*s);c.lineTo(x+28*s,y+31*s);
  c.lineTo(x+69*s,y+41*s);c.closePath();c.fill();
  c.fillRect(x-9*s,y+76*s,18*s,39*s);
 };
 pine(174,194,1.02);
 c.textAlign='left';c.fillStyle='#dfd6b3';
 c.font='bold 185px Georgia, serif';c.fillText('PINEWOOD',337,231,1595);
 c.font='bold 52px Arial, sans-serif';c.fillStyle='#c2b28d';
 c.fillText('M   A   L   L',1000,315,525);
 c.fillRect(355,294,580,3);c.fillRect(1555,294,330,3);
 // Repeatable weathering: dozens of small flakes, not arbitrary wall shapes.
 for(let i=0;i<420;i++){
  const x=(i*127.67+23)%2030,y=(i*41.83+17)%391;
  c.fillStyle=i%4===0?'rgba(9,19,18,.35)':'rgba(164,154,119,.15)';
  c.fillRect(x,y,1+(i%8)*1.4,1+(i%3)*1.1);
 }
 const tex=new THREE.CanvasTexture(canvas);
 tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;return tex;
}
function placardTexture(){
 const canvas=document.createElement('canvas');canvas.width=740;canvas.height=210;
 const c=canvas.getContext('2d');
 c.fillStyle='#d6ceb5';c.fillRect(0,0,740,210);
 c.strokeStyle='#564e42';c.lineWidth=9;c.strokeRect(13,13,714,184);
 c.fillStyle='#342e29';c.textAlign='center';
 c.font='bold 72px Georgia';c.fillText('CLOSED',370,91);
 c.font='bold 29px Arial';c.fillText('NO PUBLIC ACCESS',370,148);
 c.font='20px Arial';c.fillText('AUTHORIZED PERSONNEL — USE SERVICE ENTRANCE',370,184);
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function facadeConstruction(stage,texture){
 const {world,facadeMaterials}=stage;
 const {facade,steel}=facadeMaterials;
 const g=new THREE.Group();g.name='V65 shuttered Pinewood Mall exterior';world.add(g);
 const structure=(name,x,y,z,w,h,d,material=facade)=>box(g,name,x,y,z,w,h,d,material);
 // Existing 8m-height load-bearing wall and narrow service doorway are untouched.
 // A broad raised parapet and a stepped central tower create a ~17m silhouette.
 structure('west raised wing',-34.25,11.05,-22.55,36.5,5.5,1.05);
 structure('east raised wing',27.25,11.05,-22.55,39.5,5.5,1.05);
 structure('central raised entry tower',-10.5,12.50,-22.65,31,8.8,1.30);
 structure('west parapet coping',-34.25,13.87,-22.54,37,.34,1.46,oxidized);
 structure('east parapet coping',27.25,13.87,-22.54,40,.34,1.46,oxidized);
 structure('tower parapet coping',-10.5,17.08,-22.65,31.7,.46,1.64,oxidized);
 // Deliberate historic banding, not regularly spaced fake mullions.
 structure('tower lower concrete fascia',-10.5,9.08,-21.81,31.15,.36,.38,stained);
 structure('tower upper inset fascia',-10.5,15.87,-21.96,30.4,.18,.16,gold);
 // The public entry is a single centered door bank. The solid wall behind
 // remains sealed: the player cannot enter it by walking through plywood.
 const entryX=-10.5,entryZ=-21.46;
 structure('recessed public entrance dark recess',entryX,3.16,-21.76,9.6,6.05,.20,deep);
 structure('west entry pilaster',-15.56,3.45,-21.50,.62,6.9,.76,facade);
 structure('east entry pilaster',-5.44,3.45,-21.50,.62,6.9,.76,facade);
 structure('entry concrete lintel',entryX,6.68,-21.47,11.0,.55,.95,facade);
 structure('entry rusted canopy fascia',entryX,6.38,-20.81,11.0,.22,1.65,steel);
 structure('entry canopy underside',entryX,6.23,-20.77,10.75,.08,1.55,stained);
 structure('public doors center mullion',entryX,3.13,-21.30,.16,5.85,.17,steel);
 for(const x of[-14.87,-6.13]){
  structure('public door outer mullion',x,3.13,-21.30,.15,5.85,.17,steel);
 }
 structure('public entry transom',entryX,5.71,-21.27,9.0,.16,.17,steel);
 // Full-size mismatched horizontal planks over two door leaves, plus
 // purposeful diagonal anti-entry bracing. Locally sampled real CC0 timber.
 const board=woodMaterial(texture,1.3,.33);
 const darkBoard=woodMaterial(texture,.8,.5);
 let count=0;
 for(const cx of[-12.65,-8.35]){
  for(let i=0;i<16;i++){
   const offset=(i%3-1)*.09;
   const plank=structure('weathered boarded public-door plank '+(++count),
    cx+offset,.49+i*.313,entryZ+.015+(i%2)*.008,4.18,.292,.095,i%4===0?darkBoard:board);
   if(i%7===0)plank.rotation.z=.008*(i%2?1:-1);
  }
  // Diagonal bracing rests ON TOP of the boarding, not floating out of wall.
  const bracing=structure('diagonal boarded-door brace '+(++count),
   cx,3.0,entryZ+.13,.35,5.45,.13,woodMaterial(texture,.35,1.9));
  bracing.rotation.z=cx<entryX?-.36:.36;
 }
 for(const x of[-14.65,-10.45,-6.25]){
  for(const y of[.62,1.84,3.06,4.28,5.32]){
   const nail=new THREE.Mesh(new THREE.SphereGeometry(.027,7,5),oxidized);
   nail.position.set(x,y,entryZ+.09);g.add(nail);
  }
 }
 const placard=new THREE.Mesh(new THREE.PlaneGeometry(3.5,.99),
  new THREE.MeshStandardMaterial({map:placardTexture(),roughness:1,side:THREE.DoubleSide}));
 placard.name='public entry CLOSED sign';placard.position.set(entryX,3.45,-21.22);g.add(placard);
 structure('public entry abandoned step',entryX,.07,-20.92,11,.15,1.8,stained);
 // Two high narrow clerestory openings only; no repeating ground-floor glass.
 const windows=[-35.7,32.0];
 for(const x of windows){
  structure('high clerestory black glass at '+x,x,11.45,-21.957,2.55,1.15,.16,deep);
  structure('clerestory top metal reveal at '+x,x,12.09,-21.91,2.92,.13,.17,steel);
  structure('clerestory bottom metal reveal at '+x,x,10.82,-21.91,2.92,.13,.17,steel);
  for(const offset of[-1.40,1.40])structure('clerestory side reveal at '+(x+offset),
   x+offset,11.45,-21.92,.12,1.35,.15,steel);
 }
 // Late-70s institutional sign on an architectural backplate, not a flat
 // poster: mounted high enough to read over the car from the arrival lot.
 const signX=-10.5,signY=13.13,signZ=-21.86;
 structure('large vintage Pinewood Mall sign backplate',signX,signY,-22.015,27.4,3.67,.28,steel);
 const face=new THREE.Mesh(new THREE.PlaneGeometry(27.1,3.4),
  new THREE.MeshStandardMaterial({map:signTexture(),roughness:.86,emissive:0x352e20,emissiveIntensity:.17}));
 face.name='large weathered 1980s PINEWOOD MALL sign';face.position.set(signX,signY,signZ);g.add(face);
 // Localized dark leaking below upper coping; all weathering follows
 // architectural edges rather than introducing invented frontage rectangles.
 structure('tower rain staining beneath coping',-10.5,16.71,-21.965,29.4,.32,.035,
  surface(0x343b37,.99));
 const status={
  version:65,state:'ready',heightMeters:17.31,frontWindowCount:windows.length,
  mainEntranceBoarded:true,boardingPlankCount:count,
  mainEntrance:{centerX:entryX,centerZ:entryZ,width:9.6,routeBlocked:true},
  sign:{centerX:signX,centerY:signY,width:27.1,height:3.4,style:'weathered 1980s forest-green and cream'},
  asset:'weathered_planks_diff_1k.jpg',textureLoaded:true,
  contractorDoorUnchanged:true
 };
 stage.facadeV65=status;
 return status;
}
export function installAbandonedFacadeV65(stage){
 if(!stage?.world||!stage?.facadeMaterials||!stage?.serviceEntry)
  return Promise.reject(Error('V65 facade requires the preserved v64 stage and service entry'));
 return new Promise((resolve,reject)=>{
  new THREE.TextureLoader().load(file.href,texture=>{
   texture.colorSpace=THREE.SRGBColorSpace;
   try{resolve(facadeConstruction(stage,texture));}catch(error){reject(error);}
  },undefined,reject);
 });
}