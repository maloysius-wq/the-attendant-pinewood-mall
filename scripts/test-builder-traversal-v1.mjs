import test from 'node:test';
import assert from 'node:assert/strict';
import {constructPhysicalShell} from '../mall/physical-shell-v67.mjs';
import {MALL} from '../mall/masterplan-v66.mjs';
import {findGroundBelow,resolveFlyLanding,doorDescriptors} from '../mall/editor-traversal-v1.mjs';
const shells=MALL.levels.map(level=>constructPhysicalShell({level:level.id,chapter:6}));
test('gravity chooses highest real floor surface beneath feet',()=>{
 assert.equal(findGroundBelow(0,9,-71,shells),0,'atrium has no invented mezzanine');
 assert.equal(findGroundBelow(65,9,-100,shells),5.4,'upper offices support weight');
 assert.equal(findGroundBelow(4,-1,-100,shells),-4.3,'basement landing');
});
test('stair and freight shaft voids are not covered by phantom ground',()=>{
 assert.equal(findGroundBelow(20,3,-113,shells),-4.3,'freight cutout drops to B1');
 assert.equal(findGroundBelow(32,3,-110,shells),-4.3,'ground stair cutout drops to B1');
 assert.equal(findGroundBelow(120,20,100,shells),null,'outside the map is unsupported');
});
test('fly-off restores last safe position if there is no landing surface',()=>{
 const last={x:0,y:1.7,z:-70},far={x:300,y:20,z:300};
 assert.deepEqual(resolveFlyLanding(far,last,shells),last);
 const valid=resolveFlyLanding({x:65,y:9,z:-100},last,shells);
 assert.deepEqual(valid,{x:65,y:7.1,z:-100},'eyes rest at measured M1 height');
});
test('every real interior door and all three exterior thresholds are addressable',()=>{
 const doors=doorDescriptors(shells);
 assert.equal(new Set(doors.map(d=>d.id)).size,doors.length);
 assert.ok(doors.length>=20);
 for(const id of ['service_entry','main_entry','east_employee_exit'])
  assert.ok(doors.some(d=>d.id===id),'missing exterior door '+id);
 assert.ok(doors.some(d=>d.width>3),'wide storefront portal can receive paired leaves');
 assert.ok(doors.every(d=>d.width>0&&d.height>0&&d.y<=6));
});
