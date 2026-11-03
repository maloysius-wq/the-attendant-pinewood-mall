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
 // Investigate the actual imported upholstery geometry at the player's
 // eye for both the clock glance and the unoccluded windshield view.
 const seatDiagnostics=await page.evaluate(async()=>{
  const [{GLTFLoader},THREE]=await Promise.all([
   import('/vendor/three/examples/jsm/loaders/GLTFLoader.js'),
   import('/vendor/three/build/three.module.js')
  ]);
  const q=window.__PINEWOOD_OPENING_V34__;
  const eye=new THREE.Vector3(...q.cameraPosition);
  const sceneGaze=new THREE.Vector3(...q.eyeMotion.gaze);
  const gltf=await new GLTFLoader().loadAsync('/opening/assets/v42/1990s-hatchback.glb');
  const model=gltf.scene;model.rotation.y=Math.PI;model.updateMatrixWorld(true);
  let bounds=new THREE.Box3().setFromObject(model);
  const size=bounds.getSize(new THREE.Vector3());
  model.scale.multiplyScalar(1.86/size.x);model.updateMatrixWorld(true);
  bounds.setFromObject(model);
  const center=bounds.getCenter(new THREE.Vector3());
  model.position.x-=center.x;model.position.y-=bounds.min.y;model.position.z-=center.z;
  const car=new THREE.Group();car.position.set(-10,0,17.5);car.add(model);
  model.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])
   if(m&&/body_pbr/i.test(m.name||''))m.side=THREE.FrontSide;});
  car.updateMatrixWorld(true,true);
  const local=(p)=>car.localToWorld(new THREE.Vector3(...p));
  const clock=local(q.dashboardClock.localPosition);
  const probe=(target)=>{
   const camera=new THREE.PerspectiveCamera(66,1440/900,.08,230);
   camera.position.copy(eye);camera.lookAt(target);camera.updateMatrixWorld(true);
   const rays=[],gridX=[-.85,-.6,-.3,0,.3,.6,.85],gridY=[-.7,-.45,-.2,0,.2,.45,.7];
   for(const ny of gridY)for(const nx of gridX){
    const ray=new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(nx,ny),camera);
    const hit=ray.intersectObject(model,true).find(h=>!/windows/i.test(h.object.name));
    rays.push({x:nx,y:ny,d:hit?+hit.distance.toFixed(3):null,
     at:hit?hit.point.toArray().map(n=>+n.toFixed(3)):null,
     mesh:hit?.object?.name||null});
   }
   const projection=clock.clone().project(camera);
   return {gaze:target.toArray(),nearUnder04:rays.filter(r=>r.d!==null&&r.d<.4).length,
    nearUnder08:rays.filter(r=>r.d!==null&&r.d<.8).length,
    nearUnder12:rays.filter(r=>r.d!==null&&r.d<1.2).length,
    clockNdc:projection.toArray(),rays};
  };
  // Scan physically plausible seated driver-eye placements and a farther
  // dashboard gaze before choosing any scene changes.
  const viewScore=(from,to)=>{
   const camera=new THREE.PerspectiveCamera(66,1440/900,.08,230);
   camera.position.copy(from);camera.lookAt(to);camera.updateMatrixWorld(true);
   const rays=[],xGrid=[-.8,-.4,0,.4,.8],yGrid=[-.65,-.25,.15,.55];
   for(const y of yGrid)for(const x of xGrid){
    const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x,y),camera);
    const hit=ray.intersectObject(model,true).find(h=>!/windows/i.test(h.object.name));
    rays.push(hit?hit.distance:Infinity);
   }
   return {near04:rays.filter(d=>d<.4).length,
    near07:rays.filter(d=>d<.7).length,
    center:Math.min(rays[2],rays[7],rays[12],rays[17]),
    median:rays.filter(Number.isFinite).sort((a,b)=>a-b)[Math.floor(rays.filter(Number.isFinite).length/2)]||null};
  };
  const candidates=[];
  for(const x of[-.52,-.38,-.24,-.10])for(const y of[1.17,1.26,1.34])
   for(const z of[-.65,-.45,-.25,-.05,.15]){
    const from=local([x,y,z]);
    const ahead=viewScore(from,new THREE.Vector3(2,2.9,-22));
    const dash=viewScore(from,local([.10,1.0,-1.05]));
    const score=4*(ahead.near04+dash.near04)+(ahead.near07+dash.near07)
     +3*(ahead.center<.4?1:0)+3*(dash.center<.4?1:0);
    candidates.push({local:[x,y,z],world:from.toArray(),score,ahead,dash});
   }
  candidates.sort((a,b)=>a.score-b.score);
  // Search the original GLB triangles for a dashboard face ahead of the
  // shifted eye. Never accept seatback surfaces at z > -0.75.
  const mountEye=local([-.38,1.26,-.45]),mounts=[],misses=[];
  for(const x of[-.35,-.15,.05,.25,.45])for(const y of[.75,.85,.95,1.05,1.15])
   for(const z of[-1.0,-1.2,-1.4,-1.6]){
    const target=local([x,y,z]);
    const ray=new THREE.Raycaster(mountEye,target.clone().sub(mountEye).normalize(),.08,3);
    const hit=ray.intersectObject(model,true).find(h=>!/window|wheel|tire|rim/i.test(h.object.name));
    if(!hit)continue;
    const point=car.worldToLocal(hit.point.clone());
    const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    const toEye=mountEye.clone().sub(hit.point).normalize();
    if(normal.dot(toEye)<0)normal.negate();
    const d=hit.distance,readable=normal.dot(toEye);
    const entry={aim:[x,y,z],point:point.toArray().map(n=>+n.toFixed(3)),
     distance:+d.toFixed(3),normal:normal.toArray().map(n=>+n.toFixed(3)),
     readable:+readable.toFixed(3)};
    if(point.z<-.75&&point.y>.65&&point.y<1.28&&d>.58&&readable>.4){
     entry.score=+(Math.abs(point.x-.05)*2+Math.abs(point.y-1.0)*2+
      Math.abs(point.z+1.15)*.7+(1-readable)*.6).toFixed(3);
     mounts.push(entry);
    }else if(misses.length<12)misses.push(entry);
   }
  mounts.sort((a,b)=>a.score-b.score);
  const worldBound=new THREE.Box3().setFromObject(model);
  return {eye:eye.toArray(),clock:clock.toArray(),clockDistance:eye.distanceTo(clock),
   candidateEyes:candidates.slice(0,15),mounts:mounts.slice(0,35),mountMisses:misses,currentEyeRank:candidates.findIndex(c=>c.local[0]===-.24&&c.local[1]===1.26&&c.local[2]===.15),
   carBounds:{min:worldBound.min.toArray(),max:worldBound.max.toArray()},
   clockGlance:probe(sceneGaze),ahead:probe(new THREE.Vector3(2,2.9,-22))};
 });
 await writeFile('cinematic-v72-artifacts/car-seat-diagnostic.json',JSON.stringify(seatDiagnostics,null,2));
 console.log('V74_SEAT_DIAGNOSTIC '+JSON.stringify(seatDiagnostics));
 assert.ok(seatDiagnostics.clockDistance>=.70,
  'the dashboard clock must be forward of the front seat, not mounted to nearby upholstery');
 assert.ok(seatDiagnostics.clockGlance.nearUnder04<=4,
  'a natural clock glance must not fill the screen with upholstery within 40cm of the eye');
 assert.ok(seatDiagnostics.clockGlance.nearUnder08<=16,
  'the clock glance must preserve a clear forward cockpit instead of huge nearby seat surfaces');
 assert.ok(seatDiagnostics.ahead.nearUnder04<=4,
  'the seated windshield view cannot begin from inside or directly behind the seat');
 assert.ok(clockMoment.clockView?.viewportWidth<=.16,
  'dashboard readout must not be exaggerated by an extremely close camera');
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
