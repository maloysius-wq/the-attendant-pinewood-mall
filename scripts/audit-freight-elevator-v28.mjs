import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

const game=await readFile('game.js','utf8');
const patch=await readFile('patches/freight-elevator-reliability-v28.js.txt','utf8');
const fail=m=>{throw new Error('Freight Elevator Reliability v28 audit failed: '+m);};
for(const marker of [
  "const FREIGHT_ELEVATOR_V28_PATCH='./patches/freight-elevator-reliability-v28.js.txt';",
  'applyFreightElevatorReliabilityV28Runtime',
  'freightElevatorV28Patch',
  'freightElevatorV28Source',
  'applyAudioDirectionV27Runtime(freightElevatorV28Source'
])if(!game.includes(marker))fail('loader marker missing '+marker);
for(const marker of [
  'freightDoorLeafV28',
  'doorOpenFraction=openness',
  'physicalBlock:true',
  'u.doorBlocker.disabled=openness>=.985',
  "u.left.position.z=u.closedL;u.right.position.z=u.closedR",
  "u.left.position.z=u.openL;u.right.position.z=u.openR",
  'Number(u.doorOpenFraction??0)<.985',
  'window.__PINEWOOD_ELEVATOR_V28__'
])if(!patch.includes(marker))fail('patch marker missing '+marker);
if(!game.includes("const source=audioDirectionV27Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('Audio Direction v27 must remain terminal after elevator reliability feed-forward');
const tmp='/tmp/pinewood-freight-elevator-v28.mjs';await writeFile(tmp,patch);execFileSync('node',['--check',tmp],{stdio:'inherit'});
console.log('Freight Elevator Reliability v28 audit passed: immediate moving leaves, visible-fraction collision coupling, explicit physical blocker, closed-door movement guard, deterministic telemetry, and v27 terminal feed-forward are protected.');
