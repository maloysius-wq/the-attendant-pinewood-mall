import { readFile } from 'node:fs/promises';

function fail(message){throw new Error(`Footstep Mix v11 audit failed: ${message}`);}
function requireMarker(source,marker,label){if(!source.includes(marker))fail(`${label} missing: ${marker}`);}

const loader=await readFile('game.js','utf8');
const patch=await readFile('patches/footstep-mix-v11.js.txt','utf8');
const elevator=await readFile('patches/elevator-rebuild-v7.js.txt','utf8');

requireMarker(loader,"const FOOTSTEP_PATCH='./patches/footstep-mix-v11.js.txt';",'loader');
requireMarker(loader,'const footstepSource=await applyFootstepMix(posterSource,footstepPatch);','loader');
requireMarker(loader,"export { applyFootstepMixV11 };",'loader dynamic module export');

requireMarker(elevator,"gain=(sprint?.28:.18)*(quiet?.30:1)",'v7 source mix');
requireMarker(patch,"gain=(sprint?.14:.09)*(quiet?.30:1)",'v11 50% mix');
requireMarker(patch,"gain:gain*.16",'echo A scaling');
requireMarker(patch,"gain:gain*.06",'echo B scaling');
requireMarker(patch,"when:.11",'echo A timing');
requireMarker(patch,"when:.23",'echo B timing');
requireMarker(patch,"source.includes(\"gain=(sprint?.28:.18)*(quiet?.30:1)\")",'retired-gain guard');

console.log('Footstep Mix v11 audit PASS: normal .09, sprint .14, echo proportions/timing preserved.');
