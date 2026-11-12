import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {createEmptyDraft} from '../mall/editor-schema-v1.mjs';
import {selectSceneLayoutV111,loadActiveSceneLayoutV111,validateSceneLayoutV111}
 from '../mall/scene-layout-v111.mjs';
import {buildGameplayLayoutV70} from '../mall/gameplay-layout-v70.mjs';
import {applyAuthoredCollidersV111} from '../mall/authored-colliders-v111.mjs';
import {MALL} from '../mall/masterplan-v66.mjs';

const catalog=[{id:'test-pinned-model',kind:'model'}];
const authoredDraft=()=>{
 const draft=createEmptyDraft();
 draft.added.push({id:'local-trash',catalogId:'test-pinned-model',
  position:{x:14,y:0,z:-31},rotation:{x:0,y:Math.PI/2,z:0},scale:1.25});
 draft.surfaces.service_vestibule={wall:'painted-wall'};
 draft.mallWallFinish='painted-wall';
 return draft;
};

test('public film/game ignores browser changes without explicit Builder preview flag',()=>{
 const published=createEmptyDraft(),privateDraft=authoredDraft();
 const selected=selectSceneLayoutV111({preview:false,published,local:privateDraft,catalog});
 assert.equal(selected.source,'published');
 assert.equal(selected.draft.added.length,0);
 assert.equal(selected.draft.mallWallFinish,undefined);
 assert.equal(privateDraft.added.length,1,'Local author changes remain untouched');
});
test('explicit same-origin preview uses saved Builder positions and wall finishes without mutation',()=>{
 const published=createEmptyDraft(),local=authoredDraft();
 const selected=selectSceneLayoutV111({preview:true,published,local,catalog});
 assert.equal(selected.source,'browser-preview');
 assert.equal(selected.draft.added[0].position.z,-31);
 assert.equal(selected.draft.added[0].rotation.y,Math.PI/2);
 assert.equal(selected.draft.added[0].scale,1.25);
 assert.equal(selected.draft.mallWallFinish,'painted-wall');
 assert.equal(selected.draft.surfaces.service_vestibule.wall,'painted-wall');
 selected.draft.added[0].scale=2;
 assert.equal(local.added[0].scale,1.25,'Preview may not edit browser save');
});
test('published default is versioned original layout, and preview never fetches public file',async()=>{
 const published=createEmptyDraft(),local=authoredDraft();
 let fetchCount=0,readCount=0;
 const fetchImpl=async url=>{fetchCount++;assert.match(url,/\/assets\/world\/published-layout-v111\.json$/);
  return {ok:true,json:async()=>published};};
 const localRead=async()=>{readCount++;return local;};
 const normal=await loadActiveSceneLayoutV111({catalog,preview:false,fetchImpl,localRead});
 assert.equal(normal.source,'published');assert.equal(fetchCount,1);assert.equal(readCount,0);
 const preview=await loadActiveSceneLayoutV111({catalog,preview:true,fetchImpl,localRead});
 assert.equal(preview.source,'browser-preview');assert.equal(fetchCount,1);assert.equal(readCount,1);
 assert.equal(preview.draft.added[0].id,'local-trash');
});
test('unsupported or malformed layout cannot enter published film/game',()=>{
 const draft=authoredDraft();
 draft.added[0].catalogId='https://external.example/model.glb';
 assert.throws(()=>validateSceneLayoutV111(draft,catalog),/Unknown\/unlicensed catalog/);
 const malformed=authoredDraft();malformed.baseMapVersion=999;
 assert.throws(()=>validateSceneLayoutV111(malformed,catalog),/Wrong canonical mall base/);
 const unsafe=authoredDraft();unsafe.added[0].position.x=Number.POSITIVE_INFINITY;
 assert.throws(()=>validateSceneLayoutV111(unsafe,catalog),/Invalid placed transform/);
});
test('authored solid collision is integrated with physical navigation but never blocks scripted spawn',()=>{
 const layout=buildGameplayLayoutV70({chapter:1});
 const original=layout.colliders.length;
 const fake={draft:{deleted:[],overrides:{}},baseline:new Map(),
  collidersForLevel:level=>{
   assert.equal(level,'G');
   return [
    {id:'authored_wallbox',kind:'authored-furnishing',minX:12,maxX:14,minZ:-26,maxZ:-25},
    {id:'authored_trash',kind:'authored-furnishing',minX:13.5,maxX:14.4,minZ:-32,maxZ:-30.9}
   ];
  }
 };
 const oldColliders=layout.colliders;
 assert.equal(applyAuthoredCollidersV111(layout,fake),layout);
 assert.equal(layout.colliders,oldColliders,'World collision array must retain closure identity');
 assert.equal(layout.colliders.length,original+1,'Do not obstruct cinematic/service-vestibule spawn');
 assert.ok(layout.colliders.some(x=>x.id==='authored_trash'));
 assert.ok(!layout.colliders.some(x=>x.id==='authored_wallbox'));
 assert.equal(layout.canStand(14,-31.5),false,'Real authored object blocks passage');
});
test('layout preserves original physical shell and story positions across all six chapters',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const layout=buildGameplayLayoutV70({chapter});
  assert.equal(layout.rooms.length,MALL.rooms.filter(r=>r.level===layout.level).length);
  assert.ok(layout.colliders.length>0,'Every campaign floor retains real physical collision');
  assert.ok(layout.shell.walls.length>0,'Canonical physical wall geometry remains intact');
 }
});
