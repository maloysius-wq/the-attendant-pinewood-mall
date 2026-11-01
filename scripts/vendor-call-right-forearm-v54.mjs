#!/usr/bin/env node
/**
 * Reproducibly crop the CC0 MakeHuman-derived anatomical male base mesh
 * into one skinned RIGHT forearm and hand, without a body or a floating palm.
 * Source: https://www.innerscene.com/tools/library/3d-parts/male-base-mesh-3d-person-rigged-a-pose-380e6d89
 * This offline build tool is NOT used by the browser.
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';

const SOURCE='https://files.innerscene.com/library/male-base-mesh-3d-person-rigged-a-pose-380e6d89/038f3a526b2fc3efd012/male-base-mesh-base_male.glb';
const SOURCE_SHA='86c7cdfa989924b45e2e5110c131a4a4e6251ceb4e71246be68e468f3a32ca86';
const outDir='opening/assets/v54';
const hash=b=>createHash('sha256').update(b).digest('hex');
const ensure=(value,message)=>{if(!value)throw Error('CC0 right-arm vendor: '+message)};
const source=execFileSync('curl',['--fail','--location','--silent','--show-error',
 '--retry','3','--max-time','90',SOURCE],{maxBuffer:12*1024*1024});
ensure(hash(source)===SOURCE_SHA,'upstream bytes changed; audit source before proceeding');
ensure(source.toString('utf8',0,4)==='glTF'&&source.readUInt32LE(4)===2,'not GLB v2');
const jsonLen=source.readUInt32LE(12);
const original=JSON.parse(source.toString('utf8',20,20+jsonLen));
const chunkAt=20+jsonLen;
ensure(source.toString('utf8',chunkAt+4,chunkAt+8)==='BIN\u0000','missing source binary chunk');
const raw=source.subarray(chunkAt+8,chunkAt+8+source.readUInt32LE(chunkAt));
const nodes=original.nodes,skin=original.skins[0],primitive=original.meshes[0].primitives[0];
ensure(skin.joints.length===163,'expected original MakeHuman 163-bone rig');
const skeletonNodes=new Set(skin.joints);
const allowedJointNames=/^(?:lowerarm0[12]|wrist|metacarpal[1-4]|finger[1-5]-[1-3])\.R$/;
const allowed=new Set(skin.joints.flatMap((nodeId,j)=>allowedJointNames.test(nodes[nodeId].name)?[j]:[]));
ensure(allowed.size===22,'right-hand and right-forearm source bones missing: '+allowed.size);
const componentBytes={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
const typeWidth={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
function field(accessorId){
 const a=original.accessors[accessorId],view=original.bufferViews[a.bufferView];
 ensure(a.sparse===undefined&&view.buffer===0,'unsupported sparse or multi-buffer accessor');
 const components=typeWidth[a.type],unit=componentBytes[a.componentType];
 return {a,base:(view.byteOffset||0)+(a.byteOffset||0),
  stride:view.byteStride||components*unit,components,unit,bytes:components*unit};
}
function value(d,index,col){
 const offset=d.base+index*d.stride+col*d.unit;
 switch(d.a.componentType){
  case 5121:return raw.readUInt8(offset);
  case 5123:return raw.readUInt16LE(offset);
  case 5125:return raw.readUInt32LE(offset);
  case 5126:return raw.readFloatLE(offset);
  default:throw Error('unsupported source accessor component '+d.a.componentType);
 }
}
const position=field(primitive.attributes.POSITION),
 joints=field(primitive.attributes.JOINTS_0),
 weights=field(primitive.attributes.WEIGHTS_0),
 indices=field(primitive.indices);
ensure(position.a.count>=60000&&indices.a.count>200000,'wrong source topology');
function armWeight(vertex){
 let sum=0;
 for(let k=0;k<4;k++)if(allowed.has(value(joints,vertex,k))){
  let w=value(weights,vertex,k);
  if(weights.a.normalized&&weights.a.componentType===5121)w/=255;
  if(weights.a.normalized&&weights.a.componentType===5123)w/=65535;
  sum+=w;
 }
 return sum;
}
const include=Array.from({length:position.a.count},(_,i)=>armWeight(i)>.50);
const remap=new Map(),keptIndices=[];
for(let i=0;i<indices.a.count;i+=3){
 const tri=[value(indices,i,0),value(indices,i+1,0),value(indices,i+2,0)];
 if(!tri.every(id=>include[id]))continue;
 for(const id of tri){if(!remap.has(id))remap.set(id,remap.size);keptIndices.push(remap.get(id));}
}
ensure(remap.size>1800&&keptIndices.length>9000,'cropped right hand too small');
const bin=[],views=[],accessors=[];
let length=0;
function bufferView(data,target){
 const pad=(4-length%4)%4;if(pad){bin.push(Buffer.alloc(pad));length+=pad;}
 const id=views.length;views.push({buffer:0,byteOffset:length,byteLength:data.length,...(target?{target}:{})});
 bin.push(data);length+=data.length;return id;
}
function accessorFromSource(id,oldVertices){
 const desc=field(id),data=Buffer.alloc(oldVertices.length*desc.bytes);
 oldVertices.forEach((old,i)=>raw.copy(data,i*desc.bytes,desc.base+old*desc.stride,desc.base+old*desc.stride+desc.bytes));
 const viewId=bufferView(data,34962),srcA=desc.a;
 const next={bufferView:viewId,componentType:srcA.componentType,count:oldVertices.length,type:srcA.type};
 if(srcA.normalized)next.normalized=true;
 if(srcA.type==='VEC3'&&srcA===position.a){
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<data.length;i+=desc.bytes){
   for(let axis=0;axis<3;axis++){const val=data.readFloatLE(i+axis*4);min[axis]=Math.min(min[axis],val);max[axis]=Math.max(max[axis],val);}
  }
  next.min=min;next.max=max;
 }
 const index=accessors.length;accessors.push(next);return index;
}
const oldVertices=[...remap.keys()],attributes={};
for(const [kind,id] of Object.entries(primitive.attributes)){
 attributes[kind]=accessorFromSource(id,oldVertices);
}
const indexData=Buffer.alloc(keptIndices.length*4);
keptIndices.forEach((n,i)=>indexData.writeUInt32LE(n,i*4));
const indexView=bufferView(indexData,34963);
const indexAccessor=accessors.length;
accessors.push({bufferView:indexView,componentType:5125,count:keptIndices.length,type:'SCALAR',min:[0],max:[oldVertices.length-1]});
const ibmField=field(skin.inverseBindMatrices),ibm=Buffer.alloc(ibmField.a.count*ibmField.bytes);
for(let i=0;i<ibmField.a.count;i++)raw.copy(ibm,i*ibmField.bytes,ibmField.base+i*ibmField.stride,ibmField.base+i*ibmField.stride+ibmField.bytes);
const ibmView=bufferView(ibm);
const ibmAccessor=accessors.length;
accessors.push({bufferView:ibmView,componentType:5126,count:ibmField.a.count,type:'MAT4'});
const doc=structuredClone(original);
doc.meshes=[{name:'CC0 MakeHuman continuous right forearm and fingers',
 primitives:[{attributes,indices:indexAccessor,material:0}]}];
doc.nodes[163].mesh=0;
delete doc.nodes[164].mesh;delete doc.nodes[164].skin;
doc.accessors=accessors;
doc.bufferViews=views;
doc.buffers=[{byteLength:length}];
doc.skins[0].inverseBindMatrices=ibmAccessor;
doc.materials[0].doubleSided=false;
doc.materials[0].name='Pinewood natural skin on CC0 MakeHuman skinned geometry';
doc.materials[0].pbrMetallicRoughness.baseColorFactor=[.71,.47,.35,1];
doc.materials[0].pbrMetallicRoughness.roughnessFactor=.88;
doc.extras={source:SOURCE,sourceSha256:SOURCE_SHA,license:'CC0-1.0',
 transform:'skin-weight crop: right forearm, wrist, all five fingers; retains bind transforms and 163-bone rig'};
const jsonRaw=Buffer.from(JSON.stringify(doc));
const jsonPad=(4-jsonRaw.length%4)%4;
const json=Buffer.concat([jsonRaw,Buffer.alloc(jsonPad,0x20)]);
const binary=Buffer.concat(bin);
const binaryPad=(4-binary.length%4)%4;
const padded=Buffer.concat([binary,Buffer.alloc(binaryPad)]);
const header=Buffer.alloc(12);header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+json.length+8+padded.length,8);
const jsonHeader=Buffer.alloc(8);jsonHeader.writeUInt32LE(json.length);jsonHeader.write('JSON',4);
const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(padded.length);binHeader.write('BIN\u0000',4);
const asset=Buffer.concat([header,jsonHeader,json,binHeader,padded]);
const info={version:54,license:'CC0-1.0',source:'https://www.innerscene.com/tools/library/3d-parts/male-base-mesh-3d-person-rigged-a-pose-380e6d89',
 author:'Innerscene / MakeHuman Community',sourceAsset:'male-base-mesh-base_male.glb',
 sourceSha256:SOURCE_SHA,model:'makehuman-right-forearm.glb',
 sha256:hash(asset),bytes:asset.length,vertexCount:oldVertices.length,triangles:keptIndices.length/3,
 boneCount:skin.joints.length,description:'Only original CC0 skinned right forearm and continuous right hand, cropped by source skin weights. No other rendered body parts.'};
if(process.argv.includes('--dry-run'))console.log(JSON.stringify(info));
else{await mkdir(outDir,{recursive:true});await writeFile(outDir+'/'+info.model,asset);await writeFile(outDir+'/manifest.json',JSON.stringify(info,null,2)+'\n');console.log(JSON.stringify(info));}
