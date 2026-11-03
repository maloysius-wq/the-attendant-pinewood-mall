import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173';
await mkdir('cinematic-v72-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded'});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:150000});
 const get=()=>page.evaluate(()=>({
  clock:window.__PINEWOOD_OPENING_V34__.dashboardClock,
  clockView:window.__PINEWOOD_OPENING_V34__.dashboardClockView,
  keypad:window.__PINEWOOD_OPENING_V34__.keypadView,
  world:window.__PINEWOOD_OPENING_V34__.cinematicWorld,
  eye:window.__PINEWOOD_OPENING_V34__.cameraPosition,
  ambience:window.__PINEWOOD_OPENING_V34__.audioStatus.ambient
 }));
 const initial=await get();
 assert.equal(initial.clock?.mountedToImportedDash,true,'clock must be flush-mounted to imported dash material');
 assert.ok(initial.clock?.displayWidth<.25,'clock is a smaller factory-sized readout');
 assert.ok(initial.clock?.surfaceGap<=.02,'clock display cannot float in the cabin');
 assert.equal(initial.clock?.unobstructedFromDriver,true,'clock must be visible from the real driver seat, not hidden by car mesh');
 assert.equal(initial.clock?.mountKind,'driver-facing-panel','the digital readout must be integrated into a dashboard panel, not perched along the windshield');
 assert.ok(initial.clock?.displayReadableAngle>.70,'clock face must point toward the driver, not lie edge-on to view');
 assert.equal(initial.world?.retiredInteriorMeshes,0,'retired miniature mall must be absent from arrival scene');
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(1);q.scrub(.38)});
 await page.waitForTimeout(700);
 const clockMoment=await get();
 assert.ok(clockMoment.clockView?.inFrame,'clock must appear during Renee\'s time-of-night line');
 assert.ok(clockMoment.clockView?.viewportWidth>=.055,'dashboard time must be legible');
 await page.screenshot({path:'cinematic-v72-artifacts/01-clock-glance.png'});
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(7);q.scrub(.97)});
 await page.waitForTimeout(700);
 const entry=await get();
 const directCapture=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.qaRenderNow());
 const {framebufferPng,...drawComparison}=directCapture;
 await writeFile('cinematic-v72-artifacts/04-direct-webgl-framebuffer.png',
  Buffer.from(framebufferPng.split(',')[1],'base64'));
 assert.ok(drawComparison?.armOnStage,'the connected source hand must animate in the actual 3D world');
 assert.ok(drawComparison.withArmCalls>drawComparison.withoutArmCalls,
  'real skinned forearm must create actual 3D draw calls');
 console.log('V72_FOREARM_FRAMEBUFFER_DIAGNOSTIC '+JSON.stringify(drawComparison));
 assert.ok(drawComparison.differentPixels>100,
  'real skinned forearm must visibly alter framebuffer pixels, not just project bone telemetry');
 console.log('V72_FOREARM_FRAMEBUFFER_PASS '+JSON.stringify(drawComparison));
 console.log('V72_HAND_DIAGNOSTIC '+JSON.stringify(entry.keypad));
 assert.ok(entry.keypad?.inFrame,'entire keypad panel is within the desktop viewport');
 assert.ok(entry.keypad?.viewportWidth>=.09,'digits are large enough to read');
 assert.ok(entry.keypad?.legibleDigits===9,'all nine key labels are visibly rendered');
 assert.equal(entry.keypad?.displayedCode,'158','the illuminated keypad screen must show the entered digits');
 assert.ok(entry.keypad?.forearmVisible,'a real locally vendored hand reaches the keypad');
 const wrist=entry.keypad?.finger?.wristViewport,thumb=entry.keypad?.finger?.thumbViewport;
 assert.ok(wrist?.[0]>.05&&wrist?.[0]<.95&&wrist?.[1]>.05&&wrist?.[1]<.95&&wrist?.[2]<1,
  'the imported wrist must actually project onto the visible screen, not just be flagged visible');
 assert.ok(thumb?.[0]>.05&&thumb?.[0]<.95&&thumb?.[1]>.05&&thumb?.[1]<.95&&thumb?.[2]<1,
  'the pressing finger must be within the visible keypad frame');
 assert.ok(entry.keypad?.finger?.skinSamplesInView>35,
  'actual skinned vertices, not only bone joints, must be visibly projected');
 assert.equal(entry.keypad?.entered.length,3,'third code digit entered during the fourth-key sequence');
 await page.screenshot({path:'cinematic-v72-artifacts/02-pressing-code.png'});
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(8);q.scrub(.75)});
 await page.waitForTimeout(700);
 const granted=await get();
 assert.equal(granted.keypad?.entered,'1583','four digit entry finishes before Renee confirms');
 assert.equal(granted.keypad?.granted,true);
 await page.screenshot({path:'cinematic-v72-artifacts/03-code-granted.png'});
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(9);q.scrub(.06)});
 await page.waitForTimeout(500);
 const threshold=await get();
 assert.equal(threshold.world?.retiredInteriorMeshes,0,'no old mall flash at the doorway');
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(10);q.scrub(.95)});
 await page.waitForTimeout(850);
 const interior=await get();
 assert.equal(interior.world?.mode,'unified-mall');
 assert.ok(interior.eye[2]<-43,'real mall route remains traversable');
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
 await writeFile('cinematic-v72-artifacts/status.json',JSON.stringify({initial,clockMoment,entry,granted,threshold,interior,drawComparison,errors,remote},null,2));
 console.log('CINEMATIC_V72_DESKTOP_PASS '+JSON.stringify({clock:initial.clock,keypad:entry.keypad,world:interior.world,errors,remote}));
 await page.close();
}finally{await browser.close()}
