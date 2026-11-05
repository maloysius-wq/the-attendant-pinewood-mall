import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],external=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))external.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+': '+r.failure()?.errorText));
 await page.goto(origin+'/review/the-call-v34/?v=82',{waitUntil:'domcontentloaded'});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:150000});
 const q=()=>page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.cinematicSfx);
 const initial=await q();
 assert.equal(initial?.state,'ready','all five sound assets must decode before first frame');
 assert.equal(initial.contextState,'running','sound effects use gesture-unlocked ambient context');
 assert.equal(initial.sharedContext,true);
 assert.deepEqual(initial.loaded.sort(),['Beep','CarDoorClose','CarDoorOpen','MetalDoorClose','MetalDoorOpen'].sort());
 for(const [name,min,max] of [
  ['Beep',.15,.20],['CarDoorOpen',.48,.52],['CarDoorClose',.31,.36],
  ['MetalDoorOpen',1.47,1.52],['MetalDoorClose',.87,.93]
 ]) assert.ok(initial.durations[name]>=min&&initial.durations[name]<=max,
  name+' must decode with original WAV duration');
 await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.qaCockpitProbe());
 const advance=(cue,elapsed,voiceSeconds,waitSeconds)=>page.evaluate(data=>
  window.__PINEWOOD_OPENING_V34__.qaSfxAdvance(data),
  {cue,elapsed,voiceSeconds,waitSeconds}
 );
 await advance('owner',.8,16.636,18.236);
 let result=await advance('owner',1.15,16.636,18.236);
 assert.deepEqual(result.played.map(x=>x.name),['CarDoorOpen']);
 result=await advance('owner',7.2,16.636,18.236);
 assert.deepEqual(result.played.map(x=>x.name),['CarDoorOpen','CarDoorClose']);
 assert.ok(Math.abs(result.played[1].at-result.played[0].at-6)<.001,
  'car close occurs exactly six seconds after the opening sound');
 await advance('lights',10.15,10.06,12.06);
 for(const elapsed of [10.35,10.85,11.35,11.85])result=await advance('lights',elapsed,10.06,12.06);
 assert.deepEqual(result.played.filter(x=>x.name==='Beep').map(x=>x.digit),[1,5,8,3]);
 const before=result.played.length;
 result=await advance('lights',11.85,10.06,12.06);
 assert.equal(result.played.length,before,'stationary frame must not repeat a beep');
 await advance('inside',.1,13.164,14.664);
 result=await advance('inside',.2,13.164,14.664);
 assert.equal(result.played.at(-1).name,'MetalDoorOpen');
 result=await advance('inside',8.0,13.164,14.664);
 assert.equal(result.played.at(-1).name,'MetalDoorClose');
 assert.deepEqual(result.played.map(x=>x.name),[
  'CarDoorOpen','CarDoorClose','Beep','Beep','Beep','Beep','MetalDoorOpen','MetalDoorClose'
 ]);
 assert.deepEqual(result.failed,{},'no audio fetch/decode errors');
 // Door visuals also close after the player exits the car / enters vestibule.
 const frames=async(cue,phase)=>page.evaluate(({cue,phase})=>{
  const live=window.__PINEWOOD_OPENING_V34__;
  live.seek(cue);live.scrub(phase);return true;
 },{cue,phase});
 // QA probe intentionally freezes RAF for deterministic audio testing; the
 // geometry timing itself is asserted by the matching Node timeline tests.
 assert.deepEqual(errors,[],'no desktop runtime errors');
 assert.deepEqual(external,[],'all sounds and 3D assets must be same-origin');
 assert.deepEqual(failed,[],'all local sound/scene requests must succeed');
 console.log('CINEMATIC_SFX_V82_DESKTOP_PASS '+JSON.stringify({
  durations:initial.durations,events:result.played,failed,external,errors
 }));
}finally{await browser.close()}
