/**
 * ONE-TIME development-only asset vendoring; never used by the browser.
 * ambientCG's published Cardboard001 (worn) and Cardboard002 (smooth)
 * textures are CC0 1.0. Download the official 1K JPEG archives, extract
 * only their Color maps, and pin bytes / hashes / license / source locally.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const dir='assets/vendor/builder/materials-v93';
const manifest={version:93,license:'CC0-1.0',
 licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',
 author:'ambientCG (Lennart Demes)',materials:[]};
await fs.mkdir(dir,{recursive:true});
const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'pinewood-cardboard-'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
try{
 for(const [id,kind] of [['Cardboard001','worn'],['Cardboard002','clean']]){
  const url='https://ambientcg.com/get?file='+id+'_1K-JPG.zip';
  const page='https://ambientcg.com/view?id='+id;
  const res=await fetch(url,{signal:AbortSignal.timeout(120000),
    headers:{'User-Agent':'Pinewood-Mall-CC0-Cardboard-V93/1.0'}});
  if(!res.ok)throw Error('Cannot retrieve ambientCG '+id+': '+res.status);
  const zip=Buffer.from(await res.arrayBuffer());
  if(zip.length<100000||zip.length>13000000||zip.toString('binary',0,2)!=='PK')
   throw Error('Invalid Cardboard001/002 1K source ZIP '+id);
  const tmp=path.join(scratch,id+'.zip');
  await fs.writeFile(tmp,zip);
  const listing=execFileSync('unzip',['-Z','-1',tmp],{encoding:'utf8'});
  const name=listing.split(/\r?\n/).find(x=>new RegExp('(?:^|/)'+id+'_1K-JPG_Color\\.jpg$','i').test(x));
  if(!name||name.includes('..'))throw Error('Missing source Color JPG '+id+': '+listing.slice(0,1200));
  const image=execFileSync('unzip',['-p',tmp,name],{maxBuffer:4000000});
  if(image.length<20000||image.length>3000000||image[0]!==255||image[1]!==216||
     image.at(-2)!==255||image.at(-1)!==217)throw Error('Invalid JPG: '+id);
  const dst=dir+'/cardboard_'+kind+'_color_1k.jpg';
  await fs.writeFile(dst,image);
  manifest.materials.push({id,kind,path:dst,bytes:image.length,sha256:sha(image),
   sourcePage:page,downloadSource:url,sourceZipBytes:zip.length,
   sourceZipSha256:sha(zip),archiveMember:name,license:'CC0-1.0',
   licenseUrl:manifest.licenseUrl});
  console.log('PINEWOOD_V93_CARDBOARD_MATERIAL '+JSON.stringify({id,kind,
    bytes:image.length,sha256:sha(image),zipBytes:zip.length}));
 }
 await fs.writeFile(dir+'/manifest-v93.json',JSON.stringify(manifest,null,2)+'\n');
}finally{await fs.rm(scratch,{recursive:true,force:true})}
console.log('PINEWOOD_V93_CARDBOARD_VENDOR_COMPLETE '+manifest.materials.length);
