import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

await mkdir('mall-v68-artifacts',{recursive:true});
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 for(const [device,width,height]of[['desktop',1440,900]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[],remote=[],consoleErrors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
  await page.goto(origin+'/review/mall-facade-v68/',{waitUntil:'domcontentloaded'});
  try{
   await page.waitForFunction(()=>window.__PINEWOOD_MALL_FACADE_V68__?.ready,null,{timeout:45000});
  }catch(e){
   console.error('MALL_V68_STARTUP',JSON.stringify({errors,remote,consoleErrors,body:(await page.locator('body').innerText()).slice(0,1600)}));throw e;
  }
  const state=()=>page.evaluate(()=>window.__PINEWOOD_MALL_FACADE_V68__.getState());
  const initial=await state();
  assert.deepEqual(initial.errors,[],device+' loaded cleanly');
  assert.equal(initial.firstFrameFullyLoaded,true,'facade ready before first frame');
  assert.equal(initial.signText,'PINEWOOD MALL');
  assert.equal(initial.entryBoarded,true);
  assert.equal(initial.serviceOpen,true);
  assert.ok(initial.facadeFeatures>=25,'architectural facade must have sign, boarded panels, braces, aging, door trims');
  assert.equal(initial.texturesLoaded,8);
  assert.ok(initial.modelsLoaded>=10);
  assert.ok(initial.walls>=140);
  for(const [shot,floor]of[['frontage','G'],['boarded','G'],['service','G'],['atrium','G'],['exit','G'],['aerial','G']]){
   await page.evaluate(shot=>window.__PINEWOOD_MALL_FACADE_V68__.goto(shot),shot);
   const q=await state();
   assert.equal(q.floor,floor,shot+' floor');
   assert.equal(q.signText,'PINEWOOD MALL',shot+' sign');
   assert.deepEqual(q.errors,[],shot+' runtime errors');
   if(shot!=='aerial')await page.screenshot({path:'mall-v68-artifacts/'+device+'-'+shot+'.png',fullPage:true});
   console.log('MALL_V68_SHOT '+device+' '+shot);
  }
  await page.evaluate(()=>window.__PINEWOOD_MALL_FACADE_V68__.setChapter(5));
  assert.equal((await state()).eastExitLocked,true);
  await page.evaluate(()=>window.__PINEWOOD_MALL_FACADE_V68__.setChapter(6));
  assert.equal((await state()).eastExitLocked,false);
  assert.deepEqual(remote,[],device+' same-origin runtime');
  assert.deepEqual(errors,[],device+' browser page errors');
  assert.deepEqual(consoleErrors,[],device+' browser console errors');
  await writeFile('mall-v68-artifacts/'+device+'-audit.json',JSON.stringify({initial,final:await state(),errors,remote},null,2));
  console.log('MALL_V68_'+device.toUpperCase()+'_PASS '+JSON.stringify({facadeFeatures:initial.facadeFeatures,walls:initial.walls,remote:remote.length}));
  await page.close();
 }
}finally{await browser.close();}
