import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {buildGameplayLayoutV70} from '../mall/gameplay-layout-v70.mjs';
import {PANEL_MOUNTS_V141,mountedPanelSitesV141} from '../mall/chapter1-wall-panels-v141.mjs';
import {CHAPTER1_NOTICES_V144,CHAPTER1_SOUNDS_V144,planChapter1NoticesV144}
 from '../mall/chapter1-atmosphere-v144.mjs';
test('three original full-height structural walls support physical notices',()=>{
 const layout=buildGameplayLayoutV70({chapter:1});
 const source=mountedPanelSitesV141(layout);
 assert.deepEqual(source.errors,[]);
 const signs=planChapter1NoticesV144(layout);
 assert.deepEqual(signs.map(s=>s.breaker),['A','B','C']);
 assert.deepEqual(signs.map(s=>s.id),['sound','sight','breath']);
 for(const s of signs){
  const site=source.panels.find(x=>x.id===s.breaker),m=PANEL_MOUNTS_V141[s.breaker];
  assert.equal(s.wallId,site.wall.id);
  assert.equal(s.y,layout.y+1.68);
  assert.equal(s.yaw,m.yaw);
  assert.ok(s.distanceToPanel>.7&&s.distanceToPanel<1.2);
  const along=m.axis==='x'?s.z:s.x,front=m.axis==='x'?s.x:s.z;
  assert.ok(along>site.wall.start+s.width/2&&along<site.wall.end-s.width/2);
  assert.ok(Math.abs(front-site.wallFace-m.normal*.016)<1e-5);
  assert.equal(site.wall.bottom,0);
  assert.ok(site.wall.top>=2.1);
  assert.ok(!['glass','storefront-glass'].includes(site.wall.role));
  assert.equal(CHAPTER1_NOTICES_V144[s.breaker].lines.length,3);
 }
});
test('genuine local CC0 sounds and no new physical or remote game systems',()=>{
 for(const file of Object.values(CHAPTER1_SOUNDS_V144)){
  assert.match(file,/^[a-z0-9-]+\.ogg$/);
  assert.ok(existsSync('assets/audio/cc0/'+file),'missing pinned sound '+file);
  assert.ok(readFileSync('assets/audio/cc0/'+file).length>1000);
 }
 const source=readFileSync('mall/chapter1-atmosphere-v144.js','utf8');
 assert.match(source,/new URL\('\.\.\/assets\/audio\/cc0\/'/);
 assert.doesNotMatch(source,/https?:\/\/|new THREE\.BoxGeometry|new THREE\.CylinderGeometry/);
 assert.doesNotMatch(source,/world\.interactables\.push|world\.colliders\.push|localStorage|indexedDB/);
 assert.match(source,/firstSighting/);assert.match(source,/firstHunt/);
});
test('game bridge installs the physical cue layer only after original V141 and V143',()=>{
 const game=readFileSync('game.js','utf8');
 assert.match(game,/import \{installChapter1AtmosphereV144\} from '.\/mall\/chapter1-atmosphere-v144\.js';/);
 assert.match(game,/installChapter1TraversalV143\(args\.game\);\s*installChapter1AtmosphereV144\(args\.game\);/);
 assert.match(game,/if\(args\.game\.levelIndex===0\)/);
});
