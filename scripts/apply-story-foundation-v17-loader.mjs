import {readFile,writeFile} from 'node:fs/promises';

const path='game.js';
let source=await readFile(path,'utf8');
const fail=msg=>{throw new Error('Story Foundation v17 loader wiring failed: '+msg);};
function replaceOnce(label,needle,replacement){
  const first=source.indexOf(needle);if(first<0)fail(label+': marker missing');
  if(source.indexOf(needle,first+needle.length)>=0)fail(label+': marker is not unique');
  source=source.slice(0,first)+replacement+source.slice(first+needle.length);
}

if(!source.includes("const STORY_V17_PATCH='./patches/story-foundation-v17.js.txt';")){
  replaceOnce('story constants',
    "const RETAIL_V16_PATCH='./patches/retail-geometry-v16.js.txt';\nconst LOCAL_ASSETS_MANIFEST='./assets/vendor/runtime/manifest.json';",
    "const RETAIL_V16_PATCH='./patches/retail-geometry-v16.js.txt';\nconst STORY_V17_PATCH='./patches/story-foundation-v17.js.txt';\nconst LOCAL_ASSETS_MANIFEST='./assets/vendor/runtime/manifest.json';"
  );
}

if(!source.includes('async function applyStoryFoundationV17Runtime(source,patchText,storyData)')){
  const anchor=`async function applyRetailGeometryV16Runtime(source,patchText){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyRetailGeometryV16 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyRetailGeometryV16!=='function')throw new Error('Retail Geometry v16 patch did not export its patch function.');return mod.applyRetailGeometryV16(source);}finally{URL.revokeObjectURL(patchUrl);}\n}\n`;
  const addition=anchor+`async function applyStoryFoundationV17Runtime(source,patchText,storyData){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyStoryFoundationV17 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyStoryFoundationV17!=='function')throw new Error('Story Foundation v17 patch did not export its patch function.');return mod.applyStoryFoundationV17(source,storyData);}finally{URL.revokeObjectURL(patchUrl);}\n}\n`;
  replaceOnce('story patch runner',anchor,addition);
}

if(!source.includes('storyV17Patch,localAssetsManifestText,storyModule')){
  replaceOnce('Promise destructuring',
    'cassetteV13Patch,cassetteV14Patch,localAssetsPatch,retailV16Patch,localAssetsManifestText]=await Promise.all([',
    'cassetteV13Patch,cassetteV14Patch,localAssetsPatch,retailV16Patch,storyV17Patch,localAssetsManifestText,storyModule]=await Promise.all(['
  );
  replaceOnce('Promise resources',
    'getText(CASSETTE_V13_PATCH),getText(CASSETTE_V14_PATCH),getText(LOCAL_ASSETS_PATCH),getText(RETAIL_V16_PATCH),getText(LOCAL_ASSETS_MANIFEST)\n  ]);',
    "getText(CASSETTE_V13_PATCH),getText(CASSETTE_V14_PATCH),getText(LOCAL_ASSETS_PATCH),getText(RETAIL_V16_PATCH),getText(STORY_V17_PATCH),getText(LOCAL_ASSETS_MANIFEST),import('./story/story-data.js')\n  ]);"
  );
}

if(!source.includes('const storyV17Source=await applyStoryFoundationV17Runtime(')){
  replaceOnce('final story source',
    "  const retailV16Source=await applyRetailGeometryV16Runtime(localAssetsV15Source,retailV16Patch);\n  const source=retailV16Source+'\\n//# sourceURL=pinewood-runtime.js\\n';",
    "  const retailV16Source=await applyRetailGeometryV16Runtime(localAssetsV15Source,retailV16Patch);\n  const storyV17Source=await applyStoryFoundationV17Runtime(retailV16Source,storyV17Patch,storyModule.STORY_DATA_V17);\n  const source=storyV17Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
  );
}

for(const marker of [
  "const STORY_V17_PATCH='./patches/story-foundation-v17.js.txt';",
  'async function applyStoryFoundationV17Runtime(source,patchText,storyData)',
  "getText(STORY_V17_PATCH)",
  "import('./story/story-data.js')",
  'const storyV17Source=await applyStoryFoundationV17Runtime(retailV16Source,storyV17Patch,storyModule.STORY_DATA_V17);',
  "const source=storyV17Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
])if(!source.includes(marker))fail('postcondition missing: '+marker);

await writeFile(path,source,'utf8');
console.log('Story Foundation v17 loader wiring applied.');
