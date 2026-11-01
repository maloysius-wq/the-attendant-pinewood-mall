import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173';
const failures=[];
const assert=(v,message)=>{if(!v){failures.push(message);console.error('V54_ASSERTION '+message)}};
await mkdir('opening-v54-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required',
 '--disable-dev-shm-usage']});
try{
 for(const [kind,width,height] of [['desktop',1280,720],['narrow',632,748],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}}),remote=[],errors=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>document.getElementById('titleScreen')?.classList.contains('show'),null,{timeout:150000});
  await page.locator('#newBtn').click();
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:30000});
  await page.waitForFunction(()=>{
   const h=window.__PINEWOOD_OPENING_V34__?.handheldPhone?.hand;
   return h?.state==='ready'||h?.state==='failed';
  },null,{timeout:35000});
  await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.44)});
  await page.waitForTimeout(350);
  const hold=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.handheldPhone);
  console.log('V54_'+kind.toUpperCase()+'_HOLD='+JSON.stringify(hold.hand));
  await page.screenshot({path:'opening-v54-artifacts/'+kind+'-hold.png'});
  console.log('V54_'+kind.toUpperCase()+'_HOLD_JPEG='+(await page.screenshot({type:'jpeg',quality:60})).toString('base64'));
  const h=hold.hand;
  assert(h.state==='ready',kind+' new arm failed: '+h.error);
  assert(h.source.includes('MakeHuman')&&h.hasForearm&&h.boneCount===163
    &&h.vertexCount>6000&&h.skinnedMeshes===1&&h.thumbBones===3
    &&h.sourceThumbContinuity,kind+' MUST be source high-detail connected arm: '+JSON.stringify(h));
  assert(h.gripThumbTipPosition[0]>.080&&h.gripThumbTipPosition[1]<-.145,
   kind+' resting thumb must wait alongside the button, not obscure its label');
  const b=hold.screenViewport;
  assert(b.left>.48&&b.right<.96&&b.top>.30&&b.bottom<.94,
   kind+' existing phone composition changed: '+JSON.stringify(b));
  const wrist=h.gripWristPosition,base=h.gripThumbBasePosition,middle=h.gripThumbMiddlePosition,tip=h.gripThumbTipPosition;
  assert(wrist&&base&&middle&&tip,kind+' real joint locations missing');
  assert(base[0]>tip[0]+.020&&base[1]<tip[1]-.020,
   kind+' thumb must originate at right/lower knuckle, not appear to grow downward from the screen: '+JSON.stringify(h));
  assert(wrist[2]<-.015,kind+' wrist must be behind the phone case; currently '+JSON.stringify(wrist));
  assert(wrist[1]<base[1]&&wrist[0]>tip[0],
   kind+' forearm must connect anatomically beneath thumb and screen: '+JSON.stringify(h));
  assert(h.gripFingerDirection[2]<-.015&&h.gripFingerDirection[0]<-.025,
   kind+' fingers must aim toward back/left instead of outward: '+JSON.stringify(h));
  for(const [name,p] of Object.entries(h.gripFingerTips)){
   assert(p[2]<.0&&p[0]<.15,kind+' '+name+' must stay behind phone: '+JSON.stringify(p));
  }


  if(kind==='mobile'){
   // Inspect all original knuckles, fingers, thumb, palm and attached arm
   // without the handset hiding source anatomy. Restore the shot afterward.
   const visibility=await page.evaluate(()=>{
    const h=window.__PINEWOOD_OPENING_V34__.qaPlayerHand;
    if(!h?.model)throw Error('Missing review-only source anatomical rig for visibility QA');
    const children=h.phoneRoot.children.filter(o=>o!==h.holder);
    const values=children.map(o=>o.visible);
    children.forEach(o=>o.visible=false);
    return values;
   });
   await page.waitForTimeout(100);
   console.log('V54_MOBILE_UNOBSTRUCTED_HAND_JPEG='+(await page.screenshot({type:'jpeg',quality:75})).toString('base64'));
   await page.evaluate(({visibility})=>{
    const h=window.__PINEWOOD_OPENING_V34__.qaPlayerHand;
    h.phoneRoot.children.filter(o=>o!==h.holder).forEach((o,i)=>o.visible=visibility[i]);
   },{visibility});
  }
  const png=(await page.screenshot({type:'png'})).toString('base64');
  const pixels=await page.evaluate(async({png,b})=>{
   const im=new Image();im.src='data:image/png;base64,'+png;await im.decode();
   const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;
   const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);
   const data=ctx.getImageData(0,0,im.width,im.height).data;
   const x=n=>Math.max(0,Math.min(im.width-1,Math.round(n*im.width)));
   const y=n=>Math.max(0,Math.min(im.height-1,Math.round(n*im.height)));
   const probe=(x0,x1,y0,y1,check)=>{
    let n=0;for(let j=y(y0);j<=y(y1);j+=2)for(let i=x(x0);i<=x(x1);i+=2){
     const o=(j*im.width+i)*4;if(check(data[o],data[o+1],data[o+2]))n++;
    }return n;
   };
   const bh=b.bottom-b.top;
   const textPixels=probe(b.left+.03,b.right-.03,b.top+.06*bh,b.top+.5*bh,
    (r,g,blue)=>r>120&&g>110&&blue>100);
   const skinPixels=probe(b.right-.018,b.right+.110,b.top+.25*bh,b.top+.88*bh,
    (r,g,blue)=>r>80&&r>g*1.15&&g>blue*1.09);
   const blocking=probe(b.left+.15*(b.right-b.left),b.right-.15*(b.right-b.left),
    b.top+.53*bh,b.top+.91*bh,(r,g,blue)=>r>84&&r>g*1.40&&g>blue*1.10);
   const n=((x(b.right-.15*(b.right-b.left))-x(b.left+.15*(b.right-b.left)))/2)
    *((y(b.top+.91*bh)-y(b.top+.53*bh))/2);
   return {textPixels,skinPixels,screenBlockingFraction:blocking/Math.max(1,n)};
  },{png,b});
  console.log('V54_'+kind.toUpperCase()+'_PIXELS='+JSON.stringify(pixels));
  assert(pixels.textPixels>12,kind+' real phone screen unreadable');
  assert(pixels.skinPixels>35,kind+' real adult skin not visible alongside phone');
  assert(pixels.screenBlockingFraction<(kind==='mobile'?.11:.07),
   kind+' hand hides too much of app glass: '+JSON.stringify(pixels));
  await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.62)});
  await page.waitForTimeout(350);
  const tap=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.handheldPhone);
  console.log('V54_'+kind.toUpperCase()+'_TAP='+JSON.stringify(tap.hand));
  await page.screenshot({path:'opening-v54-artifacts/'+kind+'-tap.png'});
  console.log('V54_'+kind.toUpperCase()+'_TAP_JPEG='+(await page.screenshot({type:'jpeg',quality:60})).toString('base64'));
  assert(tap.tap&&tap.hand.thumbTipDistance<.035,
   kind+' source thumb does not contact CHECK IN: '+JSON.stringify(tap.hand));
  const moved=hold.hand.gripThumbTipPosition[2]-tap.hand.gripThumbTipPosition[2];
  assert(moved>.002,kind+' thumb press has no real forward travel: '+moved);
  const slide=Math.hypot(hold.hand.gripThumbTipPosition[0]-tap.hand.gripThumbTipPosition[0],
    hold.hand.gripThumbTipPosition[1]-tap.hand.gripThumbTipPosition[1]);
  assert(slide<.040,kind+' thumb swipes sideways rather than pressing: '+slide);
  assert(tap.hand.gripThumbJointAngles.ThumbA<.35&&tap.hand.gripThumbJointAngles.ThumbB<.35,
   kind+' source thumb was contorted: '+JSON.stringify(tap.hand.gripThumbJointAngles));
  await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.82)});
  await page.waitForTimeout(300);
  await page.locator('[data-intro-pause]').click();
  await page.screenshot({path:'opening-v54-artifacts/'+kind+'-checked-in.png'});
  console.log('V54_'+kind.toUpperCase()+'_CHECKED_IN_JPEG='+(await page.screenshot({type:'jpeg',quality:56})).toString('base64'));
  await page.locator('[data-intro-pause]').click();
  assert(!remote.length,kind+' remote runtime fetches: '+JSON.stringify(remote));
  assert(!errors.length,kind+' browser errors: '+JSON.stringify(errors));
  console.log('V54_CAPTURED_'+kind.toUpperCase()+' genuine CC0 forearm; see final visual QA assertions');
  await page.close();
 }
}finally{await browser.close()}
if(failures.length)throw Error('v54 visual/anatomy failures ('+failures.length+'):\n'+failures.join('\n'));

