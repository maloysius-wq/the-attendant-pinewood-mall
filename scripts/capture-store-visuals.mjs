import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const views=['cassette-front','cassette-center','cassette-listening','elevator-front','arcade-checkout','video-checkout'];
await mkdir('visual-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--disable-dev-shm-usage']});
const report={base,views:{},failed:false};
try{
  for(const view of views){
    const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
    const consoleMessages=[],remoteRequests=[];
    const allowedOrigin=new URL(base).origin;
    page.on('request',request=>{try{const u=new URL(request.url());if((u.protocol==='http:'||u.protocol==='https:')&&u.origin!==allowedOrigin)remoteRequests.push(request.url());}catch{}});
    page.on('console',msg=>consoleMessages.push({type:msg.type(),text:msg.text()}));
    page.on('pageerror',err=>consoleMessages.push({type:'pageerror',text:err.stack||err.message}));
    const url=new URL(base);url.searchParams.set('visualTest',view);
    try{
      await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true,null,{timeout:120000});
      await page.waitForFunction(()=>window.__PINEWOOD_PCAS_V19__?.loaded===window.__PINEWOOD_PCAS_V19__?.lineCount,null,{timeout:45000});
      await page.waitForTimeout(1000);
      const info=await page.evaluate(()=>window.__PINEWOOD_VISUAL_INFO__||null);
      const story=await page.evaluate(()=>window.__PINEWOOD_STORY_V17__||null);
      const pcas=await page.evaluate(()=>window.__PINEWOOD_PCAS_V19__||null);
      const pcasResources=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).filter(name=>name.includes('/assets/audio/pa/')&&name.endsWith('.ogg')));
      const failureText=await page.locator('#assetStatus').textContent().catch(()=>null);
      await page.screenshot({path:`visual-artifacts/${view}.png`,fullPage:true});
      const uniqueRemote=[...new Set(remoteRequests)];
      const storyOk=story?.version===17&&story?.chapterCount===6&&Array.isArray(story?.lastShiftIds)&&story.lastShiftIds.length===9;
      const pcasOk=pcas?.version===19&&pcas?.lineCount===19&&pcas?.loaded===19&&pcas?.localOnly===true&&Array.isArray(pcas?.failures)&&pcas.failures.length===0&&new Set(pcasResources).size===19;
      if(uniqueRemote.length||!storyOk||!pcasOk)report.failed=true;
      report.views[view]={ok:uniqueRemote.length===0&&storyOk&&pcasOk,info,story,pcas,pcasResources:[...new Set(pcasResources)],failureText,consoleMessages,remoteRequests:uniqueRemote};
    }catch(err){
      report.failed=true;
      const failureText=await page.locator('#assetStatus').textContent().catch(()=>null);
      const bodyText=await page.locator('body').innerText().catch(()=>null);
      const pcas=await page.evaluate(()=>window.__PINEWOOD_PCAS_V19__||null).catch(()=>null);
      await page.screenshot({path:`visual-artifacts/${view}-failure.png`,fullPage:true}).catch(()=>{});
      report.views[view]={ok:false,error:err.stack||String(err),pcas,failureText,bodyText,consoleMessages,remoteRequests:[...new Set(remoteRequests)]};
    }finally{await page.close();}
  }
}finally{await browser.close();}
await writeFile('visual-artifacts/report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(report.failed)process.exitCode=1;
