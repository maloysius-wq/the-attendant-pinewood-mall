import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const origin=new URL(base).origin;
const preview=new URL('review/the-call-v34/',base).href;
const assert=(v,m)=>{if(!v)throw Error(m);};
await mkdir('opening-v37-artifacts',{recursive:true});
const report={version:41,preview,layouts:{},passed:false};
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
   await page.locator('#newBtn').click();
   await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:20000});
   await page.waitForFunction(()=>['ready','failed'].includes(window.__PINEWOOD_OPENING_V34__?.environmentV37?.state),null,{timeout:90000});
   const st=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.environmentV37);
   assert(st.state==='ready',layout.name+' v37 asset stage failed: '+JSON.stringify(st.errors));
   assert(st.car==='loaded'&&st.phone==='removed',layout.name+' truck loading or phone removal failed: '+JSON.stringify(st));
   const cc=st.cockpit;
   assert(cc?.construction==='single-GRAB3D-truck-cabin'&&cc.vendorOnly,
     layout.name+' truck not the only car model: '+JSON.stringify(cc));
   assert(cc.source==='truck-cabin-interior.glb'&&cc.authoredCarMeshes===0
     &&cc.authoredRoofPanels===0&&cc.authoredWindshields===0
     &&cc.phoneMounts===0&&cc.phoneScreens===0,
     layout.name+' prohibited procedural car or mounted phone returned: '+JSON.stringify(cc));
   assert(st.modelMeshes>=2&&st.carBounds?.[0]>=2.15&&st.carBounds?.[0]<2.5,
     layout.name+' missing full-size genuine CC0 truck geometry: '+JSON.stringify(st));
   assert(st.carYawDeg===180&&st.forwardAxis==='-Z',
     layout.name+' truck not facing toward windshield: '+JSON.stringify(st));
   assert(st.cockpitViewRays?.length===3,
     layout.name+' missing first-person cab view measurements');
   assert(st.cockpitViewRays.filter(x=>x!==null&&x<.25).length===0,
     layout.name+' immediate obstruction ahead of driver: '+JSON.stringify(st.cockpitViewRays));
   assert(st.maps?.length===3,layout.name+' lost CC0 parking/mall PBR surfaces');
   assert(await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.dashboardPhone===null),
     layout.name+' prohibited phone still attached to preview stage');
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
   // Capture the vendor truck windshield (no supplemental geometry) in the actual preview.
   await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(0);window.__PINEWOOD_OPENING_V34__.scrub(.40);});
   await page.waitForTimeout(250);
   await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-truck-cabin.png'});
   // Existing phone-labeled story beat now glances at the vendor truck dash, without phone.
   await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(2);window.__PINEWOOD_OPENING_V34__.scrub(.43);});
   await page.waitForTimeout(350);
   await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-truck-dashboard-glance.png'});
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
