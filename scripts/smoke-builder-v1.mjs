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
 assert.equal((await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog())).some(x=>/christmas|holiday|garland|snowman/i.test(x.label)),true);
 assert.equal((await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select('atrium_dry_fountain'))),true,'new CC0 fountain replaces old sculpture and is editable');
 assert.equal(initial.draft.added.length,0);
 assert.deepEqual(initial.errors,[]);
 // Lighting is an editor-only, reversible accessibility aid.
 assert.equal(await page.locator('#work-lights').count(),1,'work-light switch is available');
 const dark=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getLightingState());
 assert.equal(dark.enabled,false);
 await page.locator('#work-lights').check();
 const lit=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getLightingState());
 assert.equal(lit.enabled,true);
 assert.ok(lit.fillIntensity>=2&&lit.exposure>dark.exposure&&lit.fogDensity<dark.fogDensity,
  'switch enables brighter 3D illumination, not merely a visual label');
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
 await page.locator('#fly-toggle').click();
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
