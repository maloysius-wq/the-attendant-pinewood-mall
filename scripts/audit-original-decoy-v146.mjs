/** Maintainable source witness for the immutable original decoy/Attendant contract.
 * Run with V146_PRINT_ORIGINAL=1 for bounded excerpts in private CI logs.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const parts=['part-01.txt','part-02.txt','part-03.txt',
 'p4-1.txt','p4-2.txt','p4-3.txt','p4-4.txt','p4-5.txt',
 'p5-1.txt','p5-2.txt','p5-3.txt','p5-4.txt','p5-5.txt'];
const payload=parts.map(f=>readFileSync('bundle2/'+f,'utf8').trim()).join('');
const src=gunzipSync(Buffer.from(payload,'base64')).toString('utf8');
const methods=[
 ['original class Attendant',src.indexOf('class Attendant')],
 ['original Attendant.hear',src.indexOf('hear(pos')],
 ['original Attendant.setPath',src.indexOf('setPath(target')],
 ['original Game.throwDecoy',src.indexOf('throwDecoy()')],
 ['original game decoy landing',src.indexOf('decoyUntil')],
 ['original game decoy object',src.indexOf('decoyObjs')],
];
for(const [name,i] of methods){
 assert.ok(i>=0,name+' missing from immutable original');
 const content=src.slice(Math.max(0,i-220),Math.min(src.length,i+2000));
 if(process.env.V146_PRINT_ORIGINAL==='1')console.log('V146_ORIGINAL '+name+' '+JSON.stringify(content));
}
console.log('V146_ORIGINAL_SOURCE_WITNESS '+JSON.stringify(methods.map(([name,i])=>({name,offset:i}))));
