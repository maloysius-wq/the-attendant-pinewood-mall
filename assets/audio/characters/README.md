# Pinewood Character Voice Assets

Pre-rendered, repository-local dialogue for Audio Direction v27.

## Renee Ward

Renee uses the user-approved **AI Voice Generator Crisp, Take 1** performance direction: a professional overnight dispatcher maintaining control while fear increasingly leaks through her cadence. Her final files use a pronounced handheld walkie-talkie treatment: tighter communications bandwidth, stronger dispatch compression/presence, modest transmission grit, and clearly audible but still low-level deterministic radio noise. Her integrated level is reduced from the first neural production pass so she sits more naturally inside the mall soundscape instead of riding above it.

The production renderer explicitly returns dynamic loudness-normalization output to 44.1 kHz before mixing the radio-noise stream. This prevents FFmpeg's internal loudnorm sample-rate change from shortening the finite voice timeline. Every neural Renee/fake-Renee render is also rejected if its final duration is shorter than its downloaded source, so a clipped production line cannot silently ship again.

The radio treatment remains deliberately lighter than the supernatural processing on fake-Renee and distinctly more human than PCAS. Fake-Renee lines begin from the same Crisp neural voice so the imitation is recognizably Renee before receiving more aggressive corruption. Chapter 6 keeps Renee's neural performance in the foreground while a separately rendered counterfeit transmission overlaps it.

Jo Alvarez and Eli Mercer remain distinct local archival-recording voices.

## Runtime and provenance

All game playback uses local OGG files from this directory. There are no runtime cloud TTS calls, browser speech synthesis calls, or remote audio requests.

Renee source performances were generated with AI Voice Generator by Level 2 Labs / AI Doc Maker. Their Terms of Service state that users retain rights to content they generate. Attribution is included here to satisfy the provider's published free-tier commercial-use attribution requirement as a conservative baseline.

- Provider: AI Doc Maker / Level 2 Labs
- Voice tool: AI Voice Generator
- Approved voice: Crisp, Take 1
- Terms: https://www.aidocmaker.com/terms-of-service
- Pricing / attribution note: https://www.aidocmaker.com/pricing
- Development-time source manifest: `story/renee-voice-sources-v27.json`
- Production renderer: `scripts/render-renee-neural-v27.mjs`

