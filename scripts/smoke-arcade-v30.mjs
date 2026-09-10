import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const fail=m=>{throw new Error('Sunburst Arcade v30 browser smoke failed: '+m);};
const expect=(v,m)=>{if(!v)fail(m);};
const origin=new URL(base).origin,url=new URL(base);url.searchParams.set('visualTest','arcade-checkout');
await mkdir('visual-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
const errors=[],remote=[];
page.on('pageerror',e=>errors.push(e.stack||e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('request',r=>{try{const u=new URL(r.url());if((u.protocol==='http:'||u.protocol==='https:')&&u.origin!==origin)remote.push(r.url());}catch{}});
try{
  await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:90000});
  try{
    await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true&&window.__PINEWOOD_ARCADE_V30__?.version===30,null,{timeout:120000});
  }catch(err){
    const boot=await page.evaluate(()=>({visualReady:window.__PINEWOOD_VISUAL_READY__||false,arcade:window.__PINEWOOD_ARCADE_V30__||null,assetStatus:document.getElementById('assetStatus')?.textContent||'',body:(document.body?.innerText||'').slice(0,1200)})).catch(()=>null);
    await page.screenshot({path:'visual-artifacts/arcade-v30-boot-failure.png',fullPage:true}).catch(()=>{});
    fail('boot did not reach v30 visual-ready state: '+JSON.stringify({boot,errors,remote:[...new Set(remote)],cause:String(err?.message||err)}));
  }
  const result=await page.evaluate(async()=>{
    const telemetry=JSON.parse(JSON.stringify(window.__PINEWOOD_ARCADE_V30__));
    const manifest=await fetch('./assets/vendor/arcade-v30/manifest.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('arcade manifest HTTP '+r.status);return r.json();});
    const resources=performance.getEntriesByType('resource').map(e=>e.name).filter(n=>n.includes('/assets/vendor/arcade-v30/'));
    return {telemetry,manifest:{version:manifest.version,license:manifest.license,scale:manifest.scale,pack:manifest.files?.find(f=>f.path?.endsWith('/pack.glb'))||null},resources,assetStatus:document.getElementById('assetStatus')?.textContent||''};
  });
  const t=result.telemetry;
  expect(t?.version===30,'telemetry missing');
  expect(t.assetPack==='Token Gesture: Retro Arcade Props'&&t.license==='CC0 1.0','asset identity/provenance mismatch');
  expect(t.localOnly===true&&t.realWorldScale===true&&t.unit==='metre','runtime does not advertise local real-world metre scale');
  expect(t.machineCount===13&&t.fixtureCount===15,'expected 13 arcade assets plus checkout and protected cabinet, got '+JSON.stringify({machineCount:t.machineCount,fixtureCount:t.fixtureCount}));
  expect(Array.isArray(t.protectedInteractables)&&t.protectedInteractables.join('|')==='arcade-cabinet|noise-maker','protected arcade interactions missing');
  expect(Array.isArray(t.intersections)&&t.intersections.length===0,'fixture intersections detected: '+JSON.stringify(t.intersections));
  expect(t.entranceClear===true&&t.clearanceMetres===.08,'entrance/clearance contract failed');
  const fixture=new Map((t.fixtures||[]).map(f=>[f.id,f]));
  for(const [id,min] of [['upright-alpha',1.8],['upright-beta',1.8],['upright-gamma',1.9],['claw-machine',1.85],['dance-stage',1.84],['skee-ball',2.0]])expect((fixture.get(id)?.height||0)>=min,id+' is not human-scale: '+JSON.stringify(fixture.get(id)));
  expect(fixture.has('checkout')&&fixture.has('arcade-cabinet'),'checkout/protected cabinet missing from collision telemetry');
  expect(result.manifest.version===30&&result.manifest.license==='CC0 1.0'&&result.manifest.scale.includes('real-world metres'),'served asset manifest invalid');
  expect(result.manifest.pack?.bytes>1000000,'served combined arcade GLB missing');
  expect(result.resources.some(n=>n.includes('/assets/vendor/arcade-v30/token_gesture/pack.glb')),'full-scale arcade GLB was not requested by runtime');
  expect(errors.length===0,'browser errors: '+errors.join(' | '));
  expect(remote.length===0,'remote runtime requests: '+[...new Set(remote)].join(', '));
  await page.screenshot({path:'visual-artifacts/arcade-v30.png',fullPage:true});
  console.log(JSON.stringify({pass:true,...result,browserErrors:0,remoteRequests:0},null,2));
}finally{await page.close();await browser.close();}
