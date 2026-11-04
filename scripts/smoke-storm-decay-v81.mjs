import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const host='http://127.0.0.1:4173';
await mkdir('storm-v81-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],remote=[],images=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{
  if(/^https?:/.test(r.url())&&!r.url().startsWith(host))remote.push(r.url());
  if(r.url().includes('storm-night-sky.jpg'))images.push(r.url());
 });
 await page.goto(host+'/review/the-call-v34/',{waitUntil:'domcontentloaded'});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:170000});
 const exterior=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.exteriorDecay);
 assert.equal(exterior.skyIsTexture,true,'actual textured storm sky');
 assert.equal(exterior.skyFile,'storm-night-sky.jpg','preloaded original panoramic sky');
 assert.equal(exterior.plants.length,8,'all eight imported planters remain');
 for(const [index,p]of exterior.plants.entries()){
  assert.ok(p.pot&&p.bush,'authentic planter and shrub '+index);
  assert.equal(p.potColor,'21332f','planter color must match the sign');
  assert.ok(p.vertexColors>50,'nonuniform dying leaf material '+index);
 }
 assert.ok(new Set(exterior.plants.map(p=>p.bushTilt.join(','))).size>=5,'shrub droop should not be identical');
 assert.ok(images.length>=1,'same-origin sky texture must be fetched');
 const probe=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.qaCockpitProbe({
  x:-4,y:1.85,z:-9,dx:-12,dy:24,dz:-28
 }));
 assert.equal(probe,true);
 await page.screenshot({path:'storm-v81-artifacts/01-cloudy-night.png',timeout:120000});
 await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.qaCockpitProbe({
  x:-8,y:1.65,z:-7.5,dx:-10.5,dy:1.4,dz:-17.7
 }));
 await page.screenshot({path:'storm-v81-artifacts/02-dying-planters.png',timeout:120000});
 await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.seek(7));
 const timing=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.captionTiming);
 const phaseFor=p=>(timing.voiceSeconds+(timing.waitSeconds-timing.voiceSeconds)*p)/timing.waitSeconds;
 await page.evaluate(f=>window.__PINEWOOD_OPENING_V34__.scrub(f),phaseFor(.375));
 await page.waitForTimeout(380);
 const pose=await page.evaluate(()=>{
  const q=window.__PINEWOOD_OPENING_V34__,h=q.qaKeypadHand,
   b=h?.bones||{};
  const point=n=>b[n].getWorldPosition(b[n].position.clone());
  const bend=n=>point('finger'+n+'-2.R').clone().sub(point('finger'+n+'-1.R'))
   .angleTo(point('finger'+n+'-3.R').clone().sub(point('finger'+n+'-2.R')));
  return {visible:q.keypadView?.finger?.visible,digit:q.keypadView?.finger?.digit,
   angles:Object.fromEntries([1,2,3,4,5].map(n=>[n,bend(n)])),
   phoneReady:q.qaPlayerHand?.state};
 });
 assert.equal(pose.digit,5);
 assert.ok(pose.visible);
 assert.ok(pose.angles[2]<.28,'native index remains pointing');
 for(const n of [3,4,5])assert.ok(pose.angles[n]>.42&&pose.angles[n]<1.65,
  'native finger '+n+' folds naturally toward palm');
 assert.deepEqual(remote,[]);
 assert.deepEqual(errors,[]);
 console.log('PINEWOOD_STORM_DECAY_V81_PASS '+JSON.stringify({exterior,pose,errors,remote}));
}finally{await browser.close();}
