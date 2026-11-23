/** V148 scoped immutable original restart and UI binding source witness.
 * No source mutation. Only the existing compressed original runtime is read.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const parts=['part-01.txt','part-02.txt','part-03.txt','p4-1.txt','p4-2.txt','p4-3.txt','p4-4.txt','p4-5.txt','p5-1.txt','p5-2.txt','p5-3.txt','p5-4.txt','p5-5.txt'];
const original=gunzipSync(Buffer.from(parts.map(p=>readFileSync('bundle2/'+p,'utf8').trim()).join(''),'base64')).toString('utf8');
const needles=[
 ['Game.resetState', '  resetState(){',220,1600],
 ['Game.startChapter','  async startChapter(idx){',220,5600],
 ['deathRestartBtn binding','deathRestartBtn',1100,2600],
 ['chapterStartBtn binding','chapterStartBtn',1000,2400],
 ['new Game constructor','new Game()',500,900],
 ['Game.startChapter usage','.startChapter(',500,1000],
 ['Game die','  die(reason){',120,1250],
 ['Game win','  winChapter(){',120,950]
];
for(const [label,spec,before,after] of needles){
 const ix=original.indexOf(spec);
 assert.notEqual(ix,-1,'source signature missing: '+label);
 if(process.env.V148_PRINT_ORIGINAL==='1')
  console.log('V148_SOURCE '+label+' '+JSON.stringify(original.slice(Math.max(0,ix-before),ix+after)));
 else console.log('V148_SOURCE_FOUND '+label+' '+ix);
}
console.log('V148_ORIGINAL_RESTART_AUDIT_PASS');
