import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('storm-night sky is local original panorama and overrides v37 flat background after preload',()=>{
 const path='opening/assets/v81/storm-night-sky.jpg',bytes=readFileSync(new URL('../'+path,import.meta.url));
 assert.ok(bytes.length>60000&&bytes.length<600000);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'4d755d1d4def3ead403a0eeb1bf634483115cec03dcc3be6d42ccc433a9aecc6');
 assert.ok(source('LICENSES.md').includes('4d755d1d4def3ead403a0eeb1bf634483115cec03dcc3be6d42ccc433a9aecc6'));
 const scene=source('opening/scene.js');
 assert.match(scene,/stormSkyReady=useAbandonedFacade/);
 assert.match(scene,/new URL\('\.\/assets\/v81\/storm-night-sky\.jpg'/);
 assert.match(scene,/EquirectangularReflectionMapping/);
 assert.match(scene,/Promise\.all\(\[environmentReady,sidewalkReady,stormSkyReady\]\)/);
 assert.match(scene,/if\(sky\.texture\)scene\.background=sky\.texture/);
});
test('eight existing imported CC0 shrubs become dying/untrimmed and pots match Pinewood sign',()=>{
 const scene=source('opening/scene.js'),landscape=source('opening/landscape-v63.js'),facade=source('opening/facade-v65.js');
 assert.match(facade,/#21332f/);
 assert.match(landscape,/const PINEWOOD_SIGN_GREEN='#21332f'/);
 assert.match(scene,/installMallPlantersV63\(world,\{decayed:useAbandonedFacade\}\)/);
 assert.match(landscape,/localModel\('weathering-steel-planter\.glb'\)/);
 assert.match(landscape,/localModel\('rounded-landscape-shrub\.glb'\)/);
 assert.match(landscape,/geometry=mesh\.geometry\.clone\(\)/);
 assert.match(landscape,/new THREE\.Float32BufferAttribute\(shades,3\)/);
 assert.match(landscape,/witherShrub/);
 assert.doesNotMatch(landscape,/new THREE\.(BoxGeometry|CylinderGeometry|SphereGeometry)/);
});
test('native keypad index stays independent, other fingers curl toward palm, and phone grip is not edited',()=>{
 const hand=source('opening/keypad-reach-v72.js'),intro=source('opening/intro-v65.js');
 assert.match(hand,/this\.hand\.nativePose=/);
 assert.match(hand,/for\(const n of \[3,4,5\]\)this\._curl\(n\)/);
 assert.match(hand,/const score=tip\.distanceTo\(palm\)/);
 assert.match(hand,/dip\.quaternion\.copy\(neutral\[2\]\)/);
 assert.match(hand,/this\._curl\(1\)/);
 assert.match(intro,/keypad-reach-v72\.js\?v=81/);
 assert.match(intro,/scene\.js\?v=(?:81|83)/);
});
