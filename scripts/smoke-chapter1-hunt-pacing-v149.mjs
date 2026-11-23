/** V149 original 1440x900: real Fallow masonry LOS -> last-heard source A* search.
 * No mocked grid, no manual WASD, no alternate actor or imported Builder.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',dir='artifacts/v149-real-original-search';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(100000);
 const errors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 try{
  await page.waitForFunction(()=>!!window.__PINEWOOD_CH1_HUNT_PACING_V149_QA__&&
   !!window.__PINEWOOD_CH1_RECOVERY_V140_QA__&&
   !!window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__&&
   !!window.__PINEWOOD_CH1_STEALTH_V139_QA__,
   null,{timeout:540000,polling:500});
 }catch(error){
  const state=await page.evaluate(()=>({
   fill:document.getElementById('loadFill')?.style.width,
   text:document.getElementById('loadText')?.textContent,
   v149:!!window.__PINEWOOD_CH1_HUNT_PACING_V149_QA__
  }));
  await writeFile(dir+'/startup.json',JSON.stringify({state,error:String(error),errors,failed,remote},null,2));
  throw error;
 }
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const initial=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__.getState());
 assert.equal(initial.chapter,1);assert.equal(initial.running,true);
 assert.equal(initial.realCabinet.interactive,true);
 assert.deepEqual(initial.realPickups.map(x=>x.label).sort(),['Noise Maker','Pager Decoy']);
 const sight=await page.evaluate(()=>{
  const q=window.__PINEWOOD_CH1_STEALTH_V139_QA__;
  q.viewNorthGalleryForTest();
  window.__PINEWOOD_CH1_V137_QA__.operateNextActualCircuitForTest();
  return q.revealFromActualSceneForTest();
 });
 assert.equal(sight.revealed,true,'must use genuine original first Attendant reveal');
 const search=await page.evaluate(()=>window.__PINEWOOD_CH1_HUNT_PACING_V149_QA__
  .examineActualFallowSearch());
 assert.equal(search.actualLOS,false,
  'real 1979 Fallow wall must block source perception');
 assert.equal(search.initialAISee,false);
 assert.equal(search.originalSourceWalkable,true);
 assert.ok(search.lastHeardOriginalRoute>1,'source A* must reach the real last-heard cell');
 assert.equal(search.capped.originalAIState,'hunt');
 assert.equal(search.capped.originalTimer,6.25,
  'real lost sight must cap original hunt tail without early dismissal');
 assert.ok(search.capped.postSightCaps>=1);
 assert.equal(search.source.originalAIState,'search');
 assert.equal(search.source.searchEntries,1);
 assert.equal(search.source.originalPathEnd.x,-27);
 assert.equal(search.source.originalPathEnd.z,-62,
  'first original search route must inspect last seen/heard location');
 assert.equal(search.source.lastSweep.originalCellPassable,true);
 assert.ok(search.source.lastSweep.originalRouteSteps>1);
 assert.ok(search.realFirstPath.length>1);
 assert.equal(search.sweep.originalAIState,'search');
 assert.ok(search.sweep.sourceSweepPaths>=2);
 assert.ok(Math.hypot(search.sweep.originalPathEnd.x+27,
  search.sweep.originalPathEnd.z+62)<=2.1,
  'real search must remain within 2m of its last observed source point');
 assert.equal(search.sweep.inaccessibleSourcePaths,0);
 assert.equal(search.sweep.originalActorVisible,true);
 assert.equal(search.sweep.originalLastHeard.x,-27);
 assert.equal(search.sweep.originalLastHeard.z,-62);
 await page.screenshot({path:dir+'/original-fallow-wall-occludes-search.png',
  animations:'disabled',timeout:120000});
 const recovered=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__
  .testRealSearchCooldown());
 assert.equal(recovered.attendantState,'dormant');
 assert.ok(recovered.nextStalk>=12,'no immediate unfair repeat hunter spawn');
 const visible=await page.evaluate(()=>window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__
  .proveVisiblePlayerOverridesDecoy());
 assert.equal(visible.seen,true);assert.equal(visible.los,true);
 assert.equal(visible.state.originalAttendantState,'hunt');
 assert.equal(visible.prioritized,true);
 const later=await page.evaluate(()=>window.__PINEWOOD_CH1_HUNT_PACING_V149_QA__.getState());
 assert.equal(later.originalAIState,'hunt',
  'real human visual reacquisition must override the search/decoy safely');
 const genuineFailures=failed.filter(x=>!x.includes('furniture_shop_loop.ogg net::ERR_ABORTED'));
 const report={originalBreaker:true,originalReveal:true,search,recovered,visible,later,
  errors,remote,genuineFailures};
 await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(genuineFailures,[]);
 console.log('V149_REAL_ORIGINAL_HUNT_SEARCH_PASS '+JSON.stringify({
  sourceFallowWallLOS:search.actualLOS,
  originalSearchMemory:search.source.originalPathEnd,
  secondOriginalAStarSweep:search.sweep.originalPathEnd,
  originalReachableRoute:search.source.lastSweep.originalRouteSteps,
  cappedUnseenHuntSeconds:search.capped.originalTimer,
  realTwelveSecondRespite:recovered.nextStalk,
  realVisiblePlayerOverride:visible.prioritized,
  errors,remote,genuineFailures
 }));
}finally{await browser.close();}
