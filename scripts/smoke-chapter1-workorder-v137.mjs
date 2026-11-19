/** V137: deterministic desktop Chapter 1 real-object progression smoke; no WASD. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',dir='artifacts/v137-ch1-workorder';
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
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 try{
  await page.waitForFunction(()=>window.__PINEWOOD_CH1_V137_QA__?.getState?.().chapter===1,
   null,{timeout:540000,polling:500});
 }catch(error){
  const state=await page.evaluate(()=>({
   assetStatus:document.getElementById('assetStatus')?.textContent,
   loadText:document.getElementById('loadText')?.textContent,
   loadFill:document.getElementById('loadFill')?.style.width,
   bridge:!!window.__PINEWOOD_V70_BRIDGE__,
   v137:!!window.__PINEWOOD_CH1_V137_QA__,
   menu:document.getElementById('menu')?.className
  })).catch(e=>({diagnosticError:String(e)}));
  const diagnostic={error:String(error),state,errors,remote,failed};
  await writeFile(dir+'/startup-diagnostics.json',JSON.stringify(diagnostic,null,2));
  console.error('V137_GAME_START_DIAGNOSTICS '+JSON.stringify(diagnostic));
  throw error;
 }
 await page.evaluate(()=>{
  const button=document.getElementById('chapterStartBtn');
  if(!button?.onclick)throw Error('Original Begin Shift handler missing');
  button.click();
 });
 const sample=await page.evaluate(()=>{
  const qa=window.__PINEWOOD_CH1_V137_QA__;
  const state=()=>({data:qa.getState(),
   hud:document.getElementById('objective')?.textContent,
   inventory:document.getElementById('inventory')?.textContent});
  const initial=state();
  const one=qa.operateNextActualCircuitForTest();
  const two=qa.operateNextActualCircuitForTest();
  const three=qa.operateNextActualCircuitForTest();
  const blocked=qa.attemptActualFreightForTest();
  const key=qa.collectActualServiceKeyForTest();
  const afterKey=state();
  const accepted=qa.attemptActualFreightForTest();
  return {initial,one,two,three,blocked,key,afterKey,accepted};
 });
 assert.equal(sample.initial.data.stage,'circuits');
 assert.match(sample.initial.hud,/Restore emergency circuits A/);
 assert.deepEqual([sample.one.current,sample.two.current,sample.three.current],[1,2,3]);
 assert.equal(sample.three.stage,'service_key');
 assert.equal(sample.blocked.result,false,'power must not bypass key');
 assert.equal(sample.blocked.deniedAttempts,1);
 assert.equal(sample.key.keyRecovered,true,'real Master Service Key was picked up');
 assert.equal(sample.afterKey.data.stage,'freight_exit');
 assert.match(sample.afterKey.hud,/Call the east freight elevator/);
 assert.match(sample.afterKey.inventory,/SERVICE KEY VERIFIED/);
 assert.equal(sample.accepted.result,true,'real elevator must start after both requirements');
 assert.ok(['elevator_opening','elevator_board','elevator_descent'].includes(sample.accepted.stage));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failed,[]);
 await page.screenshot({path:dir+'/chapter1-real-workorder.png',animations:'disabled',timeout:120000});
 console.log('V137_REAL_CHAPTER1_PASS '+JSON.stringify({
  stages:[sample.initial.data.stage,sample.one.stage,sample.two.stage,sample.three.stage,
   sample.key.stage,sample.accepted.stage],realBreakers:3,realKey:true,
  exitBlockedBeforeKey:true,errors,remote,failed
 }));
}finally{await browser.close();}
