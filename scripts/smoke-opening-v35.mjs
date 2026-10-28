import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/review/the-call-v34/';
await fs.mkdir('opening/review-v35',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:810},deviceScaleFactor:1});
const exceptions=[];page.on('pageerror',e=>exceptions.push(e.message||String(e)));
const assert=(ok,explanation)=>{if(!ok)throw Error('THE CALL V35: '+explanation)};
const track=async()=>page.evaluate(()=>({
 cue:window.__PINEWOOD_OPENING_V34__?.cue,
 camera:window.__PINEWOOD_OPENING_V34__?.cameraPosition,
 motion:window.__PINEWOOD_OPENING_V34__?.eyeMotion,
 mount:window.__PINEWOOD_OPENING_V34__?.dashboardPhone,
 audio:window.__PINEWOOD_OPENING_V34__?.audioStatus
}));
try{
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
 await page.locator('#newBtn').click({timeout:45000});
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active===true,null,{timeout:25000});
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.audioStatus?.ambient?.car?.readyState===4,null,{timeout:30000});
 await page.waitForTimeout(850);
 let initial=await track();
 assert(initial.audio?.ambient?.car?.gapless===true,'car is not sample-accurate Web Audio');
 assert(initial.audio?.ambient?.outside?.gapless===true,'outside is not decoded with Web Audio');
 assert(initial.audio.ambient.car.playing&&initial.audio.ambient.outside.playing,'loop sources are not running');
 assert(initial.mount?.[1]>1.05&&initial.mount?.[1]<1.5,'phone is not on dashboard '+JSON.stringify(initial.mount));
 const scene=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__?.sceneStats);
 assert(scene?.meshCount>250,'Missing physical scene geometry');
 await page.screenshot({path:'opening/review-v35/01-driver-eye-through-windshield.png'});
 console.log('[CAR_VIEW] '+JSON.stringify({pos:initial.camera,mount:initial.mount,voice:initial.audio?.available,ambience:initial.audio.ambient}));
 const pics=[
  [1,.23,'02-dashboard-mounted-phone.png','clock'],
  [3,.49,'03-return-eyes-to-windshield.png','work'],
  [5,.35,'04-physically-exiting-vehicle.png','owner'],
  [6,.48,'05-walking-toward-mall.png','entrance'],
  [8,.70,'06-look-at-service-keypad.png','inside'],
  [9,.67,'07-public-concourse-glance.png','promise']
 ];
 let measurements=[];
 for(const [index,fraction,file,cue] of pics){
  await page.evaluate(i=>window.__PINEWOOD_OPENING_V34__.seek(i),index);
  await page.evaluate(f=>window.__PINEWOOD_OPENING_V34__.scrub(f),fraction);
  await page.waitForTimeout(480);
  const s=await track();
  assert(s.cue===cue,'Wrong cue '+cue+' '+s.cue);
  assert(s.camera?.length===3&&s.camera.every(Number.isFinite),'Camera not moving safely '+cue);
  assert(s.motion?.gaze?.length===3,'No head-gaze action '+cue);
  await page.screenshot({path:'opening/review-v35/'+file});
  measurements.push({cue,eye:s.camera,gaze:s.motion.gaze,rain:s.motion.rain});
 }
 const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 const dash=measurements[0],lookAway=measurements[1],exit=measurements[2],walking=measurements[3];
 assert(distance(dash.gaze,lookAway.gaze)>4,'Human POV is not changing attention');
 assert(distance(dash.eye,exit.eye)>1.1,'Player does not physically exit car');
 assert(distance(exit.eye,walking.eye)>4,'Player does not walk down the approach');
 assert(exit.rain.car<1&&exit.rain.outside>0,'Car-to-outdoor rain is not crossfading through physical exit');
 assert(walking.rain.car<.05&&walking.rain.outside>.95,'Outside rain not active during walk');
 assert(measurements.at(-1).rain.outside<.1,'Outdoor rain does not fade inside');
 console.log('[HUMAN_GAZE] '+JSON.stringify(measurements));
 const outside=await track();
 assert(outside.audio?.ambient?.car?.gapless&&outside.audio?.ambient?.outside?.gapless,'Lost Web Audio buffers while changing regions');
 // Verify both sample-accurate loops stay playing after time passes, without HTML media seeking.
 await page.waitForTimeout(1300);
 const after=await track();
 assert(after.audio?.ambient?.car?.playing&&after.audio?.ambient?.outside?.playing,'Web Audio loop stopped');
 await page.locator('[data-intro-skip]').click();
 await page.waitForFunction(()=>!window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:20000});
 await page.waitForFunction(()=>!document.querySelector('#titleScreen')?.classList.contains('show'),null,{timeout:50000});
 assert(exceptions.length===0,'Browser exceptions: '+exceptions.join('; '));
 console.log('PASS: grounded dashboard phone, natural gaze changes, walking and exit, local seamlessly looped car/outside rain, scene-aware fading and original New Game handoff.');
}finally{await browser.close();}
