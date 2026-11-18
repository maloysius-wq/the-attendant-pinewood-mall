/** V131 actual shared original-source WebGL, desktop 1440x900 only.
 * No mobile, WASD, fake review-only walls or remote runtime assets. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v131-original-rear';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const pageErrors=[],failed=[],remote=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{
  const s=window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.();
  return s&&(s.ready||s.errors.length>0);
 },null,{timeout:140000});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let state=await get();
 assert.equal(state.ready,true,JSON.stringify(state.errors));
 assert.deepEqual(state.errors,[]);
 assert.equal(state.firstFrameFullyLoaded,true);
 assert.equal(state.rearRemainderV131,372);
 assert.equal(state.rearSourceFloorV131,61.5);
 assert.equal(state.rearServiceV131.survey.immutableV128Baseline,520);
 assert.equal(state.rearServiceV131.survey.afterV129,435);
 assert.equal(state.rearServiceV131.survey.originalFootprintResolved,63);
 assert.equal(state.rearServiceV131.survey.stillOpenSourceStairShaft,1.5);
 assert.equal(state.rearServiceV131.walls.length,2);
 assert.equal(state.rearServiceV131.ceilings.length,3);
 assert.equal(state.firebreakClosedAreaV129,85);
 assert.equal(state.firebreakRemainingV129,435);
 assert.equal(state.closedBayCount,13);
 assert.equal(state.allCeilingsTextured,true);
 const shots=['rearSealInside','rearSealNorth','rearSealPlan','rearSealStair','service','firebreakFront'];
 for(const shot of shots){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(160);
  state=await get();
  assert.equal(state.shot,shot);
  assert.deepEqual(state.errors,[]);
  await page.screenshot({path:folder+'/'+shot+'.png',animations:'disabled',timeout:90000});
 }
 for(const chapter of [1,3,6]){
  await page.evaluate(c=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(c),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 assert.deepEqual(pageErrors,[]);assert.deepEqual(failed,[]);assert.deepEqual(remote,[]);
 console.log('V131_ORIGINAL_SOURCE_REAR_CLOSURE_WEBGL_PASS '+
  JSON.stringify({newRealWallSegments:2,authenticCeilingPatches:3,
   actualFloor:61.5,uncappedStair:1.5,footprintSealed:63,
   stillUnresolved:372,shots:shots.length,pageErrors,failed,remote}));
}finally{await browser.close()}
