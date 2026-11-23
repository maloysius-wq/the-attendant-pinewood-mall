/** V148 real 1440x900 Chapter 1 death->Restart Chapter diagnostic.
 * Probes original Game.startChapter, clear, resetState and buildGeometry stages.
 * No WASD, mock arena, stale bridge or fabricated geometry.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const root='http://127.0.0.1:4173',dir='artifacts/v148-real-original-restart';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(95000);
 const errors=[],failed=[],remote=[],snapshots=[];
 page.on('pageerror',error=>{errors.push(error.message);console.error('V148_PAGE_ERROR '+error.message);});
 page.on('requestfailed',q=>failed.push(q.url()+' '+q.failure()?.errorText));
 page.on('request',q=>{if(/^https?:/.test(q.url())&&!q.url().startsWith(root))remote.push(q.url());});
 await page.goto(root+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>!!window.__PINEWOOD_CH1_RESTART_V148_QA__&&
  !!window.__PINEWOOD_CH1_RECOVERY_V140_QA__&&
  !!window.__PINEWOOD_CH1_STEALTH_V139_QA__,null,
  {timeout:540000,polling:500});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const before=await page.evaluate(()=>window.__PINEWOOD_CH1_RESTART_V148_QA__.getState());
 assert.equal(before.running,true);
 assert.equal(before.first.revealed,false);
 assert.equal(before.recovery.realPickups.length,2,'real source decoys');
 const breaker=await page.evaluate(()=>{
  window.__PINEWOOD_CH1_STEALTH_V139_QA__.viewNorthGalleryForTest();
  window.__PINEWOOD_CH1_V137_QA__.operateNextActualCircuitForTest();
  return window.__PINEWOOD_CH1_STEALTH_V139_QA__.revealFromActualSceneForTest();
 });
 assert.equal(breaker.revealed,true);
 const death=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__
  .triggerGenuineAttendantContact());
 assert.equal(death.state.dead,true,'real first-person Attendant collision');
 await page.waitForFunction(()=>document.getElementById('deathScreen')?.classList.contains('show'),
  null,{timeout:12000});
 const atClick=Date.now();
 await page.locator('#deathRestartBtn').click();
 const get=()=>page.evaluate(()=>window.__PINEWOOD_CH1_RESTART_V148_QA__?.getState?.());
 let restored=null;
 // Very bounded original restart probe. Preserve ALL intermediate states even
 // when original asset/scene rebuild is too slow or silently rejects.
 for(let i=0;i<22;i++){
  await page.waitForTimeout(i===0?750:5500);
  let snapshot;
  try{snapshot=await get();}
  catch(error){snapshot={error:String(error),sample:i};}
  snapshots.push({sinceClickMs:Date.now()-atClick,...snapshot});
  const s=snapshot.stage||{};
  console.log('V148_RESTART_STAGE '+JSON.stringify({
   sinceClickMs:Date.now()-atClick,attempt:s.attempt,active:s.active,
   latestEvent:snapshot.events?.at(-1),
   loadFill:s.loadFill,loading:s.loadingScreen,
   chapterScreen:s.chapterScreen,dead:snapshot.dead,running:snapshot.running,
   colliderCount:snapshot.worldColliders,
   pickups:snapshot.realPickupLabels,firstRevealed:snapshot.first?.revealed,
   v147Diverted:snapshot.first?.diverted,error:snapshot.error
  }));
  if(s.chapterScreen&&!snapshot.dead&&!snapshot.running&&
    snapshot.worldInteractables>0&&snapshot.recovery.realCabinet.interactive&&
    snapshot.realPickupLabels.length===2&&snapshot.realPickupLabels.every(p=>p.attached&&!p.collected)&&
    !snapshot.first.revealed&&!snapshot.first.diverted){
   restored=snapshot;break;
  }
  if(s.active===false&&s.attempt>0&&!s.chapterScreen)break;
 }
 const initialRestart=snapshots[0]||null,last=snapshots.at(-1)||null;
 const report={originalSourceDeath:true,initialChapter:before.chapter,
  initialRealPickupCount:before.recovery.realPickups.length,
  atClick,restartDurationMs:Date.now()-atClick,restored:!!restored,
  initialRestart,final:last,snapshots,errors,remote,failed};
 await writeFile(dir+'/restart-stages.json',JSON.stringify(report,null,2));
 if(!restored)throw Error('V148 original restart did not reach genuine clean Chapter 1 within bounded stages; last='+JSON.stringify(last).slice(0,7000));
 const button=await page.evaluate(()=>{
  const el=document.getElementById('chapterStartBtn');
  return {text:el?.textContent,onclick:typeof el?.onclick,
   visible:document.getElementById('chapterScreen')?.classList.contains('show')};
 });
 console.log('V148_ORIGINAL_START_BUTTON '+JSON.stringify(button));
 assert.equal(button.text,'Begin Shift');
 assert.equal(button.onclick,'function','original source beginPlay button must be rebound');
 assert.equal(button.visible,true);
 // Use original DOM click from the established V140 real desktop smoke:
 // Playwright locator.click() can run after renderer/pointer lock changes,
 // while a direct click on the ACTUAL original DOM element activates its
 // existing onclick without any mock or bypass of real Game.beginPlay.
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const playing=await get();
 console.log('V148_AFTER_REAL_BEGIN '+JSON.stringify({
  running:playing.running,dead:playing.dead,modal:playing.modal,
  chapter:playing.chapter,screen:playing.stage,events:playing.events.at(-3)
 }));
 assert.equal(playing.running,true,'genuine Begin Shift did not resume original Game');
 assert.equal(playing.chapter,1);
 assert.equal(playing.recovery.breakers,0);
 assert.equal(playing.recovery.decoys,0);
 assert.equal(playing.recovery.realPickups.length,2);
 assert.equal(playing.first.revealed,false);
 assert.equal(playing.first.diversionCount,0);
 assert.equal(playing.first.extended,false);
 assert.equal(playing.stage.active,false);
 assert.deepEqual(errors,[]);
 assert.deepEqual(remote,[]);
 const genuineFailures=failed.filter(x=>!x.includes('furniture_shop_loop.ogg net::ERR_ABORTED'));
 assert.deepEqual(genuineFailures,[]);
 console.log('V148_GENUINE_ORIGINAL_RESTART_PASS '+JSON.stringify({
  restartDurationMs:Date.now()-atClick,
  stages:playing.events.map(e=>e.stage),
  restoredSourceDecoys:playing.realPickupLabels,
  fullOriginalWorldColliders:playing.worldColliders,
  chapterScreenBeforeBegin:true,
  originalStartButtonBeginsPlay:true,
  realDeathBeforeRestart:true,
  originalAttendantState:playing.recovery.attendantState,
  errors,remote,genuineFailures
 }));
}finally{await browser.close();}
