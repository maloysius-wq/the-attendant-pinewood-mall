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

const handoffPath='DEVELOPMENT_HANDOFF.md';
let handoff=await readFile(handoffPath,'utf8');
const checkpointAnchor='## Permanent local-runtime-asset rule';
const v20Section=`## Current narrative/audio checkpoint - v20\n\nThe deployed loader now continues past the visual/local-asset stack through five narrative/audio layers:\n\n1. \`patches/retail-geometry-v16.js.txt\`\n2. \`patches/story-foundation-v17.js.txt\`\n3. \`patches/chapter1-story-v18.js.txt\`\n4. \`patches/pcas-voice-v19.js.txt\`\n5. \`patches/chapter1-pcas-escalation-v20.js.txt\`\n\nNarrative authority is \`STORY_BIBLE.md\`; implementation staging is tracked in \`NARRATIVE_IMPLEMENTATION_PLAN.md\`. Story Foundation v17 supplies the six-chapter data framework, versioned save migration, people/evidence/timeline state, StoryEventManager and structured Journal. Chapter 1 Story v18 introduces Renee Ward by name, delays PCAS identifying the player as Contractor Fourteen until after power returns, fixes the Attendant's first-reveal countdown, and rewrites LS-01 through LS-03 as character-authored 1997 evidence.\n\nPCAS Voice v19 remains the local pre-rendered voice infrastructure. Authored announcements in \`story/pa-lines.json\` are generated offline with eSpeak NG and processed offline with FFmpeg, then committed as OGG files under \`assets/audio/pa/\`. The browser never calls a cloud TTS provider or browser speech synthesis. The voice manifest and automated gates are manifest-driven so later authored PCAS lines can be added without hard-coding an old line count.\n\nChapter 1 PCAS Escalation v20 turns those announcements into a state-aware story system. Before power, PCAS is generic mall automation. The first restored circuit registers Contractor Fourteen. The second restored circuit produces a route-deviation response and Renee explicitly notices that Pinewood is reacting to the player's movement. Picking up the Master Service Key causes PCAS to flag a property discrepancy and Renee recognizes that the building is observing actions it should not have access to. At the freight elevator, PCAS and Renee give contradictory departure instructions. Ambient Chapter 1 announcements also escalate with breaker state, moving from public closing language toward contractor-specific surveillance/accountability language.\n\nChapter 1 deliberately stops short of supernatural voice imitation. Runtime telemetry reports \`window.__PINEWOOD_CH1_V20__={version:20,reactivePcas:true,reneeAware:true,voiceImitation:false}\`. Renee imitation is reserved for a later chapter where it can function as a major escalation rather than an early gimmick.\n\nVerification checkpoint: the last runtime-affecting v20 source passed Runtime Audit #75 (run \`33703984033\`) and Store Visual Regression #38 (run \`33703984005\`). The current head then passed final Chapter 1 browser gate #40 (run \`33704143839\`) and GitHub Pages #287 (run \`33704142656\`). No manual WASD playtest was used.\n\n\`scripts/audit-pcas-voice-v19.mjs\` remains the local-voice/hash/runtime-TTS gate, while \`scripts/audit-chapter1-pcas-v20.mjs\` reconstructs and validates the reactive Chapter 1 escalation. Browser regression verifies the story/PCAS telemetry and same-origin runtime network policy.\n\n`;
if(handoff.includes('## Current narrative/audio checkpoint — v19')){
  const start=handoff.indexOf('## Current narrative/audio checkpoint — v19');
  const end=handoff.indexOf(checkpointAnchor,start);
  if(end<0)fail('handoff permanent-rule anchor missing');
  handoff=handoff.slice(0,start)+v20Section+handoff.slice(end);
}else if(!handoff.includes('## Current narrative/audio checkpoint - v20'))fail('handoff narrative checkpoint marker missing');

const v19Architecture='22. `patches/pcas-voice-v19.js.txt` (**local pre-rendered distorted overhead-PA voice layer**)';
const v20Architecture='23. `patches/chapter1-pcas-escalation-v20.js.txt` (**Chapter 1 state-aware reactive PCAS escalation; Renee observes the conflict; voice imitation deliberately deferred**)';
if(!handoff.includes(v20Architecture)){
  if(!handoff.includes(v19Architecture))fail('handoff v19 architecture marker missing');
  handoff=handoff.replace(v19Architecture,v19Architecture+'\n'+v20Architecture);
}
const v19Audit='- `scripts/audit-pcas-voice-v19.mjs`';
const v20Audit='- `scripts/audit-chapter1-pcas-v20.mjs`';
if(!handoff.includes(v20Audit)){
  if(!handoff.includes(v19Audit))fail('handoff v19 audit marker missing');
  handoff=handoff.replace(v19Audit,v19Audit+'\n'+v20Audit);
}
await writeFile(handoffPath,handoff,'utf8');
console.log('Chapter 1 PCAS Escalation v20 loader and handoff are current.');
