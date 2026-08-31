import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const views=['cassette-front','cassette-center','cassette-listening'];
await mkdir('visual-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--disable-dev-shm-usage']});
const report={base,views:{}};
try{
  for(const view of views){
    const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
    const consoleMessages=[];
    page.on('console',msg=>consoleMessages.push({type:msg.type(),text:msg.text()}));
    page.on('pageerror',err=>consoleMessages.push({type:'pageerror',text:err.stack||err.message}));
    const url=new URL(base);url.searchParams.set('visualTest',view);
    await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true,{timeout:120000});
    await page.waitForTimeout(2500);
    const info=await page.evaluate(()=>window.__PINEWOOD_VISUAL_INFO__||null);
    const failureText=await page.locator('#assetStatus').textContent().catch(()=>null);
    await page.screenshot({path:`visual-artifacts/${view}.png`,fullPage:true});
    report.views[view]={info,failureText,consoleMessages};
    await page.close();
  }
}finally{await browser.close();}
await writeFile('visual-artifacts/report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
