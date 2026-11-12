import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateDecayV105,registerDecayV105} from '../builder/decay-catalog-v105.mjs';
import {createEmptyDraft,reduceDraft,validateDraft,importDraft,exportDraft} from '../mall/editor-schema-v1.mjs';

const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/decay-v105/manifest-v105.json'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const {models,posters,decals}=validateDecayV105(manifest);
const all=[...models,...posters,...decals];
test('independent poster source images, heavy floor/wall grime and PBR trash are pinned byte-for-byte',()=>{
 assert.equal(models.length,2);assert.equal(posters.length,10);assert.equal(decals.length,8);
 assert.equal(new Set(posters.map(p=>p.sourceId)).size,10);
 assert.equal(new Set(posters.map(p=>p.sha256)).size,10);
 for(const src of manifest.sources){
  const bytes=fs.readFileSync(src.path);
  assert.equal(bytes.length,src.bytes,src.id);
  assert.equal(hash(bytes),src.sha256,src.id);
 }
 for(const item of all){
  const bytes=fs.readFileSync(item.path);
  assert.equal(bytes.length,item.bytes,item.id);
  assert.equal(hash(bytes),item.sha256,item.id);
  if(item.kind==='surface-decal'){
   assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
   assert.equal(bytes[25],6,'must be RGBA with genuinely transparent edge');
  }else{
   assert.equal(bytes.toString('ascii',0,4),'glTF');
   assert.equal(bytes.readUInt32LE(8),bytes.length);
   const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
   assert.ok(gltf.meshes?.length&&gltf.images?.length&&gltf.materials?.length,'real mapped third-party source meshes');
  }
 }
});
test('all 20 new IDs register without modifying existing old schema',()=>{
 const index=new Map(),catalog=[];
 assert.deepEqual(registerDecayV105(manifest,catalog,index),{models:2,heavyDecals:8,independentPosters:10});
 assert.equal(catalog.length,20);
 assert.equal(new Set(catalog.map(x=>x.id)).size,20);
 let d=createEmptyDraft();
 d=reduceDraft(d,{type:'place',instance:{
  id:'source-trash',catalogId:models[0].id,position:{x:0,y:1,z:0},rotation:{x:0,y:0,z:0},scale:1}});
 d=reduceDraft(d,{type:'place',instance:{
  id:'source-advert',catalogId:posters[1].id,position:{x:0,y:2,z:0},
  rotation:{x:0,y:0,z:0},scale:1,opacity:.94}});
 d=reduceDraft(d,{type:'place',instance:{
  id:'source-grime',catalogId:decals[0].id,position:{x:0,y:0,z:0},
  rotation:{x:0,y:0,z:0},scale:1,opacity:1}});
 assert.deepEqual(validateDraft(d,catalog),[]);
 assert.deepEqual(importDraft(exportDraft(d),catalog),d);
});
test('common gallery finish persists, resets, reverts, and rejects invalid sources',()=>{
 let d=createEmptyDraft();
 assert.equal(d.mallWallFinish,undefined,'old exported layouts unchanged');
 d=reduceDraft(d,{type:'mall-walls',finishId:'worn-plaster'});
 assert.equal(d.mallWallFinish,'worn-plaster');
 d=reduceDraft(d,{type:'finishes',roomId:'service_vestibule',
  finishes:{wall:'original'}});
 assert.deepEqual(validateDraft(d,[]),[]);
 assert.equal(importDraft(exportDraft(d),[]).mallWallFinish,'worn-plaster');
 assert.ok(validateDraft({...d,mallWallFinish:'remote://wall.jpg'},[]).length);
 assert.throws(()=>reduceDraft(d,{type:'mall-walls',finishId:'remote-wall'}));
 d=reduceDraft(d,{type:'mall-walls',finishId:'original'});
 assert.equal(Object.hasOwn(d,'mallWallFinish'),false);
});
test('individual gallery Original walls override a shared finish while Inherit follows it',()=>{
 let d=reduceDraft(createEmptyDraft(),{type:'mall-walls',finishId:'worn-plaster'});
 d=reduceDraft(d,{type:'finishes',roomId:'west_gallery',finishes:{wall:'original',floor:'dirty-carpet'}});
 assert.equal(d.surfaces.west_gallery.wall,'original','explicit indoor original must persist');
 assert.equal(d.surfaces.west_gallery.floor,'dirty-carpet');
 assert.deepEqual(validateDraft(d,[]),[]);
 assert.deepEqual(importDraft(exportDraft(d),[]),d);
 d=reduceDraft(d,{type:'mall-walls',finishId:'painted-wall'});
 assert.equal(d.surfaces.west_gallery.wall,'original','gallery change must not remove room override');
 d=reduceDraft(d,{type:'finishes',roomId:'west_gallery',finishes:{wall:'inherit'}});
 assert.equal(d.surfaces.west_gallery.wall,undefined,'inherit must not be serialized as a material');
 assert.equal(d.surfaces.west_gallery.floor,'dirty-carpet','other surfaces must survive');
 d=reduceDraft(d,{type:'finish',roomId:'central_gallery',part:'wall',finishId:'original'});
 assert.equal(d.surfaces.central_gallery.wall,'original','single-finish action also preserves override');
 d=reduceDraft(d,{type:'finish',roomId:'central_gallery',part:'wall',finishId:'inherit'});
 assert.equal(d.surfaces.central_gallery,undefined);
 assert.throws(()=>reduceDraft(d,{type:'finishes',roomId:'security',finishes:{wall:'inherit'}}),
  /Unsupported room finish/,'inherit is only valid for canonical shared spaces');
 assert.throws(()=>reduceDraft(d,{type:'finish',roomId:'security',part:'wall',finishId:'inherit'}),
  /Unsupported room finish/);
 assert.ok(validateDraft({...d,surfaces:{west_gallery:{wall:'inherit'}}},[]).length,
  'UI-only inherit must never be accepted from imported JSON');
});

test('bulletin board is discoverable and existing original GLB remains unmodified',()=>{
 const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/wall-decay-v100/manifest-v100.json'));
 const board=manifest.models.find(x=>x.id==='v100-aged-cork-bulletin-board');
 assert.ok(board.label.startsWith('BULLETIN BOARD'));
 assert.equal(board.category,'Bulletin Boards & Noticeboards');
 assert.equal(board.mountSurface,'wall');
 assert.ok(board.targetHeight>=.8);
 assert.equal(hash(fs.readFileSync(board.path)),board.sourceSHA256);
});
test('facilities annual calendar pins newly generated 1997-only artwork',()=>{
 const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/mood-v101/manifest-v101.json'));
 const p=manifest.calendars.find(x=>x.id==='mood-v101-calendar-facilities-year-planner');
 assert.ok(p.derivation.includes('no original photo pixels'));
 const b=fs.readFileSync(p.path);
 assert.equal(hash(b),p.sha256);assert.equal(b.length,p.bytes);
 assert.equal(p.year,1997);
});
