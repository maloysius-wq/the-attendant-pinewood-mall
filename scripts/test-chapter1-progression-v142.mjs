import test from 'node:test';
import assert from 'node:assert/strict';
import {buildGameplayLayoutV70,shortestRouteV70,chapterRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {EVIDENCE_V17} from '../story/evidence.js';
import {chapter1WorkOrderStateV137} from '../mall/chapter1-workorder-v137.js';

const layout=buildGameplayLayoutV70({chapter:1});
const point=(type,id)=>storyTargetV70({chapter:1,type,id,label:id});
test('original master key and every wall breaker are accessible independently of power state',()=>{
 const key=point('key','Master Service Key'),b1=chapterRouteV70(2);
 assert.deepEqual({room:key.room,x:key.x,z:key.z},{room:'central_gallery',x:6,z:-81});
 assert.ok(layout.canStand(key.x,key.z));
 assert.ok(shortestRouteV70(layout,layout.spawn,key).length>0);
 for(const id of ['A','B','C']){
  const at=storyTargetV70({chapter:1,type:'breaker',id});
  assert.ok(shortestRouteV70(layout,key,at).length>0,'key and breaker '+id+' must connect physically');
  assert.ok(shortestRouteV70(layout,layout.spawn,at).length>0,'breaker '+id+' must be reachable without key');
 }
 assert.equal(chapter1WorkOrderStateV137({breakers:0,keyRecovered:true}).stage,'circuits');
 assert.equal(chapter1WorkOrderStateV137({breakers:3,keyRecovered:false}).stage,'service_key');
 assert.equal(chapter1WorkOrderStateV137({breakers:3,keyRecovered:true}).stage,'freight_exit');
 assert.equal(b1.level,'B1');
 assert.ok(buildGameplayLayoutV70({chapter:2}).canStand(b1.spawn.x,b1.spawn.z));
});
test('all original 1997 LS-01–03 notes exist and are reachable and canonically journaled',()=>{
 const candidates=FURNISHINGS_V69.storyAnchors.filter(a=>['LS-01','LS-02','LS-03'].includes(a.id));
 assert.deepEqual(candidates.map(p=>p.id),['LS-01','LS-02','LS-03']);
 for(const id of ['LS-01','LS-02','LS-03']){
  assert.equal(EVIDENCE_V17[id].chapter,0);
  const a=point('note',id),found=candidates.find(x=>x.id===id);
  assert.deepEqual({room:a.room,x:a.x,z:a.z},{room:found.room,x:found.x,z:found.z});
  assert.ok(layout.canStand(a.x,a.z),'source Last Shift note '+id+' not walkable');
  assert.ok(shortestRouteV70(layout,layout.spawn,a).length>0,'no physical route to '+id);
  assert.ok(shortestRouteV70(layout,{x:6,z:-81},a).length>0,'key route cannot reach '+id);
 }
});
test('original elevator opening allows a standable, continuous route into real interior threshold',()=>{
 const exit=point('exit','exit'),step=shortestRouteV70(layout,{x:6,z:-81},exit);
 assert.ok(step.length>0);
 for(let x=16;x<=18.2;x+=.1){
  assert.ok(layout.canStand(x,-113),'blocked physical G floor before actual freight cab at x='+x.toFixed(2));
 }
 assert.ok(layout.canStand(18.2,-113),'full entry to real elevator local x=1.2 must be standable');
 assert.equal(layout.canStand(18.55,-113),false,'original lift shaft remains a true opening, never false floor');
});
