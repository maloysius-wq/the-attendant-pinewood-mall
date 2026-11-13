import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173',out='artifacts/v115-storefronts';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],failed=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 page.on('request',r=>{
  if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());
 });
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 try{await page.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.ready,null,{timeout:45000});}
 catch(e){
  console.error('V115_STARTUP',JSON.stringify({
   errors,failed,remote,
   state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.())
  }));throw e;
 }
 const api=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 const initial=await api();
 assert.deepEqual(initial.errors,[],'real WebGL rendered without physical geometry errors');
 assert.equal(initial.storefrontCount,7,'all seven source-anchored shops must render in 3D');
 assert.ok(initial.storefrontNames.includes('CASSETTE CASTLE'));
 assert.ok(initial.storefrontNames.includes('VIDEO PLANET'));
 assert.ok(initial.storefrontNames.includes('FALLOW\'S'));
 assert.ok(initial.storefrontEntries.every(x=>x.entryWidth>=4.1&&x.windowSpan>0));
 assert.ok(initial.firstFrameFullyLoaded,'no fake empty-first-frame storefronts');
 for(const shot of ['atrium','west','east','aerial']){
  await page.evaluate(s=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(s),shot);
  await page.waitForTimeout(180);
  assert.equal((await api()).storefrontCount,7,shot+' retains seven stores');
  await page.screenshot({path:out+'/'+shot+'.png',fullPage:true});
 }
 await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(6));
 assert.equal((await api()).eastExitLocked,false);
 assert.deepEqual(errors,[]);
 assert.deepEqual(remote,[],'no external storefront assets');
 assert.deepEqual(failed,[],'no failed local asset loads');
 console.log('V115_REAL_DESKTOP_STOREFRONTS_PASS',JSON.stringify({names:initial.storefrontNames,errors,failed,remote}));
}finally{await browser.close();}
