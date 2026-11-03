import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MALL_PLANTERS_V64} from '../opening/landscape-layout-v64.mjs';
import {chapterRouteV70} from '../mall/gameplay-layout-v70.mjs';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('eight CC0 planters form four mirrored pairs around the boarded public entrance',()=>{
 const plants=[...MALL_PLANTERS_V64].sort((a,b)=>a.x-b.x);
 assert.equal(plants.length,8);
 for(let i=0;i<4;i++){
  const opposite=plants[7-i],here=plants[i];
  assert.ok(Math.abs((here.x+opposite.x)/2-(-10.5))<.01,'asymmetric planter pair '+i);
  assert.ok(Math.abs(here.z-opposite.z)<.01,'misaligned planter depth '+i);
 }
});

test('cinematic waits for licensed v69 interior behind its first-frame cover, never uses replica stores',()=>{
 const scene=source('opening/scene.js');
 const interior=source('opening/interior-v71.js');
 const intro=source('opening/intro-v65.js');
 assert.match(scene,/if\(!useAbandonedFacade\)\s*\{\s*\/\/ Legacy concourse/);
 assert.match(interior,/renderConstructionScene/);
 assert.match(interior,/attachLicensedInteriorsV69/);
 assert.match(interior,/front_original/);
 assert.match(intro,/canonicalMall/);
 assert.match(intro,/firstFrameRendered=true/);
});

test('the car clock, ticket and contractor keypad agree on the late-night time and access code',()=>{
 const dash=source('opening/dashboard-clock-v71.js');
 const phone=source('opening/phone-v62.js');
 const entry=source('opening/keypad-v71.js');
 const intro=source('opening/intro-v65.js');
 assert.match(dash,/02:17/);
 assert.match(phone,/2841/);
 assert.match(entry,/2841/);
 assert.match(intro,/this\.keypad\.update/);
 assert.match(intro,/this\.voiceSeconds/);
});

test('rain is dense and fast, and opening captions cannot be selected',()=>{
 assert.match(source('opening/scene.js'),/rainCount=\d{4}/);
 assert.match(source('opening/intro-v65.js'),/delta\*1[2-9]\./);
 assert.match(source('opening/opening.css'),/user-select:none/);
});

test('public entry has sparse real-weathered boards with readable sign in front',()=>{
 const facade=source('opening/facade-v65.js');
 assert.match(facade,/weathered_planks_diff_1k\.jpg/);
 assert.match(facade,/public entry CLOSED sign/);
 assert.match(facade,/zFightingGuard/);
 assert.doesNotMatch(facade,/i<16/);
});

test('the cinematic and chapter one still hand off inside the real service vestibule',()=>{
 const spawn=chapterRouteV70(1).spawn;
 assert.equal(spawn.room,'service_vestibule');
 assert.equal(spawn.x,12);
 assert.ok(spawn.z<-22.5&&spawn.z>=-27);
 const camera=source('opening/camera-v65.js');
 assert.match(camera,/service_vestibule/);
 assert.match(camera,/f\(1,E\.handoff/);
});
