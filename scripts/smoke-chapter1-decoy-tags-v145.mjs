/** Real original desktop game: fire-door walking, both E pickups, Q throw and physical paper. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',dir='artifacts/v145-original-decoy-tags';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const pageErrors=[],remote=[],failed=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('request',request=>{
  if(/^https?:/.test(request.url())&&!request.url().startsWith(origin))remote.push(request.url());
 });
 page.on('requestfailed',request=>failed.push(request.url()+' '+request.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_CH1_DECOY_TAGS_V145_QA__?.getState?.().physicalPaper?.length===2,
  null,{timeout:540000,polling:500});
 const noteState=()=>page.evaluate(()=>window.__PINEWOOD_CH1_DECOY_TAGS_V145_QA__.getState());
 const before=await noteState();
 assert.equal(before.chapter,1);
 assert.equal(before.extraPickups,0);assert.equal(before.extraColliders,0);
 assert.deepEqual(before.physicalPaper.map(x=>x.label),['Noise Maker','Pager Decoy']);
 assert.ok(before.physicalPaper.every(x=>x.attached&&x.paperVisible&&x.realPickupAttached&&x.flatOnFloor));
 assert.equal(before.originalDecoysInInventory,0);
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const approach=await page.evaluate(()=>{
  const qa=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__;
  const point=qa.doorApproach();
  return qa.walkTo(point.x,point.z,'real-contractor-to-original-fire-door');
 });
 assert.ok(approach.actualSteps>20);
 await page.keyboard.press('KeyE');
 await page.waitForFunction(()=>{
  const s=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__?.getState?.();
  return s?.door?.openFraction>.97&&s?.doorBlocked===false;
 },null,{timeout:90000,polling:300});
 const crossed=await page.evaluate(()=>{
  const qa=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__;
  const point=qa.doorBeyond();
  return qa.walkTo(point.x,point.z,'real-original-hinged-fire-door-threshold');
 });
 assert.ok(crossed.actualSteps>20);
 const records=[];
 for(const label of ['Noise Maker','Pager Decoy']){
  const result=await page.evaluate(label=>{
   const paper=window.__PINEWOOD_CH1_DECOY_TAGS_V145_QA__.getState().physicalPaper
    .find(x=>x.label===label);
   const move=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__
    .walkTo(paper.noteX,paper.noteZ,'original-gallery-to-'+label);
   const aim=window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.view('decoy',label);
   return {paper,move,aim};
  },label);
  assert.ok(result.move.actualSteps>3,'actual source collision walk to '+label);
  assert.equal(result.aim.targetReal,true,'real E first-person raycast to '+label);
  assert.ok(result.aim.fromEntry>1);
  await page.screenshot({path:dir+'/'+label.toLowerCase().replace(' ','-')+'-physical-paper.png',
   animations:'disabled',timeout:120000});
  const collected=await page.evaluate(label=>
   window.__PINEWOOD_CH1_PROGRESSION_V142_QA__.collect('decoy',label),label);
  assert.equal(collected.sourceCollected,true);
  const state=await noteState(),paper=state.physicalPaper.find(x=>x.label===label);
  assert.equal(paper.originalCollected,true);
  assert.equal(paper.paperVisible,false,'physical label removed when real pickup collected');
  records.push({label,realRaycast:result.aim.targetReal,
   originalWalkingSteps:result.move.actualSteps,originalWalkingMetres:result.move.actualMeters,
   collected:collected.sourceCollected,paperHidden:!paper.paperVisible,
   inventory:state.originalDecoysInInventory});
 }
 const two=await noteState();
 assert.equal(two.originalDecoysInInventory,2,'both original decoys genuinely collected');
 await page.keyboard.press('KeyQ');
 await page.waitForTimeout(220);
 const afterThrow=await noteState();
 assert.equal(afterThrow.originalDecoysInInventory,1,'real keyboard Q spends exactly one original decoy');
 assert.ok(afterThrow.physicalPaper.every(p=>p.originalCollected&&!p.paperVisible));
 const failures=failed.filter(s=>!/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(s));
 const report={before,approach,crossed,records,afterThrow,pageErrors,remote,failures};
 await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
 assert.deepEqual(pageErrors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failures,[]);
 console.log('V145_GENUINE_DECOY_GAMEPLAY_PASS '+JSON.stringify({
  originalV113Door:true,collisionWalkToTwoRealItems:true,
  originalECollections:2,realKeyboardQThrow:true,physicalNotesHiddenAfterCollection:true,
  records,pageErrors,remote,failures
 }));
}finally{await browser.close();}
