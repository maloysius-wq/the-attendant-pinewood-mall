/** V127b true 1440x900 desktop-only software WebGL scene review. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v127b-annex';
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
 assert.deepEqual(s.errors,[]);
 assert.equal(s.annexCirculationV127b.lights.length,10);
 assert.equal(s.annexCirculationV127b.signs.length,5);
 assert.ok(s.annexCirculationV127b.finishedWalls>=8);
 assert.equal(s.annexCirculationV127b.bulkheads,3);
 assert.equal(s.annexCirculationV127b.centralClearWidth,4);
 assert.equal(s.staffServiceV127.length,5);
 assert.equal(s.firstFrameFullyLoaded,true);
 for(const shot of ['annexNorth','annexStaff','closedAnnex','annexSouth','exit','aerial']){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(190);
  s=await get();assert.equal(s.shot,shot);assert.deepEqual(s.errors,[]);
  await page.screenshot({path:folder+'/'+shot+'.png',animations:'disabled',timeout:85000});
  if(shot==='annexNorth'||shot==='annexSouth'){
   // Human reviewer can inspect small JPEG from authenticated Actions job log;
   // complete full-resolution PNG is always retained as a workflow artifact.
   const jpeg=await page.screenshot({type:'jpeg',quality:27,animations:'disabled'});
   console.log('V127B_REVIEW_JPEG_'+shot.toUpperCase()+' '+jpeg.toString('base64'));
  }
 }
 for(const chapter of [1,4,6]){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(n),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failed,[]);
 console.log('V127B_ANNEX_REAL_DESKTOP_WEBGL_PASS '+JSON.stringify({
  lamps:s.annexCirculationV127b.lights.length,
  signs:s.annexCirculationV127b.signs.length,shots:6,errors,remote,failed
 }));
}finally{await browser.close();}
