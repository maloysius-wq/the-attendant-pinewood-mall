import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell} from '../mall/physical-shell-v67.mjs';
import {WEST_REAR_SERVICE_V135,WEST_REAR_SOURCE_CEILING_V135,
 westRearSourceWallsV135,westRearCeilingV135,validateWestRearV135}
 from '../mall/west-rear-service-closure-v135.mjs';
const near=(a,b)=>Math.abs(a-b)<1e-6;
test('V135 only closes exactly four REAL previously missing original source masonry spans',()=>{
 const existing=constructPhysicalShell({level:'G',chapter:6});
 const walls=westRearSourceWallsV135(existing.walls.filter(w=>w.role!=='v135-west-rear-partition'));
 assert.equal(walls.length,4);
 assert.deepEqual(walls.map(w=>[w.axis,w.at,w.start,w.end]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),
  [['x',-17,-118.5,-118],['x',-11,-118.5,-118],
   ['x',-11,-112,-111],['z',-111,-17,-11]]
   .sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
 assert.equal(MALL.rooms.length,41);
 assert.equal(MALL.evidence.length,9);
 assert.equal(WEST_REAR_SERVICE_V135.area,45);
 assert.equal(westRearCeilingV135().id,WEST_REAR_SOURCE_CEILING_V135.id);
 assert.ok(near(westRearCeilingV135().y-westRearCeilingV135().thickness/2,3.36));
});
test('validate completed candidate only against actual same-source shell and preserve original slab',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:6}),sourceWalls=shell.walls.filter(w=>w.role!=='v135-west-rear-partition'),walls=westRearSourceWallsV135(sourceWalls);
 const installed={
  walls,existingWalls:sourceWalls,
  floorPlates:shell.floorPlates,
  ceilings:shell.ceilings,
  roofs:shell.roofs,portals:shell.portals
 };
 assert.deepEqual(validateWestRearV135(installed),[]);
 assert.equal(shell.floorPlates.filter(p=>p.id.startsWith('v135_')).length,0);
});
