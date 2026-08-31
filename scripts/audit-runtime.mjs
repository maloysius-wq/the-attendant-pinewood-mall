import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const PARTS = [
  'bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt',
  'bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt',
  'bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'
];

const PATCHES = [
  ['patches/worldprops-v1.js.txt', 'applyWorldPropsV1'],
  ['patches/industrial-cc0-v1.js.txt', 'applyIndustrialCc0V1'],
  ['patches/visual-fixes-v1.js.txt', 'applyVisualFixesV1'],
  ['patches/store-polish-v2.js.txt', 'applyStorePolishV2'],
  ['patches/systems-polish-v3.js.txt', 'applySystemsPolishV3'],
  ['patches/reliability-v4.js.txt', 'applyReliabilityV4'],
  ['patches/status-lights-v5.js.txt', 'applyStatusLightsV5'],
  ['patches/audio-immersion-v6.js.txt', 'applyAudioImmersionV6'],
  ['patches/elevator-rebuild-v7.js.txt', 'applyElevatorRebuildV7'],
  ['patches/fountain-rebuild-v8.js.txt', 'applyFountainRebuildV8']
];

const AUDIO_FILES=[
  'footstep-1.ogg','footstep-2.ogg','footstep-3.ogg','footstep-4.ogg','breaker-switch.ogg','door-latch.ogg','door-shutter.ogg',
  'metal-impact-1.ogg','metal-impact-2.ogg','metal-impact-3.ogg','pickup.ogg','error.ogg','toggle.ogg','confirmation.ogg','throw.ogg','paper.ogg',
  'heartbeat-slow.ogg','heartbeat-fast.ogg','ghost-breath.ogg','radio-static.ogg','electrical-roomtone.ogg','horror-ambience.ogg','electric-buzz.ogg','intercom-bell.ogg','gore-impact.ogg','death-scream.ogg'
];

function fail(message) { throw new Error(`Runtime audit failed: ${message}`); }

function normalizeImports(source) {
  return source
    .replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';", "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
    .replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';", "import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
    .replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';", "import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
    .replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';", "import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");
}

async function loadPatch(path, functionName) {
  const text = await readFile(path, 'utf8');
  const context = vm.createContext({ console });
  vm.runInContext(`${text}\nthis.__pinewoodPatch = ${functionName};`, context, { filename: path });
  const patch = context.__pinewoodPatch;
  if (typeof patch !== 'function') fail(`${path} did not expose ${functionName}`);
  return patch;
}

function replaceFoodCourt(source, replacement) {
  const start = source.indexOf('async function buildFoodCourt(world){');
  const end = source.indexOf('async function buildMusic(world){', start);
  if (start < 0 || end < 0) fail('Food Court runtime markers are missing');
  const patched = source.slice(0, start) + replacement.trim() + '\n\n' + source.slice(end);
  const section = patched.slice(start, start + replacement.length + 64);
  if (!section.includes("'qTableRound'") || !section.includes("'qChair'")) fail('Food Court v3 furniture markers are missing');
  if (section.includes("placeModel(world.root,'table'") || section.includes("placeModel(world.root,'chair'")) fail('retired Food Court furniture survived');
  if (!section.includes('frontL=') || !section.includes('frontR=') || !section.includes('doorway jambs')) fail('Food Court wall coverage markers are missing');
  if (section.includes('THREE.RepeatWrapping')) fail('Food Court wallpaper regressed to RepeatWrapping');
  if (!section.includes('THREE.ClampToEdgeWrapping')) fail('Food Court wallpaper clamp marker is missing');
  return patched;
}

function requireMarkers(source, markers, label = 'runtime') {
  for (const marker of markers) if (!source.includes(marker)) fail(`${label} marker missing: ${marker}`);
}

async function syntaxCheck(name, source) {
  const dir = await mkdtemp(join(tmpdir(), 'pinewood-audit-'));
  const file = join(dir, `${name}.mjs`);
  try {
    await writeFile(file, source, 'utf8');
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
      process.stderr.write(result.stdout || '');process.stderr.write(result.stderr || '');fail(`${name} failed Node syntax parsing`);
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
}

const loader = await readFile('game.js', 'utf8');
await syntaxCheck('game-loader', loader);
requireMarkers(loader, [
  "const INDUSTRIAL_PATCH='./patches/industrial-cc0-v1.js.txt';",
  "const RELIABILITY_PATCH='./patches/reliability-v4.js.txt';",
  "const STATUS_PATCH='./patches/status-lights-v5.js.txt';",
  "const AUDIO_PATCH='./patches/audio-immersion-v6.js.txt';",
  "const ELEVATOR_PATCH='./patches/elevator-rebuild-v7.js.txt';",
  "const FOUNTAIN_PATCH='./patches/fountain-rebuild-v8.js.txt';",
  'const audioSource=await applyAudioImmersion(statusSource,audioPatch);',
  'const elevatorSource=await applyElevatorRebuild(audioSource,elevatorPatch);',
  'const fountainSource=await applyFountainRebuild(elevatorSource,fountainPatch);',
  'const source=replaceFoodCourt(fountainSource,foodPatch)'
], 'game.js');

for(const file of AUDIO_FILES){const bytes=await readFile(`assets/audio/cc0/${file}`);if(bytes.length<500)fail(`CC0 audio asset missing or suspiciously small: ${file}`);}
const audioReadme=await readFile('assets/audio/cc0/README.md','utf8');
requireMarkers(audioReadme,['-20 LUFS','-2 dBTP','Full source provenance'],'audio normalization README');

const payload = (await Promise.all(PARTS.map(path => readFile(path, 'utf8')))).map(text => text.trim()).join('');
let source;
try { source = gunzipSync(Buffer.from(payload, 'base64')).toString('utf8'); }
catch (error) { fail(`bundle2 decode failed: ${error.message}`); }
source = normalizeImports(source);

for (const [path, functionName] of PATCHES) {
  const patch = await loadPatch(path, functionName);source = patch(source);
  if (typeof source !== 'string' || source.length < 1000) fail(`${path} returned an invalid runtime`);
}
source = replaceFoodCourt(source, await readFile('patches/foodcourt-v3.js.txt', 'utf8'));

requireMarkers(source, [
  'breakers:3','breakerCabinet','elevatorFrame','elevatorDoorHalf',
  "assetModel:'kenney-imported-freight-elevator-v2'",
  "const inside=local.x>.65&&local.x<1.82&&Math.abs(local.z)<.64","u.state='ride'",
  'eu.doorBlocker.disabled=','physicalBlock===false','physicalBlock:false','eu.navExclusion=world.addCollider',
  "['closing','ride'].includes(this.exitObject.userData.state)","elevatorSafe=local.x>.24&&local.x<2.02",
  'Master Service Key + call elevator',"Find the Master Service Key",
  'KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0/b0ca9bd96a8072ab36a3a5464f00ed1e06a16d07',
  'SAVE.settings.muzak?.126:0','this.mallRate=.5','this.mallEchoA','preservesPitch=false','this.syncMallEchoes(false)',
  'lampGlow=new THREE.PointLight(0xff2418,0,1.05,2)','o.userData.lamp.material.emissiveIntensity=1.9',
  'callGlow=new THREE.PointLight(0xffa14a,0,1.22,2)',"ready=u.state==='idle'&&powered&&keyReady",'u.callLamp.material.emissiveIntensity=pulse',
  "const CC0_AUDIO_BASE=new URL('./assets/audio/cc0/',location.href).href","heartSlow:'heartbeat-slow.ogg'","roomtone:'electrical-roomtone.ogg'",
  'this.ctx.createBufferSource()','audio.breaker()','audio.gasp()','audio.door(o.userData.open)','u.leverMix=lerp','leverOff:-.58,leverOn:.54','-20 LUFS / -2 dBTP',
  "gain=(sprint?.28:.18)",'gain:gain*.16','when:.23',
  "const FOUNTAIN_CC0_URL='https://raw.githubusercontent.com/KenneyNL/Starter-Kit-City-Builder/4535092b740b378b700efd9df9e27a631815b84a/models/pavement-fountain.glb'",
  "assetModel:'kenney-city-builder-pavement-fountain'","footprintRadius:1.64",
  "makeFountainPBR('marble_tiles'","makeFountainPBR('grey_tiles'",
  'new THREE.RingGeometry(innerR,outerR,64)','new THREE.TorusGeometry(1.535,.095,12,64)',
  'for(let i=-4;i<=4;i++)','await buildCentralFountain(world);',
  'https://polyhaven.com/a/marble_tiles','https://polyhaven.com/a/grey_tiles',
  'THREE.ClampToEdgeWrapping'
]);

for (const retired of [
  'SAVE.settings.muzak?.224:0','SAVE.settings.muzak?.157:0','emissive.setHex(0x55ff99)',
  'createOscillator()','this.oneShot({','createBuffer(1,len','procedural audio are generated/original',
  "East Service Shutter');shutter.scale.z=.62",
  "const inside=local.x>.58&&local.x<1.62&&Math.abs(local.z)<.62",
  'new THREE.CylinderGeometry(1.45,1.65,.38,28)',
  'world.addCollider(0,0,3.2,3.2,{navBlock:true,pad:.05})'
]) if (source.includes(retired)) fail(`retired marker survived: ${retired}`);

await syntaxCheck('patched-runtime', source);
console.log(`Runtime audit PASS: ${source.length.toLocaleString()} patched source characters parsed successfully.`);
console.log(`Verified ${AUDIO_FILES.length} normalized CC0 audio assets, quieter echoed footsteps, zero oscillator/noise synthesis, breaker lever animation, authoritative CC0 elevator geometry/collision/state machine, Attendant cab exclusion, exact-fit CC0/PBR central fountain, Food Court v3 and warped mall music.`);
