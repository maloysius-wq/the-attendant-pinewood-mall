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
const CHAPTER3_V22_PATCH='./patches/chapter3-eyes-security-v22.js.txt';
const CHAPTER3_V22B_PATCH='./patches/chapter3-east-wing-handoff-v22b.js.txt';
const CHAPTER3_V22C_PATCH='./patches/chapter3-security-readability-v22c.js.txt';
const CHAPTER3_V22D_PATCH='./patches/chapter3-security-readability-v22d.js.txt';
const CHAPTER4_V23_PATCH='./patches/chapter4-east-wing-v23.js.txt';
const CHAPTER4_V23B_PATCH='./patches/chapter4-east-wing-readability-v23b.js.txt';
const CHAPTER5_V24_PATCH='./patches/chapter5-accountability-v24.js.txt';
const CHAPTER6_V25_PATCH='./patches/chapter6-last-shift-v25.js.txt';
const PRODUCTION_READABILITY_V26_PATCH='./patches/production-readability-v26.js.txt';
const AUDIO_DIRECTION_V27_PATCH='./patches/audio-direction-v27.js.txt';
const FREIGHT_ELEVATOR_V28_PATCH='./patches/freight-elevator-reliability-v28.js.txt';
const ARCADE_V30_PATCH='./patches/arcade-rebuild-v30.js.txt';
const PCAS_VOICE_MANIFEST='./assets/audio/pa/manifest.json';
const CHARACTER_VOICE_MANIFEST='./assets/audio/characters/manifest.json';
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

async function applyChapter3EyesSecurityV22Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter3EyesSecurityV22 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter3EyesSecurityV22!=='function')throw new Error('Chapter 3 Eyes in Security v22 patch did not export its patch function.');return mod.applyChapter3EyesSecurityV22(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyChapter3EastWingHandoffV22BRuntime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter3EastWingHandoffV22B };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter3EastWingHandoffV22B!=='function')throw new Error('Chapter 3 East Wing handoff v22b patch did not export its patch function.');return mod.applyChapter3EastWingHandoffV22B(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyChapter3SecurityReadabilityV22CRuntime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter3SecurityReadabilityV22C };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter3SecurityReadabilityV22C!=='function')throw new Error('Chapter 3 Security readability v22c patch did not export its patch function.');return mod.applyChapter3SecurityReadabilityV22C(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyChapter3SecurityReadabilityV22DRuntime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter3SecurityReadabilityV22D };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter3SecurityReadabilityV22D!=='function')throw new Error('Chapter 3 Security readability v22d patch did not export its patch function.');return mod.applyChapter3SecurityReadabilityV22D(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyChapter4EastWingV23Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter4EastWingV23 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter4EastWingV23!=='function')throw new Error('Chapter 4 The East Wing v23 patch did not export its patch function.');return mod.applyChapter4EastWingV23(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyChapter4EastWingReadabilityV23BRuntime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter4EastWingReadabilityV23B };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter4EastWingReadabilityV23B!=='function')throw new Error('Chapter 4 East Wing readability v23b patch did not export its patch function.');return mod.applyChapter4EastWingReadabilityV23B(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyChapter5AccountabilityV24Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter5AccountabilityV24 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter5AccountabilityV24!=='function')throw new Error('Chapter 5 Accountability v24 patch did not export its patch function.');return mod.applyChapter5AccountabilityV24(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyChapter6LastShiftV25Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyChapter6LastShiftV25 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter6LastShiftV25!=='function')throw new Error('Chapter 6 Last Shift v25 patch did not export its patch function.');return mod.applyChapter6LastShiftV25(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyProductionReadabilityV26Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyProductionReadabilityV26 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyProductionReadabilityV26!=='function')throw new Error('Production readability v26 patch did not export its patch function.');return mod.applyProductionReadabilityV26(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyAudioDirectionV27Runtime(source,patchText,manifest){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyAudioDirectionV27 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyAudioDirectionV27!=='function')throw new Error('Audio Direction v27 patch did not export its patch function.');return mod.applyAudioDirectionV27(source,manifest);}finally{URL.revokeObjectURL(patchUrl);}
}
async function applyFreightElevatorReliabilityV28Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyFreightElevatorReliabilityV28 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyFreightElevatorReliabilityV28!=='function')throw new Error('Freight Elevator Reliability v28 patch did not export its patch function.');return mod.applyFreightElevatorReliabilityV28(source);}finally{URL.revokeObjectURL(patchUrl);}
}

async function applyArcadeRebuildV30Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\nexport { applyArcadeRebuildV30 };\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyArcadeRebuildV30!=='function')throw new Error('Sunburst Arcade v30 patch did not export its patch function.');return mod.applyArcadeRebuildV30(source);}finally{URL.revokeObjectURL(patchUrl);}
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
  const [base,worldPatch,industrialPatch,visualFixPatch,storePatch,systemsPatch,reliabilityPatch,statusPatch,audioPatch,elevatorPatch,fountainPatch,cassettePatch,foodPatch,posterPatch,footstepPatch,posterDiversityPatch,cassetteV13Patch,cassetteV14Patch,localAssetsPatch,retailV16Patch,storyV17Patch,chapter1V18Patch,pcasV19Patch,chapter1V20Patch,chapter2V21Patch,chapter3V22Patch,chapter3V22BPatch,chapter3V22CPatch,chapter3V22DPatch,chapter4V23Patch,chapter4V23BPatch,chapter5V24Patch,chapter6V25Patch,productionReadabilityV26Patch,audioDirectionV27Patch,freightElevatorV28Patch,arcadeV30Patch,pcasVoiceManifestText,characterVoiceManifestText,localAssetsManifestText,storyModule]=await Promise.all([
    decodeSource(),getText(WORLD_PATCH),getText(INDUSTRIAL_PATCH),getText(VISUAL_FIX_PATCH),getText(STORE_PATCH),getText(SYSTEMS_PATCH),getText(RELIABILITY_PATCH),getText(STATUS_PATCH),getText(AUDIO_PATCH),getText(ELEVATOR_PATCH),getText(FOUNTAIN_PATCH),getText(CASSETTE_PATCH),getText(FOOD_PATCH),getText(POSTER_PATCH),getText(FOOTSTEP_PATCH),getText(POSTER_DIVERSITY_PATCH),getText(CASSETTE_V13_PATCH),getText(CASSETTE_V14_PATCH),getText(LOCAL_ASSETS_PATCH),getText(RETAIL_V16_PATCH),getText(STORY_V17_PATCH),getText(CHAPTER1_V18_PATCH),getText(PCAS_V19_PATCH),getText(CHAPTER1_V20_PATCH),getText(CHAPTER2_V21_PATCH),getText(CHAPTER3_V22_PATCH),getText(CHAPTER3_V22B_PATCH),getText(CHAPTER3_V22C_PATCH),getText(CHAPTER3_V22D_PATCH),getText(CHAPTER4_V23_PATCH),getText(CHAPTER4_V23B_PATCH),getText(CHAPTER5_V24_PATCH),getText(CHAPTER6_V25_PATCH),getText(PRODUCTION_READABILITY_V26_PATCH),getText(AUDIO_DIRECTION_V27_PATCH),getText(FREIGHT_ELEVATOR_V28_PATCH),getText(ARCADE_V30_PATCH),getText(PCAS_VOICE_MANIFEST),getText(CHARACTER_VOICE_MANIFEST),getText(LOCAL_ASSETS_MANIFEST),import('./story/story-data.js')
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
  const characterVoiceManifest=JSON.parse(characterVoiceManifestText);
  const pcasV19Source=await applyPcasVoiceV19Runtime(chapter1V18Source,pcasV19Patch,pcasVoiceManifest);
  const chapter1V20Source=await applyChapter1PcasEscalationV20Runtime(pcasV19Source,chapter1V20Patch);
  const chapter2V21Source=await applyChapter2BelowGradeV21Runtime(chapter1V20Source,chapter2V21Patch);
  const chapter3V22Source=await applyChapter3EyesSecurityV22Runtime(chapter2V21Source,chapter3V22Patch);
  const chapter3V22BSource=await applyChapter3EastWingHandoffV22BRuntime(chapter3V22Source,chapter3V22BPatch);
  const chapter3V22CSource=await applyChapter3SecurityReadabilityV22CRuntime(chapter3V22BSource,chapter3V22CPatch);
  const chapter3V22DSource=await applyChapter3SecurityReadabilityV22DRuntime(chapter3V22CSource,chapter3V22DPatch);
  const chapter4V23Source=await applyChapter4EastWingV23Runtime(chapter3V22DSource,chapter4V23Patch);
  const chapter4V23BSource=await applyChapter4EastWingReadabilityV23BRuntime(chapter4V23Source,chapter4V23BPatch);
  const chapter5V24Source=await applyChapter5AccountabilityV24Runtime(chapter4V23BSource,chapter5V24Patch);
  const chapter6V25Source=await applyChapter6LastShiftV25Runtime(chapter5V24Source,chapter6V25Patch);
  const productionReadabilityV26Source=await applyProductionReadabilityV26Runtime(chapter6V25Source,productionReadabilityV26Patch);
  const freightElevatorV28Source=await applyFreightElevatorReliabilityV28Runtime(productionReadabilityV26Source,freightElevatorV28Patch);
  const arcadeV30Source=await applyArcadeRebuildV30Runtime(freightElevatorV28Source,arcadeV30Patch);
  const audioDirectionV27Source=await applyAudioDirectionV27Runtime(arcadeV30Source,audioDirectionV27Patch,characterVoiceManifest);
  // Nonshipping audit-branch-only introspection hook, gated by explicit query parameter.
  const geometryAuditHookV32=new URLSearchParams(location.search).has('geometryAuditV32')?"\nwindow.__PINEWOOD_GEOMETRY_AUDIT_V32__=()=>{\n const g=typeof GAME==='undefined'?null:GAME;\n const w=g?.world||g?.currentWorld||Object.values(g||{}).find(v=>v?.root?.isObject3D&&Array.isArray(v?.interactables));\n if(!g||!w)return {ready:false,gameKeys:Object.keys(g||{}),levelIndex:g?.levelIndex};\n const objects=[];const maxObjects=600;\n w.root?.traverse(o=>{\n  if(objects.length>=maxObjects)return;\n  const ud=o.userData||{};\n  const tag=Object.entries(ud).filter(([k,v])=>(/chapter\\d|setpiece|visual|assetmodel|fixture/i.test(k))&&typeof v==='string').map(([k,v])=>k+':'+v).join('|');\n  if(!tag)return;\n  let b;\n  try{b=new THREE.Box3().setFromObject(o)}catch{}\n  if(!b||b.isEmpty())return;\n  const center=b.getCenter(new THREE.Vector3()),size=b.getSize(new THREE.Vector3());\n  objects.push({tag,type:o.type,position:[o.position.x,o.position.y,o.position.z],center:center.toArray(),size:size.toArray(),min:b.min.toArray(),max:b.max.toArray(),visible:o.visible});\n });\n const interactables=(w.interactables||[]).map(o=>({type:o.userData?.type||null,label:o.userData?.label||null,x:o.position.x,y:o.position.y,z:o.position.z,visible:o.visible}));\n const colliderKeys=Object.entries(w).filter(([k,v])=>Array.isArray(v)&&(/collid|block|nav/i.test(k))).map(([k,v])=>({key:k,length:v.length,sample:v.slice(0,2).map(x=>({x:x.x,z:x.z,w:x.w,d:x.d,disabled:x.disabled,navBlock:x.navBlock,minX:x.minX,maxX:x.maxX}))}));\n return {ready:true,levelIndex:g.levelIndex,worldKeys:Object.keys(w),gameKeys:Object.keys(g).filter(k=>/world|map|nav|collision|grid|level/i.test(k)),interactables,colliderKeys,objects};\n};":'';
  const source=audioDirectionV27Source+'\n//# sourceURL=pinewood-runtime.js\n';
  const navProbeHookV32=new URLSearchParams(location.search).has('geometryAuditV32')?"\nwindow.__PINEWOOD_NAV_PROBE_V32__=()=>{\n const w=typeof GAME==='undefined'?null:GAME?.world;const walk=w?.walk;\n let kind=walk?.constructor?.name||typeof walk,sample=[],count=0;\n if(walk instanceof Set){count=walk.size;sample=[...walk].slice(0,12)}\n else if(walk instanceof Map){count=walk.size;sample=[...walk.entries()].slice(0,5)}\n else if(Array.isArray(walk)){count=walk.length;sample=walk.slice(0,2).map(v=>Array.isArray(v)?v.slice(0,12):v)}\n else if(walk&&typeof walk==='object'){count=Object.keys(walk).length;sample=Object.entries(walk).slice(0,5)}\n const collider=(w?.colliders||[]).slice(0,3).map(c=>({minX:c.minX,maxX:c.maxX,minZ:c.minZ,maxZ:c.maxZ,disabled:c.disabled,navBlock:c.navBlock}));\n return {kind,count,sample,bounds:w?.bounds,collider,worldHasNavCache:!!w?.navCache};\n};":'';
  const pathProbeHookV32=new URLSearchParams(location.search).has('geometryAuditV32')?"\nwindow.__PINEWOOD_PATH_AUDIT_V32__=(startX,startZ)=>{\n const w=typeof GAME==='undefined'?null:GAME?.world;\n if(!w?.walk||!w?.colliders)return {ready:false};\n const blocked=w.colliders.filter(c=>c&&c.navBlock!==false&&!c.disabled&&Number.isFinite(c.minX)&&Number.isFinite(c.minZ));\n const doorSet=new Set(w.dynamicDoors||[]);\n const tiles=[...w.walk].map(s=>String(s).split(',').map(Number)).filter(p=>p.length===2&&p.every(Number.isFinite));\n const walk=new Set(tiles.map(p=>p[0]+','+p[1]));\n const key=(x,z)=>x+','+z;\n function free(x,z,optimistic){\n  if(!walk.has(key(x,z)))return false;\n  for(const c of blocked){\n   const owner=c.owner||null;\n   if(optimistic&&(doorSet.has(owner)||owner?.userData?.type?.includes('gate')||owner?.userData?.type?.includes('exit')||owner===GAME.ch2V21?.water||owner?.userData?.type==='door'||owner?.userData?.type==='ch5_eli_access_v24'||owner?.userData?.type==='ch5_exit_v24'))continue;\n   if(x>c.minX-.18&&x<c.maxX+.18&&z>c.minZ-.18&&z<c.maxZ+.18)return false;\n  }\n  return true;\n }\n const all=w.interactables||[];\n function sweep(optimistic){\n  const starts=tiles.filter(([x,z])=>free(x,z,optimistic)).sort((a,b)=>Math.hypot(a[0]-startX,a[1]-startZ)-Math.hypot(b[0]-startX,b[1]-startZ));\n  const seed=starts[0];if(!seed)return {error:'No free walk cells'};\n  const visited=new Set([key(...seed)]),q=[seed];\n  for(let i=0;i<q.length;i++){\n   const [x,z]=q[i];\n   for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){\n    const nx=x+dx,nz=z+dz,k=key(nx,nz);\n    if(!visited.has(k)&&free(nx,nz,optimistic)){visited.add(k);q.push([nx,nz]);}\n   }\n  }\n  const targets=all.map(o=>{\n   const p=o.getWorldPosition?o.getWorldPosition(new THREE.Vector3()):o.position;\n   const x=p.x,z=p.z;\n   let minWalk=Infinity,minReach=Infinity,minWalkPos=null,minReachPos=null;\n   for(const [tx,tz] of tiles){\n    const dist=Math.hypot(tx-x,tz-z);\n    if(dist<minWalk&&free(tx,tz,optimistic)){minWalk=dist;minWalkPos=[tx,tz];}\n    if(visited.has(key(tx,tz))&&dist<minReach){minReach=dist;minReachPos=[tx,tz];}\n   }\n   return {type:o.userData?.type||'',label:o.userData?.label||'',x:+x.toFixed(2),z:+z.toFixed(2),visible:o.visible,minWalk:Number(minWalk.toFixed(2)),minReach:Number(minReach.toFixed(2)),minWalkPos,minReachPos,reachable:minReach<2.45};\n  });\n  return {start:startX+','+startZ,seed,seedDistance:+Math.hypot(seed[0]-startX,seed[1]-startZ).toFixed(2),walkCount:walk.size,freeCount:starts.length,reachCount:visited.size,interactables:targets};\n }\n const physical=sweep(false),optimistic=sweep(true);\n return {ready:true,level:GAME.levelIndex,physical,optimistic,blockedCount:blocked.length,doors:w.dynamicDoors?.length||0};\n};":'';
  const wallAuditHookV33=new URLSearchParams(location.search).has('wallAuditV33')?"\nwindow.__PINEWOOD_WALL_AUDIT_V33__=()=>{\n const w=typeof GAME==='undefined'?null:GAME.world;if(!w?.root)return {ready:false};\n w.root.updateMatrixWorld(true);\n const collectWorldPoint=o=>o.getWorldPosition(new THREE.Vector3());\n function box(o){const b=new THREE.Box3().setFromObject(o);return {min:b.min.toArray(),max:b.max.toArray(),size:b.getSize(new THREE.Vector3()).toArray()};}\n const rawWalls=(w.wallMeshes||[]).filter(o=>o?.isObject3D);\n const walls=rawWalls.map((o,i)=>{const b=new THREE.Box3().setFromObject(o),sz=b.getSize(new THREE.Vector3());return{index:i,name:o.name||'',p:o.getWorldPosition(new THREE.Vector3()).toArray(),min:b.min.toArray(),max:b.max.toArray(),size:sz.toArray(),userData:o.userData,vertical:sz.y>1.1&&(sz.x<1.4||sz.z<1.4)};});\n const fixtureCandidates=[],skipped=[];const seen=new Set();\n const important=/switch|control|panel|route.?map|map_v|sign|poster|indicator|intercom|breaker|feeder|relay|sump|keypad|thermostat|emergency|call.button|wall|power|access/i;\n const mountedType=/ch2_control|ch4_route_map|ch5_eli_access|switch|wall.*(sign|panel|map)/i;\n function record(o,why){\n  if(seen.has(o.id))return;seen.add(o.id);\n  const b=new THREE.Box3().setFromObject(o);\n  if(b.isEmpty())return;\n  const p=collectWorldPoint(o),ud=o.userData||{};\n  let closest=[];\n  for(const W of walls.filter(x=>x.vertical)){\n   const [mi,ma]=[W.min,W.max],sx=Math.max(mi[0]-p.x,0,p.x-ma[0]),sy=Math.max(mi[1]-p.y,0,p.y-ma[1]),sz=Math.max(mi[2]-p.z,0,p.z-ma[2]);\n   const d=Math.hypot(sx,sy,sz);if(d<2.5)closest.push({index:W.index,d:+d.toFixed(3),size:W.size.map(v=>+v.toFixed(2)),min:W.min.map(v=>+v.toFixed(2)),max:W.max.map(v=>+v.toFixed(2))});\n  }\n  closest.sort((a,b)=>a.d-b.d);\n  fixtureCandidates.push({reason:why,type:ud.type||'',label:ud.label||'',name:o.name||'',userData:Object.fromEntries(Object.entries(ud).filter(([k,v])=>typeof v==='string'&&v.length<110)),p:p.toArray().map(v=>+v.toFixed(3)),rot:o.getWorldQuaternion(new THREE.Quaternion()).toArray().map(v=>+v.toFixed(3)),bounds:{min:b.min.toArray().map(v=>+v.toFixed(3)),max:b.max.toArray().map(v=>+v.toFixed(3))},closest:closest.slice(0,4)});\n }\n for(const o of w.interactables||[]){const ud=o.userData||{};const id=(ud.type||'')+' '+(ud.label||'');if(important.test(id))record(o,'interactive');}\n w.root.traverse(o=>{\n   const ud=o.userData||{};\n   const str=Object.entries(ud).filter(([k,v])=>typeof v==='string').map(([k,v])=>k+':'+v).join(' ');\n   if(important.test(str)&&!o.isLight&&!o.isScene)record(o,'tagged');\n });\n // Two-dimensional printed planes which may be expected to be affixed to a wall.\n w.root.traverse(o=>{\n  if(!o.isMesh||!o.geometry||!o.material?.map||seen.has(o.id))return;\n  const b=new THREE.Box3().setFromObject(o),s=b.getSize(new THREE.Vector3()),p=collectWorldPoint(o);\n  if(s.y>.2&&s.y<4&&p.y>.48&&(s.x<.16||s.z<.16))record(o,'print-plane');\n });\n return {ready:true,chapter:GAME.levelIndex,wallCount:rawWalls.length,walls:walls.slice(0,220),candidateCount:fixtureCandidates.length,fixtures:fixtureCandidates.slice(0,650)};\n};":'';
  const wallSurfaceHookV33=new URLSearchParams(location.search).has('wallAuditV33')?"\nwindow.__PINEWOOD_WALL_SURFACE_V33__=()=>{\n const w=typeof GAME==='undefined'?null:GAME.world;if(!w?.root)return {ready:false};\n w.root.updateMatrixWorld(true);\n const objects=[];\n w.root.traverse(o=>{\n  if(!o.isMesh)return;\n  const bb=new THREE.Box3().setFromObject(o),sz=bb.getSize(new THREE.Vector3());\n  const geom=o.geometry,mat=o.material;\n  objects.push({id:o.id,name:o.name||'',userData:Object.entries(o.userData||{}).filter(([k,v])=>typeof v==='string').map(([k,v])=>k+':'+v).join('|'),geometry:geom?.type||'',indices:geom?.index?.count||null,vertices:geom?.attributes?.position?.count||0,mat:Array.isArray(mat)?mat.map(x=>x?.name||x?.type):mat?.name||mat?.type,box:sz.toArray().map(v=>+v.toFixed(2)),min:bb.min.toArray().map(v=>+v.toFixed(2)),max:bb.max.toArray().map(v=>+v.toFixed(2))});\n });\n const walls=(w.wallMeshes||[]).map(o=>({id:o.id,name:o.name||'',gtype:o.geometry?.type||'',vertices:o.geometry?.attributes?.position?.count||0,indices:o.geometry?.index?.count||0,instanceCount:o.isInstancedMesh?o.count:0,visible:o.visible,localBox:(()=>{let g=o.geometry?.boundingBox;return g?{min:g.min.toArray(),max:g.max.toArray()}:null})()}));\n return {ready:true,sceneMeshCount:objects.length,walls,nearWallNamed:objects.filter(o=>/wall|trim|partition|structure/i.test(o.name+'|'+o.userData)).slice(0,50),largeVertical:objects.filter(o=>o.box[1]>2&&o.box[1]<8&&(o.box[0]<.9||o.box[2]<.9)).slice(0,40),largestMeshes:objects.sort((a,b)=>b.vertices-a.vertices).slice(0,30)};\n};":'';
  const wallContactHookV33=new URLSearchParams(location.search).has('wallAuditV33')?"\nwindow.__PINEWOOD_WALL_CONTACT_V33__=()=>{\n const w=typeof GAME==='undefined'?null:GAME.world;\n if(!w?.wallMeshes)return {ready:false};\n w.root.updateMatrixWorld(true);\n const v=new THREE.Matrix4(),combined=new THREE.Matrix4(),worldWalls=[];\n for(const o of w.wallMeshes){\n  const geo=o.geometry;if(!geo?.boundingBox)geo?.computeBoundingBox?.();\n  const local=geo?.boundingBox;if(!local)continue;\n  const count=o.isInstancedMesh?o.count:1;\n  for(let i=0;i<count;i++){\n   if(o.isInstancedMesh)o.getMatrixAt(i,v);else v.identity();\n   combined.copy(o.matrixWorld).multiply(v);\n   const b=local.clone().applyMatrix4(combined);\n   worldWalls.push({box:b,source:o.id,index:i,axis:b.max.x-b.min.x<(b.max.z-b.min.z)?'X':'Z'});\n  }\n }\n const scan=window.__PINEWOOD_WALL_AUDIT_V33__();\n const fixtures=scan.fixtures.map(f=>{\n  const p=new THREE.Vector3(...f.p),min=new THREE.Vector3(...f.bounds.min),max=new THREE.Vector3(...f.bounds.max),fb=new THREE.Box3(min,max);\n  let nearest=null;\n  for(const wall of worldWalls){\n   const wb=wall.box;\n   const yoverlap=fb.max.y>=wb.min.y&&fb.min.y<=wb.max.y;\n   const dx=Math.max(wb.min.x-fb.max.x,fb.min.x-wb.max.x,0);\n   const dz=Math.max(wb.min.z-fb.max.z,fb.min.z-wb.max.z,0);\n   const gap=Math.hypot(dx,dz);\n   const centerDist=wb.distanceToPoint(p);\n   const score=(yoverlap?gap:gap+2)+centerDist*.005;\n   if(nearest===null||score<nearest.score)nearest={score,gap:+gap.toFixed(4),centerDist:+centerDist.toFixed(4),axis:wall.axis,min:wb.min.toArray().map(x=>+x.toFixed(2)),max:wb.max.toArray().map(x=>+x.toFixed(2)),wallIndex:wall.index,wallMeshId:wall.source,yoverlap};\n  }\n  const expectedMount=/(breaker|ch2_control_v21|ch4_route_map_v23)/i.test(f.type)||/posterTheme|records-sign|east-wing-sign/i.test(JSON.stringify(f.userData));\n  const q=new THREE.Quaternion(...f.rot);const front=new THREE.Vector3(0,0,1).applyQuaternion(q);\n  const facingAlignment=nearest?+(nearest.axis==='X'?Math.abs(front.x):Math.abs(front.z)).toFixed(3):0;\n  const expectedAxis=Math.abs(front.x)>.7?'X':Math.abs(front.z)>.7?'Z':null;\n  const aligned=[];\n  for(const wall of worldWalls){\n   if(wall.axis!==expectedAxis)continue;\n   const wb=wall.box;\n   if(!(p.y>=wb.min.y-.1&&p.y<=wb.max.y+.1))continue;\n   const behind=expectedAxis==='X'?(front.x>0?wb.max.x<=p.x+.28:wb.min.x>=p.x-.28):(front.z>0?wb.max.z<=p.z+.28:wb.min.z>=p.z-.28);\n   if(!behind)continue;\n   const distance=wb.distanceToPoint(p),across=expectedAxis==='X'?Math.max(wb.min.z-p.z,0,p.z-wb.max.z):Math.max(wb.min.x-p.x,0,p.x-wb.max.x);\n   const score=distance+across*2;\n   if(score<=10)aligned.push({score:+score.toFixed(3),distance:+distance.toFixed(3),across:+across.toFixed(3),axis:wall.axis,min:wb.min.toArray().map(x=>+x.toFixed(2)),max:wb.max.toArray().map(x=>+x.toFixed(2)),index:wall.index});\n  }\n  aligned.sort((a,b)=>a.score-b.score);\n  return{type:f.type,label:f.label,reason:f.reason,expectedMount,userData:f.userData,position:f.p,box:f.bounds,front:front.toArray().map(x=>+x.toFixed(2)),facingAlignment,nearest,aligned:aligned.slice(0,6)};\n });\n return {ready:true,chapter:GAME.levelIndex,instanceWalls:worldWalls.length,fixtures};\n};":'';
  const sourceForAuditV32=source+geometryAuditHookV32+navProbeHookV32+pathProbeHookV32+wallAuditHookV33+wallSurfaceHookV33+wallContactHookV33;
  const moduleUrl=URL.createObjectURL(new Blob([sourceForAuditV32],{type:'text/javascript'}));
  try{await import(moduleUrl);}finally{URL.revokeObjectURL(moduleUrl);}
}catch(err){
  console.error('Pinewood game bundle failed to start',err);if(err?.cause)console.error('Underlying module error',err.cause);if(err?.stack)console.error(err.stack);
  const status=document.getElementById('assetStatus');if(status)status.textContent=`Game failed to start: ${err?.message||err}`;
}