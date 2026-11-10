import * as THREE from '../vendor/three/build/three.module.js';
import {OrbitControls} from '../vendor/three/examples/jsm/controls/OrbitControls.js';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {EDITOR_EXTRA_FIXTURES_V1} from '../mall/editor-baseline-v1.mjs';
import {EDITOR_CATALOG_V1,EDITOR_CATALOG_BY_ID,registerVendorCatalog} from '../mall/editor-catalog-v1.mjs';
import {createEmptyDraft,validateDraft,reduceDraft,importDraft,exportDraft} from '../mall/editor-schema-v1.mjs';
import {createBuilderScene} from './editor-scene.js';
import {createEditorNavigation} from './editor-navigation.js';
import {createWorkLighting} from './work-lighting.js';
import {mountCinematicParkingLot} from './exterior-scene.js';
import {createRoomFinishesV87} from './room-finishes-v87.js';
import {ROOM_FINISHES_V87} from './room-finishes-options-v87.mjs';

const $=id=>document.getElementById(id);
const status={ready:false,errors:[],selected:null,roomCount:MALL.rooms.length,
 fixtureCount:FURNISHINGS_V69.fixtures.length,catalogCount:EDITOR_CATALOG_V1.length,
 draft:createEmptyDraft(),navigation:{mode:'orbit',floor:'G',unlockAll:true},workLights:false,
 placementOptions:{gridSize:.5,allowClipping:false},finishMeshes:{floor:0,wall:0,ceiling:0}};
let scene,camera,renderer,orbit,editor,navigation,workLighting,exterior,roomFinishes,
 frames=0,undoStack=[],redoStack=[],idCounter=0,savePending;
const clone=v=>JSON.parse(JSON.stringify(v)),round=v=>Math.round(v*1000)/1000;
const legacy=new Map([...FURNISHINGS_V69.fixtures,...EDITOR_EXTRA_FIXTURES_V1].map(f=>[f.id,f]));
const catalog=[...EDITOR_CATALOG_V1];
async function loadVendorCatalog(){
 const [response,styleResponse,eraResponse]=await Promise.all([
  fetch(new URL('../assets/vendor/builder/catalog-v1.json',import.meta.url)),
  fetch(new URL('../assets/vendor/builder/material-index-v1.json',import.meta.url)),
  fetch(new URL('../assets/vendor/builder/era-catalog-v87.json',import.meta.url))
 ]);
 if(!response.ok)throw Error('Pinned CC0 asset library unavailable: HTTP '+response.status);
 if(!styleResponse.ok)throw Error('Pinned CC0 material index unavailable: HTTP '+styleResponse.status);
 if(!eraResponse.ok)throw Error('Pinned period-correct CRT/debris library unavailable: HTTP '+eraResponse.status);
 const manifest=await response.json(),styleIndex=await styleResponse.json();
 if(manifest.version!==1||!Array.isArray(manifest.models)||manifest.models.length<100)throw Error('Incomplete local CC0 library');
 if(styleIndex.version!==1||styleIndex.totalModels!==manifest.models.length||!Array.isArray(styleIndex.imageBearingIds))throw Error('Outdated CC0 material classification');
 if(styleIndex.existingTotalModels!==catalog.length||!Array.isArray(styleIndex.existingImageBearingIds))throw Error('Outdated original-fixture classification');
 const existingImages=new Set(styleIndex.existingImageBearingIds),existingIds=new Set(catalog.map(m=>m.id));
 if(existingImages.size!==styleIndex.existingImageBearingIds.length||[...existingImages].some(id=>!existingIds.has(id)))throw Error('Invalid original-fixture classification');
 for(let i=0;i<catalog.length;i++){
  catalog[i]={...catalog[i],materialStyle:existingImages.has(catalog[i].id)?'image-mapped':'color-only'};
 }
 const images=new Set(styleIndex.imageBearingIds),validIds=new Set(manifest.models.map(m=>m.id));
 if(images.size!==styleIndex.imageBearingIds.length||[...images].some(id=>!validIds.has(id)))throw Error('Invalid CC0 material classification');
 catalog.push(...registerVendorCatalog(manifest.models.map(m=>({
  ...m,materialStyle:images.has(m.id)?'image-mapped':'color-only'
 }))));
 const era=await eraResponse.json();
 if(era.version!==87||!Array.isArray(era.models)||era.models.length!==8)
  throw Error('Outdated period-correct source model catalog');
 catalog.push(...registerVendorCatalog(era.models));
 status.catalogCount=catalog.length;
}

const API={
 ready:false,
 getState:()=>clone(status),
 getCatalog:()=>catalog.map(x=>({...x})),
 getMaterialStats:()=>editor?.getMaterialStats()??null,
 inspectObjectMaterials:id=>editor?.inspectObjectMaterials(id)??null,
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
 toggleFly:()=>navigation?.toggleFly(),
 getNavigationState:()=>navigation?.getState(),
 getRoofState:()=>editor?({
  roofVisible:editor.building.roofs.visible,
  ceilingsVisible:editor.building.ceilings.visible,
  atriumSkylightPresent:!!editor.building.roofs.getObjectByName('atrium-skylight',true)
 }):null,
 getLightingState:()=>workLighting?.getState(),
 getExteriorState:()=>exterior?.state,
 getPlacementState:()=>({placing:editor?.placing||false,
  loading:editor?.placementPending||false,...(editor?.placementValidity||{}),
  position:editor?.placementPosition||null,rotation:editor?.placementRotation||null,
  pointerLocked:document.pointerLockElement===renderer?.domElement,
  ...status.placementOptions}),
 waitForWheelEdits:()=>editor?.waitForWheelEdits()??Promise.resolve(),
 getCameraPose:()=>camera?({
  position:{x:camera.position.x,y:camera.position.y,z:camera.position.z},
  rotation:{x:camera.rotation.x,y:camera.rotation.y,z:camera.rotation.z}
 }):null,
 setPlacementOptions:options=>setPlacementOptions(options),
 getRoomFinishCounts:()=>roomFinishes?.getCounts(),
 getRoomWallPlan:id=>roomFinishes?.getWallPlans(id)||[],
 getRoomFinishes:()=>clone(status.draft.surfaces||{}),
 applyRoomFinishes:(roomId,finishes)=>commit({type:'finishes',roomId,finishes}),
 jumpParkingLot:()=>jumpParkingLot(),
 setWorkLights:enabled=>setWorkLights(enabled),
 setDoorOpen:(id,open)=>setDoorOpen(id,open),
 jumpRoom:id=>jumpRoom(id)
};
window.__PINEWOOD_BUILDER__=API;
const labels=id=>id==='atrium_dry_fountain'?'Silted Atrium Fountain':legacy.get(id)?.id.replace(/_/g,' ')||
 EDITOR_CATALOG_BY_ID.get(status.draft.added.find(a=>a.id===id)?.catalogId)?.label||id;
function indicate(msg){$('save-status').textContent=msg}
function writeInspector(id,p){
 status.selected=id;
 $('selection-name').textContent=id?labels(id):'Nothing selected';
 const placed=status.draft.added.find(a=>a.id===id);
 const surface=placed?EDITOR_CATALOG_BY_ID.get(placed.catalogId)?.materialStyle:null;
 $('selection-meta').textContent=id?(legacy.has(id)?'Existing licensed mall fixture':'Placed custom model')+
  (surface==='color-only'?' · Color-only source with material-aware Builder texturing':surface==='image-mapped'?' · Original model includes embedded image maps':''):'Choose an existing fixture or place something from the catalog.';
 $('transform-fields').hidden=!id;
 if(!id||!p){refreshOutliner();return}
 $('placement-tip').textContent='Selected '+labels(id)+' · Wheel rotates 15° · Shift+wheel zooms camera · Drag handles for precise placement';
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
 $('catalog-count').textContent=catalog.length+' VERIFIED PROPS';
 const groups=[...new Set(catalog.map(x=>x.category))].sort();
 for(const v of groups){
  const opt=document.createElement('option');opt.value=v;opt.textContent=v;$('catalog-category').append(opt);
 }
 function filter(){
  const term=$('catalog-search').value.trim().toLowerCase(),cat=$('catalog-category').value,
  condition=$('catalog-condition').value,material=$('catalog-material').value;
  const parent=$('catalog-list');parent.replaceChildren();
  for(const item of catalog){
   // Retire the Kenney flat LCD from NEW placement choices; saved drafts
   // using its ID remain compatible and render with the true source CRT.
   if(item.id==='kenney-furniture-kit-computerscreen')continue;
   if(cat&&item.category!==cat)continue;
   if(condition&&item.condition!==condition)continue;
   if(material&&item.materialStyle!==material)continue;
   if(term&&!(item.label+' '+item.category+' '+(item.condition||'')).toLowerCase().includes(term))continue;
   const b=document.createElement('button');b.className='catalog-item';b.type='button';
   if(item.thumb){const preview=document.createElement('img');preview.className='asset-thumb';preview.loading='lazy';preview.alt='';preview.src=new URL('../'+item.thumb,import.meta.url).href;b.append(preview)}
   const t=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');
   const materialLabel=item.materialStyle==='image-mapped'?' · image maps':item.materialStyle==='color-only'?' · enhanced materials':'';
   strong.textContent=item.label;small.textContent=item.category+(item.condition==='weathered'?' · weathered':'')+materialLabel;t.append(strong,small);
   const plus=document.createElement('span');plus.className='plus';plus.textContent='＋';b.append(t,plus);
   b.title='Preview '+item.label+' in the world'+(item.materialStyle==='color-only'?' · Original CC0 source uses flat colors; compatible surfaces are textured in the Builder':item.materialStyle==='image-mapped'?' · Includes embedded image maps':'');
   b.addEventListener('click',async()=>{
    try{
     $('placement-tip').textContent='Loading '+item.label+' · Wheel will rotate the preview';
     await editor.beginPlacement(item.id);
     if(!editor.placing)return; // superseded by another selection
     $('placement-tip').textContent='PLACE '+item.label.toUpperCase()+' · Move mouse to position · Wheel rotate · Shift+wheel distance · Click to place · Esc to cancel'+(item.materialStyle==='color-only'?' · Builder adds textures to compatible material groups':'');
    }catch(e){report(e)}
   });parent.append(b);
  }
 }
 $('catalog-search').addEventListener('input',filter);
 $('catalog-category').addEventListener('change',filter);
 $('catalog-condition').addEventListener('change',filter);
 $('catalog-material').addEventListener('change',filter);
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
async function applyRenderedDraft(draft){
 await editor.applyDraft(draft);
 if(roomFinishes)status.finishMeshes=await roomFinishes.apply(draft.surfaces||{});
 if(navigation)navigation.resetDoorOverrides(draft.doors);
 syncFinishInputs();
}
async function commit(action){
 const next=reduceDraft(status.draft,action),issues=validateDraft(next,catalog);
 if(issues.length)throw Error(issues.join('; '));
 undoStack.push(clone(status.draft));if(undoStack.length>100)undoStack.shift();
 redoStack=[];
 status.draft=next;
 await applyRenderedDraft(next);
 if(status.selected&&editor.poseOf(status.selected))writeInspector(status.selected,editor.poseOf(status.selected));
 reflect();await saveDraft();
 return next;
}
async function changeTransform(changes){
 const id=status.selected;if(!id)return false;
 const original=editor.poseOf(id);
 const check=editor.validatePose(id,{...original,...changes});
 if(!check.valid){
  await applyRenderedDraft(status.draft);
  indicate('Blocked: '+check.reason);
  return false;
 }
 return commit({type:'transform',id,...changes}).catch(report);
}
async function place(catalogId,position,id,rotation={x:0,y:0,z:0}){
 if(!EDITOR_CATALOG_BY_ID.has(catalogId))throw Error('Unknown catalog item '+catalogId);
 const check=await editor.validateNewPlacement(catalogId,position,rotation);
 if(!check.valid)throw Error(check.reason);
 const instance={id:id||'custom-'+Date.now().toString(36)+'-'+(++idCounter).toString(36),
  catalogId,position:{x:position.x,y:position.y,z:position.z},
  rotation:{x:rotation.x,y:rotation.y,z:rotation.z},scale:1};
 await commit({type:'place',instance});
 editor.select(instance.id);
 $('placement-tip').textContent='Placed '+EDITOR_CATALOG_BY_ID.get(catalogId).label+' · Wheel rotates 15° · Shift+wheel zooms camera';
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
 await applyRenderedDraft(status.draft);reflect();await saveDraft();return true;
}
async function redo(){
 if(!redoStack.length)return false;
 undoStack.push(clone(status.draft));status.draft=redoStack.pop();
 await applyRenderedDraft(status.draft);reflect();await saveDraft();return true;
}
async function importJSON(json){
 const draft=importDraft(json,catalog);
 await commit({type:'replace',draft});
 editor.select(null);indicate('Imported and saved locally');return true;
}
async function setDoorOpen(id,open){
 if(!navigation)throw Error('Editor navigation not loaded');
 if(!navigation.getDoorList().some(d=>d.id===id))throw Error('Unknown physical door '+id);
 await commit({type:'door',id,open:!!open});navigation.setDoorOpen(id,!!open);
 return true;
}
async function clearDraft(){
 await commit({type:'clear'});editor.select(null);return true;
}
function jumpRoom(id){
 if(navigation){const room=MALL.rooms.find(x=>x.id===id);const done=navigation.gotoRoom(id);
  if(room){$('view-status').textContent=room.label+' / '+room.level;
   $('finish-room').value=room.id;syncFinishInputs();}
  status.navigation=navigation.getState();return done;}
 const room=MALL.rooms.find(x=>x.id===id);
 if(!room||!camera||!orbit)return false;
 const level=MALL.levels.find(x=>x.id===room.level),x=(room.x1+room.x2)/2,z=(room.z1+room.z2)/2;
 const eyeY=level.y+Math.min(room.level==='M1'?6.8:4.7,room.level==='B1'?3.3:5.5);
 camera.position.set(x+Math.max(3,(room.x2-room.x1)*.4),eyeY,z+Math.max(4,(room.z2-room.z1)*.4));
 orbit.target.set(x,level.y+1.35,z);camera.lookAt(orbit.target);orbit.update();
 $('view-status').textContent=room.label+' / '+room.level;return true;
}
function jumpParkingLot(){
 if(!navigation)return false;
 const moved=navigation.gotoParkingLot();
 $('view-status').textContent='Cinematic Parking Lot / Exterior';
 $('jump-room').value='__parking_lot__';
 status.navigation=navigation.getState();
 return moved;
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
function setPlacementOptions(options={}){
 if(!editor)return null;
 const next=editor.setPlacementOptions(options);
 status.placementOptions={gridSize:next.gridSize,allowClipping:next.allowClipping};
 $('snap-grid').checked=next.gridSize>0;
 if(next.gridSize)$('grid-size').value=String(next.gridSize);
 $('allow-clipping').checked=next.allowClipping;
 return next;
}
function syncFinishInputs(){
 if(!roomFinishes||!$('finish-room'))return;
 const id=$('finish-room').value,selection=status.draft.surfaces?.[id]||{};
 for(const part of ['wall','floor','ceiling']){
  const select=$('finish-'+part);
  select.value=selection[part]||'original';
  select.disabled=!id||(part==='ceiling'&&!roomFinishes.counts(id)?.ceiling);
 }
 $('finish-apply').disabled=!id;
}
function setWorkLights(enabled){
 if(!workLighting)return null;
 const state=workLighting.setEnabled(enabled);
 status.workLights=state.enabled;
 $('work-lights').checked=state.enabled;
 return state;
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
  const item=old?EDITOR_CATALOG_BY_ID.get(old.catalogId):id==='atrium_dry_fountain'?
   EDITOR_CATALOG_BY_ID.get('silted-octagonal-atrium-fountain'):catalog.find(x=>x.path===f?.model);
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
 $('work-lights').addEventListener('change',e=>setWorkLights(e.target.checked));
 $('snap-grid').addEventListener('change',e=>setPlacementOptions({
  gridSize:e.target.checked?Number($('grid-size').value):0,
  overlap:$('allow-clipping').checked
 }));
 $('grid-size').addEventListener('change',()=>setPlacementOptions({
  gridSize:$('snap-grid').checked?Number($('grid-size').value):0,
  overlap:$('allow-clipping').checked
 }));
 $('allow-clipping').addEventListener('change',e=>setPlacementOptions({
  gridSize:$('snap-grid').checked?Number($('grid-size').value):0,
  overlap:e.target.checked
 }));
 for(const room of MALL.rooms){
  const option=document.createElement('option');
  option.value=room.id;option.textContent=room.label+' ('+room.level+')';
  $('finish-room').append(option);
 }
 for(const part of ['wall','floor','ceiling']){
  for(const item of ROOM_FINISHES_V87[part]){
   const option=document.createElement('option');
   option.value=item.id;option.textContent=item.label;
   $('finish-'+part).append(option);
  }
 }
 $('finish-room').addEventListener('change',syncFinishInputs);
 $('finish-apply').addEventListener('click',async()=>{
  const roomId=$('finish-room').value;if(!roomId)return;
  const finishes=Object.fromEntries(['wall','floor','ceiling'].filter(
   part=>!$('finish-'+part).disabled
  ).map(part=>[part,$('finish-'+part).value]));
  try{await commit({type:'finishes',roomId,finishes});
   indicate('Applied finishes to '+MALL.rooms.find(r=>r.id===roomId).label);
  }catch(err){report(err)}
 });
 syncFinishInputs();
 $('reset-camera').addEventListener('click',centerCamera);
 $('explore-mode').addEventListener('click',()=>{
  navigation.setMode(navigation.getState().mode==='orbit'?'walk':'orbit');syncNavigationControls();
 });
 $('fly-toggle').addEventListener('click',()=>{navigation.toggleFly();syncNavigationControls()});
 for(const d of navigation.getDoorList()){
  const option=document.createElement('option');option.value=d.id;option.textContent=d.label;
  $('door-select').append(option);
 }
 $('door-select').value='service_entry';
 $('door-toggle').addEventListener('click',async()=>{
  const id=$('door-select').value;if(!id)return;
  try{await setDoorOpen(id,!navigation.getDoorState(id))}catch(e){report(e)}
 });
 $('unlock-doors').addEventListener('change',e=>{
  navigation.setUnlockAll(e.target.checked);editor.building.setChapter(e.target.checked?6:1);
 });
 $('outliner-search').addEventListener('input',refreshOutliner);
 for(const r of MALL.rooms){
  const o=document.createElement('option');o.value=r.id;o.textContent=r.label+' ('+r.level+')';$('jump-room').append(o);
 }
 const parkingOption=document.createElement('option');
 parkingOption.value='__parking_lot__';parkingOption.textContent='Parking Lot (Cinematic Exterior)';
 $('jump-room').prepend(parkingOption);
 $('jump-room').addEventListener('change',e=>{
  if(e.target.value==='__parking_lot__')jumpParkingLot();
  else if(e.target.value)jumpRoom(e.target.value);
 });
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
function syncNavigationControls(){
 if(!navigation)return;
 const next=navigation.getState();status.navigation=next;
 $('explore-mode').textContent=next.mode==='orbit'?'Explore':'Exit Explore';
 $('fly-toggle').disabled=next.mode==='orbit';
 $('fly-toggle').textContent=next.mode==='fly'?'Fly: On':'Fly: Off';
 if(editor?.placing)return;
 $('placement-tip').textContent=next.mode==='orbit'?
  'Orbit: drag · Pan: right-drag · Zoom: wheel · Select: click · Transform: handles or inspector':
  next.mode==='fly'?'FLY · WASD move · Mouse look · Space up · Shift down · F to land · E toggle nearby door':
  'EXPLORE · WASD walk · Mouse look · E toggle nearby door · F to fly · Esc releases cursor';
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
  renderer.toneMappingExposure=1.14;
  workLighting=createWorkLighting(scene,renderer);
  $('world').append(renderer.domElement);
  orbit=new OrbitControls(camera,renderer.domElement);
  orbit.enableDamping=true;orbit.dampingFactor=.08;orbit.minDistance=1;orbit.maxDistance=260;
  resize();centerCamera();
  await loadVendorCatalog();
  $('loading').querySelector('progress').value=30;
  editor=await createBuilderScene({scene,camera,domElement:renderer.domElement,orbit,
   canEdit:()=>true,
   onSelect:(id,p)=>writeInspector(id,p),
   onTransform:(id,p)=>changeTransform(p).catch(report),
   onPlace:(catalogId,position,rotation)=>place(catalogId,position,undefined,rotation).catch(report)
  });
  roomFinishes=createRoomFinishesV87(editor.building);
  exterior=await mountCinematicParkingLot({scene,building:editor.building});
  roomFinishes.setCinematicFrontWall(exterior.frontWall);
  editor.addPlacementSurfaces(exterior.placementSurfaces);
  $('loading').querySelector('progress').value=58;
  navigation=createEditorNavigation({camera,orbit,domElement:renderer.domElement,scene,shells:editor.building.shells,
   isPlacing:()=>editor?.placing||editor?.placementPending||false,
   isGizmoActive:()=>editor?.isGizmoActive||false,
   onChange:next=>{status.navigation=next;syncNavigationControls()},
   onDoorChange:(id,open)=>setDoorOpen(id,open).catch(report)});
  $('loading').querySelector('progress').value=75;
  status.draft=await loadDraft();
  await applyRenderedDraft(status.draft);
  populateCatalog();wireUI();reflect();syncNavigationControls();
  setPlacementOptions({gridSize:.5,overlap:false});
  const reticle=$('aim-reticle'),canvas=renderer.domElement;
  const repositionReticle=e=>{
   const bounds=canvas.getBoundingClientRect();
   if(document.pointerLockElement===canvas){
    reticle.style.left=(bounds.left-$('viewport').getBoundingClientRect().left+bounds.width/2)+'px';
    reticle.style.top=(bounds.top-$('viewport').getBoundingClientRect().top+bounds.height/2)+'px';
   }else if(e){
    const view=$('viewport').getBoundingClientRect();
    reticle.style.left=(e.clientX-view.left)+'px';
    reticle.style.top=(e.clientY-view.top)+'px';
   }
  };
  canvas.addEventListener('pointermove',repositionReticle);
  document.addEventListener('pointerlockchange',()=>repositionReticle());
  repositionReticle();
  editor.select(null);
  status.ready=true;API.ready=true;
  $('loading').classList.add('hidden');
  indicate('Ready · local draft loaded');
  let lastTime=performance.now();
  function frame(t){const dt=Math.min(.05,(t-lastTime)/1000);lastTime=t;frames++;
   navigation.update(dt);
   if(navigation.getState().mode==='orbit')orbit.update();
   else editor.refreshPlacement();
   renderer.render(scene,camera);requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
  window.addEventListener('resize',resize);
  window.addEventListener('pagehide',()=>{navigation.dispose();roomFinishes.dispose();editor.dispose();exterior.dispose();workLighting.dispose();orbit.dispose();renderer.dispose()},{once:true});
 }catch(err){
  report(err);$('load-error').textContent=String(err?.stack||err).slice(0,1500);
  $('loading').querySelector('strong').textContent='Builder cannot load';
 }
}
begin();
