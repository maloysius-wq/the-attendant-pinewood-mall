import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const origin='http://127.0.0.1:4173';
const errors=[],failures=[];
const check=(ok,msg)=>{if(!ok){failures.push(msg);console.error('V55_FAIL '+msg)}};
await mkdir('opening-v55-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required',
 '--disable-dev-shm-usage']});
try{
 for(const [layout,width,height] of [['desktop',1280,720],['narrow',632,748],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}});
  const remote=[],pageErrors=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
  page.on('pageerror',e=>pageErrors.push(e.message));
  await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>document.getElementById('titleScreen')?.classList.contains('show'),null,{timeout:150000});
  await page.locator('#newBtn').click();
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:30000});
  await page.waitForFunction(()=>['ready','failed'].includes(window.__PINEWOOD_OPENING_V34__?.handheldPhone?.hand?.state),null,{timeout:40000});
  await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.44)});
  await page.waitForTimeout(280);
  const status=await page.evaluate(()=>{
   const h=window.__PINEWOOD_OPENING_V34__.qaPlayerHand;
   if(!h?.model)throw Error('Missing original source-skinned hand');
   const mesh=h.model.getObjectByProperty('type','SkinnedMesh');
   if(!mesh)throw Error('No original source SkinnedMesh');
   const sk=mesh.skeleton,boneId=sk.bones.findIndex(b=>b.name==='finger1-3R');
   if(boneId<0)throw Error('Missing original distal-thumb skin bone');
   const ix=mesh.geometry.getAttribute('skinIndex'),wt=mesh.geometry.getAttribute('skinWeight');
   const pos=mesh.geometry.getAttribute('position');
   const ids=[],read=(attr,i)=>[attr.getX(i),attr.getY(i),attr.getZ(i),attr.getW(i)];
   for(let i=0;i<pos.count;i++){
    const joints=read(ix,i),weights=read(wt,i);
    if(joints.some((j,k)=>j===boneId&&weights[k]>=.30))ids.push(i);
   }
   if(ids.length<10)throw Error('Real distal thumb skin patch missing: '+ids.length);
   const THREE=h.model.position.constructor;
   const origin=new THREE(),point=new THREE(),tmp=new THREE(),padId=ids[0];
   const two=h.point('finger1-2.R'),three=h.point('finger1-3.R'),axis=three.clone().sub(two).normalize();
   const sample=()=>{
    mesh.updateWorldMatrix(true,true);sk.update();
    let max=-Infinity,min=Infinity,inFace=0,penetrated=0;
    let pad=ids[0];
    for(const i of ids){
     point.fromBufferAttribute(pos,i);mesh.applyBoneTransform(i,point);
     mesh.localToWorld(point);h.phoneRoot.worldToLocal(point);
     const advance=tmp.copy(point).sub(three).dot(axis);
     if(advance>max){max=advance;pad=i;}
     if(point.x>=-.109&&point.x<=.109&&point.y>=-.198&&point.y<=.188){
      inFace++;min=Math.min(min,point.z);
      if(point.z<.024-.001)penetrated++;
     }
    }
    point.fromBufferAttribute(pos,pad);mesh.applyBoneTransform(pad,point);
    mesh.localToWorld(point);h.phoneRoot.worldToLocal(point);
    return {pad:point.toArray(),inFace,faceMinZ:inFace?min:null,penetrated,patchCount:ids.length};
   };
   const poses=[],base=h.point('finger1-1.R').clone(),middle=h.point('finger1-2.R').clone(),
    proximalA=h.bones['finger1-1.R'].quaternion.clone(),proximalB=h.bones['finger1-2.R'].quaternion.clone(),
    distal=h.bones['finger1-3.R'].quaternion.clone();
   for(const t of [0,.2,.4,.6,.8,1,.8,.4,0]){
    h.update(t);
    poses.push({phase:t,...sample(),
     baseShift:h.point('finger1-1.R').distanceTo(base),
     middleShift:h.point('finger1-2.R').distanceTo(middle),
     rootA:h.bones['finger1-1.R'].quaternion.angleTo(proximalA),
     rootB:h.bones['finger1-2.R'].quaternion.angleTo(proximalB),
     tipBend:h.bones['finger1-3.R'].quaternion.angleTo(distal)});
   }
   h.update(0);
   return {source:h.status.source,scale:h.model.scale.x,poses};
  });
  console.log('V55_'+layout.toUpperCase()+'_ANATOMY='+JSON.stringify(status));
  const hold=status.poses[0],contact=status.poses[5],release=status.poses[8];
  check(status.source.includes('MakeHuman'),layout+' lost original CC0 connected model');
  check(status.scale>=2.35&&status.scale<=2.45,layout+' hand is not roughly twice original size: '+status.scale);
  check(hold.pad[2]>=.059,layout+' thumb pad not at least 35mm above phone glass at rest: '+JSON.stringify(hold));
  check(contact.inFace>=10&&contact.pad[0]>=-.097&&contact.pad[0]<=.097
    &&contact.pad[1]>=-.158&&contact.pad[1]<=-.113&&contact.pad[2]>=.024
    &&contact.pad[2]<=.035,layout+' real thumb PAD must touch CHECK IN from above: '+JSON.stringify(contact));
  check(status.poses.every(p=>p.penetrated===0),
    layout+' native skin passed into phone glass: '+JSON.stringify(status.poses.map(p=>[p.phase,p.penetrated,p.faceMinZ])));
  check(status.poses.every(p=>p.rootA<.04&&p.rootB<.04
    &&p.baseShift<.005&&p.middleShift<.005),
    layout+' proximal thumb moved instead of distal tip: '+JSON.stringify(status.poses.map(p=>[p.phase,p.rootA,p.rootB,p.middleShift])));
  check(contact.tipBend>.10,layout+' distal thumb joint never flexed onto glass');
  check(Math.hypot(...hold.pad.map((x,i)=>x-release.pad[i]))<.001,
    layout+' thumb did not return exactly to hover after releasing');
  await page.screenshot({path:'opening-v55-artifacts/'+layout+'-hover.png'});
  console.log('V55_'+layout.toUpperCase()+'_HOVER_JPEG='+(await page.screenshot({type:'jpeg',quality:58})).toString('base64'));
  await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.62)});
  await page.waitForTimeout(260);
  await page.screenshot({path:'opening-v55-artifacts/'+layout+'-tap.png'});
  console.log('V55_'+layout.toUpperCase()+'_TAP_JPEG='+(await page.screenshot({type:'jpeg',quality:60})).toString('base64'));
  await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.82)});
  await page.waitForTimeout(260);
  await page.screenshot({path:'opening-v55-artifacts/'+layout+'-release.png'});
  console.log('V55_'+layout.toUpperCase()+'_RELEASE_JPEG='+(await page.screenshot({type:'jpeg',quality:58})).toString('base64'));
  check(!remote.length&&!pageErrors.length,layout+' nonlocal fetches or browser errors: '+JSON.stringify({remote,pageErrors}));
  await page.close();
 }
}finally{await browser.close()}
if(failures.length)throw Error('V55 geometry/visual failed ('+failures.length+'):\n'+failures.join('\n'));
