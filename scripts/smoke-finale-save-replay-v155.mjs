import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const mode=process.argv[2];
assert.ok(['standard','true','interrupted'].includes(mode));
const dir='artifacts/v155-replay-'+mode;await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
const errors=[],remote=[],failed=[];let page,state,report={mode,passed:false};
try{
 page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:4173/'))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.addInitScript(mode=>{
  if(localStorage.getItem('pinewood_attendant_reborn_v1'))return;
  const ids=Array.from({length:9},(_,i)=>'LS-0'+(i+1));
  const evidence=Object.fromEntries((mode==='true'?ids:ids.slice(6)).map(id=>[id,true]));
  const active=['ch6_first_memory','ch6_staff_acknowledged','ch6_key_cleared','ch6_service_cleared','ch6_service_pair_cleared','ch6_eli_processed','ch6_accountability_one','ch6_clocked_out','ch6_exit_open'];
  const completedEvents={ch5_eli_body:true,ch5_sessions:true,...Object.fromEntries(active.map(k=>[k,true]))};
  if(mode!=='interrupted')Object.assign(completedEvents,{ch6_complete:true,ch6_standard_ending:true,contractor15_pending:true,...(mode==='true'?{ch6_true_ending:true,ch6_accountability_zero:true}:{})});
  localStorage.setItem('pinewood_attendant_reborn_v1',JSON.stringify({started:true,unlockedChapter:5,lastChapter:5,journal:{},
   story:{version:17,evidence,completedEvents,people:{eli:'cleared'},ending:mode==='true'?'everyone_clocked_out':mode==='standard'?'pinewood_closed':null,chapterCheckpoint:mode==='interrupted'?'last_shift':'complete'}}));
 },mode);
 await page.goto('http://127.0.0.1:4173/?openingDisabled=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__&&window.__PINEWOOD_STORY_V17__?.version===17&&!document.getElementById('continueBtn')?.disabled,null,{timeout:230000,polling:500});
 await page.locator('#continueBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_V112_QA__?.getState?.().chapter===6&&document.querySelector('#chapterScreen.show')&&window.__PINEWOOD_CH6_V25__?.sceneBuilt,null,{timeout:540000,polling:500});
 const get=()=>page.evaluate(()=>({
  chapter:window.__PINEWOOD_V112_QA__.getState().chapter,
  finale:{...window.__PINEWOOD_CH6_V25__},save:JSON.parse(localStorage.getItem('pinewood_attendant_reborn_v1')||'{}'),
  title:document.getElementById('chapterTitle')?.textContent,screen:document.querySelector('.screen.show')?.id||null
 }));
 state=await get();report.beforeBegin=state;
 console.log('V155_REPLAY_STATE '+JSON.stringify(state));
 assert.equal(state.chapter,6);assert.equal(state.save.story.completedEvents.ch5_eli_body,true);
 for(const id of ['LS-07','LS-08','LS-09'])assert.equal(state.save.story.evidence[id],true);
 const resumed=mode==='interrupted';
 for(const k of ['staffAcknowledged','keyCleared','serviceCleared','eliProcessed','accountabilityOne','clockedOut','exitOpen','finalRecallActive'])assert.equal(state.finale[k],resumed,'actual chapter flag '+k);
 assert.equal(!!state.save.story.completedEvents.ch6_complete,false);
 assert.equal(state.save.story.chapterCheckpoint,'last_shift');
 if(!resumed){assert.equal(state.save.story.completedEvents.ch6_standard_ending,true);assert.equal(state.save.story.ending,mode==='true'?'everyone_clocked_out':'pinewood_closed');assert.equal(!!state.save.story.completedEvents.contractor15_pending,mode==='standard');}
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 await page.waitForFunction(()=>!document.querySelector('.screen.show'),null,{timeout:90000,polling:500});
 state=await get();report.afterBegin=state;
 assert.equal(state.screen,null);assert.equal(state.finale.clockedOut,resumed);
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failed.filter(x=>!/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(x)),[]);
 await page.screenshot({path:dir+'/actual-continue.png',timeout:120000});
 report.passed=true;console.log('V155_REPLAY_PASS '+JSON.stringify({mode,chapter:state.chapter,clockedOut:state.finale.clockedOut,exitOpen:state.finale.exitOpen,evidence:state.save.story.evidence}));
}catch(error){report.error=String(error);console.error('V155_REPLAY_FAILURE '+report.error);process.exitCode=1;if(page)await page.screenshot({path:dir+'/failure.png',timeout:120000}).catch(()=>{});}
finally{await writeFile(dir+'/report.json',JSON.stringify({...report,state,errors,remote,failed},null,2));await browser.close();}
