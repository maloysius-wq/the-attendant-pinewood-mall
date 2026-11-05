import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173';
await mkdir('entry-v77-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded'});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:150000});
 const snap=async (cue,fraction,path)=>{
  await page.evaluate(({cue,fraction})=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(cue);q.scrub(fraction)}, {cue,fraction});
  await page.waitForTimeout(450);
  const state=await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;return {
   eye:q.cameraPosition,door:q.eyeMotion?.doorOpen,access:q.accessPad,
   hand:q.keypadView,world:q.cinematicWorld,continuity:q.entryContinuity
  }});
  if(path)await page.screenshot({path:'entry-v77-artifacts/'+path,timeout:120000});
  return state;
 };
 const approach=await snap(7,.835,'01-arrived-before-keypress.png');
 assert.ok(Math.hypot(approach.eye[0]-13.25,approach.eye[2]+20.73)<.28,
  'player must reach the keypad before numbers start');
 assert.equal(approach.access.entered,'');
 const typing=await snap(7,.97,'02-physically-pressing-code.png');
 assert.equal(typing.access.displayedCode,'158','third digit visible while fourth is pressed');
 assert.ok(typing.hand.forearmVisible,'visible connected forearm at the actual pad');
 const granted=await snap(8,.0,'03-code-accepted-door-starts.png');
 assert.equal(granted.access.granted,true);
 assert.equal(granted.continuity?.canonicalMounted,true,
  'the real licensed mall must already be behind the open door before crossing');
 assert.equal(granted.continuity?.retiredExteriorFacades,0,
  'do not render duplicate front walls or an obsolete entry backdrop');
 const opening=await snap(8,.145,'04-door-open-real-mall-visible.png');
 assert.ok(opening.door>.95,'service door must be open within two seconds');
 assert.equal(opening.continuity?.canonicalMounted,true,'new mall visible while camera still outside');
 assert.ok(opening.eye[2]>-22.5,'door opens before camera crosses threshold');
 const crossing=await snap(8,.53,'05-crossing-one-coherent-mall.png');
 assert.ok(crossing.eye[2]<-22.55,'camera crosses threshold during confirmation');
 assert.ok(crossing.door>.95,'door stays open');
 assert.equal(crossing.continuity?.canonicalMounted,true);
 assert.equal(crossing.continuity?.sameWorldFrame,true,'no scene replacement across the threshold');
 assert.deepEqual(errors,[],'no desktop browser errors');
 assert.deepEqual(remote,[],'no remote runtime asset requests');
 console.log('ENTRY_V77_DESKTOP_PASS '+JSON.stringify({approach:approach.eye,typing:typing.access,
  door:opening.door,crossing:crossing.eye,continuity:crossing.continuity,errors,remote}));
}finally{await browser.close()}
