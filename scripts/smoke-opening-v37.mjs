import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const origin=new URL(base).origin;
const preview=new URL('review/the-call-v34/',base).href;
const assert=(v,m)=>{if(!v)throw Error(m);};
await mkdir('opening-v37-artifacts',{recursive:true});
const report={version:37,preview,layouts:{},passed:false};
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
   assert(st.car==='loaded'&&st.phone==='loaded',layout.name+' first-person models absent: '+JSON.stringify(st));
   // Regression for screenshot report: the CC0 car was loaded 180° backwards.
   assert(st.carYawDeg===180&&st.forwardAxis==='-Z',layout.name+' imported cabin is reversed: '+JSON.stringify(st));
   assert(st.cockpitViewRays?.length===3,layout.name+' cockpit first-person clearance telemetry missing');
   const nearSeat=st.cockpitViewRays.filter(d=>d!==null&&d<.46);
   assert(!nearSeat.length,layout.name+' object blocks driver eye within 46cm: '+JSON.stringify(st.cockpitViewRays));
   assert(st.maps?.length===3,layout.name+' PBR surfaces incomplete');
   assert(st.carBounds?.[0]>1.5&&st.carBounds?.[0]<2.1,'Car geometry not full scale');
   assert(st.phoneBounds?.[0]>.08&&st.phoneBounds?.[0]<.14,'Phone mount out of scale');
   assert(st.wet?.puddles>=15&&st.wet?.lamps>=3,'Missing wet-lot light treatment');
   await page.waitForTimeout(500);
   await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-interior.png'});
   // The phone is meant to be mounted in front of the driver, not in the back seat.
   await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(2);window.__PINEWOOD_OPENING_V34__.scrub(.43);});
   await page.waitForTimeout(350);
   await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-phone-glance.png'});
   await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(0);window.__PINEWOOD_OPENING_V34__.scrub(.20);});
   if(layout.name==='desktop'){
    await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(6);window.__PINEWOOD_OPENING_V34__.scrub(.5);});
    await page.waitForTimeout(300);
    await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-lot.png'});
    await page.evaluate(()=>{window.__PINEWOOD_OPENING_V34__.seek(8);window.__PINEWOOD_OPENING_V34__.scrub(.6);});
    await page.waitForTimeout(300);
    await page.screenshot({path:'opening-v37-artifacts/'+layout.name+'-entrance.png'});
   }
   assert(remote.length===0,layout.name+' nonlocal browser requests '+remote.join(','));
   assert(errors.length===0,layout.name+' browser errors '+errors.join(' | '));
   await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.skip());
   assert(await page.locator('#pwm-opening').evaluate(e=>e.hidden),layout.name+' preview did not release its overlay');
   report.layouts[layout.name]={passed:true,assetState:st,errors:[],remote:[]};
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
