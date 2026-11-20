/** Original 1440x900 actual first-person E interaction with A/B/C on source masonry. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v141-source-wall-panels';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(90000);
 const errors=[],failed=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',
  {waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 try{
  await page.waitForFunction(()=>
   !!window.__PINEWOOD_CH1_WALL_PANELS_V141_QA__&&
   !!window.__PINEWOOD_CH1_V137_QA__&&
   !!window.__PINEWOOD_CH1_LIGHTS_V138_QA__,
   null,{timeout:540000,polling:500});
 }catch(error){
  const state=await page.evaluate(()=>({
   loading:document.getElementById('loadText')?.textContent,
   fill:document.getElementById('loadFill')?.style.width,
   panelQA:!!window.__PINEWOOD_CH1_WALL_PANELS_V141_QA__,
   workQA:!!window.__PINEWOOD_CH1_V137_QA__,
   lightQA:!!window.__PINEWOOD_CH1_LIGHTS_V138_QA__}));
  const report={error:String(error),state,errors,remote,failed};
  await writeFile(folder+'/startup-diagnostics.json',JSON.stringify(report,null,2));
  console.error('V141_STARTUP '+JSON.stringify(report));
  throw error;
 }
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const initial=await page.evaluate(()=>window.__PINEWOOD_CH1_WALL_PANELS_V141_QA__.getState());
 assert.equal(initial.panels.length,3);
 assert.equal(initial.shellBound,true);
 assert.ok(initial.panels.every(p=>p.mounted&&!p.on&&p.sceneParent));
 assert.deepEqual(initial.panels.map(p=>p.room),
  ['central_gallery','west_gallery','freight_lobby']);
 const results=[];
 for(const id of ['A','B','C']){
  const view=await page.evaluate(id=>
    window.__PINEWOOD_CH1_WALL_PANELS_V141_QA__.viewRealPanel(id),id);
  assert.equal(view.realPanel,true,
   'original first-person E did not select wall-mounted panel '+id+': '+JSON.stringify(view));
  assert.equal(view.targetId,id);
  assert.equal(view.actualType,'breaker');
  assert.equal(view.hasLOS,true,'real wall blocks panel front '+id);
  assert.ok(view.hits.some(h=>h.distance<2.45),
   'real source mesh outside original E reach '+id);
  await page.screenshot({path:folder+'/source-wall-mounted-panel-'+id+'.png',
   animations:'disabled',timeout:120000});
  const done=await page.evaluate(id=>
    window.__PINEWOOD_CH1_WALL_PANELS_V141_QA__.useVisibleRealPanel(id),id);
  assert.equal(done.breakers,results.length+1);
  assert.equal(done.on,true);
  results.push({id,wall:view.wall,world:view.sourcePosition,
   rayHits:view.hits.slice(0,2),camera:view.camera});
 }
 const powered=await page.evaluate(()=>window.__PINEWOOD_CH1_LIGHTS_V138_QA__.getState());
 assert.deepEqual(powered.active,['A','B','C']);
 const final=await page.evaluate(()=>{
  const key=window.__PINEWOOD_CH1_V137_QA__.collectActualServiceKeyForTest();
  return {key,exit:window.__PINEWOOD_CH1_V137_QA__.attemptActualFreightForTest()};
 });
 assert.equal(final.key.keyRecovered,true);
 assert.equal(final.key.current,3);
 assert.equal(final.exit.ready,true);
 assert.equal(final.exit.result,true,'original freight must remain accessible');
 const genuineFailures=failed.filter(x=>!x.includes('furniture_shop_loop.ogg net::ERR_ABORTED'));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(genuineFailures,[]);
 console.log('V141_REAL_WALL_PANELS_PASS '+JSON.stringify({
  results,realThreeERaycasts:true,powered:powered.active,
  keyRecovered:true,originalFreightStillAvailable:true,errors,remote,genuineFailures,
  benignAudioAborts:failed.length-genuineFailures.length
 }));
}finally{await browser.close();}
