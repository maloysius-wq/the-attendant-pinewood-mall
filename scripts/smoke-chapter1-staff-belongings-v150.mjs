/** V150 actual 1440x900 Chapter 1: original furniture-backed human artifacts and restart.
 * Uses full source Game and real 1997 shop scenes. No private Builder or manual WASD.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',dir='artifacts/v150-original-staff-belongings';
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
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{
  waitUntil:'domcontentloaded'
 });
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 try{
  await page.waitForFunction(()=>!!window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__&&
   !!window.__PINEWOOD_CH1_RECOVERY_V140_QA__&&
   !!window.__PINEWOOD_CH1_STEALTH_V139_QA__&&
   !!window.__PINEWOOD_CH1_RESTART_V148_QA__,
   null,{timeout:240000,polling:500});
 }catch(error){
  const state=await page.evaluate(()=>({
   text:document.getElementById('loadText')?.textContent,
   fill:document.getElementById('loadFill')?.style.width,
   hasV150:!!window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__,
   hasV139:!!window.__PINEWOOD_CH1_STEALTH_V139_QA__
  }));
  const info={state,error:String(error),errors,failed,remote};
  await writeFile(dir+'/startup-error.json',JSON.stringify(info,null,2));
  console.error('V150_ORIGINAL_STARTUP_DIAGNOSTICS '+JSON.stringify(info));
  throw error;
 }
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const qa=()=>page.evaluate(()=>window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__.getState());
 const initial=await qa();
 const items=initial.physicalBelongings;
 assert.equal(initial.chapter,1);
 assert.equal(items.length,3,'all three real source supports have textured human belongings');
 assert.deepEqual(items.map(x=>x.person),['Jo Alvarez','Tessa Kim','Luis Ortega']);
 assert.deepEqual(items.map(x=>x.originalFixture),['food_table_4','cassette_counter','video_counter']);
 assert.equal(initial.addedCollectibles,0);
 assert.equal(initial.addedColliders,0);
 assert.equal(initial.lsEvidenceIdsChanged,false);
 for(const item of items){
  assert.equal(item.modelIsVisible,true);
  assert.equal(item.physicallySupported,true);
  assert.equal(item.attached,true);
  assert.equal(item.paperSurfaceTexture,true);
  assert.ok(item.originalFixtureSource.startsWith('assets/vendor/runtime/'));
  assert.ok(item.originalApproachSteps>0);
  assert.ok(Math.abs(item.aboveOriginalSurface-.008)<.002,
   'story object must be on measured local CC0 furniture rather than floating');
 }
 const views=[];
 for(const item of items){
  const viewed=await page.evaluate(id=>window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__
   .viewOriginalBelongingForTest(id),item.id);
  assert.equal(viewed.site,item.id);
  assert.equal(viewed.originalRoom,item.room,'real viewer remains in original authored room');
  assert.equal(viewed.actualRayIntersection,true,'player must physically see actual model/texture');
  assert.ok(viewed.viewingDistance<3.7,'no distant inaccessible text props');
  views.push({id:item.id,person:item.person,room:item.room,
   rayHit:viewed.hitObject,viewingDistance:viewed.viewingDistance});
  await page.screenshot({path:dir+'/'+item.id+'-original-first-person.png',
   animations:'disabled',timeout:120000});
 }
 const original=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__.getState());
 assert.equal(original.running,true);
 assert.equal(original.realCabinet.interactive,true);
 assert.deepEqual(original.realPickups.map(x=>x.label).sort(),['Noise Maker','Pager Decoy']);
 const activated=await page.evaluate(()=>{
  const stealth=window.__PINEWOOD_CH1_STEALTH_V139_QA__;
  stealth.viewNorthGalleryForTest();
  window.__PINEWOOD_CH1_V137_QA__.operateNextActualCircuitForTest();
  return stealth.revealFromActualSceneForTest();
 });
 assert.equal(activated.revealed,true);
 const fatal=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__
  .triggerGenuineAttendantContact());
 assert.equal(fatal.los,true);
 assert.equal(fatal.state.dead,true,'original lethal Attendant source collision preserved');
 await page.waitForFunction(()=>document.getElementById('deathScreen')?.classList.contains('show'),
  null,{timeout:12000});
 // Genuine source button retains the original Game.startChapter reset order:
 // world.clear -> resetState (dispose only) -> new scene -> V150 bind.
 await page.evaluate(()=>document.getElementById('deathRestartBtn').click());
 try{
  await page.waitForFunction(()=>{
   const a=window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__?.getState?.();
   const v=window.__PINEWOOD_CH1_RECOVERY_V140_QA__?.getState?.();
   const stage=window.__PINEWOOD_CH1_RESTART_V148_QA__?.getState?.()?.stage;
   return a?.chapter===1&&a.physicalBelongings.length===3&&
    a.physicalBelongings.every(p=>p.attached&&p.physicallySupported)&&
    !v?.dead&&!v?.running&&v?.realCabinet.interactive&&
    v?.realPickups.length===2&&v?.realPickups.every(p=>!p.collected)&&
    stage?.attempt===1&&stage?.active===false&&stage?.chapterScreen===true;
  },null,{timeout:540000,polling:500});
 }catch(error){
  const info=await page.evaluate(()=>({
   restart:window.__PINEWOOD_CH1_RESTART_V148_QA__?.getState?.(),
   belongings:window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__?.getState?.(),
   fill:document.getElementById('loadFill')?.style.width,
   loadText:document.getElementById('loadText')?.textContent
  }));
  await writeFile(dir+'/restart-error.json',JSON.stringify({error:String(error),info,errors,failed,remote},null,2));
  throw error;
 }
 const restored=await qa();
 assert.deepEqual(restored.physicalBelongings.map(p=>p.id),items.map(p=>p.id),
  'restart must recreate each real paper exactly once');
 assert.equal(restored.addedColliders,0);
 assert.equal(restored.addedCollectibles,0);
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const running=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__.getState());
 assert.equal(running.running,true);
 assert.equal(running.dead,false);
 assert.equal(running.breakers,0);
 assert.equal(running.attendantState,'dormant');
 const failures=failed.filter(x=>!x.includes('furniture_shop_loop.ogg net::ERR_ABORTED'));
 const report={originalChapter1:true,initial,views,
  realGenuineDeath:true,realRestartWithAllThree:true,restored,running,
  errors,remote,failures};
 await writeFile(dir+'/source-report.json',JSON.stringify(report,null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failures,[]);
 console.log('V150_REAL_ORIGINAL_STAFF_BELONGINGS_PASS '+JSON.stringify({
  supportCount:items.length,roomNames:views.map(x=>x.room),
  realPlayerRayIntersections:views.map(x=>x.rayHit),
  allMeasuredSupportY:items.map(x=>({name:x.id,height:x.actualSupportTopY,
   offset:x.aboveOriginalSurface})),
  originalAttendantDeath:true,genuineRestartAndRebind:true,
  originalPickupCount:running.realPickups.length,
  originalCabinetInteractive:running.realCabinet.interactive,
  runningAfterRestart:running.running,errors,remote,failures
 }));
}finally{await browser.close();}
