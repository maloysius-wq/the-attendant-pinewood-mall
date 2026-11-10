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
 page.on('request',req=>{
  if(/^https?:/.test(req.url())&&!req.url().startsWith(origin))remote.push(req.url());
 });
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>{
  const api=window.__PINEWOOD_BUILDER__;
  return api&&(api.ready||api.getState().errors.length);
 },null,{timeout:120000});
 const api=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 const initial=await api();
 assert.equal(initial.ready,true,JSON.stringify(initial.errors));
 const outer=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getExteriorState());
 assert.equal(outer.frontWallSegments,5,'real staged facade must have five original wall pieces');
 assert.ok(Math.abs(outer.frontWallInteriorZ+22.95)<.0001,
  'front wall depth is measured from actual cinematic GLB scene geometry');
 const plans=await page.evaluate(async()=>{
  const {MALL}=await import('/mall/masterplan-v66.mjs');
  const api=window.__PINEWOOD_BUILDER__;
  return MALL.rooms.map(r=>({id:r.id,level:r.level,walls:api.getRoomWallPlan(r.id)}));
 });
 assert.equal(plans.length,41,'audit all original rooms without a fixture whitelist');
 const vestibule=plans.find(x=>x.id==='service_vestibule').walls;
 const front=vestibule.filter(x=>x.side==='z-end');
 assert.ok(front.length>=4,'vestibule front includes the upper door header');
 assert.ok(front.every(p=>Math.abs(p.z+22.963)<.0001),
  'material planes must be visibly INSIDE the cinematic front wall');
 assert.equal(front.some(p=>p.start<=12&&p.end>=12&&p.bottom<1&&p.top>1),false,
  'room finishes must preserve the contractor doorway');
 assert.ok(front.some(p=>p.start<=12&&p.end>=12&&p.bottom<2.8&&p.top>2.8),
  'room finish continues above the door at the actual header');
 assert.ok(plans.find(x=>x.id==='boarded_lobby').walls.some(p=>
  p.side==='z-end'&&p.z<-22.95),
  'adjacent entry room uses the same corrected cinematic frontage');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.applyRoomFinishes(
  'service_vestibule',{wall:'worn-plaster'}));
 let counts=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomFinishCounts());
 assert.equal(counts.wall,vestibule.length,
  'actual visible mesh count matches the measured vestibule wall panels');
 assert.ok(counts.wall>0);
 let draft=await api();
 assert.equal(draft.draft.surfaces.service_vestibule.wall,'worn-plaster');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.applyRoomFinishes(
  'boarded_lobby',{wall:'painted-wall'}));
 counts=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getRoomFinishCounts());
 assert.equal(counts.wall,vestibule.length+
  plans.find(x=>x.id==='boarded_lobby').walls.length,
  'painting the adjacent entry does not erase or double-paint vestibule walls');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.undo());
 draft=await api();
 assert.equal(draft.draft.surfaces.boarded_lobby,undefined);
 assert.equal(draft.draft.surfaces.service_vestibule.wall,'worn-plaster');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.redo());
 draft=await api();
 assert.equal(draft.draft.surfaces.boarded_lobby.wall,'painted-wall');
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.clearDraft());
 assert.deepEqual((await api()).draft.surfaces,{});
 assert.deepEqual(remote,[],'Builder must load all maps locally');
 assert.deepEqual(errors,[],'no WebGL or Builder exception');
 console.log('PINEWOOD_BUILDER_ROOM_WALLS_V90_DESKTOP_PASS',JSON.stringify({
  auditedRooms:41,vestibulePanels:vestibule.length,frontFacadePieces:outer.frontWallSegments,
  boardedLobbyPanels:plans.find(x=>x.id==='boarded_lobby').walls.length
 }));
}finally{await browser.close()}
