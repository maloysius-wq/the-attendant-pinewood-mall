import test from 'node:test';
import assert from 'node:assert/strict';
import {blockedOperationV95,blockedMessageV95} from '../builder/blocked-feedback-v95.mjs';
const base={position:{x:3,y:1,z:-4},rotation:{x:0,y:0,z:0},scale:1};
test('blocked transform operation is explained without changing collision validation',()=>{
 assert.equal(blockedOperationV95(base,{...base,rotation:{...base.rotation,y:Math.PI/12}}),'Rotation');
 assert.equal(blockedOperationV95(base,{...base,position:{...base.position,x:3.5}}),'Move');
 assert.equal(blockedOperationV95(base,{...base,scale:1.4}),'Scale');
 assert.equal(blockedOperationV95(base,base),'Edit');
 assert.equal(blockedOperationV95(base,{...base,position:{...base.position,z:-3},rotation:{x:0,y:.4,z:0}}),'Move');
});
test('wall and unsupported surface errors have direct, actionable descriptions',()=>{
 const wall=blockedMessageV95('Wall intersection. Move the prop or enable Allow overlap.','Rotation');
 assert.equal(wall.title,'Rotation blocked');
 assert.match(wall.detail,/wall/i);
 assert.match(wall.hint,/Allow overlap/);
 const support=blockedMessageV95('No continuous floor support. Use Allow overlap for unsupported placements.','Move');
 assert.equal(support.title,'Move blocked');
 assert.match(support.detail,/floor or furniture support/);
 assert.match(support.hint,/Allow overlap/);
 assert.equal(blockedMessageV95('No continuous floor support','Scale').title,'Scale blocked');
 const unknown=blockedMessageV95('Custom diagnostic','Edit');
 assert.match(unknown.detail,/Custom diagnostic/);
 assert.equal(blockedMessageV95('Custom diagnostic','<img src=x onerror=alert(1)>').title,'Edit blocked');
});
