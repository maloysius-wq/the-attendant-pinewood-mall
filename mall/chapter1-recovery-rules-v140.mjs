/**
 * V140 fair original Chapter 1 Attendant pursuit.
 * No synthetic enemy or new collision geometry. All paths stay on the real
 * G-floor navigation and the original Attendant model/audio/AI remain intact.
 */
export const CHAPTER1_RECOVERY_V140=Object.freeze({
 lostSightCooldownSeconds:12,
 huntCueSeconds:4.25,
 searchCueSeconds:3.5,
 contactRangeMetres:.72,
 enteringCabinetSafeAfterSeconds:.65,
 contactDeathReason:'The Attendant reached you. Pinewood has converted you to store property.'
});
export function isPhysicalContactV140({player,attendant,levelY=0,hidden=false,
 enteringTime=null,sight}={}){
 if(!player||!attendant||typeof sight!=='function'||hidden)return false;
 if(enteringTime!==null&&enteringTime>=CHAPTER1_RECOVERY_V140.enteringCabinetSafeAfterSeconds)return false;
 if(!Number.isFinite(player.x+player.z+attendant.x+attendant.z+attendant.y+levelY))return false;
 if(Math.abs(attendant.y-levelY)>.85)return false; // Do not kill through a different story level.
 const planar=Math.hypot(player.x-attendant.x,player.z-attendant.z);
 if(planar>=CHAPTER1_RECOVERY_V140.contactRangeMetres)return false;
 return sight(attendant,player)===true;
}
export function pursueLastKnownV140({levelIndex=0,state,player,target,visible,
 decoyActive=false,lastKnown}={}){
 return levelIndex===0&&state==='hunt'&&target===player&&!visible&&!decoyActive&&
  lastKnown&&Number.isFinite(lastKnown.x+lastKnown.z)?lastKnown:target;
}
export function afterSearchCooldownV140({levelIndex=0,before,after,current}={}){
 return levelIndex===0&&before==='search'&&after==='dormant'?
  Math.max(current||0,CHAPTER1_RECOVERY_V140.lostSightCooldownSeconds):current;
}
