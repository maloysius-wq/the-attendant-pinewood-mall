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
 const synthetic=needed.map(s=>s.replace('\\n','\n')).join('\n')+
  '\nsetTimeout(()=>this.characterV27(id,onStart,onUnavailable),';
 const result=patchChapterHandoffVoiceV152(synthetic);
 assert.match(result,/cancelChapterSpeechV152\(\);this\.resetState\(\);this\.storyVoiceUntilV27=0/);
 assert.match(result,/epochV152!==\(this\.voiceEpochV152\|\|0\)/);
 assert.equal(result.split('this.characterV27(id,onStart,onUnavailable,epochV152)').length-1,2);
 assert.match(result,/this\.activePcasSourcesV152\.add\(src\)/);
 assert.match(result,/this\.voiceBusyUntilV27=0/);
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
