import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {FALLOWS_SOURCES_V160} from '../mall/fallows-sources-v160.mjs';
import {ANCHOR_ROOMS_V121,ORIGINAL_RETAIL_CANDIDATES_V121,validateAnchorSourceV121}
 from '../mall/anchor-retail-source-v121.mjs';

const manifest=JSON.parse(readFileSync(new URL('../assets/vendor/builder/catalog-v1.json',import.meta.url)));
test('exact original two anchor tenants, 41 story rooms and six untouched chapters remain intact',()=>{
 assert.deepEqual(validateAnchorSourceV121(),[]);
 assert.equal(MALL.rooms.length,41);
 assert.deepEqual(ANCHOR_ROOMS_V121.map(r=>r.id),['west_anchor','east_original_anchor']);
 for(const r of ANCHOR_ROOMS_V121){
  const src=MALL.rooms.find(s=>s.id===r.id);
  assert.deepEqual([r.x1,r.x2,r.z1,r.z2],[src.x1,src.x2,src.z1,src.z2]);
 }
 assert.equal(MALL.evidence.length,9);
 assert.equal(FURNISHINGS_V69.fixtures.filter(f=>f.room==='west_anchor').length,3,
  'do not secretly furnish the tenant before licensed source auditions and actual review');
 assert.equal(FURNISHINGS_V69.fixtures.filter(f=>f.room==='east_original_anchor').length,2);
});

test('all historic and V160 candidate 3D sources are already pinned licensed byte-exact CC0 imports',()=>{
 assert.equal(ORIGINAL_RETAIL_CANDIDATES_V121.length,6);
 assert.equal(manifest.models.length,482);
 for(const f of [...ORIGINAL_RETAIL_CANDIDATES_V121,...FALLOWS_SOURCES_V160]){
  const v=manifest.models.find(a=>a.path===f.path);
  assert.ok(v,'source not in original existing Builder catalog '+f.shortName);
  assert.equal(v.license,'CC0-1.0');
  assert.equal(v.sha256,f.sha256,'unverified hash '+f.shortName);
  const bytes=readFileSync(new URL('../'+f.path,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256,
   'downloaded model mismatch '+f.shortName);
  assert.ok(bytes.byteLength>1000,'not a real source GLB '+f.shortName);
  assert.ok(f.targetHeight>=.7&&f.targetHeight<=2.8);
 }
});
