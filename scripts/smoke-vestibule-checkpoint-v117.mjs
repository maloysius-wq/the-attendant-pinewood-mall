/** Genuine desktop software-WebGL screenshot evidence of V117 contractor checkpoint. */
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173',path='/review/mall-construction-v67/';
await mkdir('artifacts/v117-checkpoint',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+path,{waitUntil:'domcontentloaded'});
 try{
  await page.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.ready,null,{timeout:110000});
 }catch(e){
  console.log('V117_STARTUP_DIAGNOSTIC '+JSON.stringify({errors,failed,remote,
   state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.())}));
  throw e;
 }
 const state=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 const start=await state();
 assert.deepEqual(start.errors,[]);
 assert.equal(start.firstFrameFullyLoaded,true);
 assert.equal(start.storefrontCount,7,'keep original seven glass storefronts');
 assert.equal(start.closedBayCount,13,'keep thirteen newly sealed V116 suites');
 assert.equal(start.checkpointV117.cells,2,'two physically enclosed service rooms');
 assert.ok(Math.abs(start.checkpointV117.clearWidth-2.6)<.001,
  'actual contractor passage still 2.6m clear');
 assert.deepEqual(start.checkpointV117.window,
  {axis:'x',at:13.65,start:-33.25,end:-29,bottom:1.03,top:2.36});
 assert.equal(start.surveyLightOn,true);
 for(const shot of ['service','checkin','serviceTurn','aerial']){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(240);
  assert.deepEqual((await state()).errors,[],shot+' rendering errors');
  await page.screenshot({
   path:'artifacts/v117-checkpoint/'+shot+'.png',fullPage:true,
   timeout:90000,animations:'disabled'
  });
 }
 const final=await state();
 assert.equal(final.shot,'aerial');
 assert.deepEqual(errors,[],'no uncaught browser exceptions');
 assert.deepEqual(remote,[],'no off-origin textures, models or JavaScript');
 assert.deepEqual(failed,[],'all source-pinned GLB and textures must load');
 console.log('V117_CHECKPOINT_DESKTOP_PASS '+JSON.stringify({
  checkpoint:start.checkpointV117,chapter:start.chapter,
  storefronts:start.storefrontCount,closedBays:start.closedBayCount,
  loaded:start.firstFrameFullyLoaded,errors,remote
 }));
}finally{await browser.close()}
