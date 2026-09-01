import { readFile, writeFile } from 'node:fs/promises';

function fail(message){ throw new Error(`Retail Geometry v16 hotfix failed: ${message}`); }
function replaceOnce(source,label,needle,replacement){
  const first=source.indexOf(needle);
  if(first<0) fail(`${label}: marker missing`);
  if(source.indexOf(needle,first+needle.length)>=0) fail(`${label}: marker is not unique`);
  return source.slice(0,first)+replacement+source.slice(first+needle.length);
}

const patchPath='patches/retail-geometry-v16.js.txt';
let patch=await readFile(patchPath,'utf8');

if(!patch.includes('cassetteShelfModelPromisesV16')){
  const anchor=`  // Cassette merchandise now reads as dense rows of upright cassette cases with visible spines.\n`;
  const cachePatch=`  // Load each Kenney cassette shelf model once, then clone the verified imported scene for every fixture.\n  // This prevents repeated GLTF waits from dropping a perimeter rack in software-WebGL/slow-device boots.\n  replaceRange(\n    'cached Cassette Castle shelf loading',\n    'async function placeCassetteGrounded(parent,name,pos,{targetHeight,rot=0,collide=true,navBlock=true,pad=.045,tag=null}={}){',\n    '\\nasync function placeCassetteOnSurface(',\n\`const cassetteShelfModelPromisesV16=new Map();\nasync function cassetteShelfModelV16(name){\n  if(!cassetteShelfModelPromisesV16.has(name))cassetteShelfModelPromisesV16.set(name,assets.model(name));\n  const prototype=await cassetteShelfModelPromisesV16.get(name);\n  return prototype?prototype.clone(true):null;\n}\nasync function placeCassetteGrounded(parent,name,pos,{targetHeight,rot=0,collide=true,navBlock=true,pad=.045,tag=null}={}){\n  const m=(name==='cassetteShelfWall'||name==='cassetteShelfLow')?await cassetteShelfModelV16(name):await assets.model(name);\n  if(!m){console.warn('Cassette Castle skipped missing CC0 model: '+name);return null;}\n  m.rotation.set(0,rot,0);m.scale.setScalar(1);m.position.set(pos.x,0,pos.z);parent.add(m);\n  if(!cassetteScaleToHeight(m,targetHeight)){parent.remove(m);console.warn('Cassette Castle skipped invalid model bounds: '+name);return null;}\n  let box=cassetteWorldBox(m);m.position.y+=pos.y-box.min.y;m.updateWorldMatrix(true,true);box=cassetteWorldBox(m);\n  m.userData.cassetteGrounded=true;if(tag)m.userData.cassetteFixture=tag;\n  if(collide)GAME.world.addColliderFrom(m,{navBlock,pad});\n  return {obj:m,box,name};\n}\`\n  );\n\n`;
  patch=replaceOnce(patch,'cassette shelf cache insertion',anchor,cachePatch+anchor);
}

patch=patch.replace(
  `    \"  attachElevatorPiece(left,'elevatorDoorHalf',new THREE.Vector3(.09,2.80,.92),new THREE.Vector3(0,1.40,0),new THREE.Euler(0,Math.PI/2,0));\"`,
  `    \"  attachElevatorPiece(left,'elevatorWall',new THREE.Vector3(.09,2.80,.92),new THREE.Vector3(0,1.40,0),new THREE.Euler(0,Math.PI/2,0));\"`
);
patch=patch.replace(
  `    \"  attachElevatorPiece(right,'elevatorDoorHalf',new THREE.Vector3(.09,2.80,.92),new THREE.Vector3(0,1.40,0),new THREE.Euler(0,Math.PI/2,0));\"`,
  `    \"  attachElevatorPiece(right,'elevatorWall',new THREE.Vector3(.09,2.80,.92),new THREE.Vector3(0,1.40,0),new THREE.Euler(0,Math.PI/2,0));\"`
);
patch=patch.replace(
  `  // Freight elevator: align both leaves to the same facade center, close without a seam,\n  // and extend the visible leaves/cab shell to the full opening height.`,
  `  // Freight elevator: align both leaves to the same facade center and use the locally vendored\n  // Kenney Factory wall panel for clean full-height moving steel leaves. The warped door-wide-half\n  // mesh remains provenance-only and is no longer used for visible elevator doors.`
);
patch=patch.replace(
  `    \"makeSharedRetailCheckoutV16(world,13.40,28.72\",\"new THREE.Vector3(.09,2.80,.92)\",\"'elevator-front'\",\"'arcade-checkout'\",\"'video-checkout'\"`,
  `    \"makeSharedRetailCheckoutV16(world,13.40,28.72\",\"cassetteShelfModelPromisesV16\",\"attachElevatorPiece(left,'elevatorWall'\",\"attachElevatorPiece(right,'elevatorWall'\",\"'elevator-front'\",\"'arcade-checkout'\",\"'video-checkout'\"`
);
if(!patch.includes("attachElevatorPiece(left,'elevatorWall'")||!patch.includes("attachElevatorPiece(right,'elevatorWall'"))fail('clean imported elevator leaves were not installed');
if(!patch.includes('cassetteShelfModelPromisesV16'))fail('cassette shelf cache was not installed');
await writeFile(patchPath,patch,'utf8');

const auditPath='scripts/audit-retail-geometry-v16.mjs';
let audit=await readFile(auditPath,'utf8');
if(!audit.includes("'cassette shelf cache'")){
  const stockAnchor="const stock=section(source,'async function stockCassetteFixture(',";
  const cacheAudit=`const shelfCache=section(source,'const cassetteShelfModelPromisesV16=new Map();','\\nasync function placeCassetteOnSurface(','cassette shelf cache');\nfor(const marker of [\"assets.model(name)\",\"prototype.clone(true)\",\"name==='cassetteShelfWall'||name==='cassetteShelfLow'\"])if(!shelfCache.includes(marker))fail('cassette shelf one-load cache marker missing: '+marker);\n\n`;
  audit=replaceOnce(audit,'cassette cache audit insertion',stockAnchor,cacheAudit+stockAnchor);
}
audit=audit.replace(
  `  'left.position.set(0,0,closedL);right.position.set(0,0,closedR)',\n  \"new THREE.Vector3(.09,2.80,.92),new THREE.Vector3(0,1.40,0)\",`,
  `  'left.position.set(0,0,closedL);right.position.set(0,0,closedR)',\n  \"attachElevatorPiece(left,'elevatorWall',new THREE.Vector3(.09,2.80,.92)\",\n  \"attachElevatorPiece(right,'elevatorWall',new THREE.Vector3(.09,2.80,.92)\",`
);
audit=audit.replace(
  'Retail Geometry v16 PASS: cassette stock is organized upright in cases, full/low cassette fixtures are matte black, Cassette wall overlays no longer cover posters, all retail checkouts use the Food Court counter design, the elevator facade/leaves are centered and full-height, protected navigation/audio/local-assets invariants survive, and final runtime syntax is valid.',
  'Retail Geometry v16 PASS: cassette stock is organized upright in cases, shelf models load once and clone reliably, full/low cassette fixtures are matte black, Cassette wall overlays no longer cover posters, all retail checkouts use the Food Court counter design, elevator leaves use clean imported Kenney Factory panels rather than the warped half-door mesh, protected navigation/audio/local-assets invariants survive, and final runtime syntax is valid.'
);
if(!audit.includes("attachElevatorPiece(left,'elevatorWall'")||!audit.includes('cassette shelf one-load cache marker'))fail('v16 audit was not hardened');
await writeFile(auditPath,audit,'utf8');

const capturePath='scripts/capture-store-visuals.mjs';
let capture=await readFile(capturePath,'utf8');
if(!capture.includes('remoteRequests')){
  capture=replaceOnce(capture,'visual remote request collector',
    `    const consoleMessages=[];\n    page.on('console',msg=>consoleMessages.push({type:msg.type(),text:msg.text()}));`,
    `    const consoleMessages=[],remoteRequests=[];\n    const allowedOrigin=new URL(base).origin;\n    page.on('request',request=>{try{const u=new URL(request.url());if((u.protocol==='http:'||u.protocol==='https:')&&u.origin!==allowedOrigin)remoteRequests.push(request.url());}catch{}});\n    page.on('console',msg=>consoleMessages.push({type:msg.type(),text:msg.text()}));`
  );
  capture=replaceOnce(capture,'visual remote request success gate',
    `      report.views[view]={ok:true,info,failureText,consoleMessages};`,
    `      const uniqueRemote=[...new Set(remoteRequests)];\n      if(uniqueRemote.length)report.failed=true;\n      report.views[view]={ok:uniqueRemote.length===0,info,failureText,consoleMessages,remoteRequests:uniqueRemote};`
  );
  capture=replaceOnce(capture,'visual remote request failure report',
    `      report.views[view]={ok:false,error:err.stack||String(err),failureText,bodyText,consoleMessages};`,
    `      report.views[view]={ok:false,error:err.stack||String(err),failureText,bodyText,consoleMessages,remoteRequests:[...new Set(remoteRequests)]};`
  );
}
if(!capture.includes('allowedOrigin')||!capture.includes('remoteRequests'))fail('visual network-origin gate was not installed');
await writeFile(capturePath,capture,'utf8');

console.log('Retail Geometry v16 hotfix applied: cached cassette shelf clones, clean imported elevator leaves, strengthened audit, and browser-origin visual gate.');
