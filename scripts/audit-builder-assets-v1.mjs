import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const file='assets/vendor/builder/catalog-v1.json';
const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
test('builder ships a broad selection of real individually pinned CC0 meshes',()=>{
 assert.ok(catalog.models.length>=100,'need at least 100 distinct binary models');
 const ids=new Set(),paths=new Set(),categories=new Set();
 for(const m of catalog.models){
  assert.match(m.id,/^[a-z0-9_-]+$/);
  assert.ok(!ids.has(m.id),'duplicate '+m.id);ids.add(m.id);
  assert.match(m.path,/^assets\/vendor\/builder\/models\/[\w/-]+\.glb$/);
  assert.ok(!paths.has(m.path),'duplicate binary '+m.path);paths.add(m.path);
  assert.equal(m.license,'CC0-1.0');
  assert.match(m.licenseUrl,/^https:\/\//);
  assert.match(m.sourceUrl,/^https:\/\//);
  assert.match(m.sha256,/^[a-f0-9]{64}$/);
  assert.ok(m.bytes>128,'empty mesh '+m.path);
  assert.ok(m.category.length>2);categories.add(m.category);
  assert.ok(m.targetHeight>0&&m.radius>0,'missing fitting bounds '+m.id);
  assert.ok(!/cassetteShelfLarge|cassetteShelfSmall|ShelfLarge|ShelfSmall|Shelf%20Large|Shelf%20Small/i.test(JSON.stringify(m)));
  const bytes=fs.readFileSync(m.path);
  assert.equal(bytes.length,m.bytes,'byte length '+m.id);
  assert.equal(bytes.subarray(0,4).toString(),'glTF','valid GLB signature '+m.id);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),m.sha256,'hash '+m.id);
  if(m.thumb){
   assert.match(m.thumb,/^assets\/vendor\/builder\/thumbs\/[\w/-]+\.webp$/);
   assert.ok(fs.statSync(m.thumb).size>100,'missing thumbnail '+m.id);
  }
 }
 assert.ok(categories.size>=6,'broad enough categories');
 assert.ok(catalog.models.some(m=>/computer.*keyboard|keyboard/i.test(m.label)),'keyboard');
 assert.ok(catalog.models.some(m=>/computer.*screen|crt|monitor/i.test(m.label)),'screen');
 assert.ok(catalog.models.some(m=>/bench.*damaged/i.test(m.label)),'damaged bench');
 assert.ok(catalog.models.some(m=>/tree.*(dark|fall)|pine.*fall/i.test(m.label)),'neglected tree');
 assert.ok(catalog.models.some(m=>/fountain/i.test(m.label)),'physical fountain mesh');
 assert.ok(catalog.models.some(m=>/christmas|garland|snowman|wreath|holiday/i.test(m.label)),'holiday decor');
 console.log('PINEWOOD_BUILDER_CC0_ASSET_AUDIT_PASS',JSON.stringify({count:catalog.models.length,categories:categories.size}));
});
