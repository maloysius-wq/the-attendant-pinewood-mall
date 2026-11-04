# Selected Low-Poly Sedan v75 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the malformed cinematic hatchback with the exact selected sedan and usable camera, clock, and exit door.

**Architecture:** Vendor the provided GLB locally, isolate vehicle-specific fit/door control in a small module, update the existing scene/clock/eye while retaining all cinematic dialogue and mall systems. Validate source geometry and visible desktop rendering via GitHub Actions.

**Tech Stack:** Three.js r180, GLTFLoader, Node test runner, Playwright desktop Chromium.

**Spec:** docs/superpowers/specs/2026-11-03-pinewood-sedan-design.md

## Global Constraints
- Never fetch a model from a third-party URL at runtime.
- Preserve all existing audio, timing, phone, keypad, and mall navigation.
- Use scailman's exact CC-BY 4.0 GLB, SHA-256 224db7dfd80b36dccf868f8bc71e221a284df6b8e7dca9986843c382c7722b7e.
- Desktop-only automated QA, no manual WASD.
- Keep one car and one windshield; driver must not sit inside upholstery.

## Review Focus
- Preload errors must hold the opaque cover instead of showing a gray substitute.
- Driver's eye must be behind the wheel and under roof, with usable windshield sightline.
- Clock readout must be in frame and clear of imported trim when Renee mentions the time.
- The driver's door must open outward before the player exits and not detach from the body.
- Audio transition must occur at the physical exit boundary.

### Task 1: Vendor and verify exact vehicle
**Files:** opening/assets/v75/low-poly_sedan_car.glb, opening/assets/v75/manifest.json, LICENSES.md, scripts/test-sedan-v75.mjs.
- [ ] Write an asset+camera regression test that fails on old main.
- [ ] Verify the expected failure.
- [ ] Commit the licensed GLB, metadata, attribution, and physically corrected driver viewpoint.
- [ ] Run the Node regression to green.

### Task 2: Replace scene car and synchronize opening door
**Files:** opening/sedan-v75.js, opening/environment-v37.js, opening/intro-v65.js, opening/scene.js.
- [ ] Write desktop browser assertions for one vehicle, interior visibility, door opening, clock and locality; verify RED.
- [ ] Implement single real-car loader, no invented shell, with FL_Door hinge animation.
- [ ] Verify green Node/browser tests, iterate based on actual diagnostic captures.

### Task 3: Preserve continuity, publish, and verify
**Files:** opening/dashboard-clock-v71.js, opening/camera-v65.js, index.html, review/the-call-v34/index.html, existing desktop regression scripts, DEVELOPMENT_HANDOFF.md.
- [ ] Verify clock/dashboard with imported sedan and retain narration/captions/phone timing.
- [ ] Run full relevant desktop regression suite and local assets audit.
- [ ] Inspect screenshots, merge after all checks pass, and verify GitHub Pages serves new local GLB.
