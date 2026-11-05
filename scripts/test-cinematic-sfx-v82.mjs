import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const at=p=>new URL('../'+p,import.meta.url);
const src=p=>readFileSync(at(p),'utf8');
const files={
 Beep:'126e4543b169105dccd8c0c1129513ffed22ca52eff41d33a48c9198c1e8b9c7',
 MetalDoorOpen:'22cc1374f09e697907966dc2210613f2e682a2074aa1232ff1827ede76639acc',
 MetalDoorClose:'65593760b14117379e05f002fc800dbbb78540fa2892f9b855dc8e4f7fa8fc2c',
 CarDoorOpen:'c02fc7489f76e3682b6303990eabfe0b5a7c63acbfd8a822129a30e2e1059e52',
 CarDoorClose:'86e8f8fe30fe7e239094a54a912747889a59802f415030cb6cc66d465565c310'
};
test('five user-provided effects are identical locally vendored WAVs, no remote fetch',()=>{
 for(const [name,expected] of Object.entries(files)){
  const path='opening/audio/cinematic/v82/'+name+'.wav';
  assert.ok(existsSync(at(path)),path+' is missing');
  const b=readFileSync(at(path));
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WAVE');
  assert.equal(createHash('sha256').update(b).digest('hex'),expected,name+' original sound must not change');
  assert.ok(src('LICENSES.md').includes(expected),name+' provenance');
 }
});
test('contractor keypad taps 1-5-8-3 with beep at actual contact centers',async()=>{
 assert.ok(existsSync(at('opening/cinematic-sfx-cues-v82.mjs')),'sound event scheduler must exist');
 const {soundCuesFor}=await import('../opening/cinematic-sfx-cues-v82.mjs');
 const cues=soundCuesFor('lights',10.06,12.06);
 assert.deepEqual(cues.map(x=>x.name),['Beep','Beep','Beep','Beep']);
 assert.deepEqual(cues.map(x=>x.digit),[1,5,8,3]);
 assert.deepEqual(cues.map(x=>+x.at.toFixed(3)),[10.31,10.81,11.31,11.81]);
});
test('car door closes exactly four seconds after opening near exit',async()=>{
 assert.ok(existsSync(at('opening/cinematic-sfx-cues-v82.mjs')));
 const {soundCuesFor}=await import('../opening/cinematic-sfx-cues-v82.mjs');
 const owner=soundCuesFor('owner',16.636,18.236);
 assert.deepEqual(owner.map(x=>x.name),['CarDoorOpen','CarDoorClose']);
 assert.ok(Math.abs(owner[1].at-owner[0].at-4)<1e-9);
 assert.ok(owner[0].at>3.7&&owner[0].at<4.0);
 assert.ok(owner[1].at>7.7&&owner[1].at<8.0);
});
test('metal door sound tracks opening and closing after entering vestibule',async()=>{
 assert.ok(existsSync(at('opening/cinematic-sfx-cues-v82.mjs')));
 const {soundCuesFor}=await import('../opening/cinematic-sfx-cues-v82.mjs');
 const cues=soundCuesFor('inside',13.164,14.664);
 assert.deepEqual(cues.map(x=>x.name),['MetalDoorOpen','MetalDoorClose']);
 assert.ok(cues[0].at<.25&&cues[1].at>7.5&&cues[1].at<8.4);
 const camera=src('opening/camera-v65.js'),sedan=src('opening/sedan-v75.js');
 assert.match(camera,/phase-\.54/,'door must visibly close after vestibule entry');
 assert.match(sedan,/elapsedSeconds-startClose/,'sedan door must close in sync with its sound');
});
test('event crossing emits exactly one sound per threshold; scrub does not re-fire',async()=>{
 assert.ok(existsSync(at('opening/cinematic-sfx-cues-v82.mjs')));
 const {soundCuesFor,crossedSoundCues}=await import('../opening/cinematic-sfx-cues-v82.mjs');
 const cues=soundCuesFor('lights',10.06,12.06);
 const a=crossedSoundCues(cues,10.0,10.45);
 assert.deepEqual(a.map(x=>x.digit),[1]);
 assert.deepEqual(crossedSoundCues(cues,10.45,10.45),[]);
 assert.deepEqual(crossedSoundCues(cues,11.2,11.9).map(x=>x.digit),[8,3]);
 assert.deepEqual(crossedSoundCues(cues,11.9,10.0),[]);
});

test('production New Game and review both import the latest cinematic bundle',()=>{
 assert.match(src('index.html'),/intro-v65\.js\?v=82/);
 assert.match(src('review/the-call-v34/index.html'),/intro-v65\.js\?v=82/);
});
