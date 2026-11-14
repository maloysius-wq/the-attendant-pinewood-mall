import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MALL} from '../mall/masterplan-v66.mjs';
import {VESTIBULE_HANDOFF_V112} from '../mall/vestibule-handoff-v112.mjs';
import {CHECKPOINT_V117,checkpointWallsV117,checkpointCeilingsV117,
 validateCheckpointV117} from '../mall/vestibule-checkpoint-v117.mjs';
import {constructPhysicalShell,isSegmentBlocked,validatePhysicalShell} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {planRoomWallFacesV90} from '../builder/room-wall-layout-v90.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const near=(x,y)=>Math.abs(x-y)<.0001;

test('two real closed service cells replace dead vestibule width, not the chapter room',()=>{
 assert.deepEqual(validateCheckpointV117(),[]);
 assert.equal(MALL.rooms.length,41);
 assert.deepEqual(MALL.evidence.map(e=>e.id),
  Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
 const v=CHECKPOINT_V117;
 assert.equal(v.room,'service_vestibule');
 assert.equal(v.cells.length,2);
 assert.equal(v.approach.east-v.approach.west,2.6);
 assert.deepEqual([VESTIBULE_HANDOFF_V112.x,VESTIBULE_HANDOFF_V112.z],[12.5,-32.75]);
 assert.equal(v.cells[0].x1,9);assert.equal(v.cells[1].x2,16);
 assert.ok(v.approach.startZ>-43+5,'widened turn must remain before fire door');
 assert.ok(v.path.some(p=>p.x===12.5&&p.z===-32.75));
});

test('source-attached physical observation window has real frame opening and solid glass',()=>{
 const g=constructPhysicalShell({level:'G',chapter:1});
 assert.deepEqual(validatePhysicalShell(g),[]);
 assert.equal(g.checkpoint.room,'service_vestibule');
 const walls=g.walls.filter(w=>w.id.startsWith('v117_'));
 assert.equal(walls.length,10,'two side rooms plus four distinct parts of the observation opening');
 assert.equal(walls.filter(w=>w.role==='checkpoint-glass').length,1);
 assert.equal(walls.filter(w=>w.role==='checkpoint-header').length,1);
 const glass=walls.find(w=>w.role==='checkpoint-glass');
 assert.ok(near(glass.at,13.65)&&near(glass.start,-33.25)&&near(glass.end,-29));
 assert.ok(near(glass.bottom,1.03)&&near(glass.top,2.36));
 const target=walls.filter(w=>w.axis===glass.axis&&near(w.at,glass.at)&&
  w.start<glass.end&&w.end>glass.start);
 assert.equal(target.length,3,'glazing gap has exactly one sill, pane and overhead header');
 assert.deepEqual(target.map(w=>[w.bottom,w.top]).sort((a,b)=>a[0]-b[0]),
  [[0,1.03],[1.03,2.36],[2.36,3.45]]);
 assert.equal(isSegmentBlocked(g,{x:12.5,z:-31},{x:14.5,z:-31}),true,
  'observation pane must remain a physical barrier despite transparency');
 for(const w of walls){
  assert.ok(w.start<w.end&&w.top>w.bottom);
  assert.ok(!g.walls.filter(x=>!x.id.startsWith('v117_')).some(o=>
   o.axis===w.axis&&near(o.at,w.at)&&
   Math.min(o.end,w.end)-Math.max(o.start,w.start)>.05&&
   Math.min(o.top,w.top)-Math.max(o.bottom,w.bottom)>.05),
  'checkpoint must not double pre-existing walls: '+w.id);
 }
});

test('attached lower service ceilings never become new gameplay floors',()=>{
 const g=constructPhysicalShell({level:'G',chapter:1});
 const c=checkpointCeilingsV117();
 assert.equal(c.length,2);
 for(const ceiling of c){
  assert.ok(g.ceilings.some(x=>x.id===ceiling.id));
  assert.ok(ceiling.y+ceiling.thickness/2<3.45,
   'lowered ceiling must remain below source service ceiling, not coplanar');
 }
 assert.equal(g.floorPlates.length,constructPhysicalShell({level:'G',chapter:6}).floorPlates.length);
 assert.equal(MALL.rooms.filter(r=>r.level==='G').length,22);
});

test('existing entry, cinematic stop and turn to licensed inner door remain walkable',()=>{
 const g=constructPhysicalShell({level:'G',chapter:1});
 const v=CHECKPOINT_V117;
 for(let i=0;i<v.path.length-1;i++)
  assert.equal(isSegmentBlocked(g,v.path[i],v.path[i+1]),false,
   'source route obstructed between checkpoint waypoints '+i);
 const p=g.portals.find(p=>p.id==='service_vestibule__central_gallery');
 assert.deepEqual([p.axis,p.at,p.start,p.end],['z',-43,9.1,10.9]);
 for(let chapter=1;chapter<=6;chapter++){
  const r=chapterRouteV70(chapter),l=buildGameplayLayoutV70({chapter});
  assert.ok(l.canStand(r.spawn.x,r.spawn.z),'protected chapter spawn '+chapter);
 }
 const walk=buildGameplayLayoutV70({chapter:1});
 for(const point of v.path)assert.ok(walk.canStand(point.x,point.z),
  'contractor checkpoint waymark blocked: '+JSON.stringify(point));
 assert.ok(shortestRouteV70(walk,{x:12.5,z:-32.75},{x:10,z:-40.8}).length>0,
  'real inner-door approach must remain connected');
 assert.ok(shortestRouteV70(walk,{x:12.5,z:-32.75},{x:-38,z:-81}).length>0,
  'original Cassette Castle story route must remain connected');
 assert.ok(!MALL.links.some(l=>l.from==='east_checkin'||l.to==='west_service_riser'),
  'sealed side room is never a story transition');
});

test('V117 does not change Owner Builder draft or cover source wall finishes',()=>{
 const g=constructPhysicalShell({level:'G',chapter:1});
 const room=MALL.rooms.find(r=>r.id==='service_vestibule');
 const painted=planRoomWallFacesV90(room,g);
 assert.ok(!painted.some(p=>p.source.startsWith('v117_')),
  'V117 infrastructure cannot become user room-wall paint targets');
 const published=JSON.parse(read('assets/world/published-layout-v111.json'));
 assert.ok(published&&typeof published==='object');
 assert.match(read('mall/vestibule-inner-door-v112.js'),/GLTFLoader/);
 assert.match(read('mall/render-shell-v67.js'),/renderVestibuleCheckpointV117/);
 assert.match(read('mall/render-vestibule-checkpoint-v117.js'),/CanvasTexture/);
 const originalDoor=g.doors.find(d=>d.id==='service_entry');
 assert.ok(originalDoor&&near(originalDoor.width,1.78));
});
