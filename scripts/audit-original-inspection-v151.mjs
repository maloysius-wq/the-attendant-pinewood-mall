/** V151 read-only original E, first-person raycaster and journal witness. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const parts=['part-01.txt','part-02.txt','part-03.txt','p4-1.txt','p4-2.txt','p4-3.txt','p4-4.txt','p4-5.txt','p5-1.txt','p5-2.txt','p5-3.txt','p5-4.txt','p5-5.txt'];
const original=gunzipSync(Buffer.from(parts.map(p=>readFileSync('bundle2/'+p,'utf8').trim()).join(''),'base64')).toString('utf8');
for(const [label,needle,before,after] of [
 ['update-interaction','updateInteraction(){',120,3700],
 ['interact-action','interact(){',150,5200],
 ['key-down','keydown',350,3600],
 ['death','die(reason){',120,900],
 ['journal','rebuildJournal(){',150,1900],
 ['controls','pointerlockchange',220,1600]
]){
 const ix=original.indexOf(needle);
 assert.ok(ix>=0,'Original '+label+' is missing '+needle);
 console.log('V151_ORIGINAL_'+label+' '+JSON.stringify(original.slice(Math.max(0,ix-before),ix+after)));
}
console.log('V151_ORIGINAL_INTERACTION_AUDIT_PASS');
