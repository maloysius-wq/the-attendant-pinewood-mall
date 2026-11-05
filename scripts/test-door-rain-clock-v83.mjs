import test from 'node:test';
import assert from 'node:assert/strict';
import {HumanCameraRig} from '../opening/camera-v65.js';
import {soundCuesFor} from '../opening/cinematic-sfx-cues-v82.mjs';

test('car-door opening sound and exterior rain share first door movement',()=>{
 const wait=18.236,cues=soundCuesFor('owner',16.636,wait),open=wait*.06;
 assert.ok(Math.abs(cues[0].at-open)<.001,'car sound begins at the start of door animation');
 assert.ok(Math.abs(cues[1].at-cues[0].at-6)<1e-9,'closing six seconds after opening');
 const rig=new HumanCameraRig();
 const before=rig.sample('owner',wait*.05,wait,1/60);
 const after=rig.sample('owner',wait*.07,wait,1/60);
 assert.ok(before.rain.car>.95&&before.rain.outside<.05);
 assert.ok(after.rain.outside>.95&&after.rain.car<.05,
  'exterior rain must begin before the character steps out');
});
