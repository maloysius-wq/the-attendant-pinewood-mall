/** Actual original desktop Game.tryMove; one isolated start outside
 * Fallow's, then every metre is pedestrian movement through live colliders.
 * Existing localhost-only V143 hook; no new production QA surface.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {GALLERY_AMENITIES_V120,benchApproachV163} from '../mall/gallery-amenities-v120.mjs';
const dir='artifacts/v163-native-gallery',origin='http://127.0.0.1:4173';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
const errors=[],remote=[],failed=[],walks=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin+'/'))remote.push(r.url());});
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1&fallowsFixtureQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__?.getState?.().chapter===1,null,{timeout:540000,polling:500});
 const before=await page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.getState());
 assert.deepEqual(before.player,{x:12.5,z:-32.75});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const seeded=await page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.startFallowsFixture());
 assert.equal(seeded.isolatedStartingFixture,true);assert.equal(seeded.room,'west_gallery');
 const stations=(room,sort)=>
  GALLERY_AMENITIES_V120.benches.filter(b=>b.room===room).sort(sort).map(b=>{
   const a=benchApproachV163(b);return [b.id,a.x,a.z,room];
  });
 const visits=[
  ['west south spine',-20,-57,'west_gallery'],...stations('west_gallery',(a,b)=>b.z-a.z),
  ['west north spine',-20,-104,'west_gallery'],
  ['north atrium center',0,-105,'central_gallery'],
  ['north directory approach',3,-99.3,'central_gallery'],
  ['LS-02',7,-94,'central_gallery'],
  ...stations('central_gallery',(a,b)=>a.z-b.z||a.x-b.x),
  ['LS-01',7,-66,'central_gallery'],
  ['south directory approach',-3,-50.3,'central_gallery'],
  ['south atrium center',0,-52,'central_gallery'],
  ['east south spine',20,-57,'east_gallery'],...stations('east_gallery',(a,b)=>b.z-a.z),
  ['east north spine',20,-104,'east_gallery']
 ];
 for(const [label,x,z,room] of visits){
  const r=await page.evaluate(({label,x,z})=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.walkArcadeTo(x,z,label),{label,x,z});
  assert.equal(r.worldCanStand,true,label);assert.ok(Math.hypot(r.end.x-x,r.end.z-z)<.015,label);assert.equal(r.room,room,label);
  walks.push(r);console.log('V163_NATIVE_APPROACH '+JSON.stringify(r));
  await writeFile(dir+'/progress.json',JSON.stringify({walks,errors,remote,failed},null,2));
 }
 const stats=await page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.travelStats());
 assert.ok(stats.steps>1200&&stats.meters>100,'actual gallery traversal required');
 assert.equal(walks.length,30); // 20 seat approaches plus ten route/landmark approaches
 const unexpected=failed.filter(s=>!/furniture_shop_loop\.ogg net::ERR_(?:ABORTED|CACHE_RACE)$/.test(s));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(unexpected,[]);
 console.log('V163_NATIVE_GALLERY_PASS '+JSON.stringify({stats,visits:walks.length,errors,remote,unexpected}));
}finally{await writeFile(dir+'/progress.json',JSON.stringify({walks,errors,remote,failed},null,2));await browser.close();}
