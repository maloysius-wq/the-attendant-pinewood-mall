import test from 'node:test';
import assert from 'node:assert/strict';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {EDITOR_CATALOG_V1} from '../mall/editor-catalog-v1.mjs';
import {createEmptyDraft,exportDraft} from '../mall/editor-schema-v1.mjs';
import {prepareApprovedLayout,applyApprovedLayout} from '../mall/editor-overlay-v1.mjs';

const vector=(x=0,y=0,z=0)=>({x,y,z,set(a,b,c){this.x=a;this.y=b;this.z=c}});
const fixture=name=>({name,visible:true,position:vector(),rotation:vector(),scale:{x:1,y:1,z:1,setScalar(v){this.x=this.y=this.z=v}},parent:null,updateMatrixWorld(){}});
function world(){
 const nodes=new Map(FURNISHINGS_V69.fixtures.map(f=>['furnished_'+f.id,fixture('furnished_'+f.id)]));
 nodes.set('cc0_dry_fountain_art',fixture('cc0_dry_fountain_art'));
 const group={children:[],getObjectByName:n=>nodes.get(n),add:o=>{group.children.push(o);o.parent=group},remove:o=>{group.children.splice(group.children.indexOf(o),1);o.parent=null}};
 return {nodes,building:{group}};
}
test('approved-layout preparation validates catalog but never grants door/story state changes',()=>{
 const draft=createEmptyDraft();draft.doors.service_entry=true;
 draft.added.push({id:'approved-bench',catalogId:EDITOR_CATALOG_V1[0].id,position:{x:12,y:0,z:-70},rotation:{x:0,y:0,z:0},scale:1});
 const plan=prepareApprovedLayout(exportDraft(draft),EDITOR_CATALOG_V1);
 assert.equal(plan.added.length,1);
 assert.equal(plan.doors,undefined);
 const corrupt=structuredClone(draft);corrupt.added[0].catalogId='remote-malicious-model';
 assert.throws(()=>prepareApprovedLayout(exportDraft(corrupt),EDITOR_CATALOG_V1),/unlicensed/);
});
test('applying an approved authored layout changes decor, is opt-in and reversible',async()=>{
 const w=world(),draft=createEmptyDraft();const old=w.nodes.get('furnished_cassette_stool');
 draft.deleted.push('cassette_stool');
 draft.overrides.cassette_counter={position:{x:-22,y:0,z:-77},rotation:{x:0,y:0,z:0},scale:1.2};
 draft.added.push({id:'approved-bench',catalogId:EDITOR_CATALOG_V1[0].id,position:{x:4,y:0,z:-73},rotation:{x:0,y:0,z:0},scale:1});
 const plan=prepareApprovedLayout(exportDraft(draft),EDITOR_CATALOG_V1);
 let loads=0;
 const loadModel=async()=>{loads++;return fixture('fitted-model')};
 await assert.rejects(applyApprovedLayout({building:w.building,plan,loadModel}),/explicit owner approval/);
 assert.equal(loads,0);
 const patch=await applyApprovedLayout({building:w.building,plan,approved:true,loadModel});
 assert.equal(old.visible,false);
 assert.equal(w.nodes.get('furnished_cassette_counter').position.x,-22);
 assert.equal(w.nodes.get('cc0_dry_fountain_art').visible,false);
 assert.equal(w.building.group.children.length,2,'new model and authentic dry fountain');
 assert.equal(patch.addedCount,2);
 patch.revert();
 assert.equal(old.visible,true);assert.equal(w.nodes.get('furnished_cassette_counter').position.x,0);
 assert.equal(w.nodes.get('cc0_dry_fountain_art').visible,true);
 assert.equal(w.building.group.children.length,0);
});
test('failed GLB preload does not partially mutate campaign world',async()=>{
 const w=world();const draft=createEmptyDraft();draft.deleted.push('cassette_stool');
 const plan=prepareApprovedLayout(exportDraft(draft),EDITOR_CATALOG_V1);
 await assert.rejects(applyApprovedLayout({building:w.building,plan,approved:true,loadModel:async()=>{throw Error('missing pinned GLB')}}),/missing pinned GLB/);
 assert.equal(w.nodes.get('furnished_cassette_stool').visible,true);
});
