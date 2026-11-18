/** V133: independently verify the REAL pinned CC0 V113 inner-door GLB
 * against an proposed original wall with the game's inflated collision slab.
 * This reads glTF POSITION accessor bounds, transforms the three moving mesh
 * boxes, reproduces fitMeshes, samples the actual pivot/yaw, and uses SAT.
 * Conservative AABBs may reject a safe option but never approve on artwork.
 */
import {readFileSync} from 'node:fs';
import {VESTIBULE_HANDOFF_V112,vestibuleInnerPortalV112} from '../mall/vestibule-handoff-v112.mjs';
export const SOURCE_ASSET_V133='assets/vendor/builder/models/liminal-spaces-kit/three-d-liminal-spaces-kit-liminal-spaces-kit-doorway-door-fad0eb36.glb';
export const FRONT_HINGE_WALL_END_V133=8.91;
export const ANGLE_V113=Math.PI*.53;
const EPS=1e-8;
const extent=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
const project=(points,[ax,az])=>{
 const values=points.map(p=>p[0]*ax+p[1]*az);
 return [Math.min(...values),Math.max(...values)];
};
function satOverlap(a,b){
 const axes=[[1,0],[0,1]];
 for(const poly of [a,b])for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],dx=q[0]-p[0],dz=q[1]-p[1];
  const mag=Math.hypot(dx,dz);
  if(mag>EPS)axes.push([-dz/mag,dx/mag]);
 }
 return axes.every(axis=>extent(project(a,axis),project(b,axis))>EPS);
}
const boxPolygon=(x1,x2,z1,z2)=>[[x1,z1],[x2,z1],[x2,z2],[x1,z2]];
function glbMeshes(){
 const bytes=readFileSync(new URL('../'+SOURCE_ASSET_V133,import.meta.url));
 if(bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2)
  throw Error('V113 pinned original is no longer a GLB2 source');
 const len=bytes.readUInt32LE(12);
 if(bytes.toString('ascii',16,20)!=='JSON')throw Error('V113 GLB JSON chunk missing');
 const doc=JSON.parse(bytes.subarray(20,20+len).toString('utf8'));
 const matches=doc.nodes.filter(n=>/^door(?:_\d+)?$/.test(n.name)&&n.mesh!==undefined);
 const fixed=doc.nodes.filter(n=>n.name==='doorway-door_1'||n.name==='doorway-door_5');
 if(matches.length!==3||fixed.length!==2)
  throw Error('Licensed V113 moving leaf or frame node structure changed');
 const bbox=[];
 for(const node of matches){
  if(node.matrix||node.rotation)throw Error('V113 rig is no longer axis-aligned');
  const prim=doc.meshes[node.mesh].primitives;
  const t=node.translation||[0,0,0],s=node.scale||[1,1,1];
  for(const p of prim){
   const acc=doc.accessors[p.attributes.POSITION];
   if(!acc?.normalized||acc.componentType!==5122||acc.type!=='VEC3')
    throw Error('V113 source accessor quantization changed');
   const val=(k,idx)=>t[idx]+(k/32767)*s[idx];
   const [x1,x2]=[val(acc.min[0],0),val(acc.max[0],0)].sort((a,b)=>a-b);
   const [z1,z2]=[val(acc.min[2],2),val(acc.max[2],2)].sort((a,b)=>a-b);
   bbox.push({name:node.name,x1,x2,z1,z2});
  }
 }
 const xmin=Math.min(...bbox.map(b=>b.x1)),xmax=Math.max(...bbox.map(b=>b.x2));
 const zmin=Math.min(...bbox.map(b=>b.z1)),zmax=Math.max(...bbox.map(b=>b.z2));
 const sx=1.78/(xmax-xmin),zc=(zmin+zmax)/2;
 return {bbox:bbox.map(b=>({name:b.name,x1:(b.x1-xmin)*sx,x2:(b.x2-xmin)*sx,
  z1:b.z1-zc,z2:b.z2-zc})),
  sourceDepth:zmax-zmin,sourceDoorMeshes:matches.length,sourceFrameMeshes:fixed.length};
}
function evaluateWall(end,{samples=191}={}){
 const source=glbMeshes(),portal=vestibuleInnerPortalV112();
 const px=portal.start+.01,pz=portal.z+.012;
 // Original 2-D game collider from addWallCollision() in gameplay-layout-v70:
 // wall thickness+.06, along-line pad .025 on both endpoints.
 const rect=boxPolygon(7-.025,end+.025,-43-(.24+.06)/2,-43+(.24+.06)/2);
 let minClear=Infinity,collisions=0,firstAngle=null;
 for(let i=0;i<samples;i++){
  const angle=ANGLE_V113*i/(samples-1),cs=Math.cos(angle),sn=Math.sin(angle);
  for(const b of source.bbox){
   const polygon=boxPolygon(b.x1,b.x2,b.z1,b.z2).map(([x,z])=>
    [px+x*cs+z*sn,pz-x*sn+z*cs]);
   if(satOverlap(polygon,rect)){
    collisions++;firstAngle??=angle*180/Math.PI;
   }
   // Conservative axis-aligned horizontal clearance ONLY for samples
   // where the mesh occupies the wall's Z slab.
   const zmin=Math.min(...polygon.map(p=>p[1])),zmax=Math.max(...polygon.map(p=>p[1]));
   if(zmin<=-42.85&&zmax>=-43.15){
    const minX=Math.min(...polygon.map(p=>p[0]));
    minClear=Math.min(minClear,minX-(end+.025));
   }
  }
 }
 return {wallEndX:end,collisions,firstAngleDeg:firstAngle,
  conservativeHorizontalClearanceMetres:minClear};
}
export function auditOriginalDoorSweepV133(){
 const source=glbMeshes();
 const full=evaluateWall(9),candidate=evaluateWall(FRONT_HINGE_WALL_END_V133);
 const portal=vestibuleInnerPortalV112();
 const isSafe=candidate.collisions===0&&candidate.conservativeHorizontalClearanceMetres>.04;
 return Object.freeze({
  sourceAsset:SOURCE_ASSET_V133,
  sourceDoorMeshes:source.sourceDoorMeshes,sourceFrameMeshes:source.sourceFrameMeshes,
  originalDepthMetres:source.sourceDepth,
  actualPivot:{x:portal.start+.01,z:portal.z+.012},
  originalDoorWidth:1.78,angleRangeDeg:[0,95.4],
  filmEye:{...VESTIBULE_HANDOFF_V112},
  nominalUncutWall:full,proposedRealMasonry:candidate,
  physicallyJoinedToExistingX9Wall:FRONT_HINGE_WALL_END_V133>=9-.24/2,
  approvedGeometryForFocusedConstruction:isSafe
 });
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href)
 console.log(JSON.stringify(auditOriginalDoorSweepV133(),null,2));
