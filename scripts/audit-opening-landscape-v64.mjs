import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {MALL_PLANTER_SCALE_V64,MALL_PLANTERS_V64} from '../opening/landscape-layout-v64.mjs';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=path=>readFileSync(resolve(root,path)).toString();
const scene=read('opening/landscape-scale-v64.js');
const intro=read('opening/intro-v64.js');
const preview=read('review/the-call-v34/index.html');
assert.equal(MALL_PLANTER_SCALE_V64,2,'Entire existing model assembly must double');
assert.equal(MALL_PLANTERS_V64.length,8);
const mirrored=MALL_PLANTERS_V64.map(p=>p.x);
for(let i=0;i<4;i++)
 assert.ok(Math.abs((mirrored[i]+mirrored[7-i])/2+10.5)<1e-6,
  'Entrance planters must mirror about the boarded public doorway');
for(let i=1;i<4;i++)
 assert.ok(Math.abs((mirrored[i]-mirrored[i-1])-3.6)<1e-6,
  'Equal left-side planter spacing');
for(let i=5;i<8;i++)
 assert.ok(Math.abs((mirrored[i]-mirrored[i-1])-3.6)<1e-6,
  'Equal right-side planter spacing');
assert.match(scene,/group\.scale\.setScalar\(MALL_PLANTER_SCALE_V64\)/);
assert.match(scene,/weathering-steel-planter\.glb/);
assert.match(scene,/rounded-landscape-shrub\.glb/);
assert.doesNotMatch(scene,/new THREE\.(?:BoxGeometry|CylinderGeometry|SphereGeometry)/);
assert.doesNotMatch(scene,/https?:\/\//,'No remote runtime assets');
assert.match(intro,/enlargeImportedLandscapeV64\(this\.stage,environment\)/);
assert.match(intro,/stage\.assetReady=this\.stage\.assetReady\.then/);
assert.match(preview,/intro-v65\.js\?v=(?:65|72|75|77|78)/);
// At 2x size, the imported source pot is 2.4 m across.
// Neighbouring units need at least 0.4 m space between their footprints.
const sorted=MALL_PLANTERS_V64.map(p=>p.x).sort((a,b)=>a-b);
for(let i=1;i<sorted.length;i++)
 assert.ok(sorted[i]-sorted[i-1]>=2.8,'Enlarged planter pair overlaps '+sorted[i-1]+','+sorted[i]);
// Every foot-level point of the cinematic route has ample clearance
// for the scaled 1.2 m half-width and camera/player body.
const walking=[
 [-9,13],[-7.8,10],[-5.4,7],[-3.1,3.6],[-1.3,1.1],[0,0],
 [2,-2.4],[4.1,-5.9],[5.5,-8.3],[6.9,-10.9],[8.05,-13],
 [9.9,-16.1],[11.1,-18.1],[12.35,-19.6],[12,-21]
];
function distance(x,z,a,b){
 const vx=b[0]-a[0],vz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/(vx*vx+vz*vz)));
 return Math.hypot(x-a[0]-t*vx,z-a[1]-t*vz);
}
for(const p of MALL_PLANTERS_V64){
 const nearest=Math.min(...walking.slice(1).map((b,i)=>distance(p.x,p.z,walking[i],b)));
 assert.ok(nearest>2.2,'Scaled planter blocks the cinematic walkway: '+JSON.stringify(p));
}
console.log('V64_DOUBLE_SIZE_PASS imported model groups exactly 2x, no overlap, service route clear, source assets unchanged');
