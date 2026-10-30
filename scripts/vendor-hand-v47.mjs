/**
 * Development-time CC0 vendoring. NEVER loaded in a browser; runtime reads
 * ONLY the committed opening/assets/v47/hand-posable.glb.
 */
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source='https://www.innerscene.com/api/library/posable-anatomical-right-hand-f6098b4f/download';
const backup='https://files.innerscene.com/library/posable-anatomical-right-hand-f6098b4f/c28ad5ff8fafd424275f/hand-posable.glb';
let data;
for(const url of [source,backup]){
 try{
  const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(60000),headers:{'User-Agent':'Pinewood-CC0-asset-vendor/1.0'}});
  if(!response.ok)throw Error('HTTP '+response.status);
  data=Buffer.from(await response.arrayBuffer());
  if(data.length<100000||data.length>5000000||data.toString('ascii',0,4)!=='glTF')throw Error('not the expected rigged GLB');
  console.log('Retrieved verified binary GLB',data.length,'bytes');
  break;
 }catch(e){console.warn('Asset mirror failed',url,String(e));}
}
if(!data)throw Error('Both CC0 rigged-hand download endpoints failed');
const total=data.readUInt32LE(8),chunkLength=data.readUInt32LE(12);
if(total!==data.length||data.toString('ascii',16,20)!=='JSON')throw Error('Invalid GLB header');
const json=JSON.parse(data.subarray(20,20+chunkLength).toString('utf8'));
if(!Array.isArray(json.skins)||json.skins.length<1||!Array.isArray(json.nodes))throw Error('Expected skinned rigged hand');
const nodes=json.nodes.map((node,index)=>({index,name:node.name||'',children:node.children,translation:node.translation,rotation:node.rotation,scale:node.scale,mesh:node.mesh,skin:node.skin}));
const skins=json.skins.map(s=>({joints:s.joints.map(i=>({index:i,name:json.nodes[i]?.name})),skeleton:s.skeleton}));
console.log('GLB_NODES='+JSON.stringify(nodes));
console.log('GLB_SKINS='+JSON.stringify(skins));
const sha256=createHash('sha256').update(data).digest('hex');
const dir='opening/assets/v47';await mkdir(dir,{recursive:true});
await writeFile(dir+'/hand-posable.glb',data);
await writeFile(dir+'/manifest.json',JSON.stringify({
 version:47,license:'CC0-1.0',
 original:'https://www.innerscene.com/tools/library/3d-parts/posable-anatomical-right-hand-f6098b4f',
 download:source,filename:'hand-posable.glb',sha256,bytes:data.length,
 notes:'Original Innerscene model adapted from MakeHuman/MPFB CC0 body, rig and skin. Actual glTF skin retained; thumb driven with runtime bone poses. Source license explicitly public-domain CC0.'
},null,2)+'\n');
console.log('V47_MODEL_SHA256='+sha256);
