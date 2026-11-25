/** Original Chapter 5 evidence via native E, not direct handlers. A disposable
 * Chapter 5 checkpoint isolates Records; no later evidence or ritual flags. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/v154-mezzanine-evidence';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
let page,state;const report={passed:false,steps:[]},errors=[],remote=[],failed=[];
try{
 page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:4173/'))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.addInitScript(()=>{if(!localStorage.getItem('pinewood_attendant_reborn_v1'))localStorage.setItem('pinewood_attendant_reborn_v1',JSON.stringify({started:true,unlockedChapter:4,lastChapter:4,journal:{}}));});
 await page.goto('http://127.0.0.1:4173/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__&&window.__PINEWOOD_STORY_V17__?.version===17&&!document.getElementById('continueBtn')?.disabled,null,{timeout:230000,polling:500});
 await page.locator('#continueBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_V112_QA__?.getState?.().chapter===5&&document.querySelector('#chapterScreen.show'),null,{timeout:540000,polling:500});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const get=()=>page.evaluate(()=>window.__PINEWOOD_HANDOFF_V152_QA__.mezzanineState());
 state=await get();report.initial=state;console.log('V154_M1_INITIAL '+JSON.stringify(state));
 assert.equal(state.chapter,5);assert.equal(state.level,'M1');assert.equal(state.running,true);
 assert.equal(state.rosterReconciled,false);assert.equal(state.overrideFound,false);
 for(const id of ['JO-ROSTER-PAGES','PAYROLL-1997','TIMECLOCK-1997','LS-08','LS-09']){
  const pickup=state.pickups.find(o=>o.id===id);
  assert.ok(pickup,'missing actual M1 pickup '+id);
  assert.ok(pickup.floor===5.4&&pickup.base>=5.4&&pickup.base<7.4,'wrong M1 bobbing base '+JSON.stringify(pickup));
  assert.ok(Math.abs(pickup.y-pickup.base)<.4);
 }
 const use=async(type,id=null)=>{
  const aim=await page.evaluate(({type,id})=>window.__PINEWOOD_HANDOFF_V152_QA__.aimM1(type,id),{type,id});
  assert.ok(aim.distance>0&&aim.distance<=2.45,'actual E raycast for '+(id||type));
  await page.keyboard.press('e');
  state=await get();
  const entry={type,id,aim,state};report.steps.push(entry);
  console.log('V154_NATIVE_M1_E '+JSON.stringify(entry).slice(0,5000));
  return state;
 };
 assert.equal((await use('ch5_roster_terminal_v24')).rosterReconciled,false);
 assert.equal((await use('ch5_eli_access_v24')).eliGateOpen,false);
 assert.equal((await use('journal','JO-ROSTER-PAGES')).joPages,true);
 assert.equal((await use('journal','PAYROLL-1997')).payroll,true);
 assert.equal((await use('journal','TIMECLOCK-1997')).timeclock,true);
 assert.equal((await use('ch5_roster_terminal_v24')).evidence['LS-07'],true);
 assert.equal((await use('journal','LS-09')).overrideFound,true);
 assert.equal((await use('ch5_eli_access_v24')).eliGateOpen,true);
 assert.equal((await use('ch5_eli_remains_v24')).eliBodySeen,true);
 assert.equal((await use('journal','LS-08')).eliRecorder,true);
 assert.equal((await use('ch5_sessions_terminal_v24')).sessionsRevealed,true);
 for(const id of ['LS-07','LS-08','LS-09'])assert.equal(state.evidence[id],true);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('pinewood_attendant_reborn_v1')||'{}'));
 for(const id of ['LS-07','LS-08','LS-09']){assert.equal(saved.story.evidence[id],true);assert.ok(saved.journal[id]);}
 assert.equal(saved.story.completedEvents.ch5_eli_body,true);
 assert.equal(saved.story.completedEvents.ch5_sessions,true);
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failed.filter(x=>!/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(x)),[]);
 report.saved=saved;report.passed=true;
 await page.screenshot({path:dir+'/original-mezzanine-complete.png',timeout:120000});
 console.log('V154_NATIVE_M1_PASS '+JSON.stringify({evidence:state.evidence,sessionsRevealed:state.sessionsRevealed,scope:'real native E and original A* approach; deterministic camera placement, not continuous walking'}));
}catch(error){report.error=String(error);console.error('V154_M1_FAILURE '+report.error);process.exitCode=1;if(page)await page.screenshot({path:dir+'/failure.png',timeout:120000}).catch(()=>{});}
finally{await writeFile(dir+'/report.json',JSON.stringify({...report,state,errors,remote,failed},null,2));await browser.close();}
