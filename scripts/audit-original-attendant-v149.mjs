/** Exact original Attendant finite-state source audit, no patches or runtime mutation. */
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const names=['part-01.txt','part-02.txt','part-03.txt',
 'p4-1.txt','p4-2.txt','p4-3.txt','p4-4.txt','p4-5.txt',
 'p5-1.txt','p5-2.txt','p5-3.txt','p5-4.txt','p5-5.txt'];
const s=gunzipSync(Buffer.from(names.map(n=>readFileSync('bundle2/'+n,'utf8').trim()).join(''),'base64')).toString('utf8');
const a=s.indexOf('class Attendant');
if(a<0)throw Error('Source Attendant missing');
const end=s.indexOf('\nclass ',a+20);
const component=s.slice(a,Math.min(end<0?s.length:end,a+35000));
for(const needle of ['constructor(','reset(){','awaken(','hear(','canSee(','setPath(','update(dt,t,playerPos,fear){']){
 const i=component.indexOf(needle);
 if(i<0)throw Error('Attendant '+needle+' missing');
 const short=component.slice(Math.max(0,i-240),Math.min(component.length,i+needle.length+12000));
 console.log('V149_ORIGINAL_'+needle.replace(/[^a-z]/ig,'_')+' '+JSON.stringify(short));
}
console.log('V149_ORIGINAL_ATTENDANT_AUDIT_PASS '+JSON.stringify({begin:a,sourceLength:s.length,attendantLength:component.length}));
