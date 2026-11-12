/**
 * Explicitly sourced CC0 boards and CC0 poster-image derivatives.
 * Publisher GLBs and their embedded 2K maps are preserved byte-for-byte.
 */
export const WALL_DECAY_COUNT_V100={models:2,posters:6};
const ROOT='assets/vendor/builder/wall-decay-v100/';
const SHA=/^[a-f0-9]{64}$/;
const VALID_ID=/^[a-z0-9-]+$/;
const MODEL_SOURCES=Object.freeze({
 'v100-vintage-office-whiteboard':'whiteboard',
 'v100-aged-cork-bulletin-board':'cork-board'
});
const POSTERS=Object.freeze([
 'nearly-intact','top-corner-peel','bottom-curl','side-detaching','ragged-half','last-fragments'
]);
const STYLES=Object.freeze(['corners','top','bottom','right','half','strips']);
const goodSize=x=>Number.isInteger(x)&&x>=100&&x<20_000_000;
const goodHash=x=>typeof x==='string'&&SHA.test(x);

export function validateWallDecayV100(manifest){
 if(manifest?.version!==100||!Array.isArray(manifest.models)||manifest.models.length!==2||
  !Array.isArray(manifest.posters)||manifest.posters.length!==6||
  !Array.isArray(manifest.sources)||manifest.sources.length!==1)
  throw Error('Incomplete v100 source-backed abandoned wall decorations');
 const src=manifest.sources[0];
 if(src.id!=='ggbotnet-torn-posters'||src.originalAuthor!=='GGBotNet'||
  src.sourcePage!=='https://opengameart.org/content/torn-posters-texture'||
  src.downloadUrl!=='https://opengameart.org/sites/default/files/torn-posters-1.1.png'||
  src.license!=='CC0-1.0'||src.sourceWidth!==1024||src.sourceHeight!==1024||
  src.sourcePath!==ROOT+'source/ggbotnet-torn-posters.png'||
  !goodHash(src.sha256)||!goodSize(src.bytes))throw Error('Unlicensed/unsafe source poster image');
 const ids=new Set(),sourceKinds=new Set();
 for(const m of manifest.models){
  const slug=MODEL_SOURCES[m.id];
  if(!slug||ids.has(m.id)||m.category!==(slug==='cork-board'?'Bulletin Boards & Noticeboards':'Abandoned Office Boards')||m.kind!=='model'||
   m.path!==ROOT+'models/'+m.id.slice(5)+'.glb'||m.materialStyle!=='image-mapped'||
   m.license!=='CC0-1.0'||m.originalAuthor!=='Grab3D'||
   m.originalSource!=='https://grab3d.com/models/furniture/'+slug+'/'||
   (slug==='cork-board'?m.mountSurface!=='wall':m.mountSurface!==undefined)||
   m.downloadUrl!=='https://grab3d.com/dl/'+slug+'/'+slug+'.glb'||
   m.sourceSHA256!==m.sha256||m.sourceBytes!==m.bytes||
   m.skipMaterialEnhancement!==true||!goodHash(m.sha256)||!goodSize(m.bytes)||
   !(m.sourceMeshCount>0&&m.sourceImageCount>0&&m.sourceMaterialCount>0)||
   !Number.isFinite(m.targetHeight)||m.targetHeight<=.1||m.targetHeight>3||
   !Number.isFinite(m.radius)||m.radius<=.1||m.radius>3)
   throw Error('Unpinned/original 3D board invalid '+m?.id);
  ids.add(m.id);sourceKinds.add(slug);
 }
 if(sourceKinds.size!==2)throw Error('Missing real whiteboard or bulletin board');
 for(let i=0;i<manifest.posters.length;i++){
  const p=manifest.posters[i];
  if(!p||p.id!=='v100-poster-'+POSTERS[i]||ids.has(p.id)||!VALID_ID.test(p.id)||
   p.kind!=='surface-decal'||p.surface!=='wall'||p.category!=='Peeling Posters & Paper'||
   p.materialStyle!=='image-mapped'||p.condition!=='weathered'||
   p.license!=='CC0-1.0'||p.originalAuthor!=='GGBotNet'||
   p.originalSource!==src.sourcePage||p.sourceId!==src.id||
   p.path!==ROOT+'posters/'+POSTERS[i]+'.png'||p.thumb!==p.path||
   p.peelStyle!==STYLES[i]||!goodHash(p.sha256)||!goodSize(p.bytes)||
   !Number.isFinite(p.width)||p.width<=.2||p.width>2||
   !Number.isFinite(p.height)||p.height<=.2||p.height>2||
   !Number.isFinite(p.opacity)||p.opacity<.08||p.opacity>1)
   throw Error('Unsafe/unsourced aging poster '+p?.id);
  ids.add(p.id);
 }
 if(ids.size!==8)throw Error('Duplicate v100 catalog IDs');
 return {models:manifest.models,posters:manifest.posters};
}
export function registerWallDecayV100(manifest,catalog,index){
 const {models,posters}=validateWallDecayV100(manifest);
 for(const m of [...models,...posters]){
  if(index.has(m.id))throw Error('Duplicate v100 catalog ID '+m.id);
  const x=Object.freeze({...m});index.set(x.id,x);catalog.push(x);
 }
 return {models:models.length,posters:posters.length};
}
