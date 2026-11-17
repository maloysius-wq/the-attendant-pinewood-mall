import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173',folder='artifacts/v123-real-stock-auditions';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:980},deviceScaleFactor:1});
 const errors=[],consoleErrors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(String(e.message)));
 page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text())});
 page.on('request',req=>{
  if(/^https?:/.test(req.url())&&!req.url().startsWith(origin))remote.push(req.url());
 });
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/retail-assets-v123/',{waitUntil:'domcontentloaded'});
 try{
  await page.waitForFunction(()=>{
   const a=window.__PINEWOOD_RETAIL_AUDIT_V123__;
   return a?.ready||a?.getState?.().errors.length>0;
  },null,{timeout:90000});
 }catch(e){
  console.log('V123_GLTF_STARTUP_FAILED '+JSON.stringify({
   errors,consoleErrors,remote,failed,
   body:(await page.locator('body').innerText()).slice(0,1100),
   state:await page.evaluate(()=>window.__PINEWOOD_RETAIL_AUDIT_V123__?.getState?.())
  }));
  throw e;
 }
 const get=()=>page.evaluate(()=>window.__PINEWOOD_RETAIL_AUDIT_V123__.getState());
 const initial=await get();
 assert.equal(initial.ready,true,initial.errors.join(' | '));
 assert.equal(initial.assets.some(a=>a.id==='folded_stock_cube'),true);
 assert.equal(initial.assets.some(a=>a.id==='promo_bin'),true);
 assert.deepEqual(initial.errors,[]);
 assert.equal(initial.firstFrameFullyLoaded,true);
 assert.equal(initial.assets.length,8);
 assert.equal(initial.localModels,8);
 
 assert.equal(new Set(initial.assets.map(x=>x.id)).size,6);
 for(const a of initial.assets){
  assert.ok(a.sourceMeshCount>=1,'missing genuine mesh '+a.id);
  assert.ok(Number.isFinite(a.width)&&a.width>.02&&Number.isFinite(a.depth)&&a.depth>.02);
  assert.ok(Math.abs(a.height-a.targetHeight)<.0001,
   'not at actual planned human-scale target height '+a.id);
  assert.equal(a.license,'CC0-1.0');
 }
 for(const name of ['overview',...initial.assets.map(a=>a.id)]){
  await page.evaluate(n=>window.__PINEWOOD_RETAIL_AUDIT_V123__.goto(n),name);
  await page.waitForTimeout(220);
  assert.equal((await get()).shot,name);
  await page.screenshot({path:folder+'/'+name+'.png',fullPage:true,animations:'disabled'});
 }
 assert.deepEqual(errors,[]);
 assert.deepEqual(consoleErrors,[]);
 assert.deepEqual(remote,[]);
 assert.deepEqual(failed,[]);
 await writeFile(folder+'/source-geometry.json',JSON.stringify(initial,null,2));
 console.log('PINEWOOD_V123_REAL_STOCK_GLTF_AUDIT_PASS '+JSON.stringify({
  actual:initial.assets.map(x=>({id:x.id,w:x.width,h:x.height,d:x.depth,plausible:x.physicallyPlausible,meshes:x.sourceMeshCount})),
  remote,errors,failed
 }));
}finally{await browser.close()}
