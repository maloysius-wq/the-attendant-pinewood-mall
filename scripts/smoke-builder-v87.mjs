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
 const ready=()=>page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:130000});
 await ready();
 const call=(f,arg)=>page.evaluate(([source,param])=>
  (new Function('param','return ('+source+')(param)'))(param),[f.toString(),arg]);
 const state=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 let s=await state();
 assert.equal(s.ready,true,JSON.stringify(s.errors));
 assert.equal(s.roomCount,41);
 assert.equal(s.catalogCount,511,'503 original models plus 8 vetted era-appropriate props');
 assert.equal(await page.locator('.catalog-item').count(),510,'retired modern LCD excluded from new placements');
 assert.equal(await page.locator('#aim-reticle').count(),1);
 assert.equal(await page.locator('#snap-grid').isChecked(),true);
 assert.equal(await page.locator('#allow-clipping').isChecked(),false);
 assert.deepEqual(s.placementOptions,{gridSize:.5,allowClipping:false});

 // Render the actual 1990s CRT and ensure the preview rotates, NOT the user.
 await page.locator('#catalog-search').fill('CRT desktop computer');
 assert.equal(await page.locator('.catalog-item').count(),1);
 await page.locator('.catalog-item').first().click();
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__.getPlacementState().placing,{timeout:30000});
 const rect=await page.locator('#world canvas').boundingBox();
 await page.mouse.move(rect.x+rect.width*.55,rect.y+rect.height*.55);
 const initial=await page.evaluate(()=>({
  preview:window.__PINEWOOD_BUILDER__.getPlacementState(),
  camera:window.__PINEWOOD_BUILDER__.getCameraPose()
 }));
 assert.ok(initial.preview.position);
 await page.mouse.wheel(0,120);
 const afterWheel=await page.evaluate(()=>({
  preview:window.__PINEWOOD_BUILDER__.getPlacementState(),
  camera:window.__PINEWOOD_BUILDER__.getCameraPose()
 }));
 assert.ok(Math.abs(afterWheel.preview.rotation.y-initial.preview.rotation.y)>.1,
  'wheel rotates held CRT in 15 degree steps');
 assert.deepEqual(afterWheel.camera,initial.camera,
  'scroll-wheel must never rotate the observer 180 degrees');
 assert.equal(afterWheel.preview.pointerLocked,false,
  'entering placement must not capture the cursor');
 await page.keyboard.press('Escape');
 assert.equal((await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getPlacementState())).placing,false);

 // Snap must use the selected physical interval, and be switchable.
 await page.locator('#grid-size').selectOption('0.25');
 assert.equal((await state()).placementOptions.gridSize,.25);
 await page.locator('#snap-grid').uncheck();
 assert.equal((await state()).placementOptions.gridSize,0);
 await page.locator('#snap-grid').check();
 assert.equal((await state()).placementOptions.gridSize,.25);

 // Collisions are blocked for new placement and transformations by default.
 const outsidePosition={x:555,y:-5,z:555};
 const blocked=await page.evaluate(async pos=>{
  try{
   await window.__PINEWOOD_BUILDER__.place('kenney-food-kit-can',pos,'ci-invalid');
   return null;
  }catch(e){return e.message}
 },outsidePosition);
 assert.match(blocked,/support|overlap/i);
 assert.equal((await state()).draft.added.length,0);
 await page.locator('#allow-clipping').check();
 assert.equal((await state()).placementOptions.allowClipping,true);
 await page.evaluate(pos=>window.__PINEWOOD_BUILDER__.place('kenney-food-kit-can',pos,'ci-allowed'),outsidePosition);
 assert.equal((await state()).draft.added.length,1,'overlap explicitly allows out-of-bounds props');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.locator('#allow-clipping').uncheck();

 // Distinct room finishes must appear in THREE scene and survive undo and reload.
 await page.locator('#finish-room').selectOption('security');
 await page.locator('#finish-wall').selectOption('worn-plaster');
 await page.locator('#finish-floor').selectOption('dirty-carpet');
 await page.locator('#finish-ceiling').selectOption('acoustic');
 await page.locator('#finish-apply').click();
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__.getState().draft.surfaces?.security?.wall==='worn-plaster');
 s=await state();
 assert.deepEqual(s.draft.surfaces.security,{wall:'worn-plaster',floor:'dirty-carpet',ceiling:'acoustic'});
 assert.equal(Object.keys(s.draft.surfaces).length,1,'neighbor rooms must retain original surfaces');
 const counts=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomFinishCounts());
 assert.ok(counts.wall>0&&counts.floor>0&&counts.ceiling>0,
  'independent wall/floor/ceiling meshes render for selected room');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.undo());
 assert.deepEqual((await state()).draft.surfaces,{},'undo removes all three surface changes together');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.redo());
 assert.deepEqual((await state()).draft.surfaces.security,{wall:'worn-plaster',floor:'dirty-carpet',ceiling:'acoustic'});
 const exported=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.reload({waitUntil:'domcontentloaded'});await ready();
 assert.deepEqual((await state()).draft.surfaces.security,{wall:'worn-plaster',floor:'dirty-carpet',ceiling:'acoustic'},
  'existing IndexedDB layout persists independent room finishes');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual((await state()).draft.surfaces,{});
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),exported);
 assert.equal((await state()).draft.surfaces.security.floor,'dirty-carpet');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual(remote,[],'all runtime 3D models and material textures must be repository-local');
 assert.deepEqual(errors,[],'no uncaught Builder errors');
 console.log('PINEWOOD_BUILDER_V87_DESKTOP_PASS',JSON.stringify({
  catalog:511,visible:510,finishes:counts,reticle:true,snapping:true,
  collisionDefault:true,overlapOptIn:true,crtWheelRotation:true,persistence:true
 }));
}finally{await browser.close()}
