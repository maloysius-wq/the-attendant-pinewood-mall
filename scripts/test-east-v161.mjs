import test from 'node:test';
import assert from 'node:assert/strict';
import {ORIGINAL_ANCHOR_FIXTURES_V121 as fittings} from '../mall/anchor-layout-v121.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {buildGameplayLayoutV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
test('East Department clearance, removal, returns and primary circulation',()=>{
 const east=fittings.filter(f=>f.room==='east_original_anchor'),nav=buildGameplayLayoutV70({chapter:1});
 assert.equal(east.length,30);
 assert.equal(east.filter(f=>f.source==='wall_cubbies').length,20);
 assert.equal(east.filter(f=>f.source==='gondola').length,6);
 assert.equal(east.filter(f=>f.source==='table_large').length,4);
 assert.equal(east.filter(f=>f.source==='wall_cubbies'&&f.x===45.45).length,7);
 assert.equal(FURNISHINGS_V69.fixtures.find(f=>f.id==='east_returns_register').support,'east_returns_counter');
 for(let x=30;x<=44;x+=.5)for(const z of [-52.75,-52,-51.25])
  assert.ok(nav.canStand(x,z),'central public aisle obstructed '+[x,z]);
 for(const [x,z] of [[36.2,-50.2],[37.5,-46.4],[36.5,-44.6],[42.7,-46.4],[44,-52],[36.3,-53.6],[37.5,-57.8],[36.5,-59.4],[41.3,-56.5],[44.5,-56.5]])
  assert.ok(nav.canStand(x,z),'actual shopper or cashier approach blocked '+[x,z]);
 for(const target of [{x:36,z:-50},{x:36,z:-54},{x:41,z:-56}])
  assert.ok(shortestRouteV70(nav,{x:30,z:-52},target).length>0,'no actual path to '+JSON.stringify(target));
 assert.equal(fittings.filter(f=>f.room==='west_anchor').length,36);
});
