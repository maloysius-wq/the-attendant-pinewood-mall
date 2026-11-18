/** V135 exact ORIGINAL west-rear source WebGL 1440x900 only.
 * Requires the staged source plan to be integrated in the shared shell,
 * real source reviewer, gameplay and Builder BEFORE executing this test.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v135-west-rear-original';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],failed=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{
  const s=window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.();
  return s&&(s.ready||s.errors.length>0);
 },null,{timeout:150000});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let s=await get();
 assert.equal(s.ready,true,JSON.stringify(s.errors));assert.deepEqual(s.errors,[]);
 assert.ok(s.westRearV135,'real source construction must supply genuine west rear geometry');
 assert.equal(s.westRearV135.closedSqm,45);
 assert.equal(s.westRearV135.unresolvedAfter,286);
 assert.equal(s.westRearV135.walls.length,4);
 assert.equal(s.westRearV135.ceiling.id,'v135_original_rear_west_plaster');
 assert.equal(s.allCeilingsTextured,true);
 assert.equal(s.closedBayCount,13);
 assert.equal(s.rearRemainderV131,372);
 assert.equal(s.frontRemainingV133,331);
 const shots=['westRearInside','westRearPlan','westRearSouth','closedSouth','northService','stairs'];
 for(const shot of shots){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(n),shot);
  await page.waitForTimeout(150);s=await get();
  assert.equal(s.shot,shot);assert.deepEqual(s.errors,[]);
  await page.screenshot({path:folder+'/'+shot+'.png',animations:'disabled',timeout:90000});
 }
 for(const chapter of [1,3,6]){
  await page.evaluate(c=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(c),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(remote,[]);
 console.log('V135_REAL_ORIGINAL_WEST_REAR_WEBGL_PASS '+JSON.stringify({
  closedSourceSqm:45,newRealWalls:4,originalFloorIntact:true,remainingFacadeSqm:286,
  shots:shots.length,errors,failed,remote
 }));
}finally{await browser.close()}
