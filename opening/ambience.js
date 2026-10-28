/**
 * V34b ambient rain. These are the owner's own normalized 16-bit source recordings
 * transcoded to local, seamless OGG. Only relative URLs are allowed at runtime.
 */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const source={
  car:new URL('./audio/car-rain.ogg',import.meta.url).href,
  outside:new URL('./audio/outside-rain.ogg',import.meta.url).href
};
const region=shot=>shot==='car'||shot==='phone'?'car':(['lot','walk','entrance','keypad'].includes(shot)?'outside':'inside');
export class OpeningAmbience{
 constructor(){
  this.players={};this.levels={car:0,outside:0};this.started=false;this.paused=false;
  for(const [name,url] of Object.entries(source)){
   const audio=new Audio(url);audio.preload='auto';audio.loop=true;audio.volume=0;
   audio.addEventListener('error',()=>console.warn('[Opening ambience] local sound unavailable: '+name),{once:true});
   this.players[name]=audio;
  }
 }
 start(){
  if(this.started)return;this.started=true;
  for(const audio of Object.values(this.players)){
   // Play both silently once the New Game click activates the audio context.
   // Starting a silent outside player avoids a later autoplay rejection at scene transitions.
   audio.play().catch(err=>console.warn('[Opening ambience] gesture required',err?.message||err));
  }
 }
 update(delta,shot,voicePlaying){
  if(this.paused)return;
  const current=region(shot),duck=voicePlaying?.72:1;
  const desired={
   car:current==='car'?.48*duck:0,
   outside:current==='outside'?.62*duck:0
  };
  for(const [name,audio] of Object.entries(this.players)){
   // About 2 seconds from car to pavement, and 2 seconds to silence inside.
   const diff=desired[name]-this.levels[name],step=clamp(delta*0.32,0,1);
   this.levels[name]+=diff*step;
   if(Math.abs(this.levels[name])<.0006&&desired[name]===0)this.levels[name]=0;
   audio.volume=clamp(this.levels[name],0,1);
  }
 }
 pause(){
  this.paused=true;for(const audio of Object.values(this.players))audio.pause();
 }
 resume(){
  this.paused=false;for(const audio of Object.values(this.players))audio.play().catch(()=>{});
 }
 destroy(){
  for(const audio of Object.values(this.players)){
   audio.pause();audio.removeAttribute('src');audio.load();
  }
  this.started=false;
 }
 get status(){
  return Object.fromEntries(Object.entries(this.players).map(([name,audio])=>[name,{
   playing:!audio.paused,loop:audio.loop,volume:Number(audio.volume.toFixed(3)),
   time:Number(audio.currentTime.toFixed(3)),readyState:audio.readyState,
   source:audio.currentSrc?.split('/').slice(-1)[0]||''
  }]));
 }
}