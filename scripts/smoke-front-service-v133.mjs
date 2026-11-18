/** V133 canonical shared original mall 1440x900 software-WebGL inspection.
 * No synthetic review-only walls, no mobile, no manual WASD or remote assets.
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v133-front-original';
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
 },null,{timeout:140000});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let s=await get();
 assert.equal(s.ready,true,JSON.stringify(s.errors));
 assert.deepEqual(s.errors,[]);
 assert.equal(s.firstFrameFullyLoaded,true);
 assert.ok(s.originalFrontV133,'real V133 front original geometry must come from live physical shell');
 assert.equal(s.originalFrontV133.enclosure.originalArea,41);
 assert.equal(s.originalFrontV133.unresolvedAfter,331);
 assert.equal(s.originalFrontV133.walls.length,1);
 assert.equal(s.originalFrontV133.walls[0].role,'v133-front-service-partition');
 assert.equal(s.originalFrontV133.walls[0].end,8.91);
 assert.equal(s.originalFrontV133.ceiling.id,'v133_front_service_plaster');
 assert.equal(s.rearRemainderV131,372,'V131 historical survey source remains immutable');
 assert.equal(s.closedBayCount,13);
 assert.equal(s.allCeilingsTextured,true);
 const shots=['frontSeamInside','frontSeamPlan','frontSeamDoorApproach','serviceTurn','checkin','boarded'];
 for(const shot of shots){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(150);
  s=await get();
  assert.equal(s.shot,shot);assert.deepEqual(s.errors,[]);
  await page.screenshot({path:folder+'/'+shot+'.png',animations:'disabled',timeout:90000});
 }
 for(const chapter of [1,3,6]){
  await page.evaluate(c=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(c),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(remote,[]);
 console.log('V133_ORIGINAL_SOURCE_FRONT_WEBGL_PASS '+JSON.stringify({
  actualFrontEnclosedSqm:41,unresolved:331,originalSourceWallEnd:8.91,shots:shots.length,
  errors,failed,remote
 }));
}finally{await browser.close();}
