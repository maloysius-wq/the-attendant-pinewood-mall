import test from 'node:test';
import assert from 'node:assert/strict';
import {createOrderedDraftSaves} from '../builder/ordered-draft-saves-v102.mjs';

test('rapid edits produce serialized writes and only newest save reports completion',async()=>{
 const order=[];let active=0,peak=0;
 const saves=createOrderedDraftSaves(async snapshot=>{
  active++;peak=Math.max(peak,active);
  await new Promise(resolve=>setImmediate(resolve));
  order.push(snapshot.revision);
  active--;
 });
 const outcomes=await Promise.all([
  saves.enqueue({revision:1}),
  saves.enqueue({revision:2}),
  saves.enqueue({revision:3})
 ]);
 await saves.flush();
 assert.deepEqual(order,[1,2,3]);
 assert.equal(peak,1,'no overlapping storage transactions');
 assert.deepEqual(outcomes.map(x=>x.latest),[false,false,true],
  'old writes must not overwrite the newest save status');
});

test('a failed earlier transaction does not block subsequent edits',async()=>{
 const attempts=[];
 const saves=createOrderedDraftSaves(async value=>{
  attempts.push(value);
  if(value===1)throw Error('Simulated IndexedDB failure');
 });
 const failed=saves.enqueue(1),recovered=saves.enqueue(2);
 await assert.rejects(failed,/Simulated IndexedDB failure/);
 assert.deepEqual(await recovered,{revision:2,latest:true});
 assert.deepEqual(attempts,[1,2]);
 await saves.flush();
});

test('synchronous writer errors still release the ordered queue',async()=>{
 const saves=createOrderedDraftSaves(value=>{
  if(value==='bad')throw TypeError('Invalid draft');
  return Promise.resolve(value);
 });
 const a=saves.enqueue('bad'),b=saves.enqueue('good');
 await assert.rejects(a,/Invalid draft/);
 assert.deepEqual(await b,{revision:2,latest:true});
});
