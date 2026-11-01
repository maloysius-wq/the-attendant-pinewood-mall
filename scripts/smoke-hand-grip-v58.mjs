import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const failures=[],check=(yes,msg)=>{if(!yes){failures.push(msg);console.error('V58_FAIL '+msg)}};
const origin='http://127.0.0.1:4173';
await mkdir('opening-v58-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required','--disable-dev-shm-usage']});
try{
 const layouts=[['desktop',1622,919],['mobile',390,844]];
 for(const [name,width,height] of layouts.filter(([n])=>!process.env.V58_LAYOUT||n===process.env.V58_LAYOUT)){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[],remote=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
  await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>document.getElementById('titleScreen')?.classList.contains('show'),null,{timeout:150000});
  await page.locator('#newBtn').click();
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:30000});
  // The v61 opening deliberately keeps its camera and timeline covered until the full scene is ready.
  // Measure the phone only after that covered first frame has been rendered and revealed.
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.startupStatus?.firstFrameRendered &&
   document.getElementById('pwm-opening')?.dataset.preloadState==='ready',null,{timeout:150000});
  await page.waitForFunction(()=>['ready','failed'].includes(window.__PINEWOOD_OPENING_V34__?.qaPlayerHand?.state),null,{timeout:40000});
  const phases=[];
  for(const [label,cue,t] of [['hold','.44',0],['contact','.62',1]]){
   await page.evaluate((at)=>{const s=window.__PINEWOOD_OPENING_V34__;s.seek(0);s.scrub(at)},Number(cue));
   await page.waitForTimeout(220);
   const diagnostic=await page.evaluate((phase)=>{
    const s=window.__PINEWOOD_OPENING_V34__,h=s.qaPlayerHand,mesh=h.skinnedMesh;
    if(h.state!=='ready')throw Error('Source hand failed to load: '+h.error);
    h.update(phase);
    const pos=mesh.geometry.getAttribute('position'),si=mesh.geometry.getAttribute('skinIndex'),sw=mesh.geometry.getAttribute('skinWeight');
    const V=h.model.position.constructor,p=new V(),project=new V();
    const read=(a,i)=>[a.getX(i),a.getY(i),a.getZ(i),a.getW(i)];
    const digits=[1,2,3,4,5].map(d=>{
     const ids=[1,2,3].map(seg=>mesh.skeleton.bones.indexOf(h.bones['finger'+d+'-'+seg+'.R']));
     if(ids.some(x=>x<0))throw Error('missing skinned digit '+d);
     return ids;
    });
    const sets=digits.map(()=>[]),digitName=['Thumb','Index','Middle','Ring','Pinky'];
    for(let i=0;i<pos.count;i++){
     const js=read(si,i),weights=read(sw,i);
     for(let d=0;d<5;d++)
      if(js.reduce((a,j,k)=>a+(digits[d].includes(j)?weights[k]:0),0)>=.25)sets[d].push(i);
    }
    h.model.updateMatrixWorld(true);mesh.skeleton.update();
    const canvas=document.createElement('canvas');canvas.width=innerWidth;canvas.height=innerHeight;
    canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:999999';
    canvas.dataset.v58Overlay='true';document.body.appendChild(canvas);
    const c=canvas.getContext('2d'),camera=h.phoneRoot.parent;camera.updateWorldMatrix(true,false);camera.updateProjectionMatrix();
    const colors=['#ff3245','#27e5fb','#b0f235','#f9b64c','#d699fe'];
    const out=[];
    for(let d=0;d<5;d++){
     const group=sets[d];let solid=0,front=0,atEdge=0,behind=0;
     let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
     const hits=[];
     for(const i of group){
      p.fromBufferAttribute(pos,i);mesh.applyBoneTransform(i,p);mesh.localToWorld(p);
      project.copy(p).project(camera);
      const sx=(project.x+1)*innerWidth/2,sy=(1-project.y)*innerHeight/2;
      h.phoneRoot.worldToLocal(p);
      minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);
      minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
      minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z);
      const inCase=p.x>=-.119&&p.x<=.119&&p.y>=-.218&&p.y<=.218&&p.z>=-.02&&p.z<.0249;
      const overScreen=p.x>=-.109&&p.x<=.109&&p.y>=-.198&&p.y<=.188&&p.z>=.0249;
      const inGlass=p.x>=-.109&&p.x<=.109&&p.y>=-.198&&p.y<=.188&&p.z>=-.02&&p.z<.0249;
      if(inCase)solid++;if(overScreen)front++;if(inGlass)atEdge++;
      if(p.z<-.02)behind++;
      if((inCase||overScreen)&&sx>=0&&sx<innerWidth&&sy>=0&&sy<innerHeight){
       c.fillStyle=colors[d];c.fillRect(sx-1,sy-1,2.5,2.5);
       if(hits.length<5)hits.push([+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)]);
      }
     }
     out.push({name:digitName[d],vertices:group.length,solid,front,atEdge,behind,
      bounds:{x:[minX,maxX],y:[minY,maxY],z:[minZ,maxZ]},hits});
    }
    const allSkin={total:pos.count,solid:0,front:0};
    for(let i=0;i<pos.count;i++){
     p.fromBufferAttribute(pos,i);mesh.applyBoneTransform(i,p);mesh.localToWorld(p);h.phoneRoot.worldToLocal(p);
     if(p.x>=-.119&&p.x<=.119&&p.y>=-.218&&p.y<=.218&&p.z>=-.02&&p.z<.0249)allSkin.solid++;
     if(p.x>=-.109&&p.x<=.109&&p.y>=-.198&&p.y<=.188&&p.z>=.0249)allSkin.front++;
    }
    const thumbBase=h.point('finger1-1.R').toArray();
    const indexBase=h.point('finger2-1.R').toArray();
    const webbingGap=(thumbBase[0]+indexBase[0])/2-.1225;
    return {phase,modelPosition:h.model.position.toArray(),digits:out,allSkin,
     gripThumbBaseGap:+(thumbBase[0]-.1225).toFixed(5),gripWebbingGap:+webbingGap.toFixed(5),thumbBase,indexBase,phoneScreenViewport:s.handheldPhone?.screenViewport,
     thumb:h.status.thumbSurface,source:h.status.source};
   },t);
   phases.push(diagnostic);
   console.log('V58_'+name.toUpperCase()+'_'+label.toUpperCase()+'='+JSON.stringify(diagnostic));
   await page.screenshot({path:'opening-v58-artifacts/'+name+'-'+label+'-annotated.png'});
   await page.evaluate(()=>document.querySelectorAll('canvas[data-v58-overlay]').forEach(c=>c.remove()));
   await page.screenshot({path:'opening-v58-artifacts/'+name+'-'+label+'-clean.png'});
   console.log('V58_'+name.toUpperCase()+'_'+label.toUpperCase()+'_JPEG='+
    (await page.screenshot({type:'jpeg',quality:62})).toString('base64'));
  }

  if(process.env.V59_SWEEP){
   const candidates=await page.evaluate(()=>{
    const h=window.__PINEWOOD_OPENING_V34__.qaPlayerHand,mesh=h.skinnedMesh;
    const pos=mesh.geometry.getAttribute('position'),P=h.model.position.constructor,p=new P();
    const original=h.holder.position.x,results=[];
    for(const delta of [0,-.006,-.008,-.010,-.012,-.014]){
     h.holder.position.x=original+delta;
     for(const phase of [0,1]){
      h.update(phase);h.model.updateMatrixWorld(true);
      let solid=0;
      for(let i=0;i<pos.count;i++){
       p.fromBufferAttribute(pos,i);mesh.applyBoneTransform(i,p);mesh.localToWorld(p);h.phoneRoot.worldToLocal(p);
       if(p.x>=-.119&&p.x<=.119&&p.y>=-.218&&p.y<=.218&&p.z>=-.02&&p.z<.0249)solid++;
      }
      const touch=h.status.thumbSurface;
      results.push({delta,phase,solid,baseGap:+(h.point('finger1-1.R').x-.1225).toFixed(5),
       button:touch.buttonMinPoint,buttonMinZ:touch.buttonMinZ,penetrated:touch.penetrated});
     }
    }
    h.holder.position.x=original;h.update(0);return results;
   });
   console.log('V59_SWEEP_'+name.toUpperCase()+'='+JSON.stringify(candidates));
   const yawCandidates=await page.evaluate(()=>{
    const h=window.__PINEWOOD_OPENING_V34__.qaPlayerHand,mesh=h.skinnedMesh;
    const P=h.model.position.constructor,Q=h.model.quaternion.constructor,p=new P();
    const pos=mesh.geometry.getAttribute('position'),si=mesh.geometry.getAttribute('skinIndex'),sw=mesh.geometry.getAttribute('skinWeight');
    const read=(a,i)=>[a.getX(i),a.getY(i),a.getZ(i),a.getW(i)];
    const ids={};
    for(let d=1;d<=5;d++)ids[d]=[1,2,3].map(n=>mesh.skeleton.bones.indexOf(h.bones['finger'+d+'-'+n+'.R']));
    const bone=h.bones['finger2-1.R'],baseQ=bone.quaternion.clone(),parentQ=bone.parent.getWorldQuaternion(new Q()),phoneQ=h.phoneRoot.getWorldQuaternion(new Q());
    const yAxis=new P(0,1,0).applyQuaternion(phoneQ).applyQuaternion(parentQ.clone().invert()).normalize();
    const original=h.holder.position.x,results=[];
    for(const dx of [-.008,-.010,-.012]){
     h.holder.position.x=original+dx;
     for(const yaw of [-.40,-.30,-.20,-.15,-.10,-.05,0,.05,.10]){
      bone.quaternion.copy(baseQ).premultiply(new Q().setFromAxisAngle(yAxis,yaw));
      h.update(0);h.model.updateMatrixWorld(true);
      const solidByRole={Thumb:0,Index:0,Middle:0,Ring:0,Pinky:0,Palm:0};
      for(let i=0;i<pos.count;i++){
       p.fromBufferAttribute(pos,i);mesh.applyBoneTransform(i,p);mesh.localToWorld(p);h.phoneRoot.worldToLocal(p);
       if(p.x<-.119||p.x>.119||p.y<-.218||p.y>.218||p.z<-.02||p.z>=.0249)continue;
       const js=read(si,i),ws=read(sw,i),mass=[1,2,3,4,5].map(d=>js.reduce((total,j,k)=>total+(ids[d].includes(j)?ws[k]:0),0));
       const best=Math.max(...mass),role=best<.25?'Palm':['Thumb','Index','Middle','Ring','Pinky'][mass.indexOf(best)];
       solidByRole[role]++;
      }
      results.push({dx,yaw,solid:Object.values(solidByRole).reduce((a,b)=>a+b,0),...solidByRole});
     }
    }
    h.holder.position.x=original;bone.quaternion.copy(baseQ);h.update(0);return results;
   });
   console.log('V59_YAW_'+name.toUpperCase()+'='+JSON.stringify(yawCandidates));

  }

  if(process.env.V58_OPTIMIZE){
   const opt=await page.evaluate(()=>{
    const h=window.__PINEWOOD_OPENING_V34__.qaPlayerHand,mesh=h.skinnedMesh;
    const P=h.model.position.constructor,Q=h.model.quaternion.constructor;
    const pos=mesh.geometry.getAttribute('position'),si=mesh.geometry.getAttribute('skinIndex'),sw=mesh.geometry.getAttribute('skinWeight');
    const read=(a,i)=>[a.getX(i),a.getY(i),a.getZ(i),a.getW(i)];
    const phoneQ=h.phoneRoot.getWorldQuaternion(new Q());
    const outputs=[];
    for(const digit of [2,3]){
     const bone=h.bones['finger'+digit+'-1.R'],joints=[1,2,3].map(n=>mesh.skeleton.bones.indexOf(h.bones['finger'+digit+'-'+n+'.R']));
     const indices=[];
     for(let i=0;i<pos.count;i++){const js=read(si,i),weights=read(sw,i);if(js.reduce((sum,j,k)=>sum+(joints.includes(j)?weights[k]:0),0)>=.25)indices.push(i);}
     const q0=bone.quaternion.clone(),parentQ=bone.parent.getWorldQuaternion(new Q());
     const axis=[[1,0,0],[0,1,0],[0,0,1]].map(a=>new P(...a).applyQuaternion(phoneQ).applyQuaternion(parentQ.clone().invert()).normalize());
     const p=new P();
     const probe=()=>{
      h.model.updateMatrixWorld(true);let solid=0,front=0,over=0;
      for(const i of indices){
       p.fromBufferAttribute(pos,i);mesh.applyBoneTransform(i,p);mesh.localToWorld(p);h.phoneRoot.worldToLocal(p);
       if(p.x>=-.119&&p.x<=.119&&p.y>=-.218&&p.y<=.218&&p.z>=-.02&&p.z<.0249)solid++;
       if(p.x>=-.109&&p.x<=.109&&p.y>=-.198&&p.y<=.188&&p.z>=.0249)front++;
       if(p.x>=-.119&&p.x<=.119&&p.y>=-.218&&p.y<=.218)over++;
      }
      return {solid,front,over};
     };
     const score=(d,angle)=>d.solid*10+d.front*3+Math.abs(angle)*20;
     const singles=[];
     for(let axisNo=0;axisNo<3;axisNo++){
      let best={score:Infinity};
      for(let n=-15;n<=15;n++){
       const angle=n*.1;bone.quaternion.copy(q0).premultiply(new Q().setFromAxisAngle(axis[axisNo],angle));
       const sample=probe(),cost=score(sample,angle);
       if(cost<best.score)best={axis:'xyz'[axisNo],angle:+angle.toFixed(2),score:cost,...sample};
      }
      singles.push(best);
     }
     const shiftTrials=[];
     if(digit===2){
      const initialX=h.model.position.x;
      for(const angle of [-1.0,-1.2,-1.4,-1.6,-1.8,-2.0]){
       for(const shift of [0,.01,.02,.03,.04,.05,.06,.08]){
        bone.quaternion.copy(q0).premultiply(new Q().setFromAxisAngle(axis[1],angle));
        h.model.position.x=initialX+shift;
        const hit=probe();
        shiftTrials.push({angle,shift,solid:hit.solid,front:hit.front,
         score:hit.solid*10+hit.front*3+shift*100});
       }
      }
      h.model.position.x=initialX;
      shiftTrials.sort((a,b)=>a.score-b.score);
     }
     bone.quaternion.copy(q0);
     let final=probe(),q=bone.quaternion.clone(),history=[];
     for(let iteration=0;iteration<3;iteration++){
      for(let axisNo=0;axisNo<3;axisNo++){
       let best={score:score(final,0),q:q.clone(),angle:0,...final};
       for(let n=-16;n<=16;n++){
        const angle=n*.1;
        bone.quaternion.copy(q).premultiply(new Q().setFromAxisAngle(axis[axisNo],angle));
        const sample=probe(),cost=score(sample,angle);
        if(cost<best.score)best={score:cost,q:bone.quaternion.clone(),angle,...sample};
       }
       q=best.q;bone.quaternion.copy(q);final=probe();
       history.push({axis:'xyz'[axisNo],angle:+best.angle.toFixed(2),solid:final.solid,front:final.front});
      }
     }
     bone.quaternion.copy(q);h.model.updateMatrixWorld(true);
     outputs.push({digit,source:indices.length,baseline:singles,shiftTrials:shiftTrials.slice(0,15),final,rotations:history,localQuaternion:q.toArray()});
    }
    return outputs;
   });
   console.log('V58_OPTIMIZER_'+name.toUpperCase()+'='+JSON.stringify(opt));
   await page.evaluate(()=>document.querySelectorAll('canvas[style*=\"z-index: 999999\"]').forEach(c=>c.remove()));
   await page.waitForTimeout(300);
   await page.screenshot({path:'opening-v58-artifacts/'+name+'-optimized.png'});
   console.log('V58_OPTIMIZER_'+name.toUpperCase()+'_JPEG='+(await page.screenshot({type:'jpeg',quality:62})).toString('base64'));
  }
  const hold=phases[0],pressed=phases[1];
  check(hold.gripThumbBaseGap>=.124&&hold.gripThumbBaseGap<=.126&&pressed.gripThumbBaseGap<=.126,
   name+' handset has not shifted right toward lower thumb-index webbing: '+JSON.stringify(phases.map(p=>p.gripThumbBaseGap)));
  check(hold.gripWebbingGap>=.071&&hold.gripWebbingGap<=.074&&pressed.gripWebbingGap<=.074,
   name+' lower thumb-index webbing is still separated from right case edge: '+JSON.stringify(phases.map(p=>p.gripWebbingGap)));
  check(hold.phoneScreenViewport.right>=(name==='mobile'?.944:.773)&&hold.phoneScreenViewport.right<.987,
   name+' phone did not move visibly RIGHT in the composed shot while staying on screen: '+JSON.stringify(hold.phoneScreenViewport));
  check(pressed.thumb.buttonMinPoint?.[0]>=.015&&pressed.thumb.buttonMinPoint?.[0]<=.095&&pressed.thumb.buttonMinZ>=.0249&&pressed.thumb.buttonMinZ<=.034,
   name+' thumb contact no longer lands inside physical CHECK IN: '+JSON.stringify(pressed.thumb));
  check(hold.source.includes('v58')&&pressed.source.includes('v58'),name+' reviewed module is not v58');
  check(hold.allSkin.solid===0&&pressed.allSkin.solid===0,name+' actual continuous full-forearm SKIN intersects handset: '+JSON.stringify(phases.map(p=>p.allSkin)));
  check(hold.digits[1].solid===0&&pressed.digits[1].solid===0,
   name+' real INDEX finger skin intersects phone case: '+JSON.stringify(phases.map(p=>p.digits[1])));
  check(hold.digits[1].front===0,
   name+' INDEX finger crosses in FRONT of phone glass in the raised grip: '+JSON.stringify(hold.digits[1]));
  check(hold.digits.slice(1).every(f=>f.solid===0)&&pressed.digits.slice(1).every(f=>f.solid===0),
   name+' non-thumb original source finger skin intersects the phone solid');
  check(!errors.length&&!remote.length,name+' browser errors or remote assets '+JSON.stringify({errors,remote}));
  await page.close();
 }
}finally{await browser.close()}
if(failures.length)throw Error('V58 hand-phone geometry failed ('+failures.length+'):\n'+failures.join('\n'));
