import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateVestibuleManifestV98} from '../builder/vestibule-catalog-v98.mjs';

const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/vestibule-v98/manifest-v98.json','utf8'));
const models=validateVestibuleManifestV98(manifest).models;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const real=models.filter(m=>m.sourceProvider);
const originalGeneratedHashes={
 'vestibule-compact-forklift':'df0d28e264f584513a1764ad4b402a7a87db5e52af2125f1b14a3ff3f9d92aa1'
};
function inspectGLB(buffer,id){
 assert.equal(buffer.toString('ascii',0,4),'glTF',id);
 assert.equal(buffer.readUInt32LE(4),2,id);
 assert.equal(buffer.readUInt32LE(8),buffer.length,id);
 const jsonBytes=buffer.readUInt32LE(12);
 assert.equal(buffer.toString('ascii',16,20),'JSON',id);
 const doc=JSON.parse(buffer.subarray(20,20+jsonBytes).toString('utf8'));
 assert.ok(doc.scenes?.length&&doc.meshes?.length&&doc.nodes?.length,id+' source geometry actually available');
 assert.ok(doc.asset.version==='2.0');
 return doc;
}
test('all 10 original placeholder 3D model files are replaced by distinct actual vendor GLBs',()=>{
 assert.equal(manifest.version,98,'no saved manifest migration');
 assert.equal(models.length,19);
 assert.equal(models.filter(m=>m.license==='Original-Pinewood').length,0);
 assert.equal(models.filter(m=>m.license==='CC0-1.0').length,19);
 assert.equal(real.length,10);
 assert.equal(real.filter(m=>m.sourceProvider==='Innerscene').length,6);
 assert.equal(real.filter(m=>m.sourceProvider==='Poly Haven').length,4);
 for(const m of real){
  const buffer=fs.readFileSync(m.path);
  assert.equal(buffer.length,m.bytes,m.id);
  assert.equal(digest(buffer),m.sha256,m.id);
  assert.notEqual(m.sha256,originalGeneratedHashes[m.id],m.id+' must not use generated GLB');
  const source=inspectGLB(buffer,m.id);
  assert.equal(source.meshes.length,m.sourceModelInfo.meshCount);
  assert.equal(source.nodes.length,m.sourceModelInfo.nodeCount);
  assert.equal(source.images?.length||0,m.sourceModelInfo.embeddedImageCount);
  assert.equal(m.materialStyle,(source.images?.length||0)?'image-mapped':'color-only');
  assert.equal(m.skipMaterialEnhancement,true,'protect source materials on all ten');
  assert.ok(m.sourceFiles?.length>=1&&m.sourceFiles.every(s=>/^[a-f0-9]{64}$/.test(s.sha256)),'all source file dependencies hashed');
  assert.match(m.originalSource,/^https:\/\/(polyhaven.com\/a\/|www.innerscene.com\/tools\/library\/3d-parts\/)/);
  assert.match(m.sourceMirror,/^https:\/\/(dl.polyhaven.org\/|www.innerscene.com\/api\/library\/)/);
 }
});
test('source conduit prefab contains exactly three preexisting straight nodes in visible scene',()=>{
 const m=models.find(x=>x.id==='vestibule-spare-conduit');
 const doc=inspectGLB(fs.readFileSync(m.path),m.id);
 assert.equal(doc.scenes.length,1);
 assert.deepEqual(doc.scenes[0].nodes.map(i=>doc.nodes[i].name).sort(),
  ['cable_straight_long','cable_straight_medium','cable_straight_short'].sort());
 assert.equal(doc.meshes.length,49,'original Poly Haven modular mesh source remains intact, not recreated');
});
test('existing 9 Quaternius models and 36 Pinewood-created graphics remain source-pinned',()=>{
 assert.equal(models.filter(m=>m.originalAuthor==='Quaternius').length,9);
 assert.equal(manifest.decals.length,36);
 assert.equal(manifest.decals.filter(d=>d.license==='Original-Pinewood').length,36);
});
