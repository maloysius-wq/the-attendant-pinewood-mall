/** V127b: original shared mall, desktop software-WebGL only.
 * Real fixed camera locations. No manual WASD, mobile devices, fake previews.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v127b-annex-source';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],remote=[],failed=[],consoleErrors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))
  remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 try{
  await page.waitForFunction(()=>{
   const s=window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.();
   return s&&(s.ready||s.errors.length>0);
  },null,{timeout:120000});
 }catch(error){
  console.error('V127B_LOADER_DIAGNOSTIC '+JSON.stringify({errors,remote,failed,
   text:(await page.locator('body').innerText()).slice(0,1200),
   state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.())}));
  throw error;
 }
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let s=await get();
 assert.equal(s.ready,true,s.errors.join(' | '));
 assert.deepEqual(s.errors,[]);
 assert.equal(s.firstFrameFullyLoaded,true);
 assert.equal(s.annexCorridorV127B.tiledArea,639);
 assert.equal(s.annexCorridorV127B.panels.length,8);
 assert.equal(s.annexCorridorV127B.signs.length,5);
 assert.equal(s.annexCorridorV127B.cabinets.length,3);
 assert.equal(s.annexCorridorV127B.panels.filter(x=>x.power===0).length,3);
 for(const p of s.annexCorridorV127B.panels){
  assert.equal(p.license,'CC0-1.0');
  assert.ok(p.source.startsWith('assets/vendor/builder/models/'));
  assert.ok(p.actualWidth>1.7&&p.actualWidth<2.5);
  assert.ok(p.actualDepth>1.7&&p.actualDepth<2.5);
  assert.ok(Math.abs(p.underside-3.36)<.01);
  assert.ok(p.groundingError<-.003&&p.groundingError>-.2,
   'real physical ceiling source mesh detached '+p.id);
  assert.ok(p.lenses>0);
 }
 for(const sign of s.annexCorridorV127B.signs){
  assert.equal(sign.wallX,65);
  assert.ok(sign.mountedX>64.7&&sign.mountedX<64.9);
 }
 assert.equal(s.staffServiceV127.length,5);
 assert.equal(s.closedBayCount,13);
 assert.equal(s.storefrontCount,7);
 assert.equal(s.sunburstFixtureCountV126,43);
 // Four forward-looking source views, one roof-off plan, existing adjacent
 // staff-context frame; genuine 1440 x 900 local Chromium WebGL pixels.
 const views=['annexSouth','annexTraining','annexNorth','annexPlan','annexStaff','aerial'];
 for(const shot of views){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(n),shot);
  await page.waitForTimeout(210);
  s=await get();
  assert.equal(s.shot,shot);assert.deepEqual(s.errors,[]);
  await page.screenshot({path:folder+'/'+shot+'.png',fullPage:true,
   animations:'disabled',timeout:85000});
 }
 // No global review floodlight: capture the actual installed night-shift
 // fluorescents without changing gameplay/film lighting.
 await page.locator('#survey-light').uncheck();
 for(const shot of ['annexSouth','annexNorth']){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(n),shot);
  await page.waitForTimeout(210);
  await page.screenshot({path:folder+'/'+shot+'-real-lamps.png',fullPage:true,
   animations:'disabled',timeout:85000});
 }
 for(let chapter=1;chapter<=6;chapter++){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(n),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 assert.deepEqual(errors,[],'no original source runtime exceptions');
 assert.deepEqual(consoleErrors,[],'no broken source render console errors');
 assert.deepEqual(remote,[],'no network asset request outside project');
 assert.deepEqual(failed,[],'no source GLB or PBR image failed to load');
 await writeFile(folder+'/source-measurements.json',JSON.stringify(s.annexCorridorV127B,null,2));
 console.log('V127B_REAL_ANNEX_DESKTOP_WEBGL_PASS '+JSON.stringify({
  floorSquareMetres:639,authenticCeilingPanels:8,wallMountedSigns:5,
  locallyLicensedCabinets:3,shots:8,errors,consoleErrors,failed,remote
 }));
}finally{await browser.close();}
