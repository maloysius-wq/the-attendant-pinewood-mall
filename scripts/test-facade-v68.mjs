import test from 'node:test';
import assert from 'node:assert/strict';
import {FACADE_V68,validateFacadeV68} from '../mall/facade-plan-v68.mjs';
import {constructPhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';

const near=(a,b,e=.015)=>Math.abs(a-b)<=e;
const ground=constructPhysicalShell({level:'G',chapter:1});

test('facade preserves the 1979 original mall dimensions and reduced-window design',()=>{
 const f=FACADE_V68;
 assert.equal(f.originalFrontZ,-22.5);
 assert.equal(f.originalRoofY,12.8);
 assert.equal(f.originalWidth,94);
 assert.deepEqual(f.frontWindows,[]);
 assert.ok(f.sign.y+f.sign.height/2<12.8,'sign cannot pierce front parapet');
 assert.ok(f.sign.y-f.sign.height/2>5.7,'main sign belongs above entrance');
 assert.equal(f.sign.lettering,'PINEWOOD MALL');
 assert.ok(f.sign.width>=29,'proper big vintage mall sign');
});

test('front entrance is visibly boarded yet remains collision-blocked',()=>{
 const f=FACADE_V68.boarded;
 assert.equal(f.x,-10.5);assert.equal(f.width,9.6);assert.equal(f.height,5.7);
 assert.equal(f.panels.length,3,'three intentional plywood bays, not floating primitives');
 assert.ok(near(f.panels.reduce((w,p)=>w+p.width,0),f.width));
 assert.ok(f.braces.length>=4,'real cross-bracing visibly explains the closure');
 assert.equal(isSegmentBlocked(ground,{x:-10.5,z:-19},{x:-10.5,z:-25}),true);
 assert.equal(f.z>-22.5,true,'boards attached to the parking-facing masonry surface');
});

test('service door trim cannot occlude the exact cinematic aperture',()=>{
 const f=FACADE_V68.service;
 assert.equal(f.x,12);assert.equal(f.z,-22.5);assert.equal(f.width,1.78);
 assert.equal(f.height,2.27);
 const left=f.x-f.width/2,right=f.x+f.width/2;
 for(const bar of f.frame){
  const overlaps=bar.x1<right&&bar.x2>left&&bar.y1<f.height&&bar.y2>0;
  assert.equal(overlaps,false,'service trim must never obstruct walking through '+bar.id);
 }
 assert.equal(isSegmentBlocked(ground,{x:12,z:-19},{x:12,z:-25}),false);
});

test('weathering is facade-attached and structural landmarks are anchored',()=>{
 const f=FACADE_V68;
 assert.ok(f.weathering.length>=4);
 for(const m of f.weathering){
  assert.ok(m.x>=-47&&m.x<=47,'weathering located on original building');
  assert.ok(m.y1>=0&&m.y2<=12.8,'weathering starts/stops on real wall');
  assert.equal(m.z,-22.5);
 }
 assert.equal(f.employeeExit.x,86);assert.equal(f.employeeExit.z,-42);
 assert.equal(f.employeeExit.width,2);
 assert.deepEqual(validateFacadeV68(),[]);
});
