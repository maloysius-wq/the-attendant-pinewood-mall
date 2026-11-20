import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';
import {buildGameplayLayoutV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {mountedPanelSitesV141} from '../mall/chapter1-wall-panels-v141.mjs';

test('all nine Last Shift evidence props land on their approved canonical anchors',()=>{
  for(const a of FURNISHINGS_V69.storyAnchors){
    const chapter=MALL.rooms.find(r=>r.id===a.room).chapter;
    const actual=storyTargetV70({chapter,type:'journal',label:a.id,index:0});
    assert.deepEqual({x:actual.x,z:actual.z,room:actual.room},{x:a.x,z:a.z,room:a.room},a.id);
  }
});

test('original breaker boxes are mounted to real masonry with walkable E approaches (V141)',()=>{
  const chapter1=buildGameplayLayoutV70({chapter:1});
  const mounted=mountedPanelSitesV141(chapter1);
  assert.deepEqual(mounted.errors,[],'the actual 1979 wall and route audit must remain valid');
  const expected={A:'central_gallery',B:'west_gallery',C:'freight_lobby'};
  for(const id of ['A','B','C']){
    const at=storyTargetV70({chapter:1,type:'breaker',id,index:0});
    const source=mounted.panels.find(p=>p.id===id);
    assert.ok(source,'real source wall missing for breaker '+id);
    assert.equal(at.room,expected[id]);
    assert.deepEqual({x:at.x,z:at.z},source.approach,
      'the relocated original object must first have its safe V141 wall approach');
    assert.equal(chapter1.canStand(at.x,at.z),true,
      'real reachable E approach blocked for breaker '+id);
    assert.ok(shortestRouteV70(chapter1,chapter1.spawn,at).length>0,
      'breaker '+id+' must be accessible from the true contractor entrance');
    assert.ok(source.wall.top>=2.1&&source.wall.bottom===0,
      'breaker '+id+' must attach to solid structural masonry, not glass');
  }
  const chapter2=buildGameplayLayoutV70({chapter:2});
  for(const [id,room] of [['D','relay_d'],['E','relay_e']]){
    const at=storyTargetV70({chapter:2,type:'breaker',id,index:0});
    assert.equal(at.room,room);
    assert.equal(chapter2.canStand(at.x,at.z),true,
      'Chapter 2 original breaker '+id+' must remain reachable');
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

test('all four CCTV feeds describe real visible areas of the new property',async()=>{
 const {CCTV_FEEDS_V70}=await import('../mall/story-placement-v70.mjs');
 const expectations={ 'CAM 02':'west_gallery','CAM 05':'receiving_r12','CAM 09':'security','CAM 12':'annex_threshold'};
 assert.equal(CCTV_FEEDS_V70.length,4);
 for(const f of CCTV_FEEDS_V70){
  const room=MALL.rooms.find(r=>r.id===expectations[f.id]);
  assert.ok(room,`unknown feed ${f.id}`);
  assert.ok(f.bounds[0]>=room.x1-.1&&f.bounds[1]<=room.x2+.1);
  assert.ok(f.bounds[2]>=room.z1-.1&&f.bounds[3]<=room.z2+.1);
 }
});

test('every office console and payroll clue has a clear player approach on its actual floor',()=>{
 const samples=[
  [3,'ch3_console_v22',{controlId:'route'}],
  [5,'journal',{label:'PAYROLL-1997'}],
  [5,'journal',{label:'TIMECLOCK-1997'}],
  [5,'ch5_sessions_terminal_v24',{}]
 ];
 for(const [chapter,type,metadata] of samples){
  const target=storyTargetV70({chapter,type,...metadata});
  assert.ok(buildGameplayLayoutV70({chapter}).canStand(target.x,target.z),
   'Unreachable '+type+' in '+target.room);
 }
});
