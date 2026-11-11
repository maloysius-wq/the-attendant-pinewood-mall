import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const remote=[],errors=[];
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))remote.push(r.url())});
 page.on('pageerror',e=>errors.push(e.message));
 assert.equal((await page.goto(base+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:155000});
 const api=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 const initial=await api();assert.equal(initial.ready,true,JSON.stringify(initial.errors));
 assert.equal(initial.catalogCount,610);
 assert.deepEqual(initial.placementOptions,{gridSize:0,allowClipping:true});
 const catalog=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog());
 assert.equal(catalog.find(x=>x.id==='v100-aged-cork-bulletin-board')?.mountSurface,'wall','corkboard mounts on genuine architectural walls');
 for(const [category,count] of [['Abandoned Office Boards',2],['Peeling Posters & Paper',6]]){
  assert.equal(catalog.filter(c=>c.category===category).length,count,category);
  await page.locator('#catalog-category').selectOption(category);
  assert.equal(await page.locator('.catalog-item').count(),count);
 }
 await page.locator('#catalog-category').selectOption('');
 assert.equal(await page.locator('.catalog-item').count(),609);
 const targets=[
  ['v100-vintage-office-whiteboard','v100-whiteboard-demo',{x:520,y:0,z:520},'board'],
  ['v100-aged-cork-bulletin-board','v100-bulletin-demo',{x:523,y:0,z:520},'board'],
  ...catalog.filter(c=>c.category==='Peeling Posters & Paper').map((c,i)=>[
   c.id,'v100-poster-'+i,{x:530+i*2,y:1.8,z:520},'poster'])
 ];
 for(const [source,id,position,kind] of targets){
  assert.equal(await page.evaluate(([source,id,position])=>
   window.__PINEWOOD_BUILDER__.place(source,position,id),[source,id,position]),id,source);
  const mats=await page.evaluate(id=>
   window.__PINEWOOD_BUILDER__.inspectObjectMaterials(id),id);
  assert.ok(mats?.length>=1,'source maps load: '+source);
  assert.ok(mats.some(m=>m.sourceMapPreserved||m.textured),source+' must retain real source images');
  if(kind==='poster'){
   assert.ok(mats.some(m=>m.transparent),'torn source posters must retain alpha edges');
  }else{
   assert.ok(mats.some(m=>m.sourceMapPreserved),'actual model source map retained '+source);
   assert.ok(mats.some(m=>m.material?.startsWith('CC0_original_patina_')),'real scanned CC0 dirt texture overlay is present '+source);
   assert.ok(mats.some(m=>m.mapPath?.includes('/decals-v97/')),'surface patina must use pinned CC0 imagery '+source);
   assert.ok(mats.every(m=>!m.role),'not automatically retextured from palette');
  }
 }
 assert.equal((await api()).draft.added.length,8);
 const json=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:155000});
 assert.equal((await api()).draft.added.length,8,'IndexedDB survives local reload');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),json);
 assert.equal((await api()).draft.added.length,8,'old schema imports new assets');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual(remote,[],'all asset textures and models must load locally');
 assert.deepEqual(errors,[],'no browser script errors');
 console.log('PINEWOOD_WALL_DECAY_V100_PASS '+JSON.stringify({models:2,posterVariants:6,sourceMaps:true,saveCompatible:true}));
}finally{await browser.close()}
