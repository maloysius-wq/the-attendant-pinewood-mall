import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const fail=msg=>{throw new Error('Chapter 6 finale patch-source audit failed: '+msg);};
const path='patches/chapter6-last-shift-v25.js.txt';
const source=await readFile(path,'utf8');

if(source.includes("`CONTRACTOR FOURTEEN. REPORT TO ${route.label}. CLOSING CHECKLIST INCOMPLETE.`"))fail('nested final-recall template literal can terminate the outer v25 patch template');
for(const literalBreak of [
  'white eyes extinguish.\n\nOutside, Renee’s real voice returns clearly.',
  'Attendant stops moving.\n\nOutside, Renee’s real voice returns and confirms'
])if(source.includes(literalBreak))fail('ending copy contains a literal paragraph break inside generated-runtime single quotes');
for(const escapedBreak of [
  'white eyes extinguish.\\\\n\\\\nOutside, Renee’s real voice returns clearly.',
  'Attendant stops moving.\\\\n\\\\nOutside, Renee’s real voice returns and confirms'
])if(!source.includes(escapedBreak))fail('ending copy is missing the required escaped generated-runtime paragraph break');
if(!source.includes("'CONTRACTOR FOURTEEN. REPORT TO '+route.label+'. CLOSING CHECKLIST INCOMPLETE.'"))fail('final recall must use patch-safe concatenation for its dynamic destination');

const dir=await mkdtemp(join(tmpdir(),'pinewood-v25-patch-')),file=join(dir,'chapter6-last-shift-v25.mjs');
try{
  await writeFile(file,source);
  const parsed=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(parsed.status!==0){process.stderr.write(parsed.stderr||'');fail('v25 patch source is not valid JavaScript');}
}finally{await rm(dir,{recursive:true,force:true});}

console.log('Chapter 6 finale patch-source PASS: nested strings and generated-runtime paragraph escapes are patch-safe.');
