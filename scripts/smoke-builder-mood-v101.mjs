import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[],remote=[];
 page.on('pageerror',err=>errors.push(err.message));
 page.on('request',req=>{if(/^https?:/.test(req.url())&&!req.url().startsWith(origin))remote.push(req.url())});
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
   window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:160000});
 const state=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 assert.equal((await state()).ready,true,JSON.stringify((await state()).errors));
 assert.equal((await state()).catalogCount,618);
 assert.deepEqual((await state()).placementOptions,{gridSize:0,allowClipping:true});
 const catalog=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog());
 assert.equal(catalog.filter(x=>x.category==='Realistic Desk Plants').length,4);
 assert.equal(catalog.filter(x=>x.category==='Wall Calendars & Planners').length,4);
 for(const [category,n] of [['Realistic Desk Plants',4],['Wall Calendars & Planners',4]]){
  await page.locator('#catalog-category').selectOption(category);
  assert.equal(await page.locator('.catalog-item').count(),n);
 }
 await page.locator('#catalog-category').selectOption('');
 const samples=[
  ...catalog.filter(c=>c.category==='Realistic Desk Plants'),
  ...catalog.filter(c=>c.category==='Wall Calendars & Planners'),
  catalog.find(c=>c.id==='v100-poster-top-corner-peel'),
  catalog.find(c=>c.id==='wall-mall-advert-weekend'),
  catalog.find(c=>c.id==='grime-dust-floor-soft'),
  catalog.find(c=>c.id==='grime-water-wall-streak')
 ].filter(Boolean);
 assert.equal(samples.length,12);
 // Load all twelve source meshes and lit paper/decal states through the
 // real v1 import/commit/render pipeline in ONE transaction. Repeating the
 // full 41-room scene commit once per object made the CI test unnecessarily
 // O(n²) without increasing source-material or persistence coverage.
 const initialEntries=samples.map((x,i)=>({
  id:'ci-v101-'+i,catalogId:x.id,position:{x:550+i*3,y:i<4?1:1.8,z:550},
  rotation:{x:0,y:0,z:0},scale:1
 }));
 await page.evaluate(async entries=>{
  const initial=JSON.parse(window.__PINEWOOD_BUILDER__.exportJSON());
  initial.added=entries;
  await window.__PINEWOOD_BUILDER__.importJSON(JSON.stringify(initial));
 },initialEntries);
 for(const [i,x] of samples.entries()){
  const id='ci-v101-'+i;
  const mat=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials(id),id);
  assert.ok(mat?.length>=1,x.id+' should render');
  if(x.category==='Realistic Desk Plants'){
   assert.ok(mat.some(m=>m.textured),x.id+' must keep original PBR source textures');
  } else if(x.kind==='surface-decal'&&x.category!=='Surface Decals & Grime'){
   assert.equal(mat[0].materialType,'MeshStandardMaterial',x.id+' must obey actual scene light');
   assert.equal(mat[0].emissiveHex,'000000',x.id+' cannot emit in dark vestibule');
   assert.equal(mat[0].lightResponse,'fully-lit-paper');
  } else if(x.category==='Surface Decals & Grime'){
   assert.equal(mat[0].enhancedGrimeCC0,true,'real-source alpha rescue '+x.id);
   assert.equal(mat[0].lightResponse,'darken-only-photo');
  }
 }
 // Clicking blank viewport deselects. Previously the transform gizmo kept
 // its selection forever unless another object was explicitly selected.
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select('ci-v101-0'));
 assert.equal((await state()).selected,'ci-v101-0');
 const rect=await page.locator('#viewport canvas').boundingBox();
 assert.ok(rect,'Builder must expose its desktop canvas');
 await page.mouse.move(rect.x+10,rect.y+10);
 await page.mouse.click(rect.x+10,rect.y+10);
 const cleared=(await state()).selected;
 assert.equal(cleared,null,'empty architectural scene click clears gizmo and inspector');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select('ci-v101-1'));
 assert.equal((await state()).selected,'ci-v101-1','another object replaces selected item');
 const json=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 const saved=(await state()).draft.added.length;
 assert.equal(saved,12);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
   window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:160000});
 assert.equal((await state()).draft.added.length,saved,'v1 IndexedDB retains wall calendars and PBR plants');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),json);
 assert.equal((await state()).draft.added.length,saved,'all items survive JSON import/export');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual(remote,[],'never request external runtime media');
 assert.deepEqual(errors,[],'no page runtime errors');
 console.log('PINEWOOD_V101_MOOD_DESKTOP_PASS',JSON.stringify({count:samples.length,realPlants:4,wallCalendars:4,nonGlowingPosters:true,visibleGrime:true,deselect:true}));
}finally{await browser.close()}
