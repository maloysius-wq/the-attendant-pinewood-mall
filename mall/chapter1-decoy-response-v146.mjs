/** V146: audible source-world noise and fair visible-player priority.
 * Use real original navDistance, the actual original decoy mesh and original AI path.
 */
export const DECOY_RULES_V146=Object.freeze({
 maxNavHearingMetres:27,
 beepSecondsChapter1:1.2,
 repeatInvestigationSeconds:2.45,
 sameSourceMetres:.36
});
export function shouldHearDecoyV146({chapter=1,type='decoy',visible,
 seesPlayer=false,navDistance=Infinity,secondsSinceAccepted=Infinity,
 sameSource=false}={}){
 if(chapter!==1||type!=='decoy')return true;
 if(!visible||seesPlayer)return false;
 if(!Number.isFinite(navDistance)||navDistance<0||
    navDistance>DECOY_RULES_V146.maxNavHearingMetres)return false;
 return !(sameSource&&secondsSinceAccepted<DECOY_RULES_V146.repeatInvestigationSeconds);
}
export function visiblePlayerOverridesDecoyV146({chapter=1,decoyUntil=0,time=0,
 visible=false,hidden=false,seesPlayer=false}={}){
 return chapter===1&&visible&&!hidden&&decoyUntil>time&&seesPlayer;
}
/** Modify the exact original Chapter 1 pulse timer, not the shared Chapter 2–6 AI.
 * Original landing, sound impulse, local CC0 beep, stunned response and game E/Q are untouched.
 */
export function paceOriginalDecoyBeepV146(source){
 if(typeof source!=='string')throw TypeError('V146 needs assembled original source');
 const literal="d.pulse=.45;audio.beep();this.emitSound(d.mesh.position,.72,'decoy');";
 if(source.split(literal).length!==2||source.includes('v146Chapter1DecoyPulse'))
  throw Error('V146 original decoy pulse source signature drifted or was already patched');
 return source.replace(literal,
  "d.pulse=this.levelIndex===0?1.2:.45;/* v146Chapter1DecoyPulse */audio.beep();this.emitSound(d.mesh.position,.72,'decoy');");
}
