import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173';
const assert=(x,m)=>{if(!x)throw Error(m)};
await mkdir('opening-v48-focus-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist',
 '--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required',
 '--disable-dev-shm-usage']});
try{
 for(const [kind,w,h] of [['desktop',1280,720],['narrow',632,748],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width:w,height:h}}),errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
  await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>document.getElementById('titleScreen')?.classList.contains('show'),null,{timeout:150000});
  await page.locator('#newBtn').click();
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:30000});
  await page.waitForFunction(()=>{
   const s=window.__PINEWOOD_OPENING_V34__;
   return s?.handheldPhone?.hand?.state==='ready'||s?.handheldPhone?.hand?.state==='failed';
  },null,{timeout:35000});
  const rig=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.handheldPhone.hand);
  assert(rig.state==='ready'&&rig.hasForearm&&rig.boneCount>=20&&rig.thumbBones===3,
   kind+' real source arm rig not loaded: '+JSON.stringify(rig));
  await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.44)});
  await page.waitForTimeout(230);
  const hold=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.handheldPhone);
  const bounds=hold.screenViewport;
  const width=bounds.right-bounds.left,height=bounds.bottom-bounds.top;
  assert(bounds.left>.48&&bounds.right<.96&&bounds.top>.30&&bounds.bottom<.94
    &&width>.08&&width<.46&&height>.20&&height<.56,
    kind+' phone is oversized, clipped or badly composed: '+JSON.stringify(bounds));
  // Pausing may not stamp a huge word across the entire cinematic frame.
  await page.locator('[data-intro-pause]').click();
  const pauseStyle=await page.evaluate(()=>{
   const s=getComputedStyle(document.getElementById('pwm-opening'),'::before');
   return {size:parseFloat(s.fontSize),bottom:s.bottom,top:s.top};
  });
  assert(pauseStyle.size<=16&&pauseStyle.bottom!=='auto',
   kind+' oversized pause text obscures the scene: '+JSON.stringify(pauseStyle));
  await page.screenshot({path:'opening-v48-focus-artifacts/'+kind+'-paused.png'});
  await page.locator('[data-intro-pause]').click();
  if(w<=690){
   const caption=await page.locator('.pwm-caption-area').evaluate(el=>{
    const b=el.getBoundingClientRect();return {bottom:b.bottom,top:b.top};
   });
   assert(caption.bottom<h*bounds.top-.015*h,
    kind+' caption overlaps the handheld screen: '+JSON.stringify({caption,bounds}));
  }
  await page.screenshot({path:'opening-v48-focus-artifacts/'+kind+'-hold.png'});
  console.log('V49_HOLD_'+kind.toUpperCase()+'_BOUNDS='+JSON.stringify(bounds));
  console.log((kind==='desktop'?'V48_FOCUSED_HOLD_DESKTOP_JPEG=':'V48_FOCUSED_HOLD_MOBILE_JPEG=')
    +(await page.screenshot({type:'jpeg',quality:48})).toString('base64'));
  await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.62)});
  await page.waitForTimeout(230);
  const tap=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.handheldPhone);
  console.log('V48_FOCUSED_'+kind.toUpperCase()+'_TAP='+JSON.stringify(tap.hand));
  assert(tap.tap&&tap.hand.thumbTipDistance!==null&&tap.hand.thumbTipDistance<.048,
   kind+' original thumb fails physical button contact: '+JSON.stringify(tap.hand));
  await page.screenshot({path:'opening-v48-focus-artifacts/'+kind+'-tap.png'});
  console.log((kind==='desktop'?'V48_FOCUSED_TAP_DESKTOP_JPEG=':'V48_FOCUSED_TAP_MOBILE_JPEG=')
    +(await page.screenshot({type:'jpeg',quality:48})).toString('base64'));
  assert(!remote.length,'Remote assets loaded: '+remote);
  assert(!errors.length,'Browser errors: '+errors);
  console.log('PASS '+kind+' source skinned CC0 forearm grip + thumb button contact');
  await page.close();
 }
}finally{await browser.close()}
