/** One pinned source catalog shared by the Builder, opening film and game.
 * Never resolve third-party URLs at runtime. Validates every original manifest.
 */
import {EDITOR_CATALOG_V1,EDITOR_CATALOG_BY_ID,registerVendorCatalog} from '../mall/editor-catalog-v1.mjs';
import {registerDecalCatalogV97} from './decals-v97.js';
import {registerVestibuleCatalogV98} from './vestibule-catalog-v98.mjs';
import {registerWallDecayV100} from './wall-decay-v100.mjs';
import {registerMoodV101} from './mood-catalog-v101.mjs';
import {registerDecayV105} from './decay-catalog-v105.mjs';

export const SCENE_CATALOG_V111=[...EDITOR_CATALOG_V1];
const catalog=SCENE_CATALOG_V111;
let catalogPromise;
async function loadSceneCatalogOnceV111(){
 const [response,styleResponse,eraResponse]=await Promise.all([
  fetch(new URL('../assets/vendor/builder/catalog-v1.json',import.meta.url)),
  fetch(new URL('../assets/vendor/builder/material-index-v1.json',import.meta.url)),
  fetch(new URL('../assets/vendor/builder/era-catalog-v87.json',import.meta.url))
 ]);
 if(!response.ok)throw Error('Pinned CC0 asset library unavailable: HTTP '+response.status);
 if(!styleResponse.ok)throw Error('Pinned CC0 material index unavailable: HTTP '+styleResponse.status);
 if(!eraResponse.ok)throw Error('Pinned period-correct CRT/debris library unavailable: HTTP '+eraResponse.status);
 const manifest=await response.json(),styleIndex=await styleResponse.json();
 if(manifest.version!==1||!Array.isArray(manifest.models)||manifest.models.length<100)throw Error('Incomplete local CC0 library');
 if(styleIndex.version!==1||styleIndex.totalModels!==manifest.models.length||!Array.isArray(styleIndex.imageBearingIds))throw Error('Outdated CC0 material classification');
 if(styleIndex.existingTotalModels!==catalog.length||!Array.isArray(styleIndex.existingImageBearingIds))throw Error('Outdated original-fixture classification');
 const existingImages=new Set(styleIndex.existingImageBearingIds),existingIds=new Set(catalog.map(m=>m.id));
 if(existingImages.size!==styleIndex.existingImageBearingIds.length||[...existingImages].some(id=>!existingIds.has(id)))throw Error('Invalid original-fixture classification');
 for(let i=0;i<catalog.length;i++){
  catalog[i]={...catalog[i],materialStyle:existingImages.has(catalog[i].id)?'image-mapped':'color-only'};
 }
 const images=new Set(styleIndex.imageBearingIds),validIds=new Set(manifest.models.map(m=>m.id));
 if(images.size!==styleIndex.imageBearingIds.length||[...images].some(id=>!validIds.has(id)))throw Error('Invalid CC0 material classification');
 catalog.push(...registerVendorCatalog(manifest.models.map(m=>({
  ...m,materialStyle:images.has(m.id)?'image-mapped':'color-only'
 }))));
 const era=await eraResponse.json();
 if(era.version!==87||!Array.isArray(era.models)||era.models.length!==8)
  throw Error('Outdated period-correct source model catalog');
 catalog.push(...registerVendorCatalog(era.models));
 const decalsResp=await fetch(new URL('../assets/vendor/builder/decals-v97/manifest-v97.json',import.meta.url));
 if(!decalsResp.ok)throw Error('The pinned CC0 surface decal catalog is unavailable');
 registerDecalCatalogV97(await decalsResp.json(),catalog,EDITOR_CATALOG_BY_ID);
 const vestibuleResp=await fetch(new URL('../assets/vendor/builder/vestibule-v98/manifest-v98.json',import.meta.url));
 if(!vestibuleResp.ok)throw Error('Pinned local contractor, wall signage and cobweb library is unavailable');
 registerVestibuleCatalogV98(await vestibuleResp.json(),catalog,EDITOR_CATALOG_BY_ID);
 const decayResp=await fetch(new URL('../assets/vendor/builder/wall-decay-v100/manifest-v100.json',import.meta.url));
 if(!decayResp.ok)throw Error('Pinned sourced whiteboards and peeling posters are unavailable');
 registerWallDecayV100(await decayResp.json(),catalog,EDITOR_CATALOG_BY_ID);
 const moodResp=await fetch(new URL('../assets/vendor/builder/mood-v101/manifest-v101.json',import.meta.url));
 if(!moodResp.ok)throw Error('The pinned 1997 calendar and realistic plant library is unavailable');
 registerMoodV101(await moodResp.json(),catalog,EDITOR_CATALOG_BY_ID);
 const gritResponse=await fetch(new URL('../assets/vendor/builder/decay-v105/manifest-v105.json',import.meta.url));
 if(!gritResponse.ok)throw Error('Pinned heavy CC0 dirt, trash and advert media unavailable');
 registerDecayV105(await gritResponse.json(),catalog,EDITOR_CATALOG_BY_ID);
 if(catalog.length!==638)throw Error('Unexpected licensed scene catalog size '+catalog.length);
}

// The preview and cinematic may request the same library concurrently.
// Their model IDs, local asset paths and material classification must agree.
export function loadSceneCatalogV111(){
 if(!catalogPromise)catalogPromise=loadSceneCatalogOnceV111().then(()=>catalog);
 return catalogPromise;
}
