import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('model surface classification is complete and accurately exposed by Builder controls',()=>{
 const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/catalog-v1.json','utf8'));
 const index=JSON.parse(fs.readFileSync('assets/vendor/builder/material-index-v1.json','utf8'));
 const ids=new Set(manifest.models.map(m=>m.id));
 assert.equal(index.version,1);
 assert.equal(index.totalModels,manifest.models.length);
 assert.equal(index.imageBearingIds.length,158);
 assert.equal(new Set(index.imageBearingIds).size,index.imageBearingIds.length);
 assert.ok(index.imageBearingIds.every(id=>ids.has(id)));
 const page=fs.readFileSync('builder/index.html','utf8');
 const main=fs.readFileSync('builder/main.js','utf8');
 assert.match(page,/id="catalog-material"/);
 assert.match(page,/value="image-mapped"/);
 assert.match(page,/value="color-only"/);
 assert.match(main,/material-index-v1\.json/);
 assert.match(main,/styleIndex\.totalModels!==manifest\.models\.length/);
 assert.match(main,/materialStyle:images\.has\(m\.id\)\?'image-mapped':'color-only'/);
 assert.match(main,/material&&item\.materialStyle!==material/);
 assert.match(main,/catalog-material'\)\.addEventListener\('change',filter\)/);
 console.log('PINEWOOD_BUILDER_MATERIAL_FILTER_PASS',JSON.stringify({catalog:manifest.models.length,withImageMaps:index.imageBearingIds.length,colorOnly:manifest.models.length-index.imageBearingIds.length}));
});
