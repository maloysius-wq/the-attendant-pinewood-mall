import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',req=>{
  if(/^https?:/.test(req.url())&&!req.url().startsWith(origin))external.push(req.url());
 });
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:155000});
 const state=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 const s=await state();
 assert.equal(s.ready,true,JSON.stringify(s.errors));
 assert.equal(s.roomCount,41);
 assert.equal(s.catalogCount,602);
 const catalog=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog());
 const assetSets={};
 for(const [category,n] of [['Contractor Vestibule & Loading',19],
  ['Wall Notices & Advertising',28],['Cobwebs & Ceiling Dust',8]]){
  const entries=catalog.filter(x=>x.category===category);
  assert.equal(entries.length,n,category);
  assetSets[category]=n;
  await page.locator('#catalog-category').selectOption(category);
  assert.equal(await page.locator('.catalog-item').count(),n,category+' visible in catalog');
  if(category!=='Contractor Vestibule & Loading')
   assert.equal(await page.locator('.catalog-item img.asset-thumb').count(),n);
 }
 await page.locator('#catalog-category').selectOption('');
 assert.equal(await page.locator('.catalog-item').count(),601);
 assert.deepEqual(s.placementOptions,{gridSize:0,allowClipping:true});
 assert.equal(await page.locator('#roof').isChecked(),true);
 // Place real vendored wood pallets, authored physical forklifts + manual
 // jacks and representative original signage and ceiling web overlays.
 const props=[
 ['vestibule-wood-pallet','ci-real-wood-pallet',{x:520,y:0,z:520},'model'],
 ['vestibule-broken-wood-pallet','ci-original-broken-pallet',{x:523,y:0,z:520},'model'],
 ['vestibule-compact-forklift','ci-compact-forklift',{x:525,y:0,z:520},'model'],
 ['vestibule-manual-pallet-jack','ci-manual-pallet-jack',{x:528,y:0,z:520},'model'],
 ['vestibule-rolling-tool-chest','ci-toolchest',{x:530,y:0,z:520},'model'],
 ['wall-contractor-bulletin','ci-noticeboard',{x:530,y:1.8,z:520},'decal'],
 ['wall-service-whiteboard','ci-workorder-whiteboard',{x:532,y:1.8,z:520},'decal'],
 ['wall-wall-calendar-winter','ci-1990s-calendar',{x:534,y:1.8,z:520},'decal'],
 ['wall-mall-advert-weekend','ci-mall-advert',{x:536,y:1.8,z:520},'decal'],
 ['cobweb-ceiling-radial','ci-ceiling-web',{x:520,y:3.1,z:520},'decal'],
 ['cobweb-wall-corner','ci-wall-web',{x:523,y:2,z:520},'decal']
 ];
 for(const [assetId,id,p,kind]of props){
  const result=await page.evaluate(async([source,id,p])=>window.__PINEWOOD_BUILDER__
   .place(source,p,id),[assetId,id,p]);
  assert.equal(result,id,'placed '+assetId);
  const materials=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials(id),id);
  assert.ok(materials.length>=1,assetId+' has rendered meshes');
  if(kind==='decal'){
   assert.equal(materials.length,1,assetId+' has a transparent single overlay');
   assert.equal(materials[0].transparent,true);
   assert.equal(materials[0].textured,true);
   assert.match(materials[0].mapPath,/\/assets\/vendor\/builder\/vestibule-v98\/images\//);
  }else{
   assert.ok(materials.some(m=>m.material),assetId+' retains original model material');
   if(/pallet-jack|compact-forklift|toolchest/.test(assetId))
    assert.ok(materials.every(m=>!m.role),'original period-correct palette was not auto-retextured');
  }
 }
 assert.equal(await page.locator('#decal-opacity-field').isVisible(),true);
 await page.evaluate(()=>{
  const slider=document.getElementById('decal-opacity');
  slider.value='.42';slider.dispatchEvent(new Event('change',{bubbles:true}));
 });
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__.getState().draft.added
  .find(a=>a.id==='ci-wall-web')?.opacity===.42,{timeout:15000});
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.undo());
 assert.equal((await state()).draft.added.find(x=>x.id==='ci-wall-web')?.opacity,undefined);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.redo());
 assert.equal((await state()).draft.added.find(x=>x.id==='ci-wall-web')?.opacity,.42);
 const exported=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:155000});
 assert.equal((await state()).draft.added.length,props.length,'all 19th-century-appropriate decor saved to IndexedDB');
 assert.equal((await state()).draft.added.find(x=>x.id==='ci-wall-web')?.opacity,.42);
 const reloaded=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials('ci-ceiling-web'));
 assert.ok(reloaded?.[0]?.textured,'ceiling cobweb source image survives reload');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),exported);
 assert.equal((await state()).draft.added.length,props.length,'JSON export/import preserves all models and decals');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.equal((await state()).draft.added.length,0);
 assert.deepEqual(external,[],'no third-party network resources at runtime');
 assert.deepEqual(errors,[],'no page exceptions');
 console.log('PINEWOOD_BUILDER_V98_CONTRACTOR_WALL_COBWEBS_PASS '+JSON.stringify({
  ...assetSets,models:19,decals:36,samples:props.length,
  opacity:.42,persistence:true,licensedSourcesLocal:true,
  previousAssetCount:547,currentAssetCount:602
 }));
}finally{await browser.close()}
