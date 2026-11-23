import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildGameplayLayoutV70,shortestRouteV70}
 from '../mall/gameplay-layout-v70.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {STAFF_BELONGINGS_V150,planChapter1StaffBelongingsV150}
 from '../mall/chapter1-staff-belongings-v150.mjs';

test('exactly three canon human artifacts are placed on existing measured local CC0 surfaces',()=>{
 const layout=buildGameplayLayoutV70({chapter:1});
 const sites=planChapter1StaffBelongingsV150(layout);
 assert.deepEqual(sites.map(s=>s.person),['Jo Alvarez','Tessa Kim','Luis Ortega']);
 assert.deepEqual(sites.map(s=>s.room),['food_court','cassette_castle','video_planet']);
 assert.deepEqual(sites.map(s=>s.fixture),['food_table_4','cassette_counter','video_counter']);
 assert.equal(new Set(sites.map(s=>s.id)).size,3);
 for(const s of sites){
  const original=FURNISHINGS_V69.fixtures.find(f=>f.id===s.fixture);
  assert.ok(original);
  assert.equal(s.originalSupportModel,original.model);
  assert.equal(s.originalSupportHeight,original.targetHeight);
  assert.ok(original.model.startsWith('assets/vendor/runtime/'),'source SHA-pinned GLB');
  assert.ok(['counter','table'].includes(original.role));
  assert.equal(layout.roomAt(s.x,s.z),s.room);
  assert.ok(layout.canStand(s.approach.x,s.approach.z),s.person+' viewing position must be standable');
  assert.equal(layout.roomAt(s.approach.x,s.approach.z),s.room);
  assert.ok(s.originalApproachSteps>0,'true original path from the cinematic doorway');
  assert.ok(shortestRouteV70(layout,layout.spawn,s.approach).length>0);
  assert.ok(s.width<=.4&&s.depth<=.3,'small human artifacts, no room-blocking props');
  assert.equal(s.lines.length,4);
  const evidence=FURNISHINGS_V69.storyAnchors.filter(e=>e.room===s.room&&
   Math.hypot(e.x-s.x,e.z-s.z)<1.5);
  assert.deepEqual(evidence,[],'distinct from all actual LS-01..09 pickup sites');
 }
 assert.deepEqual(
  FURNISHINGS_V69.storyAnchors.map(e=>e.id).slice().sort(),
  Array.from({length:9},(_,i)=>'LS-0'+(i+1)).sort());
});
test('Jo, Tessa, and Luis clues foreshadow humanity without revealing later evidence',()=>{
 const s=STAFF_BELONGINGS_V150;
 assert.equal(s.length,3);
 assert.match(s[0].title,/CLOSING ROUNDS/);
 assert.match(s[1].title,/STAFF PICKS/);
 assert.match(s[2].title,/COPY REQUEST/);
 for(const site of s){
  assert.doesNotMatch([site.title,site.owner,...site.lines].join(' '),
   /LS-0\d|PCAS|attendant|roster|outside|security camera|victim|dead|died/i,
   'Chapter 1 visual clue must not spoil the Chapter 3–5 reveals');
 }
 assert.deepEqual(s.map(o=>o.kind),['clipboard','chart','sleeve']);
});
test('visual keepsakes never enter original E/Q inventory or source LS evidence',()=>{
 const js=readFileSync('mall/chapter1-staff-belongings-v150.js','utf8');
 const bridge=readFileSync('game.js','utf8');
 assert.match(bridge,/installChapter1HuntPacingV149\(args\.game\);\s*installChapter1StaffBelongingsV150\(args\.game\);/);
 assert.match(js,/furnished_['"]?\+site\.fixture/);
 assert.match(js,/new THREE\.Box3\(\)\.setFromObject\(model\)/);
 assert.match(js,/group\.worldToLocal\(floorWorld\)/);
 assert.match(js,/group\.add\(prop\.root\)/);
 assert.match(js,/const out=priorReset\.apply\(this,args\);dispose\(\);return out/);
 assert.match(js,/game\.__chapter1StaffBelongingsV150\.bind\(\)/);
 assert.doesNotMatch(js,/world\.interactables\.push|world\.colliders\.push|new Audio|https?:\/\/|localStorage|indexedDB|makePickup|\bgame\.decoys\+\+|\bgame\.breakers\+\+/);
 assert.doesNotMatch(js,/type:'note'|type:"note"|LS-0[1-9].*userData/);
});
