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
 // Enter the REAL playable chapter before capturing the scene, otherwise
 // the chapter-start modal covers the closed fire door in the screenshot.
 // Call the REAL chapter-start button handler without synthetic mouse motion:
 // WebGL+pointer-lock can fire a stray unlock while Playwright moves to click
 // the modal and falsely pause the already-running chapter in headless Chrome.
 await page.evaluate(()=>{
  const button=document.getElementById('chapterStartBtn');
  if(!button?.onclick)throw Error('Real Begin Shift handler unavailable');
  button.click();
 });
 const modalState=await page.evaluate(()=>({
  screens:[...document.querySelectorAll('.screen.show')].map(e=>e.id),
  pointerLocked:!!document.pointerLockElement,modalOpen:document.body.classList.contains('modal-open')
 }));
 console.log('V112_AFTER_BEGIN_SHIFT '+JSON.stringify(modalState));
 await page.waitForFunction(()=>!document.querySelector('.screen.show'),null,{timeout:20000,polling:250});
 const inPlay=await page.evaluate(()=>window.__PINEWOOD_V112_QA__.getState());
 assert.deepEqual([inPlay.x,inPlay.y,inPlay.z],[end.x,end.y,end.z],
  'Begin Shift cannot teleport the player away from the terminal film frame');
 assert.ok(Math.abs(inPlay.yaw-end.yaw)<.0001&&Math.abs(inPlay.pitch-end.pitch)<.0001,
  'mouse-lock transition cannot rotate the Chapter 1 camera from the film heading');
 await page.keyboard.press('KeyE');
 const untouched=await page.evaluate(()=>window.__PINEWOOD_V112_QA__.getState());
 assert.equal(untouched.door?.closed,true,'E must not open the distant mall door from the vestibule center');
 assert.equal(untouched.blocker?.disabled,false,'distant interaction must leave door physically closed');
 await page.screenshot({path:'artifacts/v112-chapter-one-vestibule.png',
  timeout:90000,animations:'disabled'});
 assert.deepEqual(remote,[],'no third-party runtime network requests');
 assert.deepEqual(errors,[],'no uncaught game errors');
 console.log('PINEWOOD_V112_CHAPTER_START_PASS '+JSON.stringify({start,inPlay,errors,remote}));
}finally{await browser.close();}
