import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist',
 '--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const external=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))external.push(r.url())});
 await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
   window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:155000});
 const state=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 const initial=await state();assert.equal(initial.ready,true,JSON.stringify(initial.errors));
 assert.equal(initial.catalogCount,602);
 assert.deepEqual(initial.placementOptions,{gridSize:0,allowClipping:true});
 const catalog=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog());
 const third=catalog.filter(x=>x.sourceProvider);
 assert.equal(third.length,10);
 const samples=[];
 for(const [i,m] of third.entries()){
  const id='v99-real-source-'+i;
  assert.equal(await page.evaluate(([catalogId,id,i])=>
    window.__PINEWOOD_BUILDER__.place(catalogId,{x:400+i*4,y:0,z:400},id),
   [m.id,id,i]),id,m.id+' must load and place');
  const materials=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials(id),id);
  assert.ok(materials.length>=1,m.id+' renders source meshes');
  assert.ok(materials.every(material=>material.role===null),m.id+' source materials are untouched');
  if(m.sourceModelInfo.embeddedImageCount>0)
   assert.ok(materials.some(material=>material.sourceMapPreserved),m.id+' retains source texture');
  samples.push({id:m.id,meshes:materials.length,mapped:materials.filter(v=>v.textured).length});
 }
 const exported=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 assert.equal((await state()).draft.added.length,10);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
   window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:155000});
 assert.equal((await state()).draft.added.length,10,'original catalog IDs persist across local draft reload');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),exported);
 assert.equal((await state()).draft.added.length,10,'JSON export/import preserves all ten vendor models');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual(external,[],'no external network requests for third party models');
 assert.deepEqual(errors,[],'no browser JavaScript errors');
 console.log('PINEWOOD_BUILDER_V99_THIRD_PARTY_MODELS_PASS '+JSON.stringify(samples));
}finally{await browser.close()}
