import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell} from '../mall/physical-shell-v67.mjs';
import {makeAreaSignPlanV104} from '../builder/area-sign-layout-v104.mjs';

const signs=makeAreaSignPlanV104();
const roomById=new Map(MALL.rooms.map(r=>[r.id,r]));
test('all 41 canonical Pinewood rooms receive one unabridged identification sign',()=>{
 assert.equal(MALL.rooms.length,41);
 assert.equal(signs.length,41);
 assert.deepEqual(new Set(signs.map(x=>x.id)),new Set(MALL.rooms.map(x=>x.id)));
 for(const sign of signs){
  const room=roomById.get(sign.id);
  assert.equal(sign.label,room.label,'must never replace the canonical room name');
  assert.equal(sign.level,room.level);
  assert.ok(sign.width>=.7&&sign.width<=4.25);
  assert.ok(sign.height>=.28&&sign.height<=.6);
  assert.ok(Number.isFinite(sign.position.x+sign.position.y+sign.position.z));
 }
});
test('retail signs face the real storefront portals rather than arbitrary coordinates',()=>{
 const portals=MALL.levels.flatMap(l=>constructPhysicalShell({level:l.id,chapter:6}).portals);
 const byId=new Map(portals.map(p=>[p.id,p]));
 for(const id of ['cassette_castle','sunburst_arcade','video_planet','food_court','west_anchor','east_original_anchor']){
  const sign=signs.find(s=>s.id===id),p=byId.get(sign.portalId);
  assert.ok(p&&p.type==='doorway',id+' must attach near a real open storefront');
  assert.ok([p.from,p.to].includes(id));
  assert.ok(Math.abs((p.axis==='x'?sign.position.x:sign.position.z)-p.at)<.23);
  const along=p.axis==='x'?sign.position.z:sign.position.x;
  assert.ok(along>=p.start&&along<=p.end,'sign centered over actual portal span');
 }
});
test('service rooms, underground and mezzanine remain marked without modifying game geometry',()=>{
 for(const level of ['G','B1','M1'])assert.ok(signs.some(s=>s.level===level));
 for(const id of ['service_vestibule','security','receiving_r12','relay_d','feeder_room',
  'payroll_office','roster_records','kessler_office','pa_control']){
  const sign=signs.find(s=>s.id===id);
  assert.ok(sign?.label, id+' needs a real area name');
 }
 for(const id of ['central_gallery','west_gallery','east_gallery','mezz_hall','b1_spine']){
  const sign=signs.find(s=>s.id===id);
  assert.equal(sign.portalId,null,'continuous walkways must use centered unobstructed developer labels');
 }
});
