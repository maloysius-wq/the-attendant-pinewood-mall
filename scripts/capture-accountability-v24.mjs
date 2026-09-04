import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const views=['accountability-roster','accountability-kessler','accountability-eli','accountability-sessions'];
await mkdir('accountability-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const report={base,views:{},failed:false};
try{
  for(const view of views){
    const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
    const consoleMessages=[],remoteRequests=[];const origin=new URL(base).origin;
    page.on('console',m=>consoleMessages.push({type:m.type(),text:m.text()}));
    page.on('pageerror',e=>consoleMessages.push({type:'pageerror',text:e.stack||e.message}));
    page.on('request',r=>{try{const u=new URL(r.url());if((u.protocol==='http:'||u.protocol==='https:')&&u.origin!==origin)remoteRequests.push(r.url());}catch{}});
    const url=new URL(base);url.searchParams.set('visualTest',view);
    try{
      await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true,null,{timeout:120000});
      await page.waitForTimeout(900);
      const state=await page.evaluate(()=>({visual:window.__PINEWOOD_VISUAL_INFO__||null,story:window.__PINEWOOD_STORY_V17__||null,chapter2:window.__PINEWOOD_CH2_V21__||null,chapter3:window.__PINEWOOD_CH3_V22__||null,chapter4:window.__PINEWOOD_CH4_V23__||null,chapter5:window.__PINEWOOD_CH5_V24__||null,status:document.getElementById('assetStatus')?.textContent||''}));
      await page.screenshot({path:`accountability-artifacts/${view}.png`,fullPage:true});
      const remotes=[...new Set(remoteRequests)],errors=consoleMessages.filter(m=>m.type==='pageerror'||m.type==='error');
      const ch5=state.chapter5;
      const ok=remotes.length===0&&errors.length===0&&state.story?.version===17&&state.chapter2?.version===21&&state.chapter3?.version===22&&state.chapter3?.readabilityPolish===true&&state.visual?.view===view&&ch5?.version===24&&ch5?.reconstruction===true&&ch5?.rosterTerminal===true&&ch5?.kesslerCoverup===true&&ch5?.eliSetpiece===true&&ch5?.contractorSessions===14&&Array.isArray(ch5?.lastShiftEvidence)&&ch5.lastShiftEvidence.join(',')==='LS-07,LS-08,LS-09'&&ch5?.eliIsAttendant===false&&ch5?.sceneBuilt===true;
      if(!ok)report.failed=true;report.views[view]={ok,state,consoleMessages,remoteRequests:remotes};
    }catch(err){report.failed=true;await page.screenshot({path:`accountability-artifacts/${view}-failure.png`,fullPage:true}).catch(()=>{});report.views[view]={ok:false,error:err.stack||String(err),consoleMessages,remoteRequests:[...new Set(remoteRequests)]};}
    finally{await page.close();}
  }
}finally{await browser.close();}
await writeFile('accountability-artifacts/report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(report.failed)process.exitCode=1;
