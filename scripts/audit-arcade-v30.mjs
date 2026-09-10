import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';

const fail=m=>{throw new Error('Sunburst Arcade v30 audit failed: '+m);};
const game=await readFile('game.js','utf8');
const patch=await readFile('patches/arcade-rebuild-v30.js.txt','utf8');
const manifest=JSON.parse(await readFile('assets/vendor/arcade-v30/manifest.json','utf8'));
const geometry=JSON.parse(await readFile('diagnostics/arcade-v30-geometry.json','utf8'));
const readme=await readFile('assets/vendor/arcade-v30/token_gesture/README.md','utf8');

if(manifest.version!==30||manifest.license!=='CC0 1.0')fail('local CC0 manifest missing');
if(manifest.scale!=='real-world metres, base-centred pivots')fail('real-world scale provenance missing');
if(!readme.includes('1 Blender unit = 1 metre')||!readme.includes('Built to real-world scale'))fail('vendor scale documentation missing');
const pack=manifest.files.find(f=>f.path==='./assets/vendor/arcade-v30/token_gesture/pack.glb');if(!pack||pack.bytes<1000000||!/^[a-f0-9]{64}$/.test(pack.sha256))fail('local Token Gesture GLB missing or invalid');
const required=['arcade_upright_alpha','arcade_upright_beta','arcade_upright_gamma','claw_machine','dance_stage','driving_cab','pinball','prize_wall','skee_ball','ticket_eater','token_changer','air_hockey_table','arcade_cocktail'];
const props=new Map((geometry.props||[]).map(p=>[p.name,p]));for(const name of required)if(!props.has(name))fail('geometry metadata missing '+name);
for(const name of ['arcade_upright_alpha','arcade_upright_beta','arcade_upright_gamma','claw_machine','dance_stage','skee_ball'])if(Number(props.get(name)?.size?.y)<1.8)fail(name+' is not human-scale');
if(Math.abs(Number(props.get('air_hockey_table')?.size?.x)-1.9)>.08||Math.abs(Number(props.get('air_hockey_table')?.size?.z)-1.02)>.08)fail('air hockey dimensions changed');

for(const marker of [
  "./assets/vendor/arcade-v30/token_gesture/pack.glb",
  "obj.scale.set(1,1,1)",
  "realWorldScale=1",
  "world.addColliderFrom(obj,{navBlock:true,pad:.03})",
  "clearance=.08",
  "intersections.length",
  "entranceBlocked.length",
  "window.__PINEWOOD_ARCADE_V30__",
  "makeSharedRetailCheckoutV16(world,-14.1,-29,0,'arcadeCash',Math.PI)",
  "addStorefront(world,{name:'SUNBURST ARCADE',theme:'arcade',x:-18,z:-18.48,face:'south'})",
  "addWallPoster(world,makeMarketingPoster('arcade','GALAXY STRIKE'",
  "addWallPoster(world,makeMarketingPoster('arcade','TOKEN FRENZY'",
  "addWallPoster(world,makeMarketingPoster('arcade','PRIZE VAULT'",
  "addNeonTube(world,new THREE.Vector3(-25.4,2.35,-20)",
  "addNeonTube(world,new THREE.Vector3(-11.6,2.35,-20)",
  "makeCabinet(new THREE.Vector3(-24.35,0,-28.9),0)",
  "makePickup('decoy',new THREE.Vector3(-19.7,.16,-28.1),'Noise Maker')",
  "protectedInteractables:['arcade-cabinet','noise-maker']",
  "const vhsMarker='function makeVideoRentalShelf(seed=0,{width=1.65,height=1.95,depth=.54,doubleSided=true}={}){'",
  "const oldVhsCall='makeVHSCase(tapeSeed++,faceOut)'",
  "function makeVHSCaseV30(seed=0,faceOut=false)",
  "makeVHSCaseV30(tapeSeed++,faceOut)",
  "vhsCaseCompatV30=true",
  "videoPlanetCompat:'makeVHSCaseV30-v30'"
])if(!patch.includes(marker))fail('patch marker missing '+marker);
for(const guessed of ['world.createStoreShell','world.addLight(','world.addColliderFromObject','world.registerProp']){
  const occurrences=patch.split(guessed).length-1;if(occurrences!==1)fail('unproven API may exist outside explicit rejection guard: '+guessed);
}
for(const retired of ['ASSETS.arcadeMachine','ASSETS.airHockey','ASSETS.basketballGame','ASSETS.clawMachine','ASSETS.prize']){
  const occurrences=patch.split(retired).length-1;if(occurrences!==1)fail('retired Mini Arcade marker may exist outside rejection guard: '+retired);
}
for(const marker of [
  "const ARCADE_V30_PATCH='./patches/arcade-rebuild-v30.js.txt';",
  'applyArcadeRebuildV30Runtime',
  'getText(ARCADE_V30_PATCH)',
  'const arcadeV30Source=await applyArcadeRebuildV30Runtime(freightElevatorV28Source,arcadeV30Patch);',
  'applyAudioDirectionV27Runtime(arcadeV30Source,audioDirectionV27Patch,characterVoiceManifest)'
])if(!game.includes(marker))fail('game loader marker missing '+marker);

const old=await readFile('diagnostics/arcade-current-source.txt','utf8');
const fake=`function makeVideoRentalShelf(seed=0,{width=1.65,height=1.95,depth=.54,doubleSided=true}={}){let tapeSeed=seed,faceOut=false;return makeVHSCase(tapeSeed++,faceOut);}\n${old}\nasync function buildVHS(world){}\n`;
const context=vm.createContext({console});vm.runInContext(`${patch}\nthis.apply=applyArcadeRebuildV30;`,context);
const rebuilt=context.apply(fake);const start=rebuilt.indexOf('async function buildArcade(world){'),end=rebuilt.indexOf('\nasync function buildVHS(world){',start),section=rebuilt.slice(start,end);
if(start<0||end<0)fail('rebuilt arcade section missing');
if(!rebuilt.includes('function makeVHSCaseV30(seed=0,faceOut=false)')||!rebuilt.includes('return makeVHSCaseV30(tapeSeed++,faceOut);'))fail('explicit Video Planet v30 helper binding missing after patch application');
if(rebuilt.includes('return makeVHSCase(tapeSeed++,faceOut);'))fail('legacy undefined Video Planet VHS helper call survived patch application');
for(const retired of ['ASSETS.arcadeMachine','ASSETS.airHockey','ASSETS.basketballGame','ASSETS.clawMachine','ASSETS.prize'])if(section.includes(retired))fail('retired miniature asset survived rebuilt arcade: '+retired);
for(const guessed of ['world.createStoreShell','world.addLight(','world.addColliderFromObject','world.registerProp'])if(section.includes(guessed))fail('unproven API survived rebuilt arcade: '+guessed);
if((section.match(/node:'/g)||[]).length!==13)fail('expected 13 full-scale layout fixtures');
for(const preserved of ["addStorefront(world,{name:'SUNBURST ARCADE'","GALAXY STRIKE","TOKEN FRENZY","PRIZE VAULT","makeSharedRetailCheckoutV16(world,-14.1,-29","makeCabinet(new THREE.Vector3(-24.35,0,-28.9),0)","makePickup('decoy',new THREE.Vector3(-19.7,.16,-28.1),'Noise Maker')"])if(!section.includes(preserved))fail('preserved arcade behavior missing: '+preserved);
const temp='/tmp/pinewood-arcade-v30-patch.mjs';await writeFile(temp,patch);execFileSync('node',['--check',temp],{stdio:'inherit'});
console.log('Sunburst Arcade v30 audit passed: 13 real-world-scale CC0 fixtures replace the Mini Arcade set; the established storefront, posters, neon, checkout, cabinet interaction and Noise Maker pickup are preserved; Video Planet is explicitly rebound to makeVHSCaseV30; only proven Pinewood world APIs are used; local-only provenance, scale guards, entrance clearance and no-intersection runtime checks are present; v30 feeds into terminal Audio Direction v27.');
