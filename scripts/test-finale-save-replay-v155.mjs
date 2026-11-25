import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {STORY_DATA_V17} from '../story/story-data.js';
const source=readFileSync('patches/chapter6-last-shift-v25.js.txt','utf8');
const start=source.indexOf('function resetCompletedFinaleAttemptV155(');
const end=source.indexOf('async function buildLastShiftV25(world){',start);
assert.ok(start>=0&&end>start);
const reset=vm.runInNewContext(source.slice(start,end)+'\nresetCompletedFinaleAttemptV155;');
const active=['ch6_first_memory','ch6_staff_acknowledged','ch6_key_cleared','ch6_service_cleared','ch6_service_pair_cleared','ch6_eli_processed','ch6_accountability_one','ch6_clocked_out','ch6_exit_open','ch6_complete'];
const flags=STORY_DATA_V17.flags;
const fixture=ending=>({
 ending,chapterCheckpoint:'complete',evidence:{'LS-07':true,'LS-08':true,'LS-09':true},
 people:{eli:'cleared'},timeline:{old:true},flags:{[flags.contractor14Active]:false,untouched:true},
 completedEvents:{...Object.fromEntries(active.map(k=>[k,true])),ch5_eli_body:true,ch5_sessions:true,
  ch6_standard_ending:true,contractor15_pending:true,...(ending==='everyone_clocked_out'?{ch6_true_ending:true,ch6_accountability_zero:true}:{})}
});
for(const ending of ['pinewood_closed','everyone_clocked_out'])test('completed '+ending+' is replayable without losing historical evidence',()=>{
 const story=fixture(ending),before=structuredClone(story);
 assert.equal(reset(story,flags),true);
 for(const id of active)assert.equal(story.completedEvents[id],undefined,id+' must be attempt-scoped');
 for(const key of ['evidence','people','timeline','ending'])assert.deepEqual(story[key],before[key]);
 assert.equal(story.completedEvents.ch5_eli_body,true);
 assert.equal(story.completedEvents.ch5_sessions,true);
 assert.equal(story.completedEvents.ch6_standard_ending,true);
 assert.equal(story.completedEvents.ch6_true_ending,before.completedEvents.ch6_true_ending);
 assert.equal(story.completedEvents.ch6_accountability_zero,before.completedEvents.ch6_accountability_zero);
 assert.equal(!!story.completedEvents.contractor15_pending,ending==='pinewood_closed');
 assert.equal(story.chapterCheckpoint,'last_shift');
 assert.equal(story.flags.untouched,true);
 assert.equal(reset(story,flags),false,'must not reset a subsequent interrupted attempt');
});
test('interrupted final recall keeps its checkpoint, flags and collected evidence',()=>{
 const story=fixture('pinewood_closed');delete story.completedEvents.ch6_complete;
 story.chapterCheckpoint='last_shift';story.flags[flags.contractor14Active]=true;
 const before=structuredClone(story);assert.equal(reset(story,flags),false);assert.deepEqual(story,before);
});
test('production Chapter 6 invokes the helper only on actual chapter load and clears old pending contractor on true ending',()=>{
 assert.match(source,/if\(!visualView&&resetCompletedFinaleAttemptV155\(SAVE.story,STORY_DATA_V17.flags\)\)save\(\)/);
 assert.ok(source.indexOf('if(!visualView&&resetCompletedFinaleAttemptV155')<source.indexOf('const s=GAME.ch6V25='));
 assert.match(source,/if\(trueEnding\)\{SAVE.story.completedEvents.ch6_accountability_zero=true;delete SAVE.story.completedEvents.contractor15_pending;\}/);
 assert.ok(STORY_DATA_V17.characters.eli.states.cleared.includes('without inventing a departure'));
 assert.equal(STORY_DATA_V17.endings.true,'everyone_clocked_out');
});
