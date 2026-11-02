import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173';
await mkdir('opening-v63-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required']});
try{
 for(const [name,width,height] of [['desktop',1280,720],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[],remote=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(/^https?:/.test(request.url())&&!request.url().startsWith(origin))remote.push(request.url());});
  await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#newBtn')&&window.__PINEWOOD_OPENING_V34__,null,{timeout:60000});
  await page.locator('#newBtn').click();
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:110000});
  const env=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.environmentV37);
  if(env.landscape?.state!=='ready'||env.landscape?.count!==8||
     env.landscape?.modelFiles?.length!==2)throw Error(name+' no imported v63 models: '+JSON.stringify(env.landscape));
  // Deterministic seek/scrub only; never manual WASD.
  for(const [cue,phase,label] of [[6,.75,'approach'],[7,.95,'planters'],[8,.20,'service-route']]){
   await page.evaluate(({cue,phase})=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(cue);s.scrub(phase);},{cue,phase});
   await page.waitForTimeout(650);
   await page.screenshot({path:'opening-v63-artifacts/'+name+'-'+label+'.png'});
  }
  if(errors.length||remote.length)throw Error(name+' JS errors/remote asset requests: '+JSON.stringify({errors,remote}));
  console.log('V63_'+name.toUpperCase()+'_PASS '+JSON.stringify({landscape:env.landscape,errors,remote}));
  await page.close();
 }
}finally{await browser.close();}
