import * as THREE from '../vendor/three/build/three.module.js';
import {OrbitControls} from '../vendor/three/examples/jsm/controls/OrbitControls.js';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {EDITOR_CATALOG_V1,EDITOR_CATALOG_BY_ID} from '../mall/editor-catalog-v1.mjs';
import {createEmptyDraft,validateDraft,reduceDraft,importDraft,exportDraft} from '../mall/editor-schema-v1.mjs';
import {createBuilderScene} from './editor-scene.js';

const $=id=>document.getElementById(id);
const status={ready:false,errors:[],selected:null,roomCount:MALL.rooms.length,
 fixtureCount:FURNISHINGS_V69.fixtures.length,catalogCount:EDITOR_CATALOG_V1.length,
 draft:createEmptyDraft()};
let scene,camera,renderer,orbit,editor,frames=0,undoStack=[],redoStack=[],idCounter=0,savePending;
const clone=v=>JSON.parse(JSON.stringify(v)),round=v=>Math.round(v*1000)/1000;
const legacy=new Map(FURNISHINGS_V69.fixtures.map(f=>[f.id,f]));
const catalog=EDITOR_CATALOG_V1;
const API={
 ready:false,
 getState:()=>clone(status),
 getCatalog:()=>catalog.map(x=>({...x})),
 select:id=>editor?.select(id)??false,
 place:(catalogId,position,id)=>place(catalogId,position,id),
 applyTransform:changes=>changeTransform(changes),
 deleteSelected:()=>removeSelected(),
 undo:()=>undo(),
 redo:()=>redo(),
 save:()=>saveDraft(),
 exportJSON:()=>exportDraft(status.draft),
 importJSON:json=>importJSON(json),
 clearDraft:()=>clearDraft(),
 jumpRoom:id=>jumpRoom(id)
};
window.__PINEWOOD_BUILDER__=API;
const labels=id=>legacy.get(id)?.id.replace(/_/g,' ')||
 EDITOR_CATALOG_BY_ID.get(status.draft.added.find(a=>a.id===id)?.catalogId)?.label||id;
function indicate(msg){$('save-status').textContent=msg}
function writeInspector(id,p){
 status.selected=id;
 $('selection-name').textContent=id?labels(id):'Nothing selected';
 $('selection-meta').textContent=id?(legacy.has(id)?'Existing licensed mall fixture':'Placed custom model'):'Choose an existing fixture or place something from the catalog.';
 $('transform-fields').hidden=!id;
 if(!id||!p){refreshOutliner();return}
 for(const k of ['x','y','z']){
  $('pos-'+k).value=round(p.position[k]);
  $('rot-'+k).value=round(THREE.MathUtils.radToDeg(p.rotation[k]));
 }
 $('object-scale').value=round(p.scale);
 refreshOutliner();
}
function reflect(){
 $('draft-stats').textContent=status.draft.added.length+' placed · '+
  Object.keys(status.draft.overrides).length+' repositioned · '+
  status.draft.deleted.length+' removed';
 $('undo').disabled=undoStack.length===0;
 $('redo').disabled=redoStack.length===0;
 refreshOutliner();
}
function refreshOutliner(){
 const term=$('outliner-search').value.trim().toLowerCase();
 const parent=$('scene-outliner');parent.replaceChildren();
 if(!editor)return;
 for(const [id,o] of editor.objects){
  if(!o.visible||term&&!labels(id).toLowerCase().includes(term))continue;
  const b=document.createElement('button');b.type='button';
  b.textContent=labels(id);b.title=id;b.setAttribute('aria-current',String(id===status.selected));
  b.addEventListener('click',()=>editor.select(id));parent.append(b);
 }
}
function populateCatalog(){
 $('catalog-count').textContent=catalog.length+' STARTER PROPS';
 const groups=[...new Set(catalog.map(x=>x.category))].sort();
 for(const v of groups){
  const opt=document.createElement('option');opt.value=v;opt.textContent=v;$('catalog-category').append(opt);
 }
 function filter(){
  const term=$('catalog-search').value.trim().toLowerCase(),cat=$('catalog-category').value;
  const parent=$('catalog-list');parent.replaceChildren();
  for(const item of catalog){
   if(cat&&item.category!==cat)continue;
   if(term&&!(item.label+' '+item.category).toLowerCase().includes(term))continue;
   const b=document.createElement('button');b.className='catalog-item';b.type='button';
   const t=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');
   strong.textContent=item.label;small.textContent=item.category;t.append(strong,small);
   const plus=document.createElement('span');plus.className='plus';plus.textContent='＋';b.append(t,plus);
   b.title='Preview '+item.label+' in the world';
   b.addEventListener('click',async()=>{
    try{await editor.beginPlacement(item.id);
     $('placement-tip').textContent='PLACE '+item.label.toUpperCase()+' · Move mouse to position · Wheel for depth · Click to place · Esc to cancel';
    }catch(e){report(e)}
   });parent.append(b);
  }
 }
 $('catalog-search').addEventListener('input',filter);
 $('catalog-category').addEventListener('change',filter);
 filter();
}
function report(err){
 status.errors.push(String(err.message||err));
 console.error('PINEWOOD_BUILDER_ERROR',err);
 indicate('Error: '+String(err.message||err).slice(0,90));
}
function dbOpen(){
 return new Promise((resolve,reject)=>{
  const r=indexedDB.open('pinewood-builder-v1',1);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('drafts'))r.result.createObjectStore('drafts')};
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
 });
}
async function dbAction(mode,cb){
 const db=await dbOpen();
 try{
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction('drafts',mode),store=tx.objectStore('drafts');
   const request=cb(store);
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error);
   tx.onerror=()=>reject(tx.error);
  });
 }finally{db.close()}
}
async function saveDraft(){
 try{
  if(savePending)await savePending;
  savePending=dbAction('readwrite',store=>store.put(clone(status.draft),'pinewood-v69'));
  await savePending;
  indicate('Saved locally · '+new Date().toLocaleTimeString());
 }catch(err){report(err)}finally{savePending=null}
}
async function loadDraft(){
 const data=await dbAction('readonly',store=>store.get('pinewood-v69'));
 return data?importDraft(JSON.stringify(data),catalog):createEmptyDraft();
}
async function commit(action){
 const next=reduceDraft(status.draft,action),issues=validateDraft(next,catalog);
 if(issues.length)throw Error(issues.join('; '));
 undoStack.push(clone(status.draft));if(undoStack.length>100)undoStack.shift();
 redoStack=[];
 status.draft=next;
 await editor.applyDraft(next);
 if(status.selected&&editor.poseOf(status.selected))writeInspector(status.selected,editor.poseOf(status.selected));
 reflect();await saveDraft();
 return next;
}
function changeTransform(changes){
 const id=status.selected;if(!id)return Promise.resolve(false);
 return commit({type:'transform',id,...changes}).catch(report);
}
async function place(catalogId,position,id){
 if(!EDITOR_CATALOG_BY_ID.has(catalogId))throw Error('Unknown catalog item '+catalogId);
 const instance={id:id||'custom-'+Date.now().toString(36)+'-'+(++idCounter).toString(36),
  catalogId,position:{x:position.x,y:position.y,z:position.z},
  rotation:{x:0,y:0,z:0},scale:1};
 await commit({type:'place',instance});
 editor.select(instance.id);
 $('placement-tip').textContent='Placed '+EDITOR_CATALOG_BY_ID.get(catalogId).label+' · Adjust with handles or inspector.';
 return instance.id;
}
async function removeSelected(){
 if(!status.selected)return false;
 const id=status.selected;await commit({type:'delete',id});editor.select(null);
 return true;
}
async function undo(){
 if(!undoStack.length)return false;
 redoStack.push(clone(status.draft));status.draft=undoStack.pop();
 await editor.applyDraft(status.draft);reflect();await saveDraft();return true;
}
async function redo(){
 if(!redoStack.length)return false;
 undoStack.push(clone(status.draft));status.draft=redoStack.pop();
 await editor.applyDraft(status.draft);reflect();await saveDraft();return true;
}
async function importJSON(json){
 const draft=importDraft(json,catalog);
 await commit({type:'replace',draft});
 editor.select(null);indicate('Imported and saved locally');return true;
}
async function clearDraft(){
 await commit({type:'clear'});editor.select(null);return true;
}
function jumpRoom(id){
 const room=MALL.rooms.find(x=>x.id===id);
 if(!room||!camera||!orbit)return false;
 const level=MALL.levels.find(x=>x.id===room.level),x=(room.x1+room.x2)/2,z=(room.z1+room.z2)/2;
 const eyeY=level.y+Math.min(room.level==='M1'?6.8:4.7,room.level==='B1'?3.3:5.5);
 camera.position.set(x+Math.max(3,(room.x2-room.x1)*.4),eyeY,z+Math.max(4,(room.z2-room.z1)*.4));
 orbit.target.set(x,level.y+1.35,z);camera.lookAt(orbit.target);orbit.update();
 $('view-status').textContent=room.label+' / '+room.level;return true;
}
function updateFromInputs(){
 if(!status.selected)return;
 const p=editor.poseOf(status.selected);if(!p)return;
 for(const axis of ['x','y','z']){
  p.position[axis]=Number($('pos-'+axis).value);
  p.rotation[axis]=THREE.MathUtils.degToRad(Number($('rot-'+axis).value));
 }
 p.scale=Number($('object-scale').value);
 changeTransform(p);
}
function wireUI(){
 for(const id of ['pos-x','pos-y','pos-z','rot-x','rot-y','rot-z','object-scale'])
  $(id).addEventListener('change',updateFromInputs);
 const modes=[['translate','translate'],['rotate','rotate'],['resize-object','scale']];
 for(const [button,mode] of modes)$(button).addEventListener('click',()=>{
  editor.setTransformMode(mode);
  for(const [b] of modes)$(b).classList.toggle('active',b===button);
 });
 $('delete-selected').addEventListener('click',()=>removeSelected().catch(report));
 $('duplicate').addEventListener('click',async()=>{
  const id=status.selected;if(!id)return;
  const old=status.draft.added.find(a=>a.id===id);
  const f=legacy.get(id);
  const item=old?EDITOR_CATALOG_BY_ID.get(old.catalogId):
   catalog.find(x=>x.path===f?.model);
  if(!item)return report(Error('This object cannot be duplicated from the licensed catalog'));
  const p=editor.poseOf(id),pos={...p.position,x:p.position.x+1};
  await place(item.id,pos);
 });
 $('undo').addEventListener('click',()=>undo().catch(report));
 $('redo').addEventListener('click',()=>redo().catch(report));
 $('save-draft').addEventListener('click',()=>saveDraft());
 $('export-draft').addEventListener('click',()=>{
  const blob=new Blob([API.exportJSON()],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='pinewood-world-layout-v1.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),3000);indicate('World layout exported');
 });
 $('import-file').addEventListener('change',async e=>{
  const f=e.target.files?.[0];if(!f)return;
  try{await importJSON(await f.text())}catch(err){report(err)}finally{e.target.value=''}
 });
 $('reset-draft').addEventListener('click',()=>{
  if(window.confirm('Discard all locally saved Pinewood Builder changes?'))clearDraft().catch(report);
 });
 $('roof').addEventListener('change',e=>editor.building.setRoofVisible(e.target.checked));
 $('reset-camera').addEventListener('click',centerCamera);
 $('outliner-search').addEventListener('input',refreshOutliner);
 for(const r of MALL.rooms){
  const o=document.createElement('option');o.value=r.id;o.textContent=r.label+' ('+r.level+')';$('jump-room').append(o);
 }
 $('jump-room').addEventListener('change',e=>{if(e.target.value)jumpRoom(e.target.value)});
 window.addEventListener('keydown',e=>{
  const active=document.activeElement?.tagName;
  if(['INPUT','TEXTAREA','SELECT'].includes(active))return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();(e.shiftKey?redo():undo()).catch(report)}
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo().catch(report)}
  else if(e.key==='Delete'&&!e.ctrlKey)removeSelected().catch(report);
  else if(e.key==='Escape'){editor.stopPlacement();$('placement-tip').textContent='Placement canceled · Choose an object to continue';}
  else if(['1','2','3'].includes(e.key))$(e.key==='1'?'translate':e.key==='2'?'rotate':'resize-object').click();
 });
}
function centerCamera(){
 camera.position.set(23,13,-40);orbit.target.set(0,1.4,-71);camera.lookAt(orbit.target);orbit.update();
 $('view-status').textContent='Central Gallery / Dry Fountain';
}
function resize(){
 const area=$('world'),w=Math.max(300,area.clientWidth),h=Math.max(300,area.clientHeight);
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
async function begin(){
 try{
  scene=new THREE.Scene();scene.background=new THREE.Color(0x0c1719);scene.fog=new THREE.FogExp2(0x10191b,.0045);
  camera=new THREE.PerspectiveCamera(68,1,.06,650);
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.14;$('world').append(renderer.domElement);
  orbit=new OrbitControls(camera,renderer.domElement);
  orbit.enableDamping=true;orbit.dampingFactor=.08;orbit.minDistance=1;orbit.maxDistance=260;
  resize();centerCamera();
  editor=await createBuilderScene({scene,camera,domElement:renderer.domElement,orbit,
   onSelect:(id,p)=>writeInspector(id,p),
   onTransform:(id,p)=>changeTransform(p).catch(report),
   onPlace:(catalogId,position)=>place(catalogId,position).catch(report)
  });
  $('loading').querySelector('progress').value=75;
  status.draft=await loadDraft();
  await editor.applyDraft(status.draft);
  populateCatalog();wireUI();reflect();
  editor.select(null);
  status.ready=true;API.ready=true;
  $('loading').classList.add('hidden');
  indicate('Ready · local draft loaded');
  function frame(){frames++;orbit.update();renderer.render(scene,camera);requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
  window.addEventListener('resize',resize);
  window.addEventListener('pagehide',()=>{editor.dispose();orbit.dispose();renderer.dispose()},{once:true});
 }catch(err){
  report(err);$('load-error').textContent=String(err?.stack||err).slice(0,1500);
  $('loading').querySelector('strong').textContent='Builder cannot load';
 }
}
begin();
