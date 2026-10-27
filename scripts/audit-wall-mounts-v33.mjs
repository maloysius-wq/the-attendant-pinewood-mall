import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const scenes=[['CH1','arcade-checkout',0],['CH2','below-grade-pump',1],['CH3','security-cctv',2],['CH4','east-wing-map',3],['CH5','accountability-roster',4],['CH6','last-shift-control',5]];
const dir=(process.env.HOME||'/tmp')+'/pinewood-local-audits/'+(process.env.GITHUB_RUN_ID||'manual')+'/wall-mounts';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const summary=[];let failures=0;
try{
 for(const [chapter,view,idx] of scenes){
  if(process.env.WALL_AUDIT_SCENES&&!process.env.WALL_AUDIT_SCENES.split(',').includes(chapter))continue;
  const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   const url=new URL(base);url.searchParams.set('visualTest',view);url.searchParams.set('wallAuditV33','1');
   await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true&&typeof window.__PINEWOOD_WALL_AUDIT_V33__==='function',null,{timeout:120000});
   const x=await page.evaluate(()=>window.__PINEWOOD_WALL_AUDIT_V33__());
   if(chapter==='CH2'||chapter==='CH4'){
     const structure=await page.evaluate(()=>window.__PINEWOOD_WALL_SURFACE_V33__());
     console.log('[WALL_STRUCTURE] '+chapter+' '+JSON.stringify(structure).slice(0,16000));
   }
   console.log('[WALL_BOXES] '+chapter+' '+JSON.stringify(x.walls).slice(0,2300));
   await writeFile(dir+'/'+chapter+'.json',JSON.stringify(x,null,2));
   const exact=await page.evaluate(()=>window.__PINEWOOD_WALL_CONTACT_V33__?.());
   if(!exact?.ready)throw Error('Instanced wall contact probe failed');
   await writeFile(dir+'/'+chapter+'-wall-contacts.json',JSON.stringify(exact,null,2));
   console.log('[ACTUAL_WALLS] '+chapter+' '+exact.instanceWalls);
   for(const m of exact.fixtures.filter(o=>o.expectedMount)){
     console.log('[MOUNT] '+chapter+' '+(m.type||m.label||JSON.stringify(m.userData)).slice(0,80)+' at '+m.position.join(',')+' gap='+m.nearest?.gap+'m, center='+m.nearest?.centerDist+'m, facing='+m.facingAlignment+' wall='+JSON.stringify(m.nearest).slice(0,270));
     if(!m.nearest||m.nearest.gap>.18||m.facingAlignment<.70)console.log('[DETACHED] '+chapter+' '+(m.type||m.label||JSON.stringify(m.userData)).slice(0,80)+' gap='+m.nearest?.gap+' facing='+m.facingAlignment);
     if(!m.nearest||m.nearest.gap>.18||m.facingAlignment<.70)console.log('[ALIGNED] '+chapter+' '+(m.type||m.label||JSON.stringify(m.userData)).slice(0,65)+' pos='+m.position+' front='+m.front+' walls='+JSON.stringify(m.aligned?.slice(0,4)));
   }

   if(!x.ready||x.chapter!==idx)throw Error('scene/world unavailable '+JSON.stringify(x).slice(0,400));
   const walls=x.walls.filter(w=>w.vertical);
   console.log('[SCENE] '+chapter+' wallMeshes='+x.wallCount+' vertical='+walls.length+' fixtureCandidates='+x.fixtureCount);
   const target=x.fixtures.filter(f=>f.reason==='interactive'||f.reason==='tagged');
   for(const f of target){
    const nearest=f.closest[0];
    console.log('[FIXTURE] '+chapter+' '+f.reason+' '+(f.type||'-')+' '+(f.label||f.name||JSON.stringify(f.userData)).slice(0,75)+' at '+f.p.join(',')+' wall='+JSON.stringify(nearest||null));
   }
   const planes=x.fixtures.filter(f=>f.reason==='print-plane');
   const far=planes.filter(f=>!f.closest.length||f.closest[0].d>.4);
   console.log('[PRINTS] '+chapter+' '+planes.length+' potential wall/printed planes; '+far.length+' more than 0.4m from nearest wall box, requiring semantic classification');
   for(const f of far.slice(0,24))console.log('[FAR_PRINT] '+chapter+' '+JSON.stringify({name:f.name,pos:f.p,bounds:f.bounds,near:f.closest[0]||null}));
   if(!x.wallCount)console.log('[WARNING] '+chapter+' wallMeshes array empty; must derive actual walls from world scene geometry or source.');
   if(errors.length)throw Error('Browser errors '+errors.join(' | '));
   summary.push({chapter,wallCount:x.wallCount,verticalWalls:walls.length,candidates:x.fixtureCount,tagged:target.length,printPlanes:planes.length,farPrintPlanes:far.length});
  }catch(e){failures++;console.log('[FAIL] '+chapter+' '+String(e.stack||e).slice(0,900));}
  finally{await page.close();}
 }
}finally{await browser.close();}
console.log('[WALL_SUMMARY] '+JSON.stringify({summary,technicalFailures:failures}));
console.log('Full wall meshes and fixture bounds left on temporary runner filesystem, no upload.');
if(failures)process.exitCode=1;
