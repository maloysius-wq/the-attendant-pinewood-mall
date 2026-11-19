/** Read-only inspection of original compressed game mechanics. No deployed runtime changes. */
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const paths=['part-01.txt','part-02.txt','part-03.txt','p4-1.txt','p4-2.txt','p4-3.txt','p4-4.txt','p4-5.txt','p5-1.txt','p5-2.txt','p5-3.txt','p5-4.txt','p5-5.txt'];
const text=gunzipSync(Buffer.from(paths.map(p=>readFileSync('bundle2/'+p,'utf8').trim()).join(''),'base64')).toString('utf8');
const lines=text.split('\n');
const needles=[
 /class Attendant\b/, /class Game\b/,/class World\b/,/function buildArcade/,/function buildVHS/,
 /function makeHide/,/function makePickup/,/function makeDecoy/,/function.*Locker/,
 /function.*Hide/,/function.*Noise/,/function.*Cabinet/,/function.*Closet/,
 /hideSpot/i,/hidingSpots/i,/hideSpots/i,/hideObject/i,/userData\.type=['"]hide/,
 /type:['"]hide/,/type:['"]decoy/,/decoy/i,/noisemaker/i,/noise.maker/i,/throwNoise/i,
 /updateInteraction\(/,/interact\(\)/,/resetState\(/,/spawnAttendant/,/attendant\.update/,
 /updateAI\(/,/this\.attendant/,/startChapter\(/,/placeHiding/i,/hiding/i,/breath/i,
];
for(const pattern of needles){
 const hits=[];
 for(let i=0;i<lines.length;i++)if(pattern.test(lines[i]))hits.push(i);
 const limited=hits.slice(0,pattern.toString().includes('decoy')?14:9);
 console.log('\n=== '+String(pattern)+' hits='+hits.length+' ===');
 for(const i of limited){
  console.log('L'+(i+1)+' '+lines.slice(Math.max(0,i-2),Math.min(lines.length,i+4)).map((l,j)=>String(Math.max(0,i-2)+j+1)+': '+l.slice(0,700)).join('\n'));
 }
}
console.log('\nTOTAL_LINES '+lines.length+' TOTAL_BYTES '+text.length);

for(const [lo,hi] of [[275,291],[344,360],[513,549],[597,635]]){
 console.log('\n=== EXACT SOURCE LINES '+lo+'..'+hi+' ===');
 for(let i=lo;i<=hi;i++)console.log('SOURCE '+i+': '+(lines[i-1]||''));
}
const glb=readFileSync('assets/vendor/runtime/3d7dfedf514e5c4e/bookcaseClosedDoors.glb');
if(glb.toString('ascii',0,4)!=='glTF')throw Error('Original cabinet must be a real pinned GLB');
const n=glb.readUInt32LE(12),gltf=JSON.parse(glb.subarray(20,20+n).toString());
console.log('REAL_CABINET_GLTF '+JSON.stringify({
 nodes:gltf.nodes?.map((o,i)=>({i,name:o.name,mesh:o.mesh,children:o.children,translation:o.translation,rotation:o.rotation,scale:o.scale})),
 meshes:gltf.meshes?.map((m,i)=>({i,name:m.name,primitiveCount:m.primitives?.length})),
 scenes:gltf.scenes
}));
