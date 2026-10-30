/**
 * The Call v45: immutable caption cue sheet using each *recording's* duration.
 * Audio.currentTime is the authoritative clock in the browser. Never divide
 * dialogue by the scene's longer presentation/read-speed estimate.
 */
export const splitSpokenSentences=text=>
 text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(x=>x.trim()).filter(Boolean)||[text];
const wordCount=s=>Math.max(1,(s.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu)||[]).length);
export function buildCaptionTrack(text,recordedSeconds){
 const sentences=splitSpokenSentences(text),duration=Math.max(.1,Number(recordedSeconds)||.1);
 // Respect longer sentences while reserving just enough time at punctuation
 // for short answers such as "Got it." to remain readable.
 const weights=sentences.map(s=>wordCount(s)+(/[.!?]$/.test(s)?.5:0));
 const sum=weights.reduce((a,b)=>a+b,0);
 let cumulative=0;
 const ends=weights.map(weight=>{cumulative+=weight;return duration*cumulative/sum;});
 return {sentences,ends,duration};
}
export function captionAt(track,voiceSeconds){
 const seconds=Math.max(0,Math.min(track.duration,Number(voiceSeconds)||0));
 let i=track.ends.findIndex(end=>seconds<end);
 if(i<0)i=track.sentences.length-1;
 return {index:i,text:track.sentences[i]};
}