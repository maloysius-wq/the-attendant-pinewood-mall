import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {FURNISHINGS_V69,validateFurnishingPlan,isFurnishingRouteClear} from '../mall/furnishing-plan-v69.mjs';

const manifest=JSON.parse(readFileSync(new URL('../assets/vendor/runtime/manifest.json',import.meta.url)));
const legal=new Set(Object.values(manifest.assets).map(a=>a.local.replace(/^\.\//,'')));
const rooms=new Map(MALL.rooms.map(r=>[r.id,r]));
const near=(a,b)=>Math.abs(a-b)<.02;

test('furnishes real stores and back rooms with a diverse set of pinned CC0 assets',()=>{
 const fixtures=FURNISHINGS_V69.fixtures;
 assert.ok(fixtures.length>=40,'at least forty actual fitted imported models');
 assert.ok(new Set(fixtures.map(f=>f.room)).size>=14,'varied stores/staff rooms rather than one test corner');
 assert.ok(new Set(fixtures.map(f=>f.model)).size>=10,'genuine imported model variety');
 assert.equal(new Set(fixtures.map(f=>f.id)).size,fixtures.length,'fixture identifiers must be unique');
 for(const f of fixtures){
  assert.ok(rooms.has(f.room),'unknown room '+f.id);
  assert.match(f.model,/^assets\/vendor\/runtime\/[a-f0-9]{16}\/[^?#]+\.glb$/);
  assert.ok(legal.has(f.model),'unvendored model '+f.id);
  assert.doesNotMatch(f.model,/ShelfLarge|ShelfSmall|Shelf%20Large|Shelf%20Small/i);
  assert.ok(f.targetHeight>.06&&f.targetHeight<3.6);
  if(!f.support)assert.ok(f.radius>=.15&&f.radius<=2.3,'physical collision footprint '+f.id);
 }
});

test('Cassette Castle has only full-scale empty Kenney racks and a supported register',()=>{
 const fixtures=FURNISHINGS_V69.fixtures.filter(f=>f.room==='cassette_castle');
 const racks=fixtures.filter(f=>f.role==='empty_rack');
 assert.ok(racks.length>=3);
 assert.ok(racks.every(f=>f.model.endsWith('/bookcaseOpen.glb')&&f.targetHeight>=1.6));
 assert.equal(FURNISHINGS_V69.rehomeLegacy.find(x=>x.id==='cc0_cassette_register')?.support,'cassette_counter');
 assert.ok(fixtures.some(f=>f.id==='cassette_counter'&&f.model.endsWith('/KSI_counter.glb')));
 assert.equal(fixtures.some(f=>/shelf-bags|shelf-boxes|ShelfLarge|ShelfSmall/i.test(f.model)),false);
});

test('loose merchandise and tabletop props cannot float unsupported',()=>{
 const fixtures=FURNISHINGS_V69.fixtures;
 const ids=new Set(fixtures.map(f=>f.id));
 const supports=new Set(['cc0_security_desk','cc0_breakroom_table',...ids]);
 for(const f of fixtures){
  if(f.role!=='loose_prop')continue;
  assert.ok(f.support,'unanchored loose prop '+f.id);
  assert.ok(supports.has(f.support),'support not present '+f.support);
  assert.equal(f.radius,0,'tabletop prop must not block walking on floor');
 }
 assert.ok(fixtures.some(f=>f.model.endsWith('/VHS_cassette.glb')&&f.support),'physical supported VHS');
 assert.ok(fixtures.some(f=>f.model.endsWith('/cup.glb')&&f.support),'physical supported cup');
});

test('all nine narrative evidence locations remain in canonical authored rooms',()=>{
 const anchors=FURNISHINGS_V69.storyAnchors;
 assert.deepEqual(anchors.map(a=>a.id).sort(),Array.from({length:9},(_,i)=>'LS-0'+(i+1)));
 for(const a of anchors){
  const canonical=MALL.evidence.find(e=>e.id===a.id),r=rooms.get(a.room);
  assert.ok(canonical);assert.equal(a.room,canonical.room,'evidence drift '+a.id);
  assert.ok(a.x>r.x1+.4&&a.x<r.x2-.4&&a.z>r.z1+.4&&a.z<r.z2-.4,'evidence clipping '+a.id);
 }
});

test('real model footprints stay inside rooms and off every usable doorway',()=>{
 assert.deepEqual(validateFurnishingPlan(FURNISHINGS_V69),[]);
 const ground=constructPhysicalShell({level:'G',chapter:6});
 assert.equal(isSegmentBlocked(ground,{x:12,z:-19},{x:12,z:-25}),false,'cinematic entry stays open');
 assert.equal(isFurnishingRouteClear(FURNISHINGS_V69,'G',{x:12,z:-26},{x:12,z:-40},.65),true);
 assert.equal(isFurnishingRouteClear(FURNISHINGS_V69,'G',{x:-20,z:-48},{x:-20,z:-107},.8),true);
 assert.equal(isFurnishingRouteClear(FURNISHINGS_V69,'G',{x:20,z:-48},{x:20,z:-106},.8),true);
 assert.equal(isFurnishingRouteClear(FURNISHINGS_V69,'G',{x:60,z:-40},{x:60,z:-102},.8),true);
 assert.equal(isFurnishingRouteClear(FURNISHINGS_V69,'B1',{x:11,z:-110},{x:11,z:-78},.8),true);
 assert.equal(isFurnishingRouteClear(FURNISHINGS_V69,'M1',{x:0,z:-98},{x:76,z:-98},.8),true);
 assert.equal(isFurnishingRouteClear(FURNISHINGS_V69,'G',{x:-45,z:-82},{x:-43,z:-82},.2),false,'Cassette rack has collision');
});

test('store thresholds retain their actual room-side approach clearance',()=>{
 const ground=constructPhysicalShell({level:'G',chapter:6});
 for(const id of ['cassette_castle','sunburst_arcade','video_planet','food_court','security','training_t04','staff_lockers']){
  const p=ground.portals.find(p=>[p.from,p.to].includes(id)&&p.type==='doorway');
  assert.ok(p,'portal missing '+id);
  const mid=(p.start+p.end)/2;
  const start=p.axis==='x'?{x:p.at-2,z:mid}:{x:mid,z:p.at-2};
  const end=p.axis==='x'?{x:p.at+2,z:mid}:{x:mid,z:p.at+2};
  assert.equal(isFurnishingRouteClear(FURNISHINGS_V69,'G',start,end,.76),true,'doorway blocked by furniture '+id);
 }
});
