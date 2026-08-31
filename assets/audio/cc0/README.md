# Pinewood CC0 audio bank

These are locally vendored, transcoded copies of verified CC0 recordings used by The Attendant: Pinewood Mall.

Every file in this directory was normalized during vendoring with FFmpeg EBU R128 loudness normalization:

- integrated target: **-20 LUFS**
- true-peak ceiling: **-2 dBTP**
- loudness-range target: **7 LU**
- output: stereo, 44.1 kHz, Vorbis OGG

Runtime mix gains still make quiet events quiet and dangerous events loud; those gains are creative mix decisions rather than compensation for inconsistent source-file loudness.

Full source provenance and licenses are recorded in the repository root `LICENSES.md`.
