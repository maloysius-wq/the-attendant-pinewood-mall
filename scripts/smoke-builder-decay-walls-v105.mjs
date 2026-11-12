import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[],external=[];
 page.on('pageerror',err=>errors.push(err.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))external.push(r.url())});
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 const ready=()=>page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:165000});
 await ready();
 const api=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 console.log('V105_DESKTOP_STAGE','world-ready',new Date().toISOString());
 const state=await api();assert.equal(state.ready,true,JSON.stringify(state.errors));
 assert.equal(state.catalogCount,638);
 assert.equal(state.roomCount,41);
 const catalog=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog());
 assert.equal(catalog.filter(x=>x.category==='Peeling Posters & Paper').length,16);
 assert.equal(catalog.filter(x=>x.category==='Heavy Dirt & Scuffs').length,8);
 assert.equal(catalog.filter(x=>x.category==='Scattered Trash & Debris').length,2);
 assert.equal(catalog.filter(x=>x.category==='Bulletin Boards & Noticeboards').length,1);
 const board=catalog.find(x=>x.id==='v100-aged-cork-bulletin-board');
 assert.ok(board.label.startsWith('BULLETIN BOARD')&&board.mountSurface==='wall');
 await page.locator('#catalog-category').selectOption('Bulletin Boards & Noticeboards');
 assert.equal(await page.locator('.catalog-item').count(),1);
 assert.match(await page.locator('.catalog-item').first().innerText(),/BULLETIN BOARD/);
 await page.locator('#catalog-category').selectOption('');
 const original=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomFinishCounts());
 assert.ok(original.originalInteriorShell>0,
  'Original room finish must install an indoor wall coating over shared outside-shell walls');
 const vestibule=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomWallPlan('service_vestibule'));
 assert.ok(vestibule.some(x=>x.source.startsWith('cinematic_front_')));
 console.log('V105_DESKTOP_STAGE','original-envelope-and-catalog-verified',new Date().toISOString());
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.applyRoomFinishes('service_vestibule',{wall:'painted-wall'}));
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.applyRoomFinishes('service_vestibule',{wall:'original'}));
 assert.equal((await api()).draft.surfaces.service_vestibule?.wall,undefined);
 assert.ok((await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomFinishCounts())).originalInteriorShell>0);
 console.log('V105_DESKTOP_STAGE','room-original-restored',new Date().toISOString());
 await page.locator('#mall-wall-finish').selectOption('worn-plaster');
 await page.locator('#mall-wall-apply').click();
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__.getMallWallFinish()==='worn-plaster');
 assert.equal((await api()).draft.mallWallFinish,'worn-plaster');
 const globalCounts=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomFinishCounts());
 assert.ok(globalCounts.wall>0,'common gallery walls must receive physical texture planes');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.applyRoomFinishes('west_gallery',{wall:'painted-wall'}));
 assert.equal((await api()).draft.surfaces.west_gallery.wall,'painted-wall');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.undo());
 assert.equal((await api()).draft.surfaces.west_gallery,undefined);
 assert.equal((await api()).draft.mallWallFinish,'worn-plaster');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.redo());
 assert.equal((await api()).draft.surfaces.west_gallery.wall,'painted-wall');
 // Galleries now have three states: shared, their own texture and canonical
 // Original. Previously Original was silently discarded under shared paint.
 await page.locator('#finish-room').selectOption('west_gallery');
 await page.locator('#finish-wall').selectOption('original');
 await page.locator('#finish-apply').click();
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__.getRoomFinishes().west_gallery?.wall==='original');
 const originalGallery=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomFinishCounts());
 assert.ok(originalGallery.wall<globalCounts.wall,
  'Original walls must remove west gallery shared finish planes');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.undo());
 assert.equal((await api()).draft.surfaces.west_gallery.wall,'painted-wall');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.redo());
 assert.equal((await api()).draft.surfaces.west_gallery.wall,'original');
 await page.locator('#finish-wall').selectOption('inherit');
 await page.locator('#finish-apply').click();
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__.getRoomFinishes().west_gallery?.wall===undefined);
 assert.equal((await api()).draft.mallWallFinish,'worn-plaster');
 const inheritedGallery=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomFinishCounts());
 assert.equal(inheritedGallery.wall,globalCounts.wall,'Inherit must restore gallery-wide texture');
 assert.equal(await page.locator('#finish-wall').inputValue(),'inherit');
 // Actual original 3D GLB, high-opacity floor stain, lit poster and corkboard
 // must all load locally, render and survive v1 exported layout.
 console.log('V105_DESKTOP_STAGE','shared-gallery-undo-redo-verified',new Date().toISOString());
 const placed=[
  ['decay-v105-trashbag','real-trashbag',{x:550,y:0,z:550}],
  ['decay-v105-plastic-bottle-gallon','real-bottle',{x:552,y:0,z:550}],
  ['decay-v105-tracked-soil','heavy-tracked-soil',{x:554,y:.02,z:550}],
  ['decay-v105-dark-shoe-scuffs','heavy-scuffs',{x:556,y:.02,z:550}],
  ['decay-v105-poster-arcade-night','unique-arcade-ad',{x:560,y:1.7,z:550}],
  ['decay-v105-poster-corporate-safety','unique-safety-ad',{x:562,y:1.7,z:550}],
  ['v100-aged-cork-bulletin-board','real-bulletin-board',{x:564,y:1.7,z:550}]
 ];
 for(const [source,id,pos] of placed){
  assert.equal(await page.evaluate(([source,id,pos])=>
   window.__PINEWOOD_BUILDER__.place(source,pos,id),[source,id,pos]),id);
  const materials=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials(id),id);
  assert.ok(materials?.length,source+' renders real material');
  assert.ok(materials.some(m=>m.textured),'source texture missing for '+source);
  if(source.startsWith('decay-v105-poster-')){
   assert.ok(materials.every(m=>m.materialType==='MeshStandardMaterial'&&m.emissiveHex==='000000'),
    'advert paper must not glow in dark mall');
  }
  if(source.startsWith('decay-v105-')&&!source.includes('poster-')&&!source.includes('trashbag')&&!source.includes('bottle-')){
   assert.equal(materials[0].lightResponse,'darken-only-photo');
   assert.ok(materials[0].opacity>=.99,'heavy grime is visibly opaque at default');
  }
 }
 console.log('V105_DESKTOP_STAGE','all-seven-mapped-models-rendered',new Date().toISOString());
 const before=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.reload({waitUntil:'domcontentloaded'});await ready();
 assert.equal((await api()).draft.mallWallFinish,'worn-plaster');
 assert.equal((await api()).draft.added.length,placed.length);
 assert.ok((await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomFinishCounts())).originalInteriorShell>0);
 console.log('V105_DESKTOP_STAGE','reload-draft-persisted',new Date().toISOString());
 const after=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 assert.equal(after,before,'exact draft persists including common-area and new props');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),after);
 assert.equal((await api()).draft.added.length,placed.length);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 // Capture an actual neglected shop walk, not an empty scene after clearing
 // objects. This is an automated desktop visual review, not WASD gameplay.
 console.log('V105_DESKTOP_STAGE','import-and-clear-passed',new Date().toISOString());
 const sceneSamples=[
  ['decay-v105-trashbag','visual-trash',{x:-21,y:0,z:-82}],
  ['decay-v105-tracked-soil','visual-ground-dirt',{x:-19,y:.018,z:-82}],
  ['decay-v105-dark-shoe-scuffs','visual-deep-scuffs',{x:-17.2,y:.018,z:-82}],
  ['decay-v105-poster-arcade-night','visual-arcade',{x:-22,y:1.8,z:-84}]
 ];
 for(const [catalogId,id,position] of sceneSamples){
  assert.equal(await page.evaluate(([catalogId,id,position])=>
   window.__PINEWOOD_BUILDER__.place(catalogId,position,id),[catalogId,id,position]),id);
 }
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select(null));
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.jumpRoom('west_gallery'));
 mkdirSync('artifacts',{recursive:true});
 console.log('V105_DESKTOP_STAGE','dark-world-screenshot-ready',new Date().toISOString());
 await page.screenshot({path:'artifacts/pinewood-v105-editor.png'});
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual(external,[],'no external third-party runtime assets');
 assert.deepEqual(errors,[],'no uncaught WebGL/Builder errors');
 console.log('PINEWOOD_V105_REAL_WORLD_DECAY_WALLS_DESKTOP_PASS',JSON.stringify({
  catalog:638,distinctNewPosters:10,heavyDirt:8,realTrash:2,board:true,
  originalInteriorShell:original.originalInteriorShell,sharedWallChange:true,
  saveReload:true,noExternalAssets:true
 }));
}finally{await browser.close()}
