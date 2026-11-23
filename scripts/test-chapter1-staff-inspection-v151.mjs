import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three/build/three.module.js';
import {patchStoryStaffRecognitionV151} from '../mall/staff-recognition-source-v151.mjs';
import {installChapter1StaffInspectionV151}
 from '../mall/chapter1-staff-inspection-v151.js';
import {STAFF_BELONGINGS_V150} from '../mall/chapter1-staff-belongings-v150.mjs';
import {CHARACTERS_V17} from '../story/characters.js';

test('V17 staff recognition reuses existing story.save, advances ONLY known traces and never demotes evidence',()=>{
 const input=`class StoryEventManagerV17{
  evidence(id,text=null){return recordEvidenceV17(id,text);}
}
if(!SAVE.story.people[personId])SAVE.story.people[personId]='known';
if(!o.story.people[personId])o.story.people[personId]='known';`;
 const out=patchStoryStaffRecognitionV151(input);
 assert.match(out,/recognizeStaffV151\(id\)/);
 assert.match(out,/SAVE\.story\.people\[id\]='traces';save\(\)/);
 assert.match(out,/if\(SAVE\.story\.people\[id\]\)return false/);
 assert.match(out,/SAVE\.story\.people\[personId\]==='traces'/);
 assert.match(out,/o\.story\.people\[personId\]==='traces'/);
 assert.throws(()=>patchStoryStaffRecognitionV151(input.replace('StoryEventManagerV17','Other')),/V17/);
 assert.throws(()=>patchStoryStaffRecognitionV151(out),/drift/);
 for(const id of ['jo','tessa','luis']){
  const entry=CHARACTERS_V17[id];
  assert.ok(entry.states.traces);
  assert.ok(entry.states.known);
  assert.doesNotMatch(entry.states.traces,/died|surviv|Last Shift|PCAS|Attendant|roster|body|falsif|override/i,
   'early inspection cannot reveal a later twist');
 }
 const game=readFileSync('game.js','utf8');
 assert.match(game,/unifiedSource=patchStoryStaffRecognitionV151\(unifiedSource\)/);
 assert.match(game,/installChapter1StaffBelongingsV150\(args\.game\);\s*installChapter1StaffInspectionV151\(args\.game\);/);
 const v17=readFileSync('patches/story-foundation-v17.js.txt','utf8');
 assert.match(v17,/class StoryEventManagerV17/);
 assert.match(v17,/SAVE\.story\.people\[personId\]/);
});
function fakeDom(){
 const nodes=new Map();
 const node=()=>({
  style:{display:'none'},dataset:{},classList:{add(){},remove(){}},
  children:[],textContent:'',setAttribute(){},
  replaceChildren(){this.children=[];this.textContent='';},
  append(child){this.children.push(child);this.textContent+=child.textContent;}
 });
 const hint=node();hint.style.display='block';nodes.set('hint',hint);
 return {getElementById:id=>nodes.get(id)||null,createElement:()=>node(),
  body:{append(el){nodes.set(el.id,el);}},nodes};
}
test('original source E has strict priority; real original paper gaze records People only once',()=>{
 const prior=globalThis.document;
 const doc=fakeDom();globalThis.document=doc;
 try{
  const group=new THREE.Group();
  const site=STAFF_BELONGINGS_V150[0];
  const root=new THREE.Group();
  root.name='v150_physical_staff_belonging_'+site.id;
  root.userData={staffBelongingV150:true};
  const paper=new THREE.Mesh(new THREE.PlaneGeometry(site.width,site.depth),
   new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
  paper.rotation.x=-Math.PI/2;paper.name=site.id+'_print';root.add(paper);
  root.position.set(0,.8,-2);
  group.add(root);
  const camera=new THREE.PerspectiveCamera(70,1440/900,.01,250);
  camera.position.set(0,1.7,0);camera.lookAt(0,.8,-2);
  camera.updateWorldMatrix(true,true);
  const people={},stats={originalCalls:0,journalBuilds:0};
  const source={userData:{type:'breaker',id:'A'}};
  const game={
   levelIndex:0,running:true,modal:false,dead:false,won:false,
   playerHidden:false,hideTransition:null,time:12,interactTarget:null,
   forceSource:null,mallV70:{group},
   mallLayoutV70:{roomAt:()=>site.room},
   __chapter1StaffBelongingsV150:{},controls:{yaw:{position:camera.position}},
   camera,storyV17:{
    recognizeStaffV151(id){if(people[id])return false;people[id]='traces';return true;},
    staffRecognitionStateV151:id=>people[id]||null
   },
   updateInteraction(){
    this.interactTarget=this.forceSource;
    const hint=doc.getElementById('hint');
    hint.textContent=this.forceSource?'E  Restore circuit A':'';
   },
   interact(){stats.originalCalls++;return 'real source E';},
   resetState(){this.running=false;},
   rebuildJournal(){stats.journalBuilds++;}
  };
  const api=installChapter1StaffInspectionV151(game);
  assert.equal(installChapter1StaffInspectionV151(game),api);
  game.forceSource=source;
  game.updateInteraction();
  assert.equal(api.getState().focusedId,null);
  assert.equal(game.interact(),'real source E');
  assert.equal(stats.originalCalls,1);
  assert.equal(people.jo,undefined,'paper must never displace an original breaker');
  game.forceSource=null;game.updateInteraction();
  assert.equal(api.getState().focusedId,site.id);
  assert.equal(api.getState().focusedMesh,site.id+'_print');
  assert.match(doc.getElementById('hint').textContent,/E  Examine/);
  game.interact();
  assert.equal(people.jo,'traces');
  assert.equal(stats.journalBuilds,1);
  assert.equal(api.getState().inspections,1);
  assert.equal(api.getState().cardVisible,true);
  assert.match(api.getState().cardText,/PEOPLE/);
  game.interact();
  assert.equal(people.jo,'traces');
  assert.equal(stats.journalBuilds,2);
  game.levelIndex=1;
  game.updateInteraction();
  assert.equal(api.getState().focusedId,null);
  assert.equal(game.interact(),'real source E');
  game.levelIndex=0;game.resetState();
  assert.equal(api.getState().cardVisible,false);
  assert.equal(api.getState().inspections,0);
  assert.equal(people.jo,'traces','real saved People recognition not erased on restart');
  assert.equal(stats.originalCalls,2);
 }finally{if(prior===undefined)delete globalThis.document;else globalThis.document=prior;}
});
test('no second collection/save, key listener, remote assets or LS evidence in inspector',()=>{
 const source=readFileSync('mall/chapter1-staff-inspection-v151.js','utf8');
 assert.doesNotMatch(source,/\.interactables\.push\(|\.colliders\.push\(|localStorage|indexedDB|new Audio\(|https?:\/\/|addEventListener\(['"]keydown|recordEvidence|\bSAVE\./);
 assert.match(source,/if\(this\.interactTarget\|\|!possible\(\)\)return originalInteract\.apply/);
 assert.match(source,/const target=select\(\)/);
 assert.match(source,/this\.storyV17\.recognizeStaffV151\(id\)/);
 assert.match(source,/this\.rebuildJournal\(\)/);
 assert.match(source,/const result=priorReset\.apply\(this,args\)/);
});
