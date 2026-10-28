# The Call: opening cinematic v34

This feature is staged on `feature/opening-cinematic-v34` for owner review, not merged into `main`.

## Experience

Click **New Game** on the original Pinewood title menu to start this authored first-person cinematic. It establishes an after-hours field-service call, dispatch check-in with Renee Ward, emergency circuits A/B/C, the empty property, the service entrance, and the work order. It ends inside the public concourse and invokes the existing **New Game** action, preserving all six chapters and the normal Chapter 1 gameplay startup. The first supernatural announcements and Contractor Fourteen reveal remain in gameplay, rather than being spoiled in the introduction.

The visual set was made from original local Three.js geometry: a modeled contractor car with hollow cabin and windshield, rain and floodlit parking lot, the abandoned Pinewood storefront facade, a swinging service door, numeric access keypad, planters and bollards, printed authorization/entry notices physically mounted at the door, a dynamic 3D work-phone screen drawn with CanvasTexture, a tiled concourse with shuttered shops, dry fountain, and readable wall-mounted service directory. The only library used is the existing repository-local Three.js module.

## Audio

Eleven matching Crisp-style Renee recordings, locally mastered into OGG, are stored in `opening/audio/`; `opening/audio/manifest.json` documents duration and SHA-256. Source MP3 URLs in `opening/voice-sources-v34.json` are *development-only*. There are **no remote runtime audio requests**, no runtime synthesis, and no browser speechSynthesis. Ambient sound and music design intentionally comes after owner review.

## Accessibility and safety

Pause, Skip intro, Voice on/off, Captions on/off, Escape to pause, Alt+S to skip, and reduced-motion camera behavior. The dialogue has a subtitle-only fallback if an audio clip does not load. Continue/Chapter Select/restarts are not intercepted. An early Skip retries the native New Game handoff if the legacy game loader is still assembling. The entire intro runs as a separately disposable module; it does not edit the compressed original game bundle or change saved-game flags.

## Owner review

Review the five cinematic camera frames under the **Pinewood cinematic v34 browser preview** GitHub Actions job's `pinewood-v34-opening-review-frames` artifact. The screenshots show the parking arrival, actual 3D phone and matching readable work-ticket overlay, service-entrance approach, wall-mounted keypad/papers, and interior concourse. The browser test also checks that clicking New Game opens the cinematic and Skip returns to the existing game. The final audio is playable from the branch's local `opening/audio/*.ogg` files.

To preview the branch locally, check out this branch, start `python3 -m http.server 8765` from the repo root and open `http://127.0.0.1:8765/?openingPreview=1`. This launches the cinematic without mutating saves or automatically starting Chapter 1. The normal URL without that query runs the original title screen, with the cinematic attached to New Game.

Run the dedicated regression via `node scripts/smoke-opening-v34.mjs` after installing pinned Playwright and Chromium, or inspect `.github/workflows/opening-v34-preview.yml`. The v34 audio production source is `scripts/vendor-opening-voices-v34.mjs`.
