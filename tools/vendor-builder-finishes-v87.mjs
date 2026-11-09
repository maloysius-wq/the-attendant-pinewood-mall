// Development-only pinning. No browser loads third-party URLs.
// Poly Haven texture sources are CC0 1.0, served as 1K albedo JPGs.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const names=['concrete_wall_003','concrete_wall_004','worn_tile_floor',
 'interior_tiles','dirty_tiles','concrete_floor'];
const dir='assets/vendor/builder/finishes';
await fs.mkdir(dir,{recursive:true});
const entries=[];
for(const id of names){
 const basename=id+'_diff_1k.jpg';
 const url='https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/'+id+'/'+basename;
 const res=await fetch(url,{signal:AbortSignal.timeout(45000)});
 if(!res.ok)throw Error('Cannot vendor CC0 Poly Haven '+id+': HTTP '+res.status+' '+url);
 const bytes=Buffer.from(await res.arrayBuffer());
 if(bytes.length<5000||bytes.length>3_000_000||bytes[0]!==0xff||bytes[1]!==0xd8)
  throw Error('Not a valid 1K JPG for '+id+' ('+bytes.length+' bytes)');
 const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
 const path=dir+'/'+basename;
 await fs.writeFile(path,bytes);
 entries.push({id,path,sha256,bytes:bytes.length,source:'https://polyhaven.com/a/'+id,
  downloadSource:url,license:'CC0-1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'});
 console.log('PINEWOOD_CC0_FINISH_PIN '+JSON.stringify({id,bytes:bytes.length,sha256}));
}
await fs.writeFile(dir+'/manifest-v87.json',JSON.stringify({version:87,finishes:entries},null,2)+'\n');
console.log('PINEWOOD_CC0_FINISHES_V87_PASS '+entries.length);
