/** V123 verify that original stocked displays really exist in joined mall WebGL. */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173',dir='artifacts/v123-real-original-tenant-stock';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],consoleErrors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 try{
  await page.waitForFunction(()=>{
   const app=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;
   return app&&(app.ready||app.getState().errors.length);
  },null,{timeout:110000});
 }catch(e){
  console.error('V123_STOCK_BOOT_DIAGNOSTIC '+JSON.stringify({
   errors,consoleErrors,remote,failed,
   state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.()),
   body:(await page.locator('body').innerText()).slice(0,1200)
  }));throw e;
 }
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 const s=await get();
 assert.ok(s.ready,'original real mall did not finish loading: '+s.errors.join(' | '));
 assert.deepEqual(s.errors,[]);
 assert.equal(s.firstFrameFullyLoaded,true);
 assert.equal(s.stockCountV123,13);
 assert.equal(s.supportedStockV123,6);
 assert.equal(s.groundStockV123,7);
 assert.equal(s.anchorRetailCountV121,49);
 assert.equal(s.ceilingPanelCountV122,15);
 assert.equal(s.departmentSignCountV122,2);
 assert.equal(s.galleryColumnCount,28);
 assert.equal(s.storefrontCount,7);
 assert.equal(s.closedBayCount,13);
 assert.equal(s.benchCountV120,6);
 assert.equal(s.directoryCountV120,2);
 assert.equal(s.anchorStockV123.filter(f=>f.room==='west_anchor').length,8);
 assert.equal(s.anchorStockV123.filter(f=>f.room==='east_original_anchor').length,5);
 assert.equal(new Set(s.anchorStockV123.map(f=>f.id)).size,13);
 for(const f of s.anchorStockV123){
  assert.equal(f.license,'CC0-1.0');
  assert.ok(f.model.startsWith('assets/vendor/builder/models/'),'no remote stock model '+f.id);
  assert.ok(f.actualWidth>.12&&f.actualWidth<2);
  assert.ok(f.actualDepth>.12&&f.actualDepth<1.5);
  assert.ok(f.actualHeight>.3&&f.actualHeight<1.5);
  if(f.support){
   assert.ok(f.groundY>.80&&f.groundY<1.15,'merchandise floats off real table '+f.id);
   assert.equal(f.collisionRadius,0);
  }else{
   assert.ok(Math.abs(f.groundY)<.012,'real floor stock is not actually grounded '+f.id);
   assert.ok(f.collisionRadius>.2,'floor stock lacks a navigation collider '+f.id);
  }
 }
 for(const shot of ['fallows','eastAnchor','fallowPlan','eastAnchorPlan','westGallery','eastGallery']){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(n),shot);
  await page.waitForTimeout(220);
  assert.equal((await get()).shot,shot);
  await page.screenshot({path:dir+'/'+shot+'.png',fullPage:true,animations:'disabled',timeout:90000});
 }
 // Repeat both source store cameras without the artificially bright
 // construction-review lamp. Observe genuine installed V122 light levels.
 await page.locator('#survey-light').uncheck();
 for(const shot of ['fallows','eastAnchor']){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(n),shot);
  await page.waitForTimeout(220);
  await page.screenshot({path:dir+'/'+shot+'-real-game-light.png',fullPage:true,animations:'disabled',timeout:90000});
 }
 for(let chapter=1;chapter<=6;chapter++)
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(n),chapter);
 assert.deepEqual(errors,[],'no real Chromium WebGL exceptions');
 assert.deepEqual(consoleErrors,[],'no missing source model console errors');
 assert.deepEqual(remote,[],'no external runtime asset network requests');
 assert.deepEqual(failed,[],'all SHA-pinned original GLBs downloaded locally');
 await writeFile(dir+'/source-and-support-measurements.json',JSON.stringify(s.anchorStockV123,null,2));
 console.log('PINEWOOD_V123_GENUINE_IN_WORLD_STOCK_PASS '+JSON.stringify({
  realModels:s.stockCountV123,supported:s.supportedStockV123,grounded:s.groundStockV123,
  sourceIds:s.anchorStockV123.map(f=>f.id),errors,remote,failed
 }));
}finally{await browser.close();}
