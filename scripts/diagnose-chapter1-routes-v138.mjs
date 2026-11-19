import {buildGameplayLayoutV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';
const layout=buildGameplayLayoutV70({chapter:1});
const names=['breaker:A','breaker:B','breaker:C','exit'],target=Object.fromEntries(names.map(name=>{
 const [type,id]=name.split(':');return [name,storyTargetV70({chapter:1,type,id})]
}));
const candidates=[];
for(let x=1;x<=10;x++)for(let z=-91;z<=-73;z++){
 if(!layout.canStand(x,z))continue;
 candidates.push({x,z,score:Math.hypot(x-6,z+83)});
}
candidates.sort((a,b)=>a.score-b.score);
const near=candidates.slice(0,45).map(pt=>{
 const routes=Object.fromEntries(names.map(k=>[k,shortestRouteV70(layout,pt,target[k]).length]));
 return {...pt,routes,fullyConnected:Object.values(routes).every(n=>n>0)};
});
console.log('V138_KEY_CANDIDATES '+JSON.stringify(near,null,2));
console.log('V138_ORIGINAL_KEY '+JSON.stringify({at:{x:6,z:-83},
 blockers:layout.colliders.filter(c=>6>c.minX&&6<c.maxX&&-83>c.minZ&&-83<c.maxZ)
 .map(c=>({id:c.id,kind:c.kind})),
 target,reachable:near.filter(x=>x.fullyConnected).slice(0,10)},null,2));

const exit=target.exit;
const exitCandidate=[];
const start={x:6,z:-81};
for(let x=12;x<=29;x++)for(let z=-118;z<=-110;z++){
 if(!layout.canStand(x,z))continue;
 const route=shortestRouteV70(layout,start,{x,z});
 exitCandidate.push({x,z,score:Math.hypot(x-exit.x,z-exit.z),
  route:route.length,room:layout.roomAt(x,z)});
}
exitCandidate.sort((a,b)=>b.route>0===!(a.route>0)?a.score-b.score:
 (b.route>0)-(a.route>0));
console.log('V138_FREIGHT_CANDIDATES '+JSON.stringify(exitCandidate
 .filter(x=>x.route>0).sort((a,b)=>a.score-b.score).slice(0,35),null,2));
console.log('V138_EXIT_BLOCKER '+JSON.stringify({original:exit,
 canStand:layout.canStand(exit.x,exit.z),
 blockers:layout.colliders.filter(c=>exit.x>c.minX&&exit.x<c.maxX&&exit.z>c.minZ&&exit.z<c.maxZ)
 .map(c=>({id:c.id,kind:c.kind})),
 nearby:exitCandidate.slice(0,30)},null,2));
