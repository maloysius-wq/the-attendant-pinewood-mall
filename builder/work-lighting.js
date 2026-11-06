import * as THREE from '../vendor/three/build/three.module.js';

// Builder-only illumination; never modify the playable chapter's light rig.
export function createWorkLighting(scene,renderer){
 const originalExposure=renderer.toneMappingExposure;
 const originalFog=scene.fog;
 const originalFogDensity=typeof originalFog?.density==='number'?originalFog.density:null;
 const fill=new THREE.HemisphereLight(0xffffff,0xc5ccd0,0);
 fill.name='Builder-only work lights';
 scene.add(fill);
 let enabled=false;
 const getState=()=>({
  enabled,
  exposure:renderer.toneMappingExposure,
  fillIntensity:fill.intensity,
  fogDensity:typeof scene.fog?.density==='number'?scene.fog.density:null
 });
 function setEnabled(value){
  enabled=!!value;
  fill.intensity=enabled?3:0;
  renderer.toneMappingExposure=enabled?Math.max(originalExposure*1.65,1.8):originalExposure;
  if(originalFogDensity!==null&&scene.fog===originalFog){
   scene.fog.density=enabled?Math.min(originalFogDensity,.00125):originalFogDensity;
  }
  return getState();
 }
 return {
  getState,setEnabled,
  dispose(){setEnabled(false);scene.remove(fill);}
 };
}
