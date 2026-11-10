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
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',req=>{if(/^https?:/.test(req.url())&&!req.url().startsWith(origin))external.push(req.url())});
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:140000});
 assert.equal((await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState())).ready,true);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.setPlacementOptions({gridSize:0,overlap:true}));
 const ids=[
  ['retro-crt-pc-1990s','ci-off-crt-a',551],
  ['retro-crt-pc-1990s','ci-off-crt-b',553],
  ['kenney-furniture-kit-computerscreen','ci-old-lcd-now-off-crt',555]
 ];
 for(const [catalog,id,x] of ids){
  await page.evaluate(([catalogId,instanceId,posX])=>window.__PINEWOOD_BUILDER__.place(
   catalogId,{x:posX,y:1,z:555},instanceId),[catalog,id,x]);
 }
 async function checkMaterials(id){
  const parts=await page.evaluate(instanceId=>
   window.__PINEWOOD_BUILDER__.inspectObjectMaterials(instanceId),id);
  assert.ok(parts?.length>=8,'source 1990s PC still contains its genuine GLB components');
  const glass=parts.filter(p=>p.poweredOff);
  assert.equal(glass.length,1,id+' has one screen glass surface');
  const screen=glass[0];
  assert.equal(screen.material,'Monitor_Glass_PoweredOff');
  assert.equal(screen.textured,false,'baked green source image removed from screen only');
  assert.equal(screen.emissiveMapPresent,false,'no powered screen emission texture');
  assert.equal(screen.alphaMapPresent,false,'no source overlay alpha');
  assert.equal(screen.emissiveHex,'000000');
  assert.equal(screen.transparent,false);
  assert.equal(screen.opacity,1);
  assert.match(screen.sourceColor,/^0[0-9a-f]{5}$/i,'screen is almost black');
  const refl=parts.filter(p=>p.reflectionDisabled);
  assert.equal(refl.length,1,'one original baked reflection geometry is hidden');
  assert.equal(refl[0].meshVisible,false);
  for(const name of ['Ucupaint_Keyboard_Creme','Mouse_Cream',
   'Monitor_Cream','PC_Front_Cream','PC_Cream']){
   assert.ok(parts.some(p=>p.material===name&&p.sourceMapPreserved),
    id+' preserves original detailed source texture '+name);
  }
  // Power off the display, not any other surface of the 1990s computer.
  assert.ok(parts.every(p=>!p.poweredOff||p.material==='Monitor_Glass_PoweredOff'));
  return parts;
 }
 for(const [,id] of ids)await checkMaterials(id);
 const saved=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:140000});
 for(const [,id] of ids)await checkMaterials(id);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 await page.evaluate(json=>window.__PINEWOOD_BUILDER__.importJSON(json),saved);
 for(const [,id] of ids)await checkMaterials(id);
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual(external,[],'all runtime source textures served repository-locally');
 assert.deepEqual(errors,[],'no Builder runtime exceptions');
 console.log('PINEWOOD_BUILDER_CRT_OFF_V96_DESKTOP_PASS '+JSON.stringify({
  checkedIds:ids.map(x=>x[1]),screen:'unlit near-black',poweredOff:true,
  originalKeyboardAndMouse:true,legacyLcdRedirect:true,saveReload:true,
  sourceModelBytesIntact:true
 }));
}finally{await browser.close()}
