/** Deterministic real desktop Chapter 1 bootstrap, no manual WASD play. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
import {VESTIBULE_HANDOFF_V112 as end} from '../mall/vestibule-handoff-v112.mjs';
mkdirSync('artifacts',{recursive:true});
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{
  if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());
 });
 await page.goto(origin+'/?openingDisabled=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>{
  const s=window.__PINEWOOD_V112_QA__?.getState?.();
  return s?.chapter===1&&Math.abs(s.x-12.5)<.01&&Math.abs(s.z+32.75)<.01;
 },null,{timeout:250000});
 const start=await page.evaluate(()=>window.__PINEWOOD_V112_QA__.getState());
 console.log('V112_GAME_POSE_DIAGNOSTIC '+JSON.stringify(start));
 assert.deepEqual([start.x,start.y,start.z],[end.x,end.y,end.z],
  'actual gameplay camera position must equal terminal cinematic eye exactly');
 assert.ok(Math.abs(start.yaw-end.yaw)<.0001,
  'actual game yaw must face the same straight-ahead mall direction');
 assert.ok(Math.abs(start.pitch-end.pitch)<.0001,
  'game must not resume with a cinematic gaze tilt');
 assert.equal(start.door?.closed,true,'fire door must be physically closed when Chapter 1 starts');
 assert.equal(start.door?.portal?.id,'service_vestibule__central_gallery');
 assert.equal(start.blocker?.disabled,false,'closed fire door must block physical traversal');
 assert.equal(start.blocker?.physicalBlock,true);
 await page.screenshot({path:'artifacts/v112-chapter-one-vestibule.png',
  timeout:90000,animations:'disabled'});
 assert.deepEqual(remote,[],'no third-party runtime network requests');
 assert.deepEqual(errors,[],'no uncaught game errors');
 console.log('PINEWOOD_V112_CHAPTER_START_PASS '+JSON.stringify({start,errors,remote}));
}finally{await browser.close();}
