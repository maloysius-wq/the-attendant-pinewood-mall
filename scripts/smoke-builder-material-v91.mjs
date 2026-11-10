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
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 const response=await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'});
 assert.equal(response?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:140000});
 const state=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 const initial=await state();
 assert.equal(initial.ready,true,JSON.stringify(initial.errors));
 assert.equal(initial.roomCount,41);
 for(const [part,extra] of [['wall',20],['floor',13],['ceiling',8]]){
  const options=await page.locator('#finish-'+part+' option').allTextContents();
  assert.ok(options.length>extra+2,part+' offers 1990s finishes');
 }
 await page.locator('#finish-room').selectOption('service_vestibule');
 for(const [part,id] of [['wall','v91-painted_plaster_wall'],
  ['floor','v91-laminate_floor_02'],['ceiling','v91-white_plaster_02']]){
  await page.locator('#finish-'+part).selectOption(id);
  assert.equal(await page.locator('#finish-preview-'+part).getAttribute('data-textured'),'true');
  assert.ok((await page.locator('#finish-preview-'+part).getAttribute('style'))
   .includes('assets/vendor/builder/materials-v91/'),
   part+' swatch shows local photographic material');
 }
 const initialStats=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getMaterialStats());
 assert.ok(initialStats.modelsInspected>=60,'original mall furniture gets its own material audit');
 assert.ok(initialStats.modelsEnhanced>=5,'some original mall furniture must be genuinely textured');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.setPlacementOptions({gridSize:.5,overlap:true}));
 const deskId=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.place(
  'kenney-furniture-kit-desk',{x:555,y:1,z:555},'ci-separate-wood-metal'));
 assert.equal(deskId,'ci-separate-wood-metal');
 const materials=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials(id),deskId);
 assert.ok(materials.some(x=>x.role==='wood'&&x.textured),
  'real desk wood material receives photographic woodgrain');
 assert.ok(materials.some(x=>x.role==='metal'&&x.textured),
  'metal drawer handles remain a distinct mapped metal material');
 const wood=materials.find(x=>x.role==='wood'),metal=materials.find(x=>x.role==='metal');
 assert.notEqual(wood.mapPath,metal.mapPath,'desk handles must NEVER share the wood image');
 assert.ok(wood.uvReady&&metal.uvReady);
 assert.ok(wood.mapPath.includes('/assets/vendor/builder/materials-v91/'));
 assert.ok(metal.mapPath.includes('/assets/vendor/builder/materials-v91/'));
 const stats=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getMaterialStats());
 assert.ok(stats.modelsEnhanced>initialStats.modelsEnhanced);
 assert.ok(stats.materialSurfacesEnhanced>0);
 const cabinetId=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.place(
  'kenney-furniture-kit-kitchencabinetdrawer',{x:558,y:1,z:555},'ci-cabinet'));
 assert.equal(cabinetId,'ci-cabinet');
 const cabinet=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials(id),cabinetId);
 for(const role of ['wood','woodDark','metal'])
  assert.ok(cabinet.some(x=>x.role===role&&x.textured),role+' is independently mapped on cabinets');
 assert.equal(new Set(cabinet.filter(x=>x.role).map(x=>x.mapPath)).size,3,
  'light wood, stained wood and drawer hardware have separate texture files');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.applyRoomFinishes('service_vestibule',{
  wall:'v91-painted_plaster_wall',floor:'v91-laminate_floor_02',ceiling:'v91-white_plaster_02'
 }));
 const draft=await state();
 assert.deepEqual(draft.draft.surfaces.service_vestibule,{
  wall:'v91-painted_plaster_wall',floor:'v91-laminate_floor_02',ceiling:'v91-white_plaster_02'
 });
 const counts=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomFinishCounts());
 assert.ok(counts.wall>0&&counts.floor>0&&counts.ceiling>0);
 const exported=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:140000});
 assert.deepEqual((await state()).draft.surfaces.service_vestibule,draft.draft.surfaces.service_vestibule,
  'new room texture choices persist after reload');
 const afterReload=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.inspectObjectMaterials('ci-separate-wood-metal'));
 assert.ok(afterReload.some(x=>x.role==='metal'&&x.textured),'desk hardware remains textured after load');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),exported);
 assert.equal((await state()).draft.surfaces.service_vestibule.wall,'v91-painted_plaster_wall');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual(remote,[],'no third-party browser downloads of source images');
 assert.deepEqual(errors,[],'no uncaught browser errors');
 console.log('PINEWOOD_BUILDER_V91_DESKTOP_MATERIAL_PASS '+JSON.stringify({
  newMaterialMaps:50,rooms:41,deskWood:wood.mapPath.split('/').at(-1),
  deskMetal:metal.mapPath.split('/').at(-1),
  cabinetRoles:['wood','woodDark','metal'],initialStats,stats
 }));
}finally{await browser.close()}
