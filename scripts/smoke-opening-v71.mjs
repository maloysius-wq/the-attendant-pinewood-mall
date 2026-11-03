import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const origin='http://127.0.0.1:4173';
const failures=[],assert=(ok,message)=>{if(!ok){failures.push(message);console.error('V71_FAIL '+message)}};
const dir='opening-v71-artifacts';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required']});
const results={desktopOnly:true};
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',request=>{
  if(/^https?:/.test(request.url())&&!request.url().startsWith(origin))
   remote.push(request.url());
 });
 try{
  await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>document.querySelector('#titleScreen.show #newBtn')&&window.__PINEWOOD_OPENING_V34__,null,{timeout:90000});
  await page.locator('#newBtn').click();
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:180000});
  const status=await page.evaluate(()=>{
   const s=window.__PINEWOOD_OPENING_V34__;
   const p=s.environmentV37?.landscape?.positions||[];
   const sorted=[...p].sort((a,b)=>a.x-b.x);
   return {startup:s.startupStatus,clock:s.dashboardClock,keypad:s.keypadStatus,
    mall:s.canonicalMall,facade:s.environmentV37?.facadeV65,
    rain:s.sceneStats?.rainParticles,select:getComputedStyle(document.getElementById('pwm-opening')).userSelect,
    planterPairs:sorted.slice(0,4).map((x,i)=>({sum:x.x+sorted[7-i].x,
     dz:x.z-sorted[7-i].z})),wallNotices:s.sceneStats?.wallNotices};
  });
  results.startup=status;
  assert(status.startup.firstFrameRendered,'canonical exterior/interior failed first-frame prewarming');
  assert(status.clock==='02:17 AM','late-night dashboard readout missing: '+status.clock);
  assert(status.mall?.source==='canonical-v67-shell-v69-furnishings'&&status.mall?.furnishingsLoaded>=50,
   'cinematic showed mock interior instead of canonical store shell: '+JSON.stringify(status.mall));
  assert(status.mall?.duplicateFrontWalls===2,'front facade has duplicate coplanar shell walls');
  assert(status.rain>=1800,'rain did not get denser');
  assert(status.select==='none','opening remains text selectable');
  assert(status.facade?.boardingPlankCount<=16&&status.facade?.zFightingGuard,
   'boarding is crowded or facade has overlapping raised masses');
  assert(status.planterPairs.length===4&&status.planterPairs.every(p=>Math.abs(p.sum+21)<.03&&Math.abs(p.dz)<.01),
   'imported planters not mirrored around doorway');
  const seek=async(index,fraction,delay=230)=>{
   await page.evaluate(({index,fraction})=>{
    const s=window.__PINEWOOD_OPENING_V34__;s.seek(index);s.scrub(fraction);
   },{index,fraction});await page.waitForTimeout(delay);
   return page.evaluate(()=>{
    const s=window.__PINEWOOD_OPENING_V34__;
    return {cue:s.cue,eye:s.cameraPosition,gaze:s.eyeMotion?.gaze,
     keypad:s.keypadStatus,timing:s.captionTiming,door:s.sceneStats?.doorAngle};
   });
  };
  const capture=async file=>{
   const stopped=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__?.freezeFrame());
   assert(stopped,'review frame freeze unavailable before screenshot '+file);
   try{
    return await page.screenshot({path:dir+'/'+file,timeout:90000,animations:'disabled'});
   }finally{
    await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__?.resumeFrame());
   }
  };
  const clock=await seek(1,.51);
  const clockFrame=await capture('01-dashboard-0217.png');
  // A mounted CanvasTexture is insufficient: the readout must be visible to the player.
  // Count illuminated green readout pixels in the ACTUAL desktop rendered screenshot.
  const clockVisiblePixels=await page.evaluate(async encoded=>{
   const png=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
   const bitmap=await createImageBitmap(new Blob([png],{type:'image/png'}));
   const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
   const context=canvas.getContext('2d');context.drawImage(bitmap,0,0);
   const {data}=context.getImageData(Math.floor(bitmap.width*.2),Math.floor(bitmap.height*.2),
    Math.floor(bitmap.width*.65),Math.floor(bitmap.height*.6));
   let lit=0;
   for(let i=0;i<data.length;i+=4)
    if(data[i+1]>150&&data[i+1]-data[i]>35&&data[i+1]-data[i+2]>15)lit++;
   return lit;
  },clockFrame.toString('base64'));
  results.clockVisiblePixels=clockVisiblePixels;
  assert(clockVisiblePixels>=100,'digital readout is hidden behind the steering wheel/dashboard: '+clockVisiblePixels+' visible pixels');
  assert(Math.hypot(...clock.gaze.map((v,i)=>v-clock.eye[i]))<2,
   'camera never looks at physical dashboard time');
  const facade=await seek(6,.76);
  await capture('02-derelict-entrance.png');
  const start=await seek(7,.02);
  const voice=start.timing.voiceSeconds,wait=start.timing.waitSeconds;
  const pressing=await seek(7,(voice+3.25)/wait,350);
  await capture('03-code-entry-action.png');
  const granted=await seek(7,(voice+4.82)/wait,350);
  await capture('04-keypad-authorized.png');
  assert(pressing.keypad?.realHand&&pressing.keypad?.pressCount>=1,
   'native player arm does not press numeric keypad: '+JSON.stringify(pressing.keypad));
  assert(granted.keypad?.entered==='2841'&&granted.keypad.confirmed,
   'access code was not fully entered before Renee confirms: '+JSON.stringify(granted.keypad));
  const entered=await seek(8,.91,350);
  await capture('05-canonical-service-vestibule.png');
  assert(entered.door<-.7,'physical contractor door fails to open during entry');
  assert(entered.eye[0]>9&&entered.eye[0]<16&&entered.eye[2]<-22.5,
   'camera did not enter actual x9..16 contractor vestibule: '+entered.eye);
  const final=await seek(10,.96,350);
  await capture('06-final-in-canonical-mall.png');
  assert(Math.abs(final.eye[0]-12)<.5&&Math.abs(final.eye[2]+26)<.7,
   'cinematic ends outside canonical gameplay spawn: '+final.eye);
  assert(!errors.length&&!remote.length,
   'unexpected JS error or outside asset request '+JSON.stringify({errors,remote}));
  Object.assign(results,{clock,facade,pressing,granted,entered,final,errors,remote});
 }finally{await page.close();}
}finally{
 await browser.close();
 await writeFile(dir+'/report.json',JSON.stringify({...results,failures,passed:!failures.length},null,2));
}
if(failures.length)throw Error('v71 desktop opening cinematic continuity regression ('+failures.length+'):\n'+failures.join('\n'));
console.log('V71_DESKTOP_CINEMATIC_PASS '+JSON.stringify({clock:results.startup.clock,
 mall:results.startup.mall,planters:results.startup.planterPairs,
 keypad:results.granted.keypad}));
