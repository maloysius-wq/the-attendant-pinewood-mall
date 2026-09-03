import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const views=['security-cctv','security-shutters','security-luis'];
await mkdir('security-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const report={base,views:{},failed:false};
try{
  for(const view of views){
    const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
    const consoleMessages=[],remoteRequests=[];
    const origin=new URL(base).origin;
    page.on('console',m=>consoleMessages.push({type:m.type(),text:m.text()}));
    page.on('pageerror',e=>consoleMessages.push({type:'pageerror',text:e.stack||e.message}));
    page.on('request',r=>{try{const u=new URL(r.url());if((u.protocol==='http:'||u.protocol==='https:')&&u.origin!==origin)remoteRequests.push(r.url());}catch{}});
    const url=new URL(base);url.searchParams.set('visualTest',view);
    try{
      await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true,null,{timeout:120000});
      await page.waitForTimeout(800);
      const state=await page.evaluate(()=>({
        visual:window.__PINEWOOD_VISUAL_INFO__||null,
        story:window.__PINEWOOD_STORY_V17__||null,
        chapter1:window.__PINEWOOD_CH1_V20__||null,
        chapter2:window.__PINEWOOD_CH2_V21__||null,
        chapter3:window.__PINEWOOD_CH3_V22__||null,
        status:document.getElementById('assetStatus')?.textContent||''
      }));
      await page.screenshot({path:`security-artifacts/${view}.png`,fullPage:true});
      const remotes=[...new Set(remoteRequests)];
      const ch3=state.chapter3;
      const ok=remotes.length===0&&state.story?.version===17&&state.chapter1?.version===20&&state.chapter2?.version===21&&ch3?.version===22&&ch3?.cctvFeeds===4&&ch3?.nonOmniscient===true&&ch3?.interlockedShutters===true&&ch3?.luisSetpiece===true&&ch3?.lastShiftEvidence==='LS-05'&&ch3?.eastWingHandoff===true&&ch3?.readabilityLighting===true&&ch3?.readabilityPolish===true&&ch3?.voiceImitation===false&&ch3?.sceneBuilt===true;
      if(!ok)report.failed=true;
      report.views[view]={ok,state,consoleMessages,remoteRequests:remotes};
    }catch(err){
      report.failed=true;
      await page.screenshot({path:`security-artifacts/${view}-failure.png`,fullPage:true}).catch(()=>{});
      report.views[view]={ok:false,error:err.stack||String(err),consoleMessages,remoteRequests:[...new Set(remoteRequests)]};
    }finally{await page.close();}
  }
}finally{await browser.close();}
await writeFile('security-artifacts/report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(report.failed)process.exitCode=1;
