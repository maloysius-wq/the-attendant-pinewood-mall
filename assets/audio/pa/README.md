# Pinewood PCAS Voice Assets

These are pre-rendered, repository-local voice lines for the Pinewood Closing and Accountability System (PCAS). Runtime playback never calls a cloud TTS service or the browser speech-synthesis API.

Source text: `story/pa-lines.json`  
Generator: `scripts/generate-pcas-voice.mjs`  
TTS: eSpeak NG, used only at build time  
Processing: FFmpeg band-limited ceiling-speaker chain with compression, detuned doubles, light bit reduction, electrical flutter, slapback echo, EQ and loudness normalization.

The authored spoken text and resulting Pinewood-specific processed voice assets are part of the game content. eSpeak NG and FFmpeg are not shipped as runtime dependencies.
