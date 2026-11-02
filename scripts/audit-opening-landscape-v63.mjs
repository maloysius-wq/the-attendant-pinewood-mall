import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {MALL_PLANTERS_V63} from '../opening/landscape-layout-v63.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=path=>readFileSync(resolve(root,path));
const manifest=JSON.parse(read('opening/assets/v63/manifest.json').toString());
assert.equal(manifest.license,'CC0-1.0');
assert.equal(manifest.assets.length,2);
for(const model of manifest.assets){
 const bytes=read('opening/assets/v63/'+model.file);
 assert.equal(bytes.length,model.bytes,model.file+' length');
 assert.equal(bytes.toString('ascii',0,4),'glTF',model.file+' GLB magic');
 assert.equal(bytes.readUInt32LE(8),bytes.length,model.file+' GLB declared length');
 const jsonBytes=bytes.subarray(20,20+bytes.readUInt32LE(12));
 const metadata=JSON.parse(jsonBytes.toString('utf8'));
 assert.match(metadata.asset?.copyright||'',/Innerscene Corp.*CC0 1\.0/);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),model.sha256,
  model.file+' source SHA256');
 assert.ok(metadata.meshes?.length>0,model.file+' must have actual imported meshes');
}
const scene=read('opening/scene.js').toString();
const intro63=read('opening/intro-v63.js').toString();
const intro62=read('opening/intro-v62.js').toString();
const imported=read('opening/landscape-v63.js').toString();
const preview=read('review/the-call-v34/index.html').toString();
assert.match(scene,/if\(!useImportedLandscape\).*for\(let i=0;i<7/);
assert.match(scene,/Promise\.all\(\[environmentReady,installMallPlantersV63\(world\)\]\)/);
assert.match(intro63,/makeOpeningScene\(\{useImportedLandscape:true\}\)/);
assert.doesNotMatch(intro62,/useImportedLandscape:true/);
assert.match(preview,/intro-v63\.js\?v=63/);
assert.match(imported,/GLTFLoader/);
assert.doesNotMatch(imported,/new THREE\.(?:BoxGeometry|CylinderGeometry|SphereGeometry)/);
assert.doesNotMatch(imported,/https?:\/\//,'No remote runtime assets');
const walking=[
 [-9,13],[-7.8,10],[-5.4,7],[-3.1,3.6],[-1.3,1.1],[0,0],
 [2,-2.4],[4.1,-5.9],[5.5,-8.3],[6.9,-10.9],[8.05,-13],
 [9.9,-16.1],[11.1,-18.1],[12.35,-19.6],[12,-21]
];
function distanceToSegment(x,z,a,b){
 const vx=b[0]-a[0],vz=b[1]-a[1],d=vx*vx+vz*vz;
 const t=Math.min(1,Math.max(0,((x-a[0])*vx+(z-a[1])*vz)/d));
 return Math.hypot(x-a[0]-t*vx,z-a[1]-t*vz);
}
assert.equal(MALL_PLANTERS_V63.length,8);
for(const p of MALL_PLANTERS_V63){
 const min=Math.min(...walking.slice(1).map((b,i)=>distanceToSegment(p.x,p.z,walking[i],b)));
 assert.ok(min>1.8,'Planter overlaps walking route at '+JSON.stringify(p)+': '+min);
 assert.ok(p.z>-21.8&&p.z<-15,'Planter must sit along the exterior facade');
}
console.log('V63_IMPORTED_LANDSCAPE_PASS two original CC0 GLBs verified, 8 imported planters, clear cinematic route, review-only isolation');
