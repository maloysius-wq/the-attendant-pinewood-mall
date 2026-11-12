/** Desktop Chromium end-to-end: Builder draft -> private same-origin cinematic
 * -> actual Game v70 authored mall bridge. No manual playtest or mobile cases.
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';

const origin='http://127.0.0.1:4173',artifact='artifacts/v111-authored-vestibule.png';
mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',request=>{
  if(/^https?:/.test(request.url())&&!request.url().startsWith(origin))remote.push(request.url());
 });
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:180000});
 const before=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 assert.equal(before.ready,true,JSON.stringify(before.errors));
 assert.equal(before.catalogCount,638);
 const authored=await page.evaluate(async()=>{
  const api=window.__PINEWOOD_BUILDER__,draft=JSON.parse(api.exportJSON());
  draft.added=[
   {id:'v111-test-trash',catalogId:'decay-v105-trashbag',
    position:{x:14,y:0,z:-31},rotation:{x:0,y:.3,z:0},scale:1.15},
   {id:'v111-test-dirt',catalogId:api.getCatalog().find(x=>x.category==='Heavy Dirt & Scuffs'&&x.surface==='floor').id,
    position:{x:11.2,y:.012,z:-29.4},rotation:{x:0,y:.42,z:0},scale:1.05,opacity:.85}
  ];
  draft.surfaces.service_vestibule={wall:'painted-wall'};
  draft.mallWallFinish='painted-wall';
  await api.importJSON(JSON.stringify(draft));
  const saved=JSON.parse(api.exportJSON());
  return {saved,errors:api.getState().errors};
 });
 assert.deepEqual(authored.errors,[]);
 assert.equal(authored.saved.added.length,2);
 assert.equal(authored.saved.mallWallFinish,'painted-wall');
 assert.equal(await page.locator('#preview-cinematic').count(),1,
  'Dedicated private cinematic preview control is available');

 // Same-domain page navigation preserves the EXACT original IndexedDB v1
 // record. The preview flag is explicit and never affects general visitors.
 assert.equal((await page.goto(origin+'/review/the-call-v34/?openingPreview=1&builderPreview=1',{
  waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready'||
  window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='failed',null,{timeout:230000});
 const intro=await page.evaluate(()=>({
  status:window.__PINEWOOD_OPENING_V34__.startupStatus,
  continuity:window.__PINEWOOD_OPENING_V34__.entryContinuity,
  layout:window.__PINEWOOD_AUTHORED_SCENE_V111__
 }));
 assert.equal(intro.status.state,'ready',JSON.stringify(intro.status));
 assert.equal(intro.status.firstFrameRendered,true);
 assert.equal(intro.continuity.canonicalMounted,true);
 assert.equal(intro.continuity.sameWorldFrame,true);
 assert.equal(intro.continuity.hiddenCanonicalFrontWalls>=2,true);
 assert.equal(intro.layout.source,'browser-preview');
 assert.equal(intro.layout.added,2);
 assert.equal(intro.layout.roomFinishCount,1);
 assert.equal(intro.layout.sharedWallFinish,'painted-wall');
 assert.equal(intro.layout.fixedPatina,26);
 assert.equal(intro.layout.nominalLightIntensity,8.5);
 assert.equal(intro.layout.scriptedDoorOverridesApplied,false);
 assert.equal(intro.layout.cameraOrStoryChanged,false);
 const trash=intro.layout.placements.find(x=>x.id==='v111-test-trash');
 assert.equal(trash.catalogId,'decay-v105-trashbag');
 assert.equal(trash.position.x,14);
 assert.equal(trash.position.z,-31);
 assert.equal(trash.scale,1.15);
 assert.equal(trash.rotation.y,.3);
 const dirt=intro.layout.placements.find(x=>x.id==='v111-test-dirt');
 assert.equal(dirt.position.x,11.2);assert.equal(dirt.scale,1.05);

 // Render the ACTUAL opening's service-vestibule shot with published material
 // and visible real 3D model, preserving voice/camera/keypad choreography.
 await page.evaluate(()=>{
  const q=window.__PINEWOOD_OPENING_V34__;
  q.seek(9);q.scrub(.94);
 });
 await page.waitForTimeout(700);
 assert.equal((await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.cinematicWorld)).mode,
  'unified-mall','Cinematic walks inside physical, authored mall');
 await page.screenshot({path:artifact,animations:'disabled',timeout:90000});
 // This is a preview-only opening: close its real WebGL stage before
 // running a separate game renderer. Same browser/context preserves IDB.
 await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.skip());
 await page.goto(origin+'/?builderPreview=1&openingDisabled=1',{
  waitUntil:'domcontentloaded'});

 // The actual game bridge must install the shared render function and apply
 // the same visual and collision layout. We call its existing public bridge
 // on an isolated Three.Scene, without manual WASD gameplay.
 await page.waitForFunction(()=>!!window.__PINEWOOD_V70_BRIDGE__,null,{timeout:230000});
 const game=await page.evaluate(async()=>{
  const THREE=await import('three'),scene=new THREE.Scene();
  const building=await window.__PINEWOOD_V70_BRIDGE__.renderPinewoodV69({scene,chapter:1});
  const layout=window.__PINEWOOD_V70_BRIDGE__.buildGameplayLayoutV70({chapter:1});
  const result={state:building.authored.getState(),
   worldAttached:building.group.parent===scene,
   collisionIds:layout.colliders.filter(c=>c.kind==='authored-furnishing').map(c=>c.id),
   level:layout.level,roof:building.ceilings.visible};
  building.dispose();return result;
 });
 assert.equal(game.worldAttached,true);
 assert.equal(game.level,'G');
 assert.equal(game.state.added,2);
 assert.equal(game.state.source,'browser-preview');
 assert.equal(game.state.nominalLightIntensity,8.5);
 assert.ok(game.collisionIds.includes('authored_v111-test-trash'),
  'Placed physical 3D trash is a real runtime collider');
 assert.equal(game.collisionIds.includes('authored_v111-test-dirt'),false,
  'Floor dirt remains a nonblocking decal');
 assert.deepEqual(remote,[],'Never fetch third-party runtime assets');
 assert.deepEqual(errors,[],'No uncaught Builder/film/game JS errors');
 console.log('PINEWOOD_BUILDER_FILM_GAME_V111_DESKTOP_PASS',JSON.stringify({
  source:intro.layout.source,added:intro.layout.added,
  vestibulePatina:intro.layout.fixedPatina,filmReady:intro.status.state,
  gameColliders:game.collisionIds,localAssetsOnly:true
 }));
}finally{await browser.close();}
