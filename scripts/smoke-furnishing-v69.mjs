import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const artifactDir='mall-v69-artifacts';
await mkdir(artifactDir,{recursive:true});
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 for(const [device,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[],remote=[],consoleErrors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
  await page.goto(origin+'/review/mall-interiors-v69/',{waitUntil:'domcontentloaded'});
  try{
   await page.waitForFunction(()=>window.__PINEWOOD_MALL_INTERIORS_V69__?.ready,null,{timeout:60000});
  }catch(e){
   console.error('MALL_V69_STARTUP',JSON.stringify({errors,remote,consoleErrors,body:(await page.locator('body').innerText()).slice(0,1900)}));throw e;
  }
  const state=()=>page.evaluate(()=>window.__PINEWOOD_MALL_INTERIORS_V69__.getState());
  const initial=await state();
  assert.deepEqual(initial.errors,[],device+' loaded without runtime errors');
  assert.equal(initial.firstFrameFullyLoaded,true,'all 3D assets render before removing the loading screen');
  assert.equal(initial.furnishingsLoaded,60,'exactly sixty licensed fitted model fixtures');
  assert.ok(initial.modelsLoaded>=66,'legacy models plus all new CC0 fixtures');
  assert.equal(initial.furnitureManifest.length,60,'all imported GLBs are physically measured after fitting');
  for(const model of initial.furnitureManifest){
   assert.ok(model.measuredHeight>=model.requestedHeight*.82,
    model.id+' shrank to '+model.measuredHeight.toFixed(2)+'m instead of '+model.requestedHeight+'m');
  }
  for(const id of ['cassette_rack_w1','cassette_rack_w2','cassette_rack_e1']){
   assert.ok(initial.furnitureManifest.find(f=>f.id===id)?.measuredHeight>=1.65,id+' cannot be toy-sized');
  }
  assert.ok(initial.uniqueModels>=14,'distinct imported assets are actually loaded');
  assert.ok(initial.walls>=140,'original physical architectural shell preserved');
  assert.equal(initial.texturesLoaded,8,'all original licensed architectural texture maps');
  assert.equal(initial.signText,'PINEWOOD MALL','approved frontage remains');
  assert.equal(initial.entryBoarded,true,'boarded main entrance remains');
  assert.equal(initial.serviceOpen,true,'contractor door remains');
  assert.equal(initial.storyAnchors.length,9,'each canonical narrative location retained');
  assert.ok(initial.supportChecks.length>=6,'several true measured tabletop placements');
  assert.equal(initial.supportChecks.find(s=>s.id==='cc0_cassette_register')?.support,'cassette_counter','legacy register rehomed onto physical cashier counter');
  assert.ok(initial.supportChecks.every(s=>s.supported===true),'no floating prop');
  assert.deepEqual(initial.clearanceWarnings,[],'no imported model extends past its measured collision footprint');
  for(const [shot,floor] of [
   ['frontage','G'],['atrium','G'],['cassette','G'],['arcade','G'],
   ['video','G'],['food','G'],['security','G'],['east','G'],
   ['training','G'],['lockers','G'],['b1','B1'],['mezz','M1'],
   ['records','M1'],['pa','M1'],['aerial','G']
  ]){
   await page.evaluate(s=>window.__PINEWOOD_MALL_INTERIORS_V69__.goto(s),shot);
   const s=await state();
   assert.equal(s.floor,floor,shot+' world floor');
   assert.deepEqual(s.errors,[],shot+' clean');
   if(shot!=='aerial')await page.screenshot({path:artifactDir+'/'+device+'-'+shot+'.png',fullPage:true});
   console.log('MALL_V69_SHOT '+device+' '+shot);
  }
  await page.evaluate(()=>window.__PINEWOOD_MALL_INTERIORS_V69__.setChapter(5));
  assert.equal((await state()).eastExitLocked,true);
  await page.evaluate(()=>window.__PINEWOOD_MALL_INTERIORS_V69__.setChapter(6));
  assert.equal((await state()).eastExitLocked,false);
  assert.deepEqual(remote,[],device+' local and vendored runtime assets only');
  assert.deepEqual(errors,[],device+' page errors');
  assert.deepEqual(consoleErrors,[],device+' console errors');
  await writeFile(artifactDir+'/'+device+'-audit.json',JSON.stringify({initial,final:await state(),remote,errors,consoleErrors},null,2));
  console.log('MALL_V69_'+device.toUpperCase()+'_PASS '+JSON.stringify({furnishings:initial.furnishingsLoaded,supports:initial.supportChecks.length,uniqueModels:initial.uniqueModels}));
  await page.close();
 }
}finally{await browser.close();}
