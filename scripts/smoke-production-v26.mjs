import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const SAVE_KEY='pinewood_attendant_reborn_v1';
const out='production-smoke-artifacts';
await mkdir(out,{recursive:true});

const report={base,checks:{},chapters:{},failed:false};
const fail=(name,msg)=>{report.failed=true;throw new Error(`${name}: ${msg}`);};
const expect=(name,cond,msg)=>{if(!cond)fail(name,msg);};
const origin=new URL(base).origin;

function attachTelemetry(page){
  const errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{try{const u=new URL(r.url());if((u.protocol==='http:'||u.protocol==='https:')&&u.origin!==origin)remote.push(r.url());}catch{}});
  return {errors,remote};
}
async function waitRuntime(page){
  await page.waitForFunction(()=>window.__PINEWOOD_STORY_V17__?.version===17&&window.__PINEWOOD_STORY_V17__?.chapterCount===6,null,{timeout:120000});
}
async function openPage(browser,{saveRaw,visualTest}={}){
  const context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1});
  if(saveRaw!==undefined)await context.addInitScript(({key,raw})=>localStorage.setItem(key,raw),{key:SAVE_KEY,raw:saveRaw});
  const page=await context.newPage();
  const telemetry=attachTelemetry(page);
  const url=new URL(base);if(visualTest)url.searchParams.set('visualTest',visualTest);
  await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:90000});
  await waitRuntime(page);
  if(visualTest)await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true,null,{timeout:120000});
  return {context,page,telemetry};
}
function assertTelemetry(name,{errors,remote}){
  expect(name,errors.length===0,`browser errors: ${errors.join(' | ')}`);
  expect(name,remote.length===0,`remote requests: ${[...new Set(remote)].join(', ')}`);
}

const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
  // Clean-save title/menu smoke.
  {
    const name='clean-save-menu';
    const {context,page,telemetry}=await openPage(browser);
    try{
      await page.waitForFunction(()=>document.getElementById('titleScreen')?.classList.contains('show'));
      const kicker=(await page.locator('#titleScreen .kicker').textContent()||'').trim();
      expect(name,kicker==='PINEWOOD MALL • AFTER HOURS',`title kicker is ${JSON.stringify(kicker)}`);
      expect(name,!kicker.includes('1997'),'title screen prematurely labels the present-day arrival as 1997');
      for(const id of ['newBtn','continueBtn','chaptersBtn','settingsBtn','journalBtn','creditsBtn']){
        expect(name,await page.locator('#'+id).count()===1,`missing title control #${id}`);
        expect(name,(await page.locator('#'+id).innerText()).trim().length>0,`empty title control #${id}`);
      }
      expect(name,await page.locator('#continueBtn').isDisabled(),'Continue should be disabled on a clean save');

      await page.click('#chaptersBtn');
      await page.waitForFunction(()=>document.getElementById('chaptersScreen')?.classList.contains('show'));
      const chaptersText=await page.locator('#chaptersList').innerText();
      for(const title of ['Closing Time','Below Grade','Eyes in Security','The East Wing','Accountability','The Last Shift'])expect(name,chaptersText.includes(title),`chapter selector missing ${title}`);
      expect(name,await page.locator('#chaptersList .chapterCard').count()===6,'chapter selector should render exactly six chapter cards');
      await page.click('#chaptersScreen [data-back]');

      await page.click('#settingsBtn');
      await page.waitForFunction(()=>document.getElementById('settingsScreen')?.classList.contains('show'));
      for(const id of ['brightRange','volumeRange','musicRange','sensRange','qualitySelect','glitchSelect','jumpsBtn','muzakBtn','resetBtn'])expect(name,await page.locator('#'+id).count()===1,`missing setting #${id}`);
      await page.click('#settingsScreen [data-back]');

      await page.click('#journalBtn');
      await page.waitForFunction(()=>document.getElementById('journalScreen')?.classList.contains('show'));
      const journal=(await page.locator('#journalList').innerText()).trim();
      expect(name,journal.includes('No Pinewood evidence recovered yet.'),`clean journal state unexpected: ${journal}`);
      await page.screenshot({path:`${out}/clean-title-menu.png`,fullPage:true});
      assertTelemetry(name,telemetry);
      report.checks[name]={ok:true,kicker,chapterCards:6,journal};
    }catch(err){report.failed=true;report.checks[name]={ok:false,error:err.stack||String(err),telemetry};throw err;}finally{await context.close();}
  }

  // Corrupt save must fail safe into a playable clean state.
  {
    const name='corrupt-save-recovery';
    const {context,page,telemetry}=await openPage(browser,{saveRaw:'{definitely:not-valid-json'});
    try{
      expect(name,await page.locator('#titleScreen').evaluate(el=>el.classList.contains('show')),'title screen did not recover from corrupt save');
      expect(name,await page.locator('#continueBtn').isDisabled(),'corrupt save should not create a fake Continue state');
      await page.click('#journalBtn');
      const journal=(await page.locator('#journalList').innerText()).trim();
      expect(name,journal.includes('No Pinewood evidence recovered yet.'),'corrupt save did not recover to empty journal state');
      assertTelemetry(name,telemetry);
      report.checks[name]={ok:true};
    }catch(err){report.failed=true;report.checks[name]={ok:false,error:err.stack||String(err),telemetry};throw err;}finally{await context.close();}
  }

  // Legacy pre-v17-style fields should migrate in memory without losing progress/settings.
  {
    const name='legacy-save-migration';
    const legacy={started:true,unlockedChapter:2,lastChapter:1,journal:{'LS-01':'LEGACY LS-01 MIGRATION PROBE'},settings:{brightness:.91,volume:.40}};
    const {context,page,telemetry}=await openPage(browser,{saveRaw:JSON.stringify(legacy)});
    try{
      expect(name,!await page.locator('#continueBtn').isDisabled(),'valid legacy progress did not preserve Continue');
      await page.click('#journalBtn');
      await page.waitForFunction(()=>document.getElementById('journalScreen')?.classList.contains('show'));
      const journal=await page.locator('#journalList').innerText();
      expect(name,journal.includes('LS-01'),'legacy LS-01 did not migrate into structured evidence display');
      expect(name,journal.includes('LEGACY LS-01 MIGRATION PROBE'),'legacy journal text was lost');
      await page.click('#journalScreen [data-back]');
      await page.click('#settingsBtn');
      expect(name,Math.abs(Number(await page.locator('#brightRange').inputValue())-.91)<.001,'legacy brightness was not preserved');
      expect(name,Math.abs(Number(await page.locator('#volumeRange').inputValue())-.40)<.001,'legacy master volume was not preserved');
      expect(name,Math.abs(Number(await page.locator('#musicRange').inputValue())-1.05)<.001,'missing legacy music setting did not receive current default');
      expect(name,(await page.locator('#qualitySelect').inputValue())==='high','missing legacy quality setting did not receive current default');
      expect(name,(await page.locator('#glitchSelect').inputValue())==='full','missing legacy glitch setting did not receive current default');
      assertTelemetry(name,telemetry);
      report.checks[name]={ok:true,journalMigrated:true,settingsMerged:true};
    }catch(err){report.failed=true;report.checks[name]={ok:false,error:err.stack||String(err),telemetry};throw err;}finally{await context.close();}
  }

  // One deterministic player-facing HUD view from every chapter.
  const chapterViews=[
    ['cassette-front','Closing Time'],
    ['below-grade-pump','Below Grade'],
    ['security-cctv','Eyes in Security'],
    ['east-wing-map','The East Wing'],
    ['accountability-roster','Accountability'],
    ['last-shift-control','The Last Shift']
  ];
  for(const [view,expectedTitle] of chapterViews){
    const name=`chapter-hud-${view}`;
    const {context,page,telemetry}=await openPage(browser,{visualTest:view});
    try{
      await page.waitForTimeout(700);
      const state=await page.evaluate(()=>({
        visual:window.__PINEWOOD_VISUAL_INFO__||null,
        chapter:(document.getElementById('chapterName')?.textContent||'').trim(),
        objective:(document.getElementById('objective')?.textContent||'').trim(),
        inventory:(document.getElementById('inventory')?.textContent||'').trim(),
        status:(document.getElementById('assetStatus')?.textContent||'').trim(),
        body:(document.body?.innerText||'')
      }));
      expect(name,state.visual?.view===view,`visual harness reported ${state.visual?.view||'no view'}`);
      expect(name,state.chapter.toLowerCase().includes(expectedTitle.toLowerCase()),`HUD chapter title ${JSON.stringify(state.chapter)} does not identify ${expectedTitle}`);
      expect(name,state.objective.length>=8,`objective is empty/too short: ${JSON.stringify(state.objective)}`);
      expect(name,!/\b(undefined|null|nan)\b/i.test(state.chapter+' '+state.objective+' '+state.inventory),`HUD exposed invalid state text: ${state.chapter} / ${state.objective} / ${state.inventory}`);
      expect(name,!/failed|fatal|exception/i.test(state.status),`asset status indicates failure: ${state.status}`);
      await page.screenshot({path:`${out}/${view}.png`,fullPage:true});
      assertTelemetry(name,telemetry);
      report.chapters[view]={ok:true,expectedTitle,chapter:state.chapter,objective:state.objective,status:state.status};
    }catch(err){report.failed=true;report.chapters[view]={ok:false,error:err.stack||String(err),telemetry};throw err;}finally{await context.close();}
  }
}finally{
  await browser.close();
  await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
}

console.log(JSON.stringify(report,null,2));
if(report.failed)process.exitCode=1;
