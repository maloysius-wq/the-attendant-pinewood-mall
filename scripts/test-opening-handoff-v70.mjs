import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chapterRouteV70} from '../mall/gameplay-layout-v70.mjs';

test('production New Game starts the approved local cinematic, not a review-only page',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/opening\/opening\.css\?v=61/);
 assert.match(html,/<section id="pwm-opening" hidden role="dialog"/);
 assert.match(html,/data-intro-preload/);
 const intro=html.search(/src="\.\/opening\/intro-v65\.js\?v=\d+(?:-[a-z0-9]+)*"/);
 const game=html.indexOf('src="./game.js"');
 assert.ok(intro>=0&&game>intro,'approved cinematic must load ahead of the game module');
 const script=readFileSync(new URL('../opening/intro-v65.js',import.meta.url),'utf8');
 assert.match(script,/document\.addEventListener\('click',intercept,true\)/);
 assert.match(script,/document\.dispatchEvent\(new CustomEvent\('pinewood-intro-finished'/);
 assert.match(script,/const button=\$\('newBtn'\)/);
 assert.match(script,/if\(!skipped\)window\.__PINEWOOD_INTRO_COMPLETED_FOR_GAME__=true/);
});
test('end of cinematic and Chapter 1 share the exact middle of the service vestibule',()=>{
 const entry=chapterRouteV70(1).spawn;
 assert.equal(entry.room,'service_vestibule');
 assert.equal(entry.x,12.5);
 assert.equal(entry.z,-32.75);
 assert.equal(entry.y,1.7);
});
