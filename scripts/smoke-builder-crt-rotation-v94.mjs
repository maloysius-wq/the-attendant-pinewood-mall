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
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',r=>{
  if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url());
 });
 const response=await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'});
 assert.equal(response?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:130000});
 const api='window.__PINEWOOD_BUILDER__';
 const initial=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 assert.equal(initial.ready,true,JSON.stringify(initial.errors));
 // Move the test into the actual 41-room scene, away from walls, and use the
 // exact pinned Kenney desk and the user's combined image-mapped CRT model.
 const desk='ci-crt-support-desk',crt='ci-crt-on-real-desk',x=12,z=-34;
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.setPlacementOptions({gridSize:0,overlap:true}));
 await page.evaluate(({x,z,id})=>window.__PINEWOOD_BUILDER__.place('kenney-furniture-kit-desk',{x,y:0,z},id),{x,z,id:desk});
 const bounds=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.getObjectBounds(id),desk);
 assert.ok(bounds?.max.y>0);
 const width=bounds.max.x-bounds.min.x,depth=bounds.max.z-bounds.min.z;
 const spot={x:bounds.min.x+width*.54,y:bounds.max.y,z:bounds.min.z+depth*.54};
 await page.evaluate(({p,id})=>window.__PINEWOOD_BUILDER__.place('retro-crt-pc-1990s',p,id),{p:spot,id:crt});
 assert.equal((await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState())).selected,crt);
 const crtBounds=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.getObjectBounds(id),crt);
 const prep=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState().draft.added);
 console.log('PINEWOOD_CRT_V94_PRECHECK '+JSON.stringify({desk:bounds,crt:crtBounds,spot,dimensions:{width,depth},draft:prep}));
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.setPlacementOptions({overlap:false,gridSize:0}));
 const canvas=await page.locator('#world canvas').boundingBox();
 await page.mouse.move(canvas.x+canvas.width*.53,canvas.y+canvas.height*.55);
 const camera=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCameraPose());
 const results=[];
 for(let n=1;n<=28;n++){
  await page.mouse.wheel(0,-120);
  await page.evaluate(()=>window.__PINEWOOD_BUILDER__.waitForWheelEdits());
  const r=await page.evaluate(id=>{
   const api=window.__PINEWOOD_BUILDER__,s=api.getState();
   const inst=s.draft.added.find(a=>a.id===id);
   return {yaw:inst?.rotation.y,status:document.getElementById('save-status')?.textContent};
  },crt);
  results.push(r);
  if(n===4||n===12||n===24)
   console.log('PINEWOOD_CRT_V94_ROTATE_STEP '+JSON.stringify({n,...r}));
 }
 console.log('PINEWOOD_CRT_V94_ROTATION_SWEEP '+JSON.stringify(results));
 const final=(await page.evaluate(id=>window.__PINEWOOD_BUILDER__.getState().draft.added.find(a=>a.id===id),crt));
 assert.ok(Math.abs(final.rotation.y-28*Math.PI/12)<.001,
  'actual desktop CRT rotates beyond one scroll step through 360 degrees with Allow overlap OFF');
 assert.deepEqual(await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCameraPose()),camera,
  'rotating CRT never zooms or rotates user camera');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.undo());
 assert.ok(Math.abs((await page.evaluate(id=>window.__PINEWOOD_BUILDER__.getState().draft.added.find(a=>a.id===id),crt)).rotation.y-
  27*Math.PI/12)<.001,'selected CRT wheel rotation remains undoable');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.redo());
 const exported=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:130000});
 const persisted=await page.evaluate(id=>window.__PINEWOOD_BUILDER__.getState().draft.added.find(a=>a.id===id),crt);
 assert.ok(Math.abs(persisted.rotation.y-28*Math.PI/12)<.001);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),exported);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual(remote,[]);
 assert.deepEqual(errors,[]);
 console.log('PINEWOOD_BUILDER_CRT_V94_WHEEL_PASS '+JSON.stringify({turns:28,support:'real Kenney desk',overlap:false,legacySave:true}));
}finally{await browser.close()}
