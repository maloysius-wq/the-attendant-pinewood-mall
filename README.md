# THE ATTENDANT: PINEWOOD MALL — Rebuilt Edition

A ground-up reboot of **The Attendant: Pinewood Mall**, rebuilt from the earlier `Game2.html` prototype with authored mall floorplans, distinct stores, revised enemy AI, hiding/decoy systems, story progression, improved visuals, and verified CC0 art sources.

## Play online

This repository is designed to run directly on **GitHub Pages**. Once Pages is enabled for the `main` branch and `/(root)` folder, the game will launch from the repository's Pages URL.

## Run locally

Because the game uses ES modules and network-loaded CC0 assets, run it through a small local web server rather than opening `index.html` with `file://`.

### Windows
Double-click `start_game.bat`.

### macOS / Linux
Open a terminal in this folder and run:

```bash
python3 -m http.server 8765
```

Then open `http://localhost:8765`.

## Controls

- WASD — move
- Mouse — look
- Shift — sprint
- C — hold breath / quieter movement
- E — interact
- F — flashlight
- Q — throw decoy
- J — journal
- Esc — pause

## What was rebuilt

- New authored mall floorplans. Stores are rooms from the beginning, not runtime holes cut into the maze.
- Separate walkability/nav grid, prop collision, and visual geometry.
- Three chapters with a revised story arc and alternate ending for recovering all nine Last Shift logs.
- New Attendant finite-state AI: stalking, investigating, hunting, searching, decoy diversion, stun, line-of-sight and path-distance hearing.
- True route-distance danger effects, so a wall between you and The Attendant actually matters.
- Animated black fuzzy/glitch humanoid Attendant with natural gait and white emissive eyes.
- Proper cabinet hiding sequence: doors open, camera enters, doors close, peek crack appears; menus always render above the crack.
- Store-specific layouts: Sunburst Arcade, Video Planet, Pinewood Food Court, Cassette Castle.
- Real collision on shelves, counters, arcade machines, tables, chairs, cabinets and major props.
- PBR floor/wall materials from verified CC0 Poly Haven assets, with generated fallbacks.
- Verified CC0 Kenney GLB assets for arcade/furniture/retail/food dressing, with generated fallbacks.
- Revised procedural audio: mall hum, louder configurable muzak, footsteps, heartbeat, directional whispers, radio, PA and danger tones.
- Full pause of gameplay and audio in menus.
- Save data, chapter unlocks, journal, settings, credits/license manifest.

## Network use

The project currently loads pinned CC0 model mirrors and Poly Haven CC0 textures at runtime. If a model or texture fails to load, the game falls back to built-in procedural art and remains playable.

See `LICENSES.md` for exact provenance and `DESIGN_AUDIT.md` / `AUDIT_RESULTS.txt` for the rebuild audit.
