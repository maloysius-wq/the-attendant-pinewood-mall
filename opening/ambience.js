/**
 * The Call v35: gapless, sample-accurate rain playback.
 * Both ORIGINAL owner-provided rain beds are locally mastered into stitched
 * OGG loops. Decode once into Web Audio PCM buffers, loop BufferSource nodes
 * without HTMLMediaElement seeking / encoder preroll / rebuffer silence.
 */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const URLs={
 car:new URL('./audio/car-rain-v35.ogg',import.meta.url).href,
 outside:new URL('./audio/outside-rain-v35.ogg',import.meta.url).href
};
const toRain=shot=>shot==='car'||shot==='phone'?{car:1,outside:0}:
 ['lot','walk','entrance','keypad'].includes(shot)?{car:0,outside:1}:{car:0,outside:0};
export class OpeningAmbience{
 constructor(){
  this.ctx=null;this.sources={};this.gains={};this.buffers={};
  this.levels={car:0,outside:0};this.targets={car:0,outside:0};
  this.started=false;this.paused=false;this.disposed=false;
  this.failed={};
 }
 start(){
  if(this.started||this.disposed)return;
  this.started=true;
  const AudioEngine=window.AudioContext||window.webkitAudioContext;
  if(!AudioEngine){console.warn('[Pinewood rain] Web Audio unavailable');return;}
  try{this.ctx=new AudioEngine({latencyHint:'playback'});}
  catch(err){console.warn('[Pinewood rain] Cannot open audio context',err);return;}
  this.ctx.resume().catch(()=>{});
  for(const [id,url] of Object.entries(URLs))this.load(id,url);
 }
 async load(id,url){
  const ctx=this.ctx;if(!ctx)return;
  try{
   const response=await fetch(url,{mode:'same-origin',cache:'force-cache'});
   if(!response.ok)throw Error('HTTP '+response.status);
   const bytes=await response.arrayBuffer();
   if(this.disposed||!this.ctx)return;
   const buffer=await ctx.decodeAudioData(bytes);
   if(this.disposed||!this.ctx)return;
   if(buffer.duration<2)throw Error('Rain bed too short '+id);
   // Vorbis decoding can leave a few endpoint samples misaligned. Correct that
   // residual over a 6ms curve so the LAST sample equals the FIRST exactly.
   // This eliminates the final potential discontinuity even after re-encoding.
   const endSamples=Math.min(256,Math.max(1,Math.floor(buffer.length*.02)));
   for(let channel=0;channel<buffer.numberOfChannels;channel++){
    const samples=buffer.getChannelData(channel),last=samples.length-1;
    const correction=samples[0]-samples[last];
    for(let n=0;n<endSamples;n++){
     const t=(n+1)/endSamples,shape=t*t*(3-2*t);
     samples[samples.length-endSamples+n]+=correction*shape;
    }
   }
   const volume=ctx.createGain();volume.gain.setValueAtTime(0,ctx.currentTime);volume.connect(ctx.destination);
   const source=ctx.createBufferSource();source.buffer=buffer;
   source.loop=true;source.loopStart=0;source.loopEnd=buffer.duration;
   source.connect(volume);source.start(0);
   this.sources[id]=source;this.gains[id]=volume;this.buffers[id]=buffer;
   volume.gain.setTargetAtTime(this.targets[id],ctx.currentTime,.29);
  }catch(err){this.failed[id]=String(err?.message||err);console.warn('[Pinewood rain] Local '+id+' not available:',this.failed[id]);}
 }
 update(_delta,shot,voicePlaying,mix=null){
  if(this.disposed||this.paused)return;
  const weights=mix||toRain(shot);
  // Both beds sit beneath dialogue; "ducking" uses a smooth gain target.
  const duck=voicePlaying?.64:1;
  const desired={
   car:.48*duck*clamp(weights.car??0,0,1),
   outside:.58*duck*clamp(weights.outside??0,0,1)
  };
  this.targets=desired;
  if(!this.ctx)return;
  for(const id of ['car','outside']){
   const gain=this.gains[id];if(!gain)continue;
   if(Math.abs(this.levels[id]-desired[id])>.002){
    gain.gain.setTargetAtTime(desired[id],this.ctx.currentTime,.24);
   }
   this.levels[id]=gain.gain.value;
  }
 }
 pause(){
  this.paused=true;this.ctx?.suspend().catch(()=>{});
 }
 resume(){
  this.paused=false;this.ctx?.resume().catch(()=>{});
 }
 destroy(){
  if(this.disposed)return;this.disposed=true;
  for(const source of Object.values(this.sources)){try{source.stop()}catch{}try{source.disconnect()}catch{}}
  for(const gain of Object.values(this.gains)){try{gain.disconnect()}catch{}}
  this.sources={};this.gains={};this.buffers={};
  this.ctx?.close().catch(()=>{});this.ctx=null;
 }
 get status(){
  return Object.fromEntries(['car','outside'].map(id=>{
   const audio=this.buffers[id],ctx=this.ctx,gain=this.gains[id];
   return[id,{
    playing:!!audio&&ctx?.state==='running'&&!this.paused,
    loop:!!audio,volume:Number((gain?.gain.value||0).toFixed(3)),
    duration:Number((audio?.duration||0).toFixed(3)),
    time:Number((audio&&ctx?ctx.currentTime%audio.duration:0).toFixed(3)),
    readyState:audio?4:0,
    source:URLs[id].split('/').pop(),
    gapless:!!audio,
    state:ctx?.state||'closed',
    error:this.failed[id]||null
   }];
  }));
 }
}
