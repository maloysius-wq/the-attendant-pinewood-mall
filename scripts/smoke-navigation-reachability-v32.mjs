import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const targets=[
 {id:'chapter1',view:'arcade-checkout',index:0,start:[-24,0]},
 {id:'chapter2',view:'below-grade-pump',index:1,start:[-23,0]},
 {id:'chapter3',view:'security-cctv',index:2,start:[-25,0]},
 {id:'chapter4',view:'east-wing-map',index:3,start:[-26,0]},
 {id:'chapter5',view:'accountability-roster',index:4,start:[-26,0]},
 {id:'chapter6',view:'last-shift-control',index:5,start:[-26,0]}
];
const root=(process.env.HOME||'/tmp')+'/pinewood-local-audits/'+(process.env.GITHUB_RUN_ID||'manual')+'/navigation';
await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
let failed=0;
try{
 for(const spec of targets){
  const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
  try{
   const url=new URL(base);url.searchParams.set('visualTest',spec.view);url.searchParams.set('geometryAuditV32','1');
   const consoleErrors=[];page.on('pageerror',x=>consoleErrors.push(x.message));
   await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true&&typeof window.__PINEWOOD_PATH_AUDIT_V32__==='function',null,{timeout:120000});
   const r=await page.evaluate(([x,z])=>window.__PINEWOOD_PATH_AUDIT_V32__(x,z),spec.start);
   await writeFile(root+'/'+spec.id+'.json',JSON.stringify(r,null,2));
   if(!r.ready||r.level!==spec.index)throw Error('Invalid chapter path result: '+JSON.stringify(r).slice(0,400));
   const all=r.optimistic.interactables;
   const noPath=all.filter(o=>o.visible!==false&&!o.reachable);
   const behindGate=all.filter((o,i)=>o.visible!==false&&!r.physical.interactables[i].reachable&&o.reachable);
   const openAndReachable=all.filter(o=>o.visible!==false&&o.reachable);
   console.log('[PATH] '+spec.id+' floor='+r.optimistic.walkCount+' cells, closed-reachable='+r.physical.reachCount+', gates-open-reachable='+r.optimistic.reachCount+', objectives='+openAndReachable.length+'/'+all.filter(x=>x.visible!==false).length+', blocked-colliders='+r.blockedCount+', dynamic-doors='+r.doors);
   for(const o of behindGate)console.log('[GATED] '+spec.id+' '+o.type+' '+o.label+' '+o.x+','+o.z+' closedDist='+r.physical.interactables.find(x=>x.type===o.type&&x.label===o.label)?.minReach+'m');
   for(const o of noPath)console.log('[UNREACHABLE] '+spec.id+' '+o.type+' '+o.label+' @ '+o.x+','+o.z+' nearest reachable '+o.minReach+'m, nearest walk '+o.minWalk+'m');
   if(r.optimistic.seedDistance>4)console.log('[START_WARNING] '+spec.id+' spawn starts '+r.optimistic.seedDistance+'m from free walk grid');
   if(consoleErrors.length)throw Error('Browser errors '+consoleErrors.join(' | '));
  }catch(e){failed++;console.log('[FAIL] '+spec.id+' '+(e.stack||e));}
  finally{await page.close()}
 }
}finally{await browser.close();}
console.log('[SUMMARY] '+targets.length+' chapters inspected. '+failed+' technical failures. All path detailed data ephemeral, only summary retained in job logs.');
if(failed)process.exitCode=1;
