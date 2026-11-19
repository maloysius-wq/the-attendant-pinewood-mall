/** V136 Issue #119 FINAL original 1440x900 desktop WebGL facade/source review.
 * Only run after real same-source V133, V135 and V136 physical integration.
 * No review-only fake geometry, off-origin runtime loads, mobile or WASD.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',folder='artifacts/v136-issue119-perimeter';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],failed=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{
  const s=window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.();
  return s&&(s.ready||s.errors.length>0);
 },null,{timeout:150000});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let s=await get();
 assert.equal(s.ready,true,JSON.stringify(s.errors));
 assert.deepEqual(s.errors,[]);assert.equal(s.firstFrameFullyLoaded,true);
 assert.ok(s.perimeterV136,'source-built original facade closure manifest absent');
 assert.equal(s.perimeterV136.originalSingleSlabSetbackSqm,286);
 assert.equal(s.perimeterV136.unaccountedCells.length,0);
 assert.equal(s.perimeterV136.unforeseenMissingMasonry.length,0);
 assert.equal(s.perimeterV136.originalEastConnectorClearance.length,1);
 assert.equal(s.perimeterV136.originalGroundFloorOverSetbackSqm,286);
 assert.equal(s.perimeterV136.originalWeatherRoofOverSetbackSqm,286);
 assert.equal(s.westRearV135.closedSqm,45);
 assert.equal(s.frontRemainingV133,331);
 assert.equal(s.allCeilingsTextured,true);
 assert.equal(s.closedBayCount,13);
 assert.ok(s.storefrontCount>=4,'authentic original tenant frontage must exist');
 assert.ok(s.storefrontNames.some(n=>/Cassette|Video|Sunburst|Fallow/i.test(n)),
  'original shops need distinct authored signed identity');
 const shots=['perimeterWestRear','perimeterEastAnnex','aerial','atrium',
  'westGallery','eastGallery','fallows','cassetteInside','videoInside','arcadeFront',
  'closedNorth','closedSouth','frontSeamDoorApproach','westRearPlan','rearSealPlan',
  'annexAnchorFront','annexPlan'];
 for(const shot of shots){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(160);
  s=await get();assert.equal(s.shot,shot);assert.deepEqual(s.errors,[]);
  await page.screenshot({path:folder+'/'+shot+'.png',animations:'disabled',timeout:90000});
 }
 for(const chapter of [1,3,6]){
  await page.evaluate(c=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(c),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(remote,[]);
 console.log('ISSUE119_FINAL_PERIMETER_REAL_SOURCE_WEBGL_PASS '+JSON.stringify({
  intentionalInaccessibleSetbacksSqm:286,unfinishedAccessibleResidualSqm:0,
  expectedEastAnnexConnectorReliefMetres:.2,shots:shots.length,errors,failed,remote
 }));
}finally{await browser.close()}
