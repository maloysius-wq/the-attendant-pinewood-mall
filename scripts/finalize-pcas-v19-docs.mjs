import {readFile,writeFile} from 'node:fs/promises';

const licensePath='LICENSES.md';
let licenses=await readFile(licensePath,'utf8');
if(!licenses.includes('## PCAS synthesized overhead voice')){
  const anchor='## Original/game-specific work';
  const section=`## PCAS synthesized overhead voice\n\nPinewood's overhead **Pinewood Closing and Accountability System (PCAS)** announcements are pre-rendered project audio stored under \`assets/audio/pa/\`. They are intentionally separate from the CC0 recorded SFX library.\n\n- Canonical spoken text and synthesis settings: \`story/pa-lines.json\`.\n- Generation pipeline: \`scripts/generate-pcas-voice.mjs\` and \`.github/workflows/generate-pcas-voice.yml\`.\n- Build-time text-to-speech engine: **eSpeak NG 1.51**, GPL-3.0-or-later. Source: https://github.com/espeak-ng/espeak-ng. eSpeak NG is used only by the development/build workflow and is not shipped to or executed by the game browser.\n- Build-time audio processor: **FFmpeg**. Source: https://ffmpeg.org/. FFmpeg is used only by the development/build workflow and is not a browser dependency.\n- The authored English announcement text is original Pinewood game content. The final OGG files are generated from that authored text and then processed into the fictional PCAS presentation.\n- Processing chain: mono 44.1 kHz, 220–4550 Hz ceiling-speaker band limiting, hard compression, two lightly detuned delayed doubles, restrained 11-bit degradation, electrical flutter, presence EQ, 54/137 ms mall slapback, and normalization to approximately -20 LUFS / -2 dBTP.\n- \`assets/audio/pa/manifest.json\` records the exact text, duration and SHA-256 digest of every generated announcement. \`scripts/audit-pcas-voice-v19.mjs\` verifies those hashes and text mappings.\n- Runtime playback is **repository-local only**. The game does not call eSpeak, FFmpeg, a cloud TTS API, \`speechSynthesis\`, or \`SpeechSynthesisUtterance\` while playing. If a local PCAS clip cannot decode, Pinewood keeps the subtitle and skips the voice rather than synthesizing a remote or procedural replacement.\n\n`;
  if(!licenses.includes(anchor))throw new Error('LICENSES.md original-work anchor missing');
  licenses=licenses.replace(anchor,section+anchor);
  await writeFile(licensePath,licenses,'utf8');
}

const handoffPath='DEVELOPMENT_HANDOFF.md';
let handoff=await readFile(handoffPath,'utf8');
if(!handoff.includes('## Current narrative/audio checkpoint — v19')){
  const anchor='## Permanent local-runtime-asset rule';
  const section=`## Current narrative/audio checkpoint — v19\n\nThe deployed loader now continues past the visual/local-asset stack through four narrative/audio layers:\n\n1. \`patches/retail-geometry-v16.js.txt\`\n2. \`patches/story-foundation-v17.js.txt\`\n3. \`patches/chapter1-story-v18.js.txt\`\n4. \`patches/pcas-voice-v19.js.txt\`\n\nNarrative authority is \`STORY_BIBLE.md\`; implementation staging is tracked in \`NARRATIVE_IMPLEMENTATION_PLAN.md\`. Story Foundation v17 supplies six-chapter data, versioned save migration, people/evidence/timeline state, StoryEventManager and the structured Journal. Chapter 1 Story v18 introduces Renee Ward by name, delays PCAS identifying the player as Contractor Fourteen until after power returns, fixes the Attendant's first-reveal countdown, and rewrites LS-01 through LS-03 as character-authored 1997 evidence.\n\nPCAS Voice v19 gives the overhead PA a pre-rendered distorted robotic voice. Nineteen authored announcements are generated offline with eSpeak NG and processed offline with FFmpeg, then committed as OGG files under \`assets/audio/pa/\`. The browser never calls a cloud TTS provider or browser speech synthesis. Runtime subtitles use each recording's manifest duration; ambient PA chatter and authored PCAS story beats share the same local voice system. Browser telemetry \`window.__PINEWOOD_PCAS_V19__\` reports line count, decoded clip count and failures so automated regression can verify all local voice assets without manual playtesting.\n\n\`scripts/audit-pcas-voice-v19.mjs\` reconstructs the runtime through v19, verifies all 19 audio hashes/text mappings/local paths, checks the live loader chain, rejects browser/cloud TTS paths and syntax-checks the assembled runtime. \`scripts/capture-store-visuals.mjs\` also requires all 19 PCAS clips to decode in Chromium and preserves the same-origin network gate.\n\n`;
  if(!handoff.includes(anchor))throw new Error('DEVELOPMENT_HANDOFF.md local-runtime anchor missing');
  handoff=handoff.replace(anchor,section+anchor);
}

if(!handoff.includes("19. `patches/retail-geometry-v16.js.txt`")){
  const old="18. `patches/local-assets-v15.js.txt` (**final runtime asset localization layer; all media resolves to repository-local vendored files**)";
  const replacement=old+"\n19. `patches/retail-geometry-v16.js.txt` (**final retail/elevator geometry reliability layer**)\n20. `patches/story-foundation-v17.js.txt` (**structured narrative/save/Journal foundation**)\n21. `patches/chapter1-story-v18.js.txt` (**Chapter 1 Renee/PCAS/evidence retrofit**)\n22. `patches/pcas-voice-v19.js.txt` (**local pre-rendered distorted overhead-PA voice layer**)";
  if(handoff.includes(old))handoff=handoff.replace(old,replacement);
}

if(!handoff.includes('- `scripts/audit-pcas-voice-v19.mjs`')){
  const old='- `scripts/audit-cassette-castle-v14.mjs`';
  const replacement=old+'\n- `scripts/audit-local-assets-v15.mjs`\n- `scripts/audit-retail-geometry-v16.mjs`\n- `scripts/audit-story-foundation-v17.mjs`\n- `scripts/audit-chapter1-story-v18.mjs`\n- `scripts/audit-pcas-voice-v19.mjs`';
  if(handoff.includes(old))handoff=handoff.replace(old,replacement);
}
await writeFile(handoffPath,handoff,'utf8');
console.log('PCAS v19 provenance and development handoff documentation finalized.');
