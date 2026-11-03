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
test('opening uses real mall after the threshold and preserves cinematic sequencing',()=>{
 const s=read('opening/intro-v65.js');
 assert.match(s,/renderPinewoodV69\(\{scene:this\.interiorScene,chapter:1\}\)/);
 assert.match(s,/this\.interiorReady/);
 assert.match(s,/this\.renderer\.render\(this\.interiorScene,this\.camera\)/);
 assert.match(s,/this\.root\.dataset\.renderWorld=useNewMall\?'unified-mall':'exterior'/);
 assert.match(s,/this\.stage\.accessPad\.update\(accessProgress\)/);
 assert.match(s,/this\.elapsed-this\.voiceSeconds/,'numeric entry must follow Renee, not interrupt her');
 assert.match(s,/delta\*11\.6/,'faster rainfall');
 assert.match(read('opening/scene.js'),/rainCount=1500/);
 assert.match(read('opening/opening.css'),/user-select:none/);
 assert.match(read('opening/dashboard-clock-v71.js'),/12:47 AM/);
});
test('public entrance boards remain sparse and layers have distinct depth',()=>{
 const facade=read('opening/facade-v65.js');
 assert.match(facade,/const rows=\[\.58,1\.28,2\.03,2\.71,3\.58,4\.31,5\.10\]/);
 assert.match(facade,/public entry CLOSED sign/);
 assert.match(read('opening/scene.js'),/useAbandonedFacade\)box\(world,1\.5,8\.55,-22\.70/);
});
