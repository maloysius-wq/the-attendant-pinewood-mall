import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const failures=[],check=(v,msg)=>{if(!v){failures.push(msg);console.error('V57_FAIL '+msg)}};
await mkdir('opening-v57-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required','--disable-dev-shm-usage']});
try{
 const layout=process.env.V57_LAYOUT||'mobile';
 const dimensions={mobile:[390,844],narrow:[632,748],desktop:[1280,720]};
 if(!dimensions[layout])throw Error('Unsupported V57_LAYOUT '+layout);
 const [width,height]=dimensions[layout];
 const page=await browser.newPage({viewport:{width,height}});
 const pageErrors=[],external=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:4173'))external.push(r.url())});
 await page.goto('http://127.0.0.1:4173/review/the-call-v34/',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>document.getElementById('titleScreen')?.classList.contains('show'),null,{timeout:150000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:30000});
 await page.waitForFunction(()=>['ready','failed'].includes(window.__PINEWOOD_OPENING_V34__?.handheldPhone?.hand?.state),null,{timeout:40000});
 await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.44)});
 await page.waitForTimeout(240);
 const evidence=await page.evaluate(()=>{
  const h=window.__PINEWOOD_OPENING_V34__.qaPlayerHand;
  if(h.state!=='ready')throw Error('Hand load failure '+h.error);
  const mesh=h.skinnedMesh,pos=mesh.geometry.getAttribute('position'),si=mesh.geometry.getAttribute('skinIndex'),sw=mesh.geometry.getAttribute('skinWeight');
  const V=h.model.position.constructor,all=[],read=(a,i)=>[a.getX(i),a.getY(i),a.getZ(i),a.getW(i)];
  const joints=['finger1-1.R','finger1-2.R','finger1-3.R'].map(n=>mesh.skeleton.bones.indexOf(h.bones[n]));
  for(let i=0;i<pos.count;i++){
   const ids=read(si,i),weights=read(sw,i);
   if(ids.reduce((sum,j,k)=>sum+(joints.includes(j)?weights[k]:0),0)>=.25)all.push(i);
  }
  const p=new V();
  function sample(){
   h.model.updateMatrixWorld(true);mesh.skeleton.update();
   const distal=h._probe();let insideCase=0,wholeOverButton=0;
   for(const i of all){
    p.fromBufferAttribute(pos,i);mesh.applyBoneTransform(i,p);
    mesh.localToWorld(p);h.phoneRoot.worldToLocal(p);
    if(p.x>=-.119&&p.x<=.119&&p.y>=-.218&&p.y<=.218&&p.z>=-.020&&p.z<.0249)insideCase++;
    if(p.x>=-.097&&p.x<=.097&&p.y>=-.158&&p.y<=-.113)wholeOverButton++;
   }
   return {pad:distal.pad.toArray(),buttonCount:distal.buttonCount,buttonMinZ:distal.buttonMinZ,
    buttonMinPoint:distal.buttonMinPoint?.toArray()||null,faceMinZ:distal.minZ,
    insideCase,wholeOverButton,penetrated:distal.penetrated};
  }
  const base=h.bones['finger1-1.R'],mid=h.bones['finger1-2.R'],tip=h.bones['finger1-3.R'];
  h.update(0);const rest=[base.quaternion.clone(),mid.quaternion.clone(),tip.quaternion.clone()];
  const anchor=h.point('finger1-1.R'),poses=[];
  for(const t of [0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1,.9,.7,.5,.2,0]){
   h.update(t);
   poses.push({phase:t,...sample(),baseMotion:base.quaternion.angleTo(rest[0]),
    middleMotion:mid.quaternion.angleTo(rest[1]),tipMotion:tip.quaternion.angleTo(rest[2]),
    anchorShift:h.point('finger1-1.R').distanceTo(anchor)});
  }
  h.update(0);
  return {source:h.status.source,scale:h.model.scale.x,boneCount:mesh.skeleton.bones.length,
   vertexCount:pos.count,skinCount:all.length,hasForearm:h.status.hasForearm,
   base:h.point('finger1-1.R').toArray(),middle:h.point('finger1-2.R').toArray(),
   tip:h.point('finger1-3.R').toArray(),poses};
 });
 console.log('V57_'+layout.toUpperCase()+'_ANATOMY='+JSON.stringify(evidence));
 const up=evidence.poses[0],down=evidence.poses[10],lift=evidence.poses[evidence.poses.length-1];
 check(evidence.source.includes('MakeHuman')&&evidence.hasForearm&&evidence.vertexCount>9000,
  'connected source-skinned right forearm missing');
 check(evidence.scale>=2.35&&evidence.scale<=2.45,'hand size no longer roughly double original');
 check(up.buttonCount<=10&&up.wholeOverButton<=15,
  'idle thumb obscures CHECK IN instead of hovering clear: '+JSON.stringify(up));
 check(up.pad[2]>=.11&&up.pad[2]>down.pad[2]+.04&&up.pad[1]>=down.pad[1]+.06,
  'straight raised thumb is not lifted above button: '+JSON.stringify({up:up.pad,down:down.pad}));
 check(down.buttonCount>=100&&down.buttonMinPoint?.[0]>=.015&&down.buttonMinPoint?.[0]<=.095
  &&down.buttonMinPoint?.[1]>=-.158&&down.buttonMinPoint?.[1]<=-.113,
  'fleshy thumb did not reach the CHECK IN button within its physical edge clearance: '+JSON.stringify(down));
 check(down.buttonMinZ!==null&&down.buttonMinZ>=.0249&&down.buttonMinZ<=.034,
  'thumb did not make near-surface contact safely: '+JSON.stringify(down));
 check(down.baseMotion>=.15&&down.middleMotion<.02&&down.tipMotion<.02&&down.anchorShift<.004,
  'tap must hinge entire straight thumb at its hand attachment, not curl the last knuckle: '+JSON.stringify(down));
 check(evidence.poses.every(p=>p.insideCase===0&&p.penetrated===0&&(p.faceMinZ===null||p.faceMinZ>=.0249)),
  'thumb intersects glass or solid chassis at an intermediate phase: '+
  JSON.stringify(evidence.poses.map(p=>[p.phase,p.insideCase,p.penetrated,p.faceMinZ])));
 check(lift.baseMotion<.01&&Math.hypot(...up.pad.map((x,i)=>x-lift.pad[i]))<.001,
  'thumb did not return to exact elevated resting pose');
 check(!pageErrors.length&&!external.length,'browser errors or nonlocal requests '+JSON.stringify({pageErrors,external}));
 await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.44)});
 await page.waitForTimeout(200);
 await page.screenshot({path:'opening-v57-artifacts/'+layout+'-hover.png'});
 console.log('V57_'+layout.toUpperCase()+'_HOVER_JPEG='+(await page.screenshot({type:'jpeg',quality:66})).toString('base64'));
 await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.62)});
 await page.waitForTimeout(230);
 await page.screenshot({path:'opening-v57-artifacts/'+layout+'-tap.png'});
 console.log('V57_'+layout.toUpperCase()+'_TAP_JPEG='+(await page.screenshot({type:'jpeg',quality:66})).toString('base64'));
 await page.evaluate(()=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.82)});
 await page.waitForTimeout(200);
 await page.screenshot({path:'opening-v57-artifacts/'+layout+'-released.png'});
 console.log('V57_'+layout.toUpperCase()+'_RELEASE_JPEG='+(await page.screenshot({type:'jpeg',quality:66})).toString('base64'));
 await page.close();
}finally{await browser.close()}
if(failures.length)throw Error('V57 mobile straight thumb regression failed ('+failures.length+'): '+failures.join('; '));
