import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';
import {buildGameplayLayoutV70} from '../mall/gameplay-layout-v70.mjs';

test('all nine Last Shift evidence props land on their approved canonical anchors',()=>{
  for(const a of FURNISHINGS_V69.storyAnchors){
    const chapter=MALL.rooms.find(r=>r.id===a.room).chapter;
    const actual=storyTargetV70({chapter,type:'journal',label:a.id,index:0});
    assert.deepEqual({x:actual.x,z:actual.z,room:actual.room},{x:a.x,z:a.z,room:a.room},a.id);
  }
});

test('breaker boxes are reachable in meaningful electrical rooms rather than leftover corridors',()=>{
  const cases=[
    [1,'A','west_gallery'],[1,'B','east_gallery'],[1,'C','north_service'],
    [2,'D','relay_d'],[2,'E','relay_e']
  ];
  for(const [chapter,id,room] of cases){
    const at=storyTargetV70({chapter,type:'breaker',id,index:0});
    assert.equal(at.room,room);
    assert.equal(buildGameplayLayoutV70({chapter}).canStand(at.x,at.z),true,`breaker ${id} blocks or floats`);
  }
});

test('the story controllers, CCTV and final work-order exit have intentional locations',()=>{
  const feeder=storyTargetV70({chapter:2,type:'ch2_control_v21',controlId:'feeder',index:0});
  const camera=storyTargetV70({chapter:3,type:'ch3_console_v22',controlId:'cctv',index:0});
  const map=storyTargetV70({chapter:4,type:'ch4_route_map_v23',index:0});
  const roster=storyTargetV70({chapter:5,type:'ch5_roster_terminal_v24',index:0});
  assert.deepEqual([feeder.room,camera.room,map.room,roster.room],['feeder_room','security','receiving_r12','roster_records']);
  for(const [ch,target] of [[2,feeder],[3,camera],[4,map],[5,roster]]){
    assert.ok(buildGameplayLayoutV70({chapter:ch}).canStand(target.x,target.z),`chapter ${ch} story controller obstructed`);
  }
  const exit=storyTargetV70({chapter:6,type:'ch6_exit_v25',index:0});
  assert.equal(exit.room,'east_exit_vestibule');
});

test('unmapped props are zoned into a reachable chapter room instead of original 2D coordinates',()=>{
  const loc=storyTargetV70({chapter:4,type:'unknown',index:3});
  const room=MALL.rooms.find(r=>r.id===loc.room);
  assert.equal(room.level,'G');
  assert.ok(loc.x>=room.x1&&loc.x<=room.x2&&loc.z>=room.z1&&loc.z<=room.z2);
});

test('security and East Wing route shutters remain separate physical choices',()=>{
 const names=[
  [3,'West Security Shutter','security'],
  [3,'East Security Shutter','security'],
  [3,'East Wing Fire Door','annex_threshold'],
  [4,'E-17 Fire Closure','east_wing_spine'],
  [4,'R-12 Records Gate','receiving_r12']
 ];
 const seen=new Set();
 for(const [chapter,label,room] of names){
  const at=storyTargetV70({chapter,type:'door',label,index:0});
  assert.equal(at.room,room);
  const k=chapter+':'+at.x+':'+at.z;
  assert.equal(seen.has(k),false,`${label} overlaps another shutter`);
  seen.add(k);
 }
});
