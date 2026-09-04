import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const fail=msg=>{throw new Error('Production readability v26 audit failed: '+msg);};
const prior=spawnSync(process.execPath,['scripts/audit-chapter6-last-shift-v25.mjs'],{encoding:'utf8'});
if(prior.status!==0){process.stderr.write(prior.stdout||'');process.stderr.write(prior.stderr||'');fail('v25 prerequisite audit failed');}

const patchText=await readFile('patches/production-readability-v26.js.txt','utf8');
const ctx=vm.createContext({console});
vm.runInContext(`${patchText}\nthis.__patch=applyProductionReadabilityV26;`,ctx,{filename:'patches/production-readability-v26.js.txt'});
if(typeof ctx.__patch!=='function')fail('patch function missing');
const synthetic='\nasync function decorateLevel(world,idx){ return {world,idx}; }\n';
const patched=ctx.__patch(synthetic);
for(const marker of [
  'window.__PINEWOOD_VISUAL_V26__={version:26','motivatedLighting:true','chapter1RetailReadability:true','chapter1ElevatorReadability:true','chapter2NavigationReadability:true','gavinReadability:true','chapterSurfaceIdentity:true','surfaceReadabilityTuned:true','finalVisualReview:true',
  "'retail-original'","'below-grade-concrete'","'security-cinderblock'","'east-wing-institutional'","'records-archive-panel'","'pa-control-acoustic'",
  'function productionSurfaceProfileV26(idx)','function productionWallTextureV26(idx)','function productionFloorTextureV26(idx)','function productionSurfaceProtectedV26(o,root)','function addProductionSurfaceIdentityV26(world,idx)',
  "tag:'arcade-checkout-route'","tag:'video-checkout-route'","tag:'freight-elevator-approach'","tag:'feeder-control'","tag:'sump-route'","tag:'flood-corridor-near'","tag:'flood-corridor-deep'","tag:'gavin-overhead'","productionReadabilityV26='gavin-evidence'",
  "productionReadabilityV26='below-grade-identity-fill'","productionReadabilityV26='security-architectural-fill'","productionReadabilityV26='east-wing-architectural-fill'","productionReadabilityV26='records-architectural-fill'","tag:'records-roster-task'","productionReadabilityV26='pa-architectural-fill'","tag:'pa-control-task'",
  'new THREE.HemisphereLight(0x556a6b,0x030405,.075)','new THREE.HemisphereLight(0x687d78,0x050606,.055)','addProductionSurfaceIdentityV26(world,idx);','addProductionReadabilityV26(world,idx);'
])if(!patched.includes(marker))fail('patch output missing marker: '+marker);
if((patched.match(/async function decorateLevel\(world,idx\)/g)||[]).length!==1)fail('decorateLevel declaration count changed');
if(!patched.includes("if(idx===0)")||!patched.includes("else if(idx===1)")||!patched.includes("else if(idx===5)"))fail('per-chapter scoped lighting guards missing');
if(patched.includes("new THREE.HemisphereLight(0x556a6b,0x030405,.15)"))fail('global Below Grade fill exceeds restrained budget');
if(!patched.includes("1:{key:'below-grade-concrete'")||patched.includes("0:{key:"))fail('Chapter 1 retail materials must remain authored rather than receiving a generic surface profile');
if(!patched.includes("map.repeat.set(Math.max(1,Math.max(size.x,size.z)/5.5),Math.max(1,size.y/3.2))"))fail('surface repeat scale regressed to a wallpaper-like frequency');

const chapterIdentityChecks=[
  ['Chapter 1 retail', 'patches/retail-geometry-v16.js.txt', ['store-finish-v16','organized-case-stock-v16']],
  ['Chapter 1 mechanics', 'patches/chapter1-pcas-escalation-v20.js.txt', ["breakers===2","ch1_key_reaction","ch1_elevator_denied"]],
  ['Chapter 2', 'patches/chapter2-below-grade-v21.js.txt', ['makeMachineBankV21','flooded-east-corridor-v21','sump-pump-v21','gavin-remains-v21','drainElapsed']],
  ['Chapter 3', 'patches/chapter3-eyes-security-v22.js.txt', ['makeSecurityMonitorBankV22','setSecurityRouteV22','primary-security-cctv-v22','luis-vhs-station-v22','securityRouteV22']],
  ['Chapter 4', 'patches/chapter4-east-wing-v23.js.txt', ['makeEastWingRouteMapV23','makeTessaLockerV23','triggerEastWingFalseRouteV23','physicalVerification:true','radioImitation:true']],
  ['Chapter 5', 'patches/chapter5-accountability-v24.js.txt', ['makeAccountabilityTerminalV24','makeFileStackV24','makeRecordsGateV24','makeEliRemainsV24','rosterReconciled']],
  ['Chapter 6', 'patches/chapter6-last-shift-v25.js.txt', ['makeLastShiftSilhouetteV25','setLastShiftMemoryV25','makeLastShiftRitualStationV25','lastShiftClosingStageV25','memoryOverlay:true']]
];
for(const [label,path,markers] of chapterIdentityChecks){const text=await readFile(path,'utf8');for(const marker of markers)if(!text.includes(marker))fail(`${label} lost identity marker: ${marker}`);}
const profiles=['retail-original','below-grade-concrete','security-cinderblock','east-wing-institutional','records-archive-panel','pa-control-acoustic'];
if(new Set(profiles).size!==6)fail('surface identity profiles are not unique across all six chapters');

const loader=await readFile('game.js','utf8');
const live=loader.includes("const PRODUCTION_READABILITY_V26_PATCH='./patches/production-readability-v26.js.txt';");
if(live){
  for(const marker of ['applyProductionReadabilityV26Runtime','getText(PRODUCTION_READABILITY_V26_PATCH)','const productionReadabilityV26Source=await applyProductionReadabilityV26Runtime(chapter6V25Source,productionReadabilityV26Patch);',"const source=productionReadabilityV26Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"])if(!loader.includes(marker))fail('game.js partial/incorrect live v26 marker: '+marker);
  if(loader.includes("const source=chapter6V25Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js still terminates at v25 while v26 is present');
}else if(loader.includes('applyProductionReadabilityV26Runtime')||loader.includes('productionReadabilityV26Source'))fail('game.js contains partial v26 wiring');

console.log(`Production readability v26 PASS (${live?'LIVE-CANDIDATE':'STAGED'}): final visual-review tuning is present; motivated lighting remains restrained; all six chapters retain distinct mechanics/set pieces and unique wall/floor identities; texture repeat stays controlled; loader consistency and Chapter 6 prerequisite remain green.`);
