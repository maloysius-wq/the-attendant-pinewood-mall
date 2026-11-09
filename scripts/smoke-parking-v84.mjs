import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 const response=await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'});
 assert.equal(response?.status(),200,'Builder route must exist');
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:150000});
 const summary=await page.evaluate(()=>({
  builder:window.__PINEWOOD_BUILDER__.getState(),
  exterior:window.__PINEWOOD_BUILDER__.getExteriorState()
 }));
 assert.equal(summary.builder.ready,true,JSON.stringify(summary.builder.errors));
 assert.equal(summary.exterior.sedanLoaded,true,'same original cinematic sedan remains loaded');
 assert.equal(summary.exterior.facadeLoaded,true,'same abandoned mall entrance remains loaded');
 assert.equal(summary.exterior.planterCount,8,'all prior licensed planters retained');
 assert.equal(summary.exterior.markedStalls,196,'seven coherent marked rows with 196 spaces');
 assert.ok(summary.exterior.paintedSegments>=280,'complete painted layout is mounted');
 assert.equal(summary.exterior.licensedParkingProps,8,'eight existing CC0 parking decorations loaded');
 assert.equal(summary.exterior.leaflessDeadTrees,4,'four truly leafless source-licensed CC0 trees loaded');
 assert.equal(summary.exterior.placementSurfaces,2,'walkable lot and sidewalk remain intact');
 assert.equal(windowHasBrokenCanvas(summary),false);
 assert.equal(await page.evaluate(()=>window.__PINEWOOD_BUILDER__.jumpParkingLot()),true);
 const after=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getNavigationState());
 assert.ok(after.position.z>0,'jump arrives in the lot, not inside mall');
 assert.equal(summary.builder.catalogCount,503,'all existing selectable CC0 assets remain intact');
 assert.deepEqual(remote,[],'no third-party browser asset loads');
 assert.deepEqual(errors,[],'no browser asset/scene errors');
 console.log('PINEWOOD_PARKING_V84_DESKTOP_PASS '+JSON.stringify({
  markedStalls:summary.exterior.markedStalls,
  paintedSegments:summary.exterior.paintedSegments,
  licensedProps:summary.exterior.licensedParkingProps,
  deadTrees:summary.exterior.leaflessDeadTrees,
  existingPlanters:summary.exterior.planterCount
 }));
}finally{await browser.close()}
function windowHasBrokenCanvas(summary){return summary.builder.errors.length>0}
