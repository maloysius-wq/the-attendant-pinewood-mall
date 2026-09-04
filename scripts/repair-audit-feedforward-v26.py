from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one marker, found {count}")
    return text.replace(old, new, 1)

# Chapter 3's long-lived loader audit must understand that v25 can now feed v26.
p = Path('scripts/audit-chapter3-security-readability-v22d.mjs')
s = p.read_text()
s = replace_once(
    s,
    "const v25=loader.includes(\"const CHAPTER6_V25_PATCH='./patches/chapter6-last-shift-v25.js.txt';\");\n",
    "const v25=loader.includes(\"const CHAPTER6_V25_PATCH='./patches/chapter6-last-shift-v25.js.txt';\");\nconst v26=loader.includes(\"const PRODUCTION_READABILITY_V26_PATCH='./patches/production-readability-v26.js.txt';\");\n",
    'v22d v26 detector',
)
s = replace_once(
    s,
    "  if(v25&&!v24)fail('game.js cannot wire v25 without v24');\n",
    "  if(v25&&!v24)fail('game.js cannot wire v25 without v24');\n  if(v26&&!v25)fail('game.js cannot wire v26 without v25');\n",
    'v22d dependency guard',
)
old = """        if(v25){
          for(const marker of ['async function applyChapter6LastShiftV25Runtime(source,patchText)','getText(CHAPTER6_V25_PATCH)','const chapter6V25Source=await applyChapter6LastShiftV25Runtime(chapter5V24Source,chapter6V25Patch);',\"const source=chapter6V25Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"])if(!loader.includes(marker))fail('game.js invalid v24→v25 feed-forward marker: '+marker);
          if(loader.includes(\"const source=chapter5V24Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"))fail('game.js still boots terminal v24 while v25 is present');
        }else if(!loader.includes(\"const source=chapter5V24Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"))fail('game.js missing terminal v24 source marker');
"""
new = """        if(v25){
          for(const marker of ['async function applyChapter6LastShiftV25Runtime(source,patchText)','getText(CHAPTER6_V25_PATCH)','const chapter6V25Source=await applyChapter6LastShiftV25Runtime(chapter5V24Source,chapter6V25Patch);'])if(!loader.includes(marker))fail('game.js invalid v24→v25 feed-forward marker: '+marker);
          if(loader.includes(\"const source=chapter5V24Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"))fail('game.js still boots terminal v24 while v25 is present');
          if(v26){
            for(const marker of ['async function applyProductionReadabilityV26Runtime(source,patchText)','getText(PRODUCTION_READABILITY_V26_PATCH)','const productionReadabilityV26Source=await applyProductionReadabilityV26Runtime(chapter6V25Source,productionReadabilityV26Patch);',\"const source=productionReadabilityV26Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"])if(!loader.includes(marker))fail('game.js invalid v25→v26 feed-forward marker: '+marker);
            if(loader.includes(\"const source=chapter6V25Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"))fail('game.js still boots terminal v25 while v26 is present');
          }else if(!loader.includes(\"const source=chapter6V25Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"))fail('game.js missing terminal v25 source marker');
        }else if(!loader.includes(\"const source=chapter5V24Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"))fail('game.js missing terminal v24 source marker');
"""
s = replace_once(s, old, new, 'v22d v25/v26 feed-forward block')
s = replace_once(
    s,
    "${v25?'→V25':''}): Security readability",
    "${v25?'→V25':''}${v26?'→V26':''}): Security readability",
    'v22d status suffix',
)
p.write_text(s)

# Chapter 6's audit must permit a later readability layer instead of insisting on v25 as terminal.
p = Path('scripts/audit-chapter6-last-shift-v25.mjs')
s = p.read_text()
loader_start = s.index("const loader=await readFile('game.js','utf8')")
console_start = s.index("console.log(`Chapter 6 Last Shift v25 PASS", loader_start)
new_loader = """const loader=await readFile('game.js','utf8'),live=loader.includes(\"const CHAPTER6_V25_PATCH='./patches/chapter6-last-shift-v25.js.txt';\"),v26=loader.includes(\"const PRODUCTION_READABILITY_V26_PATCH='./patches/production-readability-v26.js.txt';\");
if(live){
  for(const marker of ['applyChapter6LastShiftV25Runtime','getText(CHAPTER6_V25_PATCH)','const chapter6V25Source=await applyChapter6LastShiftV25Runtime(chapter5V24Source,chapter6V25Patch);'])if(!loader.includes(marker))fail('game.js partial/incorrect live v25 marker: '+marker);
  if(loader.includes(\"const source=chapter5V24Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"))fail('game.js still boots terminal v24 while v25 is present');
  if(v26){
    for(const marker of ['applyProductionReadabilityV26Runtime','getText(PRODUCTION_READABILITY_V26_PATCH)','const productionReadabilityV26Source=await applyProductionReadabilityV26Runtime(chapter6V25Source,productionReadabilityV26Patch);',\"const source=productionReadabilityV26Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"])if(!loader.includes(marker))fail('game.js invalid v25→v26 feed-forward marker: '+marker);
    if(loader.includes(\"const source=chapter6V25Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"))fail('game.js still boots terminal v25 while v26 is present');
  }else if(!loader.includes(\"const source=chapter6V25Source+'\\\\n//# sourceURL=pinewood-runtime.js\\\\n';\"))fail('game.js missing terminal v25 source marker');
}else if(loader.includes('applyChapter6LastShiftV25Runtime')||loader.includes('chapter6V25Source'))fail('game.js contains partial v25 wiring');
"""
s = s[:loader_start] + new_loader + s[console_start:]
s = replace_once(
    s,
    "(${live?'LIVE-CANDIDATE':'STAGED'}): memory reconstruction",
    "(${live?'LIVE-CANDIDATE':'STAGED'}${v26?'→V26':''}): memory reconstruction",
    'v25 status suffix',
)
p.write_text(s)
