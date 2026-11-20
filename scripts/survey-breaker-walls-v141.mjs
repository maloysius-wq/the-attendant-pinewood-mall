/** Read-only survey of real Chapter 1 source breaker meshes, site masonry and approach cells. */
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {buildGameplayLayoutV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';
const chunks=['part-01.txt','part-02.txt','part-03.txt','p4-1.txt','p4-2.txt','p4-3.txt','p4-4.txt','p4-5.txt','p5-1.txt','p5-2.txt','p5-3.txt','p5-4.txt','p5-5.txt'];
const raw=gunzipSync(Buffer.from(chunks.map(x=>readFileSync('bundle2/'+x,'utf8').trim()).join(''),'base64')).toString();
const lines=raw.split('\n');
for(let i=0;i<lines.length;i++)if(/makeBreaker\(|function makeBreaker|userData\.type==='breaker'|type:'breaker'|type:"breaker"/.test(lines[i])){
 console.log('SOURCE_MATCH '+JSON.stringify({line:i+1,before:lines.slice(Math.max(0,i-3),i),lineText:lines[i],after:lines.slice(i+1,i+4)}));
}
const L=buildGameplayLayoutV70({chapter:1}),walls=L.shell.walls;
for(const id of ['A','B','C']){
 const p=storyTargetV70({chapter:1,type:'breaker',id});
 console.log('BREAKER_CURRENT '+JSON.stringify({id,point:p,stand:L.canStand(p.x,p.z),route:shortestRouteV70(L,L.spawn,p).length}));
 const nearby=walls.flatMap(w=>{
  if(w.bottom>.2||w.top<2.1||w.role?.includes('header')||w.role?.includes('lintel'))return [];
  const u=w.axis==='x'?p.z:p.x,distAlong=Math.max(w.start-u,0,u-w.end),delta=Math.abs((w.axis==='x'?p.x:p.z)-w.at);
  const dist=Math.hypot(distAlong,delta);
  if(dist>18)return [];
  const mx=w.axis==='x'?w.at:Math.max(w.start,Math.min(w.end,p.x));
  const mz=w.axis==='z'?w.at:Math.max(w.start,Math.min(w.end,p.z));
  return [{id:w.id,axis:w.axis,at:w.at,span:[w.start,w.end],role:w.role,thickness:w.thickness,dist:+dist.toFixed(2),near:[mx,mz]}]
 }).sort((a,b)=>a.dist-b.dist).slice(0,35);
 console.log('NEAR_WALLS_'+id+' '+JSON.stringify(nearby));
}
for(const room of ['west_gallery','east_gallery','north_service','freight_lobby','central_gallery']){
 const R=L.rooms.find(x=>x.id===room);console.log('ROOM '+JSON.stringify({room,rect:[R.x1,R.x2,R.z1,R.z2]}));
}
for(const w of walls.filter(w=>w.bottom<.2&&w.top>2.1&&(w.at===-29||w.at===29||w.at===-112||w.at===-118||w.at===-110||w.at===-11||w.at===11))){
 if(w.axis==='x'&&Math.abs(w.at)===29&&w.end<-40||w.axis==='z'&&w.at<=-110&&w.start<32)
  console.log('CANDIDATE_WALL '+JSON.stringify({id:w.id,axis:w.axis,at:w.at,start:w.start,end:w.end,role:w.role,thickness:w.thickness}));
}

console.log('SOURCE_INTERACTION');
for(let i=585;i<=625;i++)console.log('SOURCE L'+i+' '+(lines[i-1]||''));
const proposed=[
 {id:'A',room:'central_gallery',wall:'north_service_z_-112_1.85',panel:{x:7,z:-111.802},stand:{x:7,z:-110.4}},
 {id:'B',room:'west_gallery',wall:'v116_west_rear_receiving_closed-bay-partition_x_-29_-118.00',panel:{x:-28.797,z:-109},stand:{x:-27.45,z:-109}},
 {id:'C',room:'freight_lobby',wall:'freight_lobby_z_-110_11',panel:{x:12.5,z:-110.198},stand:{x:12.5,z:-111.55}}
];
for(const p of proposed){
 const w=walls.find(x=>x.id===p.wall);
 const obstacles=L.colliders.filter(c=>p.stand.x>c.minX-.5&&p.stand.x<c.maxX+.5&&p.stand.z>c.minZ-.5&&p.stand.z<c.maxZ+.5).map(x=>x.id);
 console.log('PROPOSED '+JSON.stringify({id:p.id,room:p.room,wall:w,wallFound:!!w,stand:p.stand,
  standClear:L.canStand(p.stand.x,p.stand.z),roomAt:L.roomAt(p.stand.x,p.stand.z),
  fromSpawn:shortestRouteV70(L,L.spawn,p.stand).length,
  fromServiceKey:shortestRouteV70(L,{x:6,z:-81},p.stand).length,
  freight:shortestRouteV70(L,p.stand,{x:17,z:-113}).length,closeColliders:obstacles.slice(0,8)}));
}
