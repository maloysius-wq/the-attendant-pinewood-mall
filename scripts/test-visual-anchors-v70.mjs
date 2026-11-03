import test from 'node:test';
import assert from 'node:assert/strict';
import {VISUAL_VIEWPOINTS_V70} from '../mall/visual-anchors-v70.mjs';
import {buildGameplayLayoutV70} from '../mall/gameplay-layout-v70.mjs';
import {MALL} from '../mall/masterplan-v66.mjs';

test('all existing desktop review cameras stand in the correct physical chapter floor',()=>{
 const expected=['cassette-front','cassette-center','cassette-listening','elevator-front',
 'arcade-checkout','video-checkout','below-grade-pump','below-grade-gavin',
 'below-grade-flood','security-cctv','security-shutters','security-luis',
 'east-wing-map','east-wing-lockers','east-wing-training','east-wing-receiving',
 'accountability-roster','accountability-kessler','accountability-eli','accountability-sessions',
 'last-shift-control','last-shift-memory','last-shift-echo','last-shift-roster',
 'last-shift-eli-control','last-shift-clockout','last-shift-exit'];
 assert.deepEqual(Object.keys(VISUAL_VIEWPOINTS_V70).sort(),expected.sort());
 for(const [id,v] of Object.entries(VISUAL_VIEWPOINTS_V70)){
   const ch=v.chapter+1,layout=buildGameplayLayoutV70({chapter:ch});
   assert.equal(layout.canStand(v.p[0],v.p[2]),true,`${id}: camera in a wall or licensed fixture`);
   const y=MALL.levels.find(l=>l.id===layout.level).y;
   assert.ok(Math.abs(v.p[1]-y-1.7)<.02,`${id}: wrong level elevation`);
 }
});
