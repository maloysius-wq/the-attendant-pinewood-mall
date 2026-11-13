import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MALL_PLANTERS_V64} from '../opening/landscape-layout-v64.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('eight imported planters form four mirrored pairs around the public lobby',()=>{
 const p=MALL_PLANTERS_V64;
 assert.equal(p.length,8);
 for(let i=0;i<4;i++)assert.ok(Math.abs((p[i].x+p[7-i].x)/2+10.5)<.001);
 for(let i=1;i<4;i++)assert.ok(Math.abs(p[i].x-p[i-1].x-3.6)<.001);
 for(let i=5;i<8;i++)assert.ok(Math.abs(p[i].x-p[i-1].x-3.6)<.001);
 assert.ok(p[7].x<8,'contractor door path remains clear');
});
test('opening shares the licensed mall and physical contractor entrance before and after the threshold',()=>{
 const s=read('opening/intro-v65.js');
 assert.match(s,/renderAuthoredPinewoodV111\(\{/,'opening uses shared authored physical mall layer');
 assert.match(s,/scene:this\.interiorScene,chapter:1/,'the actual chapter-one interior remains the scene being mounted');
 assert.match(read('mall/authored-scene-v111.js'),/renderPinewoodV69\(\{scene,chapter\}\)/,'shared authored layer is built on canonical licensed mall');
 assert.match(s,/this\.interiorReady/);
 assert.match(s,/this\.stage\.scene\.add\(canonical\)/,'mount real mall in one continuous scene');
 assert.match(s,/this\.renderer\.render\(this\.stage\.scene,this\.camera\)/,'render same physical world across the threshold');
 assert.match(s,/this\.root\.dataset\.renderWorld=throughDoor\?'unified-mall':'exterior'/,'diagnostic tag follows threshold without changing scene');
 // Interior-only rendering is permitted during the hidden shader warm-up, never as the visible threshold frame.
 assert.match(s,/const throughDoor=this\.camera\.position\.z< -22\.55;[\s\S]*?this\.renderer\.render\(this\.stage\.scene,this\.camera\)/);
 assert.match(s,/this\.stage\.accessPad\.update\(accessProgress\)/);
 assert.match(s,/this\.elapsed-this\.voiceSeconds/,'numeric entry must follow Renee, not interrupt her');
 assert.match(s,/delta\*11\.6/,'faster rainfall');
 assert.match(read('opening/scene.js'),/rainCount=1500/);
 assert.match(read('opening/opening.css'),/user-select:none/);
 assert.match(read('opening/dashboard-clock-v71.js'),/12:47 AM/);
 const route=read('opening/camera-v65.js');
 assert.match(route,/f\(1,\[12\.45,1\.72,-30\.85\],G\.forward/,'vestibule approach');
 assert.match(route,/f\(1,E\.handoff,G\.forward/,'film ends at shared Chapter 1 handoff');
 assert.doesNotMatch(route,/f\(1,\[5\.8,1\.73,-58\.0\],G\.hall/,'film must not enter the atrium');
 assert.match(read('mall/authored-scene-v111.js'),/mountVestibuleInnerDoorV112/,'same physical door loads in both movie and game');
});
test('public entrance boards remain sparse and layers have distinct depth',()=>{
 const facade=read('opening/facade-v65.js');
 assert.match(facade,/const rows=\[\.58,1\.28,2\.03,2\.71,3\.58,4\.31,5\.10\]/);
 assert.match(facade,/public entry CLOSED sign/);
 assert.match(read('opening/scene.js'),/useAbandonedFacade\)box\(world,1\.5,8\.55,-22\.70/);
});
