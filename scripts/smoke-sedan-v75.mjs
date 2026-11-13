import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const origin='http://127.0.0.1:4173';
await mkdir('sedan-v75-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))external.push(r.url())});
 await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded'});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:150000});
 const read=()=>page.evaluate(()=>{
  const q=window.__PINEWOOD_OPENING_V34__;
  return {camera:q.cameraPosition,vehicle:q.environmentV37,door:q.carDoorState,
   clock:q.dashboardClock,clockView:q.dashboardClockView,
   sightlines:q.cockpitSightlines,world:q.cinematicWorld};
 });
 const initial=await read();
 console.log('SEDAN_V75_INITIAL_DIAGNOSTIC '+JSON.stringify(initial));
 await page.screenshot({path:'sedan-v75-artifacts/00-initial-before-assert.png'});
 assert.equal(initial.vehicle?.cockpit?.source,'low-poly_sedan_car.glb','the actual #4 sedan must be rendered');
 assert.equal(initial.vehicle?.cockpit?.meshes,44,'all original GLB meshes should remain');
 assert.equal(initial.vehicle?.cockpit?.hasOriginalRoof,true,'original covered roof must remain');
 assert.equal(initial.vehicle?.cockpit?.authorCreatedBodyMeshes,0,'no added vector car geometry');
 assert.ok(initial.camera?.[2]>=17.15&&initial.camera?.[2]<=17.48,'eye must be behind the wheel');
 assert.ok(initial.vehicle?.roofRayDistance>.18&&initial.vehicle?.roofRayDistance<.72,'eye must be beneath a roof');
 assert.ok(initial.sightlines?.centerForwardDistance>.45,'windshield view must not be blocked by upholstery');
 assert.equal(initial.door?.side,'FL_Door');
 assert.ok(Math.abs(initial.door?.angle||0)<.01,'door starts closed');
 assert.equal(initial.clock?.hitMesh,'Interior_InteriorPanel_0',
  'factory readout must attach to the imported interior dashboard, not outer chassis or a sidewall');
 assert.equal(initial.clock?.unobstructedFromDriver,true,'clock visible from driver');
 assert.equal(initial.clock?.visibleDisplayCorners,4,'no clock digits clipped');
 assert.ok(initial.clock?.mountDepth<-.69&&initial.clock.mountDepth>-.83,'clock must attach to center panel immediately below the vent');
 assert.ok(initial.clock?.localPosition?.[1]<.97,'clock must sit lower on dashboard');
 assert.equal(initial.clock?.mountKind,'center-console-under-vent','clock must mount directly beneath the original center vent');
 assert.ok(initial.clock?.ventCenterOffsetX<.015,'readout must be horizontally centered on the grille');
 assert.ok(initial.clock?.ventCenter?.[1]-initial.clock?.localPosition?.[1]>.09,
  'readout must sit beneath, not on top of, the center vent');
 assert.ok(initial.clock?.displayVentNormalDot>.999,
  'readout face must share the authentic center vent facing angle');
 await page.screenshot({path:'sedan-v75-artifacts/01-seated-driver.png'});
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(1);q.scrub(.38)});
 await page.waitForTimeout(650);
 const clockMoment=await read();
 assert.ok(clockMoment.clockView?.inFrame,'clock appears within motivated gaze');
 assert.ok(clockMoment.clockView?.viewportWidth>=.035,'clock is legible');
 await page.screenshot({path:'sedan-v75-artifacts/02-clock-glance.png'});
 // The eye must cross the left wall through the original front doorway, not
 // through the adjacent rear door (which begins at world Z 17.58).
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(5);q.scrub(.215)});
 await page.waitForTimeout(650);
 const crossing=await read();
 assert.ok(crossing.camera[0]<-10.77&&crossing.camera[0]>-11.30,
  "camera must be at the driver's side threshold in this exit beat");
 assert.ok(crossing.camera[2]>=16.65&&crossing.camera[2]<=17.47,
  'camera must cross the front-left door opening, not the rear-door metal');
 assert.ok(crossing.door?.openFraction>.90,
  'the original front door must have swung clear before the character passes through');
 assert.ok(crossing.door?.angle<-1.35,
  'the real driver door must swing more than 77 degrees clear of the player during crossing');
 await page.screenshot({path:'sedan-v75-artifacts/025-crossing-front-door.png'});
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(5);q.scrub(.28)});
 await page.waitForTimeout(650);
 const opening=await read();
 assert.ok(opening.door?.angle<-1.35,'original front-left door opens more fully as player gets up');
 await page.screenshot({path:'sedan-v75-artifacts/03-driver-door-opening.png'});
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(5);q.scrub(.42)});
 await page.waitForTimeout(650);
 const outside=await read();
 assert.ok(outside.camera[0]<-11.15,'player exits through driver door to outside');
 // The owner cue now waits six seconds from the opening sound before the
 // source-mesh door begins its 650 ms closing swing. At phase .42 the door
 // is still completing that swing; an old five-second assertion was stale.
 assert.ok(outside.door?.openFraction>0&&outside.door.openFraction<.2,
  'the original driver door is closing smoothly after its six-second delay');
 await page.screenshot({path:'sedan-v75-artifacts/04-exiting-car.png'});
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(5);q.scrub(.49)});
 await page.waitForTimeout(650);
 const closedAfterDelay=await read();
 assert.ok(Math.abs(closedAfterDelay.door?.angle||0)<.05,
  'the original driver door fully closes after the six-second delay and physical swing');
 await page.screenshot({path:'sedan-v75-artifacts/045-door-closed.png'});
 await page.evaluate(()=>{const q=window.__PINEWOOD_OPENING_V34__;q.seek(6);q.scrub(.6)});
 await page.waitForTimeout(650);
 const departure=await read();
 assert.ok(Math.abs(departure.door?.angle||0)<.05,'driver closes the real car door before walking away');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const result={initial,clockMoment,crossing,opening,outside,closedAfterDelay,departure,errors,external};
 await writeFile('sedan-v75-artifacts/report.json',JSON.stringify(result,null,2));
 console.log('SEDAN_V75_DESKTOP_PASS '+JSON.stringify({
  source:initial.vehicle.cockpit.source,meshes:initial.vehicle.cockpit.meshes,
  seat:initial.camera,roof:initial.vehicle.roofRayDistance,clock:initial.clock,
  doorOpen:opening.door,doorClosed:departure.door,errors,external}));
 await page.close();
}finally {await browser.close();}
