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
  'window.__PINEWOOD_VISUAL_V26__={version:26','motivatedLighting:true','chapter1RetailReadability:true','chapter1ElevatorReadability:true','chapter2NavigationReadability:true','gavinReadability:true',
  "tag:'arcade-checkout-route'","tag:'video-checkout-route'","tag:'freight-elevator-approach'","tag:'sump-route'","tag:'flood-corridor-near'","tag:'flood-corridor-deep'","tag:'gavin-overhead'","productionReadabilityV26='gavin-evidence'",
  'new THREE.HemisphereLight(0x556a6b,0x030405,.075)','addProductionReadabilityV26(world,idx);'
])if(!patched.includes(marker))fail('patch output missing marker: '+marker);
if((patched.match(/async function decorateLevel\(world,idx\)/g)||[]).length!==1)fail('decorateLevel declaration count changed');
if(!patched.includes("if(idx===0)")||!patched.includes("else if(idx===1)"))fail('Chapter 1/2 scoped lighting guards missing');
if(patched.includes("new THREE.HemisphereLight(0x556a6b,0x030405,.15)"))fail('global Below Grade fill exceeds restrained budget');

const loader=await readFile('game.js','utf8');
const live=loader.includes("const PRODUCTION_READABILITY_V26_PATCH='./patches/production-readability-v26.js.txt';");
if(live){
  for(const marker of ['applyProductionReadabilityV26Runtime','getText(PRODUCTION_READABILITY_V26_PATCH)','const productionReadabilityV26Source=await applyProductionReadabilityV26Runtime(chapter6V25Source,productionReadabilityV26Patch);',"const source=productionReadabilityV26Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"])if(!loader.includes(marker))fail('game.js partial/incorrect live v26 marker: '+marker);
  if(loader.includes("const source=chapter6V25Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js still terminates at v25 while v26 is present');
}else if(loader.includes('applyProductionReadabilityV26Runtime')||loader.includes('productionReadabilityV26Source'))fail('game.js contains partial v26 wiring');

console.log(`Production readability v26 PASS (${live?'LIVE-CANDIDATE':'STAGED'}): motivated Chapter 1 retail/elevator and Chapter 2 navigation/Gavin lighting is scoped, restrained and loader-consistent; Chapter 6 prerequisite audit remains green.`);
