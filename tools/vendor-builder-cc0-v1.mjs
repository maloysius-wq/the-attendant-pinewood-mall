/**
 * Development-time only: vendor pinned CC0 models into the repository.
 * Nothing in this file may run from a visitor browser.
 * Kenney source: official CC0 Kenney packs mirrored as self-contained GLBs at a fixed commit.
 * 3DAssets: self-declared individually CC0 original model collection, immutable v1 CDN URLs.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const ROOT='assets/vendor/builder';
const KENNEY_COMMIT='ea2f2aa1ca8da0898330c97df8a5489976b051d0';
const KENNEY_BASE='https://raw.githubusercontent.com/Hidencod/tge-assets/'+KENNEY_COMMIT+'/';
const KENNEY_CATALOG=KENNEY_BASE+'catalog.json';
const LICENSE='https://creativecommons.org/publicdomain/zero/1.0/';
const output={version:1,generatedOn:'2026-11-05',models:[],sources:[
 {creator:'Kenney',site:'https://kenney.nl',license:'CC0-1.0',mirror:'https://github.com/Hidencod/tge-assets',pin:KENNEY_COMMIT},
 {creator:'3D Assets',site:'https://3dassets.dev',license:'CC0-1.0',source:'https://3dassets.dev/assets'}
]};
const selectors={
 'furniture-kit':/./i,
 'nature-kit':/^(tree|plant|bush|flower|mushroom|rock|stone|log|stump|pine|statue|grass|hedge)/i,
 'food-kit':/^(cup|bottle|can|burger|fries|pizza|bread|coffee|bag|cake|donut|fruit|milk|drink|sandwich|ice|mug|plate|straw|hotdog|hot dog)/i,
 'graveyard-kit':/^(bench|fence|iron|pine|stone|wall|coffin|candle|lantern|grave|tomb|cross|chest|plank)/i,
 'city-kit-commercial':/^(detail|roof|sign|shop|street|bench|lamp|awning)/i,
 'city-kit-suburban':/^(bench|bus|tree|lamp|trash|garbage|fence|mail|park|flower|sign)/i
};
const cap={'nature-kit':95,'food-kit':50,'graveyard-kit':45,'city-kit-commercial':32,'city-kit-suburban':16};
const packLimit={
 'christmas-village':24,
 'retro-arcade-and-mall-1989':35,
 'retail-store-fixtures-and-mall':50,
 'liminal-spaces-kit':20,
 'zombie-quarantine-streets':12
};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function get(url,{binary=false}={}){
 let last;
 for(let i=0;i<4;i++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(45000),headers:{'User-Agent':'Pinewood-CC0-Vendorer/1.0'}});
   if(!response.ok)throw Error(url+' HTTP '+response.status);
   return binary?Buffer.from(await response.arrayBuffer()):await response.json();
  }catch(err){last=err;await sleep(300*(i+1));}
 }
 throw last;
}
const slug=v=>String(v).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const suffix=str=>slug(str).replace(/-/g,'_');
function classify(pack,name){
 const label=name.toLowerCase();
 if(/christmas|santa|holiday|wreath|garland|snowman|sleigh|reindeer|festive|gift|ornament|stocking|pine.*snow/.test(label)||pack==='christmas-village')return 'Creepy Holiday Decor';
 if(/fountain|basin/.test(label))return 'Fountains & Atrium';
 if(/computer|keyboard|mouse|screen|monitor|radio|desk|office|printer|phone|cassette|arcade|console|terminal/.test(label)||pack==='retro-arcade-and-mall-1989')return '1990s Electronics & Offices';
 if(/bench|chair|stool|sofa|seat|couch|lounge|table/.test(label))return 'Benches & Seating';
 if(/tree|plant|flower|grass|bush|pine|mushroom|log|stump/.test(label))return 'Trees & Neglected Plants';
 if(/damaged|fall|dark|grave|coffin|broken|cracked|rust|rott|collapsed|debris|mold|dead|shutter/.test(label)||pack==='liminal-spaces-kit'||pack==='graveyard-kit')return 'Abandoned & Damaged';
 if(/lamp|light|candle|sign/.test(label))return 'Lights & Signs';
 if(/cup|coffee|can|bottle|burger|fries|food|pizza|cake|ice|plate|bread|snack/.test(label)||pack==='food-kit')return 'Food Court & Small Props';
 if(/shelf|rack|counter|display|store|retail|shop|awning|fixture|cash|hanger|window/.test(label)||pack==='retail-store-fixtures-and-mall')return 'Stores & Displays';
 return 'Miscellaneous Mall Props';
}
function sizing(label,pack,real=null){
 const n=label.toLowerCase();
 let targetHeight=1.4,radius=.9;
 if(/tree|pine/.test(n)){targetHeight=4.6;radius=2.5}
 else if(/flower|grass|mushroom|plant|bush|stump/.test(n)){targetHeight=.75;radius=.7}
 else if(/building|storefront|shopfront/.test(n)){targetHeight=4.2;radius=3.8}
 else if(/desk|bench|table|sofa|couch|counter/.test(n)){targetHeight=.95;radius=2.1}
 else if(/chair|stool|lamp/.test(n)){targetHeight=1.25;radius=.9}
 else if(/computer.*screen|monitor|crt|television/.test(n)){targetHeight=.38;radius=.48}
 else if(/keyboard|mouse|plate|paper|cup|can|bottle|food|burger|cash|radio|gift|mug|candle/.test(n)){targetHeight=.24;radius=.36}
 else if(/fountain|basin/.test(n)){targetHeight=2.7;radius=3}
 if(real&&Number.isFinite(real.y)&&real.y>.005){targetHeight=Math.min(8,real.y);radius=Math.max(.1,Math.min(8,Math.max(real.x,real.z)/2));}
 return {targetHeight,radius};
}
const jobs=[];
function queue({id,label,pack,modelUrl,thumbUrl,sourcePage,category=null,condition=null,dimensions=null}){
 const clean=slug(id);
 const modelFile=ROOT+'/models/'+slug(pack)+'/'+clean+'.glb';
 const thumbFile=thumbUrl?ROOT+'/thumbs/'+slug(pack)+'/'+clean+'.webp':null;
 jobs.push(async()=>{
  const bytes=await get(modelUrl,{binary:true});
  if(bytes.length<128||bytes.subarray(0,4).toString()!=='glTF')throw Error('Not a valid binary glTF: '+modelUrl);
  await fs.mkdir(path.dirname(modelFile),{recursive:true});
  await fs.writeFile(modelFile,bytes);
  let thumb=null;
  if(thumbUrl){
   try{
    const pic=await get(thumbUrl,{binary:true});
    if(pic.length>100){
     await fs.mkdir(path.dirname(thumbFile),{recursive:true});
     await fs.writeFile(thumbFile,pic);thumb=thumbFile;
    }
   }catch(err){console.warn('Optional thumbnail unavailable '+id+': '+err.message);}
  }
  return {id:clean,label,category:category||classify(pack,label),condition:condition||(/damaged|broken|dead|dark|fall|rott|wilt|ruin|rust|crack|wreck/i.test(label)?'weathered':'standard'),
   path:modelFile,thumb,...sizing(label,pack,dimensions),license:'CC0-1.0',licenseUrl:LICENSE,
   sourceUrl:modelUrl,sourcePage:sourcePage||modelUrl,sourcePack:pack,
   sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};
 });
}
const kenney=await get(KENNEY_CATALOG);
for(const pack of kenney.packs){
 const select=selectors[pack.id];
 if(!select)continue;
 let choices=pack.models.filter(m=>select.test(m.name));
 if(cap[pack.id])choices=choices.slice(0,cap[pack.id]);
 for(const m of choices)queue({
  id:'kenney-'+m.id,label:m.name,pack:pack.id,
  modelUrl:KENNEY_BASE+m.file,thumbUrl:KENNEY_BASE+m.thumb,
  sourcePage:pack.url
 });
}
function packItems(j){
 const candidates=[j.models,j.assets,j.items,j.data?.models,j.data?.assets,j.pack?.models,j.pack?.assets,j.results];
 return candidates.find(Array.isArray)||[];
}
function asAsset(item,pack){
 const image=Object.values(item).find(v=>typeof v==='string'&&v.includes('cdn.3dassets.dev/assets/')&&/\.glb/.test(v));
 const id=item.assetId||item.asset_id||item.id||item.model?.id;
 let modelUrl=item.model_url||item.modelUrl||item.glb_url||item.glbUrl||item.download_url||item.downloadUrl||item.file_url||item.fileUrl||item.urls?.glb||item.model?.url||item.cdnUrl||image;
 if(typeof modelUrl!=='string'&&Number.isFinite(Number(id)))modelUrl='https://cdn.3dassets.dev/assets/'+id+'/v1/model.glb';
 if(typeof modelUrl!=='string'||!/^https:\/\/cdn\.3dassets\.dev\/assets\/\d+\/v\d+\/model\.glb$/.test(modelUrl))return null;
 const label=item.title||item.name||item.label||item.slug||('Asset '+id);
 const page=item.url||item.page_url||item.pageUrl||item.asset_url||'https://3dassets.dev/packs/'+pack;
 if(item.license?.slug&&item.license.slug!=='cc0-1.0')return null;
 const dimensions=item.dimensions||item.size||item.dimensions_m;
 return {id:'three-d-'+pack+'-'+(item.slug||id||slug(label)),label:String(label),pack,modelUrl,sourcePage:page,thumbUrl:item.thumbnailUrl,dimensions:dimensions&&typeof dimensions==='object'?{x:Number(dimensions.x??dimensions[0]),y:Number(dimensions.y??dimensions[1]),z:Number(dimensions.z??dimensions[2])}:null};
}
for(const [pack,limit] of Object.entries(packLimit)){
 try{
  const url='https://3dassets.dev/api/v1/packs/'+pack;
  const response=await get(url);
  const items=packItems(response);
  console.log('PACK_METADATA '+pack+' '+JSON.stringify({keys:Object.keys(response),count:items.length,sample:items[0]??null}).slice(0,1300));
  if(items.length===0)throw Error('No model array found from public pack manifest');
  const selected=items.map(item=>asAsset(item,pack)).filter(Boolean).slice(0,limit);
  if(!selected.length)throw Error('No usable pinned model URLs in manifest');
  for(const model of selected)queue(model);
 }catch(err){console.warn('Skipped CC0 pack '+pack+': '+err.message);}
}
// A silted, vegetation-filled, non-running ornamental fountain; distinctly different from a drinking fountain.
queue({
 id:'silted-octagonal-atrium-fountain',label:'Silted Ornamental Fountain Basin',
 pack:'fountains',category:'Fountains & Atrium',condition:'weathered',
 modelUrl:'https://cdn.3dassets.dev/assets/36969/v1/model.glb',
 sourcePage:'https://3dassets.dev/assets/sunken-city-and-underwater-ruins-fountain-basin-0149d19f',
 dimensions:{x:3.12,y:1.08,z:3.12}
});
console.log('BUILDER_CC0_VENDOR_QUEUED '+jobs.length);
let index=0,failures=[],done=0;
const workers=Array.from({length:8},async()=>{
 while(index<jobs.length){
  const current=index++;
  try{output.models.push(await jobs[current]());done++;}
  catch(err){failures.push(String(err.message||err));console.error('ASSET_DOWNLOAD_FAILED',current,err.message);}
 }
});
await Promise.all(workers);
output.models.sort((a,b)=>a.id.localeCompare(b.id));
if(failures.length)throw Error(failures.length+' binary model fetches failed, refusing incomplete library: '+failures.slice(0,8).join('; '));
if(output.models.length<100)throw Error('Insufficient verified CC0 assets: '+output.models.length);
if(!output.models.some(x=>x.category==='Creepy Holiday Decor'))throw Error('Holiday model pack missing: source metadata '+output.models.length);
await fs.mkdir(ROOT,{recursive:true});
await fs.writeFile(ROOT+'/catalog-v1.json',JSON.stringify(output,null,2)+'\n');
const licenseText='\n## Pinewood standalone Builder CC0 model library (2026-11-05)\n\n'+
 'The separately hosted Builder includes '+output.models.length+' locally copied self-contained GLB models. All are under CC0-1.0. The per-file '+ROOT+'/catalog-v1.json manifest records original upstream URLs, author/pack information, exact SHA-256 and byte length for each binary; URLs are documentation only and never fetched by browser runtime.\n\n'+
 '- Kenney CC0 model packs: https://kenney.nl (license https://creativecommons.org/publicdomain/zero/1.0/); self-contained mirror pinned to https://github.com/Hidencod/tge-assets/commit/'+KENNEY_COMMIT+'.\n'+
 '- 3DAssets.dev individually CC0 public-domain models: https://3dassets.dev/assets and linked pack/model pages; pinned, locally downloaded from versioned immutable GLBs. This collection includes a silted ornamental fountain and seasonal retail decorations.\n'+
 '- These assets do not supersede the campaign runtime v69 licensing, nor any banned Cassette Castle shelf fixture.\n';
const licenses=await fs.readFile('LICENSES.md','utf8');
if(!licenses.includes('## Pinewood standalone Builder CC0 model library')){
 await fs.writeFile('LICENSES.md',licenses.trimEnd()+'\n'+licenseText);
}
console.log('PINEWOOD_BUILDER_VENDOR_PASS '+JSON.stringify({models:output.models.length,kenneyPin:KENNEY_COMMIT,bytes:output.models.reduce((n,m)=>n+m.bytes,0)}));
