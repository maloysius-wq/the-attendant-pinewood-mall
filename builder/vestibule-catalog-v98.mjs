/**
 * 1990s contractor vestibule: 19 pinned original/CC0 GLB models,
 * 28 original notices/adverts/boards and 8 original web overlays.
 * All paths are repository-local and all hashes are per-file immutably pinned.
 * This does not loosen the pre-existing vendor GLB or v97 CC0 validators.
 */
export const VESTIBULE_COUNT_V98={models:19,decals:36};
const SHA=/^[a-f0-9]{64}$/;
const ID=/^[a-z0-9-]+$/;
const PREFIX='assets/vendor/builder/vestibule-v98/';
const MODEL_CATEGORY='Contractor Vestibule & Loading';
const DECAL_CATEGORIES=['Wall Notices & Advertising','Cobwebs & Ceiling Dust'];
const validBytes=x=>Number.isInteger(x)&&x>=100;
const validFloat=(v,min,max)=>Number.isFinite(v)&&v>min&&v<=max;
export function validateVestibuleManifestV98(manifest){
 if(manifest?.version!==98||
  !Array.isArray(manifest.models)||manifest.models.length!==VESTIBULE_COUNT_V98.models||
  !Array.isArray(manifest.decals)||manifest.decals.length!==VESTIBULE_COUNT_V98.decals)
  throw Error('Unpinned contractor vestibule library');
 const ids=new Set();
 for(const item of manifest.models){
  const original=item?.license==='Original-Pinewood';
  if(!item||!ID.test(item.id)||!item.id.startsWith('vestibule-')||ids.has(item.id)||
    item.category!==MODEL_CATEGORY||item.kind!=='model'||
    item.materialStyle!==(original?'color-only':'image-mapped')||
    item.path!==PREFIX+'models/'+item.id.slice('vestibule-'.length)+'.glb'||
    !SHA.test(item.sha256)||!validBytes(item.bytes)||
    !validFloat(item.targetHeight,.04,4)||!validFloat(item.radius,.04,5)||
    !['weathered','standard'].includes(item.condition)||
    (original?
      item.originalAuthor!=='Pinewood Builder'||item.skipMaterialEnhancement!==true||
      item.originalSource!=='tools/vendor-vestibule-v98.py':
      item.license!=='CC0-1.0'||item.originalAuthor!=='Quaternius'||
      !SHA.test(item.sourceSHA256)||!validBytes(item.sourceBytes)||
      !item.sourceMirror?.startsWith('https://raw.githubusercontent.com/agentkaerf/FreeModels/main/')||
      item.skipMaterialEnhancement===true))
   throw Error('Unsafe source or scale in contractor model '+item?.id);
  ids.add(item.id);
 }
 for(const item of manifest.decals){
  if(!item||!ID.test(item.id)||ids.has(item.id)||
   !DECAL_CATEGORIES.includes(item.category)||item.kind!=='surface-decal'||
   !['wall','ceiling'].includes(item.surface)||item.materialStyle!=='image-mapped'||
   item.originalAuthor!=='Pinewood Builder'||item.license!=='Original-Pinewood'||
   item.originalSource!=='tools/vendor-vestibule-v98.py'||
   item.path!==PREFIX+'images/'+item.id.replace(/^(?:wall-)/,'')+'.png'||
   item.thumb!==item.path||!SHA.test(item.sha256)||!validBytes(item.bytes)||
   !validFloat(item.width,.1,4)||!validFloat(item.height,.1,4)||
   !validFloat(item.opacity,0,1))
    throw Error('Unsafe wall or cobweb image '+item?.id);
  ids.add(item.id);
 }
 if(ids.size!==55)throw Error('Duplicate builder vestibuIe asset IDs');
 return {models:manifest.models,decals:manifest.decals};
}
export function registerVestibuleCatalogV98(manifest,catalog,index){
 const {models,decals}=validateVestibuleManifestV98(manifest);
 for(const item of [...models,...decals]){
  if(index.has(item.id))throw Error('Duplicate pinned vestibule asset '+item.id);
  const frozen=Object.freeze({...item});
  index.set(frozen.id,frozen);catalog.push(frozen);
 }
 return {models:models.length,decals:decals.length};
}
