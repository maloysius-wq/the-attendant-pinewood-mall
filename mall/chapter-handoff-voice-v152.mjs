/** V152: invalidate in-flight 1997-era radio/PA playback when the ORIGINAL
 * Game.startChapter rebuilds the physical scene. No story dialogue changes,
 * duplicate input handlers, added save keys, or alternate chapter loader.
 *
 * The V27 voice loader is async: a previous chapter's OGG can finish decoding
 * after the old world and subtitles have been replaced. Epoch-bound attempts
 * cannot speak in the following chapter, including delayed busy-channel retries.
 */
export function patchChapterHandoffVoiceV152(source) {
  const replaceOnce=(label,needle,replacement)=>{
    const i=source.indexOf(needle);
    if(i<0||source.indexOf(needle,i+needle.length)!==-1)
      throw Error('V152 '+label+': missing or ambiguous original source marker');
    source=source.slice(0,i)+replacement+source.slice(i+needle.length);
  };
  const replaceCount=(label,needle,replacement,count)=>{
    const n=source.split(needle).length-1;
    if(n!==count)throw Error('V152 '+label+': expected '+count+' exact source markers, got '+n);
    source=source.split(needle).join(replacement);
  };

  replaceOnce('chapter-scoped voice lifecycle','const audio=new AudioSystem();',
`const audio=new AudioSystem();
window.__PINEWOOD_HANDOFF_V152__={version:152,chapterResets:0,epoch:0,stoppedCharacter:0,stoppedPcas:0};
audio.voiceEpochV152=0;
audio.cancelChapterSpeechV152=function(){
  this.voiceEpochV152++;
  const stats=window.__PINEWOOD_HANDOFF_V152__;
  stats.chapterResets++;stats.epoch=this.voiceEpochV152;
  for(const src of this.activeCharacterSourcesV27||[]){
    try{src.stop();stats.stoppedCharacter++;}catch{}
  }
  this.activeCharacterSourcesV27?.clear();
  for(const src of this.activePcasSourcesV152||[]){
    try{src.stop();stats.stoppedPcas++;}catch{}
  }
  this.activePcasSourcesV152?.clear();
  this.voiceBusyUntilV27=0;
  this.voiceLoadingV27=false;
  // UI.hideAll clears screens, but a previous PA caption can outlive the
  // chapter. Clear it at the same epoch boundary, never in a later callback.
  const caption=document.getElementById('subtitle');
  caption?.classList.remove('show');
  const speaker=document.getElementById('speaker'),text=document.getElementById('subtitleText');
  if(speaker)speaker.textContent='';
  if(text)text.textContent='';
};
if(['127.0.0.1','localhost'].includes(location.hostname)&&
   new URLSearchParams(location.search).has('chapter1QA')){
  const inspect=()=>({
    time:GAME.time,chapter:GAME.levelIndex+1,running:GAME.running,modal:GAME.modal,
    queue:GAME.storyQueue.map(l=>({at:l.at,kind:l.kind,id:l.audioKey||null})),
    storyLock:GAME.storyVoiceUntilV27||0,context:audio.ctx?.state||null,
    audioTime:audio.ctx?.currentTime??null,voiceBusy:audio.voiceBusyV27(),
    voiceLoading:!!audio.voiceLoadingV27,voiceRemaining:audio.voiceRemainingV27(),
    pickups:GAME.world.interactables.filter(o=>Number.isFinite(o.userData?.floatBase))
      .map(o=>({id:o.userData.label||o.userData.id,type:o.userData.type,y:o.position.y,
        base:o.userData.floatBase,floor:GAME.mallLevelYV70,visible:o.visible,collected:!!o.userData.collected}))
  });
  window.__PINEWOOD_HANDOFF_V152_QA__=Object.freeze({
    inspect,
    stepStory(n=1,dt=.04){
      if(!GAME.running||GAME.modal||GAME.dead||GAME.won||!Number.isInteger(n)||n<1||n>60||dt<=0||dt>.05)
        throw Error('Invalid live original story update step');
      // Advance the actual game clock and execute the actual source story
      // scheduler, as V142 already does for the original elevator.
      // Never invoke a specific voice or synthesize an event in the test.
      for(let i=0;i<n;i++){GAME.time+=dt;GAME.updateStory();}
      return inspect();
    }
  });
}`);

  replaceOnce('epoch-bound Renee loader signature',
    'async characterV27(id,onStart=null,onUnavailable=null){',
    'async characterV27(id,onStart=null,onUnavailable=null,epochV152=this.voiceEpochV152||0){if(epochV152!==(this.voiceEpochV152||0))return null;');

  replaceCount('old-chapter deferred Renee retries',
    'setTimeout(()=>this.characterV27(id,onStart,onUnavailable),',
    'setTimeout(()=>this.characterV27(id,onStart,onUnavailable,epochV152),',2);

  replaceOnce('late Renee OGG decode',
    'const buffer=await this.loadCharacterV27(id);this.voiceLoadingV27=false;if(!buffer||!this.ctx)return unavailable();',
    'const buffer=await this.loadCharacterV27(id);if(epochV152!==(this.voiceEpochV152||0))return null;this.voiceLoadingV27=false;if(!buffer||!this.ctx)return unavailable();');

  replaceOnce('epoch-bound PCAS loader',
    'async pcas(id){\n    if(!this.ctx)return null;',
    'async pcas(id){\n     const epochV152=this.voiceEpochV152||0;\n     if(!this.ctx)return null;');

  replaceOnce('late PCAS OGG decode',
    'const buffer=await this.loadPcas(id);if(!buffer||!this.ctx||this.voiceBusyV27())return null;',
    'const buffer=await this.loadPcas(id);if(epochV152!==(this.voiceEpochV152||0)||!buffer||!this.ctx||this.voiceBusyV27())return null;');

  replaceOnce('stop tracked original PCAS clip at chapter transition',
    'this.reserveVoiceV27(buffer.duration/src.playbackRate.value,.52);src.start(this.ctx.currentTime+.20);return src;',
    'this.reserveVoiceV27(buffer.duration/src.playbackRate.value,.52);this.activePcasSourcesV152??=new Set();this.activePcasSourcesV152.add(src);src.onended=()=>this.activePcasSourcesV152?.delete(src);src.start(this.ctx.currentTime+.20);return src;');

  replaceOnce('voice telemetry belongs to original source instance',
    'const monitor=setInterval(()=>{const t=window.__PINEWOOD_AUDIO_V27__?.lastCharacter;if(!t||t.id!==id||t.ended)return;',
    'const ownPlayback=telemetry.lastCharacter;const monitor=setInterval(()=>{const t=window.__PINEWOOD_AUDIO_V27__?.lastCharacter;if(t!==ownPlayback||t.ended)return;');
  replaceOnce('old voice completion cannot mutate new playback',
    'if(t?.id===id){t.ended=true;',
    'if(t===ownPlayback){t.ended=true;');

  // V70 preserves this exact ORIGINAL startChapter statement after its full
  // world clear. Stop old chapter voices *before* source reset, then permit
  // the new chapter's real beginPlay to speak immediately when clicked.
  replaceOnce('original chapter-scene handoff',
    'this.world.clear();this.resetState();this.mallGroundExitV70=false;',
    'this.world.clear();audio.cancelChapterSpeechV152();this.resetState();this.storyVoiceUntilV27=0;this.mallGroundExitV70=false;');

  for(const marker of ['epochV152!==','activePcasSourcesV152','cancelChapterSpeechV152();this.resetState()',
    'voiceBusyUntilV27=0','this.storyVoiceUntilV27=0'])
    if(!source.includes(marker))throw Error('V152 required safeguard vanished: '+marker);
  return source;
}
