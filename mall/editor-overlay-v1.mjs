/**
 * Optional, explicit owner-approved decor layer for the canonical Pinewood campaign.
 * No import, fetch, side effect or save migration happens merely by importing this module.
 * Use a separate verified loadModel(entry) that returns a fitted Three.js Group.
 */
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {EDITOR_EXTRA_FIXTURES_V1} from './editor-baseline-v1.mjs';
import {importDraft} from './editor-schema-v1.mjs';
const MODEL_PATH=/^assets\/vendor\/(?:runtime\/|builder\/models\/)[a-zA-Z0-9_./%-]+\.glb$/;
const FOUNTAIN=Object.freeze({
 id:'silted-octagonal-atrium-fountain',
 label:'Silted Ornamental Fountain Basin',
 category:'Fountains & Atrium',
 license:'CC0-1.0',
 path:'assets/vendor/builder/models/fountains/silted-octagonal-atrium-fountain.glb'
});
const LEGACY=new Set([...FURNISHINGS_V69.fixtures,...EDITOR_EXTRA_FIXTURES_V1].map(x=>x.id));
const EXTRA=new Set(EDITOR_EXTRA_FIXTURES_V1.map(x=>x.id));
const vector=v=>({x:v.x,y:v.y,z:v.z});
const pose=node=>({position:vector(node.position),rotation:vector(node.rotation),scale:node.scale.x,visible:node.visible});
const setPose=(node,p)=>{
 node.position.set(p.position.x,p.position.y,p.position.z);
 node.rotation.set(p.rotation.x,p.rotation.y,p.rotation.z);
 node.scale.setScalar(p.scale);node.updateMatrixWorld?.(true);
};
const defaultFountainPose=()=>({position:{x:0,y:.07,z:-71},rotation:{x:0,y:0,z:0},scale:2});
function safeModel(model){
 if(!model||!MODEL_PATH.test(model.path)||!model.id||/ShelfLarge|ShelfSmall|Shelf%20Large|Shelf%20Small/i.test(model.path))throw Error('Unsafe or unpinned model in approved layout');
 return model;
}
export function prepareApprovedLayout(json,catalog){
 const draft=importDraft(json,catalog);
 const byId=new Map(catalog.map(model=>[model.id,safeModel(model)]));
 const instances=draft.added.map(instance=>({
  ...instance,asset:safeModel(byId.get(instance.catalogId))
 }));
 const fountain=byId.get(FOUNTAIN.id)||FOUNTAIN;
 // The exported Builder doors describe *preview state only*: story door locks
 // and chapter gates must never be imported into campaign mode.
 return Object.freeze({
  version:1,baseMapVersion:69,
  added:instances,overrides:structuredClone(draft.overrides),
  deleted:[...draft.deleted],
  fountainAsset:safeModel(fountain),
  fountainPose:draft.overrides.atrium_dry_fountain||defaultFountainPose(),
  ownerReviewRequired:true
 });
}
export async function applyApprovedLayout({building,plan,approved=false,loadModel}){
 if(approved!==true)throw Error('The campaign requires explicit owner approval of this layout export');
 if(!plan||plan.version!==1||plan.baseMapVersion!==69||!plan.ownerReviewRequired)throw Error('Invalid reviewed layout');
 if(!building?.group?.getObjectByName||typeof loadModel!=='function')throw Error('Missing campaign renderer/loader');
 const baseline=new Map();
 for(const id of new Set([...plan.deleted,...Object.keys(plan.overrides).filter(x=>LEGACY.has(x))])){
  if(!LEGACY.has(id))throw Error('Unapproved campaign baseline ID '+id);
  const model=building.group.getObjectByName((EXTRA.has(id)?'cc0_':'furnished_')+id,true);
  if(!model)throw Error('Missing licensed campaign fixture '+id);
  baseline.set(id,model);
 }
 const oldFountain=building.group.getObjectByName('cc0_dry_fountain_art',true);
 if(!oldFountain)throw Error('Original fountain art missing; cannot safely replace');
 // Preload *all* new meshes before hiding/moving anything to avoid leaving
 // the playable campaign half-edited when a model is missing.
 const pending=[...plan.added.map(inst=>({id:inst.id,asset:inst.asset,transform:inst})),
  {id:'atrium_dry_fountain',asset:plan.fountainAsset,transform:plan.fountainPose}];
 const created=[];
 for(const item of pending){
  safeModel(item.asset);
  const object=await loadModel(item.asset);
  if(!object?.position?.set||!object?.rotation?.set||!object?.scale?.setScalar)throw Error('Model loader did not return a valid fitted scene object '+item.id);
  object.name='approved_decor_'+item.id;
  created.push({object,transform:item.transform});
 }
 const snapshots=new Map([...baseline].map(([id,object])=>[id,pose(object)]));
 const oldVisible=oldFountain.visible;
 try{
  for(const [id,object] of baseline){
   const override=plan.overrides[id];
   if(override){
    const current=pose(object);
    setPose(object,{position:override.position||current.position,rotation:override.rotation||current.rotation,scale:override.scale??current.scale});
   }
   if(plan.deleted.includes(id))object.visible=false;
  }
  oldFountain.visible=false;
  for(const {object,transform} of created){
   setPose(object,{position:transform.position,rotation:transform.rotation,scale:transform.scale});
   building.group.add(object);
  }
 }catch(error){
  for(const {object} of created)if(object.parent)building.group.remove(object);
  for(const [id,object] of baseline){setPose(object,snapshots.get(id));object.visible=snapshots.get(id).visible}
  oldFountain.visible=oldVisible;
  throw error;
 }
 let active=true;
 return {addedCount:created.length,revert(){
  if(!active)return;
  active=false;
  for(const {object} of created)if(object.parent)building.group.remove(object);
  for(const [id,object] of baseline){setPose(object,snapshots.get(id));object.visible=snapshots.get(id).visible}
  oldFountain.visible=oldVisible;
 }};
}
