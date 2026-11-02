import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const raw=path=>readFileSync(resolve(root,path));
const read=path=>raw(path).toString('utf8');
const scene=read('opening/scene.js');
const intro=read('opening/intro-v65.js');
const facade=read('opening/facade-v65.js');
const camera=read('opening/camera-v65.js');
const preview=read('review/the-call-v34/index.html');
const production=read('opening/intro.js');
const manifest=JSON.parse(read('opening/assets/v65/manifest.json'));
const wood=raw('opening/assets/v65/weathered_planks_diff_1k.jpg');
const source=read('opening/assets/v65/SOURCES.md');

// Old storefront remains for production/rollback; v65 opts out of the row.
assert.match(scene,/makeOpeningScene\(\{useImportedLandscape=false,useAbandonedFacade=false\}/);
assert.match(scene,/if\(!useAbandonedFacade\)\s*\{\s*for\(let x=-42/);
assert.match(scene,/for\(let x=-40;x<43;x\+=9\)/);
assert.match(scene,/facadeMaterials:\{facade,steel,concrete,dark\}/);
assert.match(intro,/makeOpeningScene\(\{useImportedLandscape:true,useAbandonedFacade:true\}\)/);
assert.match(intro,/Promise\.all\(\[environmentReady,facadeReady\]\)/);
assert.match(intro,/installAbandonedFacadeV65\(this\.stage\)/);
assert.match(intro,/enlargeImportedLandscapeV64\(this\.stage,environment\)/);
assert.match(intro,/facadeV65\?\.state!=='ready'/);
assert.match(preview,/intro-v65\.js\?v=65/);
assert.doesNotMatch(production,/facade-v65/);
assert.match(camera,/sign:\[-10\.5,13\.13,-22\]/);
assert.match(camera,/softSign:\[\.5,3\.4,-22\]/,'Keep v62 gentle seated glance without abrupt upward whip');

// Deliberate monument and boarded public door, not a strip of dummy panes.
assert.match(facade,/central raised entry tower/);
assert.match(facade,/east raised wing',26\.0,11\.05,-22\.55,44\.0/);
assert.match(facade,/west raised wing',-32\.0,11\.05,-22\.55,25\.5/);
assert.match(scene,/if\(useAbandonedFacade\)box\(world,1\.5,8\.55,-22\.48,93\.5/);
assert.match(facade,/heightMeters:17\.31/);
assert.match(facade,/const windows=\[-35\.7,32\.0\]/);
assert.match(facade,/mainEntranceBoarded:true/);
assert.match(facade,/routeBlocked:true/);
assert.match(facade,/weathered boarded public-door plank/);
assert.match(facade,/diagonal boarded-door brace/);
assert.match(facade,/large weathered 1980s PINEWOOD MALL sign/);
assert.match(facade,/new THREE\.TextureLoader\(\)\.load\(file\.href/);
assert.doesNotMatch(facade,/https?:\/\//,'Runtime facade may not fetch remote assets');
// Both v64 service door and walking route are left at their exact coordinates.
assert.match(scene,/centerX:12,width:1\.78,height:2\.27,thickness:\.095/);
assert.match(scene,/centerX:serviceDoor\.centerX/);
assert.match(scene,/pivot\.position\.set\(serviceDoor\.centerX-serviceDoor\.width\/2,0,-22\.05\)/);
assert.match(facade,/contractorDoorUnchanged:true/);

// Verify the actual local third-party wood bytes, not just written provenance.
assert.equal(manifest.version,65);
assert.equal(manifest.license,'CC0-1.0');
assert.equal(manifest.assets.length,1);
assert.equal(manifest.assets[0].file,'weathered_planks_diff_1k.jpg');
assert.equal(wood.length,599581);
assert.equal(wood.length,manifest.assets[0].bytes);
assert.equal(wood[0],0xff);
assert.equal(wood[1],0xd8);
assert.equal(wood[wood.length-2],0xff);
assert.equal(wood[wood.length-1],0xd9);
assert.equal(createHash('sha256').update(wood).digest('hex'),manifest.assets[0].sha256);
assert.match(source,/Poly Haven/);
assert.match(source,/CC0/);
console.log('V65_ABANDONED_FACADE_PASS 17m tall, two windows, boarded public door, sign, verified CC0 wood, intact v64 service entry');
