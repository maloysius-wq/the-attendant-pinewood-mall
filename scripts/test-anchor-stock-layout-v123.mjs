import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {ORIGINAL_ANCHOR_STOCK_V123,validateAnchorStockLayoutV123} from '../mall/anchor-stock-layout-v123.mjs';
import {ORIGINAL_ANCHOR_FIXTURES_V121} from '../mall/anchor-layout-v121.mjs';
import {ANCHOR_STOCK_CANDIDATES_V123} from '../mall/anchor-stock-sources-v123.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,shortestRouteV70,chapterRouteV70} from '../mall/gameplay-layout-v70.mjs';

test('13 exactly original-source retail and return pieces remain physically in two authentic 1979 anchors',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.deepEqual(validateAnchorStockLayoutV123(shell.anchorStock,{portals:shell.portals}),[]);
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.equal(shell.anchorStock.length,13);
 assert.equal(shell.anchorStock.filter(f=>f.room==='west_anchor').length,8);
 assert.equal(shell.anchorStock.filter(f=>f.room==='east_original_anchor').length,5);
 assert.equal(shell.anchorStock.filter(f=>!!f.support).length,6);
 assert.equal(shell.anchorStock.filter(f=>!f.support).length,7);
 assert.equal(new Set(shell.anchorStock.map(f=>f.id)).size,13);
 assert.ok(shell.anchorStock.every(f=>ANCHOR_STOCK_CANDIDATES_V123.some(x=>x.path===f.model&&x.sha256===f.sha256)));
 assert.ok(!shell.anchorStock.some(f=>f.source==='shoe_riser'||f.source==='stepped_riser'),
  'wide empty risers rejected from 1979 table placement after real 3D source audition');
 assert.equal(shell.anchorRetail.length,70);
 assert.equal(shell.anchorIdentity.lights.length,15);
 assert.equal(shell.galleryColumns.length,28);
 assert.equal(shell.galleryAmenities.benches.length,20);
 assert.equal(shell.galleryAmenities.bins.length,10);
 assert.equal(shell.galleryAmenities.planters.length,10);
 assert.equal(shell.galleryAmenities.directories.length,2);
 assert.equal(shell.storefronts.length,7);
 assert.equal(shell.closedBays.length,13);
 assert.equal(MALL.rooms.length,41);
 assert.equal(MALL.evidence.length,9);
});

test('all supported stock has actual, correct-sized V121 original CC0 source table and no phantom ground collider',()=>{
 const support=new Map(ORIGINAL_ANCHOR_FIXTURES_V121.map(f=>[f.id,f]));
 for(const f of ORIGINAL_ANCHOR_STOCK_V123.filter(f=>!!f.support)){
  const s=support.get(f.support);
  assert.ok(s,'missing original display table '+f.id);
  assert.equal(s.room,f.room);
  assert.deepEqual([f.x,f.z],[s.x,s.z]);
  assert.ok(['table_large','table_medium'].includes(s.source));
 }
 const nav=buildGameplayLayoutV70({chapter:1});
 const colliders=nav.colliders.filter(x=>x.kind==='original-retail-stock');
 assert.equal(colliders.length,7);
 assert.ok(colliders.every(c=>!ORIGINAL_ANCHOR_STOCK_V123.find(f=>f.id===c.id).support));
 for(const f of ORIGINAL_ANCHOR_STOCK_V123.filter(f=>!f.support)){
  assert.ok(!nav.canStand(f.x,f.z),'player can walk through ground stock '+f.id);
  assert.ok(isSegmentBlocked(nav.shell,{x:f.x-2,z:f.z},{x:f.x+2,z:f.z}),
   'physical source collision ignores real stock '+f.id);
 }
});

test('bad carton positions or fake tabletop supports cannot silently enter gameplay',()=>{
 const source=ORIGINAL_ANCHOR_STOCK_V123;
 const badFloor=source.map((x,i)=>i===0?{...x,x:-29.3,z:-60.5}:x);
 assert.ok(validateAnchorStockLayoutV123(badFloor,{portals:constructPhysicalShell({level:'G'}).portals}).length>0);
 const badSupport=source.map(x=>x.support==='fallow_display_n'?{...x,support:'fallow_spinner_mid_n'}:x);
 assert.ok(validateAnchorStockLayoutV123(badSupport).some(e=>e.includes('support')));
});

test('V123 never crowds original V69 registers/cabinets, exact source customer aisles or chapter spawns',()=>{
 const nav=buildGameplayLayoutV70({chapter:1});
 assert.ok(shortestRouteV70(nav,{x:-30,z:-60.5},{x:-40,z:-60.5}).length>8,
  '1979 Fallow original entrance-to-checkout aisle blocked');
 assert.ok(shortestRouteV70(nav,{x:30,z:-52},{x:38,z:-52}).length>7,
  '1979 East original entrance-to-checkout aisle blocked');
 assert.ok(nav.canStand(12.5,-32.75),'V113 cinematic/Chapter1 exact endpoint must survive');
 for(const a of FURNISHINGS_V69.storyAnchors.filter(a=>MALL.rooms.find(r=>r.id===a.room)?.level==='G'))
  assert.ok(nav.canStand(a.x,a.z),'LS story evidence unreachable '+a.id);
 for(let chapter=1;chapter<=6;chapter++){
  const layout=buildGameplayLayoutV70({chapter});
  assert.deepEqual(validatePhysicalShell(layout.shell),[]);
  assert.ok(layout.canStand(chapterRouteV70(chapter).spawn.x,chapterRouteV70(chapter).spawn.z));
 }
});
