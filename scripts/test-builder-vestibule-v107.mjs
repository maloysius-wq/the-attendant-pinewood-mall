import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
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
 const bad={...marks[0],id:'intentionally-misplaced',position:{x:16,y:1,z:-44}};
 assert.throws(()=>resolveVestibulePatinaWallV107(bad,faces),/not mounted/);
});
test('fixture model is the existing licensed source GLB, with actual fluorescent glass and frame',()=>{
 const vendor=JSON.parse(readFileSync(new URL('../assets/vendor/builder/catalog-v1.json',import.meta.url)));
 const id='three-d-liminal-spaces-kit-liminal-spaces-kit-ceiling-fluorescent-0299417a';
 const entry=vendor.models.find(x=>x.id===id);
 assert.ok(entry&&entry.license==='CC0-1.0'&&entry.bytes===80760);
 assert.match(entry.sourcePage,/liminal-spaces-kit-ceiling-fluorescent/);
 const buf=readFileSync(new URL('../'+entry.path,import.meta.url));
 assert.equal(buf.toString('ascii',0,4),'glTF');
 assert.equal(createHash('sha256').update(buf).digest('hex'),entry.sha256,
  'Fixture GLB bytes must match original pinned CC0 catalog source');
 const doc=JSON.parse(buf.subarray(20,20+buf.readUInt32LE(12)).toString('utf8'));
 assert.ok(doc.meshes.length>=4,'Actual ceiling frame, housing and lens geometry');
 assert.ok(doc.materials.some(m=>m.name==='light'&&m.emissiveFactor?.some(v=>v>.1)),
  'Source light housing includes real emissive fluorescent geometry');
 assert.ok(doc.images.length>=2,'Real fixture housing uses bundled source textures');
});
test('failed ballast flutters several times in a fraction of a second, frequently',()=>{
 const seq=createVestibuleLightSequencerV107({random:()=>0});
 assert.equal(seq.getState().phase,'steady');
 assert.equal(seq.update(1.14).level,1);
 const pulse=seq.update(.02);
 assert.equal(pulse.phase,'flicker');assert.ok(pulse.level<.10);
 assert.equal(seq.update(.05).phase,'rebound');
 assert.equal(seq.update(.06).phase,'flicker');
 assert.equal(seq.update(.05).phase,'rebound');
 assert.equal(seq.update(.06).phase,'steady');
 assert.equal(seq.getState().level,1);
 // A rapidly misbehaving bulb should suffer multiple episodes in 10 seconds.
 for(let t=0;t<10;t+=.05)seq.update(.05);
 assert.ok(seq.getState().events>=7,'Too infrequent compared with old 9-27-second delays');
});
test('occasional full-blackout bursts turn the light literally OFF and sputter back on',()=>{
 const seq=createVestibuleLightSequencerV107({random:()=>.99});
 assert.equal(seq.update(3.49).phase,'off');
 assert.equal(seq.getState().level,0,'A true blackout must emit zero light');
 assert.equal(seq.update(.46).phase,'rebound');
 assert.ok(seq.getState().level>0);
 assert.equal(seq.update(.16).phase,'off');
 assert.equal(seq.getState().level,0);
 assert.equal(seq.update(.165).phase,'recovery');
 assert.equal(seq.update(.25).phase,'steady');
 assert.equal(seq.getState().level,1);
 assert.equal(seq.getState().lastEvent,'blackout');
});
test('real ceiling model controls original pointlight, hides floating orb and restores authored rig',()=>{
 const group=new THREE.Group();
 const light=new THREE.PointLight(0xd5e7d9,10,14,2);
 light.position.set(12,2.9,-30);group.add(light);
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),
  new THREE.MeshBasicMaterial({color:0xd5e7d9}));
 bulb.position.copy(light.position);group.add(bulb);
 let lens=1,disposed=false;
 const fixture={
  emitter:{x:12,y:3.08,z:-30},
  setLevel(v){lens=v;},
  getState(){return {mounted:true,asset:'pinned-real-fluorescent',lensCount:1,lensLevel:lens};},
  dispose(){disposed=true;}
 };
 const adapter=createVestibuleFixtureLightV107({group},{random:()=>.99,fixture});
 assert.equal(light.position.y,3.08);
 assert.equal(bulb.visible,false,'Floating original bulb is hidden');
 assert.equal(adapter.getState().lightIntensity,17);
 adapter.update(3.49);
 assert.equal(adapter.getState().phase,'off');
 assert.equal(adapter.getState().lightIntensity,0,'Fully off must really be dark');
 assert.equal(lens,0,'The source mesh emission goes dark with the pointlight');
 adapter.update(.46);
 assert.ok(adapter.getState().lightIntensity>0);
 adapter.setEnabled(false);
 assert.equal(light.intensity,17,'Opting out restores steady light');
 assert.equal(lens,1);
 adapter.dispose();
 assert.equal(disposed,true);
 assert.equal(light.intensity,10,'Restore original game rig intensity');
 assert.equal(light.position.y,2.9,'Restore original pointlight position');
 assert.equal(bulb.visible,true,'Restore original lamp sphere');
});
