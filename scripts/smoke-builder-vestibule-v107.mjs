import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{
  if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))external.push(r.url());
 });
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 const ready=()=>page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:165000});
 await ready();
 const state=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 assert.equal(state.ready,true,JSON.stringify(state.errors));
 assert.equal(state.catalogCount,638,'Existing source catalog remains unchanged');
 const patio=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getVestibulePatinaState());
 let view=await patio();
 assert.deepEqual([view.count,view.floor,view.wall,view.ceiling],[26,12,8,6]);
 assert.equal(view.enabled,true);
 assert.equal(view.ceilingVisible,true);
 assert.ok(view.items.every(x=>x.why&&x.review&&x.position.x>9&&x.position.x<16));
 const initialLayout=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 assert.equal(state.draft.added.length,0,'Patina is scene ambience, not unrequested saved clutter');
 await page.evaluate(()=>document.getElementById('vestibule-patina').click());
 assert.equal((await patio()).enabled,false);
 await page.evaluate(()=>document.getElementById('vestibule-patina').click());
 assert.equal((await patio()).enabled,true);
 await page.evaluate(()=>document.getElementById('roof').click());
 assert.equal((await patio()).ceilingVisible,false,'Roof cutaway must not leave floating cobwebs');
 await page.evaluate(()=>document.getElementById('roof').click());
 assert.equal((await patio()).ceilingVisible,true);
 const light=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getVestibuleLightState());
 let fixture=await light();
 assert.ok(fixture.enabled&&fixture.baseIntensity===10,'Existing lamp should animate');
 assert.deepEqual(fixture.position,{x:12,y:2.9,z:-30});
 await page.evaluate(()=>document.getElementById('vestibule-flicker').click());
 fixture=await light();
 assert.equal(fixture.enabled,false);assert.equal(fixture.lightIntensity,10);
 await page.evaluate(()=>document.getElementById('vestibule-flicker').click());
 assert.equal((await light()).enabled,true);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.applyRoomFinishes('service_vestibule',{wall:'painted-wall'}));
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.applyRoomFinishes('service_vestibule',{wall:'original'}));
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.equal((await patio()).count,26,'Atmosphere remains present after clearing user layout');
 assert.equal(await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON()),initialLayout,
  'Toggle and fixed patina never change v1 saved layout');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.jumpRoom('service_vestibule'));
 mkdirSync('artifacts',{recursive:true});
 await page.screenshot({path:'artifacts/vestibule-patina-v107-desktop.png'});
 // Reduced-motion preference disables irregular power changes by default.
 // It never suppresses static dirt/webs and can be explicitly overridden.
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload({waitUntil:'domcontentloaded'});await ready();
 assert.equal((await light()).enabled,false);
 assert.equal((await patio()).count,26);
 assert.equal((await light()).lightIntensity,10);
 assert.deepEqual(external,[],'Must load only repository-local media');
 assert.deepEqual(errors,[],'No uncaught Builder errors');
 console.log('PINEWOOD_V107_VESTIBULE_PATINA_REAL_3D_DESKTOP_PASS',JSON.stringify({
  marks:26,realLamp:true,lightingOptOut:true,reducedMotion:true,
  roofCutaway:true,userDraftUnchanged:true,noExternalAssets:true
 }));
}finally{await browser.close()}
