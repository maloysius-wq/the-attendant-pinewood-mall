/** Validated reversible Pinewood Builder v1 authoring state; no campaign save side effects. */
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {EDITOR_EXTRA_FIXTURES_V1} from './editor-baseline-v1.mjs';
import {MALL} from './masterplan-v66.mjs';
import {ROOM_FINISH_IDS_V87} from '../builder/room-finishes-options-v87.mjs';
const LEGACY=new Set([...FURNISHINGS_V69.fixtures.map(f=>f.id),...EDITOR_EXTRA_FIXTURES_V1.map(f=>f.id),'atrium_dry_fountain']);
const ID=/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;
const ROOM_IDS=new Set(MALL.rooms.map(r=>r.id));
const vector=v=>v&&typeof v==='object'&&!Array.isArray(v)&&
 ['x','y','z'].every(k=>typeof v[k]==='number'&&Number.isFinite(v[k])&&Math.abs(v[k])<=1000);
const scale=v=>typeof v==='number'&&Number.isFinite(v)&&v>=.05&&v<=20;
const copy=value=>JSON.parse(JSON.stringify(value));
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);

export function createEmptyDraft(){
 return {version:1,baseMapVersion:69,added:[],overrides:{},deleted:[],doors:{},surfaces:{}};
}
export function validateDraft(draft,catalog){
 const errors=[];
 if(!draft||typeof draft!=='object'||Array.isArray(draft))return ['Layout must be an object'];
 if(draft.version!==1)errors.push('Unsupported layout schema');
 if(draft.baseMapVersion!==69)errors.push('Wrong canonical mall base');
 if(!Array.isArray(draft.added))errors.push('Added must be an array');
 if(!Array.isArray(draft.deleted))errors.push('Deleted must be an array');
 if(!draft.overrides||typeof draft.overrides!=='object'||Array.isArray(draft.overrides))errors.push('Overrides must be a map');
 if(!draft.doors||typeof draft.doors!=='object'||Array.isArray(draft.doors))errors.push('Doors must be a map');
 if(errors.length)return errors;
 const allowed=new Set((catalog||[]).map(x=>x.id));
 const assetById=new Map((catalog||[]).map(x=>[x.id,x]));
 const ids=new Set(LEGACY);
 for(const a of draft.added){
  if(!a||typeof a!=='object'){errors.push('Invalid placed object');continue;}
  if(typeof a.id!=='string'||!ID.test(a.id)||ids.has(a.id))errors.push('Duplicate/unsafe placed object ID '+a.id);
  ids.add(a.id);
  if(!allowed.has(a.catalogId))errors.push('Unknown/unlicensed catalog model '+a.catalogId);
  if(!vector(a.position)||!vector(a.rotation)||!scale(a.scale))errors.push('Invalid placed transform '+a.id);
  if(has(a,'opacity')&&(
   assetById.get(a.catalogId)?.kind!=='surface-decal'||
   typeof a.opacity!=='number'||!Number.isFinite(a.opacity)||a.opacity<.08||a.opacity>1
  ))errors.push('Invalid decal opacity '+a.id);
 }
 const deleted=new Set();
 for(const id of draft.deleted){
  if(typeof id!=='string'||!LEGACY.has(id)||deleted.has(id))errors.push('Invalid/deleted baseline ID '+id);
  deleted.add(id);
 }
 for(const [id,override] of Object.entries(draft.overrides)){
  if(!LEGACY.has(id)||!ID.test(id)||!override||typeof override!=='object'||Array.isArray(override)){
   errors.push('Unsafe baseline override '+id);continue;
  }
  if(has(override,'position')&&!vector(override.position))errors.push('Invalid baseline position '+id);
  if(has(override,'rotation')&&!vector(override.rotation))errors.push('Invalid baseline rotation '+id);
  if(has(override,'scale')&&!scale(override.scale))errors.push('Invalid baseline scale '+id);
 }
 if(draft.surfaces!==undefined){
  if(!draft.surfaces||typeof draft.surfaces!=='object'||Array.isArray(draft.surfaces))
   errors.push('Room finishes must be a map');
  else for(const [roomId,parts] of Object.entries(draft.surfaces)){
   if(!ROOM_IDS.has(roomId)||!parts||typeof parts!=='object'||Array.isArray(parts)){
    errors.push('Unknown room finish '+roomId);continue;
   }
   for(const [part,finishId] of Object.entries(parts)){
    if(!ROOM_FINISH_IDS_V87[part]?.has(finishId))errors.push('Unsupported room '+part+' finish in '+roomId);
   }
  }
 }
 for(const [id,open] of Object.entries(draft.doors)){
  if(!ID.test(id)||typeof open!=='boolean')errors.push('Invalid door display state '+id);
 }
 return errors;
}
export function reduceDraft(draft,action){
 if(!draft||!action||typeof action.type!=='string')throw TypeError('Invalid editor action');
 const next=copy(draft),id=action.id;
 switch(action.type){
  case 'place': {
   const obj=copy(action.instance);
   if(!ID.test(obj.id)||LEGACY.has(obj.id)||next.added.some(a=>a.id===obj.id))throw Error('Duplicate or unsafe instance ID');
   next.added.push(obj);break;
  }
  case 'transform': {
   const update={};
   for(const k of ['position','rotation','scale','opacity'])if(has(action,k))update[k]=copy(action[k]);
   const instance=next.added.find(a=>a.id===id);
   if(instance)Object.assign(instance,update);
   else if(LEGACY.has(id))next.overrides[id]={...(next.overrides[id]||{}),...update};
   else throw Error('Unknown editor object '+id);
   break;
  }
  case 'delete': {
   const index=next.added.findIndex(a=>a.id===id);
   if(index>=0)next.added.splice(index,1);
   else if(LEGACY.has(id)&&!next.deleted.includes(id))next.deleted.push(id);
   else if(!LEGACY.has(id))throw Error('Unknown editor object '+id);
   break;
  }
  case 'restore':
   if(!LEGACY.has(id))throw Error('Unknown baseline fixture '+id);
   next.deleted=next.deleted.filter(x=>x!==id);break;
  case 'door':
   if(typeof action.open!=='boolean'||typeof id!=='string'||!ID.test(id))throw Error('Invalid door operation');
   next.doors[id]=action.open;break;
  case 'finishes': {
   const {roomId,finishes}=action;
   if(!ROOM_IDS.has(roomId)||!finishes||typeof finishes!=='object')throw Error('Invalid room finishes');
   if(Object.keys(finishes).some(part=>!ROOM_FINISH_IDS_V87[part]?.has(finishes[part])))
    throw Error('Unsupported room finish');
   if(!next.surfaces)next.surfaces={};
   const selected={...next.surfaces[roomId]};
   for(const [part,finishId] of Object.entries(finishes)){
    if(finishId==='original')delete selected[part];else selected[part]=finishId;
   }
   if(Object.keys(selected).length)next.surfaces[roomId]=selected;
   else delete next.surfaces[roomId];
   break;
  }
  case 'finish': {
   const {roomId,part,finishId}=action;
   if(!ROOM_IDS.has(roomId)||!ROOM_FINISH_IDS_V87[part]?.has(finishId))
    throw Error('Unsupported room finish');
   if(!next.surfaces)next.surfaces={}; // backwards compatible with v1 exports
   if(finishId==='original'){
    if(next.surfaces[roomId]){
     delete next.surfaces[roomId][part];
     if(!Object.keys(next.surfaces[roomId]).length)delete next.surfaces[roomId];
    }
   }else next.surfaces[roomId]={...(next.surfaces[roomId]||{}),[part]:finishId};
   break;
  }
  case 'replace':
   return copy(action.draft);
  case 'clear':
   return createEmptyDraft();
  default:throw Error('Unknown editor action '+action.type);
 }
 return next;
}
export function exportDraft(draft){
 return JSON.stringify(draft,null,2)+'\n';
}
export function importDraft(json,catalog){
 const parsed=JSON.parse(json);
 const errors=validateDraft(parsed,catalog);
 if(errors.length)throw Error('Rejected Pinewood layout: '+errors.join('; '));
 return copy(parsed);
}
