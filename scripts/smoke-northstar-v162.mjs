/** V162 Northstar review actual published V111 assembly, not a mockup or private draft. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/v162-northstar',origin='http://127.0.0.1:4173';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const errors=[],remote=[],failed=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin+'/'))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/?retailAudit=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.ready||window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState()?.errors.length,null,{timeout:540000,polling:500});
 const state=await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 await writeFile(dir+'/actual-assembled-telemetry.json',JSON.stringify(state,null,2));
 assert.equal(state.ready,true,state.errors.join(' | '));assert.deepEqual(state.errors,[]);
 assert.equal(state.retailAudit.source.source,'published');assert.equal(state.retailAudit.source.added,0);
 const west=state.anchorRetailV121.filter(f=>f.room==='west_anchor');
 assert.equal(west.length,36);assert.equal(west.reduce((n,f)=>n+f.fallowCartonsV160.cartons,0),769);
 assert.equal(state.sunburstFixtureCountV126,43);
 const east=state.anchorRetailV121.filter(f=>f.room==='east_original_anchor');assert.equal(east.length,34);assert.equal(east.reduce((n,f)=>n+f.eastStockV161.cartons,0),427,'verified East unchanged');
 const annex=state.annexAnchorV128,fixtures=annex.fixtures,report=fixtures.map(f=>f.northstarStockV162).filter(Boolean);
 const count=report.reduce((n,f)=>n+f.cartons,0);
 assert.equal(fixtures.length,73);assert.equal(report.length,72);
 assert.ok(report.filter(r=>r.fixtureType==='wall_cubbies').every(r=>r.cartons>=4));
 assert.ok(report.filter(r=>r.fixtureType==='gondola').every(r=>r.stockedFaces===2&&r.cartons>=4));
 assert.ok(report.filter(r=>r.fixtureType==='table_large').every(r=>r.cartons>=12));
 assert.ok(report.every(r=>r.slots.length===r.cartons&&r.slots.every(s=>Number.isFinite(s.supportY))));
 assert.ok(count>=900&&new Set(report.flatMap(r=>r.slots.map(s=>s.sku))).size>=12);
 assert.equal(annex.register.samples.length,5);assert.ok(annex.register.bottom>.75&&annex.register.bottom<1);
 assert.equal(annex.departments.length,4);assert.ok(annex.departments.every(s=>s.actualWallMounted&&s.printAspectError<.01));
 assert.equal(annex.stockBatches.reduce((n,b)=>n+b.count,0),count);
 assert.ok(annex.stockBatches.length<=14);
 assert.ok(annex.lights.every(f=>Math.abs(f.ceilingUnderside-7.61)<.02));
 await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(6));
 const shots=['annexAnchorFront','annexAnchorInside','northstarBedding','northstarKitchen','northstarClearance','northstarReturns','annexAnchorExit','annexAnchorPlan'];
 for(const name of shots){
  await page.evaluate(name=>{const a=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;a.goto(name);a.setAuditLight(true)},name);
  await page.screenshot({path:dir+'/'+name+'.png',timeout:120000,animations:'disabled'});
 }
 for(const name of ['annexAnchorInside','northstarBedding','northstarKitchen','northstarClearance','northstarReturns','annexAnchorExit']){
  await page.evaluate(name=>{const a=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;a.goto(name);a.setAuditLight(false)},name);
  await page.screenshot({path:dir+'/'+name+'-ambient.png',timeout:120000,animations:'disabled'});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failed,[]);
 console.log('V162_NORTHSTAR_DESKTOP_PASS '+JSON.stringify({cartons:count,fixtures:fixtures.length,shots:14,errors,remote,failed}));
}finally{await writeFile(dir+'/requests.json',JSON.stringify({errors,remote,failed},null,2));await browser.close();}
