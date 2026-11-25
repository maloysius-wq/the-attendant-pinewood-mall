/** V161 East Department review actual published V111 assembly, not a mockup or private draft. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/v161-east',origin='http://127.0.0.1:4173';
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
 const fixtures=state.anchorRetailV121.filter(f=>f.room==='east_original_anchor');
 const report=fixtures.map(f=>f.eastStockV161).filter(Boolean);
 const count=report.reduce((n,f)=>n+f.cartons,0);
 const signs=state.anchorIdentityV122.eastDepartments;
 assert.deepEqual(signs.map(s=>s.name),['FINAL CLEARANCE','FIXTURES FOR REMOVAL','RETURNS & COLLECTION']);
 assert.ok(signs.every(s=>s.actualWallMounted&&s.printAspectError<.01));
 const mainSign=state.anchorIdentityV122.signs.find(s=>s.room==='east_original_anchor');
 assert.ok(Math.abs(((mainSign.width-.15)/(mainSign.height-.12))/(2048/300)-1)<.01,'main sign artwork aspect');
 for(const s of signs.filter(s=>s.axis==='x')){
  assert.ok(Math.abs(mainSign.z-s.z)>(mainSign.width+s.width)/2+.12,'wall signs overlap '+s.id);
 }
 const west=state.anchorRetailV121.filter(f=>f.room==='west_anchor');
 assert.equal(west.length,36);assert.equal(west.reduce((n,f)=>n+f.fallowCartonsV160.cartons,0),769,'completed Fallow stock changed');
 assert.equal(state.sunburstFixtureCountV126,43,'completed arcade changed');
 assert.equal(state.sunburstArcadeV126.actualFullSizeMachines,40);
 assert.ok(state.sunburstArcadeV126.fixtures.every(f=>state.retailAudit.fixtures.some(m=>m.layer==='v126'&&m.id===f.id)),'every completed arcade fixture must appear in actual assembled scene');
 console.log('V161_ACTUAL_EAST_STOCK '+JSON.stringify(report));
 const shots=['eastAnchorFront','eastAnchor','eastClearance','eastReturns','eastStripped','eastAnchorPlan'];
 for(const name of shots){
  await page.evaluate(name=>{const a=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;a.goto(name);a.setAuditLight(true)},name);
  await page.screenshot({path:dir+'/'+name+'.png',timeout:120000,animations:'disabled'});
 }
 for(const name of ['eastAnchor','eastClearance','eastReturns','eastStripped']){
  await page.evaluate(name=>{const a=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;a.goto(name);a.setAuditLight(false)},name);
  await page.screenshot({path:dir+'/'+name+'-ambient.png',timeout:120000,animations:'disabled'});
 }
 assert.equal(fixtures.length,34);assert.equal(report.length,34);
 assert.equal(report.filter(r=>r.intentionallyCleared).length,5);
 assert.ok(report.filter(r=>r.intentionallyCleared).every(r=>r.cartons===0));
 assert.ok(report.filter(r=>!r.intentionallyCleared).every(r=>r.cartons>=2),'stocked display empty');
 assert.ok(report.filter(r=>r.fixtureType==='gondola'&&!r.intentionallyCleared).every(r=>r.stockedFaces===2),'both accessible faces stocked');
 assert.ok(report.every(r=>r.slots.length===r.cartons&&r.slots.every(s=>Number.isFinite(s.supportY))));
 assert.equal(new Set(report.flatMap(r=>r.slots.map(s=>s.sku))).size,8);
 assert.ok(count>=300&&count<650,'clearance should be substantial but partially depleted');
 assert.ok(report.filter(r=>r.fixtureType==='table_large'&&!r.centerReserved).every(r=>r.cartons>=12),'unreserved sale tables should have substantial displayed stock');
 const register=state.retailAudit.fixtures.find(f=>f.id==='east_returns_register');
 assert.ok(register?.sourceManifest?.actualSupportV160?.samples.length===5,'actual register worktop support');
 assert.ok(register.measured.min[1]>.75&&register.measured.min[1]<1.02);
 assert.ok(state.retailAudit.fixtures.find(f=>f.id==='east_returns_counter')?.source.endsWith('/desk.glb'));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failed,[]);
 console.log('V161_EAST_DESKTOP_PASS '+JSON.stringify({cartons:count,fixtures:fixtures.length,shots:10,errors,remote,failed}));
}finally{await writeFile(dir+'/requests.json',JSON.stringify({errors,remote,failed},null,2));await browser.close();}
