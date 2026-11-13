/** V111 shared authored mall layer.
 * The Builder, opening film and playable 3D chapters use the exact same v69
 * physical property, pinned 638-item catalog, source-model fitting, finishes,
 * graffiti/photo decals and v110 faulty fluorescent. Only authored *decor*
 * is transferred; cinematic doors, scripted gates, interactables and saved
 * campaign progression remain owned by the game.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {renderPinewoodV69} from './render-shell-v69.js';
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {MALL} from './masterplan-v66.mjs';
import {EDITOR_EXTRA_FIXTURES_V1} from './editor-baseline-v1.mjs';
import {EDITOR_CATALOG_BY_ID} from './editor-catalog-v1.mjs';
import {loadSceneCatalogV111} from '../builder/scene-catalog-v111.js';
import {loadActiveSceneLayoutV111} from './scene-layout-v111.mjs';
import {createSceneTemplatesV111} from '../builder/scene-templates-v111.js';
import {createBuilderMaterialEnhancerV91} from '../builder/prop-materials-v91.js';
import {createDecalFactoryV97,isDecalV97} from '../builder/decals-v97.js';
import {createRoomFinishesV87} from '../builder/room-finishes-v87.js';
import {createVestibulePatinaV107} from '../builder/vestibule-patina-v107.js';
import {mountVestibuleCeilingFixtureV108} from '../builder/vestibule-fixture-v108.js';
import {mountVestibuleInnerDoorV112} from './vestibule-inner-door-v112.js';
import {createVestibuleFixtureLightV107} from '../builder/vestibule-light-v107.js';

const pose=o=>({position:{x:o.position.x,y:o.position.y,z:o.position.z},
 rotation:{x:o.rotation.x,y:o.rotation.y,z:o.rotation.z},scale:o.scale.x});
const applyPose=(o,p)=>{
 o.position.set(p.position.x,p.position.y,p.position.z);
 o.rotation.set(p.rotation.x,p.rotation.y,p.rotation.z);
 o.scale.setScalar(p.scale);o.updateMatrixWorld(true);
};
const baselineID=f=>f._extra?'cc0_'+f.id:'furnished_'+f.id;
const originals=[
 ...FURNISHINGS_V69.fixtures.map(f=>({...f,_extra:false})),
 ...EDITOR_EXTRA_FIXTURES_V1.map(f=>({...f,_extra:true}))
];

export async function attachAuthoredSceneV111(building,{draft,source='published',frontWall=null,
 automaticLighting=true,random=Math.random}={}){
 if(!draft||!['browser-preview','published'].includes(source))throw Error('Unvalidated authored scene');
 const decalFactory=createDecalFactoryV97(),materialEnhancer=createBuilderMaterialEnhancerV91();
 const templates=createSceneTemplatesV111({decalFactory,materialEnhancer});
 const created=new THREE.Group();created.name='V111 published / private preview Builder placements';
 building.group.add(created);
 const baseline=new Map(),basePoses=new Map(),authored=new Map();
 let sculpture=null,oldSculptureVisible=false;
 let roomFinishes=null,patina=null,light=null,vestibuleDoor=null,last=0,raf=0,disposed=false;
 try{
  for(const f of originals){
   const object=building.group.getObjectByName(baselineID(f),true);
   if(!object)throw Error('Authored scene baseline model not found: '+f.id);
   baseline.set(f.id,object);basePoses.set(f.id,pose(object));
  }
  // Keep original licensed fixtures visually identical to the Builder.
  // Its v91 physical-material enhancement runs on ALL baseline objects,
  // not just newly dragged catalog props.
  await Promise.all([...baseline].map(([id,object])=>
   materialEnhancer.enhance(object,id)
  ));
  // The Builder has one fitted source-pinned dry fountain. It hides ONLY
  // the old centre art, never the canonical basin, drain or floor opening.
  sculpture=building.group.getObjectByName('cc0_dry_fountain_art',true);
  oldSculptureVisible=sculpture?.visible;
  if(sculpture)sculpture.visible=false;
  const fountain=await templates.template('silted-octagonal-atrium-fountain');
  fountain.name='builder_atrium_dry_fountain';
  fountain.position.set(0,.07,-71);fountain.scale.setScalar(2);
  created.add(fountain);baseline.set('atrium_dry_fountain',fountain);
  basePoses.set('atrium_dry_fountain',pose(fountain));
  for(const [id,object] of baseline){
   const initial=basePoses.get(id),override=draft.overrides[id]||{};
   applyPose(object,{
    position:override.position||initial.position,
    rotation:override.rotation||initial.rotation,
    scale:override.scale??initial.scale
   });
   object.visible=!draft.deleted.includes(id);
  }
  for(const inst of draft.added){
   const item=EDITOR_CATALOG_BY_ID.get(inst.catalogId);
   if(!item)throw Error('Unlicensed authored object '+inst.catalogId);
   const object=await templates.template(inst.catalogId);
   object.name='published_builder_'+inst.id;
   object.userData.publishedBuilderId=inst.id;
   applyPose(object,inst);
   if(isDecalV97(item))decalFactory.opacity(object,inst.opacity??item.opacity);
   created.add(object);authored.set(inst.id,{object,item});
  }
  roomFinishes=createRoomFinishesV87(building);
  if(frontWall)roomFinishes.setCinematicFrontWall(frontWall);
  await roomFinishes.apply(draft.surfaces||{},draft.mallWallFinish||'original');
  patina=await createVestibulePatinaV107({
   building,wallFaces:roomFinishes.getWallPlans('service_vestibule')
  });
  // This fixed physical fire door is canonical mall infrastructure, never a
  // mutable Builder draft or a cinematic-only piece of set dressing.
  vestibuleDoor=mountVestibuleInnerDoorV112(building);
  building.vestibuleDoorV112=vestibuleDoor;
  const fixture=await mountVestibuleCeilingFixtureV108(building);
  light=createVestibuleFixtureLightV107(building,{
   fixture,random,
   enabled:!(typeof window!=='undefined'&&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  });
  function update(dt){
   if(!disposed){const step=Math.max(0,Math.min(.05,Number(dt)||0));
    light.update(step);vestibuleDoor?.update(step);}
  }
  function tick(now){
   if(disposed)return;
   if(last)update((now-last)/1000);
   last=now;
   raf=requestAnimationFrame(tick);
  }
  if(automaticLighting&&typeof requestAnimationFrame==='function')
   raf=requestAnimationFrame(tick);
  const baselineColliderBounds=id=>{
   const object=baseline.get(id);
   if(!object?.visible)return null;
   const box=new THREE.Box3().setFromObject(object);
   if(box.isEmpty())return null;
   return {minX:box.min.x,maxX:box.max.x,minZ:box.min.z,maxZ:box.max.z};
  };
  const state=()=>({
   source,added:authored.size,
   placements:[...authored].map(([id,{object,item}])=>({
    id,catalogId:item.id,position:{...pose(object).position},
    rotation:{...pose(object).rotation},scale:object.scale.x
   })),
   overrides:Object.keys(draft.overrides).length,
   hiddenBaseline:draft.deleted.length,roomFinishCount:Object.keys(draft.surfaces||{}).length,
   sharedWallFinish:draft.mallWallFinish||'original',
   fixedPatina:patina.getState().count,fixture:light.getState().fixture.asset,
   nominalLightIntensity:light.getState().onIntensity,
   cameraOrStoryChanged:false,scriptedDoorOverridesApplied:false
  });
  function collidersForLevel(level){
   const boxes=[];
   for(const [id,{object,item}] of authored){
    if(isDecalV97(item)||item.mountSurface==='wall')continue;
    const b=new THREE.Box3().setFromObject(object);
    // Actual measured physical model extents, not a decorative proxy.
    if(b.isEmpty()||b.max.y-b.min.y<.15||b.max.x-b.min.x<.12||b.max.z-b.min.z<.12)continue;
    const ground=MALL.levels.find(p=>p.id===level)?.y;
    if(!Number.isFinite(ground))throw Error('Invalid authored mall collision floor '+level);
    if(b.max.y<ground+.12||b.min.y>ground+1.5)continue;
    boxes.push({id:'authored_'+id,kind:'authored-furnishing',
     minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z,
     navBlock:true,physicalBlock:true,disabled:false,owner:null});
   }
   return boxes;
  }
  const dispose=()=>{
   if(disposed)return;disposed=true;
   if(raf)cancelAnimationFrame(raf);
   light?.dispose();vestibuleDoor?.dispose();patina?.dispose();roomFinishes?.dispose();
   created.removeFromParent();
   // Pinned GLB model geometries can be shared between instances; the
   // upstream v69 scene owns the loaded source resources on final teardown.
   // Our separately created decal geometries/materials are local.
   for(const {object,item} of authored.values()){
    if(!isDecalV97(item))continue;
    object.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
   }
   decalFactory.dispose();
   for(const [id,object] of baseline){
    if(id==='atrium_dry_fountain')continue;
    applyPose(object,basePoses.get(id));object.visible=true;
   }
   if(sculpture)sculpture.visible=oldSculptureVisible;
   materialEnhancer.dispose();
  };
  return {source,draft,root:created,objects:authored,baseline,baselineColliderBounds,getState:state,
   collidersForLevel,update,dispose};
 }catch(e){
  if(raf)cancelAnimationFrame(raf);
  light?.dispose();patina?.dispose();roomFinishes?.dispose();
  created.removeFromParent();decalFactory.dispose();materialEnhancer.dispose();
  if(sculpture)sculpture.visible=oldSculptureVisible;
  for(const [id,object] of baseline){
   if(id==='atrium_dry_fountain')continue;
   applyPose(object,basePoses.get(id));object.visible=true;
  }
  throw e;
 }
}

/** Full physical mall + trusted committed (or explicit local preview) layout.
 * No unapproved Builder edit can silently enter public cinematic/game play.
 */
export async function renderAuthoredPinewoodV111({scene,chapter=1,frontWallReady=null,
 automaticLighting=true}={}){
 const [building,catalog,frontWall]=await Promise.all([
  renderPinewoodV69({scene,chapter}),loadSceneCatalogV111(),
  Promise.resolve(frontWallReady)
 ]);
 try{
  const layout=await loadActiveSceneLayoutV111({catalog});
  const authored=await attachAuthoredSceneV111(building,{
   ...layout,frontWall,automaticLighting
  });
  if(typeof window!=='undefined')
   window.__PINEWOOD_AUTHORED_SCENE_V111__=authored.getState();
  return {...building,authored,
   dispose(){authored.dispose();building.dispose();}
  };
 }catch(e){building.dispose();throw e;}
}

