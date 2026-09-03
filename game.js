// Deployment loader for The Attendant: Pinewood Mall.
// Runtime bundle stays immutable; authored room and world-prop overrides live in /patches.
const PARTS=[
  './bundle2/part-01.txt','./bundle2/part-02.txt','./bundle2/part-03.txt',
  './bundle2/p4-1.txt','./bundle2/p4-2.txt','./bundle2/p4-3.txt','./bundle2/p4-4.txt','./bundle2/p4-5.txt',
  './bundle2/p5-1.txt','./bundle2/p5-2.txt','./bundle2/p5-3.txt','./bundle2/p5-4.txt','./bundle2/p5-5.txt'
];
const WORLD_PATCH='./patches/worldprops-v1.js.txt';
const INDUSTRIAL_PATCH='./patches/industrial-cc0-v1.js.txt';
const VISUAL_FIX_PATCH='./patches/visual-fixes-v1.js.txt';
const STORE_PATCH='./patches/store-polish-v2.js.txt';
const SYSTEMS_PATCH='./patches/systems-polish-v3.js.txt';
const RELIABILITY_PATCH='./patches/reliability-v4.js.txt';
const STATUS_PATCH='./patches/status-lights-v5.js.txt';
const AUDIO_PATCH='./patches/audio-immersion-v6.js.txt';
const ELEVATOR_PATCH='./patches/elevator-rebuild-v7.js.txt';
const FOUNTAIN_PATCH='./patches/fountain-rebuild-v8.js.txt';
const CASSETTE_PATCH='./patches/cassette-castle-rebuild-v9.js.txt';
const FOOD_PATCH='./patches/foodcourt-v3.js.txt';
const POSTER_PATCH='./patches/poster-polish-v10.js.txt';
const FOOTSTEP_PATCH='./patches/footstep-mix-v11.js.txt';
const POSTER_DIVERSITY_PATCH='./patches/poster-diversity-v12.js.txt';
const CASSETTE_V13_PATCH='./patches/cassette-castle-rebuild-v13.js.txt';
const CASSETTE_V14_PATCH='./patches/cassette-castle-rebuild-v14.js.txt';
const LOCAL_ASSETS_PATCH='./patches/local-assets-v15.js.txt';
const RETAIL_V16_PATCH='./patches/retail-geometry-v16.js.txt';
const STORY_V17_PATCH='./patches/story-foundation-v17.js.txt';
const CHAPTER1_V18_PATCH='./patches/chapter1-story-v18.js.txt';
const PCAS_V19_PATCH='./patches/pcas-voice-v19.js.txt';
const CHAPTER1_V20_PATCH='./patches/chapter1-pcas-escalation-v20.js.txt';
const CHAPTER2_V21_PATCH='./patches/chapter2-below-grade-v21.js.txt';
const PCAS_VOICE_MANIFEST='./assets/audio/pa/manifest.json';
const LOCAL_ASSETS_MANIFEST='./assets/vendor/runtime/manifest.json';

async function getText(url){
  const r=await fetch(url,{cache:'no-store'});
  if(!r.ok)throw new Error(`Failed to load ${url}: HTTP ${r.status}`);
  return await r.text();
}

async function decodeSource(){
  const payload=(await Promise.all(PARTS.map(getText))).map(s=>s.trim()).join('');
  const bytes=Uint8Array.from(atob(payload),c=>c.charCodeAt(0));
  if('DecompressionStream' in window){
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  }
  const {ungzip}=await import('./vendor/pako/pako.esm.mjs');
  return new TextDecoder().decode(ungzip(bytes));
}

function normalizeImports(source){
  return source
    .replace(/import \{ GLTFLoader \} from ['"][^'"]*\/GLTFLoader\.js['"];?/,"import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
    .replace(/import \{ EffectComposer \} from ['"][^'"]*\/EffectComposer\.js['"];?/,"import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
    .replace(/import \{ RenderPass \} from ['"][^'"]*\/RenderPass\.js['"];?/,"import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
    .replace(/import \{ UnrealBloomPass \} from ['"][^'"]*\/UnrealBloomPass\.js['"];?/,"import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");

}

async function applyWorldProps(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyWorldPropsV1 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyWorldPropsV1!=='function')throw new Error('World Props v1 patch did not export its patch function.');return mod.applyWorldPropsV1(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyIndustrialCc0(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyIndustrialCc0V1 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyIndustrialCc0V1!=='function')throw new Error('Industrial CC0 v1 patch did not export its patch function.');return mod.applyIndustrialCc0V1(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyVisualFixes(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyVisualFixesV1 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyVisualFixesV1!=='function')throw new Error('Visual Fixes v1 patch did not export its patch function.');return mod.applyVisualFixesV1(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyStorePolish(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyStorePolishV2 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyStorePolishV2!=='function')throw new Error('Store Polish v2 patch did not export its patch function.');return mod.applyStorePolishV2(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applySystemsPolish(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applySystemsPolishV3 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applySystemsPolishV3!=='function')throw new Error('Systems Polish v3 patch did not export its patch function.');return mod.applySystemsPolishV3(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyReliability(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyReliabilityV4 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyReliabilityV4!=='function')throw new Error('Reliability v4 patch did not export its patch function.');return mod.applyReliabilityV4(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyStatusLights(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyStatusLightsV5 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyStatusLightsV5!=='function')throw new Error('Status Lights v5 patch did not export its patch function.');return mod.applyStatusLightsV5(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyAudioImmersion(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyAudioImmersionV6 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyAudioImmersionV6!=='function')throw new Error('Audio Immersion v6 patch did not export its patch function.');return mod.applyAudioImmersionV6(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyElevatorRebuild(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyElevatorRebuildV7 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyElevatorRebuildV7!=='function')throw new Error('Elevator Rebuild v7 patch did not export its patch function.');return mod.applyElevatorRebuildV7(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyFountainRebuild(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyFountainRebuildV8 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyFountainRebuildV8!=='function')throw new Error('Fountain Rebuild v8 patch did not export its patch function.');return mod.applyFountainRebuildV8(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyCassetteCastleRebuild(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyCassetteCastleRebuildV9 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyCassetteCastleRebuildV9!=='function')throw new Error('Cassette Castle Rebuild v9 patch did not export its patch function.');return mod.applyCassetteCastleRebuildV9(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyPosterPolish(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyPosterPolishV10 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyPosterPolishV10!=='function')throw new Error('Poster Polish v10 patch did not export its patch function.');return mod.applyPosterPolishV10(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyFootstepMix(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyFootstepMixV11 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyFootstepMixV11!=='function')throw new Error('Footstep Mix v11 patch did not export its patch function.');return mod.applyFootstepMixV11(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyPosterDiversity(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyPosterDiversityV12 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyPosterDiversityV12!=='function')throw new Error('Poster Diversity v12 patch did not export its patch function.');return mod.applyPosterDiversityV12(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyCassetteCastleV13(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyCassetteCastleRebuildV13 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyCassetteCastleRebuildV13!=='function')throw new Error('Cassette Castle Rebuild v13 patch did not export its patch function.');return mod.applyCassetteCastleRebuildV13(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyCassetteCastleV14(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyCassetteCastleRebuildV14 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyCassetteCastleRebuildV14!=='function')throw new Error('Cassette Castle Rebuild v14 patch did not export its patch function.');return mod.applyCassetteCastleRebuildV14(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyLocalAssetsV15Runtime(source,patchText,manifest){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyLocalAssetsV15 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyLocalAssetsV15!=='function')throw new Error('Local Assets v15 patch did not export its patch function.');return mod.applyLocalAssetsV15(source,manifest);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyRetailGeometryV16Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyRetailGeometryV16 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyRetailGeometryV16!=='function')throw new Error('Retail Geometry v16 patch did not export its patch function.');return mod.applyRetailGeometryV16(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyStoryFoundationV17Runtime(source,patchText,storyData){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyStoryFoundationV17 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyStoryFoundationV17!=='function')throw new Error('Story Foundation v17 patch did not export its patch function.');return mod.applyStoryFoundationV17(source,storyData);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyChapter1StoryV18Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter1StoryV18 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter1StoryV18!=='function')throw new Error('Chapter 1 Story v18 patch did not export its patch function.');return mod.applyChapter1StoryV18(source);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyPcasVoiceV19Runtime(source,patchText,manifest){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyPcasVoiceV19 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyPcasVoiceV19!=='function')throw new Error('PCAS Voice v19 patch did not export its patch function.');return mod.applyPcasVoiceV19(source,manifest);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyChapter1PcasEscalationV20Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter1PcasEscalationV20 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter1PcasEscalationV20!=='function')throw new Error('Chapter 1 PCAS Escalation v20 patch did not export its patch function.');return mod.applyChapter1PcasEscalationV20(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyChapter2BelowGradeV21Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter2BelowGradeV21 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter2BelowGradeV21!=='function')throw new Error('Chapter 2 Below Grade v21 patch did not export its patch function.');return mod.applyChapter2BelowGradeV21(source);}finally{URL.revokeObjectURL(patchUrl);}
}

function replaceFoodCourt(source,replacement){
  const start=source.indexOf('async function buildFoodCourt(world){');
  const end=source.indexOf('async function buildMusic(world){',start);
  if(start<0||end<0)throw new Error('Food Court runtime markers missing. Refusing to boot a stale layout.');
  const patched=source.slice(0,start)+replacement.trim()+'\n\n'+source.slice(end);
  const section=patched.slice(start,start+replacement.length+32);
  if(!section.includes("'qTableRound'")||!section.includes("'qChair'"))throw new Error('Food Court new furniture is missing.');
  if(section.includes("placeModel(world.root,'table'")||section.includes("placeModel(world.root,'chair'"))throw new Error('Retired Food Court table/chair models detected.');
  if(!section.includes('frontL=')||!section.includes('frontR=')||!section.includes('doorway jambs'))throw new Error('Food Court wall coverage verification failed.');
  if(section.includes('THREE.RepeatWrapping'))throw new Error('Repeating Food Court wallpaper detected. Refusing to boot.');
  if(!section.includes('THREE.ClampToEdgeWrapping'))throw new Error('Food Court wall texture is not clamped edge-to-edge.');
  return patched;
}

async function preflightThree(){
  for(const [name,specifier] of [
    ['three','three'],['GLTFLoader','three/addons/loaders/GLTFLoader.js'],
    ['EffectComposer','three/addons/postprocessing/EffectComposer.js'],
    ['RenderPass','three/addons/postprocessing/RenderPass.js'],
    ['UnrealBloomPass','three/addons/postprocessing/UnrealBloomPass.js']
  ]){
    try{await import(specifier);}catch(cause){const err=new Error(`Three.js dependency failed at ${name}: ${cause?.message||cause}`);err.cause=cause;throw err;}
  }
}

try{
  await preflightThree();
  const [base,worldPatch,industrialPatch,visualFixPatch,storePatch,systemsPatch,reliabilityPatch,statusPatch,audioPatch,elevatorPatch,fountainPatch,cassettePatch,foodPatch,posterPatch,footstepPatch,posterDiversityPatch,cassetteV13Patch,cassetteV14Patch,localAssetsPatch,retailV16Patch,storyV17Patch,chapter1V18Patch,pcasV19Patch,chapter1V20Patch,chapter2V21Patch,pcasVoiceManifestText,localAssetsManifestText,storyModule]=await Promise.all([
    decodeSource(),getText(WORLD_PATCH),getText(INDUSTRIAL_PATCH),getText(VISUAL_FIX_PATCH),getText(STORE_PATCH),getText(SYSTEMS_PATCH),getText(RELIABILITY_PATCH),getText(STATUS_PATCH),getText(AUDIO_PATCH),getText(ELEVATOR_PATCH),getText(FOUNTAIN_PATCH),getText(CASSETTE_PATCH),getText(FOOD_PATCH),getText(POSTER_PATCH),getText(FOOTSTEP_PATCH),getText(POSTER_DIVERSITY_PATCH),getText(CASSETTE_V13_PATCH),getText(CASSETTE_V14_PATCH),getText(LOCAL_ASSETS_PATCH),getText(RETAIL_V16_PATCH),getText(STORY_V17_PATCH),getText(CHAPTER1_V18_PATCH),getText(PCAS_V19_PATCH),getText(CHAPTER1_V20_PATCH),getText(CHAPTER2_V21_PATCH),getText(PCAS_VOICE_MANIFEST),getText(LOCAL_ASSETS_MANIFEST),import('./story/story-data.js')
  ]);
  const worldSource=await applyWorldProps(normalizeImports(base),worldPatch);
  const industrialSource=await applyIndustrialCc0(worldSource,industrialPatch);
  const visualSource=await applyVisualFixes(industrialSource,visualFixPatch);
  const storeSource=await applyStorePolish(visualSource,storePatch);
  const systemsSource=await applySystemsPolish(storeSource,systemsPatch);
  const reliabilitySource=await applyReliability(systemsSource,reliabilityPatch);
  const statusSource=await applyStatusLights(reliabilitySource,statusPatch);
  const audioSource=await applyAudioImmersion(statusSource,audioPatch);
  const elevatorSource=await applyElevatorRebuild(audioSource,elevatorPatch);
  const fountainSource=await applyFountainRebuild(elevatorSource,fountainPatch);
  const cassetteSource=await applyCassetteCastleRebuild(fountainSource,cassettePatch);
  const foodSource=replaceFoodCourt(cassetteSource,foodPatch);
  const posterSource=await applyPosterPolish(foodSource,posterPatch);
  const footstepSource=await applyFootstepMix(posterSource,footstepPatch);
  const posterDiversitySource=await applyPosterDiversity(footstepSource,posterDiversityPatch);
  const cassetteV13Source=await applyCassetteCastleV13(posterDiversitySource,cassetteV13Patch);
  const cassetteV14Source=await applyCassetteCastleV14(cassetteV13Source,cassetteV14Patch);
  const localAssetsManifest=JSON.parse(localAssetsManifestText);
  const localAssetsV15Source=await applyLocalAssetsV15Runtime(cassetteV14Source,localAssetsPatch,localAssetsManifest);
  const retailV16Source=await applyRetailGeometryV16Runtime(localAssetsV15Source,retailV16Patch);
  const storyV17Source=await applyStoryFoundationV17Runtime(retailV16Source,storyV17Patch,storyModule.STORY_DATA_V17);
  const chapter1V18Source=await applyChapter1StoryV18Runtime(storyV17Source,chapter1V18Patch);
  const pcasVoiceManifest=JSON.parse(pcasVoiceManifestText);
  const pcasV19Source=await applyPcasVoiceV19Runtime(chapter1V18Source,pcasV19Patch,pcasVoiceManifest);
  const chapter1V20Source=await applyChapter1PcasEscalationV20Runtime(pcasV19Source,chapter1V20Patch);
  const chapter2V21Source=await applyChapter2BelowGradeV21Runtime(chapter1V20Source,chapter2V21Patch);
  const source=chapter2V21Source+'\n//# sourceURL=pinewood-runtime.js\n';
  const moduleUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  try{await import(moduleUrl);}finally{URL.revokeObjectURL(moduleUrl);}
}catch(err){
  console.error('Pinewood game bundle failed to start',err);if(err?.cause)console.error('Underlying module error',err.cause);if(err?.stack)console.error(err.stack);
  const status=document.getElementById('assetStatus');if(status)status.textContent=`Game failed to start: ${err?.message||err}`;
}
