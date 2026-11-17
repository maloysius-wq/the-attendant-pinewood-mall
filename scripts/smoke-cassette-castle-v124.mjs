/**
 * V124 screenshot and actual Three.js geometry verification in source mall.
 * The 1979 shop is built from the SAME original source used by Builder,
 * the opening film and playable six-chapter game, not a second facade.
 */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173',folder='artifacts/v124-real-cassette-castle';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],consoleErrors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 try{
  await page.waitForFunction(()=>{
   const app=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;
   return !!app&&(app.ready||app.getState()?.errors.length>0);
  },null,{timeout:110000});
 }catch(e){
  console.log('V124_BOOT_DIAGNOSTICS '+JSON.stringify({
   errors,consoleErrors,remote,failed,
   state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.()),
   body:(await page.locator('body').innerText()).slice(0,900)
  }));throw e;
 }
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let s=await get();
 assert.equal(s.ready,true,s.errors.join(' | '));
 assert.deepEqual(s.errors,[]);
 assert.equal(s.firstFrameFullyLoaded,true);
 assert.ok(s.allCeilingsTextured);
 assert.equal(s.cassetteFixtureCountV124,8);
 assert.equal(s.cassetteCeilingCountV124,4);
 assert.equal(s.cassetteCaseCountV124,88);
 assert.equal(s.vinylSleeveCountV124,6);
 assert.equal(s.cassetteCastleV124.authoredPeriodStock.wallCassetteCases,70);
 assert.equal(s.cassetteCastleV124.authoredPeriodStock.tableCassetteCases,14);
 assert.equal(s.cassetteCastleV124.authoredPeriodStock.spinnerCards,4);
 assert.deepEqual(s.cassetteCastleV124.authoredPeriodStock.tableSupports,
  ['now_playing_table','singles_table']);
 assert.equal(s.cassetteCastleV124.fixtures.filter(x=>x.kind==='wall_bay').length,5);
 assert.equal(s.cassetteCastleV124.fixtures.filter(x=>x.kind==='table_medium').length,2);
 assert.equal(s.cassetteCastleV124.fixtures.filter(x=>x.kind==='spinner').length,1);
 assert.equal(new Set(s.cassetteCastleV124.fixtures.map(x=>x.id)).size,8);
 assert.equal(s.cassetteCastleV124.fluorescents.filter(x=>x.power>0).length,2);
 assert.equal(s.cassetteCastleV124.fluorescents.filter(x=>x.power===0).length,2);
 assert.equal(s.cassetteCastleV124.interiorSign.wallX,-46);
 for(const f of s.cassetteCastleV124.fixtures){
  assert.equal(f.license,'CC0-1.0');
  assert.ok(f.source.startsWith('assets/vendor/builder/models/'));
  assert.ok(f.actualWidth>.2&&f.actualWidth<2.0,'source fixture width incorrect '+f.id);
  assert.ok(f.actualDepth>.2&&f.actualDepth<2.0,'source fixture depth incorrect '+f.id);
  assert.ok(f.actualHeight>.9&&f.actualHeight<2.5,'source fixture full scale incorrect '+f.id);
  assert.ok(Math.abs(f.groundY)<.012,'CC0 original shop GLB floating '+f.id);
  assert.ok(Math.hypot(f.actualWidth/2,f.actualDepth/2)<=f.collisionRadius+.006,
   'game collision undercounts actual imported source GLB '+f.id);
 }
 for(const lamp of s.cassetteCastleV124.fluorescents){
  assert.equal(lamp.license,'CC0-1.0');
  assert.ok(Math.abs(lamp.ceilingUnderside-5.21)<.02,
   'original ceiling fixture is not physically mounted to shop soffit');
  assert.ok(lamp.actualWidth>1.7&&lamp.actualDepth>1.7);
 }
 assert.equal(s.anchorRetailCountV121,30);
 assert.equal(s.stockCountV123,13);
 assert.equal(s.ceilingPanelCountV122,15);
 assert.equal(s.departmentSignCountV122,2);
 assert.equal(s.galleryColumnCount,28);
 assert.equal(s.closedBayCount,13);
 assert.equal(s.storefrontCount,7);
 assert.equal(s.benchCountV120,6);
 assert.equal(s.directoryCountV120,2);
 const shots=['west','cassetteInside','cassetteCounter','cassetteRear','cassettePlan',
  'westGallery','fallows','eastAnchor','aerial'];
 for(const shot of shots){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(150);
  assert.equal((await get()).shot,shot);
  await page.screenshot({path:folder+'/'+shot+'.png',fullPage:true,animations:'disabled',timeout:80000});
 }
 // No extra construction survey lighting in the GAME. The original source
 // lamp power produces the actual era-correct uneven scene brightness.
 await page.locator('#survey-light').uncheck();
 for(const shot of ['cassetteInside','cassetteCounter','cassetteRear']){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(170);
  await page.screenshot({path:folder+'/'+shot+'-actual-lighting.png',fullPage:true,animations:'disabled',timeout:80000});
 }
 for(let ch=1;ch<=6;ch++){
  await page.evaluate(c=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(c),ch);
  assert.equal((await get()).chapter,ch);
 }
 s=await get();
 assert.deepEqual(errors,[],'original scene JS threw an exception');
 assert.deepEqual(consoleErrors,[],'original real 3D source caused console errors');
 assert.deepEqual(remote,[],'music source must have no remote-runtime requests');
 assert.deepEqual(failed,[],'all genuine CC0 GLB/texture files must load');
 await writeFile(folder+'/real-cassette-castle-measurements.json',JSON.stringify(s.cassetteCastleV124,null,2));
 console.log('PINEWOOD_V124_REAL_MUSIC_STORE_WEBGL_PASS '+JSON.stringify({
  fixtureCount:s.cassetteFixtureCountV124,
  ceiling:s.cassetteCeilingCountV124,cassette:s.cassetteCaseCountV124,
  vinyl:s.vinylSleeveCountV124,
  visualReviewShots:shots.length+3,errors,remote,failed
 }));
}finally{await browser.close()}
