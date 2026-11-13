import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173';
await mkdir('artifacts/v114-architecture',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist',
 '--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());});
 await page.goto(origin+'/review/mall-architecture-v114/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_ARCHITECTURE_V114__?.ready,null,{timeout:20000});
 for(const [level,area] of [['G',2797.5],['B1',1470],['M1',1439]]){
  await page.evaluate(l=>window.__PINEWOOD_ARCHITECTURE_V114__.selectFloor(l),level);
  const state=await page.evaluate(()=>window.__PINEWOOD_ARCHITECTURE_V114__.getState());
  assert.equal(state.level,level);
  assert.equal(state.unassignedArea,area,'exact unfinished area '+level);
  assert.ok(state.rooms>0);
  assert.ok(state.headerCount>0,'visible ordinary doorway headers '+level);
  assert.equal(await page.locator('#drawing svg g[data-room]').count(),state.rooms);
  await page.screenshot({path:'artifacts/v114-architecture/'+level+'-architecture.png',fullPage:true});
 }
 assert.deepEqual(errors,[],'no browser exceptions');
 assert.deepEqual(remote,[],'no off-origin requests');
 console.log('V114_ARCHITECTURE_MAP_PASS',JSON.stringify({errors,remote}));
}finally{await browser.close();}
