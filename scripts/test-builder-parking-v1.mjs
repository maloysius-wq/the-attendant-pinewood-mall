import test from 'node:test';
import assert from 'node:assert/strict';
import {findGroundBelow,resolveFlyLanding,isExteriorSurface} from '../mall/editor-traversal-v1.mjs';

test('cinematic parking apron supports walking and fly-to-ground across the full actual asphalt slab',()=>{
 assert.equal(isExteriorSurface(-54,54),true,'far-side parking aisle is physical ground');
 assert.equal(findGroundBelow(-54,6,54,[]),0);
 assert.deepEqual(resolveFlyLanding({x:-54,y:12,z:54},{x:0,y:1.7,z:-60},[]),
  {x:-54,y:1.7,z:54});
 assert.equal(isExteriorSurface(67,51),false,'cannot land beyond the parking slab');
 assert.equal(findGroundBelow(67,6,51,[]),null);
});

test('cinematic contractor sidewalk remains reachable without inventing solid ground inside the entrance',()=>{
 assert.equal(isExteriorSurface(12,-21),true);
 assert.equal(findGroundBelow(12,5,-21,[]),0);
 assert.equal(isExteriorSurface(12,-35),false);
});
