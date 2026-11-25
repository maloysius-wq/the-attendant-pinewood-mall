/** Actual desktop game, fresh New Game and native E at the original door.
 * Every tested player position is reached by genuine Game.tryMove steps.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {SUNBURST_FIXTURES_V126,arcadePlayApproachesV159} from '../mall/sunburst-arcade-plan-v126.mjs';
const origin='http://127.0.0.1:4173',dir='artifacts/v159-native-arcade';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
const errors=[],remote=[],failed=[],walks=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin+'/'))remote.push(r.url());});
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__?.getState?.().chapter===1,null,{timeout:540000,polling:500});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.getState());
 const before=await get();assert.deepEqual(before.player,{x:12.5,z:-32.75});assert.equal(before.doorBlocked,true);
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 walks.push(await page.evaluate(()=>{const a=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__,p=a.doorApproach();return a.walkTo(p.x,p.z,'original door approach')}));
 await page.keyboard.press('KeyE');
 await page.waitForFunction(()=>{const s=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.getState();return s.door?.openFraction>.97&&!s.doorBlocked;},null,{timeout:90000});
 walks.push(await page.evaluate(()=>{const a=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__,p=a.doorBeyond();return a.walkTo(p.x,p.z,'original door crossed')}));
 const walk=async p=>{
  const r=await page.evaluate(p=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.walkArcadeTo(p.x,p.z,p.id),p);
  assert.equal(r.worldCanStand,true);assert.ok(Math.hypot(r.end.x-p.x,r.end.z-p.z)<.015);walks.push(r);return r;
 };
 const entry=await walk({id:'Sunburst real storefront',x:-30,z:-98.5});
 assert.equal(entry.room,'sunburst_arcade');
 await page.screenshot({path:dir+'/native-entered-arcade.png',timeout:120000,animations:'disabled'});
 const todo=SUNBURST_FIXTURES_V126.flatMap(arcadePlayApproachesV159);
 let pos=entry.end;
 // Nearest-neighbour visiting order, without skipping any authored approach.
 while(todo.length){
  todo.sort((a,b)=>Math.hypot(a.x-pos.x,a.z-pos.z)-Math.hypot(b.x-pos.x,b.z-pos.z));
  const a=todo.shift(),r=await walk(a);assert.equal(r.room,'sunburst_arcade');pos=r.end;
  console.log('V159_NATIVE_APPROACH '+JSON.stringify(r));
 }
 const stats=await page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.travelStats());
 assert.ok(stats.steps>1000&&stats.meters>90,'genuine full-size arcade walking required');
 const unexpected=failed.filter(s=>!/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(s));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(unexpected,[]);
 console.log('V159_NATIVE_ARCADE_PASS '+JSON.stringify({approaches:walks.length-3,stats,errors,remote,unexpected}));
 await writeFile(dir+'/report.json',JSON.stringify({walks,stats,errors,remote,unexpected},null,2));
}finally{await writeFile(dir+'/progress.json',JSON.stringify({walks,errors,remote,failed},null,2));await browser.close();}
