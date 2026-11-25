/** V152 guard tests: current emitted v27 snippets, original V70 entrypoint and no lore drift. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {patchChapterHandoffVoiceV152} from '../mall/chapter-handoff-voice-v152.mjs';
import {DIALOGUE_V17} from '../story/dialogue.js';

const v27=readFileSync('patches/audio-direction-v27.js.txt','utf8');
const v70=readFileSync('patches/unified-mall-v70.js.txt','utf8');
const loader=readFileSync('game.js','utf8');

test('V152 patches ONLY the original V27 async voice and V70 startChapter boundaries',()=>{
 const needed=[
  'const audio=new AudioSystem();',
  'async characterV27(id,onStart=null,onUnavailable=null){',
  'setTimeout(()=>this.characterV27(id,onStart,onUnavailable),',
  'const buffer=await this.loadCharacterV27(id);this.voiceLoadingV27=false;if(!buffer||!this.ctx)return unavailable();',
  'async pcas(id){\\n    if(!this.ctx)return null;',
  'const buffer=await this.loadPcas(id);if(!buffer||!this.ctx||this.voiceBusyV27())return null;',
  'this.reserveVoiceV27(buffer.duration/src.playbackRate.value,.52);src.start(this.ctx.currentTime+.20);return src;',
  'this.world.clear();this.resetState();this.mallGroundExitV70=false;'
 ];
 for(const marker of needed.slice(1,7))
  assert.ok(v27.includes(marker.replace('\\n','\n')),'V27 source ownership changed: '+marker);
 assert.ok(v70.includes(needed[7]),'V70 original chapter reset marker changed');
 const instanceMarkers=[
  'const monitor=setInterval(()=>{const t=window.__PINEWOOD_AUDIO_V27__?.lastCharacter;if(!t||t.id!==id||t.ended)return;',
  'if(t?.id===id){t.ended=true;'
 ];
 for(const marker of instanceMarkers)assert.ok(v27.includes(marker));
 const drainMarkers=['s.water.position.y=.035-t*.18;','if(s.floodBlocker)s.floodBlocker.disabled=true;'];
 const v21=readFileSync('patches/chapter2-below-grade-v21.js.txt','utf8');
 for(const marker of drainMarkers)assert.ok(v21.includes(marker),'original drain marker missing');
 const synthetic=[...needed,...instanceMarkers,...drainMarkers].map(s=>s.replace('\\n','\n')).join('\n')+
  '\nsetTimeout(()=>this.characterV27(id,onStart,onUnavailable),';
 const result=patchChapterHandoffVoiceV152(synthetic);
 assert.match(result,/cancelChapterSpeechV152\(\);this\.resetState\(\);this\.storyVoiceUntilV27=0/);
 assert.match(result,/epochV152!==\(this\.voiceEpochV152\|\|0\)/);
 assert.equal(result.split('this.characterV27(id,onStart,onUnavailable,epochV152)').length-1,2);
 assert.match(result,/this\.activePcasSourcesV152\.add\(src\)/);
 assert.match(result,/this\.voiceBusyUntilV27=0/);
 assert.match(result,/s\.water\.position\.y=\(this\.mallLevelYV70\?\?0\)\+\.035-t\*\.18/);
 assert.match(result,/s\.floodBlocker\.disabled=true;this\.world\.navCache\.clear\(\)/);
 assert.throws(()=>patchChapterHandoffVoiceV152(result),/missing or ambiguous|expected 2/);
 assert.throws(()=>patchChapterHandoffVoiceV152(synthetic.replace('this.world.clear();','')),/chapter-scene handoff/);
});
test('the shipped game applies V152 after V27 + V70 and after V151',()=>{
 assert.match(loader,/import \{patchChapterHandoffVoiceV152\} from '.\/mall\/chapter-handoff-voice-v152\.mjs'/);
 assert.ok(loader.indexOf('unifiedSource=patchStoryStaffRecognitionV151(unifiedSource)')<
  loader.indexOf('unifiedSource=patchChapterHandoffVoiceV152(unifiedSource)'));
 assert.ok(loader.indexOf('applyUnifiedMallV70(audioDirectionV27Source)')<
  loader.indexOf('patchChapterHandoffVoiceV152(unifiedSource)'));
});
test('the 1997 ticket is not spoiled in Chapter 1, and Chapter 2 reveals it only after Relay D',()=>{
 const ch1=Object.values(DIALOGUE_V17).filter(line=>line.id.startsWith('ch1_'));
 assert.ok(ch1.every(line=>!/1997|eli mercer|contractor 13|session 01/i.test(line.text)));
 assert.match(DIALOGUE_V17.ch2_start.text,/freight car was not supposed to go down/);
 assert.match(DIALOGUE_V17.ch2_1997_ticket.text,/November 14, 1997/);
 const v21=readFileSync('patches/chapter2-below-grade-v21.js.txt','utf8');
 assert.match(v21,/if\(this\.breakers===1\).*queueDialogue\('ch2_1997_ticket',5\.1\)/s);
 assert.match(DIALOGUE_V17.ch2_1997_ticket.text,/not hanging up/);
});

test('relocation rebases the original pickup animation origin with the physical floor',()=>{
 const source=readFileSync('mall/story-runtime-v70.js','utf8');
 const match=source.match(/obj\.position\.set\(at\.x,obj\.position\.y\+layout\.y,at\.z\);[\s\S]*?obj\.updateWorldMatrix\(true,true\);/);
 assert.ok(match,'original V70 relocation missing');
 // Execute the exact relocation body for the same pickup on each actual floor.
 const relocate=new Function('obj','at','layout',match[0]);
 for(const floor of [-4.3,0,5.4]){
  const obj={position:{y:.18,set(x,y,z){Object.assign(this,{x,y,z});}},userData:{floatBase:.18},updateWorldMatrix(){}};
  relocate(obj,{x:23,z:-78},{y:floor});
  assert.ok(Math.abs(obj.position.y-(floor+.18))<1e-9);
  assert.equal(obj.userData.floatBase,obj.position.y);
  // Original bobbing must stay near the relocated base, rather than the old G floor.
  for(const offset of [-.08,.08])assert.ok(Math.abs(obj.userData.floatBase+offset-floor)<.3);
  const fixed={position:{y:1.3,set(x,y,z){Object.assign(this,{x,y,z});}},userData:{},updateWorldMatrix(){}};
  relocate(fixed,{x:23,z:-78},{y:floor});
  assert.equal(fixed.position.y,1.3+floor);
  assert.equal(fixed.userData.floatBase,undefined);
 }
});
