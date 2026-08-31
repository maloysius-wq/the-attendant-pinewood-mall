import { readFile, writeFile } from 'node:fs/promises';

function replaceOnce(text,label,needle,replacement){
  const first=text.indexOf(needle);
  if(first<0)throw new Error(`${label}: marker missing`);
  if(text.indexOf(needle,first+needle.length)>=0)throw new Error(`${label}: marker is not unique`);
  return text.slice(0,first)+replacement+text.slice(first+needle.length);
}

let game=await readFile('game.js','utf8');
if(!game.includes("const RETAIL_V16_PATCH='./patches/retail-geometry-v16.js.txt';")){
  game=replaceOnce(game,'v16 constant',"const LOCAL_ASSETS_PATCH='./patches/local-assets-v15.js.txt';\n","const LOCAL_ASSETS_PATCH='./patches/local-assets-v15.js.txt';\nconst RETAIL_V16_PATCH='./patches/retail-geometry-v16.js.txt';\n");
}
if(!game.includes('async function applyRetailGeometryV16Runtime(source,patchText)')){
  const marker="async function applyLocalAssetsV15Runtime(source,patchText,manifest){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyLocalAssetsV15 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyLocalAssetsV15!=='function')throw new Error('Local Assets v15 patch did not export its patch function.');return mod.applyLocalAssetsV15(source,manifest);}finally{URL.revokeObjectURL(patchUrl);}\n}\n";
  const replacement=marker+"async function applyRetailGeometryV16Runtime(source,patchText){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyRetailGeometryV16 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyRetailGeometryV16!=='function')throw new Error('Retail Geometry v16 patch did not export its patch function.');return mod.applyRetailGeometryV16(source);}finally{URL.revokeObjectURL(patchUrl);}\n}\n";
  game=replaceOnce(game,'v16 runtime applier',marker,replacement);
}
if(!game.includes('retailV16Patch,localAssetsManifestText]=await Promise.all([')){
  game=replaceOnce(game,'v16 Promise destructuring','cassetteV13Patch,cassetteV14Patch,localAssetsPatch,localAssetsManifestText]=await Promise.all([','cassetteV13Patch,cassetteV14Patch,localAssetsPatch,retailV16Patch,localAssetsManifestText]=await Promise.all([');
}
if(!game.includes('getText(RETAIL_V16_PATCH),getText(LOCAL_ASSETS_MANIFEST)')){
  game=replaceOnce(game,'v16 Promise fetch','getText(CASSETTE_V13_PATCH),getText(CASSETTE_V14_PATCH),getText(LOCAL_ASSETS_PATCH),getText(LOCAL_ASSETS_MANIFEST)','getText(CASSETTE_V13_PATCH),getText(CASSETTE_V14_PATCH),getText(LOCAL_ASSETS_PATCH),getText(RETAIL_V16_PATCH),getText(LOCAL_ASSETS_MANIFEST)');
}
if(!game.includes('const retailV16Source=await applyRetailGeometryV16Runtime(localAssetsV15Source,retailV16Patch);')){
  game=replaceOnce(game,'v16 patch application','  const localAssetsV15Source=await applyLocalAssetsV15Runtime(cassetteV14Source,localAssetsPatch,localAssetsManifest);\n','  const localAssetsV15Source=await applyLocalAssetsV15Runtime(cassetteV14Source,localAssetsPatch,localAssetsManifest);\n  const retailV16Source=await applyRetailGeometryV16Runtime(localAssetsV15Source,retailV16Patch);\n');
}
game=game.replace('  const source=localAssetsV15Source+','  const source=retailV16Source+');
await writeFile('game.js',game);

for(const path of ['scripts/audit-cassette-castle-v13.mjs','scripts/audit-cassette-castle-v14.mjs','scripts/audit-local-assets-v15.mjs']){
  let text=await readFile(path,'utf8');
  text=text.replace(/['\"]const source=localAssetsV15Source\+['\"]/g,m=>m.replace('localAssetsV15Source','retailV16Source'));
  await writeFile(path,text);
}

let capture=await readFile('scripts/capture-store-visuals.mjs','utf8');
capture=capture.replace("const views=['cassette-front','cassette-center','cassette-listening'];","const views=['cassette-front','cassette-center','cassette-listening','elevator-front'];");
await writeFile('scripts/capture-store-visuals.mjs',capture);

let workflow=await readFile('.github/workflows/runtime-audit.yml','utf8');
if(!workflow.includes("      - 'scripts/audit-retail-geometry-v16.mjs'")){
  workflow=workflow.replace("      - 'scripts/audit-local-assets-v15.mjs'\n      - '.github/workflows/runtime-audit.yml'","      - 'scripts/audit-local-assets-v15.mjs'\n      - 'scripts/audit-retail-geometry-v16.mjs'\n      - '.github/workflows/runtime-audit.yml'");
  workflow=workflow.replace("      - 'scripts/audit-local-assets-v15.mjs'\n      - '.github/workflows/runtime-audit.yml'","      - 'scripts/audit-local-assets-v15.mjs'\n      - 'scripts/audit-retail-geometry-v16.mjs'\n      - '.github/workflows/runtime-audit.yml'");
}
if(!workflow.includes('Validate retail geometry v16')){
  workflow=workflow.replace('      - name: Validate local runtime assets v15\n        run: node scripts/audit-local-assets-v15.mjs\n','      - name: Validate local runtime assets v15\n        run: node scripts/audit-local-assets-v15.mjs\n      - name: Validate retail geometry v16\n        run: node scripts/audit-retail-geometry-v16.mjs\n');
}
await writeFile('.github/workflows/runtime-audit.yml',workflow);

console.log('Retail Geometry v16 loader, audits, capture harness, and runtime workflow wiring updated.');
