import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const origin='http://127.0.0.1:4173';
const fail=[],assert=(condition,message)=>{if(!condition){fail.push(message);console.error('V62_FAIL '+message)}};
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required']});
const report={layouts:{},passed:false};
await mkdir('opening-v62-artifacts',{recursive:true});
try{
 for(const [layout,width,height] of [['desktop',1280,720],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());});
  try{
   await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>document.querySelector('#titleScreen.show #newBtn')&&window.__PINEWOOD_OPENING_V34__,null,{timeout:90000});
   await page.locator('#newBtn').click();
   await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:110000});
   const snap=async (index,fraction,wait=160)=>{
    await page.evaluate(({index,fraction})=>{
     const s=window.__PINEWOOD_OPENING_V34__;s.seek(index);s.scrub(fraction);
    },{index,fraction});
    await page.waitForTimeout(wait);
    return page.evaluate(()=>{
     const s=window.__PINEWOOD_OPENING_V34__,g=s.eyeMotion?.gaze||[0,0,-1],p=s.cameraPosition||[0,0,0],
       yaw=Math.atan2(g[0]-p[0],p[2]-g[2])*180/Math.PI;
     return{phone:s.handheldPhone,camera:p,gaze:g,yaw,
      focusDistance:Math.hypot(g[0]-p[0],g[1]-p[1],g[2]-p[2]),
      rain:s.audioStatus?.ambient,timing:s.captionTiming};
    });
   };
   const driver=await snap(0,.02);
   assert(driver.camera[2]>=17.65,layout+' steering wheel remains too large in the close driver view: eyeZ='+driver.camera[2]);
   const gazeSamples=[];
   for(let index=0;index<5;index++){
    const samples=[];
    for(const fraction of [.08,.32,.55,.78,.94]){
     const t=await snap(index,fraction,95);
     samples.push({fraction,yaw:+t.yaw.toFixed(2),distance:+t.focusDistance.toFixed(2)});
    }
    const range=Math.max(...samples.map(x=>x.yaw))-Math.min(...samples.map(x=>x.yaw));
    const shortest=Math.min(...samples.map(x=>x.distance));
    assert(range<=11,layout+' dialogue '+index+' darts through too many gaze angles: '+JSON.stringify(samples));
    assert(shortest>17,layout+' dialogue '+index+' zooms attention into dashboard/mirror: '+JSON.stringify(samples));
    gazeSamples.push({index,range:+range.toFixed(2),shortest:+shortest.toFixed(2)});
   }
   const pre=await snap(0,.74);
   assert(pre.phone?.visible&&pre.phone?.screenState==='pending'&&!pre.phone?.tap,
     layout+' pressed CHECK IN while Renee was still giving instructions: '+JSON.stringify(pre.phone));
   const voiceSeconds=pre.timing.voiceSeconds,waitSeconds=pre.timing.waitSeconds;
   const duringTap=await snap(0,(voiceSeconds+.28)/waitSeconds);
   assert(duringTap.phone?.visible&&duringTap.phone?.tap&&duringTap.phone?.screenState==='pending',
     layout+' did not tap just AFTER Renee finished speaking: '+JSON.stringify(duringTap.phone));
   const afterTap=await snap(0,(voiceSeconds+.68)/waitSeconds);
   assert(afterTap.phone?.screenState==='confirmed'&&!afterTap.phone?.tap,
     layout+' check-in did not complete and release after the line: '+JSON.stringify(afterTap.phone));
   await page.screenshot({path:'opening-v62-artifacts/'+layout+'-check-in-after-instruction.png'});
   const stowed=await snap(1,.10);
   assert(!stowed.phone?.visible&&stowed.phone?.screenState==='confirmed',
     layout+' handset still hangs in view after first second of next line: '+JSON.stringify(stowed.phone));
   await page.screenshot({path:'opening-v62-artifacts/'+layout+'-phone-stowed.png'});
   const inside=await snap(5,.25,780);
   const outside=await snap(5,.40,210);
   assert(inside.rain?.car?.readyState===4&&inside.rain?.outside?.readyState===4,
     layout+' both local rain beds must be ready when the cinematic starts: '+JSON.stringify(inside.rain));
   assert(inside.rain?.car?.volume>.28&&inside.rain?.outside?.volume<.10,
     layout+' indoor rain must dominate before the driver steps out: '+JSON.stringify(inside.rain));
   assert(outside.rain?.outside?.volume>.40&&outside.rain?.car?.volume<.13,
     layout+' outside rain does not become immediate at the exit: '+JSON.stringify(outside.rain));
   console.log('V62_'+layout.toUpperCase()+'='+JSON.stringify({
    driverZ:driver.camera[2],gazeSamples,phone:{pre:pre.phone?.tap,post:duringTap.phone?.tap,
     released:afterTap.phone?.screenState,stowed:!stowed.phone?.visible},
    rain:{inside:inside.rain,outside:outside.rain}}));
   assert(!errors.length&&!remote.length,layout+' browser errors or remote assets: '+JSON.stringify({errors,remote}));
   report.layouts[layout]={driverZ:driver.camera[2],gazeSamples,
    checkin:{pre:pre.phone?.screenState,duringTap:duringTap.phone?.tap,
      after:afterTap.phone?.screenState,lowered:!stowed.phone?.visible},
    rain:{inside:inside.rain,outside:outside.rain},errors,remote};
  }finally{await page.close();}
 }
 report.passed=fail.length===0;
}finally{
 await browser.close();
 await writeFile('opening-v62-artifacts/report.json',JSON.stringify({...report,fail},null,2));
}
if(fail.length)throw Error('v62 natural-motion regression failed ('+fail.length+'):\n'+fail.join('\n'));
console.log('V62_PACING_PASS '+JSON.stringify(report));
