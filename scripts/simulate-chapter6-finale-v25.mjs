import { chromium } from 'playwright';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const fail=msg=>{throw new Error('Chapter 6 finale simulation failed: '+msg);};
const expect=(cond,msg)=>{if(!cond)fail(msg);};

async function runPath(browser,mode){
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[],remote=[];const origin=new URL(base).origin;
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{try{const u=new URL(r.url());if((u.protocol==='http:'||u.protocol==='https:')&&u.origin!==origin)remote.push(r.url());}catch{}});
  const url=new URL(base);url.searchParams.set('visualTest','last-shift-control');
  try{
    await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true&&!!window.__PINEWOOD_CH6_TEST_V25__,null,{timeout:120000});
    const initial=await page.evaluate(mode=>window.__PINEWOOD_CH6_TEST_V25__.prepare(mode),mode);
    expect(initial.allEvidence===(mode==='true'),`${mode}: evidence preparation mismatch`);
    expect(initial.accountabilityOne===false&&initial.clockedOut===false,`${mode}: finale started too far ahead`);

    const earlyEli=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.interact('eli'));
    expect(earlyEli.eliProcessed===false&&earlyEli.accountabilityOne===false,`${mode}: Eli processed before roster/key/service prerequisites`);
    const earlyClock=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.interact('clockout'));
    expect(earlyClock.clockedOut===false,`${mode}: Contractor 14 clocked out before ACCOUNTABILITY: 1`);

    let state=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.interact('roster'));
    expect(state.staffAcknowledged===true,`${mode}: roster acknowledgement did not persist`);
    state=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.interact('key'));
    expect(state.keyCleared===true,`${mode}: key reconciliation failed`);
    state=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.interact('service'));
    expect(state.serviceCleared===true,`${mode}: service reconciliation failed`);
    state=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.interact('eli'));
    expect(state.eliProcessed===true&&state.accountabilityOne===true&&state.contractor14Active===true,`${mode}: Eli processing did not reveal active Contractor 14`);

    state=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.interact('clockout'));
    expect(state.clockedOut===true&&state.finalRecallActive===true,`${mode}: Contractor 14 clock-out did not start final recall`);
    const recall1=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.recall());
    expect(recall1.route?.label==='PA CONTROL',`${mode}: first PCAS recall target was not PA CONTROL`);
    const recall2=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.recall());
    expect(recall2.route?.label==='KEY CONTROL',`${mode}: second PCAS recall target was not KEY CONTROL`);
    expect(recall2.state.recallCount===2,`${mode}: recall count did not advance deterministically`);

    state=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.openExit());
    expect(state.exitOpen===true,`${mode}: employee exit did not release after clock-out`);
    state=await page.evaluate(()=>window.__PINEWOOD_CH6_TEST_V25__.crossExit());
    expect(state.completed===true&&state.contractor14Active===false,`${mode}: crossing employee exit did not complete Contractor 14`);

    const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('pinewood_attendant_reborn_v1')||'{}'));
    const title=await page.locator('#chapterTitle').textContent();
    if(mode==='standard'){
      expect(state.ending==='pinewood_closed',`standard: wrong ending ${state.ending}`);
      expect(state.allEvidence===false,'standard: unexpectedly had complete LS-01 through LS-09 evidence');
      expect(save.story?.completedEvents?.ch6_standard_ending===true,'standard: completion event missing');
      expect(save.story?.completedEvents?.contractor15_pending===true,'standard: Contractor 15 continuation flag missing');
      expect(save.story?.completedEvents?.ch6_accountability_zero!==true,'standard: historical ACCOUNTABILITY: 0 should remain unresolved');
      expect(title==='PINEWOOD IS CLOSED',`standard: ending screen title mismatch: ${title}`);
    }else{
      expect(state.ending==='everyone_clocked_out',`true: wrong ending ${state.ending}`);
      expect(state.allEvidence===true,'true: LS-01 through LS-09 evidence set is incomplete');
      expect(save.story?.completedEvents?.ch6_true_ending===true,'true: completion event missing');
      expect(save.story?.completedEvents?.ch6_accountability_zero===true,'true: ACCOUNTABILITY: 0 event missing');
      expect(save.story?.completedEvents?.contractor15_pending!==true,'true: Contractor 15 must not be queued');
      expect(title==='EVERYONE CLOCKED OUT',`true: ending screen title mismatch: ${title}`);
    }
    expect(errors.length===0,`${mode}: browser errors: ${errors.join(' | ')}`);
    expect(remote.length===0,`${mode}: remote requests escaped local runtime: ${[...new Set(remote)].join(', ')}`);
    return {mode,ending:state.ending,recalls:[recall1.route?.label,recall2.route?.label],title,completed:true};
  }finally{await page.close();}
}

const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
  const standard=await runPath(browser,'standard');
  const truth=await runPath(browser,'true');
  console.log(JSON.stringify({pass:true,standard,trueEnding:truth},null,2));
}finally{await browser.close();}
