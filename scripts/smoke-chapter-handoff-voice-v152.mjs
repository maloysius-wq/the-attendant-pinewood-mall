/** V152: original 1440x900 first-person E freight to authentic B1 Renee radio.
 * Reuses the established real V142 source-facing QA to avoid synthetic worlds.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',dir='artifacts/v152-real-chapter-handoff';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(90000);
 const errors=[],failed=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__?.getState?.().chapter===1&&
  !!window.__PINEWOOD_HANDOFF_V152__,null,{timeout:540000,polling:500});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const q=fn=>page.evaluate(fn);
 const initial=await q(()=>({
  state:window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.getState(),
  handoff:{...window.__PINEWOOD_HANDOFF_V152__}
 }));
 assert.equal(initial.state.chapter,1);
 assert.equal(initial.state.running,true);
 assert.ok(initial.handoff.chapterResets>=1);
 assert.equal(initial.handoff.epoch,initial.handoff.chapterResets);

 const key=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.collect('key','Master Service Key'));
 assert.equal(key.sourceCollected,true);
 const panels=[];
 for(const id of ['A','B','C']){
  const result=await page.evaluate(id=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.activate(id),id);
  panels.push({id,breakers:result.operated.breakers,wall:result.aimed.wall});
 }
 assert.deepEqual(panels.map(x=>x.breakers),[1,2,3]);
 const call=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.callFreight());
 assert.equal(call.aimed.targetReal,true);
 assert.equal(call.after.elevator.state,'opening');
 const opened=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.advanceElevator(31,.04));
 assert.equal(opened.elevator.state,'waiting');
 const entered=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.enterRealCab());
 assert.ok(entered.path.length>12);
 assert.equal(entered.after.elevator.state,'closing');
 const completed=await q(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.advanceElevator(105,.04));
 assert.equal(completed.won,true);
 assert.equal(completed.ui.screen,'chapterScreen');
 const before=await q(()=>({...window.__PINEWOOD_HANDOFF_V152__}));
 await page.screenshot({path:dir+'/original-freight-end.png',animations:'disabled',timeout:120000});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 await page.waitForFunction(()=>window.__PINEWOOD_V112_QA__?.getState?.().chapter===2&&
  window.__PINEWOOD_HANDOFF_V152__?.chapterResets>=2,
  null,{timeout:540000,polling:500});
 const b1=await q(()=>({
  scene:window.__PINEWOOD_V112_QA__.getState(),
  handoff:{...window.__PINEWOOD_HANDOFF_V152__},
  title:document.getElementById('chapterTitle')?.textContent,
  screen:document.querySelector('.screen.show')?.id||null
 }));
 assert.equal(b1.scene.chapter,2);
 assert.ok(b1.scene.y<0,'authored Chapter 2 must be below ground');
 assert.equal(b1.handoff.chapterResets,initial.handoff.chapterResets+1);
 assert.equal(b1.handoff.epoch,b1.handoff.chapterResets);
 assert.ok(b1.handoff.epoch>before.epoch);
 await page.waitForFunction(()=>document.getElementById('chapterScreen')?.classList.contains('show'),
  null,{timeout:30000});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 await page.waitForFunction(()=>window.__PINEWOOD_AUDIO_V27__?.lastCharacter?.id==='ch2_start',
  null,{timeout:90000,polling:350});
 const voice=await q(()=>({
  line:window.__PINEWOOD_AUDIO_V27__.lastCharacter,
  handoff:{...window.__PINEWOOD_HANDOFF_V152__},
  chapter:window.__PINEWOOD_V112_QA__.getState(),
  subtitle:document.getElementById('subtitle')?.textContent||''
 }));
 assert.equal(voice.line.id,'ch2_start');
 assert.equal(voice.chapter.chapter,2);
 assert.equal(voice.handoff.epoch,b1.handoff.epoch,'speech must not trigger another reset');
 await page.screenshot({path:dir+'/original-below-grade-radio.png',animations:'disabled',timeout:120000});
 const genuineFailed=failed.filter(x=>!/furniture_shop_loop\\.ogg net::ERR_ABORTED$/.test(x));
 const result={initial:{chapter:initial.state.chapter,handoff:initial.handoff},
  panels,call:{state:call.after.elevator.state},entered:entered.path.length,
  completed:{won:completed.won,screen:completed.ui.screen},
  before,b1,voice,errors,remote,failed:genuineFailed};
 await writeFile(dir+'/report.json',JSON.stringify(result,null,2));
 assert.deepEqual(errors,[]);
 assert.deepEqual(remote,[]);
 assert.deepEqual(genuineFailed,[]);
 console.log('V152_ORIGINAL_CH1_TO_CH2_VOICE_PASS '+JSON.stringify({
  genuineFreightE:true,genuineB1:voice.chapter.chapter,
  b1Y:voice.chapter.y,oldChapterVoiceInvalidated:b1.handoff.epoch>before.epoch,
  openingReneeVoice:voice.line.id,errors,remote,failed:genuineFailed
 }));
}finally{await browser.close();}
