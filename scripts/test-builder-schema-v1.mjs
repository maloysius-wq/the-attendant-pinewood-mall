import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {EDITOR_CATALOG_V1} from '../mall/editor-catalog-v1.mjs';
import {createEmptyDraft,validateDraft,reduceDraft,exportDraft,importDraft} from '../mall/editor-schema-v1.mjs';

const pinned=JSON.parse(readFileSync(new URL('../assets/vendor/runtime/manifest.json',import.meta.url)));
const legal=new Set(Object.values(pinned.assets).map(a=>a.local.replace(/^\.\//,'')));
const item=EDITOR_CATALOG_V1[0];
const sample=(id='custom-001')=>({
 id,catalogId:item.id,
 position:{x:0,y:0,z:-70},rotation:{x:0,y:0,z:0},scale:1
});

test('starter catalog offers pinned CC0 GLB models, excluding banned shelves',()=>{
 assert.ok(EDITOR_CATALOG_V1.length>=10);
 assert.equal(new Set(EDITOR_CATALOG_V1.map(i=>i.id)).size,EDITOR_CATALOG_V1.length);
 for(const i of EDITOR_CATALOG_V1){
  assert.ok(legal.has(i.path),i.path+' must be locally vendored');
  assert.match(i.path,/^assets\/vendor\/runtime\/[^/]+\/[^?#]+\.glb$/);
  assert.doesNotMatch(i.path,/ShelfLarge|ShelfSmall|Shelf%20Large|Shelf%20Small/i);
  assert.ok(i.label&&i.category&&i.id);
 }
});

test('createEmptyDraft gives a deterministic, v69-based portable layout',()=>{
 assert.deepEqual(createEmptyDraft(),{
  version:1,baseMapVersion:69,added:[],overrides:{},deleted:[],doors:{},surfaces:{}
 });
});

test('placing and moving a model preserves immutable snapshots',()=>{
 const original=createEmptyDraft();
 const placed=reduceDraft(original,{type:'place',instance:sample()});
 const moved=reduceDraft(placed,{type:'transform',id:'custom-001',position:{x:1,y:0,z:-71},scale:1.5});
 assert.equal(original.added.length,0);
 assert.equal(placed.added[0].position.x,0);
 assert.equal(moved.added[0].position.x,1);
 assert.equal(moved.added[0].scale,1.5);
 assert.equal(placed.added[0].scale,1);
 assert.deepEqual(validateDraft(moved,EDITOR_CATALOG_V1),[]);
});

test('legacy overrides and deletions survive JSON export and import',()=>{
 const legacy=FURNISHINGS_V69.fixtures[0].id;
 const first=reduceDraft(createEmptyDraft(),{type:'transform',id:legacy,position:{x:-39,y:0,z:-80}});
 const second=reduceDraft(first,{type:'delete',id:legacy});
 const third=reduceDraft(second,{type:'place',instance:sample()});
 assert.deepEqual(importDraft(exportDraft(third),EDITOR_CATALOG_V1),third);
 assert.equal(second.deleted.includes(legacy),true);
 assert.deepEqual(second.overrides[legacy].position,{x:-39,y:0,z:-80});
 assert.equal(first.deleted.length,0);
});

test('a deleted legacy fixture can be restored without losing canonical fixture identity',()=>{
 const id=FURNISHINGS_V69.fixtures[0].id;
 const gone=reduceDraft(createEmptyDraft(),{type:'delete',id});
 const back=reduceDraft(gone,{type:'restore',id});
 assert.equal(gone.deleted.includes(id),true);
 assert.deepEqual(back.deleted,[]);
});

test('rejects malformed, duplicate, nonfinite, unknown model and unsafe baseline edits',()=>{
 const valid=reduceDraft(createEmptyDraft(),{type:'place',instance:sample()});
 const invalid=[
  {...valid,added:[sample(),sample()]},
  {...valid,added:[{...sample(),catalogId:'fake-remote-model'}]},
  {...valid,added:[{...sample(),position:{x:Infinity,y:0,z:0}}]},
  {...valid,added:[{...sample(),scale:0}]},
  {...valid,overrides:{'floor_G':{position:{x:1,y:0,z:1}}}},
  {...valid,deleted:['unknown-story-anchor']},
  {...valid,version:99}
 ];
 for(const d of invalid){
  assert.ok(validateDraft(d,EDITOR_CATALOG_V1).length>0,JSON.stringify(d));
  assert.throws(()=>importDraft(JSON.stringify(d),EDITOR_CATALOG_V1));
 }
 assert.throws(()=>importDraft('{not valid',EDITOR_CATALOG_V1));
});

test('editor imports cannot change the caller-owned existing layout',()=>{
 const original=reduceDraft(createEmptyDraft(),{type:'place',instance:sample()});
 const text=exportDraft({...original,added:[{...sample(),scale:-1}]});
 assert.throws(()=>importDraft(text,EDITOR_CATALOG_V1));
 assert.equal(original.added[0].scale,1);
});
