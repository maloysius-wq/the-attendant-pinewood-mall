/** One render of the actual complete shared V111 mall, all seven tenants.
 * No fake preview world, no private Builder draft, no gameplay state changes.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/v157-complete-retail-audit',origin='http://127.0.0.1:4173';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const errors=[],remote=[],failed=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin+'/'))remote.push(r.url());});
 page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
 await page.goto(origin+'/review/mall-construction-v67/?retailAudit=1',{waitUntil:'domcontentloaded'});
 try{await page.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.ready,null,{timeout:540000,polling:500});}
 catch(e){console.error('V157_AUDIT_STARTUP '+JSON.stringify({errors,remote,failed,state:await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.getState?.())}).slice(0,5000));throw e;}
 const initial=await page.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 assert.equal(initial.retailAudit.source.source,'published');
 assert.equal(initial.retailAudit.source.added,0,'committed published layout, not private additions');
 assert.equal(initial.firstFrameFullyLoaded,true);
 assert.deepEqual(initial.errors,[]);
 const inventory=initial.retailAudit.fixtures;
 assert.ok(inventory.length>130,'must include all inherited and newer source furniture');
 assert.equal(new Set(inventory.map(f=>f.name)).size,inventory.length);
 assert.ok(inventory.every(f=>f.measured.size.every(Number.isFinite)&&f.measured.size.every(s=>s>0)));
 for(const id of ['cassette_counter','video_counter','food_table_8','food_chair_20','arcade_claw','fallow_wall_bay_n','checkout']){
  assert.ok(inventory.some(f=>f.id===id),'missing actual combined scene item '+id);
 }
 for(const sign of initial.retailAudit.signs){
  assert.ok(sign.signWidth>0&&sign.signHeight>0);
  assert.ok(Math.abs(sign.signWidth/sign.signHeight-sign.textureWidth/sign.textureHeight)<.003,'distorted sign '+sign.id);
  assert.ok(sign.nameWidthPx>0&&sign.nameWidthPx<=sign.textureWidth-80,'clipped lettering '+sign.id);
 }
 await writeFile(dir+'/complete-assembled-inventory.json',JSON.stringify(initial.retailAudit,null,2));
 await writeFile(dir+'/construction-telemetry.json',JSON.stringify(initial,null,2));
 console.log('V157_COMPLETE_AUDIT_INVENTORY '+JSON.stringify({total:inventory.length,byLayer:inventory.reduce((o,f)=>(o[f.layer]=(o[f.layer]||0)+1,o),{}),signs:initial.retailAudit.signs.length,source:initial.retailAudit.source,clearance:initial.retailAudit.clearanceWarnings}));
 const views={
  fallows:['fallowFront','fallows','fallowPlan'],
  cassette:['west','cassetteInside','cassetteCounter','cassetteRear','cassettePlan'],
  arcade:['arcadeFront','arcadeInside','arcadeNorth','arcadeWest','arcadePlan'],
  east:['eastAnchorFront','eastAnchor','eastAnchorPlan'],
  video:['videoFront','videoInside','videoCounter','videoRear','videoPlan'],
  food:['foodFront','foodInside','foodRear','foodPlan'],
  northstar:['annexAnchorFront','annexAnchorInside','annexAnchorGoods','annexAnchorExit','annexAnchorPlan'],
  commons:['atrium','atriumLounge','westGallery','eastGallery','directorySouth','westLounge','eastLounge','closedNorth','closedAnnex']
 };
 const shot=async(name,lit=true)=>{
  await page.evaluate(({name,lit})=>{const api=window.__PINEWOOD_MALL_CONSTRUCTION_V67__;api.goto(name);api.setAuditLight(lit)},{name,lit});
  await page.screenshot({path:dir+'/'+name+(lit?'':'-ambient')+'.png',timeout:120000,animations:'disabled'});
 };
 for(const [tenant,names] of Object.entries(views)){
  for(const name of names)await shot(name);
  if(tenant!=='commons')await shot(names[1],false);
  console.log('V157_TENANT_CAPTURED '+tenant);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(failed,[]);
 console.log('V157_FULL_ASSEMBLY_AUDIT_PASS '+JSON.stringify({fixtures:inventory.length,signs:initial.retailAudit.signs.length,views:Object.values(views).flat().length+7,errors,remote,failed}));
}finally{await writeFile(dir+'/requests.json',JSON.stringify({errors,remote,failed},null,2));await browser.close();}
