/** Genuine desktop WebGL source-proof for original public mall furnishings. */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {BENCH_ASSET_V120} from '../mall/gallery-amenities-v120.mjs';

const origin='http://127.0.0.1:4173',dir='artifacts/v120-original-mall-amenities';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],consoleErrors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(String(e.message)));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/?retailAudit=1',{waitUntil:'domcontentloaded'});
 try{
  await page.waitForFunction(()=>{
   const a=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;
   return !!a&&(a.ready||a.getState().errors.length>0);
  },null,{timeout:540000});
 }catch(e){
  console.log('V120_BOOT_TIMEOUT '+JSON.stringify({errors,consoleErrors,remote,failed,
   state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.()),
   body:(await page.locator('body').innerText()).slice(0,1600)}));
  throw e;
 }
 const state=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 const initial=await state();
 assert.equal(initial.ready,true,'original full model not ready: '+initial.errors.join('; '));
 assert.deepEqual(initial.errors,[]);
 assert.equal(initial.firstFrameFullyLoaded,true);
 assert.equal(initial.galleryColumnCount,28,'V118 source pillars preserved');
 assert.equal(initial.storefrontCount,7,'V115 original shopfronts preserved');
 assert.equal(initial.closedBayCount,13,'V116 sealed suites preserved');
 assert.equal(initial.checkpointV117.cells,2,'V117 contractor check-in preserved');
 assert.equal(initial.benchCountV120,20);
 assert.equal(initial.binCountV163,10);
 assert.equal(initial.retailAudit.source.source,'published');
 for(const b of initial.galleryAmenitiesV120.bins){assert.ok(b.realCC0&&Math.abs(b.height-.78)<.025&&Math.abs(b.width-.6)<.025&&Math.abs(b.baseY)<.006);}
 assert.equal(initial.directoryCountV120,2);
 assert.equal(initial.wayfindingCountV120,2);
 assert.equal(initial.galleryAmenitiesV120.benches.length,20);
 assert.equal(initial.galleryAmenitiesV120.benches.every(b=>b.realCC0),true);
 for(const bench of initial.galleryAmenitiesV120.benches){
  assert.ok(Math.abs(bench.height-.97)<.025,
   'real CC0 bench has wrong physical stature: '+JSON.stringify(bench));
  assert.ok(Math.max(bench.width,bench.depth)>=1.25,
   'real asset looks like a single chair rather than a usable public mall bench: '+bench.id);
  assert.ok(bench.width>=.15&&bench.depth>=.15,
   'bench has impossible footprint: '+bench.id);
  assert.equal(bench.model,BENCH_ASSET_V120.path,'actual rendered model must match the independently pinned original CC0 source');
 }
 for(const d of initial.galleryAmenitiesV120.directories){
  assert.ok(d.physicalDirectory&&d.height===2.25&&d.collisionRadius>=.8);
  assert.equal(d.printedFaces,2,'actual freestanding north/south directory must display framed maps on BOTH sides: '+d.id);
 }
 const views=['atriumLounge','directorySouth','directoryNorth','westLounge','eastLounge','westGallery','eastGallery','aerial'];
 for(const shot of views){
  await page.evaluate(s=>{const api=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;api.goto(s);api.setAuditLight(true)},shot);
  await page.waitForTimeout(200);
  const s=await state();
  assert.equal(s.shot,shot);
  assert.deepEqual(s.errors,[]);
  await page.screenshot({path:dir+'/'+shot+'.png',fullPage:true,animations:'disabled',timeout:90000});
 }
 assert.deepEqual(errors,[],'real browser exceptions');
 assert.deepEqual(consoleErrors,[],'no construction/asset errors');
 assert.deepEqual(remote,[],'all original CC0 3D assets are repository-local');
 assert.deepEqual(failed,[],'all source files and licensed models successfully loaded');
 await writeFile(dir+'/original-asset-manifest.json',JSON.stringify(initial.galleryAmenitiesV120,null,2));
 console.log('PINEWOOD_V120_REAL_PUBLIC_MALL_PASS '+JSON.stringify({
  benchIds:initial.galleryAmenitiesV120.benches.map(x=>x.id),
  benchHeights:initial.galleryAmenitiesV120.benches.map(x=>x.height),
  directories:initial.galleryAmenitiesV120.directories.length,
  signs:initial.galleryAmenitiesV120.wayfinding.length,
  errors,consoleErrors,remote,failed
 }));
}finally{await browser.close()}
