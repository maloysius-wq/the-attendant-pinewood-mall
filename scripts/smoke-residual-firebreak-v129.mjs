/** V129 true original property source construction, desktop-only 1440x900.
 * Five genuine WebGL photos, no manual WASD, mobile emulation, private draft,
 * off-origin assets or speculative ground replacement. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v129-original-firebreak';
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
 },null,{timeout:125000});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let state=await get();
 assert.equal(state.ready,true,JSON.stringify(state.errors));
 assert.deepEqual(state.errors,[]);
 assert.equal(state.firstFrameFullyLoaded,true);
 assert.equal(state.closedBayCount,13,'original V116 stores preserved');
 assert.equal(state.firebreakClosedAreaV129,85);
 assert.equal(state.firebreakRemainingV129,435);
 assert.equal(state.firebreakV129.survey.originalTotal,520);
 assert.equal(state.firebreakV129.survey.originalOverlap,0);
 assert.equal(state.firebreakV129.survey.originalShaftsAvoided,true);
 assert.equal(state.firebreakV129.newlyConstructedWalls.length,2);
 assert.equal(state.firebreakV129.upperSpandrel.bottom,3.45);
 assert.equal(state.firebreakV129.upperSpandrel.top,5.19);
 assert.equal(state.firebreakV129.upperSpandrel.at,-29);
 assert.deepEqual(state.firebreakV129.newlyConstructedWalls.map(w=>w.at).sort((a,b)=>a-b),[-46,-29]);
 assert.equal(state.firebreakV129.sign.originalArtwork,true);
 assert.equal(state.firebreakV129.sign.actualMasonry,true);
 assert.equal(state.firebreakV129.sign.permanentlySealed,true);
 assert.equal(state.firebreakV129.ceiling.y-state.firebreakV129.ceiling.thickness/2,3.3600000000000003);
 assert.ok(!state.ceilingRooms.includes('v129_fallows_north_firebreak'),
  'closed source void may not count as a new canonical story room');
 assert.equal(state.allCeilingsTextured,true);
 const shots=['firebreakFront','firebreakAngle','firebreakPlan','closedNorth','service'];
 for(const shot of shots){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(140);
  state=await get();assert.equal(state.shot,shot);assert.deepEqual(state.errors,[]);
  await page.screenshot({path:folder+'/'+shot+'.png',animations:'disabled',timeout:90000});
  if(['firebreakFront','firebreakPlan','closedNorth'].includes(shot)){
   await page.setViewportSize({width:800,height:500});
   await page.waitForTimeout(120);
   const preview=await page.screenshot({type:'jpeg',quality:24,animations:'disabled',timeout:90000});
   console.log('V129_REAL_WEBGL_PREVIEW_'+shot.toUpperCase()+' '+preview.toString('base64'));
   await page.setViewportSize({width:1440,height:900});
  }
 }
 for(const chapter of [1,4,6]){
  await page.evaluate(c=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(c),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 assert.deepEqual(pageErrors,[]);assert.deepEqual(failed,[]);assert.deepEqual(remote,[]);
 console.log('V129_ORIGINAL_SOURCE_FIREBREAK_DESKTOP_WEBGL_PASS '+
  JSON.stringify({newSourceWalls:2,sourceCeiling:1,originalAreaClosed:85,
   remaining:435,shots:shots.length,pageErrors,failed,remote}));
}finally{await browser.close();}
