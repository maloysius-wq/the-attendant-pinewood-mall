import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173';
await mkdir('mall-v66-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 for(const [name,width,height]of [['desktop',1440,900],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
  await page.goto(origin+'/review/mall-masterplan-v66/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__PINEWOOD_MALL_MASTERPLAN_V66__?.ready,null,{timeout:60000});
  const inspect=()=>page.evaluate(()=>window.__PINEWOOD_MALL_MASTERPLAN_V66__.getState());
  let info=await inspect();
  assert.equal(info.rooms,41);
  assert.equal(info.links,46);
  assert.equal(info.evidence,9);
  assert.deepEqual(info.errors,[]);
  assert.equal(info.renderer,'webgl');
  assert.equal(info.floor,'G');
  await page.screenshot({path:'mall-v66-artifacts/'+name+'-ground-and-atrium.png',fullPage:true});
  const captures=[['B1',2,'below-grade'],['G',4,'east-wing'],['M1',5,'administrative-mezzanine'],['G',6,'final-exit']];
  for(const [floor,chapter,label]of captures){
   await page.locator('[data-floor="'+floor+'"]').click();
   await page.locator('#chapter').selectOption(String(chapter));
   await page.waitForTimeout(300);
   info=await inspect();
   assert.equal(info.floor,floor,name+' '+label+' floor');
   assert.equal(info.chapter,chapter,name+' '+label+' chapter');
   assert.ok(info.roomCount>4,name+' '+label+' rooms');
   assert.ok(info.visibleRouteSteps>0,name+' '+label+' path');
   await page.screenshot({path:'mall-v66-artifacts/'+name+'-'+label+'.png',fullPage:true});
  }
  assert.equal(await page.locator('[data-landmark="e17_false_route"]').count(),1,'E17 false-route marker remains physically present');
  await page.locator('#route-toggle').click();
  assert.equal((await inspect()).showRoute,false);
  await page.locator('#route-toggle').click();
  assert.equal((await inspect()).showRoute,true);
  assert.deepEqual(errors,[],name+' javascript errors');
  assert.deepEqual(remote,[],name+' external runtime calls');
  await writeFile('mall-v66-artifacts/'+name+'-audit.json',JSON.stringify({info,errors,remote},null,2));
  console.log('MALL_V66_'+name.toUpperCase()+'_PASS '+JSON.stringify({rooms:info.rooms,links:info.links,evidence:info.evidence,errors,remote}));
  await page.close();
 }
}finally{await browser.close();}