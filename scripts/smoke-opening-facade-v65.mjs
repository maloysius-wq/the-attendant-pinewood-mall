import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173';
await mkdir('opening-v65-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required']});
try{
 for(const [name,width,height] of [['desktop',1280,720]]){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[],remote=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{
   if(/^https?:/.test(request.url())&&!request.url().startsWith(origin))remote.push(request.url());
  });
  await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#newBtn')&&window.__PINEWOOD_OPENING_V34__,null,{timeout:60000});
  await page.locator('#newBtn').click();
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:120000});
  const meta=await page.evaluate(()=>{
   const qa=window.__PINEWOOD_OPENING_V34__;
   return {env:qa.environmentV37,entry:qa.serviceEntryGeometry,startup:qa.startupStatus};
  });
  const f=meta.env?.facadeV65;
  assert.equal(f?.state,'ready',name+' facade preload');
  assert.equal(f.textureLoaded,true);
  assert.equal(f.frontWindowCount,2);
  assert.equal(f.mainEntranceBoarded,true);
  assert.equal(f.mainEntrance.routeBlocked,true);
  assert.equal(f.sign.width,27.1);
  assert.ok(f.heightMeters>=17);
  // Inspect the actual built 3D meshes from the arrival lot. A roof cap
  // projects across the sign if its screen-space x/y bounds overlap the
  // lettering and its front face is closer to the player than the sign.
  const roofSignClearance=await page.evaluate(async()=>{
   const [{installAbandonedFacadeV65},THREE]=await Promise.all([
    import('/opening/facade-v65.js'),
    import('/vendor/three/build/three.module.js')
   ]);
   const material=new THREE.MeshBasicMaterial({color:0x888888});
   const world=new THREE.Group();
   await installAbandonedFacadeV65({
    world,facadeMaterials:{facade:material,steel:material},serviceEntry:{}
   });
   world.updateMatrixWorld(true);
   const sign=world.getObjectByName('large weathered 1980s PINEWOOD MALL sign');
   if(!sign)throw Error('Pinewood Mall sign mesh is missing');
   const signBox=new THREE.Box3().setFromObject(sign);
   const occludingCoping=[];
   world.traverse(mesh=>{
    if(!mesh.isMesh||!/parapet coping/i.test(mesh.name))return;
    const b=new THREE.Box3().setFromObject(mesh);
    const xOverlap=Math.max(0,Math.min(signBox.max.x,b.max.x)-Math.max(signBox.min.x,b.min.x));
    const yOverlap=Math.max(0,Math.min(signBox.max.y,b.max.y)-Math.max(signBox.min.y,b.min.y));
    if(xOverlap>.02&&yOverlap>.02&&b.max.z>signBox.max.z+.005){
     occludingCoping.push({name:mesh.name,xOverlap,yOverlap,frontZ:b.max.z,signZ:signBox.max.z});
    }
   });
   return {occludingCoping};
  });
  assert.deepEqual(roofSignClearance.occludingCoping,[],
   'roof parapet coping must not pass in front of or through the Pinewood Mall sign');
  assert.equal(meta.env.landscape?.version,64,name+' v64 planter preservation');
  assert.equal(meta.env.landscape?.count,8);
  assert.equal(meta.env.landscape?.scaleFactor,2);
  assert.equal(meta.entry?.opening?.centerX,12);
  assert.equal(meta.entry?.doorSpecs?.width,1.78);
  assert.equal(meta.entry?.doorSpecs?.height,2.27);
  assert.equal(meta.startup.firstFrameRendered,true);
  // Cinematic seek only — no WASD, no moving through scripted geometry.
  const captures=[
   [3,.25,'car-establishing'],
   [5,.85,'mall-from-car'],
   [6,.75,'sign-and-entry'],
   [7,.95,'walking-facade'],
   [8,.20,'service-door']
  ];
  for(const [cue,phase,label]of captures){
   await page.evaluate(({cue,phase})=>{
    const qa=window.__PINEWOOD_OPENING_V34__;
    qa.seek(cue);qa.scrub(phase);
   },{cue,phase});
   await page.waitForTimeout(520);
   await page.screenshot({path:'opening-v65-artifacts/'+name+'-'+label+'.png'});
  }
  // Fixed review-only observer placements: visually verify the public closure
  // and full mall silhouette without steering the story character or using WASD.
  const probes=[
   ['public-entry-detail',{x:-10.5,y:2.25,z:-12.9,dx:-10.5,dy:3.45,dz:-22}],
   ['full-facade',{x:-5.0,y:2.3,z:8.0,dx:-9.0,dy:9.7,dz:-22}]
  ];
  for(const [label,eye] of probes){
   const rendered=await page.evaluate(eye=>
    window.__PINEWOOD_OPENING_V34__.qaCockpitProbe(eye),eye);
   assert.equal(rendered,true,name+' deterministic '+label+' camera');
   await page.waitForTimeout(350);
   await page.screenshot({path:'opening-v65-artifacts/'+name+'-'+label+'.png'});
  }
  assert.deepEqual(errors,[],name+' script errors');
  assert.deepEqual(remote,[],name+' runtime remote assets');
  await writeFile('opening-v65-artifacts/'+name+'-status.json',JSON.stringify({
   facade:f,entry:meta.entry,landscape:meta.env.landscape,errors,remote
  },null,2));
  console.log('V65_'+name.toUpperCase()+'_PASS '+JSON.stringify({
   height:f.heightMeters,frontWindows:f.frontWindowCount,
   boarded:f.mainEntranceBoarded,signWidth:f.sign.width,errors,remote
  }));
  await page.close();
 }
}finally{await browser.close();}
