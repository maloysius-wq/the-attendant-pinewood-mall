/** V151 original 1440x900: genuine E keyboard on V150 paper, saved People
 * journal, original source decoy and LS-03 priority, real death and restart.
 * Never creates fake objects, interacts with unpublished Builder or manual WASD.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173';
const dir='artifacts/v151-original-inspection';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(120000);
 const errors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{
  waitUntil:'domcontentloaded'
 });
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 try{
  await page.waitForFunction(()=>!!window.__PINEWOOD_CH1_STAFF_INSPECTION_V151_QA__&&
   !!window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__&&
   !!window.__PINEWOOD_CH1_PROGRESSION_V142_QA__&&
   !!window.__PINEWOOD_CH1_RESTART_V148_QA__,
   null,{timeout:310000,polling:450});
 }catch(error){
  const state=await page.evaluate(()=>({
   text:document.getElementById('loadText')?.textContent,
   fill:document.getElementById('loadFill')?.style.width,
   hasV151:!!window.__PINEWOOD_CH1_STAFF_INSPECTION_V151_QA__,
   sourceStory:window.__PINEWOOD_STORY_V17__?.version
  }));
  console.error('V151_ORIGINAL_STARTUP_DIAGNOSTICS '+JSON.stringify({state,error:String(error),errors,failed,remote}));
  await writeFile(dir+'/startup-error.json',JSON.stringify({state,error:String(error),errors,failed,remote},null,2));
  throw error;
 }
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const qa=()=>page.evaluate(()=>window.__PINEWOOD_CH1_STAFF_INSPECTION_V151_QA__.getState());
 const initial=await qa();
 assert.deepEqual(initial.recognition,{jo:null,tessa:null,luis:null});
 assert.equal(initial.addedOriginalInteractables,0);
 assert.equal(initial.addedOriginalColliders,0);
 const physical=await page.evaluate(()=>window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__.getState());
 assert.equal(physical.physicalBelongings.length,3);
 const discovered=[];
 for(const item of physical.physicalBelongings){
  const aimed=await page.evaluate(id=>window.__PINEWOOD_CH1_STAFF_INSPECTION_V151_QA__
   .aimActualPaperForTest(id),item.id);
  assert.equal(aimed.aim.focusedId,item.id,'real source camera must select original 3D paper');
  assert.equal(aimed.aim.originalSourceTarget,null,
   'source physical E targets ALWAYS have priority');
  assert.ok(aimed.aim.focusedDistance>0&&aimed.aim.focusedDistance<=2.45);
  assert.match(aimed.hint,/E  Examine/);
  await page.keyboard.press('e'); // original Game keydown -> real Game.interact
  const after=await qa();
  const personId={ 'jo-close-clipboard':'jo','tessa-staff-chart':'tessa',
   'luis-copy-sleeve':'luis'}[item.id];
  assert.equal(after.recognition[personId],'traces',
   'original keyboard E must record non-spoiler V17 PEOPLE trace');
  assert.ok(after.cardVisible);
  assert.match(after.cardText,/PEOPLE/);
  assert.equal(after.focusedId,item.id);
  const journal=await page.evaluate(()=>document.getElementById('journalList')?.textContent||'');
  assert.ok(journal.includes(item.person));
  assert.ok(journal.includes('PEOPLE'));
  assert.doesNotMatch(journal,/Luis died|Jo got employees out|Tessa proves/i,
   'early People journal must not spoil future 1997 revelations');
  discovered.push({site:item.id,person:item.person,personId,
   genuineKeyboardE:true,focusMesh:after.focusedMesh,
   range:after.focusedDistance});
  await page.screenshot({path:dir+'/'+item.id+'-real-e-inspection.png',
   animations:'disabled',timeout:120000});
 }
 const beforeSource=await qa();
 assert.deepEqual(beforeSource.recognition,{jo:'traces',tessa:'traces',luis:'traces'});
 const saveBefore=await page.evaluate(()=>{
  const v=JSON.parse(localStorage.getItem('pinewood_attendant_reborn_v1')||'{}');
  return {people:v.story?.people,evidence:v.story?.evidence,journal:v.journal};
 });
 for(const id of ['jo','tessa','luis'])assert.equal(saveBefore.people?.[id],'traces');
 assert.deepEqual(saveBefore.evidence||{},{}); // inspecting doesn't auto-collect LS
 assert.deepEqual(saveBefore.journal||{},{});
 // Original V139 Noise Maker still uses E and changes real inventory,
 // whereas these paper inspection calls never touch either original source item.
 const aimedDecoy=await page.evaluate(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__
  .view('decoy','Noise Maker'));
 assert.equal(aimedDecoy.targetReal,true);
 const priorSource=await page.evaluate(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.getState());
 await page.keyboard.press('e');
 const sourceAfter=await page.evaluate(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.getState());
 assert.equal(sourceAfter.decoys,priorSource.decoys+1,'real original E decoy collected normally');
 assert.equal(sourceAfter.key?.collected,priorSource.key?.collected);
 assert.deepEqual((await qa()).recognition,beforeSource.recognition,
  'real original decoy E must not create a fake People entry');
 // The real last-shift LS-03 should promote Luis beyond preliminary traces.
 const notes=sourceAfter.notes;
 assert.ok(notes.find(x=>x.id==='LS-03'&&x.found),'original Luis LS-03 anchor is physical');
 const realLS03=sourceAfter.evidenceSourceInventory.find(x=>
  x.label==='LS-03'&&['journal','note','tape'].includes(x.type)&&x.parent);
 assert.ok(realLS03,'true original LS-03 source mesh and evidence type required');
 const target=await page.evaluate(type=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__
  .view(type,'LS-03'),realLS03.type);
 assert.equal(target.targetReal,true);
 assert.equal(target.type,realLS03.type,'use original LS evidence mesh type, not a guessed note');
 await page.keyboard.press('e');
 const evidence=await page.evaluate(()=>window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.getState());
 assert.ok(evidence.notes.find(x=>x.id==='LS-03'&&x.collected),
  'original LS-03 physical E pickup unchanged');
 assert.equal((await qa()).recognition.luis,'known',
  'the source last-shift route sketch must upgrade earlier Luis trace');
 const afterLS=await page.evaluate(()=>{
  const v=JSON.parse(localStorage.getItem('pinewood_attendant_reborn_v1')||'{}');
  return {people:v.story?.people,evidence:v.story?.evidence};
 });
 assert.equal(afterLS.evidence['LS-03'],true);
 assert.equal(afterLS.people.luis,'known');
 assert.equal(afterLS.people.jo,'traces');
 assert.equal(afterLS.people.tessa,'traces');
 // Genuine reset should dispose transient inspector, preserve saved People,
 // restore original story world E decoy and keep the source V148 boot fix.
 const revealed=await page.evaluate(()=>{
  const stealth=window.__PINEWOOD_CH1_STEALTH_V139_QA__;
  stealth.viewNorthGalleryForTest();
  window.__PINEWOOD_CH1_V137_QA__.operateNextActualCircuitForTest();
  return stealth.revealFromActualSceneForTest();
 });
 assert.equal(revealed.revealed,true);
 const death=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__
  .triggerGenuineAttendantContact());
 assert.equal(death.los,true);assert.equal(death.state.dead,true);
 await page.waitForFunction(()=>document.getElementById('deathScreen')?.classList.contains('show'),
  null,{timeout:90000,polling:350});
 await page.evaluate(()=>document.getElementById('deathRestartBtn').click());
 await page.waitForFunction(()=>{
  const a=window.__PINEWOOD_CH1_STAFF_INSPECTION_V151_QA__?.getState?.();
  const p=window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__?.getState?.();
  const v=window.__PINEWOOD_CH1_RECOVERY_V140_QA__?.getState?.();
  const w=window.__PINEWOOD_CH1_RESTART_V148_QA__?.getState?.()?.stage;
  return a?.chapter===1&&a?.inspections===0&&!a?.cardVisible&&
   a?.recognition.jo==='traces'&&a?.recognition.tessa==='traces'&&
   a?.recognition.luis==='known'&&p?.physicalBelongings.length===3&&
   p.physicalBelongings.every(q=>q.attached&&q.physicallySupported)&&
   !v?.dead&&!v?.running&&v?.realPickups.length===2&&
   v.realPickups.every(q=>!q.collected)&&w?.attempt===1&&
   w?.active===false&&w?.chapterScreen===true;
 },null,{timeout:540000,polling:500});
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const resumed=await page.evaluate(()=>window.__PINEWOOD_CH1_RECOVERY_V140_QA__.getState());
 assert.equal(resumed.running,true);assert.equal(resumed.dead,false);
 const afterRestart=await qa();
 assert.deepEqual(afterRestart.recognition,{jo:'traces',tessa:'traces',luis:'known'});
 assert.equal(afterRestart.cardVisible,false);
 assert.equal(afterRestart.inspections,0);
 const unexpected=failed.filter(x=>!x.includes('furniture_shop_loop.ogg net::ERR_ABORTED'));
 const report={initial,discovered,savedRealV17:saveBefore,originalDecoy:sourceAfter.decoys,
  physicalLastShiftEvidence:target.id,afterLS,afterRestart,
  originalSourceRestart:true,errors,remote,unexpected};
 await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(unexpected,[]);
 console.log('V151_REAL_ORIGINAL_STAFF_INSPECTION_PASS '+JSON.stringify({
  realKeyboardE:discovered.map(x=>x.site),
  originalDecoyCollected:sourceAfter.decoys,
  realLS03EvidencePromotedLuis:afterLS.people.luis,
  savedPeopleAfterRestart:afterRestart.recognition,
  realOriginalDeathRestart:true,errors,remote,unexpected
 }));
}finally{await browser.close();}
