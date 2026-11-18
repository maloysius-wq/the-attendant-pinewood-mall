import test from 'node:test';
import assert from 'node:assert/strict';
import {auditOriginalResidualRegisterV134} from '../mall/original-residual-register-v134.mjs';
test('reconcile every single original V128 cell against shipped and pending real-source closures',()=>{
 const r=auditOriginalResidualRegisterV134();
 assert.equal(r.originalBaselineSqm,520);
 assert.equal(r.originalAlreadyClosedV129Sqm,85);
 assert.equal(r.originalAlreadyClosedV131Sqm,63);
 assert.equal(r.proposedFrontClosureV133Sqm,41);
 assert.equal(r.residualIfV133ShipsSqm,331);
 assert.equal(r.westRearSourceCandidateSqm,45);
 assert.equal(r.expectedAfterWestRearClosureSqm,286);
 assert.equal(r.perimeterFacadeRemainderBeforeWestRearClosureSqm,286);
 assert.equal(r.zeroDuplicatePlanarCells,true);
 assert.deepEqual(r.unclassifiedCells,[],
  'every remaining original square metre must belong to a verifiable physical category');
 assert.equal(r.groups.originalWestFacade.area,96);
 assert.equal(r.groups.originalEastFacade.area,88.5);
 assert.equal(r.groups.annexEastFacade.area,67);
 assert.equal(r.groups.originalRearFacade.area,37.5);
 assert.equal(r.groups.westRearServiceCore.area,42);
 assert.equal(Object.values(r.groups).reduce((n,g)=>n+g.area,0),331);
});
test('perimeter residual cannot be called enclosed unless every original inner and outer source wall exists',()=>{
 const r=auditOriginalResidualRegisterV134();
 assert.ok(Array.isArray(r.perimeterWallCoverageFindings));
 for(const evidence of r.perimeterWallCoverageFindings){
  assert.ok(['originalWestFacade','originalEastFacade','annexEastFacade','originalRearFacade']
   .includes(evidence.category));
  assert.ok(evidence.checks.some(f=>f.gaps.length),
   'each gap report must reflect actual original source masonry');
 }
});
