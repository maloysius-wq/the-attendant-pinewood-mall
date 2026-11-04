import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4173';
await mkdir('keypad-v78-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage',
 '--autoplay-policy=no-user-gesture-required'
]});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded'});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.state==='ready',null,{timeout:150000});
 const snapshot=()=>page.evaluate(()=>{
  const q=window.__PINEWOOD_OPENING_V34__,h=q.qaPlayerHand,b=h?.bones||{};
  if(h?.state!=='ready')return {state:h?.state,source:h?.error};
  h.model.updateMatrixWorld(true);
  const point=name=>b[name].getWorldPosition(b[name].position.clone());
  const bend=n=>{
   const a=point('finger'+n+'-1.R'),m=point('finger'+n+'-2.R'),
    d=point('finger'+n+'-3.R');
   return m.clone().sub(a).angleTo(d.clone().sub(m));
  };
  const digit=q.keypadView?.finger?.digit;
  const center=digit?point('wrist.R').clone().set(
   13.52+((digit-1)%3)*.13,1.30-Math.floor((digit-1)/3)*.11,-21.647):null;
  const angles=Object.fromEntries([1,2,3,4,5].map(n=>[n,bend(n)]));
  const indexSkin=q.keypadView?.finger?.indexSkinWorld;
  const keyDistances=center?{
   index:point('finger2-3.R').distanceTo(center),
   indexSkin:indexSkin?point('wrist.R').fromArray(indexSkin).distanceTo(center):null,
   thumb:point('finger1-3.R').distanceTo(center)
  }:null;
  const quats=Object.fromEntries(['finger1-1.R','finger1-2.R','finger1-3.R',
   ...[2,3,4,5].flatMap(n=>[1,2,3].map(k=>'finger'+n+'-'+k+'.R'))]
   .map(n=>[n,b[n].quaternion.toArray()]));
  return {state:h.state,digit,angles,keyDistances,quats,
   modelQuat:h.model.quaternion.toArray(),handVisible:q.keypadView?.finger?.visible,
   forearmVisible:q.keypadView?.forearmVisible,phoneVisible:q.handheldPhone?.visible};
 });
 const seek=async(index,phase)=>{
  await page.evaluate(({index,phase})=>{
   const q=window.__PINEWOOD_OPENING_V34__;
   q.seek(index);q.scrub(phase);
  },{index,phase});
  await page.waitForTimeout(350);
  return snapshot();
 };
 const phoneBefore=await seek(0,.74);
 assert.equal(phoneBefore.state,'ready','the real locally licensed hand must load');
 assert.equal(phoneBefore.phoneVisible,true,'phone grip is visible in check-in');
 await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.seek(7));
 const timing=await page.evaluate(()=>window.__PINEWOOD_OPENING_V34__.captionTiming);
 const phaseFor=p=>(timing.voiceSeconds+(timing.waitSeconds-timing.voiceSeconds)*p)/timing.waitSeconds;
 const digitSamples=[];
 for(const [p,want]of [[.125,1],[.375,5],[.625,8],[.76,3]]){
  const state=await page.evaluate(f=>{
   const q=window.__PINEWOOD_OPENING_V34__;
   q.scrub(f);return q.keypadView?.finger?.digit;
  },phaseFor(p));
  await page.waitForTimeout(330);
  const snap=await snapshot();
  digitSamples.push(snap);
  console.log('KEYPAD_V78_GEOMETRY '+JSON.stringify({p,want,digit:snap.digit,
   angles:snap.angles,distances:snap.keyDistances,
   handVisible:snap.handVisible,forearmVisible:snap.forearmVisible}));
  assert.equal(snap.digit,want,'real fingertip must follow every keyed number');
  assert.ok(snap.handVisible&&snap.forearmVisible,'connected 3D forearm must reach each key');
  assert.ok(snap.angles[2]<.28,'index PIP joint should be straight, not gripping the phone');
  for(const n of [3,4,5])
   assert.ok(snap.angles[n]>.70,'middle, ring and pinky must curl visibly into the palm');
  assert.ok(snap.angles[1]>.32,'thumb must bend into the palm rather than pointing at the pad');
  assert.ok(snap.keyDistances.index<.09,'native index joint must remain behind the contacting skin');
  assert.ok(snap.keyDistances.indexSkin<.029,'actual weighted index fingertip skin must press each button');
  assert.ok(snap.keyDistances.thumb>.070,'thumb must not be the finger pressing the keypad');
 }
 await page.screenshot({path:'keypad-v78-artifacts/01-index-finger-at-pad.png'});
 const phoneAfter=await seek(0,.74);
 for(const [name,before] of Object.entries(phoneBefore.quats)){
  const after=phoneAfter.quats[name];
  assert.ok(Math.hypot(...before.map((n,i)=>n-after[i]))<.002,
   'returning to phone must restore original '+name+' grip');
 }
 assert.ok(Math.hypot(...phoneBefore.modelQuat.map((n,i)=>n-phoneAfter.modelQuat[i]))<.002,
  'model must restore its phone orientation after keypad entry');
 assert.deepEqual(errors,[],'no browser errors');
 assert.deepEqual(remote,[],'no remote runtime assets');
 console.log('KEYPAD_INDEX_V78_PASS '+JSON.stringify({digitSamples:digitSamples.map(s=>({
  digit:s.digit,angles:s.angles,distances:s.keyDistances})),errors,remote}));
}finally{await browser.close()}
