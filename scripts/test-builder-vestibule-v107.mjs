import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three/build/three.module.js';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell} from '../mall/physical-shell-v67.mjs';
import {planRoomWallFacesV90} from '../builder/room-wall-layout-v90.mjs';
import {VESTIBULE_PATINA_PLAN_V107,VESTIBULE_PATINA_EXPECTED_V107,
 validateVestibulePatinaPlanV107} from '../builder/vestibule-patina-plan-v107.mjs';
import {resolveVestibulePatinaWallV107} from '../builder/vestibule-patina-v107.js';
import {createVestibuleLightSequencerV107,createVestibuleFixtureLightV107}
 from '../builder/vestibule-light-v107.js';

const room=MALL.rooms.find(r=>r.id==='service_vestibule'),shell=constructPhysicalShell({level:'G',chapter:1});
// Approximate only the cinematic replacement for the test. All remaining wall
// spans and portal positions come from canonical actual physical shell.
const front={at:-22.5,segments:[{id:'cinematic_front_service_right',axis:'z',at:-22.5,
 start:13,end:16,bottom:0,top:3.55,thickness:.62,role:'exterior'}]};
const faces=planRoomWallFacesV90(room,shell,front);

test('26 individually reviewed marks anchor within real vestibule and avoid both portals',()=>{
 assert.deepEqual(validateVestibulePatinaPlanV107(),[]);
 assert.equal(VESTIBULE_PATINA_PLAN_V107.length,VESTIBULE_PATINA_EXPECTED_V107.total);
 for(const [surface,count] of Object.entries(VESTIBULE_PATINA_EXPECTED_V107)){
  if(surface!=='total')assert.equal(VESTIBULE_PATINA_PLAN_V107.filter(x=>x.surface===surface).length,count);
 }
 const ids=new Set(VESTIBULE_PATINA_PLAN_V107.map(x=>x.id));
 assert.equal(ids.size,26);
 assert.ok(VESTIBULE_PATINA_PLAN_V107.every(x=>x.why.length>35&&x.review.length>30),
  'Each placement needs physical rationale and post-placement review');
 const doorWidth=shell.doors.find(x=>x.id==='service_entry').width;
 assert.equal(doorWidth,1.78);
 assert.ok(VESTIBULE_PATINA_PLAN_V107.filter(x=>x.surface==='floor'&&x.position.z>-25.5)
  .every(x=>x.asset!=='decay-v105-heaped-rubble'),'No heaped rubble at actual door');
 const leadToMall=shell.portals.find(x=>x.from==='service_vestibule');
 assert.ok(leadToMall&&leadToMall.axis==='z'&&leadToMall.at===-43);
});
test('all marks use already vendored correct-surface image assets, no remote dependencies',()=>{
 const manifests=[
  'assets/vendor/builder/decay-v105/manifest-v105.json',
  'assets/vendor/builder/decals-v97/manifest-v97.json',
  'assets/vendor/builder/vestibule-v98/manifest-v98.json'
 ].map(p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8')));
 const images=new Map(manifests.flatMap(m=>m.decals.map(d=>[d.id,d])));
 for(const mark of VESTIBULE_PATINA_PLAN_V107){
  const source=images.get(mark.asset);
  assert.ok(source,'Pinned asset missing '+mark.asset);
  assert.equal(source.surface,mark.surface,mark.id);
  assert.ok(source.path.startsWith('assets/vendor/builder/'));
  assert.ok(source.path.endsWith('.png'));
 }
});
test('wall stains resolve actual material plane, never hidden behind thicker cinematic wall',()=>{
 const marks=VESTIBULE_PATINA_PLAN_V107.filter(p=>p.surface==='wall');
 assert.equal(marks.length,8);
 for(const mark of marks){
  const resolved=resolveVestibulePatinaWallV107(mark,faces);
  assert.ok(resolved,'Missing wall '+mark.id);
  if(mark.normal[0]===1)assert.ok(resolved.x>9.13,'Left stain above room-facing texture');
  if(mark.normal[0]===-1)assert.ok(resolved.x<15.87,'Right stain above room-facing texture');
  if(mark.normal[2]===1)assert.ok(resolved.z>-42.87,'Rear stain above room-facing texture');
  if(mark.normal[2]===-1)assert.ok(resolved.z<-22.8,'Front stain sits inside thick cinematic wall');
 }
 const bad={...marks[0],id:'intentionally-misplaced',position:{x:16,y:1,z:-42.99}};
 assert.throws(()=>resolveVestibulePatinaWallV107(bad,faces),/not mounted/);
});
test('randomly scheduled dim holds around one second and recovers naturally',()=>{
 const seq=createVestibuleLightSequencerV107({random:()=>0});
 assert.equal(seq.getState().phase,'steady');
 assert.equal(seq.update(8.99).level,1);
 const dim=seq.update(.02);
 assert.equal(dim.phase,'dim');assert.equal(dim.level,.22);assert.equal(dim.events,1);
 assert.equal(seq.update(.70).phase,'dim');
 const restored=seq.update(.2);
 assert.equal(restored.phase,'steady');assert.equal(restored.level,1);
 assert.ok(restored.remaining>=8&&restored.remaining<=28);
});
test('random flicker is rare, spaced and visibly off/on rather than rapid strobing',()=>{
 const seq=createVestibuleLightSequencerV107({random:()=>.99});
 assert.equal(seq.update(26.83).phase,'off');
 assert.ok(seq.getState().level<.05);
 assert.equal(seq.update(.19).phase,'on');
 assert.equal(seq.getState().level,1);
 assert.equal(seq.update(.46).phase,'off');
 assert.equal(seq.update(.20).phase,'recovery');
 const restored=seq.update(.6);
 assert.equal(restored.phase,'steady');assert.equal(restored.level,1);
 assert.equal(restored.events,1);assert.equal(restored.lastEvent,'flicker');
});
test('live fixture adapter dims existing real light and glass bulb, cleanly restores both',()=>{
 const group=new THREE.Group();
 const light=new THREE.PointLight(0xd5e7d9,10,14,2);
 light.position.set(12,2.9,-30);group.add(light);
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),
  new THREE.MeshBasicMaterial({color:0xd5e7d9}));
 bulb.position.copy(light.position);group.add(bulb);
 const original=bulb.material.color.getHex();
 const adapter=createVestibuleFixtureLightV107({group},{random:()=>0});
 adapter.update(9.03);
 assert.equal(adapter.getState().phase,'dim');
 assert.ok(light.intensity<4,'The actual room light, not a duplicate prop, dims');
 assert.ok(bulb.material.color.getHex()!==original,'The visible lamp also dims');
 const draftUnrelated=adapter.setEnabled(false);
 assert.equal(draftUnrelated.enabled,false);
 assert.equal(light.intensity,10);
 assert.equal(bulb.material.color.getHex(),original);
 adapter.setEnabled(true);adapter.update(9.03);
 adapter.dispose();assert.equal(light.intensity,10);
 assert.equal(bulb.material.color.getHex(),original);
});
