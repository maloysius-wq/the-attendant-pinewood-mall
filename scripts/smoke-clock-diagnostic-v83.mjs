import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('console',m=>{if(['error','warning'].includes(m.type()))console.log('BROWSER_LOG '+m.type()+' '+m.text())});
 page.on('pageerror',e=>console.log('PAGE_ERROR '+e.stack));
 await page.goto(origin+'/review/the-call-v34/?v=83',{waitUntil:'domcontentloaded'});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>{
  const state=window.__PINEWOOD_OPENING_V34__?.startupStatus?.state;
  return state==='ready'||state==='failed';
 },null,{timeout:150000});
 const status=await page.evaluate(()=>({
  startup:window.__PINEWOOD_OPENING_V34__?.startupStatus,
  clock:window.__PINEWOOD_OPENING_V34__?.dashboardClock,
  message:document.querySelector('[data-intro-preload-message]')?.textContent||''
 }));
 console.log('CLOCK_V83_DIAGNOSTIC '+JSON.stringify(status));
 assert.equal(status.startup?.state,'ready',
  'preload must succeed before checking clock placement: '+status.message);
}finally{await browser.close()}
