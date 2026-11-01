import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const failures=[],check=(yes,msg)=>{if(!yes){failures.push(msg);console.error('V58_FAIL '+msg)}};
const origin='http://127.0.0.1:4173';
await mkdir('opening-v58-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required','--disable-dev-shm-usage']});
try{
 const layouts=[['desktop',1280,720],['mobile',390,844]];
 for(const [name,width,height] of layouts.filter(([n])=>!process.env.V58_LAYOUT||n===process.env.V58_LAYOUT)){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[],remote=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
  await page.goto(origin+'/review/the-call-v34/',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>document.getElementById('titleScreen')?.classList.contains('show'),null,{timeout:150000});
  await page.locator('#newBtn').click();
  await page.waitForFunction(()=>window.__PINEWOOD_OPENING_V34__?.active,null,{timeout:30000});
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
    document.body.appendChild(canvas);
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
    return {phase,modelPosition:h.model.position.toArray(),digits:out,
     thumb:h.status.thumbSurface,source:h.status.source};
   },t);
   phases.push(diagnostic);
   console.log('V58_'+name.toUpperCase()+'_'+label.toUpperCase()+'='+JSON.stringify(diagnostic));
   await page.screenshot({path:'opening-v58-artifacts/'+name+'-'+label+'-annotated.png'});
   console.log('V58_'+name.toUpperCase()+'_'+label.toUpperCase()+'_JPEG='+
    (await page.screenshot({type:'jpeg',quality:62})).toString('base64'));
  }
  const hold=phases[0],pressed=phases[1];
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
