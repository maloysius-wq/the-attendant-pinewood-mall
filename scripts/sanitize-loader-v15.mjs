import { readFile, writeFile } from 'node:fs/promises';

const path='game.js';
let source=await readFile(path,'utf8');
const start=source.indexOf('function normalizeImports(source){');
const end=source.indexOf('\n}\n\nasync function applyWorldProps(',start);
if(start<0||end<0)throw new Error('normalizeImports markers missing');
const replacement=`function normalizeImports(source){\n  return source\n    .replace(/import \\{ GLTFLoader \\} from ['\"][^'\"]*\\/GLTFLoader\\.js['\"];?/,'import { GLTFLoader } from \'three/addons/loaders/GLTFLoader.js\';')\n    .replace(/import \\{ EffectComposer \\} from ['\"][^'\"]*\\/EffectComposer\\.js['\"];?/,'import { EffectComposer } from \'three/addons/postprocessing/EffectComposer.js\';')\n    .replace(/import \\{ RenderPass \\} from ['\"][^'\"]*\\/RenderPass\\.js['\"];?/,'import { RenderPass } from \'three/addons/postprocessing/RenderPass.js\';')\n    .replace(/import \\{ UnrealBloomPass \\} from ['\"][^'\"]*\\/UnrealBloomPass\\.js['\"];?/,'import { UnrealBloomPass } from \'three/addons/postprocessing/UnrealBloomPass.js\';');\n`;
source=source.slice(0,start)+replacement+source.slice(end);
for(const forbidden of ['unpkg.com/three@','cdn.jsdelivr.net/npm/three@','cdn.jsdelivr.net/npm/pako@'])if(source.includes(forbidden))throw new Error('remote browser-library literal survived: '+forbidden);
await writeFile(path,source,'utf8');
console.log('Deployed loader contains no remote Three.js/Pako CDN literal.');
