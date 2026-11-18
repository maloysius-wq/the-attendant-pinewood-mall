/** V127 genuine 1440x900 software-WebGL captures; desktop only. */
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173',folder='artifacts/v127-staff-service';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{
  const s=window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.();
  return s&&(s.ready||s.errors.length>0);
 },null,{timeout:115000});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let s=await get();
 assert.equal(s.ready,true,s.errors.join(' | '));
 assert.deepEqual(s.errors,[]);assert.equal(s.staffServiceV127.length,5);
 assert.equal(s.staffFixtureCountV127,5);
 assert.equal(s.closedBayCount,13);assert.equal(s.storefrontCount,7);
 assert.equal(s.firstFrameFullyLoaded,true);
 for(const shot of ['northService','securityService','trainingService','kitchenService',
  'lockerService','annexStaff','aerial']){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(190);
  s=await get();assert.equal(s.shot,shot);assert.deepEqual(s.errors,[]);
  await page.screenshot({path:folder+'/'+shot+'.png',animations:'disabled',timeout:85000});
 }
 for(let chapter=1;chapter<=6;chapter++){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(n),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failed,[]);
 console.log('V127_STAFF_SERVICE_REAL_DESKTOP_WEBGL_PASS '+JSON.stringify({
  suites:s.staffServiceV127.length,cabinets:s.staffFixtureCountV127,
  shots:7,errors,remote,failed
 }));
}finally{await browser.close();}
