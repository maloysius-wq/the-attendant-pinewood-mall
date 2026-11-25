/** Original desktop game: one explicitly isolated gallery start, then
 * actual Game.tryMove on every stride through East Department and back out. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/v161-native-east',origin='http://127.0.0.1:4173';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
const errors=[],remote=[],failed=[],walks=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin+'/'))remote.push(r.url());});
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1&eastDepartmentFixtureQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__?.getState?.().chapter===1,null,{timeout:540000,polling:500});
 const before=await page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.getState());
 assert.deepEqual(before.player,{x:12.5,z:-32.75});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const seeded=await page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.startEastDepartmentFixture());
 assert.equal(seeded.isolatedStartingFixture,true);assert.equal(seeded.room,'east_gallery');
 const visits=[
 ['threshold',30,-52],['north central aisle',36.2,-50.2],['north clearance table',37.5,-46.4],
 ['north wall display',36.5,-44.6],['stripped display bank',42.7,-46.4],
 ['rear cross aisle',44,-52],['south aisle',36.3,-53.6],
 ['south return table',37.5,-57.8],['southern perimeter',36.5,-59.4],
 ['checkout queue',41.3,-56.5],['cashier rear',44.5,-56.5],['front aisle',30,-52],
 ['return to gallery',26.5,-52]
 ];
 for(const [label,x,z] of visits){
  const r=await page.evaluate(({label,x,z})=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.walkArcadeTo(x,z,label),{label,x,z});
  assert.equal(r.worldCanStand,true,label);assert.ok(Math.hypot(r.end.x-x,r.end.z-z)<.015,label);
  assert.equal(r.room,label==='return to gallery'?'east_gallery':'east_original_anchor',label);
  walks.push(r);console.log('V161_NATIVE_APPROACH '+JSON.stringify(r));
  if(['north central aisle','checkout queue','southern perimeter'].includes(label))await page.screenshot({path:dir+'/'+label.replaceAll(' ','-')+'.png',timeout:120000,animations:'disabled'});
 }
 const stats=await page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.travelStats());
 assert.ok(stats.steps>300&&stats.meters>25,'actual continuous shop traversal required');
 const unexpected=failed.filter(s=>!/furniture_shop_loop\.ogg net::ERR_(?:ABORTED|CACHE_RACE)$/.test(s));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(unexpected,[]);
 console.log('V161_NATIVE_EAST_PASS '+JSON.stringify({stats,visits:walks.length,errors,remote,unexpected}));
}finally{await writeFile(dir+'/progress.json',JSON.stringify({walks,errors,remote,failed},null,2));await browser.close();}
