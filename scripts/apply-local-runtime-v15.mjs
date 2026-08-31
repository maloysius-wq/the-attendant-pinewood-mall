import { readFile, writeFile } from 'node:fs/promises';

function replaceOnce(text,label,needle,replacement){
  const first=text.indexOf(needle);
  if(first<0)throw new Error(`${label}: marker missing`);
  if(text.indexOf(needle,first+needle.length)>=0)throw new Error(`${label}: marker not unique`);
  return text.slice(0,first)+replacement+text.slice(first+needle.length);
}

let game=await readFile('game.js','utf8');
if(!game.includes("const LOCAL_ASSETS_PATCH='./patches/local-assets-v15.js.txt';")){
  game=replaceOnce(game,'v15 loader constants',
    "const CASSETTE_V14_PATCH='./patches/cassette-castle-rebuild-v14.js.txt';\n",
    "const CASSETTE_V14_PATCH='./patches/cassette-castle-rebuild-v14.js.txt';\nconst LOCAL_ASSETS_PATCH='./patches/local-assets-v15.js.txt';\nconst LOCAL_ASSETS_MANIFEST='./assets/vendor/runtime/manifest.json';\n"
  );
  game=replaceOnce(game,'local Pako fallback',
    "const {ungzip}=await import('https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm');",
    "const {ungzip}=await import('./vendor/pako/pako.esm.mjs');"
  );
  const insertAt=game.indexOf('\n\nfunction replaceFoodCourt(');
  if(insertAt<0)throw new Error('v15 patch function insertion marker missing');
  const fn=`\nasync function applyLocalAssetsV15Runtime(source,patchText,manifest){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyLocalAssetsV15 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyLocalAssetsV15!=='function')throw new Error('Local Assets v15 patch did not export its patch function.');return mod.applyLocalAssetsV15(source,manifest);}finally{URL.revokeObjectURL(patchUrl);}\n}`;
  game=game.slice(0,insertAt)+fn+game.slice(insertAt);

  game=replaceOnce(game,'v15 Promise destructure',
    'cassetteV13Patch,cassetteV14Patch]=await Promise.all([',
    'cassetteV13Patch,cassetteV14Patch,localAssetsPatch,localAssetsManifestText]=await Promise.all(['
  );
  game=replaceOnce(game,'v15 Promise inputs',
    'getText(CASSETTE_V13_PATCH),getText(CASSETTE_V14_PATCH)\n  ]);',
    'getText(CASSETTE_V13_PATCH),getText(CASSETTE_V14_PATCH),getText(LOCAL_ASSETS_PATCH),getText(LOCAL_ASSETS_MANIFEST)\n  ]);'
  );
  game=replaceOnce(game,'v15 final source',
    "  const cassetteV14Source=await applyCassetteCastleV14(cassetteV13Source,cassetteV14Patch);\n  const source=cassetteV14Source+'\\n//# sourceURL=pinewood-runtime.js\\n';",
    "  const cassetteV14Source=await applyCassetteCastleV14(cassetteV13Source,cassetteV14Patch);\n  const localAssetsManifest=JSON.parse(localAssetsManifestText);\n  const localAssetsV15Source=await applyLocalAssetsV15Runtime(cassetteV14Source,localAssetsPatch,localAssetsManifest);\n  const source=localAssetsV15Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
  );
  await writeFile('game.js',game,'utf8');
}

let index=await readFile('index.html','utf8');
const remoteMap='<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"}}</script>';
const localMap='<script type="importmap">{"imports":{"three":"./vendor/three/build/three.module.js","three/addons/":"./vendor/three/examples/jsm/"}}</script>';
if(index.includes(remoteMap)){
  index=replaceOnce(index,'local Three.js import map',remoteMap,localMap);
  await writeFile('index.html',index,'utf8');
}else if(!index.includes(localMap)){
  throw new Error('Three.js import map is neither expected remote form nor local v15 form');
}

console.log('Local runtime v15 wiring applied: local asset manifest patch, local Pako, and local Three.js import map.');
