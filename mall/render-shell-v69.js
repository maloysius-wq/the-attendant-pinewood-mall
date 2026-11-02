import {renderPinewoodV68} from './render-shell-v68.js';
import {attachLicensedInteriorsV69} from './render-furnishing-v69.js';

/** Preload and place all licensed interiors before removing the page cover. */
export async function renderPinewoodV69({scene,chapter=1}={}){
 const building=await renderPinewoodV68({scene,chapter});
 try{
  const furnishings=await attachLicensedInteriorsV69(building);
  const dispose=building.dispose.bind(building);
  return {...building,...furnishings,
   modelsLoaded:building.modelsLoaded+furnishings.furnishingsLoaded,
   uniqueModels:furnishings.uniqueModels,
   firstFrameFullyLoaded:building.firstFrameFullyLoaded&&furnishings.firstFrameFullyLoaded,
   dispose(){furnishings.dispose();dispose();}
  };
 }catch(error){
  building.dispose();throw error;
 }
}
