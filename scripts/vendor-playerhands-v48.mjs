import {mkdir,readdir,stat,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join,basename} from 'node:path';
const url='https://opengameart.org/sites/default/files/hand.zip';
const dir='/tmp/oga-playerhands-v48';
const target='opening/assets/v48';
await mkdir(dir,{recursive:true});await mkdir(target,{recursive:true});
const zip=join(dir,'hand.zip');
execFileSync('curl',['-fL','--retry','3','--retry-delay','2','--connect-timeout','20','--max-time','120','-A','Mozilla/5.0',url,'-o',zip],{stdio:'inherit'});
execFileSync('unzip',['-o',zip,'-d',dir],{stdio:'inherit'});
const paths=[];async function walk(p){for(const d of await readdir(p,{withFileTypes:true})){const q=join(p,d.name);if(d.isDirectory())await walk(q);else paths.push(q)}}await walk(dir);
console.log('OGA_ARCHIVE_FILES',JSON.stringify(paths.map(x=>x.slice(dir.length+1))));
const blends=paths.filter(x=>x.toLowerCase().endsWith('.blend'));
if(!blends.length)throw Error('Original Playerhands .blend file absent from CC0 source archive');
blends.sort((a,b)=>a.length-b.length);
const output=target+'/playerhands-forearm.glb';
execFileSync('blender',['--background',blends[0],'--python','scripts/export-playerhands-v48.py'],{
 stdio:'inherit',env:{...process.env,PINEWOOD_HAND_OUTPUT:output},timeout:180000});
const data=await readFile(output);
if(data.toString('ascii',0,4)!=='glTF'||data.length<20000||data.length>20000000)throw Error('GLB invalid or unexpected size');
const n=data.readUInt32LE(12),json=JSON.parse(data.subarray(20,20+n).toString('utf8'));
const skins=json.skins||[],nodes=json.nodes||[],names=nodes.map(x=>x.name).filter(Boolean);
console.log('EXPORTED_GLTF_NODES',JSON.stringify(nodes.map((x,i)=>({i,name:x.name,skin:x.skin,mesh:x.mesh,translation:x.translation,rotation:x.rotation,scale:x.scale,children:x.children}))));
console.log('EXPORTED_GLTF_SKINS',JSON.stringify(skins.map(s=>({joints:s.joints.map(i=>nodes[i]?.name)}))));
if(!skins.length||!nodes.some(x=>typeof x.mesh==='number'&&typeof x.skin==='number'))
 throw Error('Original forearm mesh was not skinned after conversion');
const archiveHash=createHash('sha256').update(await readFile(zip)).digest('hex');
const sha256=createHash('sha256').update(data).digest('hex');
const manifest={version:48,license:'CC0-1.0',source:'https://opengameart.org/content/playerhands',
 author:'sandsound',archive:url,archiveSha256:archiveHash,model:'playerhands-forearm.glb',
 sha256,bytes:data.length,skins:skins.length,nodeNames:names,
 note:'Source explicitly CC0, archived .blend with skinned forearm/hand; locally converted to glTF binary with Blender for first-person phone animation. No third-party runtime URLs.'};
await writeFile(target+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log('V48_FOREARM_GLTF_SHA256',sha256);
