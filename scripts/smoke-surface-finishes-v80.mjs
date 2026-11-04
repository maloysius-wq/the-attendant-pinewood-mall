import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const base='http://127.0.0.1:4173';
await mkdir('surface-v80-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'
]});
const errors=[],remote=[],textures=[];
try{
 const mall=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 mall.on('pageerror',e=>errors.push('mall: '+e.message));
 mall.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))remote.push(r.url());
  if(r.url().includes('/v80/'))textures.push(r.url());});
 await mall.goto(base+'/review/mall-construction-v67/',{waitUntil:'domcontentloaded'});
 await mall.waitForFunction(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__?.ready,null,{timeout:140000});
 const api=()=>mall.evaluate(()=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.getState());
 const model=await api();
 assert.equal(model.allCeilingsTextured,true,'every built ceiling must display its real loaded albedo');
 assert.ok(model.ceilingMeshes>=20);
 assert.deepEqual(model.ceilingFinishes.map(x=>x.texture).sort(),
  ['aged-acoustic-ceiling-albedo.jpg','stained-plaster-ceiling-albedo.jpg']);
 for(const [shot,name] of [['west','retail-ceiling'],['security','staff-ceiling']]){
  await mall.evaluate(shot=>window.__PINEWOOD_MALL_CONSTRUCTION_V67__.goto(shot),shot);
  await mall.screenshot({path:'surface-v80-artifacts/'+name+'.png',timeout:120000});
 }
 await mall.close();

 const opening=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 opening.on('pageerror',e=>errors.push('opening: '+e.message));
 opening.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))remote.push(r.url());
  if(r.url().includes('/v80/'))textures.push(r.url());});
 await opening.goto(base+'/review/the-call-v34/',{waitUntil:'domcontentloaded'});
 await opening.locator('#newBtn').click();
 await opening.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:160000});
 const finish=await opening.evaluate(()=>window.__PINEWOOD_OPENING_V34__.sidewalkFinish);
 assert.ok(finish,'front sidewalk exists in real preview scene');
 assert.equal(finish.name,'front_mall_sidewalk');
 assert.equal(finish.textureLoaded,true,'texture must be loaded before cinematic is visible');
 assert.match(finish.textureURL,/\/opening\/assets\/v80\/worn-sidewalk-albedo\.jpg$/);
 assert.ok(Math.max(...finish.topUVRepeat)>2.5,'walkway texture must tile at human scale');
 assert.ok(finish.materialRoughness>.9,'old concrete must have rough unpolished surface');
 const probe=await opening.evaluate(()=>window.__PINEWOOD_OPENING_V34__.qaCockpitProbe({
  x:11.4,y:2.0,z:-12.2,dx:11.4,dy:0,dz:-18.6
 }));
 assert.equal(probe,true);
 await opening.screenshot({path:'surface-v80-artifacts/front-sidewalk.png',timeout:120000});
 const names=new Set(textures.map(url=>url.split('/').pop()));
 assert.deepEqual([...names].sort(),['aged-acoustic-ceiling-albedo.jpg',
  'stained-plaster-ceiling-albedo.jpg','worn-sidewalk-albedo.jpg']);
 assert.deepEqual(remote,[],'all runtime assets must remain same-origin');
 assert.deepEqual(errors,[],'desktop Chromium must run without JavaScript exceptions');
 console.log('PINEWOOD_SURFACE_V80_DESKTOP_PASS '+JSON.stringify({ceilings:model.ceilingMeshes,
  materials:model.ceilingFinishes,sidewalk:finish.name,textures:[...names],remote,errors}));
 await opening.close();
}finally{await browser.close();}
