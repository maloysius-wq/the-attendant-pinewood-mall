import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function insertBefore(text,marker,addition,label){
  const i=text.indexOf(marker);
  if(i<0)throw new Error(`${label}: marker missing`);
  return text.slice(0,i)+addition+text.slice(i);
}

// Normalize dependency metadata so every manifest "local" field is itself repository-relative.
const manifestPath='assets/vendor/runtime/manifest.json';
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
for(const entry of Object.values(manifest.assets||{})){
  if(!entry?.local)continue;
  const parent=path.posix.dirname(entry.local.replace(/^\.\//,''));
  for(const dep of entry.dependencies||[]){
    const uri=decodeURIComponent(String(dep.uri||'').split('#')[0].split('?')[0]).replace(/\\/g,'/');
    dep.local='./'+path.posix.normalize(path.posix.join(parent,uri));
  }
}
manifest.policy='All runtime media and browser libraries are served from this repository. External URLs in this manifest are provenance/development-time vendoring inputs only and are never browser runtime targets.';
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n','utf8');

// DEVELOPMENT_HANDOFF.md: permanent rule near the top, plus v15 architecture/audit notes.
const handoffPath='DEVELOPMENT_HANDOFF.md';
let handoff=await readFile(handoffPath,'utf8');
if(!handoff.includes('## Permanent local-runtime-asset rule')){
  const marker='\n---\n\n## 1. Game direction';
  const section=`\n## Permanent local-runtime-asset rule\n\n**NEVER use remote assets or remote browser libraries at runtime. ALWAYS download/vendor verified dependencies into this repository and serve them locally.** This is a permanent no-regression rule.\n\n- Models, GLTF/GLB buffers and model textures must be repository-local before use.\n- PBR/material textures, images and decals must be repository-local before use.\n- Sound effects, ambience and music must be repository-local before use.\n- Three.js, Pako and any future browser/runtime library must be pinned and served from this repository rather than a CDN.\n- External URLs are allowed only for provenance/documentation or development-time vendoring. They must never be browser fetch/load targets in the shipped game.\n- New third-party assets require verified licensing, a local vendored copy, source/pin/hash provenance, and an updated local-assets audit.\n- If an asset cannot be legally verified and vendored, omit it or choose another verified asset. Do not create a remote-runtime exception.\n- Do not restore the historical strategy of GitHub Raw/Poly Haven/OpenGameArt/CDN runtime URLs plus fallbacks.\n\n`;
  handoff=handoff.replace(marker,section+marker);
}
if(!handoff.includes('`patches/local-assets-v15.js.txt`')){
  const v14Line='17. `patches/cassette-castle-rebuild-v14.js.txt` (**final authoritative Cassette Castle layout/finish override**)';
  if(!handoff.includes(v14Line))throw new Error('handoff v14 architecture marker missing');
  handoff=handoff.replace(v14Line,v14Line+'\n18. `patches/local-assets-v15.js.txt` (**final runtime asset localization layer; all media resolves to repository-local vendored files**)');
}
if(!handoff.includes('### Local runtime assets — authoritative v15')){
  const marker='\n## 17. Development workflow';
  const section=`\n### Local runtime assets — authoritative v15\n\n`+
    '`patches/local-assets-v15.js.txt` runs after Cassette Castle v14 and rewrites the final assembled runtime to repository-local vendored media. `assets/vendor/runtime/manifest.json` is the authoritative source-to-local map and includes SHA-256 provenance. The migration currently vendors **59 top-level runtime media assets plus 30 dependent GLTF/model files**.\n\n'+
    'Three.js **0.180.0** is served from `vendor/three/`; Pako **2.1.0** is served from `vendor/pako/`. The deployed import map and decompression fallback do not use unpkg or jsDelivr. Music that was formerly fetched from OpenGameArt is also served from the repository.\n\n'+
    '`scripts/audit-local-assets-v15.mjs` hash-verifies the vendored asset graph, verifies local Three.js/Pako files, reconstructs the complete runtime through v15, rejects surviving external media URLs, and syntax-checks the final localized module. A runtime change is not complete unless this audit passes.\n\n'+
    'The source/provenance URLs retained in `LICENSES.md`, the vendoring script, and the manifest are documentation/development-time inputs only. They are not runtime dependencies.\n\n';
  handoff=insertBefore(handoff,marker,section,'handoff local v15 section');
}
if(handoff.includes('Current CI coverage includes')&&!handoff.includes('The v15 local-assets audit additionally')){
  const marker='\n\n---\n\n## 18. Fresh-session restart prompt';
  const note='\n\nThe v15 local-assets audit additionally guarantees that the assembled runtime does not load models, textures, music, or browser libraries from third-party hosts and that the vendored files match their recorded hashes.';
  if(handoff.includes(marker))handoff=handoff.replace(marker,note+marker);
}
const oldRestart='Never reintroduce the permanently banned Quaternius Shelf Large/Shelf Small resources.';
const newRestart='Never reintroduce the permanently banned Quaternius Shelf Large/Shelf Small resources. **Never use remote runtime assets or CDN browser libraries: always verify, download/vendor, document, and serve them locally from this repository.**';
if(handoff.includes(oldRestart)&&!handoff.includes('Never use remote runtime assets or CDN browser libraries'))handoff=handoff.replace(oldRestart,newRestart);
await writeFile(handoffPath,handoff,'utf8');

// LICENSES.md: make clear that source links are provenance, while shipped files are local.
const licensesPath='LICENSES.md';
let licenses=await readFile(licensesPath,'utf8');
if(!licenses.includes('## Runtime storage policy — authoritative v15')){
  const marker='\n## Kenney — Mini Arcade';
  const section=`\n## Runtime storage policy — authoritative v15\n- **No third-party asset or browser library is loaded from an external host during play.** All runtime models, model dependencies, PBR textures, decals/images, sound effects, ambience, music, Three.js and Pako are served from this repository.\n- `assets/vendor/runtime/manifest.json` records the original provenance URL, the development-time fetch source when a stale source required a verified mirror, the repository-local runtime path, byte count, SHA-256 digest, and dependent GLTF/model files.\n- The v15 migration currently contains **59 top-level runtime media assets plus 30 dependent files** discovered from the assembled v14 runtime.\n- External links elsewhere in this document are provenance/source references only. They are not browser runtime fetch targets.\n- The development-only vendoring pipeline is `scripts/vendor-runtime-assets.mjs`; `patches/local-assets-v15.js.txt` maps the final assembled browser runtime to the pinned local copies; `scripts/audit-local-assets-v15.mjs` enforces the no-remote-runtime rule and verifies hashes.\n- Historical stale runtime mirrors were repaired during vendoring with verified pinned equivalents, including Kenney Factory Kit from `levinzonr/godot-asset-placer` commit `1dbf9fd782566780d6a6c52bd4197f448622f0aa`, Kenney Prototype Kit from `RetroDECK/RetroQUEST` commit `dfa19a5602a31f64bd890d15279a61f43b127328`, a Poly Haven CC0 Book copy from `mgaralc/portfolio` commit `6a9da7106a598bb3962acea0c1158195c75a1fdb`, and the complete Poly Haven Cassette Player package from `QueenOfSquiggles/squiggle-pt` commit `deabff55b5df0b8989e58400bdf05de1c8e1eae1`.\n\n`;
  licenses=insertBefore(licenses,marker,section,'licenses storage policy');
}
licenses=licenses.replace('- Runtime version pinned to 0.180.0.','- Runtime version pinned to 0.180.0.\n- Served locally from `vendor/three/`; the deployed game does not load Three.js from unpkg or jsDelivr.');
if(!licenses.includes('## Pako')){
  const marker='\n## CC0 sound effects and ambience';
  const section='\n## Pako\n- https://github.com/nodeca/pako\n- MIT License.\n- Runtime version pinned to 2.1.0 and served locally from `vendor/pako/pako.esm.mjs`; jsDelivr is not a runtime dependency.\n\n';
  licenses=insertBefore(licenses,marker,section,'licenses Pako section');
}
licenses=licenses.replace('- Runtime GLTF: `https://dl.polyhaven.org/file/ph-assets/Models/gltf/2k/cassette_player/cassette_player_2k.gltf`','- Original Poly Haven GLTF URL (provenance only): `https://dl.polyhaven.org/file/ph-assets/Models/gltf/2k/cassette_player/cassette_player_2k.gltf`');
licenses=licenses.replace('- Runtime loop: `https://opengameart.org/sites/default/files/furniture_shop_loop.ogg`','- Original source-file URL (provenance only; the runtime copy is vendored locally): `https://opengameart.org/sites/default/files/furniture_shop_loop.ogg`');
licenses=licenses.replace('- Runtime loop: `https://lpc.opengameart.org/sites/default/files/Insistent.ogg`','- Original source-file URL (provenance only; the runtime copy is vendored locally): `https://lpc.opengameart.org/sites/default/files/Insistent.ogg`');
await writeFile(licensesPath,licenses,'utf8');

console.log('Local Assets v15 manifest metadata and documentation finalized.');
