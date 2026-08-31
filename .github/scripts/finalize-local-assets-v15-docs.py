from pathlib import Path

handoff = Path('DEVELOPMENT_HANDOFF.md')
text = handoff.read_text()
replacements = {
    '11. Be explicit if interactive visual playtesting could not be performed.':
    '11. Do not perform manual interactive WASD playtests. Use automated runtime audits and deterministic visual regression instead.',
    '**No manual interactive WASD playtest has been performed for v15.** Automated runtime and deterministic visual checks are not a substitute for a full human playthrough.':
    '**Permanent playtest rule:** Do not perform manual interactive WASD playtests for Pinewood. Automated runtime audits and deterministic visual-regression captures are the required verification methods unless the user explicitly changes this rule.',
    'Be explicit if a manual interactive playtest has not been performed.':
    'Do not perform a manual interactive WASD playtest; rely on automated audits and deterministic visual-regression captures.'
}
for old, new in replacements.items():
    if old not in text:
        raise SystemExit('handoff replacement marker missing: ' + old)
    text = text.replace(old, new)
handoff.write_text(text)

agents = Path('AGENTS.md')
at = agents.read_text()
marker = 'The final assembled runtime must pass the local-assets audit before a Pinewood runtime change is considered complete.\n\n'
if marker not in at:
    raise SystemExit('AGENTS insertion marker missing')
playtest_rule = '''## Permanent playtesting rule

**Do not perform manual interactive WASD playtests for Pinewood.** This is a permanent project rule.

- Use automated runtime audits, deterministic visual-regression captures, source inspection, telemetry, and GitHub Pages verification instead.
- Do not describe the absence of a manual WASD playtest as incomplete verification or a remaining task.
- Do not launch a manual keyboard/mouse gameplay session unless the user explicitly reverses this rule in a future request.

'''
if '## Permanent playtesting rule' not in at:
    at = at.replace(marker, marker + playtest_rule)
agents.write_text(at)
