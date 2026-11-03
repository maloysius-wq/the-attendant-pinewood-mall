import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';

test('all six chapters spawn on the right real floor with safe, walkable positions',()=>{
  const expected=[['G','service_vestibule'],['B1','freight_b1'],['G','security'],['G','annex_threshold'],['M1','m1_stair'],['M1','pa_control']];
  expected.forEach(([level,room],chapter)=>{
    const layout=buildGameplayLayoutV70({chapter:chapter+1});
    const target=MALL.rooms.find(r=>r.id===room);
    assert.equal(layout.level,level);
    assert.equal(layout.spawn.room,room);
    assert.ok(layout.spawn.x>=target.x1&&layout.spawn.x<=target.x2);
    assert.ok(layout.spawn.z>=target.z1&&layout.spawn.z<=target.z2);
    assert.equal(layout.canStand(layout.spawn.x,layout.spawn.z),true,`chapter ${chapter+1} unsafe spawn`);
    assert.equal(layout.spawn.y,MALL.levels.find(l=>l.id===level).y+1.7);
  });
});

test('real partition walls block crossing except at their drawn doorway',()=>{
  const layout=buildGameplayLayoutV70({chapter:1});
  // East gallery / Video Planet wall, with a single authored opening.
  assert.equal(layout.canStand(29,-72),false,'solid wall blocks');
  assert.equal(layout.canStand(29,-64),true,'doorway is passable');
});

test('the main boarded entrance stays blocked while the contractor door is navigable',()=>{
  const layout=buildGameplayLayoutV70({chapter:1});
  assert.equal(layout.canStand(-10,-22.5),false);
  assert.equal(layout.canStand(12,-24),true);
});

test('the 1997 evidence anchors can be reached from the matching chapter start',()=>{
  for(const id of ['LS-01','LS-02','LS-03','LS-04','LS-05','LS-06','LS-07','LS-08','LS-09']){
    const a=FURNISHINGS_V69.storyAnchors.find(x=>x.id===id);
    const room=MALL.rooms.find(x=>x.id===a.room);
    const layout=buildGameplayLayoutV70({chapter:room.chapter});
    assert.equal(layout.canStand(a.x,a.z),true,`${id} is obstructed`);
    const from=chapterRouteV70(room.chapter).spawn;
    const route=shortestRouteV70(layout,{x:from.x,z:from.z},{x:a.x,z:a.z});
    assert.ok(route.length>0,`${id} unreachable from start`);
  }
});

test('chapters respect the three real vertical connectors',()=>{
  const expected=['freight_lobby__freight_b1','b1_stair__security','receiving_r12__m1_stair'];
  const ids=new Set(MALL.links.filter(l=>l.type!=='passage').map(l=>l.from+'__'+l.to));
  expected.forEach(id=>assert.ok(ids.has(id)));
  for(const chapter of [2,3,5]){
    const route=chapterRouteV70(chapter);
    assert.ok(route.transitionFromPrevious);
    assert.ok(ids.has(route.transitionFromPrevious));
  }
});

test('wall collision and furniture are part of the same obstacle map',()=>{
  const layout=buildGameplayLayoutV70({chapter:1});
  assert.equal(layout.canStand(-42,-77.4),false,'large retail counter stops movement');
  assert.equal(layout.canStand(-40,-76),true,'nearby public area remains navigable');
});
