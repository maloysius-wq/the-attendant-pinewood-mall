import {ENTRY_CODE} from './keypad-spec-v72.mjs';

// Timeline times are measured from each cue's real media clock, including its
// post-voice pause. The same thresholds drive both sound and visible doors.
export const CAR_DOOR_OPEN_PHASE=.06;
export const CAR_DOOR_CLOSE_DELAY_SECONDS=5;
export const VESTIBULE_CLOSE_PHASE=.54;

export function soundCuesFor(cue,voiceSeconds,waitSeconds){
 const voice=Math.max(0,Number(voiceSeconds)||0),
  wait=Math.max(voice,Number(waitSeconds)||voice);
 if(cue==='lights'){
  const pause=Math.max(.1,wait-voice);
  return ENTRY_CODE.map((digit,slot)=>({
   id:'keypad-'+slot,name:'Beep',digit,at:voice+(slot+.5)*pause/ENTRY_CODE.length
  }));
 }
 if(cue==='owner'){
  const open=wait*CAR_DOOR_OPEN_PHASE;
  return [
   {id:'car-open',name:'CarDoorOpen',at:open},
   {id:'car-close',name:'CarDoorClose',at:open+CAR_DOOR_CLOSE_DELAY_SECONDS}
  ];
 }
 if(cue==='inside')return [
  {id:'metal-open',name:'MetalDoorOpen',at:wait*.01},
  {id:'metal-close',name:'MetalDoorClose',at:wait*VESTIBULE_CLOSE_PHASE}
 ];
 return [];
}
export function crossedSoundCues(cues,previousElapsed,elapsed){
 if(!Number.isFinite(elapsed)||elapsed<previousElapsed)return [];
 return cues.filter(e=>e.at>previousElapsed&&e.at<=elapsed);
}
