/** V146 original 1440×900 source game: real E pickup, actual keyboard Q, original physics and AI. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const url='http://127.0.0.1:4173',dir='artifacts/v146-genuine-decoy-investigation';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(100000);
 const errors=[],remote=[],failed=[],consoleErrors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(url))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(url+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 try{
  await page.waitForFunction(()=>!!window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__&&
   !!window.__PINEWOOD_CH1_PROGRESSION_V142_QA__&&
   !!window.__PINEWOOD_CH1_STEALTH_V139_QA__,null,{timeout:540000,polling:500});
 }catch(error){
  const diagnostics=await page.evaluate(()=>({
   loadText:document.getElementById('loadText')?.textContent,
   loadFill:document.getElementById('loadFill')?.style.width,
   v146:!!window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__
  }));
  await writeFile(dir+'/startup-error.json',JSON.stringify({error:String(error),diagnostics,errors,remote,failed},null,2));
  throw error;
 }
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const collected=await page.evaluate(()=>
  window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.collect('decoy','Noise Maker'));
 assert.equal(collected.sourceCollected,true,'actual source V139 E must collect Noise Maker');
 assert.ok(collected.aim.targetReal,'actual first-person E raycaster must see source decoy');
 const activated=await page.evaluate(()=>{
  window.__PINEWOOD_CH1_STEALTH_V139_QA__.viewNorthGalleryForTest();
  window.__PINEWOOD_CH1_V137_QA__.operateNextActualCircuitForTest();
  return window.__PINEWOOD_CH1_STEALTH_V139_QA__.revealFromActualSceneForTest();
 });
 assert.equal(activated.revealed,true,'real first breaker and first original distant sighting required');
 const prepared=await page.evaluate(()=>
  window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__.prepareActualGalleryHunt());
 assert.equal(prepared.setup,true);
 assert.ok(prepared.range>11&&prepared.range<=29,
  'real original physical wall route keeps weak throw sound unheard');
 assert.ok(prepared.heardLandingRange>=3&&prepared.heardLandingRange<=23,
  'real original physically reachable landing audible behind wall');
 assert.equal(prepared.genuineMasonryLOSBreak,true);
 await page.keyboard.press('KeyQ');
 const thrown=await page.evaluate(()=>
  window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__.getState());
 assert.equal(thrown.originalInventory,0,'genuine keyboard Q spends original source item');
 assert.equal(thrown.activeOriginalDecoys.length,1);
 assert.equal(thrown.activeOriginalDecoys[0].state,'fly','original thrown object begins with real physics');
 const first=await page.evaluate(()=>
  window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__.advanceActualThrownDecoy(20,.055));
 assert.ok(first.heard>=1,'original Attendant hears real physical landing');
 assert.ok(first.activeOriginalDecoys.some(d=>d.state==='active'),'original decoy physically landed on walkable source floor');
 const landing=first.activeOriginalDecoys.find(d=>d.state==='active');
 assert.ok(Math.hypot(first.lastEvent.originalPosition.x-landing.x,
  first.lastEvent.originalPosition.z-landing.z)<.36,
  'actual heard position must be original active THREE thrown mesh');
 assert.ok(first.lastEvent.navMetres<=27,'sound followed true original navigation, not long-range teleport');
 assert.ok(first.originalDecoyActiveUntil>0);
 assert.ok(Math.hypot(first.originalDecoyPosition.x-landing.x,
  first.originalDecoyPosition.z-landing.z)<.36,'genuine AI stores source landing');
 console.log('V146_DECOY_PATH_AT_HEARING '+JSON.stringify({
  prepared:{player:prepared.player,attendant:prepared.attendant},
  event:first.lastEvent,landing,
  pathAfterSimulation:first.originalPathEnd,
  attendantAfterSimulation:first.originalAttendantPosition,
  currentAIState:first.originalAttendantState
 }));
 assert.equal(first.lastEvent.originalGoalCell.passable,true,
  'real original noise landed in a nav-passable source cell');
 assert.ok(first.lastEvent.pathAtHearing,
  'original A* route must exist at genuine physical landing sound '+JSON.stringify(first));
 assert.ok(Math.hypot(first.lastEvent.pathAtHearing.x-landing.x,
  first.lastEvent.pathAtHearing.z-landing.z)<1.5,
  'original A* at audible landing must target source decoy '+JSON.stringify(first.lastEvent));
 assert.ok(landing.pulse>.55,'Chapter 1 beep must use calmer real source 1.2s cadence');
 await page.screenshot({path:dir+'/original-decoy-landed-attendant-investigates.png',
  animations:'disabled',timeout:120000});
 const continued=await page.evaluate(()=>
  window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__.advanceActualThrownDecoy(65,.055));
 assert.ok(continued.heard>=1&&continued.heard<=5,
  'real decoy pulses must not endlessly reset investigation '+JSON.stringify(continued));
 assert.ok(continued.coalesced>=1,
  'repeated pulses from original source must be coalesced');
 const distant=await page.evaluate(()=>
  window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__.sendFarActualSourceSound());
 assert.ok(distant.nav>27);
 assert.equal(distant.untouched,true,'far physically disconnected source cannot command original AI');
 assert.ok(distant.state.rejectedFar>=1);
 const visible=await page.evaluate(()=>
  window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__.proveVisiblePlayerOverridesDecoy());
 assert.equal(visible.seen,true);assert.equal(visible.los,true);
 assert.equal(visible.prioritized,true,'human actually seen must override decoy');
 assert.equal(visible.decoyExpired,true);
 assert.equal(visible.state.originalAttendantState,'hunt','original AI pursues actually visible player');
 await page.screenshot({path:dir+'/original-gallery-vision-priority.png',
  animations:'disabled',timeout:120000});
 const failures=failed.filter(s=>!s.includes('furniture_shop_loop.ogg net::ERR_ABORTED'));
 const report={collected:{realE:collected.sourceCollected,realAim:collected.aim.targetReal},
  first,continued,distant,visible,errors,remote,failures,consoleErrors};
 await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failures,[]);
 console.log('V146_REAL_ORIGINAL_DECOY_RESPONSE_PASS '+JSON.stringify({
  genuineE:true,keyboardQ:true,physicalSourceLanding:{x:landing.x,z:landing.z},
  originalAStarToDecoy:first.lastEvent.pathAtHearing,
  originalSourceNavHearing:first.lastEvent.navMetres,
  coalescedPulses:continued.coalesced,realUnheardFarSource:distant.nav,
  originalVisiblePlayerWins:true,errors,remote,failures
 }));
}finally{await browser.close();}
