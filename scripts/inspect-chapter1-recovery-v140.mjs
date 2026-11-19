/* Read-only V140 inspection of original compressed Game/Attendant and player recovery. */
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const parts=['part-01.txt','part-02.txt','part-03.txt','p4-1.txt','p4-2.txt','p4-3.txt','p4-4.txt','p4-5.txt','p5-1.txt','p5-2.txt','p5-3.txt','p5-4.txt','p5-5.txt'];
const raw=gunzipSync(Buffer.from(parts.map(p=>readFileSync('bundle2/'+p,'utf8').trim()).join(''),'base64')).toString('utf8');
const ls=raw.split('\n');
const ranges=[[513,549],[550,583],[626,654],[655,700]];
for(const [start,end] of ranges){
 console.log('\n### ORIGINAL SOURCE '+start+'..'+end);
 for(let i=start;i<=Math.min(end,ls.length);i++)
  console.log('SOURCE L'+i+' '+ls[i-1].slice(0,10000));
}
for(const needle of ['die(reason','die(', 'restart()', 'beginPlay()', 'playerHidden','breathHeld', 'KeyC', 'key ===','key===','crouch','onKeyDown','controls.lock','UI.hint','HUD','update(dt)','stepTravel']){
 const m=[];for(let i=0;i<ls.length;i++)if(ls[i].includes(needle))m.push(i+1);
 console.log('\nMATCH '+needle+' '+m.join(','));
}
console.log('SOURCE_BYTES '+raw.length+' SOURCE_LINES '+ls.length);
