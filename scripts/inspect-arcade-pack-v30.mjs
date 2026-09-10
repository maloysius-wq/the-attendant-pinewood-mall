import {readFile,writeFile,mkdir} from 'node:fs/promises';

const file='assets/vendor/arcade-v30/token_gesture/pack.glb';
const buf=await readFile(file);
if(buf.readUInt32LE(0)!==0x46546c67||buf.readUInt32LE(4)!==2)throw new Error('Expected GLB v2');
const len=buf.readUInt32LE(12),type=buf.readUInt32LE(16);
if(type!==0x4e4f534a)throw new Error('GLB JSON chunk missing');
const gltf=JSON.parse(buf.subarray(20,20+len).toString('utf8').replace(/\u0000+$/,''));
const props=[];
for(let i=0;i<(gltf.nodes||[]).length;i++){
  const node=gltf.nodes[i];if(node.mesh==null)continue;
  const mesh=gltf.meshes[node.mesh];
  let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],primitiveCount=0;
  for(const primitive of mesh.primitives||[]){
    const pos=primitive.attributes?.POSITION;if(pos==null)continue;
    const accessor=gltf.accessors?.[pos];if(!accessor?.min||!accessor?.max)continue;
    primitiveCount++;
    for(let k=0;k<3;k++){min[k]=Math.min(min[k],accessor.min[k]);max[k]=Math.max(max[k],accessor.max[k]);}
  }
  if(!primitiveCount)continue;
  const scale=node.scale||[1,1,1];
  const size=max.map((v,k)=>Number(((v-min[k])*Math.abs(scale[k])).toFixed(4)));
  props.push({
    name:node.name||`node_${i}`,
    mesh:mesh.name||`mesh_${node.mesh}`,
    nodeIndex:i,
    translation:node.translation||[0,0,0],
    rotation:node.rotation||[0,0,0,1],
    scale,
    localBounds:{min,max},
    size:{x:size[0],y:size[1],z:size[2]},
    primitiveCount
  });
}
await mkdir('diagnostics',{recursive:true});
await writeFile('diagnostics/arcade-v30-geometry.json',JSON.stringify({version:30,file,unit:'metre',props},null,2)+'\n');
console.log('Arcade v30 geometry: '+props.map(p=>`${p.name}=${p.size.x}x${p.size.y}x${p.size.z}m`).join(', '));
