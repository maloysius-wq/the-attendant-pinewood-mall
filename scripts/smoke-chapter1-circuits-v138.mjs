/** V138 real desktop original-mall light/Chapter 1 circuit smoke.
 * Operates the existing authored breaker interactables; no WASD or mobile.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v138-original-power';
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
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 try{
  await page.waitForFunction(()=>!!window.__PINEWOOD_CH1_LIGHTS_V138_QA__&&
   window.__PINEWOOD_CH1_V137_QA__?.getState?.().chapter===1,
   null,{timeout:125000});
 }catch(error){
  // Never consume four more minutes on a blank screen without reporting what
  // the actual production loader displayed and which original hooks mounted.
  const state=await page.evaluate(()=>({
   url:location.href,readyState:document.readyState,
   assetStatus:document.getElementById('assetStatus')?.textContent,
   loadText:document.getElementById('loadText')?.textContent,
   loadFill:document.getElementById('loadFill')?.style.width,
   chapterStartVisible:!!document.getElementById('chapterStartBtn')?.onclick,
   bridge:!!window.__PINEWOOD_V70_BRIDGE__,
   v112:!!window.__PINEWOOD_V112_QA__,
   v137:window.__PINEWOOD_CH1_V137_QA__?.getState?.()||null,
   v138:window.__PINEWOOD_CH1_LIGHTS_V138_QA__?.getState?.()||null,
   menu:document.getElementById('menu')?.className
  })).catch(e=>({diagnosticError:String(e)}));
  const report={error:String(error),state,errors,consoleErrors,failed,remote};
  await writeFile(folder+'/startup-diagnostics.json',JSON.stringify(report,null,2));
  console.error('V138_REAL_GAME_START_DIAGNOSTICS '+JSON.stringify(report));
  throw error;
 }
 await page.evaluate(()=>{
  const button=document.getElementById('chapterStartBtn');
  if(!button?.onclick)throw Error('Real Begin Shift not available');
  button.click();
  const move=window.__PINEWOOD_V112_QA__?.setPositionForTest;
  if(typeof move!=='function')throw Error('Local-only exact source camera setter missing');
  move(0,-96); // Clear central public corridor under the original A circuit luminaires
 });
 const before=await page.evaluate(()=>window.__PINEWOOD_CH1_LIGHTS_V138_QA__.getState());
 assert.deepEqual(before.active,[]);
 for(const id of ['A','B','C']){
  assert.ok(before.sources[id].some(x=>x.kind==='light'));
  assert.ok(before.sources[id].every(x=>Math.abs(x.current-x.original*.16)<.00001));
 }
 await page.screenshot({path:folder+'/chapter1-before-power.png',timeout:120000,
  animations:'disabled'});
 const sequence=await page.evaluate(()=>{
  const qa=window.__PINEWOOD_CH1_V137_QA__,lit=window.__PINEWOOD_CH1_LIGHTS_V138_QA__;
  const stages=[];
  for(let i=0;i<3;i++){
   const breaker=qa.operateNextActualCircuitForTest();
   stages.push({breaker,lighting:lit.getState()});
  }
  return stages;
 });
 assert.deepEqual(sequence.map(x=>x.breaker.current),[1,2,3]);
 assert.deepEqual(sequence[2].lighting.active,['A','B','C']);
 for(let i=0;i<3;i++){
  const snap=sequence[i].lighting;
  assert.equal(snap.active.length,i+1);
  for(const id of ['A','B','C'])for(const element of snap.sources[id]){
   const expected=element.original*(snap.active.includes(id)?(element.kind==='light'?4.5:1):.16);
   assert.ok(Math.abs(expected-element.current)<.00001,
    'original architectural '+id+' '+element.kind+' did not follow real breaker');
  }
 }
 await page.screenshot({path:folder+'/chapter1-all-three-powered.png',timeout:120000,
  animations:'disabled'});
 // Chromium may cancel a LOCAL ambient loop on play/pause or audio-rerouting.
 // Only the explicit, pinned runtime OGG request aborted by the browser is
 // benign. Preserve strict page errors, remote URL and every other asset failure.
 const benignLocalAudioAbort=s=>/^http:\/\/127\.0\.0\.1:4173\/assets\/vendor\/runtime\/[a-f0-9]+\/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(s);
 const genuineFailures=failed.filter(s=>!benignLocalAudioAbort(s));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(genuineFailures,[],
  'Missing source media or non-benign requests must still fail');
 console.log('V138_REAL_ARCHITECTURAL_LIGHTS_PASS '+JSON.stringify({
  originalLights:Object.fromEntries(Object.entries(before.sources).map(([k,v])=>[k,v.length])),
  enabledInOrder:sequence.map(x=>x.lighting.active),
  localOnly:true,errors,remote,benignLocalAudioAborts:failed.filter(benignLocalAudioAbort).length,genuineFailures
 }));
}finally{await browser.close();}
