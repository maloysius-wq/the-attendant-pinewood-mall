/** V130b shared original-source 1440x900 desktop software Chromium capture.
 * No mobile, no manual WASD, no separate review-only synthetic architecture.
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const origin='http://127.0.0.1:4173',folder='artifacts/v130b-original-rear';
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
 },null,{timeout:125000});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let s=await get();
 assert.equal(s.ready,true,JSON.stringify(s.errors));
 assert.deepEqual(s.errors,[]);
 assert.equal(s.firstFrameFullyLoaded,true);
 assert.equal(s.closedBayCount,13);
 assert.equal(s.firebreakClosedAreaV129,85);
 assert.equal(s.firebreakRemainingV129,435,'v129 historical baseline retained');
 assert.ok(s.rearClosureV130B);
 const rear=s.rearClosureV130B;
 assert.equal(rear.grossOriginalEnvelopeSqm,63);
 assert.equal(rear.actualEnclosedFloorSqm,61.5);
 assert.equal(rear.actualOpenStairApertureSqm,1.5);
 assert.equal(rear.residualOutsideRearSqm,372);
 assert.equal(rear.physicalUnresolvedIncludingProtectedShaftSqm,373.5);
 assert.equal(rear.sourceWalls.length,2);
 assert.deepEqual(rear.sourceWalls.map(w=>w.id).sort(),
  ['v130b_rear_freight_wall_return','v130b_rear_security_wall_return']);
 assert.equal(rear.originalCeilings.length,3);
 assert.equal(rear.originalCeilings.reduce((a,c)=>a+(c.x2-c.x1)*(c.z2-c.z1),0),61.5);
 assert.equal(s.ceilingRooms.includes('v130b_original_east_rear_fire_service_closure'),false);
 assert.equal(s.allCeilingsTextured,true);
 const shots=['rearSourceInside','rearSourcePlan','rearSourceStair','security','stairs','exit'];
 for(const shot of shots){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(150);
  s=await get();assert.equal(s.shot,shot);assert.deepEqual(s.errors,[]);
  await page.screenshot({path:folder+'/'+shot+'.png',animations:'disabled',timeout:90000});
 }
 for(const chapter of [1,3,4,6]){
  await page.evaluate(value=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(value),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 assert.deepEqual(errors,[]);
 assert.deepEqual(failed,[]);
 assert.deepEqual(remote,[]);
 console.log('V130B_REAL_ORIGINAL_REAR_DESKTOP_WEBGL_PASS '+
  JSON.stringify({sourceWalls:2,ceilingSegments:3,sourceFloorSqm:61.5,
   protectedStairSqm:1.5,shots:shots.length,errors,failed,remote}));
}finally{await browser.close();}
