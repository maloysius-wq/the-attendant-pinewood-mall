/** V140 original-playable Chapter 1 fair pursuit / real death / restart smoke.
 * Automated 1440×900 Chromium only, no manual WASD or private Builder writes.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/v140-real-recovery',origin='http://127.0.0.1:4173';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(90000);
 const errors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 try{
  await page.waitForFunction(()=>!!window.__PINEWOOD_CH1_RECOVERY_V140_QA__&&
   !!window.__PINEWOOD_CH1_STEALTH_V139_QA__&&
   window.__PINEWOOD_CH1_V137_QA__?.getState?.().chapter===1,
   null,{timeout:540000,polling:500});
 }catch(error){
  const state=await page.evaluate(()=>({
   loadText:document.getElementById('loadText')?.textContent,
   loadFill:document.getElementById('loadFill')?.style.width,
   v139:!!window.__PINEWOOD_CH1_STEALTH_V139_QA__,
   v140:!!window.__PINEWOOD_CH1_RECOVERY_V140_QA__}));
  const report={state,error:String(error),errors,remote,failed};
  await writeFile(dir+'/load-diagnostics.json',JSON.stringify(report,null,2));
  console.error('V140_LOAD '+JSON.stringify(report));throw error;
 }
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const initial=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__.getState());
 assert.equal(initial.chapter,1);assert.equal(initial.running,true);
 assert.equal(initial.realCabinet.interactive,true);
 assert.deepEqual(initial.realPickups.map(p=>p.label).sort(),['Noise Maker','Pager Decoy']);
 const breaker=await page.evaluate(()=>{
  window.__PINEWOOD_CH1_STEALTH_V139_QA__.viewNorthGalleryForTest();
  window.__PINEWOOD_CH1_V137_QA__.operateNextActualCircuitForTest();
  return window.__PINEWOOD_CH1_RECOVERY_V140_QA__.getState();
 });
 assert.equal(breaker.breakers,1);
 const sight=await page.evaluate(()=>window.__PINEWOOD_CH1_STEALTH_V139_QA__.revealFromActualSceneForTest());
 assert.equal(sight.revealed,true);
 const lost=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__.testBrokenSightFromRealFallowRoom());
 assert.equal(lost.los,false,'actual Fallow source wall must interrupt original world LOS');
 assert.equal(lost.seen,false,'authored Attendant has actually lost sight');
 assert.equal(lost.lostPlayerPathsDelta,1,'original hunt must route to remembered site, NOT moving player');
 assert.deepEqual(lost.pathEnd,lost.expectedLastHeard,
  'original astar path must terminate at actual last seen/heard gallery cell');
 const wall=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__.testBlockedWallContact());
 assert.equal(wall.dead,false,'contact through original 1979 walls must not kill');
 if(wall.test)assert.equal(wall.blocked,1);
 const search=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__.testRealSearchCooldown());
 assert.equal(search.attendantState,'dormant');
 assert.ok(search.nextStalk>=12,'original search must provide a real 12s recovery respite');
 assert.equal(search.searchCooldowns,1);
 const fatal=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__.triggerGenuineAttendantContact());
 assert.equal(fatal.los,true,'real open gallery should allow actual contact');
 assert.equal(fatal.state.dead,true,'original Attendant collision must still be genuinely lethal');
 assert.equal(fatal.state.running,false);
 await page.waitForTimeout(800);
 assert.equal(await page.locator('#deathCopy').textContent(),
  'The Attendant reached you. Pinewood has converted you to store property.');
 await page.screenshot({path:dir+'/original-attendant-death.png',timeout:120000,animations:'disabled'});
 await page.locator('#deathRestartBtn').click();
 await page.waitForFunction(()=>{
  const a=window.__PINEWOOD_CH1_RECOVERY_V140_QA__?.getState?.();
  return a?.chapter===1&&!a.dead&&!a.running&&a.breakers===0&&a.decoys===0&&
   a.realCabinet?.interactive===true&&a.realPickups.length===2&&
   a.realPickups.every(p=>!p.collected)&&a.searchCooldowns===0&&a.lostPlayerPaths===0;
 },null,{timeout:540000,polling:500});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const restored=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__.getState());
 assert.equal(restored.running,true);assert.equal(restored.dead,false);
 assert.equal(restored.breakers,0);
 assert.equal(restored.attendantState,'dormant');
 await page.screenshot({path:dir+'/original-chapter1-restarted.png',timeout:120000,animations:'disabled'});
 const genuineFailures=failed.filter(x=>!x.includes('furniture_shop_loop.ogg net::ERR_ABORTED'));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(genuineFailures,[]);
 const pass={realWallBreaksTracking:true,lastHeardPath:lost.pathEnd,
  realWallContactBlock:wall.test?wall.blocked:'no sampled cross-wall contact',
  searchCooldownSeconds:search.nextStalk,
  genuineAttendantDeath:true,realRestartRestoresCabinetAndDecoys:true,
  localOnly:true,errors,remote,genuineFailures,
  benignAudioAborts:failed.length-genuineFailures.length};
 console.log('V140_REAL_ORIGINAL_RECOVERY_PASS '+JSON.stringify(pass));
}finally{await browser.close();}
