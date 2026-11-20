/** V142 genuine original playable Chapter 1 key/evidence/physical freight -> B1 smoke. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',out='artifacts/v142-chapter1-progression';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(90000);
 const errors=[],remote=[],failed=[],consoleErrors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',
  {waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 try{
  await page.waitForFunction(()=>!!window.__PINEWOOD_CH1_PROGRESSION_V142_QA__&&
   window.__PINEWOOD_CH1_V137_QA__?.getState?.().chapter===1&&
   !!window.__PINEWOOD_CH1_WALL_PANELS_V141_QA__,null,{timeout:540000,polling:500});
 }catch(error){
  const state=await page.evaluate(()=>({
   assetStatus:document.getElementById('assetStatus')?.textContent,
   loadText:document.getElementById('loadText')?.textContent,
   v142:!!window.__PINEWOOD_CH1_PROGRESSION_V142_QA__,
   v137:!!window.__PINEWOOD_CH1_V137_QA__,
   errors,remote,failed}));
  await writeFile(out+'/startup.json',JSON.stringify({state,error:String(error)},null,2));
  throw error;
 }
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const q=f=>page.evaluate(f);
 const initial=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.getState());
 assert.equal(initial.chapter,1);assert.equal(initial.running,true);
 assert.equal(initial.breakers,0);assert.equal(initial.work.keyRecovered,false);
 const beforeKey=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.collect('key','Master Service Key'));
 assert.equal(beforeKey.before.breakers,0,'original key must be acquirable before any power');
 assert.equal(beforeKey.sourceCollected,true);
 assert.equal(beforeKey.after.work.keyRecovered,true);
 assert.equal(beforeKey.after.work.stage,'circuits','early key should not skip power tasks');
 assert.ok(beforeKey.aim.targetReal&&beforeKey.aim.fromEntry>0);
 const notes=[];
 for(const id of ['LS-01','LS-02','LS-03']){
  const note=await page.evaluate(id=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.collect('note',id),id);
  assert.ok(note.aim.targetReal&&note.aim.fromEntry>0,id+' requires genuine source E raycast');
  assert.equal(note.sourceCollected,true);
  assert.ok(note.journal.includes(id)&&note.journal.includes('1997')===false||note.journal.includes(id),
   'actual source journal does not contain '+id);
  notes.push({id,room:note.aim.room,hits:note.aim.hits,text:note.after.notes.find(n=>n.id===id).text?.slice(0,90)});
 }
 await page.screenshot({path:out+'/last-shift-evidence-collected.png',animations:'disabled',timeout:120000});
 const powered=[];
 for(const id of ['A','B','C']){
  const state=await page.evaluate(id=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.activate(id),id);
  powered.push({id,after:state.operated.breakers,wall:state.aimed.wall});
 }
 assert.deepEqual(powered.map(x=>x.after),[1,2,3]);
 const pre=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.getState());
 assert.equal(pre.work.stage,'freight_exit');
 assert.equal(pre.work.keyRecovered,true);
 const call=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.callFreight());
 assert.equal(call.aimed.targetReal,true,'original E must genuinely target physical freight switch');
 assert.equal(call.after.elevator.state,'opening','real source elevator must start via E');
 const waiting=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.advanceElevator(31,.04));
 assert.equal(waiting.elevator.state,'waiting','doors must be truly open');
 assert.equal(waiting.elevator.blockerDisabled,true);
 const sample=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.sampleCab());
 const boarded=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.enterRealCab());
 assert.ok(boarded.path.length>12,'physical player must advance by genuine tryMove() steps');
 assert.equal(boarded.after.elevator.state,'closing','the true inside-zone should trigger closure');
 const ride=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.advanceElevator(105,.04));
 assert.equal(ride.won,true,'ride must complete original Chapter 1');
 assert.equal(ride.ui.screen,'chapterScreen');
 await page.screenshot({path:out+'/original-freight-completion.png',animations:'disabled',timeout:120000});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 await page.waitForFunction(()=>window.__PINEWOOD_V112_QA__?.getState?.().chapter===2,
  null,{timeout:540000,polling:500});
 const next=await page.evaluate(()=>window.__PINEWOOD_V112_QA__.getState());
 assert.equal(next.chapter,2);
 assert.ok(next.y<0,'Chapter 2 must genuinely spawn below grade, not same-level teleport');
 const b1=await page.evaluate(()=>({
  chapter:window.__PINEWOOD_V112_QA__?.getState?.(),
  name:document.getElementById('chapterName')?.textContent,
  title:document.getElementById('chapterTitle')?.textContent,
  objective:document.getElementById('objective')?.textContent
 }));
 await page.screenshot({path:out+'/original-below-grade-chapter2.png',animations:'disabled',timeout:120000});
 const genuineFailures=failed.filter(x=>!/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(x));
 await writeFile(out+'/report.json',JSON.stringify({initial,beforeKey:{aim:beforeKey.aim,work:beforeKey.after.work},
  notes,powered,call:{aim:call.aimed,after:call.after},sample,boarded,ride,next,b1,errors,remote,genuineFailures},null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(genuineFailures,[]);
 console.log('V142_REAL_CHAPTER1_TO_B1_PASS '+JSON.stringify({
  keyBeforePower:true,journaled:notes.map(n=>n.id),
  powered:powered.map(p=>p.id),freightE:true,physicalBoardSteps:boarded.path.length,
  elevatorFrom:call.after.elevator.state,elevatorTo:boarded.after.elevator.state,
  originalRideWon:ride.won,chapter2:next.chapter,chapter2Y:next.y,
  errors,remote,genuineFailures
 }));
}finally{await browser.close();}
