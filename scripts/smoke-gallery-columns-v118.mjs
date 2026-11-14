/** Real desktop review of original mall column/support rhythm. */
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173';
await mkdir('artifacts/v118-gallery-columns',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(String(e.message)));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.ready,null,{timeout:110000})
  .catch(async e=>{
   console.log('V118_BOOT_FAILED '+JSON.stringify({
    errors,remote,failed,state:await page.evaluate(
     ()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.()
    ).catch(x=>({error:String(x)}))
   }));
   throw e;
  });
 const state=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 const initial=await state();
 assert.deepEqual(initial.errors,[]);
 assert.equal(initial.firstFrameFullyLoaded,true);
 assert.equal(initial.galleryColumnCount,28);
 assert.equal(initial.galleryColumnsV118.length,28);
 assert.equal(initial.galleryColumnsV118.filter(p=>p.room==='central_gallery').length,10);
 assert.equal(initial.galleryColumnsV118.filter(p=>p.room==='west_gallery').length,9);
 assert.equal(initial.galleryColumnsV118.filter(p=>p.room==='east_gallery').length,9);
 assert.equal(initial.storefrontCount,7,'V115 source glazed retail must remain');
 assert.equal(initial.closedBayCount,13,'V116 source closed tenant areas must remain');
 assert.equal(initial.checkpointV117.cells,2,'V117 fixed contractor check-in must remain');
 for(const name of ['westGallery','eastGallery','atriumColumns','aerial']){
  await page.evaluate(n=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(n),name);
  await page.waitForTimeout(230);
  const snapshot=await state();
  assert.equal(snapshot.shot,name);
  assert.deepEqual(snapshot.errors,[],'3D renderer error in '+name);
  await page.screenshot({
   path:'artifacts/v118-gallery-columns/'+name+'.png',fullPage:true,
   animations:'disabled',timeout:90000
  });
 }
 assert.deepEqual(errors,[],'no browser exceptions');
 assert.deepEqual(remote,[],'no remote scripts, textures or models');
 assert.deepEqual(failed,[],'all original local assets must be available');
 console.log('PINEWOOD_V118_REAL_GALLERY_STRUCTURE_PASS '+JSON.stringify({
  columns:initial.galleryColumnCount,storefronts:initial.storefrontCount,
  sealedBays:initial.closedBayCount,checkpoint:initial.checkpointV117,
  errors,remote
 }));
}finally{await browser.close()}
