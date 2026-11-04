import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';

const origin='http://127.0.0.1:4173',path='/review/mall-construction-v67/';
await mkdir('mall-v67-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
try{
 for(const [name,width,height] of [['desktop',1440,900]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[],remote=[],failedRequests=[],consoleErrors=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('requestfailed',r=>failedRequests.push({url:r.url(),reason:r.failure()?.errorText}));
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
  await page.goto(origin+path,{waitUntil:'domcontentloaded'});
  try{await page.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.ready,null,{timeout:26000})}catch(error){
   const diagnostic=await page.evaluate(()=>({api:window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.()??null,body:document.body?.innerText?.slice(0,3000)??null,modules:[...document.querySelectorAll('script')].map(s=>s.src||s.type)}));
   console.error('MALL_V67_STARTUP_DIAGNOSTIC',JSON.stringify({name,diagnostic,errors,remote,failedRequests,consoleErrors}));
   await page.screenshot({path:'mall-v67-artifacts/'+name+'-startup-failure.png',fullPage:true}).catch(()=>{});
   throw error;
  }
  const state=()=>page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
  const initial=await state();
  assert.deepEqual(initial.errors,[],name+' physical geometry and renderer errors');
  assert.equal(initial.firstFrameFullyLoaded,true,'first visible frame must have all models and textures');
  assert.ok(initial.texturesLoaded>=8,'PBR maps must preload locally');
  assert.ok(initial.modelsLoaded>=6,'CC0 ground-floor fixtures must preload');
  assert.ok(initial.walls>=80,'actual ground floor walls rendered');
  assert.equal(initial.floor,'G');
  const expectedCeilings=MALL.rooms.filter(room=>room.level==='G'&&room.id!=='central_gallery')
   .map(room=>room.id).sort();
  assert.deepEqual(initial.ceilingRooms,expectedCeilings,
   'every enclosed ground-floor room must have an actual rendered ceiling mesh');
  assert.ok(initial.ceilingMeshes>=expectedCeilings.length,
   'stair and elevator cutouts must retain multiple actual ceiling slab pieces');
  const cameras=[
   ['service','service-entry','G'],
   ['boarded','boarded-main-door','G'],
   ['atrium','dry-atrium','G'],
   ['west','cassette-castle','G'],
   ['east','east-wing','G'],
   ['security','security','G'],
   ['below','below-grade','B1'],
   ['stairs','basement-stair','B1'],
   ['mezz','mezzanine-overlook','M1'],
   ['pa','pa-room','M1'],
   ['exit','east-employee-exit','G']
  ];
  for(const [shot,label,level]of cameras){
   await page.evaluate(shot=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(shot),shot);
   await page.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.ready,null,{timeout:90000});
   await page.waitForFunction(expected=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState().floor===expected,level,{timeout:90000});
   await page.waitForTimeout(260);
   const q=await state();
   assert.equal(q.floor,level,label+' level');
   assert.deepEqual(q.errors,[],label+' geometry and assets');
   assert.equal(q.firstFrameFullyLoaded,true,label+' first-frame preload');
   assert.ok(q.walls>=20,label+' architectural wall count');
   await page.screenshot({path:'mall-v67-artifacts/'+name+'-'+label+'.png',fullPage:true});
  }
  await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(5));
  await page.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState().chapter===5);
  assert.equal((await state()).eastExitLocked,true,'not released before closing ritual');
  await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.setChapter(6));
  await page.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState().chapter===6);
  assert.equal((await state()).eastExitLocked,false,'final employee exit opens only after clock-out');
  assert.deepEqual(errors,[],name+' javascript errors');
  assert.deepEqual(remote,[],name+' remote runtime assets');
  await writeFile('mall-v67-artifacts/'+name+'-audit.json',JSON.stringify({initial,final:await state(),errors,remote},null,2));
  console.log('MALL_V67_'+name.toUpperCase()+'_PASS '+JSON.stringify({walls:initial.walls,texturesLoaded:initial.texturesLoaded,modelsLoaded:initial.modelsLoaded,errors,remote}));
  await page.close();
 }
}finally{await browser.close();}