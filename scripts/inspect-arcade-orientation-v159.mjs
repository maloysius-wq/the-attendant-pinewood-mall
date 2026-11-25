/** Inspect actual source triangles/accessors in the vendored GLB. This is
 * evidence for orientation decisions, not an assumption that +Z is front.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const data=readFileSync('assets/vendor/arcade-v30/token_gesture/pack.glb');
const len=data.readUInt32LE(12),g=JSON.parse(data.subarray(20,20+len).toString('utf8'));
const bin=28+len;
function vectors(index){
 const a=g.accessors[index],v=g.bufferViews[a.bufferView];
 if(a.componentType!==5126||a.type!=='VEC3')throw Error('Unexpected source attribute');
 return Array.from({length:a.count},(_,i)=>{
  const o=bin+(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||12);
  return [data.readFloatLE(o),data.readFloatLE(o+4),data.readFloatLE(o+8)];
 });
}
const round=x=>Number(x.toFixed(4));
const result=[];
for(const node of g.nodes.filter(n=>n.mesh!==undefined)){
 const parts=g.meshes[node.mesh].primitives.map(p=>({material:g.materials[p.material]?.name,vertices:vectors(p.attributes.POSITION),normals:p.attributes.NORMAL===undefined?null:vectors(p.attributes.NORMAL)}));
 const points=parts.flatMap(p=>p.vertices),min=[0,1,2].map(k=>Math.min(...points.map(p=>p[k]))),max=[0,1,2].map(k=>Math.max(...points.map(p=>p[k])));const h=max[1]-min[1];
 const slices=Array.from({length:10},(_,i)=>{const p=points.filter(v=>v[1]>=min[1]+h*i/10&&v[1]<=min[1]+h*(i+1)/10);return p.length?{band:i,vertices:p.length,x:[round(Math.min(...p.map(v=>v[0]))),round(Math.max(...p.map(v=>v[0])))],z:[round(Math.min(...p.map(v=>v[2]))),round(Math.max(...p.map(v=>v[2])))]}:null;}).filter(Boolean);
 const materials=parts.map(p=>({name:p.material,bounds:[0,1,2].map(k=>[round(Math.min(...p.vertices.map(v=>v[k]))),round(Math.max(...p.vertices.map(v=>v[k])))]),mean:p.vertices[0]?[0,1,2].map(k=>round(p.vertices.reduce((n,v)=>n+v[k],0)/p.vertices.length)):null,normalCount:p.normals?.length||0}));
 result.push({node:node.name,min:min.map(round),max:max.map(round),slices,materials});
}
mkdirSync('artifacts/v159-arcade-source',{recursive:true});
writeFileSync('artifacts/v159-arcade-source/profiles.json',JSON.stringify(result,null,2));
for(const n of result)console.log('V159_SOURCE_PROFILE '+JSON.stringify(n));
