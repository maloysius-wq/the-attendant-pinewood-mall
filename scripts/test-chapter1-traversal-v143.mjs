import test from 'node:test';
import assert from 'node:assert/strict';
import {buildGameplayLayoutV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {vestibuleInnerPortalV112,VESTIBULE_HANDOFF_V112} from '../mall/vestibule-handoff-v112.mjs';
import {mountedPanelSitesV141} from '../mall/chapter1-wall-panels-v141.mjs';

test('true original V113 hinged fire-door threshold is the sole valid portal (no wall clipping)',()=>{
 const layout=buildGameplayLayoutV70({chapter:1}),p=vestibuleInnerPortalV112();
 assert.equal(p.z,-43);
 assert.equal(p.x,10);
 assert.equal(p.id,'service_vestibule__central_gallery');
 assert.ok(layout.canStand(VESTIBULE_HANDOFF_V112.x,VESTIBULE_HANDOFF_V112.z));
 for(const x of [p.x-.3,p.x,p.x+.3]){
  assert.ok(layout.canStand(x,p.z+1.5),'player must stand on vestibule side');
  assert.ok(layout.canStand(x,p.z-1.5),'player must stand beyond the genuine portal');
 }
});
test('unchanged real source 1m cell route connects cinematic start, V113 and three masonry panels',()=>{
 const layout=buildGameplayLayoutV70({chapter:1}),p=vestibuleInnerPortalV112();
 const sites=mountedPanelSitesV141(layout);assert.deepEqual(sites.errors,[]);
 const path=[
 {name:'original cinematic spawn',x:VESTIBULE_HANDOFF_V112.x,z:VESTIBULE_HANDOFF_V112.z},
 {name:'original source door near side',x:p.x,z:p.z+1.5},
 {name:'original source door far side',x:p.x,z:p.z-1.5},
 ...sites.panels.map(x=>({name:'actual '+x.id+' panel',...x.approach}))
 ];
 for(let i=1;i<path.length;i++){
  const before=path[i-1],after=path[i];
  assert.ok(layout.canStand(after.x,after.z),after.name+' approach blocked');
  const points=shortestRouteV70(layout,before,after);
  assert.ok(points.length>=2,after.name+' not accessible from previous on original shell');
  // Every tile must be physically original-shell accessible, and every
  // consecutive step must be orthogonal (no impossible corner-cutting).
  for(let n=1;n<points.length;n++){
   assert.equal(Math.abs(points[n].x-points[n-1].x)+Math.abs(points[n].z-points[n-1].z),1);
   assert.ok(layout.canStand(points[n].x,points[n].z));
  }
 }
});
