import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173';
const dir='artifacts/v119-baseline-food';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],external=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('blob:'+origin+'/'))external.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/food-court-v119/',{waitUntil:'domcontentloaded'});
 try{
  await page.waitForFunction(()=>window.__PINEWOOD_FOOD_COURT_V119__?.ready,null,{timeout:115000});
 }catch(e){
  console.log('V119_BASELINE_FAILED '+JSON.stringify({errors,external,failed,
   body:(await page.locator('body').innerText()).slice(0,1400),
   state:await page.evaluate(()=>window.__PINEWOOD_FOOD_COURT_V119__?.getState?.())}));
  throw e;
 }
 const state=()=>page.evaluate(()=>window.__PINEWOOD_FOOD_COURT_V119__.getState());
 const initial=await state();
 assert.deepEqual(initial.errors,[]);
 assert.equal(initial.firstFrameFullyLoaded,true);
 assert.deepEqual(initial.room,{id:'food_court',x1:29,x2:46,z1:-97,z2:-80});
 assert.equal(initial.furniture.length,12,'4 original tables + 6 seats + 2 table props');
 assert.ok(initial.furniture.every(f=>f.measuredHeight>0&&f.width>0&&f.depth>0));
 for(const shot of ['entrance','seating','rear','plan']){
  await page.evaluate(s=>window.__PINEWOOD_FOOD_COURT_V119__.goto(s),shot);
  await page.waitForTimeout(350);
  assert.equal((await state()).shot,shot);
  await page.screenshot({path:dir+'/'+shot+'.png',fullPage:true,animations:'disabled'});
 }
 assert.deepEqual(errors,[]);
 assert.deepEqual(external,[],'all source assets must be same origin');
 assert.deepEqual(failed,[],'all pinned assets load');
 await writeFile(dir+'/actual-furniture.json',JSON.stringify(initial,null,2));
 console.log('V119_BASELINE_FURNISHED_PASS '+JSON.stringify({
  furniture:initial.furniture.length,modelsLoaded:initial.modelsLoaded,
  entries:initial.furniture.map(f=>({id:f.id,x:f.centerX,z:f.centerZ,w:f.width,d:f.depth})),
  errors,external,failed
 }));
}finally{await browser.close()}