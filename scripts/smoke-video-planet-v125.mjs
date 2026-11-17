/** Actual desktop WebGL source inspection for V125 original 1997 rental shop. */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173',folder='artifacts/v125-video-planet-real-3d';
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
  console.log('V125_BOOT_DIAGNOSTICS '+JSON.stringify({
   errors,consoleErrors,remote,failed,
   state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.()),
   body:(await page.locator('body').innerText()).slice(0,900)
  }));throw e;
 }
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 let s=await get();
 assert.equal(s.ready,true,s.errors.join(' | '));
 assert.deepEqual(s.errors,[]);assert.equal(s.firstFrameFullyLoaded,true);
 assert.equal(s.videoFixtureCountV125,16);
 assert.equal(s.videoCeilingCountV125,4);
 assert.equal(s.videoVhsCountV125,320);
 assert.equal(s.videoPosterCountV125,6);
 assert.equal(s.videoPlanetV125.stock.wallCases,312);
 assert.equal(s.videoPlanetV125.stock.tableCases,8);
 assert.equal(s.videoPlanetV125.stock.spinnerCards,8);
 assert.equal(s.videoPlanetV125.stock.allOriginalCards,328);
 assert.equal(s.videoPlanetV125.identity.wallX,46);
 assert.equal(s.videoPlanetV125.fluorescents.filter(l=>l.power>0).length,2);
 assert.equal(s.videoPlanetV125.fluorescents.filter(l=>l.power===0).length,2);
 for(const f of s.videoPlanetV125.fixtures){
  assert.equal(f.license,'CC0-1.0');
  assert.ok(f.source.startsWith('assets/vendor/builder/models/'));
  assert.ok(f.actualWidth>.2&&f.actualWidth<2.0,'actual source width invalid '+f.id);
  assert.ok(f.actualDepth>.2&&f.actualDepth<2.0,'actual source depth invalid '+f.id);
  assert.ok(f.actualHeight>.9&&f.actualHeight<2.5,'actual source height invalid '+f.id);
  assert.ok(Math.abs(f.groundY)<.012,'source fixture floats '+f.id);
  assert.ok(Math.hypot(f.actualWidth/2,f.actualDepth/2)<=f.collisionRadius+.006,
   'licensed real video display outside gameplay collision '+f.id);
 }
 for(const lamp of s.videoPlanetV125.fluorescents){
  assert.equal(lamp.license,'CC0-1.0');
  assert.ok(Math.abs(lamp.ceilingUnderside-5.21)<.02);
  assert.ok(lamp.actualWidth>1.7&&lamp.actualDepth>1.7);
 }
 assert.ok(s.videoPlanetV125.posters.every(p=>p.originalArtwork&&p.masonryAttached));
 assert.equal(s.cassetteFixtureCountV124,12);
 assert.equal(s.storefrontCount,7);
 assert.equal(s.galleryColumnCount,28);
 const shots=['videoFront','videoInside','videoCounter','videoRear','videoPlan',
  'eastGallery','cassetteInside','atrium','aerial'];
 for(const shot of shots){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(160);
  assert.equal((await get()).shot,shot);
  await page.screenshot({path:folder+'/'+shot+'.png',fullPage:true,
   animations:'disabled',timeout:80000});
 }
 await page.locator('#survey-light').uncheck();
 for(const shot of ['videoInside','videoCounter','videoRear']){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(160);
  await page.screenshot({path:folder+'/'+shot+'-actual-lighting.png',
   fullPage:true,animations:'disabled',timeout:80000});
 }
 for(let ch=1;ch<=6;ch++){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(n),ch);
  assert.equal((await get()).chapter,ch);
 }
 s=await get();
 assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);
 assert.deepEqual(remote,[]);assert.deepEqual(failed,[]);
 await writeFile(folder+'/measurements.json',JSON.stringify(s.videoPlanetV125,null,2));
 console.log('PINEWOOD_V125_REAL_VIDEO_PLANET_WEBGL_PASS '+JSON.stringify({
  fixtureCount:s.videoFixtureCountV125,authoredVhs:s.videoVhsCountV125,
  lamps:s.videoCeilingCountV125,shots:shots.length+3,errors,remote,failed
 }));
}finally{await browser.close()}
