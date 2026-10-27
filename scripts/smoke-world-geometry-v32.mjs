import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const scenes=[
 ['CH1','arcade-checkout',0],['CH2','below-grade-pump',1],
 ['CH3','security-cctv',2],['CH3','security-luis',2],
 ['CH4','east-wing-map',3],['CH4','east-wing-lockers',3],
 ['CH5','accountability-roster',4],['CH6','last-shift-control',5]
];
const home=process.env.HOME||'/tmp';
const root=home+'/pinewood-local-audits/'+(process.env.GITHUB_RUN_ID||'manual')+'/geometry';
await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const findings=[],scans=[];
const mark=(severity,chapter,view,id,details)=>findings.push({severity,chapter,view,id,details});
try{
 for(const [chapter,view,expectedIndex] of scenes){
  const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   const url=new URL(base);
   url.searchParams.set('visualTest',view);
   url.searchParams.set('geometryAuditV32','1');
   await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true,null,{timeout:120000});
   await page.waitForFunction(()=>typeof window.__PINEWOOD_GEOMETRY_AUDIT_V32__==='function',null,{timeout:120000});
   const info=await page.evaluate(()=>window.__PINEWOOD_GEOMETRY_AUDIT_V32__());
   await writeFile(root+'/'+view+'.json',JSON.stringify(info,null,2));
   if(!info.ready){mark('FAIL',chapter,view,'NO_WORLD','World not exposed: '+JSON.stringify(info).slice(0,500));continue;}
   if(info.levelIndex!==expectedIndex)mark('FAIL',chapter,view,'WRONG_CHAPTER','Expected '+expectedIndex+', got '+info.levelIndex);
   if(!info.interactables?.length)mark('FAIL',chapter,view,'NO_INTERACTABLES','No interactables in active scene');
   if(!info.objects?.length)mark('WARN',chapter,view,'NO_TAGGED_GEOMETRY','No tagged setpieces available for bounding audit');
   const pickups=info.interactables.filter(o=>['journal','tape','note','key'].includes(o.type)&&o.visible!==false);
   const overlapPairs=[];
   for(let a=0;a<pickups.length;a++)for(let b=a+1;b<pickups.length;b++){
    const A=pickups[a],B=pickups[b];
    const horizontal=Math.hypot(A.x-B.x,A.z-B.z),vertical=Math.abs(A.y-B.y);
    if(horizontal<.16&&vertical<.18)overlapPairs.push([A.label,B.label,Number(horizontal.toFixed(3)),Number(vertical.toFixed(3))]);
   }
   for(const p of overlapPairs)mark('WARN',chapter,view,'OVERLAPPING_PICKUPS',p.join(' / '));
   const sceneBoxes=info.objects.filter(x=>x.visible!==false);
   for(const o of sceneBoxes){
    if(o.size.some(x=>!Number.isFinite(x)||x<0))mark('FAIL',chapter,view,'INVALID_MODEL_BOUNDS',o.tag);
    if(o.min[1]<-.35)mark('WARN',chapter,view,'SUBFLOOR_MODEL',o.tag+' min Y='+o.min[1].toFixed(3));
    if(o.size.some(x=>x>30))mark('WARN',chapter,view,'EXTREME_BOUNDS',o.tag+' size='+o.size.map(x=>x.toFixed(1)).join('/'));
   }
   scans.push({chapter,view,level:info.levelIndex,objectCount:info.objects.length,interactables:info.interactables.length,colliderLists:info.colliderKeys,sceneTags:sceneBoxes.map(x=>({tag:x.tag,pos:x.position.map(n=>+n.toFixed(2)),minY:+x.min[1].toFixed(2),maxY:+x.max[1].toFixed(2)})).slice(0,40),overlapPairs,errors});
   if(errors.length)mark('FAIL',chapter,view,'BROWSER_ERROR',errors.join(' | ').slice(0,450));
   console.log('[GEOMETRY] '+chapter+' '+view+' objects='+info.objects.length+' interactables='+info.interactables.length+' '+JSON.stringify(info.colliderKeys).slice(0,350));
  }catch(e){mark('FAIL',chapter,view,'SCENE_ERROR',String(e.stack||e).slice(0,1000));}
  finally{await page.close();}
 }
}finally{await browser.close();}
await writeFile(root+'/summary.json',JSON.stringify({findings,scans},null,2));
console.log('\n=== GEOMETRY AUDIT SCANS ===');
for(const scan of scans)console.log(scan.chapter+' '+scan.view+' '+scan.interactables+' interactables, '+scan.objectCount+' tagged objects, collider arrays: '+scan.colliderLists.map(c=>c.key+':'+c.length).join(', '));
console.log('\n=== GEOMETRY AUDIT FINDINGS ===');
for(const f of findings)console.log('['+f.severity+'] ['+f.chapter+'] '+f.view+' '+f.id+': '+f.details);
console.log('Full geometry snapshots were kept only in ephemeral local runner folder; no uploads.');
if(findings.some(f=>f.severity==='FAIL'))process.exitCode=1;
