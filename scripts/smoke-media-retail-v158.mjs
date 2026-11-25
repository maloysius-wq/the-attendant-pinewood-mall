/** Verify both media shops in the actual published full assembly, not a
 * showroom-only isolated fixture. Original native E is covered separately.
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/v158-media-retail',origin='http://127.0.0.1:4173';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const errors=[],failed=[],remote=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin+'/'))remote.push(r.url());});
 await page.goto(origin+'/review/mall-construction-v67/?retailAudit=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{const api=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;return api&&(api.ready||api.getState().errors.length>0);},null,{timeout:540000});
 const state=await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 assert.equal(state.ready,true,JSON.stringify(state.errors));
 assert.equal(state.retailAudit.source.source,'published');
 const records=state.retailAudit.fixtures.filter(f=>f.sourceManifest?.mediaShelf).map(f=>({id:f.id,room:f.room,layer:f.layer,source:f.source,...f.sourceManifest.mediaShelf}));
 console.log('V158_MEDIA_GEOMETRY '+JSON.stringify(records));
 assert.equal(records.length,27,'7+13 new and 4+3 inherited media shelves');
 assert.ok(records.every(f=>f.products>0&&f.supportRows.length>0&&!f.omitted),'actual source surfaces must support every stocked rack');
 for(const f of records){
  assert.ok(f.supportRows.length>=(f.id==='cassette_browse_low'?1:2),f.id+' missing real shelf surfaces');
  assert.ok(f.measuredFront.length===2&&Math.hypot(...f.measuredFront)===1);
  assert.ok(f.sourceDimensions[1]>.9&&f.sourceDimensions[1]<2.3);
 }
 for(const name of ['cassetteInside','cassetteCounter','cassetteRear','cassettePlan','videoInside','videoCounter','videoRear','videoPlan']){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(n),name);
  await page.screenshot({path:dir+'/'+name+'.png',timeout:120000,animations:'disabled'});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(remote,[]);
 await writeFile(dir+'/measurements.json',JSON.stringify(records,null,2));
 console.log('V158_ACTUAL_MEDIA_PASS '+JSON.stringify({shelves:records.length,products:records.reduce((n,x)=>n+x.products,0),errors,failed,remote}));
}finally{await browser.close()}
