import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173';
await mkdir('opening-v65-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required']});
try{
 for(const [name,width,height] of [['desktop',1280,720],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[],remote=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{
   if(/^https?:/.test(request.url())&&!request.url().startsWith(origin))remote.push(request.url());
  });
  await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#newBtn')&&window.__PINEWOOD_OPENING_V34__,null,{timeout:60000});
  await page.locator('#newBtn').click();
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:120000});
  const meta=await page.evaluate(()=>{
   const qa=window.__PINEWOOD_OPENING_V34__;
   return {env:qa.environmentV37,entry:qa.serviceEntryGeometry,startup:qa.startupStatus};
  });
  const f=meta.env?.facadeV65;
  assert.equal(f?.state,'ready',name+' facade preload');
  assert.equal(f.textureLoaded,true);
  assert.equal(f.frontWindowCount,2);
  assert.equal(f.mainEntranceBoarded,true);
  assert.equal(f.mainEntrance.routeBlocked,true);
  assert.equal(f.sign.width,27.1);
  assert.ok(f.heightMeters>=17);
  assert.equal(meta.env.landscape?.version,64,name+' v64 planter preservation');
  assert.equal(meta.env.landscape?.count,8);
  assert.equal(meta.env.landscape?.scaleFactor,2);
  assert.equal(meta.entry?.opening?.centerX,12);
  assert.equal(meta.entry?.doorSpecs?.width,1.78);
  assert.equal(meta.entry?.doorSpecs?.height,2.27);
  assert.equal(meta.startup.firstFrameRendered,true);
  // Cinematic seek only — no WASD, no moving through scripted geometry.
  const captures=[
   [3,.25,'car-establishing'],
   [5,.85,'mall-from-car'],
   [6,.75,'sign-and-entry'],
   [7,.95,'walking-facade'],
   [8,.20,'service-door']
  ];
  for(const [cue,phase,label]of captures){
   await page.evaluate(({cue,phase})=>{
    const qa=window.__PINEWOOD_OPENING_V34__;
    qa.seek(cue);qa.scrub(phase);
   },{cue,phase});
   await page.waitForTimeout(520);
   await page.screenshot({path:'opening-v65-artifacts/'+name+'-'+label+'.png'});
  }
  assert.deepEqual(errors,[],name+' script errors');
  assert.deepEqual(remote,[],name+' runtime remote assets');
  await writeFile('opening-v65-artifacts/'+name+'-status.json',JSON.stringify({
   facade:f,entry:meta.entry,landscape:meta.env.landscape,errors,remote
  },null,2));
  console.log('V65_'+name.toUpperCase()+'_PASS '+JSON.stringify({
   height:f.heightMeters,frontWindows:f.frontWindowCount,
   boarded:f.mainEntranceBoarded,signWidth:f.sign.width,errors,remote
  }));
  await page.close();
 }
}finally{await browser.close();}
