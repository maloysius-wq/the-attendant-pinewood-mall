import {readFile,writeFile} from 'node:fs/promises';

const file='game.js';
let source=await readFile(file,'utf8');
const fail=m=>{throw new Error('Freight elevator v28 live wiring failed: '+m);};
const replaceOnce=(label,needle,replacement)=>{
  const first=source.indexOf(needle);if(first<0)fail(label+' marker missing');
  if(source.indexOf(needle,first+needle.length)>=0)fail(label+' marker is not unique');
  source=source.slice(0,first)+replacement+source.slice(first+needle.length);
};

if(source.includes("const FREIGHT_ELEVATOR_V28_PATCH='./patches/freight-elevator-reliability-v28.js.txt';")){
  console.log('Freight Elevator Reliability v28 is already wired into game.js.');
  process.exit(0);
}

replaceOnce('patch constant',
  "const AUDIO_DIRECTION_V27_PATCH='./patches/audio-direction-v27.js.txt';",
  "const AUDIO_DIRECTION_V27_PATCH='./patches/audio-direction-v27.js.txt';\nconst FREIGHT_ELEVATOR_V28_PATCH='./patches/freight-elevator-reliability-v28.js.txt';"
);

const audioHelperStart=source.indexOf('async function applyAudioDirectionV27Runtime(source,patchText,manifest){');
if(audioHelperStart<0)fail('Audio Direction v27 helper missing');
const audioHelperEnd=source.indexOf('\n}',audioHelperStart);
if(audioHelperEnd<0)fail('Audio Direction v27 helper end missing');
const insertAt=audioHelperEnd+2;
const helper=`\nasync function applyFreightElevatorReliabilityV28Runtime(source,patchText){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyFreightElevatorReliabilityV28 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyFreightElevatorReliabilityV28!=='function')throw new Error('Freight Elevator Reliability v28 patch did not export its patch function.');return mod.applyFreightElevatorReliabilityV28(source);}finally{URL.revokeObjectURL(patchUrl);}\n}\n`;
source=source.slice(0,insertAt)+helper+source.slice(insertAt);

replaceOnce('Promise destructuring',
  'productionReadabilityV26Patch,audioDirectionV27Patch,pcasVoiceManifestText',
  'productionReadabilityV26Patch,audioDirectionV27Patch,freightElevatorV28Patch,pcasVoiceManifestText'
);
replaceOnce('Promise patch fetch',
  'getText(PRODUCTION_READABILITY_V26_PATCH),getText(AUDIO_DIRECTION_V27_PATCH),getText(PCAS_VOICE_MANIFEST)',
  'getText(PRODUCTION_READABILITY_V26_PATCH),getText(AUDIO_DIRECTION_V27_PATCH),getText(FREIGHT_ELEVATOR_V28_PATCH),getText(PCAS_VOICE_MANIFEST)'
);
replaceOnce('runtime feed-forward',
  '  const productionReadabilityV26Source=await applyProductionReadabilityV26Runtime(chapter6V25Source,productionReadabilityV26Patch);\n  const audioDirectionV27Source=await applyAudioDirectionV27Runtime(productionReadabilityV26Source,audioDirectionV27Patch,characterVoiceManifest);',
  '  const productionReadabilityV26Source=await applyProductionReadabilityV26Runtime(chapter6V25Source,productionReadabilityV26Patch);\n  const freightElevatorV28Source=await applyFreightElevatorReliabilityV28Runtime(productionReadabilityV26Source,freightElevatorV28Patch);\n  const audioDirectionV27Source=await applyAudioDirectionV27Runtime(freightElevatorV28Source,audioDirectionV27Patch,characterVoiceManifest);'
);

for(const marker of ['FREIGHT_ELEVATOR_V28_PATCH','applyFreightElevatorReliabilityV28Runtime','freightElevatorV28Patch','freightElevatorV28Source'])if(!source.includes(marker))fail('result missing '+marker);
await writeFile(file,source);
console.log('Wired Freight Elevator Reliability v28 before terminal Audio Direction v27.');
