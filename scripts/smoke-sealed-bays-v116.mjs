import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173';
await mkdir('artifacts/v116-enclosures',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 try{await page.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.ready,null,{timeout:50000})}
 catch(e){console.error('V116_STARTUP_DIAGNOSTIC',JSON.stringify({errors,failed,remote,
  state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState())}));throw e}
 const s=await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 assert.equal(s.firstFrameFullyLoaded,true);
 assert.deepEqual(s.errors,[]);
 assert.equal(s.storefrontCount,7);
 assert.equal(s.closedBayCount,13);
 assert.ok(s.closedBayNames.includes('Needle & Thread'));
 assert.ok(s.closedBayNames.includes('East Wing Bulk Storage'));
 for(const shot of ['closedNorth','closedAnnex','closedSouth','west','aerial']){
  await page.evaluate(shot=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(shot),shot);
  await page.waitForTimeout(220);
  await page.screenshot({path:'artifacts/v116-enclosures/'+shot+'.png',fullPage:true});
 }
 await page.goto(origin+'/review/mall-architecture-v114/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_ARCHITECTURE_V114__?.ready,null,{timeout:16000});
 const plan=await page.evaluate(()=>window.__PINEWOOD_ARCHITECTURE_V114__.getState());
 assert.equal(plan.level,'G');assert.equal(plan.sealedBays,13);
 assert.equal(plan.unassignedArea,2797.5,'V114 canonical source remains unchanged');
 assert.equal(await page.locator('#drawing g[data-sealed]').count(),13);
 assert.match(await page.locator('#metrics').innerText(),/2,277.5 m²/);
 assert.match(await page.locator('#metrics').innerText(),/520 m²/);
 await page.screenshot({path:'artifacts/v116-enclosures/audit-overview.png',fullPage:true});
 assert.deepEqual(errors,[],'all browser scripts load');
 assert.deepEqual(remote,[],'no third-party runtime assets');
 assert.deepEqual(failed,[],'no failed original local GLB/texture sources');
 console.log('V116_REAL_ENCLOSURES_PASS',JSON.stringify({closedBays:s.closedBayCount,
  canonicalStorefronts:s.storefrontCount,names:s.closedBayNames,errors,remote}));
}finally{await browser.close()}
