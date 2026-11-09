// One-time DEVELOPMENT-only source vendoring. Runtime uses only repo-local GLBs.
// Retro CRT originally authored by MadeByYeshe/CrazyDrPants (CC BY 4.0);
// openly hosted remix by tt-toe in bevy_tui_texture (GitHub example).
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const assets=[
 {id:'retro-crt-pc-1990s',label:'CRT desktop computer (1990s, keyboard + mouse)',category:'Offices & 1990s Electronics',
  filename:'retro-crt-pc-1990s.glb',url:'https://raw.githubusercontent.com/tt-toe/bevy_tui_texture/main/examples/assets/models/retro_crt.glb',
  sourcePage:'https://github.com/tt-toe/bevy_tui_texture/blob/main/examples/assets/models/retro_crt.glb',
  originalAuthor:'MadeByYeshe (CrazyDrPants)',sourceAuthor:'TTT (tt-toe remix)',
  originalSource:'https://crazydrpants.itch.io/retro-crt-computer',
  license:'CC-BY-4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
  targetHeight:.5,radius:.6},
 {id:'old-pc-compact-tower',label:'Desktop computer tower (drive bays)',category:'Offices & 1990s Electronics',
  filename:'old-pc-compact-tower.glb',sourceId:38827,
  license:'CC0-1.0',targetHeight:.44,radius:.27},
 {id:'old-pc-tower',label:'Desktop computer tower (black)',category:'Offices & 1990s Electronics',
  filename:'old-pc-tower.glb',sourceId:27894,
  license:'CC0-1.0',targetHeight:.45,radius:.28},
 {id:'tile-rubble-pile',label:'Broken tile rubble pile',category:'Rubble, Dirt & Garbage',
  filename:'tile-rubble-pile.glb',sourceId:25233,
  license:'CC0-1.0',targetHeight:.18,radius:.75},
 {id:'charred-rubble-pile',label:'Concrete rubble and exposed rebar',category:'Rubble, Dirt & Garbage',
  filename:'charred-rubble-pile.glb',sourceId:29939,
  license:'CC0-1.0',targetHeight:.5,radius:1.2},
 {id:'spilled-trash-can',label:'Dented bin with spilled trash',category:'Rubble, Dirt & Garbage',
  filename:'spilled-trash-can.glb',sourceId:27297,
  license:'CC0-1.0',targetHeight:.9,radius:.65},
 {id:'refuse-bags',label:'Tied garbage and recycling bags',category:'Rubble, Dirt & Garbage',
  filename:'refuse-bags.glb',sourceId:36414,
  license:'CC0-1.0',targetHeight:.75,radius:1.1},
 {id:'period-magazines',label:'Abandoned 1989 magazine pile',category:'Rubble, Dirt & Garbage',
  filename:'period-magazines.glb',sourceId:15569,
  license:'CC0-1.0',targetHeight:.16,radius:.4}
];
const dir='assets/vendor/builder/models/era-v87';
await fs.mkdir(dir,{recursive:true});
const entries=[];
for(const x of assets){
 const url=x.url||'https://cdn.3dassets.dev/assets/'+x.sourceId+'/v1/model.glb';
 const res=await fetch(url,{signal:AbortSignal.timeout(45000)});
 if(!res.ok)throw Error('Source unavailable '+x.id+' '+res.status);
 const bytes=Buffer.from(await res.arrayBuffer());
 if(bytes.length<1000||bytes.length>7_000_000||bytes.toString('ascii',0,4)!=='glTF'||
  bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)
  throw Error('Invalid source GLB '+x.id+' '+bytes.length);
 const len=bytes.readUInt32LE(12);
 if(bytes.toString('ascii',16,20)!=='JSON'||len<40||len+20>bytes.length)
  throw Error('Invalid GLB JSON chunk '+x.id);
 const gl=JSON.parse(bytes.toString('utf8',20,len+20));
 if(!gl.meshes?.length||!gl.materials?.length)throw Error('Empty 3D source '+x.id);
 if(gl.images?.some(i=>i.uri&&!i.uri.startsWith('data:')))
  throw Error('Source requires external texture files: '+x.id);
 const path=dir+'/'+x.filename;
 await fs.writeFile(path,bytes);
 const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
 const item={id:x.id,label:x.label,category:x.category,condition:'weathered',
  path,sha256,bytes:bytes.length,license:x.license,
  licenseUrl:x.licenseUrl||'https://creativecommons.org/publicdomain/zero/1.0/',
  sourcePage:x.sourcePage||'https://3dassets.dev/assets/'+x.sourceId,
  downloadUrl:url,sourceId:x.sourceId||undefined,originalAuthor:x.originalAuthor||undefined,
  sourceAuthor:x.sourceAuthor||'3DAssets.dev',
  originalSource:x.originalSource||undefined,
  targetHeight:x.targetHeight,radius:x.radius,
  materialStyle:gl.images?.length?'image-mapped':'color-only'};
 entries.push(item);
 console.log('PINEWOOD_ERA_PROP_PIN '+JSON.stringify({id:item.id,sha256,bytes:item.bytes,images:gl.images?.length||0}));
}
const manifest={version:87,models:entries};
await fs.writeFile('assets/vendor/builder/era-catalog-v87.json',JSON.stringify(manifest,null,2)+'\n');
console.log('PINEWOOD_ERA_PROP_VENDOR_PASS '+entries.length);
