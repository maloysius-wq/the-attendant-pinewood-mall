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
 assert.equal(response?.status(),200,'standalone builder route exists');
 await page.waitForFunction(()=>{
  const api=window.__PINEWOOD_BUILDER__;
  return api&&(api.ready||api.getState().errors.length>0);
 },null,{timeout:90000});
 const get=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 const initial=await get();
 assert.equal(initial.ready,true,JSON.stringify(initial.errors));
 assert.equal(initial.roomCount,41);
 assert.equal(initial.fixtureCount,60);
 assert.ok(initial.catalogCount>=100,'locally bundled mall asset library is available');
 assert.ok((await page.locator('.catalog-item').count())>=100);
 const textureKinds=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog().reduce((acc,m)=>{
  if(m.materialStyle)acc[m.materialStyle]=(acc[m.materialStyle]||0)+1;
  return acc;
 },{}));
 assert.equal(textureKinds['image-mapped'],172,'source models with image maps are classified');
 assert.equal(textureKinds['color-only'],339,'source models with flat colors are identified');
 await page.locator('#catalog-material').selectOption('image-mapped');
 assert.equal(await page.locator('.catalog-item').count(),172,'image-map filter includes 9 original image-bearing fixtures');
 await page.locator('#catalog-material').selectOption('color-only');
 assert.equal(await page.locator('.catalog-item').count(),338,'solid-color filter excludes retired LCD but retains other source colors');
 await page.locator('#catalog-material').selectOption('');
 assert.ok((await page.locator('.catalog-item').count())>=510,'clearing material filter restores the full catalog');
 assert.equal((await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog())).some(x=>/christmas|holiday|garland|snowman/i.test(x.label)),true);
 assert.equal((await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select('atrium_dry_fountain'))),true,'new CC0 fountain replaces old sculpture and is editable');
 assert.equal(initial.draft.added.length,0);
 assert.deepEqual(initial.errors,[]);
 assert.equal(await page.locator('#roof').isChecked(),true,
  'ceiling and atrium skylight are shown when the standalone Builder opens');
 const roofOn=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoofState());
 assert.deepEqual(roofOn,{roofVisible:true,ceilingsVisible:true,atriumSkylightPresent:true},
  'real mall roof, room ceilings, and central atrium glazing exist in the world');
 await page.locator('#roof').uncheck();
 const roofOff=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoofState());
 assert.equal(roofOff.roofVisible,false,'cutaway toggle hides roof for editing');
 assert.equal(roofOff.ceilingsVisible,false,'cutaway toggle hides room ceilings for editing');
 await page.locator('#roof').check();
 assert.deepEqual(await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoofState()),roofOn,
  'switch restores the roof and atrium skylight');
 await page.locator('#roof').uncheck(); // Keep the existing editing smoke in cutaway mode.
 // The exterior is the same fully loaded cinematic set, in the SAME editable 3D world.
 const outside=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getExteriorState());
 assert.equal(outside.ready,true,'cinematic exterior is mounted in the Builder');
 assert.equal(outside.sedanLoaded,true,'the actual cinematic vehicle is visible outdoors');
 assert.equal(outside.facadeLoaded,true,'the boarded cinematic facade is present');
 assert.equal(outside.planterCount,8,'all eight weathered cinematic planters remain');
 assert.ok(outside.placementSurfaces>=2,'parking and sidewalk are raycast placement targets');
 assert.equal(await page.locator('#jump-room option[value="__parking_lot__"]').count(),1,
  'parking is a discoverable jump destination');
 assert.equal(await page.evaluate(()=>window.__PINEWOOD_BUILDER__.jumpParkingLot()),true);
 assert.ok((await get()).navigation.position.z>0,'jump arrives at the outdoor parking area');
 const parkProp=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog().find(x=>x.id==='silted-octagonal-atrium-fountain'));
 await page.locator('.catalog-item').filter({hasText:parkProp.label}).first().click();
 const parkCanvas=await page.locator('#world canvas').boundingBox();
 await page.mouse.move(parkCanvas.x+parkCanvas.width/2,parkCanvas.y+parkCanvas.height/2);
 await page.mouse.click(parkCanvas.x+parkCanvas.width/2,parkCanvas.y+parkCanvas.height/2);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__.getState().draft.added.length===1);
 const parkAdded=(await get()).draft.added[0];
 assert.ok(parkAdded.position.z>0&&parkAdded.position.z<68.5,'clicked prop lands outside on the asphalt');
 assert.ok(Math.abs(parkAdded.position.y)<.5,'outside placement grounds the prop on the surface');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.jumpRoom('central_gallery'));
 // Lighting is an editor-only, reversible accessibility aid.
 assert.equal(await page.locator('#work-lights').count(),1,'work-light switch is available');
 const dark=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getLightingState());
 assert.equal(dark.enabled,false);
 await page.locator('#work-lights').check();
 const lit=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getLightingState());
 assert.equal(lit.enabled,true);
 assert.ok(lit.fillIntensity>=1&&lit.fillIntensity<=1.5&&lit.exposure>dark.exposure&&lit.fogDensity<dark.fogDensity,
  'switch adds bright but color-preserving fill, not merely a visual label');
 await page.locator('#work-lights').uncheck();
 assert.deepEqual(await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getLightingState()),dark,
  'switch off restores original fog, exposure and fill lighting');
 // Existing licensed furniture, not walls or cinematic props, is editable.
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select('security_desk'));
 assert.equal((await get()).selected,'security_desk','original pre-v69 furniture remains editable');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select('cassette_stool'));
 assert.equal((await get()).selected,'cassette_stool');
 await page.locator('#pos-x').fill('-38.2');
 await page.locator('#pos-x').dispatchEvent('change');
 assert.equal((await get()).draft.overrides.cassette_stool.position.x,-38.2);
 await page.locator('#delete-selected').click();
 assert.ok((await get()).draft.deleted.includes('cassette_stool'));
 await page.locator('#undo').click();
 assert.ok(!(await get()).draft.deleted.includes('cassette_stool'));
 await page.locator('#redo').click();
 assert.ok((await get()).draft.deleted.includes('cassette_stool'));
 // Render one actual catalog GLB and ensure export/import is reversible.
 await page.evaluate(async()=>{
  const a=window.__PINEWOOD_BUILDER__;
  const id=a.getCatalog().find(x=>x.id==='silted-octagonal-atrium-fountain')?.id||a.getCatalog().at(-1).id;
  await a.place(id,{x:0,y:0,z:-60},'ci-placed-prop');
 });
 const added=(await get()).draft.added;
 assert.equal(added.length,1);
 assert.equal(added[0].id,'ci-placed-prop');
 const exported=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready,{timeout:90000});
 assert.equal((await get()).draft.added.length,1,'IndexedDB draft persists across refresh');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.equal((await get()).draft.added.length,0);
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),exported);
 assert.equal((await get()).draft.added[0].id,'ci-placed-prop');
 const before=(await get()).selected;
 const rejected=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select('floor_G'));
 assert.equal(rejected,false,'structure cannot be selected for editing');
 assert.equal((await get()).selected,before);
 // Preview controls: wheel rotates left/up or right/down, Shift+wheel preserves yaw.
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 const target=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog().find(x=>x.id==='silted-octagonal-atrium-fountain'));
 assert.ok(target,'existing local model available for placement-wheel test');
 const canvas=page.locator('#world canvas');
 const canvasBox=await canvas.boundingBox();
 assert.ok(canvasBox,'editor viewport is visible');
 const targetX=canvasBox.x+canvasBox.width*.5,targetY=canvasBox.y+canvasBox.height*.58;
 async function previewAndPlace(wheelY,{shiftDistance=false}={}){
  await page.locator('.catalog-item').filter({hasText:target.label}).first().click();
  await page.waitForFunction(()=>document.getElementById('placement-tip').textContent.startsWith('PLACE '));
  await page.mouse.move(targetX,targetY);
  await page.mouse.wheel(0,wheelY);
  if(shiftDistance){
   await page.keyboard.down('Shift');
   await page.mouse.wheel(0,120);
   await page.keyboard.up('Shift');
  }
  await page.mouse.click(targetX,targetY);
  await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__.getState().draft.added.length===1);
  return (await get()).draft.added[0];
 }
 const rotatedLeft=await previewAndPlace(-120);
 assert.ok(Math.abs(rotatedLeft.rotation.y-Math.PI/12)<.001,'scroll up rotates placed prop left by 15 degrees');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 const rotatedRight=await previewAndPlace(120,{shiftDistance:true});
 assert.ok(Math.abs(rotatedRight.rotation.y+Math.PI/12)<.001,'scroll down rotates right; Shift+wheel adjusts distance without changing rotation');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 // Navigation is editor-only. The chapter/story game stays untouched.
 await page.locator('#explore-mode').click();
 assert.equal((await get()).navigation.mode,'walk');
 await page.locator('#fly-toggle').click();
 assert.equal((await get()).navigation.mode,'fly');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.jumpRoom('roster_records'));
 assert.equal((await get()).navigation.floor,'M1');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.setDoorOpen('service_entry',true));
 assert.equal((await get()).draft.doors.service_entry,true);
 await page.keyboard.press('f'); // Real fly/gravity shortcut avoids Playwright pointer-lock toolbar flake.
 assert.equal((await get()).navigation.mode,'walk');
 await page.locator('#explore-mode').click();
 assert.equal((await get()).navigation.mode,'orbit');
 // After the navigation checks, verify real Fly-mode click placement.
 await page.locator('#explore-mode').click();
 await page.locator('#fly-toggle').click();
 assert.equal((await get()).navigation.mode,'fly');
 // The editor must still accept left-click placement while flying.
 const flyProp=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog().find(x=>x.id==='silted-octagonal-atrium-fountain'));
 await page.locator('.catalog-item').filter({hasText:flyProp.label}).first().click();
 await page.waitForFunction(()=>document.getElementById('placement-tip').textContent.startsWith('PLACE '));
 await page.mouse.click(targetX,canvasBox.y+canvasBox.height*.5);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__.getState().draft.added.length===1,{timeout:8000});
 await page.keyboard.press('Escape');
 assert.deepEqual(remote,[]);
 assert.deepEqual(errors,[]);
 console.log('PINEWOOD_BUILDER_DESKTOP_PASS '+JSON.stringify({rooms:initial.roomCount,fixtures:initial.fixtureCount,catalog:initial.catalogCount}));
}finally{await browser.close()}
