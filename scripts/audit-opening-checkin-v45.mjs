import {readFileSync} from 'node:fs';
import {buildCaptionTrack,captionAt} from '../opening/caption-sync-v45.js';
const assert=(x,m)=>{if(!x)throw Error(m);};
const script=JSON.parse(readFileSync('opening/script.json','utf8'));
const manifest=JSON.parse(readFileSync('opening/audio/manifest.json','utf8'));
for(const line of script.lines){
 const voice=manifest.files[line.id];
 assert(voice?.text===line.text,'Recorded transcript mismatch: '+line.id);
 assert(voice.duration>3&&Number.isFinite(voice.duration),'Missing prerecorded duration: '+line.id);
 const track=buildCaptionTrack(line.text,voice.duration);
 assert(track.sentences.length>=1,'No captions '+line.id);
 assert(track.ends.length===track.sentences.length,'Caption boundary mismatch '+line.id);
 assert(track.ends.every((t,i)=>t>0&&t<=voice.duration+1e-5&&(!i||t>track.ends[i-1])),
   'Non-monotonic voice-timed captions '+line.id);
 assert(captionAt(track,0).text===track.sentences[0],'First caption missing '+line.id);
 assert(captionAt(track,voice.duration).text===track.sentences.at(-1),
  'Final caption not reached at voice end '+line.id);
}
const p=readFileSync('opening/phone-v45.js','utf8');
const intro=readFileSync('opening/intro.js','utf8');
assert(p.includes("camera.add(this.root)")&&p.includes("state=f>=.77?'confirmed':'pending'"),
 'Handheld device must be camera-attached and show a check-in confirmation');
assert(intro.includes('this.audio.currentTime')&&intro.includes('captionAt(this.captionTrack'),
 'Subtitles must follow media.currentTime, not wall-clock sentence division');
assert(!intro.includes("this.root.querySelector('.pwm-phone-sheet')"),
 'Do not restore rejected HTML phone card');
console.log('PASS v45 '+script.lines.length+' recorded voice transcripts, clip-based caption cues and handheld app invariants');