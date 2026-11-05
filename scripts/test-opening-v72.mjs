import test from 'node:test';
import assert from 'node:assert/strict';
import {HumanCameraRig} from '../opening/camera-v65.js';

// Mutations this test must catch: a dialogue-phase rain cut, a delayed
// crossfade, or an exterior bed triggered before the driver clears the door.
test('outside rain begins with first driver-door motion, before physically exiting',()=>{
 const rig=new HumanCameraRig(),seconds=22;
 const before=rig.sample('owner',seconds*.05,seconds,1/60);
 const onset=rig.sample('owner',seconds*.061,seconds,1/60);
 assert.ok(before.rain.car>.95&&before.rain.outside<.05,'car audio before door opening');
 assert.ok(onset.rain.outside>.95&&onset.rain.car<.05,'rain begins at 6% of owner cue');
 assert.ok(rig.sample('owner',seconds*.84,seconds,1/60).rain.outside>.95,
  'outside rain must persist while walking toward mall');
});
