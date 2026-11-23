/** Original Chapter 1 1440x900: genuine E Noise Maker, first reveal, actual Q landing and safe early retreat. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',dir='artifacts/v147-real-first-peek';
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
  await page.waitForFunction(()=>!!window.__PINEWOOD_CH1_FIRST_PEEK_V147_QA__&&
   !!window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__&&
   !!window.__PINEWOOD_CH1_PROGRESSION_V142_QA__,null,
   {timeout:540000,polling:500});
 }catch(error){
  const diagnostics=await page.evaluate(()=>({
   loadText:document.getElementById('loadText')?.textContent,
   v147:!!window.__PINEWOOD_CH1_FIRST_PEEK_V147_QA__,
   v139:!!window.__PINEWOOD_CH1_STEALTH_V139_QA__
  }));
  await writeFile(dir+'/startup.json',JSON.stringify({error:String(error),diagnostics,errors,remote,failed},null,2));
  throw error;
 }
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const realE=await page.evaluate(()=>
  window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.collect('decoy','Noise Maker'));
 assert.equal(realE.sourceCollected,true,'genuine E must recover actual source Noise Maker');
 assert.equal(realE.aim.targetReal,true,'original first-person raycaster must target real source');
 const sight=await page.evaluate(()=>{
  const stealth=window.__PINEWOOD_CH1_STEALTH_V139_QA__;
  stealth.viewNorthGalleryForTest();
  window.__PINEWOOD_CH1_V137_QA__.operateNextActualCircuitForTest();
  return stealth.revealFromActualSceneForTest();
 });
 assert.equal(sight.revealed,true);
 assert.equal(sight.attendantState,'stalk','first actual reveal must begin as non-hunting stalk');
 const peek=await page.evaluate(()=>window.__PINEWOOD_CH1_FIRST_PEEK_V147_QA__.getState());
 assert.equal(peek.extended,true,'protected first appearance should remain visible long enough to learn Q');
 assert.equal(peek.originalAttendantVisible,true);
 assert.ok(peek.peekUntil-peek.gameTime>3.8,'authentic first peek must last at least 4s');
 assert.ok(peek.graceUntil-peek.gameTime>14,'original 15-second safe reveal must remain intact');
 await page.screenshot({path:dir+'/original-first-sighting-before-noise.png',
  animations:'disabled',timeout:120000});
 await page.keyboard.press('KeyQ');
 const launched=await page.evaluate(()=>window.__PINEWOOD_CH1_FIRST_PEEK_V147_QA__.getState());
 assert.equal(launched.originalDecoyCount,0);
 assert.equal(launched.actualOriginalThrown.length,1);
 assert.equal(launched.actualOriginalThrown[0].state,'fly');
 const response=await page.evaluate(()=>
  window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__.advanceActualThrownDecoy(21,.05));
 const diverted=await page.evaluate(()=>window.__PINEWOOD_CH1_FIRST_PEEK_V147_QA__.getState());
 assert.ok(response.activeOriginalDecoys.some(d=>d.state==='active'),
  'real noise maker must land on original physical floor');
 assert.equal(diverted.diverted,true,
  'real source decoy must turn the protected first Attendant sighting');
 assert.equal(diverted.diversionCount,1,'repeated beeps cannot repeatedly reset first peek');
 assert.ok(diverted.turns>=1,'original actor should visibly turn to look toward the true landing');
 assert.ok(diverted.sourceNavMetres<=27&&diverted.sourceNavMetres>=0,
  'the real physical sound must be within navigable hearing distance');
 const landing=diverted.actualOriginalThrown.find(d=>d.state==='active');
 assert.ok(Math.hypot(diverted.sourceLanding.x-landing.x,
  diverted.sourceLanding.z-landing.z)<.36,'no fake landing/source position');
 assert.equal(diverted.originalAttendantState,'stalk',
  'decoy during intro must not start hunt/investigate');
 assert.equal(diverted.originalAttendantVisible,true);
 assert.ok(diverted.shortenedPeekEnd<diverted.extendedAt+4.25,
  'real noise must make the silhouette withdraw early');
 assert.ok(diverted.graceUntil-diverted.gameTime>10,
  'first-sighting grace must remain nonlethal after Q');
 await page.screenshot({path:dir+'/original-actor-turns-toward-physical-noise.png',
  animations:'disabled',timeout:120000});
 await page.evaluate(()=>
  window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__.advanceActualThrownDecoy(48,.055));
 const withdrawn=await page.evaluate(()=>window.__PINEWOOD_CH1_FIRST_PEEK_V147_QA__.getState());
 assert.equal(withdrawn.diversionCount,1);
 assert.equal(withdrawn.originalAttendantState,'dormant',
  'the actual original stalk naturally disappears instead of beginning a hunt');
 assert.equal(withdrawn.originalAttendantVisible,false);
 assert.ok(withdrawn.gameTime<withdrawn.graceUntil,
  'original protected interval still remains after first early withdrawal');
 assert.equal(withdrawn.originalAttendantAwake,true);
 const death=await page.evaluate(()=>
  window.__PINEWOOD_CH1_RECOVERY_V140_QA__.triggerGenuineAttendantContact());
 assert.equal(death.state.dead,true,'original post-grace Attendant contact remains lethal');
 await page.locator('#deathRestartBtn').click();
 await page.waitForFunction(()=>{
  const s=window.__PINEWOOD_CH1_FIRST_PEEK_V147_QA__?.getState?.();
  return s?.chapter===1&&!s.revealed&&!s.diverted&&!s.extended&&
   s.diversionCount===0&&s.originalDecoyCount===0;
 },null,{timeout:540000,polling:500});
 const restarted=await page.evaluate(()=>({
  first:window.__PINEWOOD_CH1_FIRST_PEEK_V147_QA__.getState(),
  original:window.__PINEWOOD_CH1_STEALTH_V139_QA__.getState()
 }));
 assert.equal(restarted.original.pickups.length,2);
 assert.ok(restarted.original.pickups.every(p=>!p.collected),
  'restart restores both real source decoy pickups');
 const genuineFailures=failed.filter(s=>!s.includes('furniture_shop_loop.ogg net::ERR_ABORTED'));
 const report={realSourceE:realE.sourceCollected,initial:peek,diverted,
  landing,response,withdrawn,restarted,errors,remote,genuineFailures};
 await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
 assert.deepEqual(errors,[]);
 assert.deepEqual(remote,[]);
 assert.deepEqual(genuineFailures,[]);
 console.log('V147_REAL_FIRST_SIGHTING_DECOY_PASS '+JSON.stringify({
  originalRaycastE:realE.aim.targetReal,originalQ:true,
  sourceLanding:{x:landing.x,z:landing.z},realNavHearing:diverted.sourceNavMetres,
  actualTurnCount:diverted.turns,retreatedBeforeGrace:true,
  fullOriginalGraceSec:15,postGraceLethal:true,realRestartRestoresDecoys:true,
  errors,remote,genuineFailures
 }));
}finally{await browser.close();}
