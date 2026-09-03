import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import vm from 'node:vm';

const PARTS=['bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt','bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt','bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'];
const PATCHES=[['patches/worldprops-v1.js.txt','applyWorldPropsV1'],['patches/industrial-cc0-v1.js.txt','applyIndustrialCc0V1'],['patches/visual-fixes-v1.js.txt','applyVisualFixesV1'],['patches/store-polish-v2.js.txt','applyStorePolishV2'],['patches/systems-polish-v3.js.txt','applySystemsPolishV3'],['patches/reliability-v4.js.txt','applyReliabilityV4'],['patches/status-lights-v5.js.txt','applyStatusLightsV5'],['patches/audio-immersion-v6.js.txt','applyAudioImmersionV6'],['patches/elevator-rebuild-v7.js.txt','applyElevatorRebuildV7'],['patches/fountain-rebuild-v8.js.txt','applyFountainRebuildV8'],['patches/cassette-castle-rebuild-v9.js.txt','applyCassetteCastleRebuildV9']];
const TAIL=[['patches/poster-polish-v10.js.txt','applyPosterPolishV10'],['patches/footstep-mix-v11.js.txt','applyFootstepMixV11'],['patches/poster-diversity-v12.js.txt','applyPosterDiversityV12'],['patches/cassette-castle-rebuild-v13.js.txt','applyCassetteCastleRebuildV13'],['patches/cassette-castle-rebuild-v14.js.txt','applyCassetteCastleRebuildV14']];
function normalizeImports(source){return source.replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';","import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';").replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';","import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';").replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';","import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';").replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';","import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");}
async function loadPatch(path,name){const text=await readFile(path,'utf8'),context=vm.createContext({console});vm.runInContext(`${text}\nthis.__patch=${name};`,context,{filename:path});return context.__patch;}
function replaceFoodCourt(source,replacement){const s=source.indexOf('async function buildFoodCourt(world){'),e=source.indexOf('async function buildMusic(world){',s);return source.slice(0,s)+replacement.trim()+'\n\n'+source.slice(e);}
async function loadStoryData(){const paths=['story/characters.js','story/evidence.js','story/chapters.js','story/timeline.js','story/dialogue.js'];let code='';for(const path of paths)code+=(await readFile(path,'utf8')).replace(/export const /g,'const ')+'\n';code+=(await readFile('story/story-data.js','utf8')).replace(/^import .*$/gm,'').replace(/export const /g,'const ')+'\nthis.__story=STORY_DATA_V17;';const context=vm.createContext({});vm.runInContext(code,context);return JSON.parse(JSON.stringify(context.__story));}

const payload=(await Promise.all(PARTS.map(p=>readFile(p,'utf8')))).map(v=>v.trim()).join('');let source=normalizeImports(gunzipSync(Buffer.from(payload,'base64')).toString('utf8'));
for(const [path,name] of PATCHES)source=(await loadPatch(path,name))(source);
source=replaceFoodCourt(source,await readFile('patches/foodcourt-v3.js.txt','utf8'));
for(const [path,name] of TAIL)source=(await loadPatch(path,name))(source);
source=(await loadPatch('patches/local-assets-v15.js.txt','applyLocalAssetsV15'))(source,JSON.parse(await readFile('assets/vendor/runtime/manifest.json','utf8')));
source=(await loadPatch('patches/retail-geometry-v16.js.txt','applyRetailGeometryV16'))(source);
source=(await loadPatch('patches/story-foundation-v17.js.txt','applyStoryFoundationV17'))(source,await loadStoryData());
source=(await loadPatch('patches/chapter1-story-v18.js.txt','applyChapter1StoryV18'))(source);
source=(await loadPatch('patches/pcas-voice-v19.js.txt','applyPcasVoiceV19'))(source,JSON.parse(await readFile('assets/audio/pa/manifest.json','utf8')));
source=(await loadPatch('patches/chapter1-pcas-escalation-v20.js.txt','applyChapter1PcasEscalationV20'))(source);

const needles=['Recover ','t===\'note\'','t===\'journal\'','t===\'tape\'','E  Recover'];
const hits=[];for(const needle of needles){let at=source.indexOf(needle);while(at>=0){hits.push({needle,at,snippet:source.slice(Math.max(0,at-500),Math.min(source.length,at+700))});at=source.indexOf(needle,at+needle.length);}}
console.log(JSON.stringify({length:source.length,hits},null,2));
