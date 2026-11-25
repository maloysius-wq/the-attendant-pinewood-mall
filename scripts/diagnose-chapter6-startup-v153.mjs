/** V153 diagnostic: distinguish legacy visual boot from the actual saved
 * Continue path, on main before V152 lands. No production changes and no
 * direct invocation of puzzle handlers or synthetic game scenes. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const mode=process.argv[2],base='http://127.0.0.1:4173/';
assert.ok(['visual','continue'].includes(mode));
const dir='artifacts/v153-chapter6-'+mode;
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
const started=Date.now(),events=[],errors=[],remote=[],failed=[];
let page,report={mode,passed:false},last=null;
const log=(stage,data)=>{const entry={stage,elapsedMs:Date.now()-started,data};events.push(entry);console.log('V153_CH6 '+JSON.stringify(entry));};
try{
 page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(base).origin)remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 // A disposable old-format checkpoint fixture isolates Chapter 6 startup.
 // This is not evidence that a real campaign has reached the finale.
 if(mode==='continue')await page.addInitScript(()=>{
  if(location.hostname==='127.0.0.1'&&!localStorage.getItem('pinewood_attendant_reborn_v1'))
   localStorage.setItem('pinewood_attendant_reborn_v1',JSON.stringify({
    started:true,unlockedChapter:5,lastChapter:5,journal:{}
   }));
 });
 const url=new URL(base);
 url.searchParams.set('vestibuleQA','1');
 if(mode==='visual')url.searchParams.set('visualTest','last-shift-control');
 else url.searchParams.set('openingDisabled','1');
 const snapshot=()=>page.evaluate(()=>({
  assetStatus:document.getElementById('assetStatus')?.textContent,
  loadText:document.getElementById('loadText')?.textContent,
  loadFill:document.getElementById('loadFill')?.style.width,
  screen:document.querySelector('.screen.show')?.id||null,
  title:document.getElementById('chapterTitle')?.textContent,
  begin:document.getElementById('chapterStartBtn')?.textContent,
  bridge:!!window.__PINEWOOD_V70_BRIDGE__,
  visualReady:!!window.__PINEWOOD_VISUAL_READY__,
  visualInfo:window.__PINEWOOD_VISUAL_INFO__||null,
  legacyFinaleApi:!!window.__PINEWOOD_CH6_TEST_V25__,
  finale:window.__PINEWOOD_CH6_V25__||null,
  placement:window.__PINEWOOD_V112_QA__?.getState?.()||null
 }));
 await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000,polling:500});
 log('runtime-bridge',await snapshot());
 if(mode==='continue'){
  await page.waitForFunction(()=>window.__PINEWOOD_STORY_V17__?.version===17&&
    !document.getElementById('continueBtn')?.disabled&&
    document.getElementById('titleScreen')?.classList.contains('show'),null,{timeout:230000,polling:500});
  await page.locator('#continueBtn').click();
  log('actual-continue-clicked',await snapshot());
 }
 // Sample the original UI/loading state periodically. Legacy 120s is recorded
 // as a milestone rather than silently treated as a pass.
 const deadline=Date.now()+540000,bootStart=Date.now();
 while(Date.now()<deadline){
  last=await snapshot();
  log('loading',last);
  const ready=mode==='visual'?last.visualReady&&last.legacyFinaleApi:
    last.placement?.chapter===6&&last.screen==='chapterScreen'&&last.begin==='Begin Shift';
  if(ready)break;
  if(errors.length)throw Error('Original runtime page error: '+errors.join(' | '));
  await new Promise(r=>setTimeout(r,5000));
 }
 const ready=mode==='visual'?last?.visualReady&&last?.legacyFinaleApi:
   last?.placement?.chapter===6&&last?.screen==='chapterScreen'&&last?.begin==='Begin Shift';
 assert.ok(ready,'Chapter 6 did not reach expected original ready state within 540s');
 assert.equal(last.finale?.sceneBuilt,true);
 assert.equal(last.placement?.chapter,6);
 assert.ok(last.placement?.y>5,'actual Chapter 6 player spawn must be on M1');
 report.bootMs=Date.now()-bootStart;
 if(mode==='continue'){
  await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
  await page.waitForFunction(()=>!document.querySelector('.screen.show'),null,{timeout:90000,polling:500});
  last=await snapshot();log('actual-begin-shift',last);
 }
 assert.deepEqual(errors,[]);
 assert.deepEqual(remote,[]);
 assert.deepEqual(failed.filter(x=>!/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(x)),[]);
 report.passed=true;
 await page.screenshot({path:dir+'/chapter6.png',timeout:120000});
}catch(error){
 report.error=String(error);console.error('V153_CH6_FAILURE '+report.error);
 if(page)await page.screenshot({path:dir+'/failure.png',timeout:120000}).catch(()=>{});
 process.exitCode=1;
}finally{
 report={...report,last,events,errors,remote,failed};
 await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
 console.log('V153_CH6_RESULT '+JSON.stringify({mode,passed:report.passed,bootMs:report.bootMs,error:report.error,errors,remote,failed,last}));
 await browser.close();
}
