/**
 * A diegetic late-night digital dashboard clock. The enclosure belongs to the
 * imported CC0 hatchback; only this small, original clock insert is authored.
 * Its time is deliberately fixed to the moment of dispatch, not the system clock.
 */
import * as THREE from '../vendor/three/build/three.module.js';

export function installDashboardClockV71(car){
 if(!car?.isGroup||car.children.filter(x=>x.name==='Complete Grab3D CC0 1990s Hatchback').length!==1)
  throw Error('The dashboard clock needs the complete imported hatchback');
 const clock=new THREE.Group();
 clock.name='Pinewood dashboard digital clock';
 clock.position.set(-.08,1.21,-.49);
 clock.scale.set(.72,.72,1);
 const plastic=new THREE.Mesh(new THREE.BoxGeometry(.36,.135,.035),
  new THREE.MeshStandardMaterial({color:0x12191c,roughness:.72,metalness:.06}));
 plastic.name='Clock factory-black enclosure';
 clock.add(plastic);
 const canvas=document.createElement('canvas');
 canvas.width=640;canvas.height=230;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#030507';ctx.fillRect(0,0,640,230);
 ctx.strokeStyle='#343e43';ctx.lineWidth=9;ctx.strokeRect(8,8,624,214);
 ctx.fillStyle='#f46b46';ctx.shadowColor='#f04d2d';ctx.shadowBlur=27;
 ctx.font='bold 112px monospace';ctx.textAlign='center';
 ctx.fillText('12:47',305,146);
 ctx.font='bold 52px monospace';ctx.fillText('AM',536,154);
 const map=new THREE.CanvasTexture(canvas);
 map.colorSpace=THREE.SRGBColorSpace;
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.323,.116),
  new THREE.MeshBasicMaterial({map,transparent:false,toneMapped:false}));
 face.name='12:47 AM dashboard clock display';
 face.position.z=.019;
 clock.add(face);
 car.add(clock);
 return Object.freeze({time:'12:47 AM',localPosition:clock.position.toArray(),importedCarPreserved:true});
}
