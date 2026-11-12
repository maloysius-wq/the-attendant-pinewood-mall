import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const external=[],errors=[];
 page.on('request',req=>{if(/^https?:/.test(req.url())&&!req.url().startsWith(origin))external.push(req.url())});
 page.on('pageerror',err=>errors.push(err.message));
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:155000});
 const state=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 assert.equal((await state()).ready,true,JSON.stringify((await state()).errors));
 assert.equal((await state()).catalogCount,638,'v101 plant/calendar props remain available alongside 20 new licensed v105 decay assets');
 for(const [i,source]of [
  'wall-mall-advert-weekend','wall-site-safety','v100-poster-top-corner-peel',
  'grime-dust-floor-soft','grime-water-wall-streak'].entries()){
  const id='ci-lightfix-'+i;
  assert.equal(await page.evaluate(([source,id,i])=>
   window.__PINEWOOD_BUILDER__.place(source,{x:530+i*3,y:1.8,z:540},id),[source,id,i]),id);
  const mats=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials(id),id);
  assert.equal(mats.length,1);
  assert.equal(mats[0].textured,true);
  assert.equal(mats[0].transparent,true);
  if(i<3){
   assert.equal(mats[0].materialType,'MeshStandardMaterial','posters/notices respect room darkness');
   assert.equal(mats[0].lightResponse,'fully-lit-paper');
   assert.equal(mats[0].emissiveHex,'000000','poster has no self-light');
   assert.ok(!mats[0].emissiveMapPresent);
  }else{
   assert.equal(mats[0].lightResponse,'darken-only-photo');
   assert.equal(mats[0].enhancedGrimeCC0,true,'alpha restored without changing source PNG bytes');
   assert.equal(mats[0].materialType,'MeshBasicMaterial');
   assert.match(mats[0].mapPath,/\/decals-v97\//);
  }
 }
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select('ci-lightfix-0'));
 assert.equal((await state()).selected,'ci-lightfix-0');
 // Use same real canvas DOM pointer event handler as a user blank click.
 const canvas=page.locator('#viewport canvas');
 const bounds=await canvas.boundingBox();
 assert.ok(bounds,'Builder must render a real desktop canvas');
 // Use an actual Playwright-driven pointer, not synthetic PointerEvent:
 // TransformControls.setPointerCapture requires an active pointer ID.
 await page.mouse.move(bounds.x+9,bounds.y+9);
 await page.mouse.click(bounds.x+9,bounds.y+9);
 assert.equal((await state()).selected,null,'empty click deselects');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select('ci-lightfix-1'));
 assert.equal((await state()).selected,'ci-lightfix-1','another item selects');
 const json=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:155000});
 assert.equal((await state()).draft.added.length,5,'selected item and grime preserved after reload');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),json);
 assert.equal((await state()).draft.added.length,5);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual(external,[],'no external asset requests');
 assert.deepEqual(errors,[],'no page script errors');
 console.log('PINEWOOD_LIT_POSTERS_GRIME_EMPTY_CLICK_PASS');
}finally{await browser.close()}
