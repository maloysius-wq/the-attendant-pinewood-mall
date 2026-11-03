/**
 * Small physical after-hours digital readout attached to the real imported
 * enclosed hatchback, not a UI subtitle or a replacement dashboard.
 */
import * as THREE from '../vendor/three/build/three.module.js';

export const DASHBOARD_CLOCK_TIME='02:17 AM';

export function installDashboardClockV71(car){
 if(!car?.children?.some(o=>o.name.includes('Hatchback')))
  throw Error('Real hatchback must be loaded before mounting dashboard clock');
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=144;
 const c=canvas.getContext('2d');
 c.fillStyle='#0b1615';c.fillRect(0,0,512,144);
 c.fillStyle='#1e4034';c.fillRect(20,12,472,120);
 c.fillStyle='#0a1b17';c.fillRect(26,18,460,108);
 c.textAlign='center';c.textBaseline='middle';
 c.shadowColor='#73f4ae';c.shadowBlur=17;
 c.font='bold 80px monospace';c.fillStyle='#b8ffd0';
 c.fillText(DASHBOARD_CLOCK_TIME,256,75);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
 const group=new THREE.Group();group.name='Dashboard digital time 02:17 AM';
 group.position.set(.40,1.22,-.38); // passenger-side upper dashboard, clear of steering rim
 const bezel=new THREE.Mesh(new THREE.BoxGeometry(.32,.12,.045),
  new THREE.MeshStandardMaterial({color:0x101815,roughness:.55,metalness:.18}));
 bezel.position.z=-.018;group.add(bezel);
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.295,.092),
  new THREE.MeshBasicMaterial({map,transparent:false,depthTest:true,side:THREE.FrontSide}));
 face.position.z=.014;face.name='Illuminated dashboard clock 02:17 AM';group.add(face);
 const rim=new THREE.PointLight(0x8cffbe,.29,1.05,2);rim.position.set(0,0,.09);group.add(rim);
 car.add(group);
 return {state:'ready',time:DASHBOARD_CLOCK_TIME,group,display:face};
}
