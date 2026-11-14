/** Structural, floor-grounded 1979 mall columns. No freestanding dressing slabs. */
import * as THREE from '../vendor/three/build/three.module.js';

function component(parent,id,x,y,z,width,height,depth,material){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),material);
 mesh.name=id;mesh.position.set(x,y,z);mesh.receiveShadow=true;
 mesh.userData.structural=true;parent.add(mesh);return mesh;
}

/** Physical shaft, a real plinth on y=0, and a capital touching the original
 * ceiling/roof. Geometry is built from the source-validated 1979 column plan.
 * All meshes are shared in Builder, film and game, never user placements.
 */
export function renderGalleryColumnsV118(ground,columns,mats){
 if(!ground?.isObject3D||!Array.isArray(columns)||columns.length!==28)
  throw Error('V118 requires all 28 source-measured mall support columns');
 for(const key of ['wall','fountain','shopMasonry'])
  if(!mats?.[key]?.isMaterial)throw Error('V118 missing original source PBR '+key);
 const group=new THREE.Group();group.name='V118 original mall structural colonnades';
 ground.add(group);
 const manifest=[];
 for(const c of columns){
  const col=new THREE.Group();col.name=c.id;col.position.set(c.x,0,c.z);
  col.userData.architecturalColumnV118={...c};
  group.add(col);
  const grand=c.room==='central_gallery';
  const shaftBase=.20,capHeight=grand?.32:.25;
  const shaftTop=c.topY-capHeight;
  if(shaftTop<=shaftBase)throw Error('Source structural post too short '+c.id);
  component(col,c.id+'_foot',0,.12,0,c.footWidth,.24,c.footWidth,mats.fountain);
  component(col,c.id+'_reveal',0,.28,0,c.footWidth*.89,.075,c.footWidth*.89,mats.shopMasonry);
  component(col,c.id+'_shaft',0,(shaftBase+shaftTop)/2,0,
   c.shaftWidth,shaftTop-shaftBase,c.shaftWidth,mats.wall);
  component(col,c.id+'_capital',0,c.topY-capHeight/2,0,
   c.capitalWidth,capHeight,c.capitalWidth,mats.shopMasonry);
  // A thin band is a joined molding at the ceiling transition, not a
  // floating decorative panel in the public circulation.
  component(col,c.id+'_cap-reveal',0,c.topY-.065,0,
   c.capitalWidth*.9,.10,c.capitalWidth*.9,mats.fountain);
  manifest.push({id:c.id,room:c.room,x:c.x,z:c.z,height:c.topY,
   reachesSourceRoof:grand,footWidth:c.footWidth});
 }
 return {group,manifest};
}
