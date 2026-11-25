/** Original 540m² Annex anchor, real 1440×900 desktop WebGL capture.
 * No mobile emulation, manual WASD, remote assets, or private Builder data. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v128-annex-anchor';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const pageErrors=[],failed=[],remote=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{
  const s=window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.();
  return s&&(s.ready||s.errors.length>0);
 },null,{timeout:540000});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let state=await get();
 assert.equal(state.ready,true,state.errors.join(' | '));
 assert.deepEqual(state.errors,[]);
 assert.equal(state.annexAnchorFixtureCountV128,73);
 assert.equal(state.annexAnchorLampCountV128,8);
 assert.ok(state.annexAnchorStockCountV128>=900);
 assert.equal(state.annexAnchorV128.stockBatches.reduce((n,b)=>n+b.count,0),state.annexAnchorStockCountV128);
 assert.ok(state.annexAnchorV128.stockBatches.length<=14,'instanced stock per SKU');
 assert.equal(state.annexAnchorV128.originalArea,540);
 assert.equal(state.annexAnchorV128.identity.originalArtwork,true);
 assert.equal(state.annexAnchorV128.posters.length,5);
 assert.ok(state.annexAnchorV128.fixtures.every(f=>f.groundY>=-.01&&f.groundY<.01));
 assert.ok(state.annexAnchorV128.lights.every(f=>Math.abs(f.ceilingUnderside-7.61)<.02));
 assert.equal(state.firstFrameFullyLoaded,true);
 await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(4));
 const shots=['annexAnchorFront','annexAnchorInside','annexAnchorGoods',
  'annexAnchorExit','annexAnchorPlan','annexAnchorNight','aerial'];
 for(const shot of shots){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  if(shot==='annexAnchorNight')await page.locator('#survey-light').uncheck();
  if(shot==='aerial')await page.locator('#survey-light').check();
  await page.waitForTimeout(180);
  state=await get();assert.equal(state.shot,shot);assert.deepEqual(state.errors,[]);
  await page.screenshot({path:folder+'/'+shot+'.png',
   animations:'disabled',timeout:90000});
  // A small desktop preview is emitted for independent inspection of real
  // Chromium pixels. Original full-resolution artifact remains authoritative.
  if(['annexAnchorInside','annexAnchorPlan','annexAnchorNight'].includes(shot)){
   await page.setViewportSize({width:800,height:500});
   await page.waitForTimeout(140);
   const small=await page.screenshot({type:'jpeg',quality:24,
    animations:'disabled',timeout:90000});
   console.log('V128_REAL_WEBGL_PREVIEW_'+shot.toUpperCase()+' '+small.toString('base64'));
   await page.setViewportSize({width:1440,height:900});
  }
 }
 for(const chapter of [1,4,6]){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(n),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 assert.deepEqual(pageErrors,[]);
 assert.deepEqual(failed,[]);
 assert.deepEqual(remote,[]);
 console.log('V128_ORIGINAL_ANNEX_ANCHOR_DESKTOP_WEBGL_PASS '+JSON.stringify({
  fixtures:state.annexAnchorFixtureCountV128,realLamps:state.annexAnchorLampCountV128,
  originalStock:state.annexAnchorStockCountV128,shots:shots.length,
  pageErrors,failed,remote
 }));
}finally{await browser.close();}
