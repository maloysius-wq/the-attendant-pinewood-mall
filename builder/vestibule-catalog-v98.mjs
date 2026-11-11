/**
 * Source-pinned contractor vestibule models + 36 original graphics.
 * All 19 model GLBs must be real third-party CC0 files (v99).
 * Original 28 wall notices and 8 cobwebs still belong to Pinewood.
 */
export const VESTIBULE_COUNT_V98={models:19,decals:36};
const SHA=/^[a-f0-9]{64}$/;
const ID=/^[a-z0-9-]+$/;
const PREFIX='assets/vendor/builder/vestibule-v98/';
const MODEL_CATEGORY='Contractor Vestibule & Loading';
const DECAL_CATEGORIES=['Wall Notices & Advertising','Cobwebs & Ceiling Dust'];
const validBytes=x=>Number.isInteger(x)&&x>=100;
const validFloat=(v,min,max)=>Number.isFinite(v)&&v>min&&v<=max;
const sources=Object.freeze({
 'vestibule-compact-forklift':['Innerscene','Innerscene','electric-counterbalance-forklift-7acc0547'],
 'vestibule-manual-pallet-jack':['Innerscene','Innerscene','manual-pallet-jack-5ff28a4a'],
 'vestibule-service-stepladder':['Innerscene','Innerscene','step-fold-step-ladder-acbe7baf'],
 'vestibule-rolling-tool-chest':['Innerscene','Innerscene','rolling-tool-chest-c23c4e4c'],
 'vestibule-metal-toolbox':['Poly Haven','Mateusz Sadek','metal_toolbox'],
 'vestibule-electrical-cable-reel':['Innerscene','Innerscene','cord-reel-utility-organizer-258e2bfe'],
 'vestibule-utility-push-cart':['Poly Haven','Jule Bielitz','industrial_storage_cart'],
 'vestibule-tripod-work-light':['Innerscene','Innerscene','work-stand-portable-work-light-1befa4ba'],
 'vestibule-maintenance-broom':['Poly Haven','L','plastic_broom'],
 'vestibule-spare-conduit':['Poly Haven','Kuutti Siitonen','modular_electric_cables']
});
const checkSourceFiles=m=>{
 if(!Array.isArray(m.sourceFiles)||!m.sourceFiles.length||m.sourceFiles.length>16)return false;
 if(m.sourceFiles[0].sha256!==m.sourceSHA256||m.sourceFiles[0].bytes!==m.sourceBytes)return false;
 return m.sourceFiles.every(x=>
  typeof x.name==='string'&&x.name.length>0&&x.name.length<140&&
  !x.name.includes('..')&&!x.name.startsWith('/')&&
  SHA.test(x.sha256)&&validBytes(x.bytes)&&x.bytes<25000000&&
  (m.sourceProvider==='Innerscene'
   ?x.url?.startsWith('https://files.innerscene.com/library/')
   :x.url?.startsWith('https://dl.polyhaven.org/file/ph-assets/Models/')));
};
const sourceModelValid=m=>{
 const expected=sources[m.id];
 if(!expected)return false;
 const [provider,author,slug]=expected;
 const inScene=provider==='Innerscene';
 const page=(inScene?'https://www.innerscene.com/tools/library/3d-parts/':'https://polyhaven.com/a/')+slug;
 const src=(inScene?'https://www.innerscene.com/api/library/'+slug+'/download':
  'https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/'+slug+'/'+slug+'_1k.gltf');
 const x=m.sourceModelInfo;
 return m.sourceProvider===provider&&m.originalAuthor===author&&
  m.originalSource===page&&m.sourceMirror===src&&
  m.license==='CC0-1.0'&&m.skipMaterialEnhancement===true&&
  SHA.test(m.sourceSHA256)&&validBytes(m.sourceBytes)&&
  !!x&&Number.isInteger(x.meshCount)&&x.meshCount>0&&
  Number.isInteger(x.nodeCount)&&x.nodeCount>0&&
  Number.isInteger(x.primitiveCount)&&x.primitiveCount>0&&
  Number.isInteger(x.embeddedImageCount)&&x.embeddedImageCount>=0&&
  m.materialStyle===(x.embeddedImageCount?'image-mapped':'color-only')&&
  (inScene?m.conversion==='Unmodified source GLB':
   m.conversion==='gltf-transform copy (source meshes and images)')&&checkSourceFiles(m);
};
const quaterniusValid=m=>
 m.license==='CC0-1.0'&&m.originalAuthor==='Quaternius'&&
 m.materialStyle==='image-mapped'&&
 SHA.test(m.sourceSHA256)&&validBytes(m.sourceBytes)&&
 m.sourceMirror?.startsWith('https://raw.githubusercontent.com/agentkaerf/FreeModels/main/')&&
 m.originalSource?.startsWith('https://poly.pizza/search/')&&
 m.skipMaterialEnhancement!==true;
export function validateVestibuleManifestV98(manifest){
 if(manifest?.version!==98||
  !Array.isArray(manifest.models)||manifest.models.length!==VESTIBULE_COUNT_V98.models||
  !Array.isArray(manifest.decals)||manifest.decals.length!==VESTIBULE_COUNT_V98.decals)
  throw Error('Unpinned contractor vestibule library');
 const ids=new Set();
 for(const item of manifest.models){
  if(!item||!ID.test(item.id)||!item.id.startsWith('vestibule-')||ids.has(item.id)||
    item.category!==MODEL_CATEGORY||item.kind!=='model'||
    item.path!==PREFIX+'models/'+item.id.slice('vestibule-'.length)+'.glb'||
    !SHA.test(item.sha256)||!validBytes(item.bytes)||
    !validFloat(item.targetHeight,.04,4)||!validFloat(item.radius,.04,5)||
    !['weathered','standard'].includes(item.condition)||
    !(item.sourceProvider?sourceModelValid(item):quaterniusValid(item)))
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
 if(ids.size!==55)throw Error('Duplicate builder vestibule asset IDs');
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
