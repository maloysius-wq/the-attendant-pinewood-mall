import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three/build/three.module.js';
import {buildGameplayLayoutV70} from '../mall/gameplay-layout-v70.mjs';
import {planChapter1DecoyTagsV145} from '../mall/chapter1-decoy-tags-v145.mjs';
import {installChapter1DecoyTagsV145} from '../mall/chapter1-decoy-tags-v145.js';

test('actual original order world.clear -> resetState must NOT rebind stale decoy pickup meshes',()=>{
 const layout=buildGameplayLayoutV70({chapter:1});
 const sites=planChapter1DecoyTagsV145(layout);
 assert.deepEqual(sites.map(x=>x.label),['Noise Maker','Pager Decoy']);
 const mkPickup=(site)=>{
  const pickup=new THREE.Group();
  pickup.position.set(site.pickup.x,.16,site.pickup.z);
  pickup.userData={type:'decoy',label:site.label,collected:false};
  return pickup;
 };
 const game={
  levelIndex:0,
  mallV70:{group:new THREE.Group()},
  mallLayoutV70:layout,
  world:{interactables:[]},
  __chapter1StealthV139:{version:139},
  interact(){},
  resetState(){this.world.interactables=[];this.decoys=0;}
 };
 for(const site of sites){
  const p=mkPickup(site);game.mallV70.group.add(p);game.world.interactables.push(p);
 }
 const originalGroup=game.mallV70.group;
 const api=installChapter1DecoyTagsV145(game);
 assert.equal(api.version,145,'real source V145 tags must install');
 // This duplicates the immutable source Game.startChapter order: clear scene
 // and all original interactables first, reset SECOND. The old implementation
 // called bind() inside resetState and throws here because pickups don't exist.
 game.world.interactables=[];originalGroup.clear();
 assert.doesNotThrow(()=>game.resetState(),'do not query original E meshes during reset');
 assert.equal(game.decoys,0);
 // Original full scene builder creates new authorized E pickup objects and a
 // new authored V70 group before the bridge gets called again.
 game.mallV70.group=new THREE.Group();
 for(const site of sites){
  const p=mkPickup(site);
  game.mallV70.group.add(p);
  game.world.interactables.push(p);
 }
 assert.doesNotThrow(()=>installChapter1DecoyTagsV145(game),
  'bind only when the source builder has restored both genuine pickups');
 assert.equal(game.world.interactables.length,2);
 assert.ok(game.world.interactables.every(p=>p.userData.type==='decoy'&&!!p.parent));
});
test('source-on-reset disposes only old paper; existing real first-person E/Q controls stay untouched',()=>{
 const code=readFileSync('mall/chapter1-decoy-tags-v145.js','utf8');
 const reset=code.slice(code.indexOf(' const originalReset=game.resetState;'),code.indexOf(' const getState=()=>'));
 assert.match(reset,/originalReset\.apply\(this,args\)/);
 assert.match(reset,/dispose\(\);/);
 assert.doesNotMatch(reset,/\bif\(this\.levelIndex===0\)bind\(\)/);
 assert.match(code,/if\(game\.__chapter1DecoyTagsV145\)\{\s*game\.__chapter1DecoyTagsV145\.bind\(\)/,
  'original V70 reinstallation still rebonds source E pickup notes');
 assert.match(code,/originalInteract\.apply\(this,args\)/);
 assert.doesNotMatch(code,/world\.interactables\.push|world\.colliders\.push|new Audio|https?:\/\/|localStorage|indexedDB/);
});
