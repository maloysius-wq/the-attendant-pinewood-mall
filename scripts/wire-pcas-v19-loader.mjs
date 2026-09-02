import {readFile,writeFile} from 'node:fs/promises';

const path='game.js';
let source=await readFile(path,'utf8');
const fail=msg=>{throw new Error('PCAS v19 loader wiring failed: '+msg);};
function replaceOnce(label,needle,replacement){
  const first=source.indexOf(needle);if(first<0)fail(label+': marker missing');
  if(source.indexOf(needle,first+needle.length)>=0)fail(label+': marker is not unique');
  source=source.slice(0,first)+replacement+source.slice(first+needle.length);
}

if(!source.includes("const PCAS_V19_PATCH='./patches/pcas-voice-v19.js.txt';")){
  replaceOnce('v18/v19 constants',
    "const STORY_V17_PATCH='./patches/story-foundation-v17.js.txt';\nconst LOCAL_ASSETS_MANIFEST='./assets/vendor/runtime/manifest.json';",
    "const STORY_V17_PATCH='./patches/story-foundation-v17.js.txt';\nconst CHAPTER1_V18_PATCH='./patches/chapter1-story-v18.js.txt';\nconst PCAS_V19_PATCH='./patches/pcas-voice-v19.js.txt';\nconst PCAS_VOICE_MANIFEST='./assets/audio/pa/manifest.json';\nconst LOCAL_ASSETS_MANIFEST='./assets/vendor/runtime/manifest.json';"
  );
}

if(!source.includes('async function applyChapter1StoryV18Runtime(source,patchText)')){
  const anchor=`async function applyStoryFoundationV17Runtime(source,patchText,storyData){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyStoryFoundationV17 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyStoryFoundationV17!=='function')throw new Error('Story Foundation v17 patch did not export its patch function.');return mod.applyStoryFoundationV17(source,storyData);}finally{URL.revokeObjectURL(patchUrl);}\n}\n`;
  const addition=anchor+`async function applyChapter1StoryV18Runtime(source,patchText){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyChapter1StoryV18 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyChapter1StoryV18!=='function')throw new Error('Chapter 1 Story v18 patch did not export its patch function.');return mod.applyChapter1StoryV18(source);}finally{URL.revokeObjectURL(patchUrl);}\n}\nasync function applyPcasVoiceV19Runtime(source,patchText,manifest){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyPcasVoiceV19 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyPcasVoiceV19!=='function')throw new Error('PCAS Voice v19 patch did not export its patch function.');return mod.applyPcasVoiceV19(source,manifest);}finally{URL.revokeObjectURL(patchUrl);}\n}\n`;
  replaceOnce('v18/v19 patch runners',anchor,addition);
}

if(!source.includes('storyV17Patch,chapter1V18Patch,pcasV19Patch,pcasVoiceManifestText')){
  replaceOnce('Promise destructuring',
    'localAssetsPatch,retailV16Patch,storyV17Patch,localAssetsManifestText,storyModule]=await Promise.all([',
    'localAssetsPatch,retailV16Patch,storyV17Patch,chapter1V18Patch,pcasV19Patch,pcasVoiceManifestText,localAssetsManifestText,storyModule]=await Promise.all(['
  );
  replaceOnce('Promise resources',
    "getText(LOCAL_ASSETS_PATCH),getText(RETAIL_V16_PATCH),getText(STORY_V17_PATCH),getText(LOCAL_ASSETS_MANIFEST),import('./story/story-data.js')",
    "getText(LOCAL_ASSETS_PATCH),getText(RETAIL_V16_PATCH),getText(STORY_V17_PATCH),getText(CHAPTER1_V18_PATCH),getText(PCAS_V19_PATCH),getText(PCAS_VOICE_MANIFEST),getText(LOCAL_ASSETS_MANIFEST),import('./story/story-data.js')"
  );
}

if(!source.includes('const pcasV19Source=await applyPcasVoiceV19Runtime(')){
  replaceOnce('final v18/v19 source chain',
    "  const storyV17Source=await applyStoryFoundationV17Runtime(retailV16Source,storyV17Patch,storyModule.STORY_DATA_V17);\n  const source=storyV17Source+'\\n//# sourceURL=pinewood-runtime.js\\n';",
    "  const storyV17Source=await applyStoryFoundationV17Runtime(retailV16Source,storyV17Patch,storyModule.STORY_DATA_V17);\n  const chapter1V18Source=await applyChapter1StoryV18Runtime(storyV17Source,chapter1V18Patch);\n  const pcasVoiceManifest=JSON.parse(pcasVoiceManifestText);\n  const pcasV19Source=await applyPcasVoiceV19Runtime(chapter1V18Source,pcasV19Patch,pcasVoiceManifest);\n  const source=pcasV19Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
  );
}

for(const marker of [
  "const CHAPTER1_V18_PATCH='./patches/chapter1-story-v18.js.txt';",
  "const PCAS_V19_PATCH='./patches/pcas-voice-v19.js.txt';",
  "const PCAS_VOICE_MANIFEST='./assets/audio/pa/manifest.json';",
  'async function applyChapter1StoryV18Runtime(source,patchText)',
  'async function applyPcasVoiceV19Runtime(source,patchText,manifest)',
  'getText(CHAPTER1_V18_PATCH)',
  'getText(PCAS_V19_PATCH)',
  'getText(PCAS_VOICE_MANIFEST)',
  'const chapter1V18Source=await applyChapter1StoryV18Runtime(storyV17Source,chapter1V18Patch);',
  'const pcasV19Source=await applyPcasVoiceV19Runtime(chapter1V18Source,pcasV19Patch,pcasVoiceManifest);',
  "const source=pcasV19Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
])if(!source.includes(marker))fail('postcondition missing: '+marker);
await writeFile(path,source,'utf8');

// Older audits protect their own layers. They should verify that v17 follows them,
// not assert that v17 is forever the final deployed source.
for(const auditPath of [
  'scripts/audit-cassette-castle-v13.mjs',
  'scripts/audit-cassette-castle-v14.mjs',
  'scripts/audit-local-assets-v15.mjs',
  'scripts/audit-retail-geometry-v16.mjs'
]){
  let text=await readFile(auditPath,'utf8');
  text=text
    .replace("'const source=storyV17Source+'","'const storyV17Source=await applyStoryFoundationV17Runtime('")
    .replace('"const source=storyV17Source+"','"const storyV17Source=await applyStoryFoundationV17Runtime("');
  if(!text.includes('const storyV17Source=await applyStoryFoundationV17Runtime('))fail(auditPath+': forward-compatible v17 handoff marker missing');
  await writeFile(auditPath,text,'utf8');
}

{
  const auditPath='scripts/audit-story-foundation-v17.mjs';
  let text=await readFile(auditPath,'utf8');
  text=text.split('\n').filter(line=>!line.includes('const source=storyV17Source+')).join('\n');
  if(!text.includes('const storyV17Source=await applyStoryFoundationV17Runtime(retailV16Source,storyV17Patch,storyModule.STORY_DATA_V17);'))fail('v17 audit lost its actual v17 loader-chain marker');
  await writeFile(auditPath,text,'utf8');
}

{
  const auditPath='scripts/audit-pcas-voice-v19.mjs';
  let text=await readFile(auditPath,'utf8');
  if(!text.includes('game.js live v19 loader marker')){
    const anchor="const paSpec=JSON.parse(await readFile('story/pa-lines.json','utf8'));";
    const loaderCheck=`const loader=await readFile('game.js','utf8');\nfor(const marker of [\n  \"const CHAPTER1_V18_PATCH='./patches/chapter1-story-v18.js.txt';\",\n  \"const PCAS_V19_PATCH='./patches/pcas-voice-v19.js.txt';\",\n  \"const PCAS_VOICE_MANIFEST='./assets/audio/pa/manifest.json';\",\n  'async function applyChapter1StoryV18Runtime(source,patchText)',\n  'async function applyPcasVoiceV19Runtime(source,patchText,manifest)',\n  'const chapter1V18Source=await applyChapter1StoryV18Runtime(storyV17Source,chapter1V18Patch);',\n  'const pcasV19Source=await applyPcasVoiceV19Runtime(chapter1V18Source,pcasV19Patch,pcasVoiceManifest);',\n  \"const source=pcasV19Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"\n])if(!loader.includes(marker))fail('game.js live v19 loader marker missing: '+marker);\nif(loader.includes(\"const source=storyV17Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"))fail('game.js still boots directly from v17');\n\n${anchor}`;
    if(!text.includes(anchor))fail('v19 audit insertion anchor missing');
    text=text.replace(anchor,loaderCheck);
  }
  await writeFile(auditPath,text,'utf8');
}

console.log('Chapter 1 v18 + PCAS Voice v19 loader wiring and audit compatibility applied.');
