/** V150: three quiet, tangible 1997 staff belongings on original CC0 furniture.
 * Neither collectible LS evidence nor extra floor blockers, dialogue or models.
 * The measured original furniture surface determines each object's world Y.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {planChapter1StaffBelongingsV150} from './chapter1-staff-belongings-v150.mjs';

const localQA=()=>typeof location!=='undefined'&&
 ['127.0.0.1','localhost'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');

function paperTexture(site){
 const canvas=document.createElement('canvas');
 canvas.width=1024;canvas.height=752;
 const c=canvas.getContext('2d');
 if(!c)throw Error('V150 requires canvas for visible physical paper texture');
 const palette={
  clipboard:{paper:'#c9bc92',ink:'#24251f',line:'#786a55',stamp:'#67604c'},
  chart:{paper:'#e0c9d1',ink:'#322b38',line:'#a78c9a',stamp:'#914f68'},
  sleeve:{paper:'#c4b99b',ink:'#28312f',line:'#827760',stamp:'#625a42'}
 }[site.kind];
 if(!palette)throw Error('V150 invalid original staff keepsake');
 c.fillStyle=palette.paper;c.fillRect(0,0,canvas.width,canvas.height);
 c.strokeStyle=palette.line;c.lineWidth=12;c.strokeRect(25,22,974,708);
 // Mild physical discoloration, not a clean UI overlay or replacement map.
 for(let i=0;i<96;i++){
  c.fillStyle='rgba(75,61,49,.056)';
  c.fillRect(35+(i*151)%960,40+(i*83)%660,2+(i%5),1+(i%3));
 }
 c.textAlign='center';c.textBaseline='middle';
 c.fillStyle=palette.stamp;c.font='bold 39px Arial,sans-serif';
 c.fillText('PINEWOOD MALL  /  1997',512,86,920);
 c.fillStyle=palette.ink;c.font='bold 49px Arial,sans-serif';
 c.fillText(site.title,512,174,920);
 c.fillStyle=palette.line;c.fillRect(81,227,862,5);
 c.textAlign='left';
 for(let i=0;i<site.lines.length;i++){
  c.fillStyle=palette.ink;
  c.font=(site.kind==='chart'?'italic ':'')+'43px Arial,sans-serif';
  c.fillText(site.lines[i],96,307+i*83,834);
  if(site.kind==='clipboard'){
   c.strokeStyle=palette.line;c.lineWidth=3;c.strokeRect(47,293+i*83,23,23);
  }
 }
 c.strokeStyle=palette.line;c.lineWidth=5;
 c.beginPath();c.moveTo(93,650);c.lineTo(930,650);c.stroke();
 c.fillStyle=palette.ink;c.textAlign='right';
 c.font='bold 50px Arial,sans-serif';c.fillText(site.owner,917,697,850);
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=4;
 return texture;
}
function createPhysicalBelonging(site){
 const paper=paperTexture(site);
 const root=new THREE.Group();
 root.name='v150_physical_staff_belonging_'+site.id;
 root.userData={staffBelongingV150:true,owner:site.person,siteId:site.id,
  originalFixture:site.fixture,storyOnly:true};
 const materials=[],geometries=[];
 const baseColor=site.kind==='clipboard'?'#6c5944':
  site.kind==='chart'?'#a77887':'#8d7c60';
 const baseMaterial=new THREE.MeshStandardMaterial({
  color:baseColor,roughness:.94,metalness:0});
 materials.push(baseMaterial);
 const baseGeometry=new THREE.BoxGeometry(site.width,.012,site.depth);
 geometries.push(baseGeometry);
 const backing=new THREE.Mesh(baseGeometry,baseMaterial);
 backing.name=site.id+'_backing';root.add(backing);
 const inkMaterial=new THREE.MeshStandardMaterial({
  map:paper,roughness:1,metalness:0,side:THREE.DoubleSide,
  emissive:new THREE.Color('#817563'),emissiveIntensity:.22});
 materials.push(inkMaterial);
 const sheetGeometry=new THREE.PlaneGeometry(site.width*.94,site.depth*.93);
 geometries.push(sheetGeometry);
 const sheet=new THREE.Mesh(sheetGeometry,inkMaterial);
 sheet.name=site.id+'_print';
 sheet.rotation.x=-Math.PI/2;sheet.position.y=.0072;
 root.add(sheet);
 const trimMat=new THREE.MeshStandardMaterial({
  color:site.kind==='clipboard'?'#a6a8a5':'#88785e',
  roughness:.48,metalness:site.kind==='clipboard'?.65:.09});
 materials.push(trimMat);
 if(site.kind==='clipboard'){
  const clipGeo=new THREE.BoxGeometry(.095,.012,.023);
  geometries.push(clipGeo);
  const clip=new THREE.Mesh(clipGeo,trimMat);
  clip.name='jo_original_clip';clip.position.set(0,.016,-site.depth*.45);
  root.add(clip);
 }else if(site.kind==='sleeve'){
  const foldGeo=new THREE.BoxGeometry(site.width*.9,.002,.045);
  geometries.push(foldGeo);
  const flap=new THREE.Mesh(foldGeo,trimMat);
  flap.name='luis_envelope_flap';
  flap.position.set(0,.008,site.depth*.39);
  root.add(flap);
 }else{
  // Tessa left one extra blank chart slip under her personal picks.
  const cornerGeo=new THREE.BoxGeometry(.07,.002,.022);
  geometries.push(cornerGeo);
  const tab=new THREE.Mesh(cornerGeo,trimMat);
  tab.name='tessa_staff_chart_tab';
  tab.position.set(-site.width*.32,.012,-site.depth*.39);
  root.add(tab);
 }
 root.rotation.y=site.kind==='sleeve'?.07:site.kind==='chart'?-.09:.04;
 const dispose=()=>{
  root.removeFromParent();
  for(const geometry of geometries)geometry.dispose();
  for(const material of materials)material.dispose();
  paper.dispose();
 };
 return {root,sheet,dispose};
}
export function installChapter1StaffBelongingsV150(game){
 if(game?.levelIndex!==0||!game.mallV70?.group?.getObjectByName||
  !game.mallLayoutV70||!Array.isArray(game.world?.interactables)||
  !game.__chapter1DecoyTagsV145||!game.__chapter1HuntPacingV149||
  typeof game.resetState!=='function')
  throw Error('V150 requires the actual Chapter 1 scene, V145 and V149 gameplay');
 if(game.__chapter1StaffBelongingsV150){
  game.__chapter1StaffBelongingsV150.bind();
  return game.__chapter1StaffBelongingsV150;
 }
 let boundGroup=null,entries=[];
 const dispose=()=>{
  for(const entry of entries)entry.dispose();
  entries=[];boundGroup=null;
 };
 const bind=()=>{
  if(game.levelIndex!==0)return;
  const group=game.mallV70.group,sites=planChapter1StaffBelongingsV150(game.mallLayoutV70);
  const mounts=sites.map(site=>{
   const model=group.getObjectByName('furnished_'+site.fixture,true);
   if(!model||!model.visible||model.userData?.fixtureId!==site.fixture||
    model.userData?.modelSource!==site.originalSupportModel)
    throw Error('V150 approved source furniture missing: '+site.fixture);
   model.updateWorldMatrix(true,true);
   const bounds=new THREE.Box3().setFromObject(model);
   const dimensions=bounds.getSize(new THREE.Vector3());
   if(bounds.isEmpty()||!Number.isFinite(bounds.max.y+dimensions.x+dimensions.z)||
    dimensions.y<site.originalSupportHeight*.66||
    dimensions.y>site.originalSupportHeight*1.65||
    dimensions.x<site.width+.1||dimensions.z<site.depth+.1||
    site.x-site.width/2<bounds.min.x+.012||
    site.x+site.width/2>bounds.max.x-.012||
    site.z-site.depth/2<bounds.min.z+.012||
    site.z+site.depth/2>bounds.max.z-.012)
    throw Error('V150 non-supporting or unmeasured original table top: '+site.fixture+
     ' '+JSON.stringify({min:bounds.min.toArray(),max:bounds.max.toArray(),
      dimensions:dimensions.toArray(),site:{x:site.x,z:site.z}}));
   return {site,model,bounds};
  });
  if(group===boundGroup&&entries.length===3&&
   entries.every((entry,i)=>entry.support===mounts[i].model))return;
  dispose();
  if(typeof document==='undefined')return;
  try{
   entries=mounts.map(({site,model,bounds})=>{
    const prop=createPhysicalBelonging(site);
    // Original renderer may move the authored group: convert from genuine
    // measured WORLD surface to its local transform before inserting.
    const floorWorld=new THREE.Vector3(site.x,bounds.max.y+.008,site.z);
    group.updateWorldMatrix(true,false);
    const local=group.worldToLocal(floorWorld);
    prop.root.position.copy(local);
    group.add(prop.root);
    return {...prop,site,support:model,worldTop:bounds.max.y,
     expectedWorld:floorWorld};
   });
  }catch(error){dispose();throw error;}
  boundGroup=group;
 };
 const priorReset=game.resetState;
 game.resetState=function(...args){
  // Exact V148 restart safeguard: original world.clear precedes resetState.
  // There is NO fixture during the reset; dispose only. Original V70
  // relocateStoryV70 calls install/bind after rebuilding the complete scene.
  const out=priorReset.apply(this,args);dispose();return out;
 };
 const getState=()=>({
  version:150,chapter:game.levelIndex+1,
  originalRoomCount:game.mallLayoutV70?.rooms?.length,
  physicalBelongings:entries.map(e=>{
   e.root.updateWorldMatrix(true,false);
   const pos=e.root.getWorldPosition(new THREE.Vector3());
   return {
    id:e.site.id,person:e.site.person,kind:e.site.kind,room:e.site.room,
    originalFixture:e.site.fixture,
    originalFixtureSource:e.site.originalSupportModel,
    physicallySupported:!!e.support.parent,
    modelIsVisible:!!e.support.visible,
    attached:e.root.parent===boundGroup,
    paperSurfaceTexture:!!e.sheet.material.map,
    worldX:pos.x,worldY:pos.y,worldZ:pos.z,
    actualSupportTopY:e.worldTop,
    aboveOriginalSurface:pos.y-e.worldTop,
    originalApproachSteps:e.site.originalApproachSteps,
    approach:e.site.approach,
    storyOnly:e.root.userData.storyOnly
   };
  }),
  addedCollectibles:0,addedColliders:0,
  lsEvidenceIdsChanged:false
 });
 const api=Object.freeze({version:150,bind,getState});
 game.__chapter1StaffBelongingsV150=api;bind();
 if(localQA()&&typeof window!=='undefined')
  window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__={
   getState,
   viewOriginalBelongingForTest(id){
    if(!game.running||game.levelIndex!==0||game.modal)
     throw Error('V150 needs playable actual Chapter 1');
    const e=entries.find(item=>item.site.id===id);
    if(!e)throw Error('No authentic Chapter 1 staff keepsake: '+id);
    const p=e.site.approach;
    game.controls.yaw.position.set(p.x,1.7+game.mallLayoutV70.y,p.z);
    e.root.updateWorldMatrix(true,true);
    const destination=e.root.getWorldPosition(new THREE.Vector3());
    const origin=game.controls.yaw.position;
    const dx=destination.x-origin.x,dz=destination.z-origin.z;
    game.controls.yaw.rotation.y=Math.atan2(-dx,-dz);
    game.controls.pitch.rotation.x=Math.atan2(destination.y-origin.y,
     Math.hypot(dx,dz));
    game.camera.updateWorldMatrix(true,false);
    const ray=new THREE.Raycaster();
    ray.setFromCamera({x:0,y:0},game.camera);
    const hits=ray.intersectObject(e.root,true);
    return {site:e.site.id,viewingDistance:Math.hypot(dx,dz),
     actualRayIntersection:!!hits.length,
     hitObject:hits[0]?.object?.name||null,
     originalRoom:game.mallLayoutV70.roomAt(p.x,p.z),
     state:getState()};
   }
  };
 return api;
}
