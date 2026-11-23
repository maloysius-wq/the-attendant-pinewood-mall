/** V149: source nav-connected search centered on the genuine last-heard cell. */
export const SEARCH_RULES_V149=Object.freeze({
 lostSightHuntCapSeconds:6.25,
 offsets:Object.freeze([
  Object.freeze([0,0]),Object.freeze([1,0]),Object.freeze([0,1]),
  Object.freeze([-1,0]),Object.freeze([0,-1]),
  Object.freeze([2,0]),Object.freeze([0,2]),
  Object.freeze([-2,0]),Object.freeze([0,-2]),
  Object.freeze([1,1]),Object.freeze([-1,1]),
  Object.freeze([-1,-1]),Object.freeze([1,-1])
 ])
});
export function capLostSightHuntV149({
 chapter=1,state='',visible=false,decoyUntil=0,now=0,
 seen=false,hidden=false,timer=0
}={}){
 return chapter===1&&state==='hunt'&&visible&&!seen&&
  decoyUntil<=now&&Number.isFinite(timer)&&timer>SEARCH_RULES_V149.lostSightHuntCapSeconds
  ?SEARCH_RULES_V149.lostSightHuntCapSeconds:timer;
}
/** The original source world owns walkability and A*. Never invent cells.
 * Returns a real reachable original waypoint, or null rather than psychic
 * pathing through the 1979 original solid masonry.
 */
export function chooseLastHeardSweepV149({
 world,source,actor,step=0
}={}){
 if(!world||!source||!actor||
  !Number.isFinite(source.x+source.z+actor.x+actor.z)||
  typeof world.cellFromWorld!=='function'||
  typeof world.navPassable!=='function'||typeof world.astar!=='function')return null;
 const centre=world.cellFromWorld(source.x,source.z);
 const start=world.cellFromWorld(actor.x,actor.z);
 if(!Number.isFinite(centre?.x+centre?.z+start?.x+start?.z))return null;
 const ring=SEARCH_RULES_V149.offsets;
 const index=((Math.trunc(step)||0)%ring.length+ring.length)%ring.length;
 for(let offset=0;offset<ring.length;offset++){
  const candidate=(index+offset)%ring.length;
  const [dx,dz]=ring[candidate];
  const goal={x:centre.x+dx,z:centre.z+dz};
  if(!world.navPassable(goal.x,goal.z))continue;
  const path=world.astar(start,goal);
  const end=Array.isArray(path)?path.at(-1):null;
  if(!end||Math.hypot(end.x-goal.x,end.z-goal.z)>.5)continue;
  return {goal,index:candidate,routeLength:path.length,origin:start,centre};
 }
 return null;
}
