/** V142 original Chapter 1 physical key, LS evidence and freight path survey. Read-only. */
import {buildGameplayLayoutV70,shortestRouteV70,chapterRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
const L=buildGameplayLayoutV70({chapter:1}),L2=buildGameplayLayoutV70({chapter:2});
const places=[
 {id:'entry',at:L.spawn},
 {id:'Master Service Key',at:storyTargetV70({chapter:1,type:'key',label:'Master Service Key'})},
 ...['A','B','C'].map(id=>({id:'breaker:'+id,at:storyTargetV70({chapter:1,type:'breaker',id})})),
 ...['LS-01','LS-02','LS-03'].map(id=>({id,at:storyTargetV70({chapter:1,type:'note',label:id})})),
 {id:'freight_call',at:storyTargetV70({chapter:1,type:'exit'})},
 {id:'freight_board_17.9',at:{x:17.9,z:-113}},
 {id:'freight_board_18.2',at:{x:18.2,z:-113}},
 {id:'freight_board_18.45',at:{x:18.45,z:-113}},
 {id:'freight_board_18.7',at:{x:18.7,z:-113}},
 {id:'freight_board_19',at:{x:19,z:-113}}
];
const checks=[];
for(const p of places){
 const nearby=L.colliders.filter(c=>p.at.x>=c.minX-.9&&p.at.x<=c.maxX+.9&&p.at.z>=c.minZ-.9&&p.at.z<=c.maxZ+.9).map(c=>({id:c.id,kind:c.kind,physical:c.physicalBlock,box:[c.minX,c.maxX,c.minZ,c.maxZ]}));
 checks.push({name:p.id,x:p.at.x,z:p.at.z,room:L.roomAt(p.at.x,p.at.z),
  stand:L.canStand(p.at.x,p.at.z),
  fromEntry:shortestRouteV70(L,L.spawn,p.at).length,
  fromKey:shortestRouteV70(L,places[1].at,p.at).length,nearby:nearby.slice(0,10)});
}
for(const p of checks)console.log('V142_ROUTE '+JSON.stringify(p));
console.log('V142_STORY '+JSON.stringify(FURNISHINGS_V69.storyAnchors.filter(x=>['LS-01','LS-02','LS-03'].includes(x.id))));
console.log('V142_B1 '+JSON.stringify({spawn:chapterRouteV70(2),canStand:L2.canStand(L2.spawn.x,L2.spawn.z),
  at:B1_CAN_STAND()}));
function B1_CAN_STAND(){return [{x:23,z:-110},{x:22,z:-111},{x:23,z:-109},{x:21,z:-110}].map(p=>({...p,room:L2.roomAt(p.x,p.z),canStand:L2.canStand(p.x,p.z)}));}

import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const files=['part-01.txt','part-02.txt','part-03.txt','p4-1.txt','p4-2.txt','p4-3.txt','p4-4.txt','p4-5.txt','p5-1.txt','p5-2.txt','p5-3.txt','p5-4.txt','p5-5.txt'];
const lines=gunzipSync(Buffer.from(files.map(f=>readFileSync('bundle2/'+f,'utf8').trim()).join(''),'base64')).toString().split('\n');
for(let i=440;i<=473;i++)console.log('ORIGINAL_SRC_L'+i+' '+lines[i-1]);
