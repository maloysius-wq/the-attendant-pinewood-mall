import test from 'node:test';
import assert from 'node:assert/strict';
import {ORIGINAL_ANCHOR_FIXTURES_V121 as fittings} from '../mall/anchor-layout-v121.mjs';
import {buildGameplayLayoutV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
test("Fallow's grouped perimeter, display islands and protected actual player spine",()=>{
 const west=fittings.filter(f=>f.room==='west_anchor'),nav=buildGameplayLayoutV70({chapter:1});
 assert.equal(west.filter(f=>f.source==='wall_cubbies'&&f.z===-48.55).length,8);
 assert.equal(west.filter(f=>f.source==='wall_cubbies'&&f.z===-72.45).length,6);
 assert.equal(west.filter(f=>f.source==='table_large'&&f.z===-54.7).length,2);
 assert.equal(west.filter(f=>f.source==='table_large'&&f.z===-66.4).length,2);
 for(let x=-40;x<=-30;x+=.5)for(const z of [-61.25,-60.5,-59.75])
  assert.ok(nav.canStand(x,z),'central actual shopping path obstructed at '+[x,z]);
 for(const [x,z] of [[-38.5,-58.6],[-38.5,-62.4],[-43,-66.1]])
  assert.ok(nav.canStand(x,z),'review camera inside a real fixture '+[x,z]);
 assert.equal(west.filter(f=>f.source==='gondola').length,13);
 assert.equal(west.length,36);
 for(const [x,z] of [[-43,-66.1],[-43,-70]])assert.ok(nav.canStand(x,z),'cashier/customer standability');
 for(const target of [{x:-38,z:-58},{x:-38,z:-62},{x:-43,z:-66}])
  assert.ok(shortestRouteV70(nav,{x:-30,z:-60.5},target).length>0,'no route to actual retail zone '+JSON.stringify(target));
});
