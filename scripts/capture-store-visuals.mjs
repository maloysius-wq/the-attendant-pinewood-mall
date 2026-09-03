import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const views=['cassette-front','cassette-center','cassette-listening','elevator-front','arcade-checkout','video-checkout'];
await mkdir('visual-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const report={base,views:{},pcasDecode:null,failed:false};
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
      if(!report.pcasDecode){
        report.pcasDecode=await page.evaluate(async()=>{
          const manifest=await fetch('./assets/audio/pa/manifest.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('PCAS manifest HTTP '+r.status);return r.json();});
          const AudioCtx=window.AudioContext||window.webkitAudioContext;
          if(!AudioCtx)throw new Error('Web Audio API unavailable in browser gate');
          const ctx=new AudioCtx(),decoded=[],failures=[];
          try{
            for(const [id,entry] of Object.entries(manifest.files||{})){
              try{
                const response=await fetch('./assets/audio/pa/'+entry.file,{cache:'no-store'});
                if(!response.ok)throw new Error('HTTP '+response.status);
                const buffer=await ctx.decodeAudioData(await response.arrayBuffer());
                if(!buffer||!Number.isFinite(buffer.duration)||buffer.duration<=0)throw new Error('invalid decoded duration');
                decoded.push({id,file:entry.file,duration:buffer.duration});
              }catch(err){failures.push({id,error:String(err?.message||err)});}
            }
          }finally{await ctx.close().catch(()=>{});}
          return {version:manifest.version,lineCount:Object.keys(manifest.files||{}).length,decodedCount:decoded.length,decoded,failures,localOnly:Object.values(manifest.files||{}).every(e=>typeof e.file==='string'&&!/^https?:/i.test(e.file)&&!e.file.includes('..'))};
        });
      }
      await page.waitForTimeout(1000);
      const info=await page.evaluate(()=>window.__PINEWOOD_VISUAL_INFO__||null);
      const story=await page.evaluate(()=>window.__PINEWOOD_STORY_V17__||null);
      const pcas=await page.evaluate(()=>window.__PINEWOOD_PCAS_V19__||null);
      const chapter1V20=await page.evaluate(()=>window.__PINEWOOD_CH1_V20__||null);
      const failureText=await page.locator('#assetStatus').textContent().catch(()=>null);
      await page.screenshot({path:`visual-artifacts/${view}.png`,fullPage:true});
      const uniqueRemote=[...new Set(remoteRequests)];
      const storyOk=story?.version===17&&story?.chapterCount===6&&Array.isArray(story?.lastShiftIds)&&story.lastShiftIds.length===9;
      const pcasRuntimeOk=pcas?.version===19&&pcas?.lineCount>=19&&pcas?.localOnly===true&&Array.isArray(pcas?.failures)&&pcas.failures.length===0;
      const pcasDecodeOk=report.pcasDecode?.version===19&&report.pcasDecode?.lineCount>=19&&report.pcasDecode?.decodedCount===report.pcasDecode?.lineCount&&pcas?.lineCount===report.pcasDecode?.lineCount&&report.pcasDecode?.localOnly===true&&Array.isArray(report.pcasDecode?.failures)&&report.pcasDecode.failures.length===0;
      const chapter1V20Ok=chapter1V20?.version===20&&chapter1V20?.reactivePcas===true&&chapter1V20?.reneeAware===true&&chapter1V20?.voiceImitation===false;
      if(uniqueRemote.length||!storyOk||!pcasRuntimeOk||!pcasDecodeOk||!chapter1V20Ok)report.failed=true;
      report.views[view]={ok:uniqueRemote.length===0&&storyOk&&pcasRuntimeOk&&pcasDecodeOk&&chapter1V20Ok,info,story,pcas,chapter1V20,failureText,consoleMessages,remoteRequests:uniqueRemote};
    }catch(err){
      report.failed=true;
      const failureText=await page.locator('#assetStatus').textContent().catch(()=>null);
      const bodyText=await page.locator('body').innerText().catch(()=>null);
      const pcas=await page.evaluate(()=>window.__PINEWOOD_PCAS_V19__||null).catch(()=>null);
      const chapter1V20=await page.evaluate(()=>window.__PINEWOOD_CH1_V20__||null).catch(()=>null);
      await page.screenshot({path:`visual-artifacts/${view}-failure.png`,fullPage:true}).catch(()=>{});
      report.views[view]={ok:false,error:err.stack||String(err),pcas,chapter1V20,failureText,bodyText,consoleMessages,remoteRequests:[...new Set(remoteRequests)]};
    }finally{await page.close();}
  }
}finally{await browser.close();}
await writeFile('visual-artifacts/report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(report.failed)process.exitCode=1;
