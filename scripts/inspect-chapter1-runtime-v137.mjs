/** V137 original source inspection (read-only, no runtime changes).
 * Unpack the canonical deployed legacy source before the versioned patches,
 * and show the actual Game objective/key/exit/update hooks.
 */
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const names=[
 'bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt',
 'bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt',
 'bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'
];
const input=names.map(n=>readFileSync(n,'utf8').trim()).join('');
const source=gunzipSync(Buffer.from(input,'base64')).toString('utf8');
const lines=source.split('\n');
const expressions=[
 /class Game/,/constructor\(\)/,/updateHUD\(/,/updateHud\(/,/updateObjective\(/,/objectiveText/,
 /this\.hasKey/,/this\.key/,/this\.serviceKey/,/this\.breakers/,
 /Master Service Key/,/Service Key/,/Freight Elevator/,/freight elevator/,
 /async startChapter/,/beginPlay\(/,/onInteract/,/interact\(/,
 /update\(dt\)/,/updateUI\(/,/this\.running/
];
const findings=[];
for(const pattern of expressions){
 const indexes=lines.flatMap((l,i)=>pattern.test(l)?[i]:[]);
 findings.push({pattern:String(pattern),occurrences:indexes.length,examples:indexes.slice(0,6).map(i=>({
  line:i+1,text:lines[i].slice(0,1350)
 }))});
}
console.log(JSON.stringify({sourceLines:lines.length,findings},null,2));
