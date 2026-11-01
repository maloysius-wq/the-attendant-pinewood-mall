import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

// The real vendored hatchback download is delayed, not replaced by a fake.
// The movie must not render an unfinished placeholder scene or start dialogue.
const origin='http://127.0.0.1:4173';
const url=origin+'/review/the-call-v34/';
const assert=(v,message)=>{if(!v)throw Error(message);};
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required']});
await mkdir('opening-v61-artifacts',{recursive:true});
const report={layouts:{},failureCase:null,passed:false};
try{
 for(const [name,width,height] of [['desktop',1280,720],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());});
  let release=()=>{},blocked=()=>{};
  const gate=new Promise(resolve=>release=resolve);
  const intercepted=new Promise(resolve=>blocked=resolve);
  await page.route('**/opening/assets/v42/1990s-hatchback.glb',async route=>{
   blocked();await gate;await route.continue();
  });
  try{
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__&&document.querySelector('#titleScreen.show #newBtn'),null,{timeout:90000});
   await page.locator('#newBtn').click();
   await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:30000});
   await Promise.race([intercepted,new Promise((_,reject)=>setTimeout(()=>reject(Error('Hatchback load not requested')),65000))]);
   await page.waitForTimeout(300);
   const during=await page.evaluate(()=>{
    const a=window.__PINEWOOD_OPENING_V34__,root=document.querySelector('#pwm-opening');
    return{active:a.active,index:a.index,environment:a.environmentV37?.state,
     overlayVisible:!!root?.querySelector('[data-intro-preload]')&&!root.querySelector('[data-intro-preload]').hidden,
     preloadState:root?.dataset.preloadState,audioAvailable:a.audioStatus?.available,
     caption:root?.querySelector('#pwm-caption')?.textContent,
     accessibleSkip:!!root?.querySelector('[data-intro-preload-skip]')};
   });
   console.log('V61_BLOCKED_'+name.toUpperCase()+'='+JSON.stringify(during));
   assert(during.active&&during.environment==='loading',
    name+' did not actually block original scene asset: '+JSON.stringify(during));
   assert(during.overlayVisible&&during.preloadState==='loading',
    name+' exposed incomplete mall/car instead of covering the entire cinematic: '+JSON.stringify(during));
   assert(during.index===-1&&!during.audioAvailable&&!during.caption,
    name+' dialogue/clock started before full scene and car were available: '+JSON.stringify(during));
   assert(during.accessibleSkip,name+' loading screen has no Skip intro option');
   await page.screenshot({path:'opening-v61-artifacts/'+name+'-loading.png'});
   release();
   await page.waitForFunction(()=>{
    const a=window.__PINEWOOD_OPENING_V34__,root=document.querySelector('#pwm-opening');
    return a?.active&&root?.dataset.preloadState==='ready'
      &&root.querySelector('[data-intro-preload]')?.hidden&&a?.environmentV37?.state==='ready'
      &&a?.handheldPhone?.hand?.state==='ready'&&a?.index===0;
   },null,{timeout:90000});
   const ready=await page.evaluate(()=>{
    const a=window.__PINEWOOD_OPENING_V34__,root=document.querySelector('#pwm-opening'),
     s=a.environmentV37;
    return{index:a.index,preloadState:root.dataset.preloadState,
     car:s.car,carMeshes:s.modelMeshes,maps:s.maps,stage:s.state,
     hand:a.handheldPhone?.hand?.state,
     firstFrameRendered:a.startupStatus?.firstFrameRendered,
     focus:document.activeElement?.getAttribute('data-intro-pause')!==null,
     visibleCanvas:!!root.querySelector('.pwm-render canvas')};
   });
   console.log('V61_READY_'+name.toUpperCase()+'='+JSON.stringify(ready));
   assert(ready.preloadState==='ready'&&ready.stage==='ready'
     &&ready.car==='loaded'&&ready.carMeshes>=5&&ready.maps?.length===3
     &&ready.hand==='ready'&&ready.firstFrameRendered&&ready.visibleCanvas&&ready.focus,
    name+' revealed movie before car/textures/hand/GPU first render: '+JSON.stringify(ready));
   await page.screenshot({path:'opening-v61-artifacts/'+name+'-first-reveal.png'});
   assert(errors.length===0&&!remote.length,name+' browser or remote request errors '+JSON.stringify({errors,remote}));
   report.layouts[name]={passed:true,during,ready};
  }finally{
   release();
   await page.close();
  }
 }
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 await page.route('**/opening/assets/v42/1990s-hatchback.glb',route=>route.abort('failed'));
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__&&document.querySelector('#titleScreen.show #newBtn'),null,{timeout:90000});
  await page.locator('#newBtn').click();
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.environmentV37?.state==='failed',null,{timeout:90000});
  await page.waitForFunction(()=>document.querySelector('#pwm-opening')?.dataset.preloadState==='failed',null,{timeout:30000});
  const failed=await page.evaluate(()=>{
   const root=document.querySelector('#pwm-opening'),a=window.__PINEWOOD_OPENING_V34__;
   return{overlay:!root.querySelector('[data-intro-preload]').hidden,
    state:root.dataset.preloadState,index:a.index,skip:!!root.querySelector('[data-intro-preload-skip]')};
  });
  assert(failed.overlay&&failed.state==='failed'&&failed.index===-1&&failed.skip,
   'Missing car must keep broken scene hidden and offer safe Skip: '+JSON.stringify(failed));
  await page.locator('[data-intro-preload-skip]').click();
  await page.waitForFunction(()=>document.querySelector('#pwm-opening')?.hidden&&!window.__PINEWOOD_OPENING_V34__.active,null,{timeout:7000});
  report.failureCase={passed:true,...failed};
 }finally{await page.close();}
 report.passed=true;
}finally{
 await browser.close();
 await writeFile('opening-v61-artifacts/report.json',JSON.stringify(report,null,2));
}
if(!report.passed)throw Error('v61 preload regression incomplete');
console.log('V61_PRELOAD_PASS '+JSON.stringify(report));
