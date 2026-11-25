/** Actual full Pinewood mall, not merely a stand-alone GLB source gallery. */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const base='http://127.0.0.1:4173',dir='artifacts/v121-actual-original-store-rooms';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(base+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 try{
  await page.waitForFunction(()=>{
   const app=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;
   return app&&(app.ready||app.getState().errors.length);
  },null,{timeout:110000});
 }catch(e){
  console.error('V121_REAL_STORE_BOOT_FAILED '+JSON.stringify({
   errors,remote,failed,
   state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.()),
   body:(await page.locator('body').innerText()).slice(0,1000)
  }));
  throw e;
 }
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 const initial=await get();
 assert.ok(initial.ready,'source mall shell could not render '+initial.errors.join('; '));
 assert.deepEqual(initial.errors,[]);
 assert.equal(initial.firstFrameFullyLoaded,true);
 assert.equal(initial.anchorRetailCountV121,66);
 assert.equal(initial.anchorRetailV121.length,66);
 assert.equal(initial.anchorRetailV121.filter(x=>x.room==='west_anchor').length,36);
 assert.equal(initial.anchorRetailV121.filter(x=>x.room==='east_original_anchor').length,30);
 assert.equal(initial.galleryColumnCount,28);
 assert.equal(initial.benchCountV120,6);
 assert.equal(initial.directoryCountV120,2);
 assert.equal(initial.storefrontCount,7);
 assert.equal(initial.closedBayCount,13);
 for(const f of initial.anchorRetailV121){
  assert.ok(f.measuredHeight>.70&&f.measuredHeight<2.8,'real GLB is toy or giant '+f.id);
  assert.ok(f.width>.1&&f.depth>.1,'actual source mesh has zero footprint '+f.id);
  assert.equal(f.license,'CC0-1.0');
  assert.ok(f.width*f.depth<4.3,'imported source mesh would block broad public mall walkway '+f.id);
  assert.ok(Math.abs(f.groundY)<.02,'actual model is hovering '+f.id);
 }
 assert.equal(initial.anchorRetailV121.some(f=>f.source==='podium'),false,
  'preview proved podium width >7m and it must be excluded from normal shop furnishing');
 for(const name of ['fallows','eastAnchor','fallowPlan','eastAnchorPlan','westGallery','eastGallery','aerial']){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(n),name);
  await page.waitForTimeout(210);
  const state=await get();
  assert.equal(state.shot,name);
  assert.deepEqual(state.errors,[]);
  await page.screenshot({path:dir+'/'+name+'.png',fullPage:true,animations:'disabled',timeout:90000});
 }
 assert.deepEqual(errors,[],'no WebGL JS errors');
 assert.deepEqual(remote,[],'no external GLBs or runtime media');
 assert.deepEqual(failed,[],'all local vendor assets actually served');
 await writeFile(dir+'/actual-tenants.json',JSON.stringify(initial.anchorRetailV121,null,2));
 console.log('PINEWOOD_V121_FULL_GROUND_RETAIL_PASS '+JSON.stringify({
  tenants:['west_anchor','east_original_anchor'],
  modelCount:initial.anchorRetailCountV121,anchored:initial.anchorRetailV121.map(x=>x.id),
  errors,remote,failed
 }));
}finally{await browser.close();}
