/** Localhost-only Chapter 6 native Northstar route fixture. */
export function installNorthstarTraversalV162(game,descend){
 if(!['127.0.0.1','localhost'].includes(location.hostname)||!new URLSearchParams(location.search).has('northstarFixtureQA')||game.levelIndex!==5)return;
 let seeded=false,steps=0,meters=0;
 const p=()=>game.controls.yaw.position,stand=(x,z)=>game.world.canStand(x,z),point=()=>({x:p().x,z:p().z}),dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const ensure=()=>{if(!game.running||game.dead||game.modal||game.levelIndex!==5||!game.ch6V25?.exitOpen)throw Error('Actual released Chapter 6 not live')};
 const clear=(a,b)=>{const n=Math.max(1,Math.ceil(dist(a,b)/.075));let prev=a;for(let i=1;i<=n;i++){const q={x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n};if(!stand(q.x,prev.z)||!stand(q.x,q.z))return false;prev=q}return true};
 const stepTo=q=>{let n=0;while(dist(point(),q)>.004){if(++n>3000)throw Error('No progress');const a=point(),d=dist(a,q),m=Math.min(.085,d);game.tryMove((q.x-a.x)*m/d,(q.z-a.z)*m/d);const b=point(),moved=dist(a,b);if(moved<m*.9||!stand(b.x,b.z))throw Error('Actual native motion blocked '+JSON.stringify({a,b,q,moved}));steps++;meters+=moved}};
 const state=()=>({player:point(),room:game.mallLayoutV70.roomAt(p().x,p().z),ground:game.mallGroundExitV70,stand:stand(p().x,p().z),steps,meters,chapter:game.levelIndex+1});
 window.__PINEWOOD_NORTHSTAR_V162_QA__=Object.freeze({
  seed(){ensure();if(seeded||steps)throw Error('Fresh isolated test required');if(!game.mallGroundExitV70&&!descend(game))throw Error('Actual released ground floor descent unavailable');const x=63.5,z=-61.5;if(!stand(x,z)||game.mallLayoutV70.roomAt(x,z)!=='east_wing_spine')throw Error('Actual fixture outside Northstar blocked');p().set(x,1.7,z);game.controls.yaw.rotation.y=-Math.PI/2;game.controls.pitch.rotation.x=0;game.camera.updateWorldMatrix(true,false);seeded=true;return state()},
  walk(x,z){ensure();if(!seeded)throw Error('Seed first');const a=point(),b={x,z};if(!stand(x,z))throw Error('Unstandable target '+JSON.stringify(b));let route=[];
   if(clear(a,b))route=[b];else{
    const s=.25,key=q=>q.x+','+q.z,near=q=>{const out=[];for(let dx=-3;dx<=3;dx++)for(let dz=-3;dz<=3;dz++){const t={x:Math.round(q.x/s)*s+dx*s,z:Math.round(q.z/s)*s+dz*s};if(stand(t.x,t.z)&&clear(q,t))out.push(t)}return out.sort((u,v)=>dist(q,u)-dist(q,v))};
    const queue=near(a),parents=new Map(queue.map(q=>[key(q),null])),goals=new Set(near(b).map(key));let found=null;
    for(let i=0;i<queue.length&&i<45000;i++){const q=queue[i],k=key(q);if(goals.has(k)){found=k;break}for(const [dx,dz] of [[s,0],[-s,0],[0,s],[0,-s]]){const t={x:q.x+dx,z:q.z+dz},n=key(t);if(t.x<56||t.x>86||t.z<-76||t.z>-39||parents.has(n)||!stand(t.x,t.z)||!clear(q,t))continue;parents.set(n,k);queue.push(t)}}
    if(found===null)throw Error('No real Northstar path '+JSON.stringify({a,b}));for(let k=found;k!==null;k=parents.get(k)){const [x,z]=k.split(',').map(Number);route.push({x,z})}route.reverse();route.push(b)
   }for(const q of route)stepTo(q);return state()
  },state
 });
}
