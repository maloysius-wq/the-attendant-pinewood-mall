import {soundCuesFor,crossedSoundCues} from './cinematic-sfx-cues-v82.mjs?v=84';

const filenames=['Beep','MetalDoorOpen','MetalDoorClose','CarDoorOpen','CarDoorClose'];
const volume={Beep:.34,MetalDoorOpen:.55,MetalDoorClose:.56,
 CarDoorOpen:.58,CarDoorClose:.58};
const clipURL=name=>new URL('./audio/cinematic/v82/'+name+'.wav',import.meta.url).href;

/**
 * One-shot sounds share the existing, gesture-unlocked rain AudioContext.
 * The cinematic's media-following elapsed time, not wall-clock time, triggers
 * each event; suspending the rain context also suspends any active effect.
 */
export class OpeningCinematicSfx{
 constructor(ctx){
  this.ctx=ctx;this.buffers={};this.active=new Set();
  this.log=[];this.state=ctx?'loading':'unavailable';
  this.failed={};this.lastCue=null;this.previousElapsed=-.001;
  this.fired=new Set();this.disposed=false;
  this.ready=ctx?this._load():Promise.resolve(false);
 }
 async _load(){
  await Promise.all(filenames.map(async name=>{
   try{
    const response=await fetch(clipURL(name),{mode:'same-origin',cache:'force-cache'});
    if(!response.ok)throw Error(name+' HTTP '+response.status);
    const bytes=await response.arrayBuffer();
    if(this.disposed)return;
    const buffer=await this.ctx.decodeAudioData(bytes);
    if(!buffer?.duration||buffer.duration<.10||buffer.duration>3)
     throw Error(name+' contains invalid audio');
    this.buffers[name]=buffer;
   }catch(error){
    this.failed[name]=String(error?.message||error);
    throw Error('Cinematic sound '+name+' failed: '+this.failed[name]);
   }
  }));
  if(this.disposed)return false;
  this.state='ready';return true;
 }
 _play(event,cue){
  if(this.disposed||this.state!=='ready'||!this.ctx)return;
  const buffer=this.buffers[event.name];if(!buffer)return;
  const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();
  gain.gain.value=volume[event.name];
  source.buffer=buffer;source.connect(gain);gain.connect(this.ctx.destination);
  this.active.add(source);
  source.onended=()=>{
   this.active.delete(source);
   try{source.disconnect();gain.disconnect();}catch{}
  };
  source.start(this.ctx.currentTime);
  this.log.push({cue,id:event.id,name:event.name,digit:event.digit??null,
   at:+event.at.toFixed(3),contextTime:+this.ctx.currentTime.toFixed(3)});
  if(this.log.length>40)this.log.shift();
 }
 update(cue,elapsed,voiceSeconds,waitSeconds,{scrubbing=false}={}){
  if(this.disposed||this.state!=='ready'||!Number.isFinite(elapsed))return;
  if(this.lastCue!==cue){
   this.lastCue=cue;this.previousElapsed=-.001;this.fired.clear();
  }
  if(scrubbing){
   this.previousElapsed=elapsed;
   return;
  }
  // A real timeline rewind (review seek or changed media duration) must not
  // replay sounds unexpectedly on the next forward frame.
  if(elapsed<this.previousElapsed-.12){
   this.previousElapsed=elapsed;return;
  }
  const events=soundCuesFor(cue,voiceSeconds,waitSeconds);
  for(const event of crossedSoundCues(events,this.previousElapsed,elapsed)){
   if(this.fired.has(event.id))continue;
   this.fired.add(event.id);this._play(event,cue);
  }
  this.previousElapsed=elapsed;
 }
 destroy(){
  this.disposed=true;
  for(const source of this.active){try{source.stop();source.disconnect()}catch{}}
  this.active.clear();this.buffers={};this.state='closed';
 }
 get status(){
  return{state:this.state,sharedContext:!!this.ctx,
   contextState:this.ctx?.state||'closed',loaded:Object.keys(this.buffers).sort(),
   durations:Object.fromEntries(Object.entries(this.buffers).map(([name,b])=>[name,+b.duration.toFixed(3)])),
   played:this.log.slice(),failed:{...this.failed},cue:this.lastCue};
 }
}
