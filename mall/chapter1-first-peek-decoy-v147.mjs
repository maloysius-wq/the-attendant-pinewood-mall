/** V147: readable, non-lethal original Chapter 1 first-peek decoy response. */
export const FIRST_PEEK_V147=Object.freeze({
 minimumRevealSeconds:4.25,
 audibleOriginalNavMetres:27,
 originalSourceEpsilonMetres:.36,
 audiblePeekRemainingSeconds:.55,
 soundTurnSeconds:1.15
});
export function canDivertProtectedPeekV147({
 chapter=1,revealed=false,now,graceUntil,peekUntil,
 visible=false,state='',sourceActive=false,alreadyDiverted=false,
 pathMetres=Infinity
}={}){
 return chapter===1&&revealed&&Number.isFinite(now)&&
  Number.isFinite(graceUntil)&&now<graceUntil&&
  Number.isFinite(peekUntil)&&peekUntil-now>=FIRST_PEEK_V147.audiblePeekRemainingSeconds&&
  visible&&state==='stalk'&&sourceActive&&!alreadyDiverted&&
  Number.isFinite(pathMetres)&&pathMetres>=0&&
  pathMetres<=FIRST_PEEK_V147.audibleOriginalNavMetres;
}
export function chooseProtectedPeekEndV147({now,previousPeekUntil}={}){
 if(!Number.isFinite(now)||!Number.isFinite(previousPeekUntil)||previousPeekUntil<=now)
  throw Error('V147 requires a live original non-expired first-peek sighting');
 return Math.min(previousPeekUntil,now+FIRST_PEEK_V147.soundTurnSeconds);
}
