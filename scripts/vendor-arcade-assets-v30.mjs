// Sunburst Arcade v30: vendor the free CC0 real-world-scale Token Gesture pack locally.
import {mkdir,rm,readFile,writeFile,readdir,copyFile,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';

const project='https://thesidequestshop.itch.io/token-gesture-retro-arcade-props';
const expected='token-gesture-retro-arcade-props-free.zip';
const outRoot=path.resolve('assets/vendor/arcade-v30');
const tmp=path.resolve('.tmp-arcade-v30');
const ua='PinewoodMallAssetVendor/30 (+https://github.com/maloysius-wq/the-attendant-pinewood-mall)';
const headers={'User-Agent':ua,'Accept':'text/html,application/json,*/*'};

async function fetchOk(url,options={}){
  const r=await fetch(url,{redirect:'follow',...options,headers:{...headers,...(options.headers||{})}});
  if(!r.ok)throw new Error(`${options.method||'GET'} ${url}: HTTP ${r.status}`);
  return r;
}
function decode(s){return s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');}
async function resolveFreeDownload(){
  const landing=await (await fetchOk(project)).text();
  if(!/CC0 1\.0/i.test(landing)||!landing.includes(expected))throw new Error('Token Gesture landing page no longer advertises expected CC0 free archive.');
  let page=landing;
  if(!/data-upload_id=/.test(page)){
    const r=await fetchOk(project+'/download_url',{method:'POST',headers:{'X-Requested-With':'XMLHttpRequest','Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},body:''});
    const data=await r.json();if(!data?.url)throw new Error('itch.io download_url response missing url');
    page=await (await fetchOk(data.url)).text();
  }
  const rows=[];
  const blockRe=/<[^>]+data-upload_id=["']([^"']+)["'][^>]*>[\s\S]*?(?=<[^>]+data-upload_id=|$)/gi;
  for(const m of page.matchAll(blockRe)){
    const block=m[0],id=m[1],name=(block.match(/title=["']([^"']+\.zip)["']/i)||block.match(/>([^<>]+\.zip)</i))?.[1];
    if(name)rows.push({id,name:decode(name)});
  }
  if(!rows.length){
    const ids=[...page.matchAll(/data-upload_id=["']([^"']+)["']/gi)].map(m=>m[1]);
    const names=[...page.matchAll(/title=["']([^"']+\.zip)["']/gi)].map(m=>decode(m[1]));
    for(let i=0;i<Math.min(ids.length,names.length);i++)rows.push({id:ids[i],name:names[i]});
  }
  const chosen=rows.find(x=>x.name===expected);if(!chosen)throw new Error('Could not locate free Token Gesture upload id. Found: '+JSON.stringify(rows));
  const r=await fetchOk(`${project}/file/${chosen.id}?source=view_game&as_props=1&after_download_lightbox=true`,{method:'POST',headers:{'X-Requested-With':'XMLHttpRequest','Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'},body:''});
  const data=await r.json();if(!data?.url)throw new Error('itch.io file response missing url');
  return {url:data.url,uploadId:chosen.id};
}
async function walk(dir,base=dir,out=[]){for(const name of await readdir(dir)){const full=path.join(dir,name),s=await stat(full);if(s.isDirectory())await walk(full,base,out);else out.push({full,rel:path.relative(base,full)});}return out;}
const sha=buf=>createHash('sha256').update(buf).digest('hex');

await rm(tmp,{recursive:true,force:true});await mkdir(tmp,{recursive:true});
const resolved=await resolveFreeDownload();
const bytes=Buffer.from(await (await fetchOk(resolved.url)).arrayBuffer());
if(bytes.length<100000||bytes.length>5000000)throw new Error(`Unexpected Token Gesture archive size ${bytes.length}`);
const zip=path.join(tmp,expected);await writeFile(zip,bytes);
const extract=path.join(tmp,'extract');await mkdir(extract,{recursive:true});
const unzip=spawnSync('unzip',['-q',zip,'-d',extract],{encoding:'utf8'});if(unzip.status!==0)throw new Error('unzip failed: '+(unzip.stderr||unzip.stdout));
const files=await walk(extract);const glbs=files.filter(f=>/\.glb$/i.test(f.rel));
if(glbs.length<10)throw new Error(`Expected a substantial GLB arcade set, found ${glbs.length}`);
await rm(outRoot,{recursive:true,force:true});await mkdir(outRoot,{recursive:true});
const manifest={version:30,source:project,archive:expected,archiveSha256:sha(bytes),uploadId:resolved.uploadId,license:'CC0 1.0',scale:'real-world metres, base-centred pivots',runtimePolicy:'Repository-local files only; source URL is provenance only.',files:[]};
for(const f of files){
  if(!/\.(?:glb|png|jpe?g|webp|txt|md|license)$/i.test(f.rel))continue;
  const safe=f.rel.replace(/\\/g,'/');const dest=path.join(outRoot,safe);await mkdir(path.dirname(dest),{recursive:true});await copyFile(f.full,dest);
  const b=await readFile(dest);manifest.files.push({path:'./assets/vendor/arcade-v30/'+safe,sha256:sha(b),bytes:b.length});
}
manifest.files.sort((a,b)=>a.path.localeCompare(b.path));
await writeFile(path.join(outRoot,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(outRoot,'PINEWOOD_PROVENANCE.md'),`# Token Gesture: Retro Arcade Props\n\nVendored for Sunburst Arcade v30.\n\n- Source: ${project}\n- Archive: ${expected}\n- License: CC0 1.0 / public domain\n- Scale: real-world metres, base-centred pivots\n- Runtime: local repository files only\n- Archive SHA-256: ${manifest.archiveSha256}\n\nThe paid colourways archive is not downloaded or redistributed.\n`);
await rm(tmp,{recursive:true,force:true});
console.log(`Vendored Token Gesture v30: ${glbs.length} GLB files, ${manifest.files.length} retained files.`);
