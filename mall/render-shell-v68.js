import {renderConstructionScene} from './render-shell-v67.js?v=80';
import {buildWeatheredFacade} from './weathered-facade-v68.js';

// Compose the verified connected structure and weathered frontage before any
// client removes its opaque loading cover or renders the first frame.
export async function renderPinewoodV68({scene,chapter=1}={}){
 const building=await renderConstructionScene({scene,chapter});
 try{
  const facade=buildWeatheredFacade(building.group);
  const dispose=building.dispose.bind(building);
  return {...building,facade,facadeFeatures:facade.facadeFeatures,
   signText:facade.signText,entryBoarded:facade.entryBoarded,serviceOpen:facade.serviceOpen,
   dispose(){facade.dispose();dispose();}
  };
 }catch(error){
  building.dispose();throw error;
 }
}
