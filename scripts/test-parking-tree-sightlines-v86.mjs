import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {HumanCameraRig} from '../opening/camera-v65.js';
import {MALL_PLANTERS_V64,MALL_PLANTER_SCALE_V64} from '../opening/landscape-layout-v64.mjs';
import {PARKING_PROPS_V84} from '../opening/parking-layout-v84.mjs';

// Sightlines are measured from the ACTUAL authored opening camera rig, not
// a made-up fly-through. The real cinematic uses a 66-degree vertical lens.
const OUTSIDE_CUES=[
 {cue:'arrival',phase:.7},
 {cue:'owner',phase:.54},
 {cue:'owner',phase:.72},
 {cue:'owner',phase:.90},
 {cue:'entrance',phase:.02},
 {cue:'entrance',phase:.21},
 {cue:'entrance',phase:.40},
 {cue:'entrance',phase:.58},
 {cue:'entrance',phase:.82},
 {cue:'lights',phase:.20},
 {cue:'lights',phase:.40}
];
const walkPoints=[
 [-10.9,15],[-7.3,10],[-4,6.5],[-2,3.5],[-.3,1],
 [1.4,-1.5],[3,-4.5],[4.8,-7.6],[6,-10],
 [7.77,-12.62],[9.54,-15.24],[11.31,-17.85],[12.72,-19.94],
 [13.25,-20.73],[12,-21.05]
];
const distanceToSegment=(px,pz,a,b)=>{
 const vx=b[0]-a[0],vz=b[1]-a[1],denom=vx*vx+vz*vz;
 const t=Math.max(0,Math.min(1,((px-a[0])*vx+(pz-a[1])*vz)/denom));
 return Math.hypot(px-(a[0]+t*vx),pz-(a[1]+t*vz));
};
const pathClearance=(x,z)=>Math.min(...walkPoints.slice(1).map((b,i)=>distanceToSegment(x,z,walkPoints[i],b)));
const shots=OUTSIDE_CUES.map(({cue,phase})=>{
 const rig=new HumanCameraRig();
 const pose=rig.sample(cue,phase,1,1/60,{paused:true,reducedMotion:true});
 const camera=new THREE.PerspectiveCamera(66,16/9,.08,230);
 camera.position.copy(pose.position);
 camera.lookAt(pose.lookAt);
 camera.updateMatrixWorld(true,false);
 camera.updateProjectionMatrix();
 return {cue,phase,eye:camera.position.toArray().map(x=>+x.toFixed(2)),camera};
});
const visible=(tree,shot)=>{
 const root=tree.y??0,height=tree.targetHeight;
 const foot=new THREE.Vector3(tree.x,root,tree.z).project(shot.camera);
 const canopy=new THREE.Vector3(tree.x,root+height*.68,tree.z).project(shot.camera);
 const depth=foot.z>-1&&foot.z<1&&canopy.z>-1&&canopy.z<1;
 const horizontallyInside=Math.abs(canopy.x)<.9;
 const verticallyInside=Math.min(foot.y,canopy.y)<.98&&Math.max(foot.y,canopy.y)>-.98;
 return depth&&horizontallyInside&&verticallyInside;
};

test('three leafless source trees are rooted in approved existing frontage planters',()=>{
 const planted=PARKING_PROPS_V84.filter(p=>p.planterIndex!==undefined);
 assert.equal(planted.length,3,'three trees are moved into the camera-facing landscaped frontage');
 assert.equal(new Set(planted.map(p=>p.planterIndex)).size,3);
 for(const tree of planted){
  const planter=MALL_PLANTERS_V64[tree.planterIndex];
  assert.ok(planter,'real existing planter must exist');
  assert.equal(tree.x,planter.x);
  assert.equal(tree.z,planter.z);
  assert.equal(tree.y,.55*MALL_PLANTER_SCALE_V64,'tree root starts at actual sourced planter soil');
  assert.ok(tree.assetId.startsWith('cc0-dead-tree-'));
  assert.ok(pathClearance(tree.x,tree.z)>5,'tree trunk must not block contractor route: '+tree.id);
 }
 const background=PARKING_PROPS_V84.filter(p=>p.assetId.startsWith('cc0-dead-tree-')&&p.planterIndex===undefined);
 assert.equal(background.length,1,'one distant dead tree remains for background/Builder scale');
});

test('real opening camera captures dead-tree silhouettes during arrival and exterior approach',()=>{
 const planted=PARKING_PROPS_V84.filter(p=>p.planterIndex!==undefined);
 const hits=planted.map(tree=>{
  const views=shots.filter(shot=>visible(tree,shot)).map(shot=>shot.cue+':'+shot.phase);
  return {id:tree.id,x:tree.x,z:tree.z,views};
 });
 console.log('PINEWOOD_DEAD_TREE_SIGHTLINES_V86 '+JSON.stringify(hits));
 assert.ok(hits.every(t=>t.views.length>=2),'every relocated tree should appear in multiple authored camera poses');
 assert.ok(hits.some(t=>t.views.some(v=>v.startsWith('arrival:'))),'at least one dead tree framed from the parked sedan windshield');
 assert.ok(hits.some(t=>t.views.some(v=>v.startsWith('owner:'))),'at least one bare silhouette framed during the car exit');
 assert.ok(hits.some(t=>t.views.some(v=>v.startsWith('entrance:'))),'at least one bare silhouette visible while approaching the mall');
});
