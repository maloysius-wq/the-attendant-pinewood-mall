/** Source-authentic finale E and pedestrian exit regression. Checkpoint
 * fixture supplies only the preceding chapters' evidence, not ritual state.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const mode=process.argv[2];
assert.ok(['standard','true'].includes(mode));
const dir='artifacts/v153-finale-physical-'+mode;
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
const errors=[],remote=[],failed=[],steps=[];let page,state,report={mode,passed:false};
const log=(step,details)=>{steps.push({step,details});console.log('V153_PHYSICAL_FINALE '+JSON.stringify({step,details}));};
try{
 page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:4173/'))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.addInitScript(mode=>{
  if(localStorage.getItem('pinewood_attendant_reborn_v1'))return;
  const ids=Array.from({length:9},(_,i)=>'LS-0'+(i+1));
  const evidence=Object.fromEntries((mode==='true'?ids:ids.slice(6)).map(id=>[id,true]));
  localStorage.setItem('pinewood_attendant_reborn_v1',JSON.stringify({
   started:true,unlockedChapter:5,lastChapter:5,journal:{},
   story:{version:17,evidence,completedEvents:{ch5_eli_body:true}}
  }));
 },mode);
 await page.goto('http://127.0.0.1:4173/?openingDisabled=1&finaleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__&&window.__PINEWOOD_STORY_V17__?.version===17&&!document.getElementById('continueBtn')?.disabled,null,{timeout:230000,polling:500});
 await page.locator('#continueBtn').click();
 await page.waitForFunction(()=>!!window.__PINEWOOD_PHYSICAL_FINALE_V153_QA__&&document.querySelector('#chapterScreen.show')&&document.getElementById('chapterStartBtn')?.textContent==='Begin Shift',null,{timeout:540000,polling:500});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const q=fn=>page.evaluate(fn);
 const get=()=>q(()=>window.__PINEWOOD_PHYSICAL_FINALE_V153_QA__.state());
 state=await get();log('initial',state);
 assert.equal(state.chapter,6);assert.equal(state.level,'M1');assert.equal(state.running,true);
 assert.equal(state.staffAcknowledged,false);assert.equal(state.clockedOut,false);assert.equal(state.exitOpen,false);
 const observe=await q(()=>window.__PINEWOOD_PHYSICAL_FINALE_V153_QA__.observeMemory());log('first-memory',observe);assert.equal(observe.firstEchoSeen,true);
 const use=async(name)=>{
  const type='ch6_'+name+'_v25';
  const aim=await page.evaluate(type=>window.__PINEWOOD_PHYSICAL_FINALE_V153_QA__.aim(type),type);
  assert.ok(aim.distance>0&&aim.distance<=2.45);
  await page.keyboard.press('e');
  state=await get();log(name,{aim,state});
  return state;
 };
 assert.equal((await use('eli_station')).eliProcessed,false);
 assert.equal((await use('clockout_station')).clockedOut,false);
 assert.equal((await use('employee_exit')).exitOpen,false);
 assert.equal((await use('roster_station')).staffAcknowledged,true);
 assert.equal((await use('key_station')).keyCleared,true);
 assert.equal((await use('service_station')).serviceCleared,true);
 const eli=await use('eli_station');assert.equal(eli.eliProcessed,true);assert.equal(eli.accountabilityOne,true);
 assert.equal((await use('clockout_station')).clockedOut,true);
 assert.equal((await use('employee_exit')).exitOpen,true);
 const stair=await q(()=>window.__PINEWOOD_PHYSICAL_FINALE_V153_QA__.walkStair());log('original-stair',stair);
 assert.equal(stair.after.level,'G');assert.equal(stair.after.ground,true);
 const exit=await q(()=>window.__PINEWOOD_PHYSICAL_FINALE_V153_QA__.crossExterior());log('original-exterior',exit);
 state=exit.after;
 assert.equal(state.won,true);assert.equal(state.completed,true);
 assert.ok(exit.steps>100&&exit.meters>10);
 assert.equal(state.saved.story.ending,mode==='true'?'everyone_clocked_out':'pinewood_closed');
 assert.equal(state.title,mode==='true'?'EVERYONE CLOCKED OUT':'PINEWOOD IS CLOSED');
 assert.equal(state.saved.story.completedEvents[mode==='true'?'ch6_true_ending':'ch6_standard_ending'],true);
 assert.equal(!!state.saved.story.completedEvents.contractor15_pending,mode==='standard');
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
 assert.deepEqual(failed.filter(x=>!/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(x)),[]);
 await page.screenshot({path:dir+'/ending.png',timeout:120000});
 report.passed=true;console.log('V153_PHYSICAL_FINALE_PASS '+JSON.stringify({mode,ending:state.saved.story.ending,actualSteps:exit.steps,meters:exit.meters}));
}catch(error){
 report.error=String(error);console.error('V153_PHYSICAL_FINALE_FAILURE '+report.error);process.exitCode=1;
 if(page){state=await page.evaluate(()=>window.__PINEWOOD_PHYSICAL_FINALE_V153_QA__?.state?.()).catch(()=>state);await page.screenshot({path:dir+'/failure.png',timeout:120000}).catch(()=>{});}
}finally{
 await writeFile(dir+'/report.json',JSON.stringify({...report,state,steps,errors,remote,failed},null,2));
 await browser.close();
}
