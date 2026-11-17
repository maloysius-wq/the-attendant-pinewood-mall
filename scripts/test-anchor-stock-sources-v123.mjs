import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ANCHOR_STOCK_CANDIDATES_V123,validateAnchorStockSourcesV123}
 from '../mall/anchor-stock-sources-v123.mjs';
import {MALL} from '../mall/masterplan-v66.mjs';
const catalog=JSON.parse(readFileSync(new URL('../assets/vendor/builder/catalog-v1.json',import.meta.url)));
test('eight independent original licensed stock GLBs are precisely catalog pinned',()=>{
 assert.deepEqual(validateAnchorStockSourcesV123(),[]);
 assert.equal(ANCHOR_STOCK_CANDIDATES_V123.length,8);
 assert.equal(catalog.models.length,482);
 for(const item of ANCHOR_STOCK_CANDIDATES_V123){
  const expected=catalog.models.find(a=>a.path===item.path);
  assert.ok(expected,'stock model not in original CC0 catalog '+item.key);
  assert.equal(expected.sha256,item.sha256);
  assert.equal(expected.license,'CC0-1.0');
  const bytes=readFileSync(new URL('../'+item.path,import.meta.url));
  assert.ok(bytes.length>1024,'missing licensed 3D source');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),expected.sha256);
 }
 assert.equal(MALL.rooms.length,41);
 assert.equal(MALL.evidence.length,9);
});
test('unlicensed or duplicate stock cannot pass the original source gate',()=>{
 const a=ANCHOR_STOCK_CANDIDATES_V123.map((x,i)=>i===0?{...x,license:'unknown'}:x);
 assert.ok(validateAnchorStockSourcesV123(a).length>0);
 const b=ANCHOR_STOCK_CANDIDATES_V123.map((x,i)=>i===0?{...x,key:a[1].key}:x);
 assert.ok(validateAnchorStockSourcesV123(b).length>0);
});
