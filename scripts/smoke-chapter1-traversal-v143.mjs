/** Source-original first-person fire door and physical pedestrian route, not teleport validation. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin='http://127.0.0.1:4173',dir='artifacts/v143-chapter1-traversal';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.setDefaultTimeout(100000);
 const errors=[],remote=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/?openingDisabled=1&chapter1QA=1&vestibuleQA=1',
  {waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__?.getState?.().chapter===1,
  null,{timeout:540000,polling:500});
 const before=await page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.getState());
 assert.deepEqual(before.player,{x:12.5,z:-32.75},
  'must start at source-authentic cinematic eye, never jump to breaker');
 assert.equal(before.door?.closed,true);
 assert.equal(before.doorBlocked,true);
 assert.equal(before.power,0);
 await page.evaluate(()=>document.getElementById('chapterStartBtn').click());
 const q=()=>page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.getState());
 const front=await page.evaluate(()=>{
  const qa=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__,p=qa.doorApproach();
  return qa.walkTo(p.x,p.z,'vestibule-to-original-hinged-door');
 });
 assert.ok(front.actualSteps>20,'original full-size vestibule requires real movement steps');
 let state=await q();
 assert.ok(state.player.z>-43,'must be on near side BEFORE opening the real door');
 assert.equal(state.doorBlocked,true);
 assert.equal(state.door.closed,true);
 // Genuine original browser E keydown. No calling .toggle() or
 // changing physical blocker state from the test.
 await page.keyboard.press('KeyE');
 const started=await q();
 assert.equal(started.door.targetOpen,true,'real E must operate source hinged leaf');
 const deadline=Date.now()+90000;let open=null;
 while(Date.now()<deadline){
  open=await q();
  if(open.door.openFraction>.97&&open.doorBlocked===false)break;
  await page.waitForTimeout(275);
 }
 assert.ok(open?.door?.openFraction>.97&&!open.doorBlocked,
  'original physical V113 panel did not open and remove genuine player collider');
 assert.equal(open.actualDoorCollider,true);
 const far=await page.evaluate(()=>{
  const qa=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__,p=qa.doorBeyond();
  return qa.walkTo(p.x,p.z,'actual-opening-to-public-concourse');
 });
 assert.ok(far.actualSteps>=25,'must cross full real threshold by Game.tryMove');
 state=await q();
 assert.ok(state.player.z<-43.9&&state.doorBlocked===false,
  'player must actually reach the other side of original physical door');
 await page.screenshot({path:dir+'/original-source-door-crossed.png',
  animations:'disabled',timeout:120000});
 const sections=[front,far],operated=[];
 for(const id of ['A','B','C']){
  const wall=await page.evaluate(id=>{
   const qa=window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__;
   const panel=qa.getState().panels.find(x=>x.id===id);
   const walk=qa.walkTo(panel.approach.x,panel.approach.z,'source-gallery-to-breaker-'+id);
   const used=qa.useRealPanel(id);return {walk,used,state:qa.getState()};
  },id);
  assert.equal(wall.used.id,id);assert.equal(wall.used.after,operated.length+1);
  assert.equal(wall.used.actualInteraction,true);
  assert.equal(wall.state.room,wall.state.panels.find(p=>p.id===id).room,
   'physical walking ended in the correct actual mall room');
  assert.ok(wall.walk.actualSteps>2,'must walk original collision world to '+id);
  operated.push({id,wall:wall.used.sourceWall,
   steps:wall.walk.actualSteps,metres:wall.walk.actualMeters,room:wall.state.room});
  sections.push(wall.walk);
  await page.screenshot({path:dir+'/original-source-breaker-'+id+'-from-walk.png',
   animations:'disabled',timeout:120000});
 }
 const final=await q();
 const stats=await page.evaluate(()=>window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__.travelStats());
 assert.equal(final.power,3);
 assert.ok(stats.steps>200,'require real pedestrian journey, not three teleports');
 assert.ok(stats.meters>100,'must physically cross a substantial part of the 1979 mall');
 assert.ok(final.panels.every(p=>p.on),'all original wall source circuits must be on');
 assert.equal(final.otherChapterSafe,true);
 const failures=failed.filter(s=>!/furniture_shop_loop\.ogg net::ERR_ABORTED$/.test(s));
 const report={before,front,started,opened:open,far,sections,operated,final,stats,errors,remote,failures};
 await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failures,[]);
 console.log('V143_REAL_SOURCE_WALK_PASS '+JSON.stringify({
  doorOriginalKeyE:true,closedBlockerBefore:true,openDoorDisabledBlocker:true,
  physicalDoorCrossed:true,breakers:operated,
  genuineTryMoveSteps:stats.steps,distanceMeters:stats.meters,
  finalPower:final.power,errors,remote,failures
 }));
}finally{await browser.close();}
