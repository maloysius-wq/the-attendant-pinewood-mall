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
  // Assert the actual pixels, not merely that an offscreen CanvasTexture
  // exists. An earlier edit passed rig telemetry while the app rendered BLACK
  // and then passed again with the entire hand invisible behind its glass.
  const framePng=(await page.screenshot({type:'png'})).toString('base64');
  console.log('V52_DEBUG_HOLD_'+kind.toUpperCase()+'='+JSON.stringify(hold.hand));
  console.log('V52_DEBUG_HOLD_'+kind.toUpperCase()+'_JPEG='+(await page.screenshot({type:'jpeg',quality:55})).toString('base64'));
  const pixels=await page.evaluate(async({png,b})=>{
   const img=new Image();img.src='data:image/png;base64,'+png;await img.decode();
   const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;
   const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
   const {data}=ctx.getImageData(0,0,cv.width,cv.height),w=cv.width,h=cv.height;
   const by=b.bottom-b.top,dx=x=>Math.max(0,Math.min(w-1,Math.round(x*w)));
   const dy=y=>Math.max(0,Math.min(h-1,Math.round(y*h)));
   let appTextPixels=0,skinPixels=0,screenBlockingSkin=0,screenBlockingSkinFraction=0;
   const probe=(xmin,xmax,ymin,ymax,condition)=>{
    let hits=0;
    for(let y=dy(ymin);y<=dy(ymax);y+=2)for(let x=dx(xmin);x<=dx(xmax);x+=2){
     const i=(y*w+x)*4;if(condition(data[i],data[i+1],data[i+2]))hits++;
    }
    return hits;
   };
   appTextPixels=probe(b.left+.03,b.right-.03,b.top+.06*by,b.top+.53*by,
    (r,g,bl)=>r>115&&g>110&&bl>105);
   skinPixels=probe(b.right-.018,b.right+.105,b.top+.27*by,b.top+.86*by,
    (r,g,bl)=>r>92&&g>45&&bl>28&&r>g*1.16&&g>bl*1.12);
   const innerLeft=b.left+.15*(b.right-b.left),innerRight=b.right-.15*(b.right-b.left);
   const innerTop=b.top+.55*by,innerBottom=b.top+.91*by;
   screenBlockingSkin=probe(innerLeft,innerRight,innerTop,innerBottom,
    // The pending amber CHECK IN button is NOT skin; require the
    // higher red/green ratio of the original forearm texture.
    (r,g,bl)=>r>92&&g>45&&bl>28&&r>g*1.38&&g>bl*1.14);
   const sampleCount=Math.ceil((dx(innerRight)-dx(innerLeft)+1)/2)
    *Math.ceil((dy(innerBottom)-dy(innerTop)+1)/2);
   screenBlockingSkinFraction=screenBlockingSkin/Math.max(1,sampleCount);
   return {appTextPixels,skinPixels,screenBlockingSkin,screenBlockingSkinFraction};
  },{png:framePng,b:bounds});
  console.log('V49_VISUAL_PIXELS_'+kind.toUpperCase()+'='+JSON.stringify(pixels));
  assert(pixels.appTextPixels>12,kind+' app display is blank in actual Chromium pixels: '+JSON.stringify(pixels));
  assert(pixels.skinPixels>60,kind+' larger CC0 right-hand grip is invisible next to handset: '+JSON.stringify(pixels));
  // Perspective at 390px puts a life-size thumb across a larger fraction of
  // this smaller glass. Permit the natural thumb overlap, but still reject
  // the previous full-palm wedge: desktop/narrow under 5.5%, mobile under 10%.
  const naturalThumbLimit=kind==='mobile'?.10:.055;
  assert(pixels.screenBlockingSkinFraction<naturalThumbLimit,
   kind+' palm/fingers project over too much of the active phone glass: '+JSON.stringify(pixels));
  // v51 had fingers running up/outside the RIGHT side of the phone.
  // All four real fingertips must now tuck leftward behind the physical case.
  const fingerDirection=hold.hand.gripFingerDirection;
  console.log('V50_'+kind.toUpperCase()+'_GRIP_DIRECTION='+JSON.stringify(fingerDirection));
  console.log('V50_'+kind.toUpperCase()+'_ANATOMY='+JSON.stringify(hold.hand));
  if(kind==='desktop')console.log('V50_PRECHECK_DESKTOP_JPEG='+(await page.screenshot({type:'jpeg',quality:52})).toString('base64'));
  assert(fingerDirection[0]<-.04&&fingerDirection[2]<-.025,
   kind+' fingers must curl LEFTWARD and BEHIND phone: '+JSON.stringify(fingerDirection));
  for(const [name,tip] of Object.entries(hold.hand.gripFingerTips||{})){
   assert(tip[0]<.145&&tip[2]<-.02,
    kind+' '+name+' fingertip must lie behind phone chassis: '+JSON.stringify(tip));
  }
  assert(Object.keys(hold.hand.gripFingerTips||{}).length===4,
   kind+' missing original four finger-tip anatomy telemetry');
  assert(hold.hand.gripWristPosition?.[0]>.105&&hold.hand.gripWristPosition?.[2]<-.018,
   kind+' wrist/palm must be anchored behind right chassis: '+JSON.stringify(hold.hand));
  assert(hold.hand.gripThumbDirection[0]>.014,
   kind+' thumb knuckle must emerge outside RIGHT edge; tip bends inward onto glass: '+JSON.stringify(hold.hand));
  await page.screenshot({path:'opening-v48-focus-artifacts/'+kind+'-hold.png'});
  console.log('V49_HOLD_'+kind.toUpperCase()+'_BOUNDS='+JSON.stringify(bounds));
  console.log((kind==='desktop'?'V48_FOCUSED_HOLD_DESKTOP_JPEG=':'V48_FOCUSED_HOLD_MOBILE_JPEG=')
    +(await page.screenshot({type:'jpeg',quality:48})).toString('base64'));
  await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.62)});
  await page.waitForTimeout(230);
  const tap=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.handheldPhone);
  console.log('V48_FOCUSED_'+kind.toUpperCase()+'_TAP='+JSON.stringify(tap.hand));
  assert(tap.tap&&tap.hand.thumbTarget?.[0]>.04&&tap.hand.thumbTipDistance!==null&&tap.hand.thumbTipDistance<.048,
   kind+' original thumb fails physical button contact: '+JSON.stringify(tap.hand));
  await page.screenshot({path:'opening-v48-focus-artifacts/'+kind+'-tap.png'});
  // User's screenshot: PAUSED after CHECKED IN; verify the same shot.
  await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.82)});
  await page.waitForTimeout(230);
  await page.locator('[data-intro-pause]').click();
  await page.screenshot({path:'opening-v48-focus-artifacts/'+kind+'-checked-in-paused.png'});
  if(kind==='desktop')console.log('V50_CHECKED_IN_DESKTOP_JPEG='+(await page.screenshot({type:'jpeg',quality:52})).toString('base64'));
  await page.locator('[data-intro-pause]').click();
  console.log((kind==='desktop'?'V48_FOCUSED_TAP_DESKTOP_JPEG=':'V48_FOCUSED_TAP_MOBILE_JPEG=')
    +(await page.screenshot({type:'jpeg',quality:48})).toString('base64'));
  assert(!remote.length,'Remote assets loaded: '+remote);
  assert(!errors.length,'Browser errors: '+errors);
  console.log('PASS '+kind+' source skinned CC0 forearm grip + thumb button contact');
  await page.close();
 }
}finally{await browser.close()}
