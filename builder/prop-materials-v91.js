import * as THREE from '../vendor/three/build/three.module.js';
import {PROP_MATERIALS_V91} from './material-options-v91.mjs';
import {keepPeripheralColorsV92,isFurnitureV92,sourceTextureRoleV92} from './material-scale-v92.mjs';
import {CARDBOARD_MAPS_V93,isCardboardBoxV93,cardboardMaterialRoleV93} from './cardboard-materials-v93.mjs';

/**
 * Non-destructive Builder-only PBR enhancement of source GLBs whose materials
 * are plain colors. Never touch embedded-map materials, animated/emissive
 * screens, glass, foliage or shared campaign GLB bytes. Each mesh keeps its
 * original semantic material identity and the geometry remains the same shape.
 */
export function materialRoleV91(name='',modelName=''){
 const n=String(name).toLowerCase(),model=String(modelName).toLowerCase();
 const cardboard=cardboardMaterialRoleV93(n,model);
 if(cardboard)return cardboard;
 if(/glass|glow|emiss|light|lamp|screen|displayglass|water|snow|leaf|plant|grass|weed|silt|flame|glare|neon|crt|chrome|mirror|transparent/.test(n))
  return null;
 if(/wooddark|wood_dark|darkwood/.test(n))return 'woodDark';
 if(/woodinner|woodlight|lightwood/.test(n))return 'woodLight';
 if(/woodbark|woodold|wood_bark/.test(n))return 'woodOld';
 if(/wood|timber|plank|veneer|plywood/.test(n))return 'wood';
 if(/carpetblue|fabricblue/.test(n))return 'fabricBlue';
 if(/carpet|fabric|cloth|textile|upholster|canvas|cushion/.test(n))return 'fabric';
 if(/leather|suede/.test(n))return 'leather';
 if(/velvet/.test(n))return 'velvet';
 if(/gold|brass|bronze|copper/.test(n))return 'metal';
 if(/metaldark|metal_dark|rust|iron|steel/.test(n))return 'metalRusted';
 if(/metal|silver|alumin|handle|hardware/.test(n))return 'metal';
 if(/concrete|cement|plaster|stone|brick|rock|masonry/.test(n))return 'stone';
 // The locally sourced mall packs have meaningful "surface" / "carcass"
 // wood components, separate from dark metal frame and colored accents.
 if(n==='surface'&&/desk|table|shelf|counter|display|cabinet|kiosk|bench|block/i.test(model))
  return 'woodTable';
 if(n==='carcass'&&/shelf|counter|display|cabinet|kiosk|shop|aisle/i.test(model))
  return 'plywood';
 if(n==='dark'&&/shelf|counter|display|kiosk|rack|aisle/i.test(model))
  return 'paintedMetal';
 // No guessing from generic red/green/palette materials or unnamed meshes.
 return null;
}

const hasValidUV=geometry=>{
 const uv=geometry.getAttribute('uv');
 if(!uv||uv.count!==geometry.getAttribute('position')?.count)return false;
 if(uv.count<3)return false;
 let loU=Infinity,hiU=-Infinity,loV=Infinity,hiV=-Infinity;
 for(let i=0;i<uv.count;i++){
  const u=uv.getX(i),v=uv.getY(i);
  loU=Math.min(loU,u);hiU=Math.max(hiU,u);
  loV=Math.min(loV,v);hiV=Math.max(hiV,v);
 }
 return hiU-loU>.001&&hiV-loV>.001;
};

/**
 * Generate per-triangle box-projected UVs for CC0 models authored with no
 * texture coordinates. This does not add triangles, move vertices or edit
 * the source binary. Indexed meshes are expanded *on an isolated clone* so
 * adjacent perpendicular faces can have independent woodgrain directions.
 */
export function boxProjectMissingUVV91(geometry,{tileMeters=.65}={}){
 if(hasValidUV(geometry))return geometry;
 const g=geometry.index?geometry.toNonIndexed():geometry.clone();
 const position=g.getAttribute('position');
 if(!position||position.count%3!==0)throw Error('Untexturable triangle geometry');
 const uv=new Float32Array(position.count*2);
 const scale=1/Math.max(.1,tileMeters);
 const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),edge1=new THREE.Vector3(),edge2=new THREE.Vector3(),normal=new THREE.Vector3();
 for(let i=0;i<position.count;i+=3){
  a.fromBufferAttribute(position,i);b.fromBufferAttribute(position,i+1);c.fromBufferAttribute(position,i+2);
  edge1.subVectors(b,a);edge2.subVectors(c,a);normal.crossVectors(edge1,edge2);
  const ax=Math.abs(normal.x),ay=Math.abs(normal.y),az=Math.abs(normal.z);
  const side=ay>=ax&&ay>=az?1:ax>=az?0:2;
  for(let j=0;j<3;j++){
   const x=position.getX(i+j),y=position.getY(i+j),z=position.getZ(i+j);
   uv[(i+j)*2]=(side===0?z:x)*scale;
   uv[(i+j)*2+1]=(side===1?z:y)*scale;
  }
 }
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.userData={...g.userData,builderGeneratedUVV91:true};
 return g;
}

/**
 * Project one clean veneer image across an entire furniture piece, with
 * aspect ratio preserved. Unlike the v91 .48 m tiling, neither a 2-metre
 * desk nor a drawer front repeats its photo ten times. Handles share the
 * same UV coordinate space but retain their independently named material.
 * Never reproject a mesh that has authored image-bearing materials.
 */
export function boxProjectFurnitureUVV92(geometry,{repeatsAcrossLongest=.92}={}){
 const g=geometry.index?geometry.toNonIndexed():geometry.clone();
 const position=g.getAttribute('position');
 if(!position||position.count%3!==0)throw Error('Cannot project non-triangle furniture');
 g.computeBoundingBox();
 const bounds=g.boundingBox;
 const size=bounds.getSize(new THREE.Vector3());
 const span=Math.max(.001,size.x,size.y,size.z);
 const scale=Math.max(.1,Math.min(1.15,repeatsAcrossLongest))/span;
 const uv=new Float32Array(position.count*2);
 const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 const ab=new THREE.Vector3(),ac=new THREE.Vector3(),n=new THREE.Vector3();
 for(let i=0;i<position.count;i+=3){
  a.fromBufferAttribute(position,i);
  b.fromBufferAttribute(position,i+1);
  c.fromBufferAttribute(position,i+2);
  n.crossVectors(ab.subVectors(b,a),ac.subVectors(c,a));
  const ax=Math.abs(n.x),ay=Math.abs(n.y),az=Math.abs(n.z);
  const side=ay>=ax&&ay>=az?1:ax>=az?0:2;
  for(let j=0;j<3;j++){
   const x=position.getX(i+j)-bounds.min.x;
   const y=position.getY(i+j)-bounds.min.y;
   const z=position.getZ(i+j)-bounds.min.z;
   uv[(i+j)*2]=(side===0?z:x)*scale;
   uv[(i+j)*2+1]=(side===1?z:y)*scale;
  }
 }
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.userData={...g.userData,builderFurnitureUVV92:true,builderPatternRepeatsV92:repeatsAcrossLongest};
 return g;
}

const props=new Set([...Object.values(PROP_MATERIALS_V91),...Object.values(CARDBOARD_MAPS_V93)]);
export function createBuilderMaterialEnhancerV91(){
 const loader=new THREE.TextureLoader(),cache=new Map(),stats={
  modelsInspected:0,modelsEnhanced:0,meshesEnhanced:0,materialSurfacesEnhanced:0,
  generatedUVs:0,furnitureUVs:0,peripheralsPreserved:0,embeddedPreserved:0,semanticPreserved:0,usedRoles:{}
 };
 async function texture(role){
  const path=PROP_MATERIALS_V91[role]||CARDBOARD_MAPS_V93[role];
  if(!path||!props.has(path)||!/^assets\/vendor\/builder\/(?:materials-v91\/[a-z0-9_]+_diff_1k|materials-v93\/cardboard_(?:clean|worn)_color_1k)\.jpg$/.test(path))
   throw Error('Unpinned Builder material '+role);
  if(!cache.has(role))cache.set(role,loader.loadAsync(new URL('../'+path,import.meta.url).href).then(t=>{
   t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;
   t.minFilter=THREE.LinearMipmapLinearFilter;return t;
  }));
  return cache.get(role);
 }
 async function enhance(root,modelId=''){
  stats.modelsInspected++;
  if(keepPeripheralColorsV92(modelId)){
   stats.peripheralsPreserved++;return {enhanced:0,roles:[]};
  }
  const meshRecords=[],required=new Set();
  root.traverse(o=>{
   if(!o.isMesh||o.isSkinnedMesh||!o.geometry?.getAttribute('position'))return;
   if(keepPeripheralColorsV92(o.name)){
    stats.peripheralsPreserved++;return;
   }
   const materials=Array.isArray(o.material)?o.material:[o.material];
   const roles=materials.map(m=>{
    if(!m||!m.isMeshStandardMaterial||m.map||m.normalMap||m.emissiveMap||m.alphaMap||
       m.transparent||m.opacity<.98||m.userData?.builderEnhancedV91){
     if(m?.map||m?.normalMap)stats.embeddedPreserved++;
     return null;
    }
    const role=materialRoleV91(m.name,modelId+' '+o.name);
    if(role)required.add(sourceTextureRoleV92(role,modelId+' '+o.name));else stats.semanticPreserved++;
    return role;
   });
   if(roles.some(Boolean))meshRecords.push({mesh:o,materials,roles,canProject:!materials.some(m=>m?.map||m?.normalMap||m?.emissiveMap||m?.alphaMap)});
  });
  if(!meshRecords.length)return {enhanced:0,roles:[]};
  // Every new source map is a local file verified by the manifest hash.
  const loaded=new Map(await Promise.all([...required].map(async role=>[role,await texture(role)])));
  let enhanced=0;
  for(const {mesh,materials,roles,canProject} of meshRecords){
   // Color-only furniture gets an entire photo per broad panel, even when
   // the original UV atlas technically exists but repeats excessively.
   // Keep all original embedded image UVs completely untouched.
   if(canProject&&(isFurnitureV92(modelId+' '+mesh.name)||isCardboardBoxV93(modelId+' '+mesh.name))){
    mesh.geometry=boxProjectFurnitureUVV92(mesh.geometry,{
     repeatsAcrossLongest:isCardboardBoxV93(modelId+' '+mesh.name)?.82:.92
    });
    stats.furnitureUVs++;
   }else if(!hasValidUV(mesh.geometry)&&canProject){
    const bounds=mesh.geometry.boundingBox||new THREE.Box3().setFromBufferAttribute(mesh.geometry.getAttribute('position'));
    const span=bounds.getSize(new THREE.Vector3()).length();
    mesh.geometry=boxProjectMissingUVV91(mesh.geometry,{
     tileMeters:Math.max(1.5,span/1.8)
    });
    stats.generatedUVs++;
   }
   const next=materials.map((m,i)=>{
    const role=roles[i];if(!role)return m;
    const copy=m.clone();
    copy.map=loaded.get(sourceTextureRoleV92(role,modelId+' '+mesh.name));
    // Multiplicative original base-color tint preserves distinct handles,
    // dark stained wood, fabric colors, and any original colored paint.
    // Brighten modestly so the source color doesn't hide subtle image grain.
    copy.color.copy(m.color).lerp(new THREE.Color(0xffffff),.38);
    if(role.startsWith('cardboard')){
     // The photo already contains the proper tan paper color. Multiplying
     // it by Kenney's original dark orange "wood" color made boxes nearly
     // black. Keep a subtle source distinction between outside and inside.
     copy.color.setScalar(/dark/i.test(m.name)?0.82:1);
     copy.metalness=0;copy.roughness=.98;
    }else if(role.startsWith('metal')||role==='paintedMetal'||role==='paintedMetalBlue'){
     copy.metalness=role==='paintedMetal'?.32:Math.max(.55,m.metalness);
     copy.roughness=Math.min(.77,Math.max(.42,m.roughness*.72));
    }else if(role==='fabric'||role==='fabricBlue'||role==='velvet'||role==='leather'){
     copy.metalness=0;copy.roughness=.92;
    }else if(role==='stone'){
     copy.metalness=0;copy.roughness=.91;
    }else{
     copy.metalness=0;copy.roughness=.79;
    }
    copy.userData={...copy.userData,builderEnhancedV91:role};
    stats.materialSurfacesEnhanced++;
    stats.usedRoles[role]=(stats.usedRoles[role]||0)+1;
    return copy;
   });
   mesh.material=Array.isArray(mesh.material)?next:next[0];
   mesh.userData.builderMaterialsV91=roles.filter(Boolean);
   stats.meshesEnhanced++;enhanced++;
  }
  stats.modelsEnhanced++;
  return {enhanced,roles:[...required]};
 }
 function dispose(){
  for(const pending of cache.values())pending.then(t=>t.dispose()).catch(()=>{});
  cache.clear();
 }
 return {enhance,getStats:()=>structuredClone(stats),dispose};
}
