import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MALL} from '../mall/masterplan-v66.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122,ANCHOR_LIGHTS_V122,ANCHOR_SIGNS_V122,validateAnchorIdentityV122}
 from '../mall/anchor-identity-plan-v122.mjs';
import {constructPhysicalShell,validatePhysicalShell} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';

test('15 real original-room light positions attach exactly to source 5.21m shop-ceiling undersides',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.deepEqual(validateAnchorIdentityV122(shell.anchorIdentity,{ceilings:shell.ceilings}),[]);
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.equal(shell.anchorIdentity.lights.length,15);
 assert.equal(shell.anchorIdentity.lights.filter(f=>f.room==='west_anchor').length,9);
 assert.equal(shell.anchorIdentity.lights.filter(f=>f.room==='east_original_anchor').length,6);
 assert.equal(shell.anchorIdentity.lights.filter(f=>f.power===0).length,7);
 assert.equal(shell.anchorIdentity.signs.length,2);
 assert.equal(MALL.rooms.length,41);
 assert.equal(MALL.evidence.length,9);
 assert.equal(shell.storefronts.length,7);
 assert.equal(shell.anchorRetail.length,49);
 assert.equal(shell.galleryColumns.length,28);
 assert.equal(shell.galleryAmenities.benches.length,6);
 for(const lamp of ANCHOR_LIGHTS_V122){
  const hits=shell.ceilings.filter(c=>c.room===lamp.room&&
   lamp.x>c.x1+1.1&&lamp.x<c.x2-1.1&&lamp.z>c.z1+1.1&&lamp.z<c.z2-1.1);
  assert.equal(hits.length,1,'no fabricated ceiling under '+lamp.id);
  assert.ok(Math.abs(hits[0].y-hits[0].thickness/2-5.21)<.01);
 }
});

test('the actual mounted fixture is source-pinned CC0 and was already used by V108',()=>{
 const list=JSON.parse(readFileSync(new URL('../assets/vendor/builder/catalog-v1.json',import.meta.url)));
 const found=list.models.find(x=>x.path===ANCHOR_FLUORESCENT_ASSET_V122.path);
 assert.ok(found,'not a genuine licensed panel from original catalog');
 assert.equal(found.sha256,ANCHOR_FLUORESCENT_ASSET_V122.sha256);
 assert.equal(found.license,'CC0-1.0');
 const binary=readFileSync(new URL('../'+found.path,import.meta.url));
 assert.equal(createHash('sha256').update(binary).digest('hex'),found.sha256);
 assert.ok(binary.length>1024);
 const vestibule=readFileSync(new URL('../builder/vestibule-fixture-v108.js',import.meta.url),'utf8');
 assert.ok(vestibule.includes(ANCHOR_FLUORESCENT_ASSET_V122.path));
});

test('interior enamel tenant identity attaches to real back walls, above source merchandise',()=>{
 assert.deepEqual(ANCHOR_SIGNS_V122.map(s=>[s.room,s.wallX,s.face]),
  [['west_anchor',-46,1],['east_original_anchor',46,-1]]);
 const bad={lights:ANCHOR_LIGHTS_V122,
  signs:ANCHOR_SIGNS_V122.map((s,i)=>i?{...s,wallX:44}:s)};
 assert.ok(validateAnchorIdentityV122(bad,{ceilings:constructPhysicalShell({level:'G'}).ceilings})
  .some(x=>x.includes('detached')));
 const bogus={lights:ANCHOR_LIGHTS_V122.map((l,i)=>i?l:{...l,x:-28}),signs:ANCHOR_SIGNS_V122};
 assert.ok(validateAnchorIdentityV122(bogus,{ceilings:constructPhysicalShell({level:'G'}).ceilings}).length>0);
});

test('all six canonical story routes, actual V113 film pose and shop aisles remain accessible',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const nav=buildGameplayLayoutV70({chapter});
  assert.deepEqual(validatePhysicalShell(nav.shell),[]);
  assert.ok(nav.canStand(chapterRouteV70(chapter).spawn.x,chapterRouteV70(chapter).spawn.z));
 }
 const nav=buildGameplayLayoutV70({chapter:1});
 assert.ok(nav.canStand(12.5,-32.75),'exact cinematic Chapter 1 endpoint blocked');
 assert.ok(shortestRouteV70(nav,{x:-30,z:-60.5},{x:-40,z:-60.5}).length>8);
 assert.ok(shortestRouteV70(nav,{x:30,z:-52},{x:38,z:-52}).length>7);
});
