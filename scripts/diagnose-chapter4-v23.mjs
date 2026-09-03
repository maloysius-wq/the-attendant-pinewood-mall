import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import vm from 'node:vm';

const PARTS=['bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt','bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt','bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'];
const BASE=[['patches/worldprops-v1.js.txt','applyWorldPropsV1'],['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],['patches/store-polish-v2.js.txt','applyStorePolishV2'],['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],['patches/reliability-v4.js.txt','applyReliabilityV4'],['patches/status-lights-v5.js.txt','applyStatusLightsV5'],['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']];
const TAIL=[['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']];
const fail=msg=>{throw new Error('Chapter 4 v23 diagnostic failed: '+msg);};
function normalizeImports(source){return source.replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';").replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';").replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';").replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8'),ctx=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,ctx,{filename:path});if(typeof ctx.__patch!=='function')fail(`${path} missing ${name}`);return ctx.__patch;}
function replaceFoodCourt(source,replacement){const s=source.indexOf('async function buildFoodCourt(world){'),e=source.indexOf('async function buildMusic(world){',s);if(s<0||e<0)fail('Food Court markers missing');return source.slice(0,s)+replacement.trim()+'\n\n'+source.slice(e);}
async function storyData(){const paths=['story/characters.js','story/evidence.js','story/chapters.js','story/timeline.js','story/dialogue.js'];let code='';for(const p of paths)code+=(await readFile(p,'utf8')).replace(/export const /g,'const ')+'\n';code+=(await readFile('story/story-data.js','utf8')).replace(/^import .*$/gm,'').replace(/export const /g,'const ')+'\nthis.__story=STORY_DATA_V17;';const ctx=vm.createContext({});vm.runInContext(code,ctx);return JSON.parse(JSON.stringify(ctx.__story));}
function excerpt(source,needle,before=900,after=3600){const at=source.indexOf(needle);if(at<0)return `\n--- ${needle} NOT FOUND ---\n`;return `\n--- ${needle} @ ${at} ---\n${source.slice(Math.max(0,at-before),Math.min(source.length,at+after))}\n`;}

const story=await storyData(),voice=JSON.parse(await readFile('assets/audio/pa/manifest.json','utf8')),local=JSON.parse(await readFile('assets/vendor/runtime/manifest.json','utf8'));
const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(v=>v.trim()).join('');let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [p,n] of BASE)source=(await loadPatch(p,n))(source);source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));for(const [p,n] of TAIL)source=(await loadPatch(p,n))(source);
source=(await loadPatch('patches/local-assets-v15.js.txt','applyLocalAssetsV15'))(source,local);
source=(await loadPatch('patches/retail-geometry-v16.js.txt','applyRetailGeometryV16'))(source);
source=(await loadPatch('patches/story-foundation-v17.js.txt','applyStoryFoundationV17'))(source,story);
source=(await loadPatch('patches/chapter1-story-v18.js.txt','applyChapter1StoryV18'))(source);
source=(await loadPatch('patches/pcas-voice-v19.js.txt','applyPcasVoiceV19'))(source,voice);
source=(await loadPatch('patches/chapter1-pcas-escalation-v20.js.txt','applyChapter1PcasEscalationV20'))(source);
source=(await loadPatch('patches/chapter2-below-grade-v21.js.txt','applyChapter2BelowGradeV21'))(source);
source=(await loadPatch('patches/chapter3-eyes-security-v22.js.txt','applyChapter3EyesSecurityV22'))(source);
source=(await loadPatch('patches/chapter3-east-wing-handoff-v22b.js.txt','applyChapter3EastWingHandoffV22B'))(source);
source=(await loadPatch('patches/chapter3-security-readability-v22c.js.txt','applyChapter3SecurityReadabilityV22C'))(source);
source=(await loadPatch('patches/chapter3-security-readability-v22d.js.txt','applyChapter3SecurityReadabilityV22D'))(source);

if(!source.includes('readabilityPolish:true'))fail('live v22d marker missing from reconstructed source');
await writeFile('chapter4-v23-runtime.mjs',source);
const report=[
  `assembledBytes=${Buffer.byteLength(source,'utf8')}`,
  `levelArrayChapter4=${source.includes("Chapter 4: The East Wing")}`,
  excerpt(source,'const LEVELS='),
  excerpt(source,'async function carveChapter'),
  excerpt(source,'async function decorateLevel'),
  excerpt(source,'buildWorld('),
  excerpt(source,'startLevel('),
  excerpt(source,'winChapter('),
  excerpt(source,'beginPlay(){'),
  excerpt(source,'setupVisualTestV13'),
  excerpt(source,"SAVE.story.chapterCheckpoint='east_wing'")
].join('\n');
await writeFile('chapter4-v23-diagnostic.txt',report);
console.log(report);
