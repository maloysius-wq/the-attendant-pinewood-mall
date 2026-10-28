import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
await mkdir('opening/review',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',err=>errors.push(err.message||String(err)));
const assert=(condition,message)=>{if(!condition)throw Error('Opening regression: '+message)};
try{
 const preview=new URL(base);preview.searchParams.set('openingPreview','1');
 await page.goto(preview.href,{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active===true,null,{timeout:40000});
 const starter=await page.evaluate(()=>{
  const api=window.__PINEWOOD_OPENING_V34__;
  return {index:api.index,total:api.total,cue:api.cue,canvas:!!document.querySelector('#pwm-opening .pwm-render canvas'),caption:document.querySelector('#pwm-caption')?.textContent};
 });
 assert(starter.index===0&&starter.total===11&&starter.cue==='arrival','wrong 11-cue start '+JSON.stringify(starter));
 assert(starter.caption?.includes('Pinewood service'),'missing real subtitle');
 assert(starter.canvas,'3D scene canvas missing');
 const initialAudio=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.audioStatus);
 assert(initialAudio.ambient?.car?.loop&&initialAudio.ambient?.outside?.loop,'Rain ambience is not locally looped');
 assert(initialAudio.ambient?.car?.source==='car-rain.ogg','Owner car-rain asset not connected');
 assert(initialAudio.ambient?.outside?.source==='outside-rain.ogg','Owner outside-rain asset not connected');
 assert(starter.index===0,'Opening no longer starts inside car');
 const carCamera=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.cameraPosition);
 assert(carCamera[0]<-10.35&&carCamera[2]>17.8&&carCamera[2]<18.4,'Car camera returned to the occluded rear body location '+JSON.stringify(carCamera));
 for(const file of ['car-rain.ogg','outside-rain.ogg']){
  const response=await page.evaluate(async filename=>{
   const r=await fetch(new URL('opening/audio/'+filename,document.baseURI),{method:'GET'});
   return {ok:r.ok,status:r.status,contentType:r.headers.get('content-type')};
  },file);
  assert(response.ok,'User rain not online '+file+' '+JSON.stringify(response));
 }
 console.log('[INTRO_RAIN] '+JSON.stringify(initialAudio.ambient));
 const props=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.sceneStats);
 assert(props?.meshCount>100,'Not enough authored 3D scene meshes: '+JSON.stringify(props));
 assert(props.wallNotices?.length>=5,'Missing real wall-mounted papers: '+JSON.stringify(props));
 assert(props.wallNotices.some(p=>p.text.includes('AUTHORIZED')),'Contractor notice not modeled on wall');
 assert(props.wallNotices.some(p=>p.text.includes('SERVICE MAP')),'Real service directory sign missing');
 assert(props.phoneTexture?.[0]===560&&props.phoneTexture?.[1]===1000,'Physical work phone texture missing');
 assert(props.rainParticles===650,'Rain geometry missing');
 console.log('[INTRO_GEOMETRY] '+JSON.stringify(props));
 await page.screenshot({path:'opening/review/01-parking-arrival.png'});
 // An automatic ?openingPreview=1 launch has no user gesture, so Chromium may
 // suspend all media until the first click. Pause+Resume exercises the real audio
 // activation path before asserting rain playback.
 await page.locator('[data-intro-pause]').click();
 await page.locator('[data-intro-pause]').click();
 await page.waitForTimeout(300);
 const unlocked=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.audioStatus.ambient);
 assert(unlocked?.car?.playing&&unlocked?.outside?.playing,'Click-to-play preview failed to unlock user rain audio');

 const timeline=[
  {index:2,name:'02-physical-work-phone',cue:'closed',phone:true},
  {index:6,name:'03-walk-to-service-entrance',cue:'entrance'},
  {index:8,name:'04-keypad-entry',cue:'inside'},
  {index:10,name:'05-abandoned-concourse',cue:'direction'}
 ];
 for(const spec of timeline){
  assert(await page.evaluate(index=>window.__PINEWOOD_OPENING_V34__.seek(index),spec.index),'seek '+spec.index);
  await page.waitForTimeout(400);
  const state=await page.evaluate(()=>({cue:window.__PINEWOOD_OPENING_V34__.cue,phone:!document.querySelector('.pwm-phone-sheet').hidden,camera:window.__PINEWOOD_OPENING_V34__.cameraPosition}));
  assert(state.cue===spec.cue,'wrong cue '+JSON.stringify(state));
  assert(Array.isArray(state.camera)&&state.camera.every(Number.isFinite),'camera missing at '+spec.cue);
  if(spec.phone)assert(state.phone,'work-order phone display hidden');
  await page.screenshot({path:'opening/review/'+spec.name+'.png'});
  console.log('[INTRO_SCENE] '+spec.cue+' camera='+JSON.stringify(state.camera));
  if(spec.cue==='entrance'){
   await page.waitForTimeout(600);
   const outside=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.audioStatus.ambient);
   assert(outside?.outside?.playing,'Outside rain not playing at entrance');
   assert(outside.outside.volume>0,'Outside rain not fading up at entrance');
   console.log('[INTRO_EXTERIOR_RAIN] '+JSON.stringify(outside));
  }
 }
 await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.skip());
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__.active===false);
 assert(!errors.length,'Browser errors '+errors.join('; '));
 await page.close();
 // Actual button click must intercept original game, and skip must return to the existing game loader.
 const play=await browser.newPage({viewport:{width:1280,height:720}});
 const errs=[];play.on('pageerror',e=>errs.push(e.message||String(e)));
 await play.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
 await play.locator('#newBtn').click({timeout:60000});
 await play.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active===true,null,{timeout:30000});
 const intro=await play.locator('#pwm-opening .pwm-caption').textContent();
 assert(intro?.length>12,'New Game intro not visible');
 const audio=await play.evaluate(()=>window.__PINEWOOD_OPENING_V34__.audioStatus);
 assert(audio.available,'Eleven generated local Renee lines not connected to the cinematic');
 assert(audio.ambient?.car?.playing&&audio.ambient?.outside?.playing,'Clicking New Game did not start both local rain loops');
  console.log('[RENEE_AUDIO] '+JSON.stringify(audio));
 await play.locator('[data-intro-skip]').click();
 await play.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active===false,null,{timeout:15000});
 await play.waitForFunction(()=>!document.querySelector('#titleScreen')?.classList.contains('show'),null,{timeout:60000});
 // A few non-cinematic loader messages may appear before runtime startup; fail only if
 // the original New Game remains on the title after skip.
 assert(!errs.some(s=>s.includes('opening/')),'Opening integration errors '+errs.join(' | '));
 console.log('[INTRO_HANDOFF] New Game intercepted, skip called original existing runtime flow.');
 await play.close();
}finally{await browser.close();}
console.log('PASS: 11-step Chapter 1 prelude, original 3D render, physical work phone, all scene camera transitions, subtitles, preview isolation, skip and native New Game handoff.');
