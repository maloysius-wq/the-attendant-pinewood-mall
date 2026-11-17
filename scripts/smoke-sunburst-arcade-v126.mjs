/** 12 original desktop WebGL shots of the actual shared Pinewood source V126.
 * Never a simulated image, mobile viewport or manual WASD play session.
 */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173',folder='artifacts/v126-sunburst-arcade-real-3d';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],remote=[],consoleErrors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 try{
  await page.waitForFunction(()=>{
   const app=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;
   return !!app&&(app.ready||app.getState()?.errors.length>0);
  },null,{timeout:115000});
 }catch(error){
  console.error('V126_BOOT_DIAGNOSTICS '+JSON.stringify({
   errors,consoleErrors,remote,failed,
   state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.()),
   body:(await page.locator('body').innerText()).slice(0,1100)
  }));throw error;
 }
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let state=await get();
 assert.equal(state.ready,true,state.errors.join(' | '));
 assert.deepEqual(state.errors,[]);
 assert.equal(state.firstFrameFullyLoaded,true);
 assert.equal(state.sunburstFixtureCountV126,18);
 assert.equal(state.sunburstLampCountV126,4);
 assert.equal(state.sunburstPosterCountV126,5);
 assert.equal(state.sunburstArcadeV126.sourcePack,
  'assets/vendor/arcade-v30/token_gesture/pack.glb');
 assert.equal(state.sunburstArcadeV126.actualFullSizeMachines,18);
 const kinds=new Set();
 for(const f of state.sunburstArcadeV126.fixtures){
  kinds.add(f.node);
  assert.equal(f.license,'CC0-1.0');assert.equal(f.realMesh,true);
  assert.ok(f.source.startsWith('assets/vendor/arcade-v30/'));
  assert.ok(f.actualWidth>.3&&f.actualWidth<3);
  assert.ok(f.actualDepth>.3&&f.actualDepth<3);
  assert.ok(f.actualHeight>.74&&f.actualHeight<2.2);
  assert.ok(Math.abs(f.groundY)<.012,'floating original machine '+f.id);
  assert.ok(Math.hypot(f.actualWidth/2,f.actualDepth/2)<=f.collisionRadius+.008,
   'authentic full-size source out of gameplay collider '+f.id);
 }
 assert.ok(kinds.size>=10,'not a realistic varied 1997 arcade');
 for(const light of state.sunburstArcadeV126.fluorescents){
  assert.equal(light.license,'CC0-1.0');
  assert.ok(Math.abs(light.ceilingUnderside-5.21)<.02);
  assert.ok(light.actualWidth>1.7&&light.actualDepth>1.7);
 }
 assert.equal(state.sunburstArcadeV126.fluorescents.filter(l=>l.power>0).length,2);
 assert.equal(state.sunburstArcadeV126.fluorescents.filter(l=>l.power===0).length,2);
 assert.ok(state.sunburstArcadeV126.posters.every(p=>p.originalArtwork&&p.masonryAttached));
 assert.equal(state.videoFixtureCountV125,16);
 assert.equal(state.cassetteFixtureCountV124,12);
 assert.equal(state.storefrontCount,7);
 assert.equal(state.galleryColumnCount,28);
 const shots=['arcadeFront','arcadeInside','arcadeNorth','arcadeWest','arcadePlan',
  'west','cassetteInside','videoInside','atrium','aerial'];
 for(const shot of shots){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(160);
  assert.equal((await get()).shot,shot);
  await page.screenshot({path:folder+'/'+shot+'.png',fullPage:true,
   animations:'disabled',timeout:80000});
 }
 await page.locator('#survey-light').uncheck();
 for(const shot of ['arcadeInside','arcadeNorth']){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(160);
  await page.screenshot({path:folder+'/'+shot+'-actual-lighting.png',
   fullPage:true,animations:'disabled',timeout:80000});
 }
 for(let chapter=1;chapter<=6;chapter++){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(n),chapter);
  assert.equal((await get()).chapter,chapter);
 }
 state=await get();
 assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);
 assert.deepEqual(remote,[]);assert.deepEqual(failed,[]);
 await writeFile(folder+'/source-measurements.json',
  JSON.stringify(state.sunburstArcadeV126,null,2));
 console.log('PINEWOOD_V126_REAL_SUNBURST_WEBGL_PASS '+JSON.stringify({
  sourcedMachines:state.sunburstFixtureCountV126,uniqueModels:kinds.size,
  mountedLamps:state.sunburstLampCountV126,
  1997Prints:state.sunburstPosterCountV126,shots:shots.length+2,
  errors,consoleErrors,remote,failed
 }));
}finally{await browser.close()}
