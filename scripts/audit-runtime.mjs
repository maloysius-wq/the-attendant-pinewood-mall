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
  ['patches/reliability-v4.js.txt', 'applyReliabilityV4']
];

function fail(message) {
  throw new Error(`Runtime audit failed: ${message}`);
}

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
  for (const marker of markers) {
    if (!source.includes(marker)) fail(`${label} marker missing: ${marker}`);
  }
}

async function syntaxCheck(name, source) {
  const dir = await mkdtemp(join(tmpdir(), 'pinewood-audit-'));
  const file = join(dir, `${name}.mjs`);
  try {
    await writeFile(file, source, 'utf8');
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
      process.stderr.write(result.stdout || '');
      process.stderr.write(result.stderr || '');
      fail(`${name} failed Node syntax parsing`);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const loader = await readFile('game.js', 'utf8');
await syntaxCheck('game-loader', loader);
requireMarkers(loader, [
  "const INDUSTRIAL_PATCH='./patches/industrial-cc0-v1.js.txt';",
  "const RELIABILITY_PATCH='./patches/reliability-v4.js.txt';",
  'const reliabilitySource=await applyReliability(systemsSource,reliabilityPatch);',
  'const source=replaceFoodCourt(reliabilitySource,foodPatch)'
], 'game.js');

const payload = (await Promise.all(PARTS.map(path => readFile(path, 'utf8')))).map(text => text.trim()).join('');
let source;
try {
  source = gunzipSync(Buffer.from(payload, 'base64')).toString('utf8');
} catch (error) {
  fail(`bundle2 decode failed: ${error.message}`);
}
source = normalizeImports(source);

for (const [path, functionName] of PATCHES) {
  const patch = await loadPatch(path, functionName);
  source = patch(source);
  if (typeof source !== 'string' || source.length < 1000) fail(`${path} returned an invalid runtime`);
}

source = replaceFoodCourt(source, await readFile('patches/foodcourt-v3.js.txt', 'utf8'));

requireMarkers(source, [
  'breakers:3',
  'breakerCabinet',
  'elevatorFrame',
  'elevatorDoorHalf',
  "const inside=local.x>.58&&local.x<1.62&&Math.abs(local.z)<.62",
  "u.state='ride'",
  'doorBlocker.disabled=',
  'KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0/b0ca9bd96a8072ab36a3a5464f00ed1e06a16d07',
  'SAVE.settings.muzak?.126:0',
  'this.mallRate=.5',
  'this.mallEchoA',
  'preservesPitch=false',
  'this.syncMallEchoes(false)',
  'THREE.ClampToEdgeWrapping'
]);

for (const retired of [
  'SAVE.settings.muzak?.224:0',
  'SAVE.settings.muzak?.157:0'
]) {
  if (source.includes(retired)) fail(`retired marker survived: ${retired}`);
}

await syntaxCheck('patched-runtime', source);
console.log(`Runtime audit PASS: ${source.length.toLocaleString()} patched source characters parsed successfully.`);
console.log('Verified patch order, CC0 breaker/elevator wiring, physical elevator entry, Food Court v3 clamping, and warped mall-music markers.');
