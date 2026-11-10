import test from 'node:test';
import assert from 'node:assert/strict';
import {isStableYawEditV94,supportProbePointsV94} from '../builder/rotation-support-v94.mjs';

const pose=(x=12,y=.8,z=-34,yaw=0)=>({
 position:{x,y,z},rotation:{x:0,y:yaw,z:0},scale:1
});
test('only a true in-place yaw uses a stable contact footprint',()=>{
 assert.equal(isStableYawEditV94(pose(),pose(12,.8,-34,Math.PI/12)),true);
 assert.equal(isStableYawEditV94(pose(),pose(12,.8,-34,-Math.PI/12)),true);
 assert.equal(isStableYawEditV94(pose(),pose(12,.8,-34,0)),false);
 for(const changed of [
  {...pose(12.2,.8,-34,.4)},
  {...pose(12,.81,-34,.4)},
  {...pose(12,.8,-34.2,.4)},
  {...pose(12,.8,-34,.4),scale:1.2},
  {...pose(12,.8,-34,.4),rotation:{x:.1,y:.4,z:0}},
  {...pose(12,.8,-34,.4),rotation:{x:0,y:.4,z:-.1}}
 ])assert.equal(isStableYawEditV94(pose(),changed),false);
});
test('anchored yaw support probes never drift or enlarge with a rotated AABB',()=>{
 const center={x:12,z:-34},box0={min:{x:11.5,z:-34.4},max:{x:12.5,z:-33.6}};
 const box45={min:{x:11.35,z:-34.65},max:{x:12.65,z:-33.35}};
 const stable=supportProbePointsV94(box0,center);
 assert.deepEqual(supportProbePointsV94(box45,center),stable);
 assert.equal(stable.length,5);
 assert.ok(stable.every(([x,z])=>Math.abs(x-center.x)<=.0351&&Math.abs(z-center.z)<=.0351));
 const strict=supportProbePointsV94(box45);
 assert.equal(strict.length,5);
 assert.ok(strict.some(([x,z])=>Math.abs(x-center.x)>.5||Math.abs(z-center.z)>.5),
  'new placements retain the actual full AABB support footprint');
 assert.notDeepEqual(strict,stable);
});
test('support of tabletop center required and fall-through/unsupported remain blocked',()=>{
 const desk={min:{x:11.45,z:-34.4},max:{x:12.55,z:-33.6},top:.84};
 const onDesk=([x,z],height)=>x>=desk.min.x&&x<=desk.max.x&&
  z>=desk.min.z&&z<=desk.max.z&&Math.abs(height-desk.top)<.085;
 assert.ok(supportProbePointsV94({min:{x:10.8,z:-35.2},max:{x:13.2,z:-32.8}},
  {x:12,z:-34}).every(p=>onDesk(p,.84)));
 assert.ok(!supportProbePointsV94({min:{x:11,z:-35},max:{x:14,z:-33}},
  {x:13.7,z:-34}).every(p=>onDesk(p,.84)),'unanchored prop remains unsupported');
 assert.ok(!supportProbePointsV94({min:{x:11,z:-35},max:{x:14,z:-33}},
  {x:12,z:-34}).every(p=>onDesk(p,1.18)),'floating prop remains unsupported');
});
