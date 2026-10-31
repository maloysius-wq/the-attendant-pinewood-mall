import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root='opening/assets/v54';
const manifest=JSON.parse(await readFile(root+'/manifest.json','utf8'));
assert.equal(manifest.version,54);
assert.equal(manifest.license,'CC0-1.0');
assert.equal(manifest.model,'makehuman-right-forearm.glb');
assert.equal(manifest.sourceSha256,'86c7cdfa989924b45e2e5110c131a4a4e6251ceb4e71246be68e468f3a32ca86');
assert.match(manifest.source,/^https:\/\/www\.innerscene\.com\/tools\/library\//);
const binary=await readFile(root+'/'+manifest.model);
assert.equal(createHash('sha256').update(binary).digest('hex'),manifest.sha256);
assert.equal(binary.byteLength,manifest.bytes);
assert.equal(binary.toString('utf8',0,4),'glTF');
assert.equal(binary.readUInt32LE(4),2);
assert.equal(binary.readUInt32LE(8),binary.length);
const jsonLen=binary.readUInt32LE(12);
const gltf=JSON.parse(binary.toString('utf8',20,20+jsonLen));
assert.equal(gltf.meshes.length,1,'The vendor artifact must not draw a whole body');
assert.equal(gltf.meshes[0].primitives.length,1,'Only one skinned forearm surface');
assert.equal(gltf.skins.length,1);
assert.equal(gltf.skins[0].joints.length,163,'Preserve original bind rig and weights');
const p=gltf.meshes[0].primitives[0];
for(const key of ['POSITION','NORMAL','TEXCOORD_0','JOINTS_0','WEIGHTS_0'])
 assert.equal(typeof p.attributes[key],'number','Missing source weighted vertex '+key);
const vCount=gltf.accessors[p.attributes.POSITION].count;
const tris=gltf.accessors[p.indices].count/3;
assert(vCount>6000&&vCount<20000,'Expected real high-detail arm surface, not the 447-vertex Playerhands');
assert(tris>10000&&tris<25000,'Expected cropped arm geometry only');
assert.equal(manifest.vertexCount,vCount);
assert.equal(manifest.triangles,tris);
for(const name of ['wrist.R','lowerarm01.R','lowerarm02.R','finger1-1.R','finger1-2.R','finger1-3.R','finger5-3.R'])
 assert(gltf.nodes.some(n=>n.name===name),'Missing anatomically connected '+name);
assert(gltf.nodes[163].mesh===0&&gltf.nodes[163].skin===0,'Skin and skeleton must remain attached');
assert(gltf.nodes[164].mesh===undefined,'No high-poly head must render');
const skinNames=gltf.skins[0].joints.map(i=>gltf.nodes[i].name);
assert(skinNames.includes('finger1-3.R')&&skinNames.includes('wrist.R'),
 'Source thumb must share the same skin as the wrist and forearm');
console.log('PASS v54 CC0 anatomical right forearm '+vCount+' vertices '+tris+' triangles; pin '+manifest.sha256.slice(0,14));
