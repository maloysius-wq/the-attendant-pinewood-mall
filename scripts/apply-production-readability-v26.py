from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one marker, found {count}")
    return text.replace(old, new, 1)


game_path = Path('game.js')
game = game_path.read_text()
game = replace_once(
    game,
    "const CHAPTER6_V25_PATCH='./patches/chapter6-last-shift-v25.js.txt';\n",
    "const CHAPTER6_V25_PATCH='./patches/chapter6-last-shift-v25.js.txt';\nconst PRODUCTION_READABILITY_V26_PATCH='./patches/production-readability-v26.js.txt';\n",
    'v26 patch constant',
)
v25_runtime = """async function applyChapter6LastShiftV25Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyChapter6LastShiftV25 };\\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyChapter6LastShiftV25!=='function')throw new Error('Chapter 6 Last Shift v25 patch did not export its patch function.');return mod.applyChapter6LastShiftV25(source);}finally{URL.revokeObjectURL(patchUrl);}
}
"""
v26_runtime = v25_runtime + """
async function applyProductionReadabilityV26Runtime(source,patchText){
  const patchUrl=URL.createObjectURL(new Blob([patchText+'\\nexport { applyProductionReadabilityV26 };\\n'],{type:'text/javascript'}));
  try{const mod=await import(patchUrl);if(typeof mod.applyProductionReadabilityV26!=='function')throw new Error('Production readability v26 patch did not export its patch function.');return mod.applyProductionReadabilityV26(source);}finally{URL.revokeObjectURL(patchUrl);}
}
"""
game = replace_once(game, v25_runtime, v26_runtime, 'v26 runtime adapter')
game = replace_once(
    game,
    'chapter5V24Patch,chapter6V25Patch,pcasVoiceManifestText',
    'chapter5V24Patch,chapter6V25Patch,productionReadabilityV26Patch,pcasVoiceManifestText',
    'v26 promise destructuring',
)
game = replace_once(
    game,
    'getText(CHAPTER5_V24_PATCH),getText(CHAPTER6_V25_PATCH),getText(PCAS_VOICE_MANIFEST)',
    'getText(CHAPTER5_V24_PATCH),getText(CHAPTER6_V25_PATCH),getText(PRODUCTION_READABILITY_V26_PATCH),getText(PCAS_VOICE_MANIFEST)',
    'v26 patch fetch',
)
game = replace_once(
    game,
    "  const chapter6V25Source=await applyChapter6LastShiftV25Runtime(chapter5V24Source,chapter6V25Patch);\n  const source=chapter6V25Source+'\\n//# sourceURL=pinewood-runtime.js\\n';",
    "  const chapter6V25Source=await applyChapter6LastShiftV25Runtime(chapter5V24Source,chapter6V25Patch);\n  const productionReadabilityV26Source=await applyProductionReadabilityV26Runtime(chapter6V25Source,productionReadabilityV26Patch);\n  const source=productionReadabilityV26Source+'\\n//# sourceURL=pinewood-runtime.js\\n';",
    'v26 terminal source',
)
game_path.write_text(game)
