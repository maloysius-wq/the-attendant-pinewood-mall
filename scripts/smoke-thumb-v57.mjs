import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const failures=[];
function check(ok,msg){if(!ok){failures.push(msg);console.error('V57_FAIL '+msg)}}
await mkdir('opening-v57-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const pageErrors=[],external=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:4173'))external.push(r.url())});
 await page.goto('http://127.0.0.1:4173/review/the-call-v34/',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>document.getElementById('titleScreen')?.classList.contains('show'),null,{timeout:150000});
 await page.locator('#newBtn').click();
 await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:30000});
 await page.waitForFunction(()=>['ready','failed'].includes(window.__PINEWOOD_OPENING_V34__?.handheldPhone?.hand?.state),null,{timeout:40000});
 await page.evaluate(()=>{let s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(.44)});
 await page.waitForTimeout(240);
 const evidence=await page.evaluate(()=>{
  const h=window.__PINEWOOD_OPENING_V34__.qaPlayerHand;
  if(h.state!=='ready')throw Error('Hand load failure '+h.error);
  const mesh=h.skinnedMesh,pos=mesh.geometry.getAttribute('position'),si=mesh.geometry.getAttribute('skinIndex'),sw=mesh.geometry.getAttribute('skinWeight');
  const Q=h.model.quaternion.constructor,V=h.model.position.constructor;
  const ids=[],all=[],read=(a,i)=>[a.getX(i),a.getY(i),a.getZ(i),a.getW(i)];
  const joints=['finger1-1.R','finger1-2.R','finger1-3.R'].map(n=>mesh.skeleton.bones.indexOf(h.bones[n]));
  for(let i=0;i<pos.count;i++){
   const boneIds=read(si,i),weights=read(sw,i);
   if(boneIds.some((j,k)=>j===joints[2]&&weights[k]>=.30))ids.push(i);
   if(boneIds.reduce((s,j,k)=>s+(joints.includes(j)?weights[k]:0),0)>=.25)all.push(i);
  }
  const scratch=new V();
  function sample(){
   h.model.updateMatrixWorld(true);mesh.skeleton.update();
   const point=h._probe();let insideCase=0,allOverButton=0,distalInsideCase=0,contactX=point.buttonMinPoint?.x??null;
   for(const i of all){
    scratch.fromBufferAttribute(pos,i);mesh.applyBoneTransform(i,scratch);
    mesh.localToWorld(scratch);h.phoneRoot.worldToLocal(scratch);
    if(scratch.x>=-.119&&scratch.x<=.119&&scratch.y>=-.218&&scratch.y<=.218&&scratch.z>=-.020&&scratch.z<.0249)insideCase++;
    if(scratch.x>=-.097&&scratch.x<=.097&&scratch.y>=-.158&&scratch.y<=-.113)allOverButton++;
   }
   return {pad:point.pad.toArray(),buttonCount:point.buttonCount,allOverButton,buttonMinZ:point.buttonMinZ,
    contact:point.buttonMinPoint?.toArray()||null,faceMinZ:point.minZ,insideCase,contactX,distalInsideCase};
  }
  const base=h.bones['finger1-1.R'],mid=h.bones['finger1-2.R'],dist=h.bones['finger1-3.R'];
  const jointsOriginal=[base.quaternion.clone(),mid.quaternion.clone(),dist.quaternion.clone()];
  const rootOriginal=h.model.position.clone();
  function reset(){[base,mid,dist].forEach((b,i)=>b.quaternion.copy(jointsOriginal[i]));h.model.position.copy(rootOriginal);h.model.updateMatrixWorld(true)}
  const phoneQ=h.phoneRoot.getWorldQuaternion(new Q());
  function rotatePhone(bone,rotation){
   h.model.updateMatrixWorld(true);
   const parentQ=bone.parent.getWorldQuaternion(new Q());
   const local=parentQ.clone().invert().multiply(phoneQ).multiply(rotation)
    .multiply(phoneQ.clone().invert()).multiply(parentQ);
   bone.quaternion.premultiply(local);h.model.updateMatrixWorld(true);
  }
  function point(n){return h.point(n)}
  function align(bone,a,b,fraction=1){
   const q=new Q().setFromUnitVectors(a.normalize(),b.normalize());
   rotatePhone(bone,new Q().identity().slerp(q,fraction));
  }
  function straighten(middleFraction,distalFraction){
   let a=point('finger1-2.R').sub(point('finger1-1.R')),
    b=point('finger1-3.R').sub(point('finger1-2.R'));
   align(mid,b,a,middleFraction);
   a=point('finger1-3.R').sub(point('finger1-2.R'));
   b=new V().fromArray(sample().pad).sub(point('finger1-3.R'));
   align(dist,b,a,distalFraction);
  }
  // Establish a pressed pose by aiming the WHOLE straight thumb from the real hand root.
  // Shift only the static rig's overall placement; contact animation itself will rotate BASE.
  function pressSetup(destination){
   const boneBase=point('finger1-1.R'),flesh=new V().fromArray(sample().pad);
   align(base,flesh.sub(boneBase),destination.clone().sub(boneBase),1);
   let p=sample(),fix=destination.clone().sub(new V().fromArray(p.pad));
   h.model.position.add(fix);h.model.updateMatrixWorld(true);
   p=sample();
   if(p.faceMinZ!==null){h.model.position.z+=.0258-p.faceMinZ;h.model.updateMatrixWorld(true);p=sample()}
   return {press:p,staticOffset:h.model.position.clone().sub(rootOriginal).toArray(),base:point('finger1-1.R').toArray(),middle:point('finger1-2.R').toArray(),tip:point('finger1-3.R').toArray()};
  }
  const nativeBase=point('finger1-1.R').toArray(),nativeMiddle=point('finger1-2.R').toArray(),nativeTip=point('finger1-3.R').toArray();
  const v55Hold=sample();h.update(1);const v55Tap=sample();h.update(0);
  const nativeJointAngles=[base.quaternion.angleTo(jointsOriginal[0]),mid.quaternion.angleTo(jointsOriginal[1]),dist.quaternion.angleTo(jointsOriginal[2])];
  const candidates=[];
  for(const mf of [.6,1]){
   for(const df of [.75,1]){
    for(const targetX of [-.04,-.025,-.01,.005]){
     for(const targetY of [-.14,-.13]){
      reset();straighten(mf,df);
      const pre=pressSetup(new V(targetX,targetY,.031)),qDown=base.quaternion.clone(),rDown=h.model.position.clone();
      for(const dx of [0,.01]){
       for(const dz of [.004,.006,.008]){
        h.model.position.copy(rDown).add(new V(dx,0,dz));h.model.updateMatrixWorld(true);
        const down=sample(),rootPoint=point('finger1-1.R'),downPad=new V().fromArray(down.pad);
        for(const hx of [0,.025,.05]){
         for(const hy of [-.10,-.08]){
          for(const hz of [.13,.17]){
           base.quaternion.copy(qDown);h.model.updateMatrixWorld(true);
           align(base,downPad.clone().sub(rootPoint),new V(hx,hy,hz).sub(rootPoint));
           const up=sample();
           const validDown=down.insideCase===0&&down.buttonCount>=30&&down.buttonMinZ!==null
            &&down.buttonMinZ>=.0247&&down.buttonMinZ<=.034&&down.contactX<=.082;
           const validUp=up.insideCase===0&&up.buttonCount<=25&&up.allOverButton<=30
            &&up.pad[2]>=.07&&(up.faceMinZ===null||up.faceMinZ>=.045)
            &&up.pad[2]>=down.pad[2]+.027;
           const score=(validDown?0:1000)+(validUp?0:300)
            +Math.abs((down.contactX??.2)-.055)*200+Math.abs((down.buttonMinZ??.08)-.027)*400
            +Math.max(0,.045-(up.pad[2]-down.pad[2]))*500+down.insideCase*3+up.insideCase*3
            +Math.abs(pre.staticOffset[0]+dx)*3+up.allOverButton*.05;
           candidates.push({mf,df,targetX,targetY,dx,dz,hx,hy,hz,score,down,hover:up,
            staticOffset:pre.staticOffset,base:pre.base,middle:pre.middle,tip:pre.tip,validUp,validDown});
           base.quaternion.copy(qDown);
          }
         }
        }
       }
      }
     }
    }
   }
  }
  reset();
  const ranked=candidates.sort((a,b)=>a.score-b.score);
  const passing=ranked.filter(c=>c.validUp&&c.validDown);
  return {native:{base:nativeBase,middle:nativeMiddle,tip:nativeTip,hold:v55Hold,tap:v55Tap,jointAngles:nativeJointAngles},
   candidateCount:candidates.length,passing:passing.slice(0,25),best:ranked.slice(0,30)};
 });
 console.log('V57_ANATOMY='+JSON.stringify(evidence.native));
 console.log('V57_BASE_SWEEP='+JSON.stringify({count:evidence.candidateCount,passing:evidence.passing,best:evidence.best}));
 const {hold,tap}=evidence.native;
 check(hold.allOverButton<=30,'hover covers CHECK IN button with '+hold.allOverButton+' source thumb vertices');
 check(tap.contactX!==null&&tap.contactX<=.082&&tap.buttonCount>=30,'tap is not visibly inside button: '+JSON.stringify(tap));
 check(evidence.native.jointAngles[0]>.10,'thumb base did not move during the click; expected a pivot at its attachment');
 check(hold.insideCase===0&&tap.insideCase===0,'thumb intersects physical case');
 check(!external.length&&!pageErrors.length,'browser errors/remote requests '+JSON.stringify({pageErrors,external}));
 await page.screenshot({path:'opening-v57-artifacts/mobile-v55-baseline.png'});
 console.log('V57_BASELINE_JPEG='+(await page.screenshot({type:'jpeg',quality:55})).toString('base64'));
 await page.close();
}finally{await browser.close()}
if(failures.length)throw Error('V57 RED expected baseline failures: '+failures.join('; '));
