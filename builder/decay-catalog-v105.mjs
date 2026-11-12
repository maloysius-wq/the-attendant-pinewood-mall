/** Independent, pinned CC0 photo/mesh/illustration restoration v105. */
const ROOT='assets/vendor/builder/decay-v105/';
const SHA=/^[a-f0-9]{64}$/;
const safeSize=x=>Number.isInteger(x)&&x>=100&&x<26_000_000;
const sourceIds=new Set([
 'Ground111','Ground103','Ground090'
]);
const isPin=x=>safeSize(x.bytes)&&SHA.test(x.sha256);
const verifiedDistinctPosterSources=m=>{
 const src=m.sources.filter(x=>x.id.startsWith('commons-')||x.id.startsWith('local-v98-'));
 return src.length===10&&new Set(src.map(x=>x.sha256)).size===10&&
  new Set(src.map(x=>x.pixelSignature)).size===10;
};
export function validateDecayV105(m){
 if(m?.version!==105||m.models?.length!==2||m.posters?.length!==10||
  m.decals?.length!==8||!Array.isArray(m.sources)||m.sources.length<13)
  throw Error('Incomplete strong CC0 decay archive v105');
 const ids=new Set(),sources=new Map(m.sources.map(s=>[s.id,s]));
 if(sources.size!==m.sources.length)throw Error('Duplicate source id');
 for(const source of m.sources){
  if(!isPin(source)||!['CC0-1.0','Public-domain','Original-Pinewood'].includes(source.license))throw Error('Unpinned CC0 source '+source.id);
  if(!source.path?.startsWith(ROOT+'sources/')&&!source.path?.startsWith('assets/vendor/builder/decals-v97/'))
   throw Error('Source not archived locally '+source.id);
  if(source.id.startsWith('commons-')){
   if(!source.sourcePage.startsWith('https://commons.wikimedia.org/wiki/')||
    !/^https:\/\/(?:upload|thumb)\.wikimedia\.org\/wikipedia\/commons\//.test(source.downloadUrl)||
    !['CC0-1.0','Public-domain'].includes(source.license)||
    !SHA.test(source.pixelSignature))
    throw Error('Unverified independently licensed Commons artwork '+source.id);
  }else if(source.id.startsWith('local-v98-')){
   if(source.license!=='Original-Pinewood'||
    source.sourcePage!=='assets/vendor/builder/vestibule-v98/manifest-v98.json'||
    !source.downloadUrl?.startsWith('assets/vendor/builder/vestibule-v98/images/')||
    !SHA.test(source.originalSourceSHA256)||!SHA.test(source.pixelSignature))
    throw Error('Unverified original Pinewood poster artwork '+source.id);
  }else if(source.id.startsWith('ambientcg-')){
   const ground=source.id.replace('ambientcg-','');
   if(!sourceIds.has(ground[0].toUpperCase()+ground.slice(1))||
    !source.sourcePage.startsWith('https://ambientcg.com/view?id=Ground'))
    throw Error('Unverified ambientCG scanned dirt '+source.id);
  }else if(!source.id.startsWith('legacy-v97-'))throw Error('Unknown CC0 source '+source.id);
 }
 const photoSources=new Set();
 for(const p of m.posters){
  const source=sources.get(p.sourceId);
  if(!p.id?.startsWith('decay-v105-poster-')||ids.has(p.id)||
   p.category!=='Peeling Posters & Paper'||p.kind!=='surface-decal'||
   p.surface!=='wall'||!['CC0-1.0','Public-domain','Original-Pinewood'].includes(p.license)||
   !(source?.id.startsWith('commons-')||source?.id.startsWith('local-v98-'))||p.license!==source.license||
   p.originalAuthor!==source.originalAuthor||p.originalSource!==source.sourcePage||
   !['corners','top','bottom','right','half','strips'].includes(p.peelStyle)||
   !p.path?.startsWith(ROOT+'posters/')||p.path!==p.thumb||
   !isPin(p)||!(p.width>.3&&p.width<=2&&p.height>.3&&p.height<=2)||
   !(p.opacity>.08&&p.opacity<=1))throw Error('Unsafe independently sourced poster '+p?.id);
  photoSources.add(p.sourceId);ids.add(p.id);
 }
 if(photoSources.size!==10||!verifiedDistinctPosterSources(m))throw Error('Ten posters must derive from ten genuinely different licensed source images');
 for(const d of m.decals){
  if(!d.id?.startsWith('decay-v105-')||ids.has(d.id)||
   d.category!=='Heavy Dirt & Scuffs'||d.kind!=='surface-decal'||
   !['floor','wall'].includes(d.surface)||d.license!=='CC0-1.0'||
   !sources.has(d.sourceId)||!d.path?.startsWith(ROOT+'decals/')||
   d.path!==d.thumb||!isPin(d)||d.opacity<.75||
   !(d.width>.3&&d.width<=4&&d.height>.3&&d.height<=4))
   throw Error('Unverified heavy source-backed grime '+d?.id);
  ids.add(d.id);
 }
 for(const x of m.models){
  const slug=x.id==='decay-v105-trashbag'?'trashbag':
   x.id==='decay-v105-plastic-bottle-gallon'?'plastic_bottle_gallon':null;
  if(!slug||ids.has(x.id)||!isPin(x)||x.kind!=='model'||
   x.category!=='Scattered Trash & Debris'||x.materialStyle!=='image-mapped'||
   x.skipMaterialEnhancement!==true||x.license!=='CC0-1.0'||
   x.originalSource!=='https://polyhaven.com/a/'+slug||
   x.path!==ROOT+'models/'+slug+'.glb'||
   x.conversion!=='gltf-transform copy (original CC0 meshes, UVs and images)'||
   x.sourceFiles?.length<2||!x.sourceFiles.every(f=>safeSize(f.bytes)&&SHA.test(f.sha256))||
   x.sourceAnatomy?.images<1||x.sourceAnatomy?.meshes<1||
   !(x.targetHeight>.1&&x.targetHeight<2&&x.radius>.1&&x.radius<2))
   throw Error('Unverified independent CC0 trash model '+x?.id);
  ids.add(x.id);
 }
 if(ids.size!==20)throw Error('Duplicate CC0 decay catalog IDs');
 return {models:m.models,posters:m.posters,decals:m.decals};
}
export function registerDecayV105(m,catalog,index){
 const parts=validateDecayV105(m);
 for(const x of [...parts.models,...parts.decals,...parts.posters]){
  if(index.has(x.id))throw Error('Duplicate Builder catalog entry '+x.id);
  const item=Object.freeze({...x});
  catalog.push(item);index.set(item.id,item);
 }
 return {models:2,heavyDecals:8,independentPosters:10};
}
