/**
 * The Call v71: use the same authorized construction shell and licensed
 * storefront furnishings as Chapter 1 gameplay. Never build a parallel mall.
 */
import {renderConstructionScene} from '../mall/render-shell-v67.js';
import {attachLicensedInteriorsV69} from '../mall/render-furnishing-v69.js';

export async function mountCanonicalOpeningInterior(scene){
 const building=await renderConstructionScene({scene,chapter:1});
 // The v65 cinematic facade supplies the one authentic front skin, contractor
 // doorway and entrance sign. Remove only the duplicate v67 FRONT wall faces;
 // retain every load-bearing side, vestibule partition and real interior mesh.
 let duplicateFrontWalls=0;
 for(const mesh of [...building.geometryGroups.G.children]){
  if(mesh.userData?.boundary?.id?.startsWith('front_original_')){
   building.geometryGroups.G.remove(mesh);
   duplicateFrontWalls++;
  }
 }
 if(duplicateFrontWalls!==2)throw Error('Expected both canonical shell front-wall sections');
 // Keep the below-grade service level preloaded but invisible from Chapter 1.
 building.geometryGroups.B1.visible=false;
 building.setChapter(1);
 const furnishings=await attachLicensedInteriorsV69(building);
 if(!furnishings.firstFrameFullyLoaded||furnishings.furnishingsLoaded<50)
  throw Error('Canonical mall furnishing preload incomplete');
 return {
  state:'ready',source:'canonical-v67-shell-v69-furnishings',
  duplicateFrontWalls,physicalMeshes:building.modelsLoaded,
  furnishingsLoaded:furnishings.furnishingsLoaded,
  floor:'G',adminMezzanine:true,realAtrium:true,
  building,furnishings
 };
}
