import { readFile, writeFile } from 'node:fs/promises';
const path='scripts/audit-retail-geometry-v16.mjs';
let text=await readFile(path,'utf8');
const replacements=[
  ["const arcade=section(source,'async function buildArcade(world){','\\nasync function buildVideo','Arcade');","const arcade=section(source,'async function buildArcade(world){','\\nasync function buildVHS(world){','Arcade');"],
  ["const video=section(source,'async function buildVideo','\\nasync function buildFoodCourt','Video Planet');","const video=section(source,'async function buildVHS(world){','\\nasync function buildFoodCourt(world){','Video Planet');"],
  ["const checkout=section(source,'async function buildCassetteCheckoutV14(world){','\\n\\nasync function buildArcade(world){','Cassette checkout');","const checkout=section(source,'async function buildCassetteCheckoutV14(world){','\\nasync function makeSharedRetailCheckoutV16(','Cassette checkout');"]
];
for(const [old,replacement] of replacements){if(!text.includes(old))throw new Error('Expected v16 audit boundary missing: '+old);text=text.replace(old,replacement);}
await writeFile(path,text);
console.log('Retail Geometry v16 audit boundaries corrected for buildVHS and the shared checkout helper.');
