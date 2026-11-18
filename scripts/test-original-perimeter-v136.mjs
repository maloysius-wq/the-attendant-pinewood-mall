import test from 'node:test';
import assert from 'node:assert/strict';
import {constructPhysicalShell} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {realWestFacadeReturnV136,PERIMETER_WEST_REAR_RETURN_V136,
 auditOriginalPerimeterV136,validateOriginalPerimeterV136} from '../mall/original-perimeter-envelope-v136.mjs';

test('true 1979 facade has exactly 0.5m missing northwest rear corner return',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:6});
 const w=realWestFacadeReturnV136(shell.walls.filter(w=>w.id!==PERIMETER_WEST_REAR_RETURN_V136.id));
 assert.equal(shell.walls.filter(w=>w.id===PERIMETER_WEST_REAR_RETURN_V136.id).length,1);
 assert.equal(w.id,PERIMETER_WEST_REAR_RETURN_V136.id);
 assert.deepEqual([w.axis,w.at,w.start,w.end],['x',-46,-118.5,-118]);
 assert.equal(w.material,'concrete');
 assert.throws(()=>realWestFacadeReturnV136(shell.walls),/duplicate existing masonry/,
  'source-only exterior return must never be built twice on the original old wall');
});
test('source residual classification never hides the full old 286sqm facade setback',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:6});
 const report=auditOriginalPerimeterV136(shell);
 assert.equal(report.originalUnassignedBaselineSqm,520);
 assert.equal(report.originalSingleSlabSetbackSqm,286);
 assert.equal(report.originalGroundFloorOverSetbackSqm,286);
 assert.equal(report.originalWeatherRoofOverSetbackSqm,286);
 assert.deepEqual(report.unaccountedCells,[]);
 assert.equal(report.groups.west1979.area,96);
 assert.equal(report.groups.east1979.area,88.5);
 assert.equal(report.groups.east1992.area,67);
 assert.equal(report.groups.rear1979.area,34.5);
 assert.deepEqual(report.unforeseenMissingMasonry,[]);
 assert.equal(report.originalEastConnectorClearance.length,1);
 assert.deepEqual(validateOriginalPerimeterV136(shell),[]);
});

test('every remaining original 1979/1992 exterior setback is truly inaccessible in all six chapters',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:6});
 const cells=auditOriginalPerimeterV136(shell).originalSetbackCells;
 assert.ok(cells.length>=20,'source ledger must expose real grid cells');
 for(let chapter=1;chapter<=6;chapter++){
  const native=buildGameplayLayoutV70({chapter}),spawn=chapterRouteV70(chapter).spawn;
  assert.ok(native.canStand(spawn.x,spawn.z),'canonical Chapter '+chapter+' native-floor spawn must remain playable');
  // The 286m² original perimeter residual is on G ONLY. Chapters 2, 5
  // and 6 spawn on B1/M1, where x46.5,z-93.5 is a real mezzanine room.
  // Never misclassify a valid upper-floor room as an accessible G facade void.
  const g=buildGameplayLayoutV70({chapter,level:'G'});
  for(const r of cells){
   const x=(r.x1+r.x2)/2,z=(r.z1+r.z2)/2;
   assert.equal(g.canStand(x,z),false,
    'original facade relief cannot become a walkable unassigned hole: chapter '+chapter+' @ '+x+','+z);
  }
 }
});
