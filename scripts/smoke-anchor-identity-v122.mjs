/** V122 full-mall, true desktop WebGL sources and source-ceiling visual record. */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173',dir='artifacts/v122-anchor-original-ceilings';
await mkdir(dir,{recursive:true});
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
   const a=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;
   return a&&(a.ready||a.getState().errors.length);
  },null,{timeout:110000});
 }catch(e){
  console.error('V122_BOOT_DIAGNOSTIC '+JSON.stringify({errors,consoleErrors,remote,failed,
   state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.()),
   body:(await page.locator('body').innerText()).slice(0,1200)}));
  throw e;
 }
 const get=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 const s=await get();
 assert.ok(s.ready,'whole original mall did not render '+s.errors.join(' | '));
 assert.deepEqual(s.errors,[]);
 assert.equal(s.firstFrameFullyLoaded,true);
 assert.equal(s.ceilingPanelCountV122,15);
 assert.equal(s.departmentSignCountV122,2);
 assert.equal(s.anchorRetailCountV121,30);
 assert.equal(s.galleryColumnCount,28);
 assert.equal(s.storefrontCount,7);
 assert.equal(s.closedBayCount,13);
 assert.equal(s.benchCountV120,6);
 assert.equal(s.directoryCountV120,2);
 assert.equal(s.ceilingRooms.length,41,'V122 cannot replace canonical existing 41 room ceilings');
 assert.equal(s.allCeilingsTextured,true);
 const manifest=s.anchorIdentityV122;
 assert.equal(manifest.panels.filter(p=>p.room==='west_anchor').length,9);
 assert.equal(manifest.panels.filter(p=>p.room==='east_original_anchor').length,6);
 assert.equal(manifest.panels.filter(p=>p.power===0).length,7);
 assert.deepEqual(manifest.signs.map(x=>x.name),["FALLOW'S",'EAST DEPARTMENT']);
 for(const p of manifest.panels){
  assert.equal(p.license,'CC0-1.0');
  assert.ok(p.model.endsWith('ceiling-fluorescent-0299417a.glb'));
  assert.ok(Math.abs(p.ceilingUnderside-5.21)<.01);
  assert.ok(p.actualWidth>1.7&&p.actualWidth<2.5);
  assert.ok(p.actualDepth>1.7&&p.actualDepth<2.5);
  assert.ok(p.actualHeight>.1&&p.actualHeight<.55);
  assert.ok(p.emitterY<p.ceilingUnderside-.045,'light is floating through ceiling '+p.id);
  assert.ok(p.lensCount>0,'GLB missing true lit material '+p.id);
 }
 for(const sign of manifest.signs){
  assert.ok(Math.abs(sign.mountedX-sign.wallX)<.2);
  assert.ok(Math.abs(sign.printedX-sign.wallX)<.3);
  assert.ok(sign.y>2.8&&sign.y<4);
 }
 for(const shot of ['fallows','eastAnchor']){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(250);
  await page.screenshot({path:dir+'/'+shot+'-survey.png',animations:'disabled',fullPage:true,timeout:90000});
  await page.locator('#survey-light').uncheck();
  await page.waitForTimeout(250);
  assert.equal((await get()).surveyLightOn,false);
  await page.screenshot({path:dir+'/'+shot+'-actual-lamps-only.png',animations:'disabled',fullPage:true,timeout:90000});
  await page.locator('#survey-light').check();
 }
 for(const shot of ['westGallery','eastGallery','fallowPlan','eastAnchorPlan']){
  await page.evaluate(name=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(name),shot);
  await page.waitForTimeout(200);
  await page.screenshot({path:dir+'/'+shot+'.png',animations:'disabled',fullPage:true,timeout:90000});
 }
 for(let chapter=1;chapter<=6;chapter++)
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(n),chapter);
 assert.deepEqual(errors,[],'3D source review threw errors');
 assert.deepEqual(consoleErrors,[],'3D renderer console errors');
 assert.deepEqual(remote,[],'NO third-party runtime fixtures');
 assert.deepEqual(failed,[],'all actual pinned 3D models load locally');
 await writeFile(dir+'/actual-source-panel-measurements.json',JSON.stringify(manifest,null,2));
 console.log('PINEWOOD_V122_REAL_ORIGINAL_SHOP_PASS '+JSON.stringify({
  panelCount:s.ceilingPanelCountV122,lit:manifest.panels.filter(p=>p.power>0).length,
  signs:manifest.signs.map(x=>x.name),errors,remote,failed
 }));
}finally{await browser.close();}
