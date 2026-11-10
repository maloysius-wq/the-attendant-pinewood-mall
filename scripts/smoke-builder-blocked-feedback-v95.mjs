import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))external.push(r.url())});
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:130000});
 const state=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 const bubble=page.locator('#collision-warning');
 assert.equal((await state()).ready,true);
 assert.equal(await bubble.isHidden(),true,'no warning before a rejected edit');
 assert.equal(await bubble.getAttribute('role'),'alert');
 assert.equal(await bubble.getAttribute('aria-live'),'assertive');

 // New default allows overlap as requested. Deliberately disable it
 // before verifying that strict collision warnings remain operational.
 assert.equal(await page.locator('#allow-clipping').isChecked(),true);
 await page.evaluate(()=>{
  const input=document.getElementById('allow-clipping');
  input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}));
 });
 assert.equal((await state()).placementOptions.allowClipping,false);
 // A rejected inspector move on a real, visible, unmodified mall fixture.
 assert.equal(await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select('atrium_dry_fountain')),true);
 const original=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState().selected);
 assert.equal(original,'atrium_dry_fountain');
 const blocked=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.applyTransform({
  position:{x:555,y:-5,z:555}
 }));
 assert.equal(blocked,false,'collision still blocks unsupported inspector movement');
 assert.equal((await state()).selected,'atrium_dry_fountain');
 assert.equal(await bubble.isVisible(),true);
 assert.equal(await page.locator('#collision-warning-title').textContent(),'Move blocked');
 assert.match(await page.locator('#collision-warning-detail').textContent(),/floor or furniture support/);
 assert.match(await page.locator('#collision-warning-hint').textContent(),/Allow overlap/);
 assert.match(await page.locator('#save-status').textContent(),/Blocked:/);
 assert.deepEqual(await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCollisionWarning()),
  {id:'atrium_dry_fountain',title:'Move blocked',
   detail:'The object would not have continuous floor or furniture support.',
   hint:'Keep the object supported, or enable Allow overlap to bypass this check.'});
 assert.equal(await bubble.evaluate(e=>getComputedStyle(e).pointerEvents),'none');
 await page.waitForTimeout(250);
 assert.equal(await bubble.isVisible(),true,'no blink or auto-timeout before user notices warning');
 const rect=await bubble.boundingBox();
 const view=await page.locator('#viewport').boundingBox();
 assert.ok(rect&&view&&rect.x>=view.x-3&&rect.x+rect.width<=view.x+view.width+3,
  'warning is inside the 3D viewport rather than buried in the inspector');
 assert.ok(rect.y>=view.y-3&&rect.y+rect.height<=view.y+view.height+3);
 assert.equal(await bubble.getAttribute('data-offscreen'),'false',
  'warning follows real object visible in central atrium camera');
 console.log('PINEWOOD_V95_INSPECTOR_BLOCK_VISIBLE '+JSON.stringify({
  text:await bubble.innerText(),nearSelected:await bubble.getAttribute('data-offscreen')==='false'
 }));
 // Warning clears only when selecting a different object or changing the
 // collision mode. Never save warning-only state to the user's draft.
 const draftBefore=JSON.stringify((await state()).draft);
 assert.equal(await page.evaluate(()=>window.__PINEWOOD_BUILDER__.select(null)),true);
 assert.equal(await bubble.isHidden(),true,'deselect clears stale warning');
 assert.deepEqual(JSON.stringify((await state()).draft),draftBefore);

 // Real scroll-wheel on a real CRT that was deliberately loaded in a
 // previously valid user draft outside strict support rules. No asset
 // movement should be committed when Allow overlap is turned off.
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.setPlacementOptions({gridSize:0,overlap:true}));
 const crt='ci-wheel-warning-crt';
 await page.evaluate(id=>window.__PINEWOOD_BUILDER__.place('retro-crt-pc-1990s',
  {x:555,y:-5,z:555},id),crt);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.setPlacementOptions({gridSize:0,overlap:false}));
 const canvas=await page.locator('#world canvas').boundingBox();
 await page.mouse.move(canvas.x+canvas.width*.55,canvas.y+canvas.height*.55);
 await page.mouse.wheel(0,-120);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.waitForWheelEdits());
 assert.equal(await bubble.isVisible(),true,'failed wheel rotation shows prominent object warning');
 assert.equal(await page.locator('#collision-warning-title').textContent(),'Rotation blocked');
 assert.match(await page.locator('#collision-warning-hint').textContent(),/Allow overlap/);
 const denied=(await state()).draft.added.find(a=>a.id===crt);
 assert.equal(denied.rotation.y,0,'blocked wheel never changes saved rotation');
 // Warning is non-modal: opt in to the existing overlap setting, then wheel.
 await page.evaluate(()=>{
  const input=document.getElementById('allow-clipping');
  input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));
 });
 assert.equal(await bubble.isHidden(),true,'enabling overlap immediately clears the warning');
 assert.equal((await state()).placementOptions.allowClipping,true);
 // The checkbox click moves Playwright's mouse outside the canvas. Return
 // it to the world before testing that the wheel again rotates the CRT.
 await page.mouse.move(canvas.x+canvas.width*.55,canvas.y+canvas.height*.55);
 await page.mouse.wheel(0,-120);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.waitForWheelEdits());
 const allowed=(await state()).draft.added.find(a=>a.id===crt);
 assert.ok(Math.abs(allowed.rotation.y-Math.PI/12)<.001,
  'scroll works again after deliberately allowing overlap');
 assert.equal(await bubble.isHidden(),true,'successful transform never leaves a stale warning');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.equal(await bubble.isHidden(),true);
 assert.equal((await state()).draft.added.length,0);
 assert.deepEqual(errors,[]);
 assert.deepEqual(external,[]);
 console.log('PINEWOOD_BUILDER_V95_COLLISION_WARNING_DESKTOP_PASS '+JSON.stringify({
  inspector:true,selectedWheel:true,readableMessage:true,anchoredWithinViewport:true,
  persistentUntilResolved:true,unchangedDraftOnFailure:true,overlapOptIn:true,clearsOnSuccess:true
 }));
}finally{await browser.close()}
