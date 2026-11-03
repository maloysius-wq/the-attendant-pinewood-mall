import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const origin='http://127.0.0.1:4173';
await mkdir('cinematic-v71-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{
  if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());
 });
 await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!document.querySelector('#newBtn')&&!!window.__PINEWOOD_OPENING_V34__,null,{timeout:60000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:150000});
 const initial=await page.evaluate(()=>{
  const qa=window.__PINEWOOD_OPENING_V34__;
  return{startup:qa.startupStatus,world:qa.cinematicWorld,
   clock:qa.dashboardClock,facade:qa.environmentV37?.facadeV65,
   landscape:qa.environmentV37?.landscape,rain:qa.sceneStats?.rainParticles,
   css:getComputedStyle(document.querySelector('#pwm-opening')).userSelect};
 });
 assert.equal(initial.startup.firstFrameRendered,true);
 assert.equal(initial.world.interiorReady,true);
 assert.ok(initial.world.uniqueLicensedModels>=10);
 assert.equal(initial.clock?.time,'12:47 AM');
 assert.equal(initial.clock.importedCarPreserved,true);
 assert.equal(initial.css,'none');
 assert.equal(initial.rain,1500);
 assert.equal(initial.facade.mainEntranceBoarded,true);
 assert.ok(initial.facade.boardingPlankCount<=20,'simplified haphazard entrance boards');
 const planters=initial.landscape.positions.map(p=>p.x);
 for(let i=0;i<4;i++)assert.ok(Math.abs((planters[i]+planters[7-i])/2+10.5)<.001);
 await page.screenshot({path:'cinematic-v71-artifacts/01-dashboard-clock.png'});
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(7);q.scrub(.97);});
 await page.waitForTimeout(600);
 const entry=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.accessPad);
 assert.ok(entry.pressed>=2&&entry.pressed<=3,'key presses follow the spoken directions');
 await page.screenshot({path:'cinematic-v71-artifacts/02-access-keypad.png'});
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(8);q.scrub(.8);});
 await page.waitForTimeout(500);
 const granted=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.accessPad);
 assert.equal(granted.granted,true,'entry confirms before Renee acknowledges it');
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(9);q.scrub(.94);});
 await page.waitForTimeout(950);
 const inside=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.cinematicWorld);
 assert.equal(inside.mode,'unified-mall','inside must render canonical v69 mall');
 await page.screenshot({path:'cinematic-v71-artifacts/03-actual-mall-interior.png'});
 assert.deepEqual(errors,[],'no browser errors');
 assert.deepEqual(remote,[],'all runtime assets local');
 await writeFile('cinematic-v71-artifacts/status.json',JSON.stringify({initial,entry,granted,inside,errors,remote},null,2));
 console.log('CINEMATIC_V71_DESKTOP_PASS '+JSON.stringify({interior:inside,clock:initial.clock,boardCount:initial.facade.boardingPlankCount,errors,remote}));
 await page.close();
}finally{await browser.close();}
