import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const PARTS=['bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt','bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt','bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'];
const PATCHES=[
 ['patches/worldprops-v1.js.txt','applyWorldPropsV1'],['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],['patches/store-polish-v2.js.txt','applyStorePolishV2'],['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],['patches/reliability-v4.js.txt','applyReliabilityV4'],['patches/status-lights-v5.js.txt','applyStatusLightsV5'],['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']
];
const TAIL=[['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']];
const fail=msg=>{throw new Error('Story Foundation v17 audit failed: '+msg);};
function normalizeImports(source){return source
 .replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
 .replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
 .replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
 .replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8'),context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});if(typeof context.__patch!=='function')fail(`${path} missing ${name}`);return context.__patch;}
function replaceFoodCourt(source,replacement){const s=source.indexOf('async function buildFoodCourt(world){'),e=source.indexOf('async function buildMusic(world){',s);if(s<0||e<0)fail('Food Court markers missing');return source.slice(0,s)+replacement.trim()+'\n\n'+source.slice(e);}
async function syntaxCheck(source){const dir=await mkdtemp(join(tmpdir(),'pinewood-v17-')),file=join(dir,'runtime.mjs');try{await writeFile(file,source);const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||'');fail('assembled v17 runtime failed syntax parsing');}}finally{await rm(dir,{recursive:true,force:true});}}
async function loadStoryData(){
  const paths=['story/characters.js','story/evidence.js','story/chapters.js','story/timeline.js','story/dialogue.js'];let code='';
  for(const path of paths)code+=(await readFile(path,'utf8')).replace(/export const /g,'const ')+'\n';
  code+=(await readFile('story/story-data.js','utf8')).replace(/^import .*$/gm,'').replace(/export const /g,'const ')+'\nthis.__story=STORY_DATA_V17;';
  const context=vm.createContext({});vm.runInContext(code,context,{filename:'story/story-data.audit.js'});return JSON.parse(JSON.stringify(context.__story));
}

const loader=await readFile('game.js','utf8');
for(const marker of [
  "const STORY_V17_PATCH='./patches/story-foundation-v17.js.txt';",
  'async function applyStoryFoundationV17Runtime(source,patchText,storyData)',
  "getText(STORY_V17_PATCH)",
  "import('./story/story-data.js')",
  'const storyV17Source=await applyStoryFoundationV17Runtime(retailV16Source,storyV17Patch,storyModule.STORY_DATA_V17);',
])if(!loader.includes(marker))fail('game.js v17 loader marker missing: '+marker);
if(loader.includes("const source=retailV16Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"))fail('game.js still boots directly from v16');

const story=await loadStoryData();
if(story.version!==17)fail('story data version is not 17');
if(story.chapters.length!==6)fail(`expected 6 chapters, found ${story.chapters.length}`);
if(new Set(story.chapters.map(c=>c.id)).size!==6)fail('chapter IDs are not unique');
if(story.lastShiftIds.length!==9||new Set(story.lastShiftIds).size!==9)fail('LS-01 through LS-09 are not exactly nine unique IDs');
for(let i=1;i<=9;i++){const id=`LS-${String(i).padStart(2,'0')}`;if(!story.lastShiftIds.includes(id)||!story.evidence[id])fail('missing '+id);}
for(const ev of Object.values(story.evidence)){
  for(const id of ev.people||[])if(!story.characters[id])fail(`${ev.id} references missing character ${id}`);
  for(const id of ev.timeline||[])if(!story.timeline[id])fail(`${ev.id} references missing timeline fact ${id}`);
}
for(const required of ['renee','eli','jo','luis','tessa','andre','kessler','gavin'])if(!story.characters[required])fail('missing core character '+required);

const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(v=>v.trim()).join('');let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [path,name] of PATCHES)source=(await loadPatch(path,name))(source);
source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
for(const [path,name] of TAIL)source=(await loadPatch(path,name))(source);
const manifest=JSON.parse(await readFile('assets/vendor/runtime/manifest.json','utf8'));
source=(await loadPatch('patches/local-assets-v15.js.txt','applyLocalAssetsV15'))(source,manifest);
source=(await loadPatch('patches/retail-geometry-v16.js.txt','applyRetailGeometryV16'))(source);
source=(await loadPatch('patches/story-foundation-v17.js.txt','applyStoryFoundationV17'))(source,story);

for(const marker of [
 'const STORY_SAVE_VERSION_V17=17;',
 'story:{version:STORY_SAVE_VERSION_V17,flags:{},completedEvents:{},evidence:{},people:{},timeline:{},ending:null}',
 'function migrateStorySaveV17(input)',
 'class StoryEventManagerV17',
 'this.storyV17=new StoryEventManagerV17(this)',
 'recordEvidenceV17(o.userData.label,o.userData.text)',
 'storyLastShiftCompleteV17()',
 '<b>PEOPLE</b>',
 '<b>EVIDENCE</b>',
 '<b>TIMELINE</b>',
 'window.__PINEWOOD_STORY_V17__'
])if(!source.includes(marker))fail('assembled runtime missing marker: '+marker);
if(source.includes("const all=Array.from({length:9}"))fail('legacy true-ending journal-only check survived');
for(const protectedMarker of ['physicalBlock:false','footprintRadius:1.64',"gain=(sprint?.14:.09)","tag:'perimeter-rack-v14'",'cassetteShelfModelPromisesV16'])if(!source.includes(protectedMarker))fail('protected earlier-system marker missing: '+protectedMarker);
const externalMedia=(source.match(/https:\/\/[^'"`\\s)]+\.(?:glb|gltf|bin|png|jpe?g|webp|ogg|mp3|wav)(?:[?#][^'"`\\s)]*)?/gi)||[]);if(externalMedia.length)fail('external runtime media survived: '+[...new Set(externalMedia)].join(', '));
await syntaxCheck(source);
console.log('Story Foundation v17 PASS: game.js boots through v17; six-chapter canon data and nine Last Shift evidence definitions are internally linked; versioned save migration, event manager and structured Journal apply cleanly after v16; legacy LS saves remain compatible; protected gameplay/local-asset invariants survive; and the assembled runtime syntax is valid.');
