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
 page.on('pageerror',err=>errors.push(err.message));
 page.on('request',req=>{if(/^https?:/.test(req.url())&&!req.url().startsWith(origin))external.push(req.url())});
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:140000});
 const API='window.__PINEWOOD_BUILDER__';
 const state=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 const initial=await state();
 assert.equal(initial.ready,true,JSON.stringify(initial.errors));
 assert.deepEqual(initial.placementOptions,{gridSize:0,allowClipping:true});
 assert.equal(await page.locator('#snap-grid').isChecked(),false);
 assert.equal(await page.locator('#allow-clipping').isChecked(),true);
 assert.equal(await page.locator('#catalog-category option[value="Surface Decals & Grime"]').count(),1);
 const options=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog()
  .filter(item=>item.kind==='surface-decal'));
 assert.equal(options.length,36);
 assert.ok(options.some(x=>x.surface==='wall'));
 assert.ok(options.some(x=>x.surface==='floor'));
 await page.locator('#catalog-category').selectOption('Surface Decals & Grime');
 assert.equal(await page.locator('.catalog-item').count(),36);
 assert.equal(await page.locator('.catalog-item img.asset-thumb').count(),36);
 await page.locator('#catalog-category').selectOption('');

 // The two exact problem Kenney models must have enlarged per-panel
 // projected photographs even when their source GLB UVs were technically valid.
 for(const [catalogId,id,x]of [
  ['kenney-furniture-kit-trashcan','ci-broad-trashcan',551],
  ['kenney-furniture-kit-kitchencoffeemachine','ci-broad-coffee',553]
 ]){
  await page.evaluate(([source,placedId,posX])=>window.__PINEWOOD_BUILDER__.place(
   source,{x:posX,y:1,z:554},placedId),[catalogId,id,x]);
  const parts=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials(id),id);
  assert.ok(parts.length>0);
  assert.ok(parts.some(p=>p.textured&&p.role),'source has a proper material-aware texture');
  assert.ok(parts.filter(p=>p.textured&&p.role).every(p=>p.furnitureUV&&p.furnitureMaxRepeats<=.94),
   catalogId+' broad-scale finish rather than tiny repeating original UVs');
 }
 const floorId='ci-floor-decals',wallId='ci-wall-decals';
 for(const [catalogId,id,pos] of [
  ['grime-dust-floor-soft',floorId,{x:560,y:.019,z:555}],
  ['grime-water-wall-streak',wallId,{x:560,y:1.35,z:557}]
 ]){
  assert.equal(await page.evaluate(([item,id,position])=>
   window.__PINEWOOD_BUILDER__.place(item,position,id),[catalogId,id,pos]),id);
  const parts=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials(id),id);
  assert.equal(parts.length,1,id+' has one true transparent PNG texture plane');
  assert.equal(parts[0].transparent,true);
  assert.equal(parts[0].textured,true);
  assert.ok(parts[0].mapPath?.includes('/assets/vendor/builder/decals-v97/'));
  assert.equal(parts[0].sourceMapPreserved,true);
  assert.equal(parts[0].opacity,.9);
 }
 assert.equal(await page.locator('#decal-opacity-field').isVisible(),true);
 await page.locator('#decal-opacity').fill('0.42');
 await page.locator('#decal-opacity').dispatchEvent('change');
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__.getState().draft.added
  .find(a=>a.id==='ci-wall-decals')?.opacity===.42,{timeout:10000});
 let wall=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials('ci-wall-decals'));
 assert.ok(Math.abs(wall[0].opacity-.42)<.001,'opacity applied to existing decal material');
 const exported=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:140000});
 assert.deepEqual((await state()).placementOptions,{gridSize:0,allowClipping:true},
  'UI preferences default correctly on new page load');
 assert.equal((await state()).draft.added.find(x=>x.id===wallId).opacity,.42);
 wall=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials('ci-wall-decals'));
 assert.ok(Math.abs(wall[0].opacity-.42)<.001);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),exported);
 assert.equal((await state()).draft.added.length,4);
 assert.equal((await state()).draft.added.find(x=>x.id===wallId).opacity,.42);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual(external,[],'no runtime third-party asset dependencies');
 assert.deepEqual(errors,[],'no uncaught Builder errors');
 console.log('PINEWOOD_BUILDER_V97_DECALS_AND_SCALE_DESKTOP_PASS '+JSON.stringify({
  decals:options.length,floor:options.filter(o=>o.surface==='floor').length,
  wall:options.filter(o=>o.surface==='wall').length,
  garbageCan:true,coffeeMaker:true,opacity:.42,saveReload:true,defaults:'snap off / overlap on'
 }));
}finally{await browser.close()}
