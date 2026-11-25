/** V160 review actual published V111 assembly, not a mockup or private draft. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/v160-fallows',origin='http://127.0.0.1:4173';
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
 const fixtures=state.anchorRetailV121.filter(f=>f.room==='west_anchor');
 const report=fixtures.map(f=>f.fallowCartonsV160).filter(Boolean);
 const count=report.reduce((n,f)=>n+f.cartons,0);
 console.log('V160_ACTUAL_SOURCE_CARTONS '+JSON.stringify(report));
 const shots=['fallowFront','fallows','fallowNorth','fallowSouth','fallowCheckout','fallowPlan'];
 for(const name of shots){
  await page.evaluate(name=>{const a=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;a.goto(name);a.setAuditLight(true)},name);
  await page.screenshot({path:dir+'/'+name+'.png',timeout:120000,animations:'disabled'});
 }
 for(const name of ['fallows','fallowNorth','fallowSouth','fallowCheckout']){
  await page.evaluate(name=>{const a=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;a.goto(name);a.setAuditLight(false)},name);
  await page.screenshot({path:dir+'/'+name+'-ambient.png',timeout:120000,animations:'disabled'});
 }
 assert.equal(fixtures.length,36);
 assert.equal(report.length,36,'all authentic retail display fixtures surveyed');
 assert.ok(report.filter(r=>r.fixtureType==='wall_cubbies').every(r=>r.cartons>=4),'every perimeter cubby needs real supported stock');
 assert.ok(report.filter(r=>r.fixtureType==='gondola').every(r=>r.stockedFaces===2&&r.cartons>=4),'each real double-sided gondola needs merchandise on both faces');
 const register=state.retailAudit.fixtures.find(f=>f.id==='fallow_register');
 assert.ok(register?.sourceManifest?.actualSupportV160?.samples.length===5,'real register five-point measured worktop contact');
 assert.ok(register.measured.min[1]>.75&&register.measured.min[1]<1.02);
 assert.ok(state.retailAudit.fixtures.find(f=>f.id==='fallow_counter')?.source.endsWith('/desk.glb'),'retired sci-fi checkout still present');
 assert.ok(new Set(report.flatMap(r=>r.slots.map(s=>s.sku))).size>=10,'distinct actual department merchandise families');
 assert.ok(count>=500,'insufficient actually supported period merchandise');
 assert.ok(report.filter(r=>r.centerReserved).every(r=>r.cartons>=2),'each real table must support visible additional stock');
 assert.ok(report.every(r=>r.slots.length===r.cartons&&r.slots.every(s=>Number.isFinite(s.supportY))));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failed,[]);
 console.log('V160_FALLOWS_DESKTOP_PASS '+JSON.stringify({cartons:count,fixtures:fixtures.length,shots:10,errors,remote,failed}));
}finally{await writeFile(dir+'/requests.json',JSON.stringify({errors,remote,failed},null,2));await browser.close();}
