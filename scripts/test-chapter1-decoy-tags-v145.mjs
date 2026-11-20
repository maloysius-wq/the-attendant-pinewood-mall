import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildGameplayLayoutV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {CHAPTER1_STEALTH_V139} from '../mall/chapter1-stealth-plan-v139.mjs';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';
import {DECOY_TAGS_V145,DECOY_TAG_DIMENSIONS_V145,planChapter1DecoyTagsV145}
 from '../mall/chapter1-decoy-tags-v145.mjs';

test('both notes sit directly beside the existing authentic G-floor decoys, no phantom placements',()=>{
 const layout=buildGameplayLayoutV70({chapter:1});
 const notes=planChapter1DecoyTagsV145(layout);
 assert.equal(notes.length,2);
 assert.deepEqual(notes.map(n=>n.label),['Noise Maker','Pager Decoy']);
 for(const note of notes){
  const source=CHAPTER1_STEALTH_V139.pickups.find(p=>p.label===note.label);
  const original=storyTargetV70({chapter:1,type:'decoy',label:note.label});
  assert.equal(original.canonical,true);
  assert.equal(note.room,source.room);
  assert.deepEqual(note.pickup,{x:original.x,z:original.z});
  assert.ok(note.range>.45&&note.range<.85);
  assert.equal(layout.roomAt(note.x,note.z),note.room);
  assert.equal(note.width,DECOY_TAG_DIMENSIONS_V145.width);
  assert.equal(note.height,DECOY_TAG_DIMENSIONS_V145.height);
  assert.ok(layout.canStand(note.x,note.z));
  assert.ok(shortestRouteV70(layout,layout.spawn,{x:note.x,z:note.z}).length>1);
  assert.equal(note.heading,DECOY_TAGS_V145[note.label].heading);
 }
});
test('paper never adds a world pickup, changes Q logic or creates network asset dependency',()=>{
 const code=readFileSync('mall/chapter1-decoy-tags-v145.js','utf8');
 assert.match(code,/originalInteract\.apply\(this,args\)/);
 assert.match(code,/originalReset\.apply\(this,args\)/);
 assert.match(code,/pickup\.userData\.collected/);
 assert.match(code,/mesh\.rotation\.x=-Math\.PI\/2/);
 assert.match(code,/new THREE\.PlaneGeometry\(site\.width,site\.height\)/);
 assert.doesNotMatch(code,/https?:\/\/|new Audio|world\.interactables\.push|world\.colliders\.push|makePickup\(|localStorage|indexedDB/);
 assert.doesNotMatch(code,/throwDecoy=function|\.decoys\s*\+\+|\.decoys\s*--/);
});
test('install after original chapter 1 controls, with later chapters untouched',()=>{
 const source=readFileSync('game.js','utf8');
 assert.match(source,/import \{installChapter1DecoyTagsV145\} from '.\/mall\/chapter1-decoy-tags-v145\.js';/);
 assert.match(source,/installChapter1AtmosphereV144\(args\.game\);\s*installChapter1DecoyTagsV145\(args\.game\);/);
 assert.match(source,/if\(args\.game\.levelIndex===0\)/);
});
