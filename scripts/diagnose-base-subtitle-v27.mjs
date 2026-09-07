import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import path from 'node:path';

const root=process.cwd();
const parts=[
  'bundle2/part-01.txt','bundle2/part-02.txt','bundle2/part-03.txt',
  'bundle2/p4-1.txt','bundle2/p4-2.txt','bundle2/p4-3.txt','bundle2/p4-4.txt','bundle2/p4-5.txt',
  'bundle2/p5-1.txt','bundle2/p5-2.txt','bundle2/p5-3.txt','bundle2/p5-4.txt','bundle2/p5-5.txt'
];
const payload=(await Promise.all(parts.map(p=>readFile(path.join(root,p),'utf8')))).map(s=>s.trim()).join('');
const source=gunzipSync(Buffer.from(payload,'base64')).toString('utf8');

function snippetsFor(label,needle,limit=12,radius=1100){
  console.log(`\n===== ${label} =====`);
  let from=0,count=0;
  while(count<limit){
    const i=source.indexOf(needle,from);if(i<0)break;
    console.log(`\n--- occurrence ${count+1} @ ${i} ---\n${source.slice(Math.max(0,i-radius),Math.min(source.length,i+radius))}`);
    from=i+needle.length;count++;
  }
  if(!count)console.log('NO MATCH');
}

snippetsFor('subtitle(', 'subtitle(', 10, 1400);
snippetsFor('subtitle element', "getElementById('subtitle", 10, 1000);
snippetsFor('setPaused(', 'setPaused(', 20, 700);
snippetsFor('.stop(', '.stop(', 30, 500);
snippetsFor('AudioContext suspend', '.suspend(', 20, 500);
