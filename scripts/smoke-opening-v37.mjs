import {chromium} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const origin=new URL(base).origin;
const preview=new URL('review/the-call-v34/',base).href;
const assert=(v,m)=>{if(!v)throw Error(m);};
// Protect the owner's retired-phone restriction even when only narrative
// metadata, CSS or preview markup changes, not just in a rendered frame.
const [scriptText,styleText,previewText]=await Promise.all([
 readFile('opening/script.json','utf8'),
 readFile('opening/opening.css','utf8'),
 readFile('review/the-call-v34/index.html','utf8')
]);
const openingLines=JSON.parse(scriptText).lines;
assert(openingLines.length>0&&!openingLines.some(line=>line.shot==='phone'),
 'Old phone camera cues returned in the opening script');
assert(!styleText.includes('.pwm-phone-')&&!previewText.includes('pwm-phone-'),
 'Retired phone overlay styles or markup returned');

await mkdir('opening-v37-artifacts',{recursive:true});
const report={version:44,preview,layouts:{},passed:false};
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 for(const layout of [{name:'desktop',width:1280,height:720},{name:'mobile',width:390,height:844}]){
  const context=await browser.newContext({viewport:{width:layout.width,height:layout.height},deviceScaleFactor:1});
  const page=await context.newPage(),errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  page.on('request',r=>{const url=new URL(r.url());if(['https:','http:'].includes(url.protocol)&&url.origin!==origin)remote.push(r.url());});
  try{
   await page.goto(preview,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__PINEWOOD_STORY_V17__?.version===17
    && document.getElementById('titleScreen')?.classList.contains('show'),null,{timeout:150000});
   // A removed UI must be absent from the actual DOM, not merely CSS-hidden.
   assert(await page.locator('.pwm-phone-sheet,.pwm-phone-header,.pwm-phone-body,.pwm-phone-status').count()===0,
     layout.name+' retired work-phone panel returned');
   await page.locator('#newBtn').click();
   await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:20000});
   await page.waitForFunction(()=>['ready','failed'].includes(window.__PINEWOOD_OPENING_V34__?.environmentV37?.state),null,{timeout:90000});
   const st=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.environmentV37);
   if(layout.name==='desktop'&&!(st.roofRayDistance>.08&&st.roofRayDistance<.67)){
    console.log('V42_ROOF_GRID='+JSON.stringify(st.roofSamples||[]));
    console.log('V42_MODEL_SIZE='+JSON.stringify(st.measuredCarBounds||[]));
    for(const z of [16.95,17.25,17.55,17.85]){
      await page.evaluate(value=>window.__PINEWOOD_OPENING_V34__.qaDriverView(1.02,value),z);
      await page.waitForTimeout(50);
      const jpg=await page.screenshot({type:'jpeg',quality:34});
      console.log('V42_QA_Z'+Math.round(z*100)+'_JPEG='+jpg.toString('base64'));
    }
    for(const height of [.55,.70,.82,.98,1.10]){
      await page.evaluate(h=>window.__PINEWOOD_OPENING_V34__.qaDriverView(h),height);
      await page.waitForTimeout(50);
      const jpeg=await page.screenshot({type:'jpeg',quality:29});
      console.log('V42_QA_H'+Math.round(height*100)+'_JPEG='+jpeg.toString('base64'));
    }
    console.log('V42_QA_DRIVER_JPEG='+(await page.screenshot({type:'jpeg',quality:32})).toString('base64'));
    if(await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.qaExteriorCar())){
      await page.waitForTimeout(80);
      console.log('V42_QA_EXTERIOR_JPEG='+(await page.screenshot({type:'jpeg',quality:32})).toString('base64'));
    }
   }
   assert(st.state==='ready',layout.name+' v37 asset stage failed: '+JSON.stringify(st.errors));
   assert(st.car==='loaded'&&st.phone==='removed',layout.name+' enclosed model failed to load: '+JSON.stringify(st));
   const cc=st.cockpit;
   assert(cc?.construction==='complete-GRAB3D-enclosed-hatchback'&&cc.vendorOnly,
     layout.name+' wrong car or open cutaway: '+JSON.stringify(st));
   assert(cc.originalRoof&&cc.transparentWindows&&st.windows>0,
     layout.name+' missing real roof/window glass: '+JSON.stringify(st));
   assert(st.roofRayDistance>.08&&st.roofRayDistance<.67,
     layout.name+' no roof hit from driver eye: '+JSON.stringify(st));
   assert(cc.source==='1990s-hatchback.glb'&&cc.authoredCarMeshes===0
     &&cc.authoredWindshields===0&&cc.phoneMounts===0&&cc.phoneScreens===0,
     layout.name+' duplicate shell, cutaway or phone mount: '+JSON.stringify(st));
   assert(st.modelMeshes>=5&&st.carBounds?.[0]>=1.80&&st.carBounds?.[0]<1.93
     &&st.carBounds?.[1]>1.40&&st.carBounds?.[2]>3.85,
     layout.name+' wrong enclosed vehicle dimensions: '+JSON.stringify(st));
   assert(st.carYawDeg===180&&st.forwardAxis==='-Z',layout.name+' nose not toward mall');
   assert(st.maps?.length===3,layout.name+' weathering maps missing');
   assert(await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.dashboardPhone===null),
     layout.name+' old phone mount reappeared');
   assert(await page.locator('.pwm-phone-sheet,.pwm-phone-header,.pwm-phone-body,.pwm-phone-status').count()===0,
     layout.name+' retired phone overlay appeared during cinematic');
   assert(st.wet?.puddles>=15&&st.wet?.lamps>=3,'Missing wet-lot light treatment');
   // v39: the previously enormous service portal must hug the original
   // 1.95m x 2.27m hinged door, with real facade infill on all three sides.
   const entry=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.serviceEntryGeometry);
   assert(entry?.door&&entry?.opening,layout.name+' no service-entry geometry telemetry');
   const ap=entry.opening,door=entry.door,eps=.025;
   const apertureWidth=ap.right-ap.left,apertureHeight=ap.top-ap.bottom;
   const doorWidth=door.size[0],doorHeight=door.size[1];
   assert(doorWidth>1.90&&doorWidth<2.0&&doorHeight>2.2&&doorHeight<2.32,
      layout.name+' original service door dimensions changed: '+JSON.stringify(door));
   assert(apertureWidth>=doorWidth+.12&&apertureWidth<=doorWidth+.30,
      layout.name+' service doorway too wide for door: '+JSON.stringify({ap,door}));
   assert(apertureHeight>=doorHeight+.06&&apertureHeight<=doorHeight+.22,
      layout.name+' service doorway too high for door: '+JSON.stringify({ap,door}));
   assert(door.min[0]>ap.left+.04&&door.max[0]<ap.right-.04,
      layout.name+' service door does not fit between jambs: '+JSON.stringify({ap,door}));
   assert(Math.abs(entry.leftInfill.max[0]-ap.left)<eps
     &&Math.abs(entry.rightInfill.min[0]-ap.right)<eps,
      layout.name+' side gaps in original facade not closed: '+JSON.stringify(entry));
   assert(Math.abs(entry.headerInfill.min[1]-ap.top)<eps
     &&entry.headerInfill.max[1]>8.05,
      layout.name+' giant gap above door has not been infilled: '+JSON.stringify(entry));
   assert(Math.abs(entry.head.min[1]-ap.top)<eps
     &&Math.abs(entry.leftJamb.max[0]-ap.left)<eps
     &&Math.abs(entry.rightJamb.min[0]-ap.right)<eps,
      layout.name+' visible service door frame does not match opening');
   assert(entry.canopy.size[0]<3.35&&entry.canopy.size[2]<2.05,
      layout.name+' original 7m oversized canopy still present: '+JSON.stringify(entry.canopy));
   await page.waitForTimeout(500);
   await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-interior.png'});
   if(layout.name==='desktop'){
    // Regression of the exact owner-reported v42 view. The camera used to
    // sit behind the steering wheel/seat and stare at a near-field dashboard
    // target. Verify actual authored camera rig geometry, not just GLB count.
    const cameraCheck=await page.evaluate(async()=>{
      const mod=await import(new URL('../../opening/camera.js?v=43',location.href).href);
      const rig=new mod.HumanCameraRig();
      const frame=rig.sample('clock',1,10,.016,{paused:true});
      return {pose:mod.driverSeatPose,gaze:mod.dashboardGazeTarget,
        framePosition:frame.position.toArray()};
    });
    assert(cameraCheck.pose[0]>-10.31&&cameraCheck.pose[0]<-10.09
      &&cameraCheck.pose[1]>=1.20&&cameraCheck.pose[1]<=1.28
      &&cameraCheck.pose[2]>=17.54&&cameraCheck.pose[2]<=17.66,
      'v43 driver eye is back behind the seat/steering again: '+JSON.stringify(cameraCheck));
    assert(cameraCheck.gaze[2]<14.0&&cameraCheck.gaze[2]>12.0,
      'v43 near-field phone-era gaze returned: '+JSON.stringify(cameraCheck));
    await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(1);window.__PINEWOOD_OPENING_V34__.scrub(.45);});
    await page.waitForTimeout(300);
    await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-clock-dashboard-v43.png'});
    console.log('V43_FINAL_CLOCK_JPEG='+(await page.screenshot({type:'jpeg',quality:38})).toString('base64'));
    await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(0);window.__PINEWOOD_OPENING_V34__.scrub(.20);});
    await page.waitForTimeout(100);
    await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-arrive-cockpit-v43.png'});
    console.log('V43_FINAL_ARRIVAL_JPEG='+(await page.screenshot({type:'jpeg',quality:38})).toString('base64'));
   }
   if(layout.name==='desktop'){
    const seated=await page.screenshot({type:'jpeg',quality:35});
    console.log('V42_QA_DRIVER_JPEG='+seated.toString('base64'));
   }
   // Capture the vendor hatchback windshield (no supplemental geometry) in the actual preview.
   await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(0);window.__PINEWOOD_OPENING_V34__.scrub(.40);});
   await page.waitForTimeout(250);
   await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-roofed-car.png'});
   // The work-order beat now glances at the actual hatchback dashboard, without any phone object.
   await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(2);window.__PINEWOOD_OPENING_V34__.scrub(.43);});
   assert(await page.locator('#pwm-opening').getAttribute('data-shot')==='dash',
     layout.name+' a retired phone shot tag returned during the work-order beat');
   await page.waitForTimeout(350);
   await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-dashboard-glance.png'});
   await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(0);window.__PINEWOOD_OPENING_V34__.scrub(.20);});
   if(layout.name==='desktop'){
    await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(6);window.__PINEWOOD_OPENING_V34__.scrub(.5);});
    await page.waitForTimeout(300);
    await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-lot.png'});
    await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(8);window.__PINEWOOD_OPENING_V34__.scrub(.6);});
    await page.waitForTimeout(300);
    await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-entrance.png'});
    // View the SAME scene the owner flagged, first with the door closed,
    // then as the existing pivot opens, then from just past the threshold.
    await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(8);window.__PINEWOOD_OPENING_V34__.scrub(.82);});
    await page.waitForTimeout(350);
    await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-door-opening.png'});
    await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(9);window.__PINEWOOD_OPENING_V34__.scrub(.30);});
    await page.waitForTimeout(350);
    await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-inside-threshold.png'});
   }
   if(layout.name==='desktop'){
    assert(await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.qaExteriorCar()),
      'No off-axis real roof review hook');
    await page.waitForTimeout(80);
    const exterior=await page.screenshot({type:'jpeg',quality:40});
    console.log('V42_QA_EXTERIOR_JPEG='+exterior.toString('base64'));
   }
   assert(remote.length===0,layout.name+' nonlocal browser requests '+remote.join(','));
   assert(errors.length===0,layout.name+' browser errors '+errors.join(' | '));
   await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.skip());
   assert(await page.locator('#pwm-opening').evaluate(e=>e.hidden),layout.name+' preview did not release its overlay');
   report.layouts[layout.name]={passed:true,assetState:st,serviceEntry:entry,errors:[],remote:[]};
   console.log('PASS '+layout.name+' CC0 geometry, wet lot, fog, local assets, skip');
  }catch(e){report.layouts[layout.name]={passed:false,error:e.stack||String(e),errors,remote};throw e;}
  finally{await context.close();}
 }
 report.passed=true;
}finally{
 await browser.close();
 await writeFile('opening-v37-artifacts/report.json',JSON.stringify(report,null,2));
}
console.log(JSON.stringify(report,null,2));
