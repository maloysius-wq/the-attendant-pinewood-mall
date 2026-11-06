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


/**
 * A GLB can be perfectly valid but intentionally have no image textures:
 * Kenney and some 3DAssets models use flat baseColorFactor materials.
 * Inspect the actual GLB JSON chunk so "untextured" is not confused with
 * a broken image reference or missing primitive material.
 */
function decodeGlbJson(bytes,id){
 assert.equal(bytes.toString('ascii',0,4),'glTF','GLB magic '+id);
 assert.equal(bytes.readUInt32LE(4),2,'GLB version '+id);
 assert.equal(bytes.readUInt32LE(8),bytes.length,'GLB declared size '+id);
 const jsonLength=bytes.readUInt32LE(12);
 assert.equal(bytes.toString('ascii',16,20),'JSON','GLB JSON chunk '+id);
 assert.ok(jsonLength>0&&20+jsonLength<=bytes.length,'GLB JSON length '+id);
 return JSON.parse(bytes.toString('utf8',20,20+jsonLength));
}
test('catalog material audit distinguishes color-only props from missing image textures',()=>{
 const summary={colorOnly:0,withEmbeddedImages:0,withoutMaterial:0,brokenExternalImages:0,
  modelsWithMissingTexcoord:0,embeddedPng:0,embeddedWebp:0,withUnlit:0,
  examples:{colorOnly:[],textured:[],materialless:[],missingTexcoord:[]}};
 let totalPrimitives=0,allMaterials=0;const imageBearingIds=[];
 for(const item of catalog.models){
  const gltf=decodeGlbJson(fs.readFileSync(item.path),item.id);
  const meshes=gltf.meshes||[],materials=gltf.materials||[],textures=gltf.textures||[],images=gltf.images||[];
  const buffers=gltf.bufferViews||[];
  let primitiveCount=0,missingMaterial=0,missingUV=false;
  for(const mesh of meshes)for(const primitive of mesh.primitives||[]){
   primitiveCount++;totalPrimitives++;
   if(primitive.material===undefined){missingMaterial++;continue;}
   assert.ok(materials[primitive.material],'Unknown material index '+item.id);
   const m=materials[primitive.material],pbr=m.pbrMetallicRoughness||{};
   for(const slot of [pbr.baseColorTexture,m.normalTexture,pbr.metallicRoughnessTexture,m.emissiveTexture,m.occlusionTexture]){
    if(!slot)continue;
    assert.ok(textures[slot.index],'Missing texture index '+item.id);
    const uv='TEXCOORD_'+(slot.texCoord??slot.extensions?.KHR_texture_transform?.texCoord??0);
    if(!(uv in (primitive.attributes||{})))missingUV=true;
   }
  }
  assert.ok(primitiveCount>0,'GLB has no mesh primitives '+item.id);
  allMaterials+=materials.length;
  if(missingMaterial){summary.withoutMaterial++;if(summary.examples.materialless.length<10)summary.examples.materialless.push({id:item.id,primitives:missingMaterial});}
  if(missingUV){summary.modelsWithMissingTexcoord++;if(summary.examples.missingTexcoord.length<10)summary.examples.missingTexcoord.push(item.id);}
  if(images.length){
   summary.withEmbeddedImages++;imageBearingIds.push(item.id);
   if(summary.examples.textured.length<6)summary.examples.textured.push(item.id);
  }else{
   summary.colorOnly++;
   if(summary.examples.colorOnly.length<12)summary.examples.colorOnly.push(item.id);
  }
  if((gltf.extensionsUsed||[]).includes('KHR_materials_unlit'))summary.withUnlit++;
  for(const tex of textures){
   const src=tex.source??tex.extensions?.KHR_texture_basisu?.source??tex.extensions?.EXT_texture_webp?.source;
   assert.ok(src!==undefined&&images[src],'Missing texture image source '+item.id);
  }
  for(const img of images){
   // The GLB must be self-contained. A missing image is a real loading bug.
   assert.ok(img.bufferView!==undefined,'External/missing image payload in '+item.id+': '+String(img.uri||'?'));
   assert.ok(buffers[img.bufferView],'Missing embedded image bufferView '+item.id);
   assert.ok(['image/png','image/jpeg','image/webp','image/ktx2'].includes(img.mimeType),'Unsupported embedded image type '+item.id+': '+String(img.mimeType));
   if(img.mimeType==='image/png')summary.embeddedPng++;
   if(img.mimeType==='image/webp')summary.embeddedWebp++;
  }
 }
 assert.equal(summary.brokenExternalImages,0);
 const materialIndex='assets/vendor/builder/material-index-v1.json';
 if(fs.existsSync(materialIndex)){
  const index=JSON.parse(fs.readFileSync(materialIndex,'utf8'));
  assert.equal(index.version,1);
  assert.equal(index.totalModels,catalog.models.length);
  assert.deepEqual(index.imageBearingIds,imageBearingIds,'Material classification must match the pinned GLB files');
 }
 console.log('PINEWOOD_BUILDER_MATERIAL_INDEX '+JSON.stringify(imageBearingIds));
 console.log('PINEWOOD_BUILDER_MATERIAL_AUDIT_PASS',JSON.stringify({...summary,totalPrimitives,allMaterials}));
});
