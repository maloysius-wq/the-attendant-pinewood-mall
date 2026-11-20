/** Actual 1440x900 game with the original door and physical source wall. No manual WASD. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',dir='artifacts/v144-original-wall-cues';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_CH1_ATMOSPHERE_V144_QA__?.getState?.().physicalNotices?.length===3,
  null,{timeout:540000,polling:500});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_CH1_ATMOSPHERE_V144_QA__.getState());
 const before=await get();
 assert.equal(before.chapter,1);assert.equal(before.independentColliders,0);
 assert.equal(before.independentInteractables,0);
 assert.ok(before.physicalNotices.every(x=>x.attached&&x.originalWall));
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const door=await page.evaluate(()=>{
  const q=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__,p=q.doorApproach();
  return q.walkTo(p.x,p.z,'walk-to-physical-fire-door');
 });
 assert.ok(door.actualSteps>20);
 await page.keyboard.press('KeyE');
 await page.waitForFunction(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__?.getState?.().door?.openFraction>.97,
  null,{timeout:90000,polling:300});
 const positions=[];
 for(const id of ['A','B','C']){
  const s=await page.evaluate(id=>{
   const q=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__;
   const panel=q.getState().panels.find(x=>x.id===id);
   const walked=q.walkTo(panel.approach.x,panel.approach.z,'physical-sign-'+id);
   const sign=window.__PINEWOOD_CH1_ATMOSPHERE_V144_QA__.getState()
    .physicalNotices.find(x=>x.breaker===id);
   return {walked,sign};
  },id);
  assert.ok(s.walked.actualSteps>3);
  assert.equal(s.sign.attached,true);positions.push({id,...s});
  await page.screenshot({path:dir+'/source-notice-'+id+'.png',
   animations:'disabled',timeout:120000});
 }
 const filtered=failed.filter(x=>!/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(x));
 const report={before,positions,after:await get(),errors,remote,failed:filtered};
 await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(filtered,[]);
 console.log('V144_ORIGINAL_WALL_NOTICES_PASS '+JSON.stringify({
  physicalNotices:before.physicalNotices.length,originalMovement:true,errors,remote,failed:filtered
 }));
}finally{await browser.close();}
