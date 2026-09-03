import {readFile,writeFile} from 'node:fs/promises';

let source=await readFile('game.js','utf8');
const fail=msg=>{throw new Error('Chapter 1 v20 loader wiring failed: '+msg);};
function replaceOnce(label,needle,replacement){const first=source.indexOf(needle);if(first<0)fail(label+': marker missing');if(source.indexOf(needle,first+needle.length)>=0)fail(label+': marker is not unique');source=source.slice(0,first)+replacement+source.slice(first+needle.length);}

if(!source.includes("const CHAPTER1_V20_PATCH='./patches/chapter1-pcas-escalation-v20.js.txt';")){
  replaceOnce('v20 constant',
    "const PCAS_V19_PATCH='./patches/pcas-voice-v19.js.txt';\nconst PCAS_VOICE_MANIFEST='./assets/audio/pa/manifest.json';",
    "const PCAS_V19_PATCH='./patches/pcas-voice-v19.js.txt';\nconst CHAPTER1_V20_PATCH='./patches/chapter1-pcas-escalation-v20.js.txt';\nconst PCAS_VOICE_MANIFEST='./assets/audio/pa/manifest.json';"
  );
}

if(!source.includes('async function applyChapter1PcasEscalationV20Runtime(source,patchText)')){
  const anchor=`async function applyPcasVoiceV19Runtime(source,patchText,manifest){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyPcasVoiceV19 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyPcasVoiceV19!=='function')throw new Error('PCAS Voice v19 patch did not export its patch function.');return mod.applyPcasVoiceV19(source,manifest);}finally{URL.revokeObjectURL(patchUrl);}\n}\n`;
  const addition=anchor+`async function applyChapter1PcasEscalationV20Runtime(source,patchText){\n  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyChapter1PcasEscalationV20 };\\n'],{type:'text/javascript'}));\n  try{const mod=await import(patchUrl);if(typeof mod.applyChapter1PcasEscalationV20!=='function')throw new Error('Chapter 1 PCAS Escalation v20 patch did not export its patch function.');return mod.applyChapter1PcasEscalationV20(source);}finally{URL.revokeObjectURL(patchUrl);}\n}\n`;
  replaceOnce('v20 runner',anchor,addition);
}

if(!source.includes('storyV17Patch,chapter1V18Patch,pcasV19Patch,chapter1V20Patch,pcasVoiceManifestText')){
  replaceOnce('v20 Promise destructuring',
    'storyV17Patch,chapter1V18Patch,pcasV19Patch,pcasVoiceManifestText,localAssetsManifestText,storyModule]=await Promise.all([',
    'storyV17Patch,chapter1V18Patch,pcasV19Patch,chapter1V20Patch,pcasVoiceManifestText,localAssetsManifestText,storyModule]=await Promise.all(['
  );
  replaceOnce('v20 Promise resource',
    'getText(STORY_V17_PATCH),getText(CHAPTER1_V18_PATCH),getText(PCAS_V19_PATCH),getText(PCAS_VOICE_MANIFEST),getText(LOCAL_ASSETS_MANIFEST)',
    'getText(STORY_V17_PATCH),getText(CHAPTER1_V18_PATCH),getText(PCAS_V19_PATCH),getText(CHAPTER1_V20_PATCH),getText(PCAS_VOICE_MANIFEST),getText(LOCAL_ASSETS_MANIFEST)'
  );
}

if(!source.includes('const chapter1V20Source=await applyChapter1PcasEscalationV20Runtime(')){
  replaceOnce('v20 final source chain',
    "  const pcasV19Source=await applyPcasVoiceV19Runtime(chapter1V18Source,pcasV19Patch,pcasVoiceManifest);\n  const source=pcasV19Source+'\\n//# sourceURL=pinewood-runtime.js\\n';",
    "  const pcasV19Source=await applyPcasVoiceV19Runtime(chapter1V18Source,pcasV19Patch,pcasVoiceManifest);\n  const chapter1V20Source=await applyChapter1PcasEscalationV20Runtime(pcasV19Source,chapter1V20Patch);\n  const source=chapter1V20Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
  );
}

for(const marker of [
  "const CHAPTER1_V20_PATCH='./patches/chapter1-pcas-escalation-v20.js.txt';",
  'async function applyChapter1PcasEscalationV20Runtime(source,patchText)',
  'getText(CHAPTER1_V20_PATCH)',
  'const chapter1V20Source=await applyChapter1PcasEscalationV20Runtime(pcasV19Source,chapter1V20Patch);',
  "const source=chapter1V20Source+'\\n//# sourceURL=pinewood-runtime.js\\n';"
])if(!source.includes(marker))fail('postcondition missing: '+marker);
await writeFile('game.js',source,'utf8');

const auditPath='scripts/audit-pcas-voice-v19.mjs';
let audit=await readFile(auditPath,'utf8');
const stale=`  \"const source=pcasV19Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"\n`;
if(audit.includes(stale))audit=audit.replace(stale,'');
if(!audit.includes("'const pcasV19Source=await applyPcasVoiceV19Runtime(chapter1V18Source,pcasV19Patch,pcasVoiceManifest);'"))fail('v19 audit prerequisite marker disappeared');
if(audit.includes("\"const source=pcasV19Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\""))fail('v19 audit still assumes v19 is the final loader layer');
await writeFile(auditPath,audit,'utf8');
console.log('Chapter 1 PCAS Escalation v20 loader wiring applied; v19 audit is forward-compatible.');
