/** V139 source-authentic Chapter 1 cabinet, noise maker and safe reveal desktop. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v139-original-stealth';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(90000);
 const errors=[],remote=[],failed=[],consoleErrors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 try{
  await page.waitForFunction(()=>window.__PINEWOOD_CH1_V137_QA__?.getState?.().chapter===1&&
   !!window.__PINEWOOD_CH1_STEALTH_V139_QA__,null,{timeout:540000,polling:500});
 }catch(error){
  const state=await page.evaluate(()=>({
   loadText:document.getElementById('loadText')?.textContent,
   fill:document.getElementById('loadFill')?.style.width,
   v137:!!window.__PINEWOOD_CH1_V137_QA__,
   v139:!!window.__PINEWOOD_CH1_STEALTH_V139_QA__
  }));
  const report={error:String(error),state,errors,consoleErrors,failed,remote};
  await writeFile(folder+'/startup.json',JSON.stringify(report,null,2));
  console.error('V139_STARTUP '+JSON.stringify(report));
  throw error;
 }
 await page.evaluate(()=>{
  const button=document.getElementById('chapterStartBtn');
  if(!button?.onclick)throw Error('Original Begin Shift missing');
  button.click();
 });
 const qa=()=>page.evaluate(()=>window.__PINEWOOD_CH1_STEALTH_V139_QA__.getState());
 const initial=await qa();
 assert.equal(initial.cabinet.interactive,true);
 assert.deepEqual(initial.pickups.map(x=>x.label).sort(),['Noise Maker','Pager Decoy']);
 assert.ok(initial.pickups.every(x=>!x.collected));
 const viewed=await page.evaluate(()=>window.__PINEWOOD_CH1_STEALTH_V139_QA__.viewRealCabinetForTest());
 assert.equal(viewed.target,'cc0_fallow_display',
  'original 1440x900 first-person E raycast must reach genuine CC0 cabinet');
 await page.screenshot({path:folder+'/real-fallow-cabinet-before-hide.png',
  animations:'disabled',timeout:120000});
 const hidden=await page.evaluate(()=>window.__PINEWOOD_CH1_STEALTH_V139_QA__.enterRealCabinetForTest());
 assert.equal(hidden.playerHidden,true);
 assert.ok(Math.abs(hidden.cabinet.leftDoorY)<.001);
 const exited=await page.evaluate(()=>window.__PINEWOOD_CH1_STEALTH_V139_QA__.exitRealCabinetForTest());
 assert.equal(exited.playerHidden,false);
 assert.ok(Math.abs(exited.cabinet.rightDoorY)<.001);
 const picked=await page.evaluate(()=>window.__PINEWOOD_CH1_STEALTH_V139_QA__.collectRealNoiseMakerForTest());
 assert.equal(picked.decoys,1);assert.ok(picked.pickups.find(p=>p.label==='Noise Maker').collected);
 const thrown=await page.evaluate(()=>window.__PINEWOOD_CH1_STEALTH_V139_QA__.throwRealDecoyForTest());
 assert.equal(thrown.liveThrown,1);
 assert.equal(thrown.state.decoys,0);
 const activated=await page.evaluate(()=>{
  window.__PINEWOOD_CH1_STEALTH_V139_QA__.viewNorthGalleryForTest();
  window.__PINEWOOD_CH1_V137_QA__.operateNextActualCircuitForTest();
  return window.__PINEWOOD_CH1_STEALTH_V139_QA__.getState();
 });
 assert.equal(activated.revealed,false);
 assert.equal(activated.attendantVisible,false);
 const sighting=await page.evaluate(()=>window.__PINEWOOD_CH1_STEALTH_V139_QA__.revealFromActualSceneForTest());
 assert.equal(sighting.revealed,true,'real original floor must offer safe actual first LOS sighting');
 assert.equal(sighting.attendantState,'stalk');
 assert.equal(sighting.attendantVisible,true);
 const distance=Math.hypot(sighting.attendantPosition.x,sighting.attendantPosition.z+96);
 assert.ok(distance>=9&&distance<=14,'first Attendant must remain safely distant');
 assert.ok(sighting.graceUntil>sighting.revealAt+10);
 await page.screenshot({path:folder+'/real-distant-attendant-sighting.png',
  animations:'disabled',timeout:120000});
 const benignLocalAudioAbort=s=>/^http:\/\/127\.0\.0\.1:4173\/assets\/vendor\/runtime\/[a-f0-9]+\/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(s);
 const genuineFailures=failed.filter(s=>!benignLocalAudioAbort(s));
 assert.deepEqual(errors,[]);
 assert.deepEqual(remote,[]);
 assert.deepEqual(genuineFailures,[]);
 console.log('V139_REAL_CHAPTER1_STEALTH_PASS '+JSON.stringify({
  realLicensedCabinet:viewed.target,physicalDoorMeshes:true,
  pickups:initial.pickups.map(x=>x.label),hideAndExit:true,
  thrownRealDecoy:true,realFirstCircuit:true,
  revealDistanceMetres:distance,graceUntil:sighting.graceUntil,
  localOnly:true,errors,remote,genuineFailures,
  benignLocalAudioAborts:failed.filter(benignLocalAudioAbort).length
 }));
}finally{await browser.close();}
