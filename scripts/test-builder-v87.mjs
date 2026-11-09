import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {MALL} from '../mall/masterplan-v66.mjs';
import {ROOM_FINISHES_V87} from '../builder/room-finishes-options-v87.mjs';
import {createEmptyDraft,reduceDraft,validateDraft,importDraft,exportDraft} from '../mall/editor-schema-v1.mjs';
import {EDITOR_CATALOG_V1,registerVendorCatalog} from '../mall/editor-catalog-v1.mjs';

const era=JSON.parse(fs.readFileSync('assets/vendor/builder/era-catalog-v87.json','utf8'));
const finish=JSON.parse(fs.readFileSync('assets/vendor/builder/finishes/manifest-v87.json','utf8'));
test('eight locally pinned 1990s electronics and abandoned-mall debris assets have actual GLB content',()=>{
 assert.equal(era.version,87);assert.equal(era.models.length,8);
 assert.equal(new Set(era.models.map(x=>x.id)).size,8);
 assert.deepEqual(era.models.filter(x=>/tower|crt/.test(x.id)).map(x=>x.id).sort(),
  ['old-pc-compact-tower','old-pc-tower','retro-crt-pc-1990s'].sort());
 for(const m of era.models){
  assert.match(m.path,/^assets\/vendor\/builder\/models\/era-v87\/[a-z0-9-]+\.glb$/);
  const b=fs.readFileSync(m.path);
  assert.equal(b.subarray(0,4).toString(),'glTF',m.id+' must actually be a GLB');
  assert.equal(b.length,m.bytes);
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'),m.sha256);
  assert.ok(m.license==='CC0-1.0'||(m.id==='retro-crt-pc-1990s'&&m.license==='CC-BY-4.0'));
  assert.match(m.sourcePage,/^https:\/\//);
  assert.ok(m.targetHeight>0&&m.radius>0);
 }
 assert.equal(era.models.filter(x=>x.category==='Rubble, Dirt & Garbage').length,5);
 const add=registerVendorCatalog(era.models);
 assert.equal(add.length,8);
 assert.equal(add.find(x=>x.id==='retro-crt-pc-1990s').originalAuthor,'MadeByYeshe (CrazyDrPants)');
});
test('six pinned CC0 wall/floor maps are real JPEGs, referenced locally by declared finishes',()=>{
 assert.equal(finish.version,87);assert.equal(finish.finishes.length,6);
 const included=new Set(Object.values(ROOM_FINISHES_V87).flatMap(x=>x.map(y=>y.path)).filter(Boolean));
 for(const f of finish.finishes){
  const b=fs.readFileSync(f.path);
  assert.equal(b.length,f.bytes);
  assert.equal(b[0],0xff);assert.equal(b[1],0xd8);
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'),f.sha256);
  assert.equal(f.license,'CC0-1.0');
  assert.ok(included.has(f.path),'new locally bundled texture must be usable: '+f.id);
 }
 assert.equal(ROOM_FINISHES_V87.wall[0].id,'original');
 assert.equal(ROOM_FINISHES_V87.floor[0].id,'original');
 assert.equal(ROOM_FINISHES_V87.ceiling[0].id,'original');
 for(const [part,opts] of Object.entries(ROOM_FINISHES_V87)){
  assert.ok(opts.length>=3);
  for(const item of opts)if(item.path)assert.ok(fs.existsSync(item.path),part+'/'+item.id);
 }
});
test('per-room surfaces preserve v1 JSON and undo semantics without painting neighboring rooms',()=>{
 const id='security',other=MALL.rooms.find(x=>x.id!==id).id;
 let draft=createEmptyDraft();
 assert.deepEqual(draft.surfaces,{});
 draft=reduceDraft(draft,{type:'finishes',roomId:id,finishes:{
  wall:'worn-plaster',floor:'dirty-carpet',ceiling:'acoustic'
 }});
 assert.deepEqual(draft.surfaces[id],{wall:'worn-plaster',floor:'dirty-carpet',ceiling:'acoustic'});
 assert.equal(draft.surfaces[other],undefined);
 draft=reduceDraft(draft,{type:'finish',roomId:id,part:'wall',finishId:'original'});
 assert.equal(draft.surfaces[id].wall,undefined);
 const compatible=[...EDITOR_CATALOG_V1,...era.models];
 assert.deepEqual(validateDraft(draft,compatible),[]);
 assert.deepEqual(importDraft(exportDraft(draft),compatible),draft);
 assert.deepEqual(importDraft(JSON.stringify({
  version:1,baseMapVersion:69,added:[],overrides:{},deleted:[],doors:{}
 }),compatible).surfaces,undefined,'old exports remain valid');
 for(const malicious of [
  {...draft,surfaces:{not_a_room:{floor:'dirty-carpet'}}},
  {...draft,surfaces:{[id]:{ceiling:'unverified-remote.png'}}},
  {...draft,surfaces:{[id]:{wall:'dirty-carpet'}}},
  {...draft,surfaces:{[id]:{floor:'../../remote.png'}}}
 ])assert.ok(validateDraft(malicious,compatible).length>0);
 assert.throws(()=>reduceDraft(draft,{type:'finishes',roomId:'not_a_room',finishes:{wall:'concrete'}}));
});
test('old LCD is not a new placement choice, but remains a valid saved ID and aliases to CRT',()=>{
 const original=JSON.parse(fs.readFileSync('assets/vendor/builder/catalog-v1.json','utf8'));
 const old=original.models.find(x=>x.id==='kenney-furniture-kit-computerscreen');
 assert.ok(old,'old LCD source path retained for previously saved user layouts');
 const runtime=fs.readFileSync('builder/main.js','utf8');
 const renderer=fs.readFileSync('builder/editor-scene.js','utf8');
 assert.match(runtime,/if\(item\.id==='kenney-furniture-kit-computerscreen'\)continue/);
 assert.match(renderer,/id==='kenney-furniture-kit-computerscreen'\?'retro-crt-pc-1990s':id/);
});
