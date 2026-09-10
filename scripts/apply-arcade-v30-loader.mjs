import {readFile,writeFile} from 'node:fs/promises';

function replaceOnce(source,label,needle,replacement){
  const i=source.indexOf(needle);if(i<0)throw new Error(label+': marker missing');
  if(source.indexOf(needle,i+needle.length)>=0)throw new Error(label+': marker not unique');
  return source.slice(0,i)+replacement+source.slice(i+needle.length);
}

let game=await readFile('game.js','utf8');
if(!game.includes("const ARCADE_V30_PATCH='./patches/arcade-rebuild-v30.js.txt';")){
  game=replaceOnce(game,'arcade patch constant',
    "const FREIGHT_ELEVATOR_V28_PATCH='./patches/freight-elevator-reliability-v28.js.txt';\n",
    "const FREIGHT_ELEVATOR_V28_PATCH='./patches/freight-elevator-reliability-v28.js.txt';\nconst ARCADE_V30_PATCH='./patches/arcade-rebuild-v30.js.txt';\n");
  const freightHelper=`async function applyFreightElevatorReliabilityV28Runtime(source,patchText){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyFreightElevatorReliabilityV28 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyFreightElevatorReliabilityV28!=='function')throw new Error('Freight Elevator Reliability v28 patch did not export its patch function.');return mod.applyFreightElevatorReliabilityV28(source);}finally{URL.revokeObjectURL(patchUrl);}\n}\n`;
  const arcadeHelper=`${freightHelper}\nasync function applyArcadeRebuildV30Runtime(source,patchText){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyArcadeRebuildV30 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyArcadeRebuildV30!=='function')throw new Error('Sunburst Arcade v30 patch did not export its patch function.');return mod.applyArcadeRebuildV30(source);}finally{URL.revokeObjectURL(patchUrl);}\n}\n`;
  game=replaceOnce(game,'arcade runtime helper',freightHelper,arcadeHelper);
  game=replaceOnce(game,'arcade Promise binding',
    'productionReadabilityV26Patch,audioDirectionV27Patch,freightElevatorV28Patch,pcasVoiceManifestText',
    'productionReadabilityV26Patch,audioDirectionV27Patch,freightElevatorV28Patch,arcadeV30Patch,pcasVoiceManifestText');
  game=replaceOnce(game,'arcade Promise fetch',
    'getText(PRODUCTION_READABILITY_V26_PATCH),getText(AUDIO_DIRECTION_V27_PATCH),getText(FREIGHT_ELEVATOR_V28_PATCH),getText(PCAS_VOICE_MANIFEST)',
    'getText(PRODUCTION_READABILITY_V26_PATCH),getText(AUDIO_DIRECTION_V27_PATCH),getText(FREIGHT_ELEVATOR_V28_PATCH),getText(ARCADE_V30_PATCH),getText(PCAS_VOICE_MANIFEST)');
  game=replaceOnce(game,'arcade feed-forward before terminal audio',
    "  const freightElevatorV28Source=await applyFreightElevatorReliabilityV28Runtime(productionReadabilityV26Source,freightElevatorV28Patch);\n  const audioDirectionV27Source=await applyAudioDirectionV27Runtime(freightElevatorV28Source,audioDirectionV27Patch,characterVoiceManifest);",
    "  const freightElevatorV28Source=await applyFreightElevatorReliabilityV28Runtime(productionReadabilityV26Source,freightElevatorV28Patch);\n  const arcadeV30Source=await applyArcadeRebuildV30Runtime(freightElevatorV28Source,arcadeV30Patch);\n  const audioDirectionV27Source=await applyAudioDirectionV27Runtime(arcadeV30Source,audioDirectionV27Patch,characterVoiceManifest);");
  await writeFile('game.js',game);
}

let audioAudit=await readFile('scripts/audit-audio-direction-v27.mjs','utf8');
if(!audioAudit.includes("const ARCADE_V30_PATCH='./patches/arcade-rebuild-v30.js.txt';")){
  audioAudit=replaceOnce(audioAudit,'audio audit arcade feed-forward marker',
    `  "const AUDIO_DIRECTION_V27_PATCH='./patches/audio-direction-v27.js.txt';",\n  "const CHARACTER_VOICE_MANIFEST='./assets/audio/characters/manifest.json';",`,
    `  "const AUDIO_DIRECTION_V27_PATCH='./patches/audio-direction-v27.js.txt';",\n  "const ARCADE_V30_PATCH='./patches/arcade-rebuild-v30.js.txt';",\n  "const CHARACTER_VOICE_MANIFEST='./assets/audio/characters/manifest.json';",\n  'applyArcadeRebuildV30Runtime',\n  'arcadeV30Source',`);
  await writeFile('scripts/audit-audio-direction-v27.mjs',audioAudit);
}

for(const marker of ["const ARCADE_V30_PATCH='./patches/arcade-rebuild-v30.js.txt';",'applyArcadeRebuildV30Runtime','getText(ARCADE_V30_PATCH)','const arcadeV30Source=await applyArcadeRebuildV30Runtime','applyAudioDirectionV27Runtime(arcadeV30Source'])if(!game.includes(marker))throw new Error('Arcade v30 loader marker missing: '+marker);
console.log('Sunburst Arcade v30 is wired after Freight Elevator v28 and before terminal Audio Direction v27.');
