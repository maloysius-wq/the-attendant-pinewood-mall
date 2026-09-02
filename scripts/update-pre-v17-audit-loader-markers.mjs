import {readFile,writeFile} from 'node:fs/promises';

const files=[
  'scripts/audit-cassette-castle-v13.mjs',
  'scripts/audit-cassette-castle-v14.mjs',
  'scripts/audit-local-assets-v15.mjs',
  'scripts/audit-retail-geometry-v16.mjs'
];
for(const path of files){
  let text=await readFile(path,'utf8');
  const old="'const source=retailV16Source+'";
  const next="'const source=storyV17Source+'";
  if(text.includes(old))text=text.replace(old,next);
  if(!text.includes(next))throw new Error(`${path}: final loader marker could not be updated to v17`);
  await writeFile(path,text,'utf8');
}
console.log('Pre-v17 protected audits now accept Story Foundation v17 as the final loader layer.');
