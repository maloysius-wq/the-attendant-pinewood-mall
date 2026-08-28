// Deployment loader for The Attendant: Pinewood Mall.
// Reassembles the validated furniture/environment reset source before boot.
const PARTS = [
  './bundle2/part-01.txt',
  './bundle2/part-02.txt',
  './bundle2/part-03.txt',
  './bundle2/p4-1.txt','./bundle2/p4-2.txt','./bundle2/p4-3.txt','./bundle2/p4-4.txt','./bundle2/p4-5.txt',
  './bundle2/p5-1.txt','./bundle2/p5-2.txt','./bundle2/p5-3.txt','./bundle2/p5-4.txt','./bundle2/p5-5.txt',
];

async function decodeSource(){
  const payload=(await Promise.all(PARTS.map(async url=>{
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok) throw new Error(`Bundle segment failed: ${url} (HTTP ${response.status})`);
    return (await response.text()).trim();
  }))).join('');
  const bytes=Uint8Array.from(atob(payload),c=>c.charCodeAt(0));
  if('DecompressionStream' in window){
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  }
  const {ungzip}=await import('https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm');
  return new TextDecoder().decode(ungzip(bytes));
}

function patchFoodCourt(source){
  const start=source.indexOf('async function buildFoodCourt(world){');
  let end=source.indexOf('async function buildMusic(world){',start);
  if(end<0) end=source.indexOf('function makeCassetteBin',start);
  if(start<0||end<0){
    console.warn('Food court patch markers not found; using bundled version unchanged.');
    return source;
  }

  const replacement=String.raw`async function buildFoodCourt(world){
  addStorefront(world,{name:'PINEWOOD FOOD COURT',theme:'food',x:-7,z:19.48,face:'north'});

  // Food-court-specific wallpaper: warm, slightly grimy geometric paper that works with the checker floor.
  const wallTex=makeCanvasTexture((ctx,c)=>{
    ctx.fillStyle='#342c2a';ctx.fillRect(0,0,c.width,c.height);
    for(let y=0;y<c.height;y+=64){
      for(let x=0;x<c.width;x+=64){
        const alt=((x/64+y/64)&1)===0;
        ctx.fillStyle=alt?'rgba(139,94,70,.22)':'rgba(197,150,92,.12)';
        ctx.fillRect(x,y,64,64);
        ctx.strokeStyle='rgba(225,190,132,.15)';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(x+32,y+7);ctx.lineTo(x+57,y+32);ctx.lineTo(x+32,y+57);ctx.lineTo(x+7,y+32);ctx.closePath();ctx.stroke();
        ctx.fillStyle='rgba(93,48,47,.22)';ctx.fillRect(x+29,y,6,64);
      }
    }
    for(let i=0;i<2200;i++){
      const a=Math.random()*.07;ctx.fillStyle='rgba(15,10,8,'+a+')';ctx.fillRect(Math.random()*c.width,Math.random()*c.height,rand(1,4),rand(1,3));
    }
  },512,512);
  wallTex.wrapS=wallTex.wrapT=THREE.RepeatWrapping;wallTex.repeat.set(4,2.5);
  const wallMat=new THREE.MeshStandardMaterial({map:wallTex,color:0xffffff,roughness:.96,metalness:0});
  const trimMat=new THREE.MeshStandardMaterial({color:0x5a3331,roughness:.78,metalness:.03});
  const back=addBox(world.root,new THREE.Vector3(-7,1.40,31.43),new THREE.Vector3(15.85,2.72,.035),wallMat);back.receiveShadow=true;
  const left=addBox(world.root,new THREE.Vector3(-15.43,1.40,25.55),new THREE.Vector3(.035,2.72,10.85),wallMat);left.receiveShadow=true;
  const right=addBox(world.root,new THREE.Vector3(1.43,1.40,25.55),new THREE.Vector3(.035,2.72,10.85),wallMat);right.receiveShadow=true;
  addBox(world.root,new THREE.Vector3(-7,1.27,31.39),new THREE.Vector3(15.85,.11,.05),trimMat);
  addBox(world.root,new THREE.Vector3(-15.39,1.27,25.55),new THREE.Vector3(.05,.11,10.85),trimMat);
  addBox(world.root,new THREE.Vector3(1.39,1.27,25.55),new THREE.Vector3(.05,.11,10.85),trimMat);

  addWallPoster(world,makePoster('SLICE CITY','HOT • FAST','#9b5d31'),new THREE.Vector3(-15.34,1.55,24.2),Math.PI/2);
  addWallPoster(world,makePoster('POLAR POP','FREE REFILLS','#3d7394'),new THREE.Vector3(1.34,1.55,24.6),-Math.PI/2);
  addWallPoster(world,makePoster('COMBO #4','$3.99','#7a8450'),new THREE.Vector3(-7,1.55,31.34),Math.PI);

  // Plain long black standard service counters. No desk/bakery-display geometry.
  const counterBody=new THREE.MeshStandardMaterial({color:0x111214,roughness:.72,metalness:.08});
  const counterTop=new THREE.MeshStandardMaterial({color:0x25272b,roughness:.38,metalness:.24});
  const kickMat=new THREE.MeshStandardMaterial({color:0x050506,roughness:.88,metalness:.03});
  function serviceCounter(x,label){
    const g=new THREE.Group();g.position.set(x,0,29.28);world.root.add(g);
    addBox(g,new THREE.Vector3(0,.50,0),new THREE.Vector3(4.05,1.00,.78),counterBody);
    addBox(g,new THREE.Vector3(0,1.02,-.015),new THREE.Vector3(4.18,.08,.88),counterTop);
    addBox(g,new THREE.Vector3(0,.18,-.405),new THREE.Vector3(3.72,.28,.035),kickMat);
    addBox(g,new THREE.Vector3(0,.90,-.418),new THREE.Vector3(3.78,.04,.025),new THREE.MeshStandardMaterial({color:0x777a7d,roughness:.28,metalness:.72}));
    world.addColliderFrom(g,{navBlock:true,pad:.05});
    const sign=makeSign(label,'food',3.35,.55);sign.position.set(x,2.12,31.37);sign.rotation.y=Math.PI;world.root.add(sign);
    return g;
  }
  serviceCounter(-12.05,'SLICE CITY');
  serviceCounter(-7.00,'WOK THIS WAY');
  serviceCounter(-1.95,'POLAR POP');

  // Registers sit behind the customer edge and face outward toward the seating area.
  await placeModel(world.root,'marketCash',new THREE.Vector3(-11.65,1.08,29.02),{targetHeight:.30,rot:Math.PI,collide:false,fallback:'box'});
  await placeModel(world.root,'marketCash',new THREE.Vector3(-6.60,1.08,29.02),{targetHeight:.30,rot:Math.PI,collide:false,fallback:'box'});
  await placeModel(world.root,'marketCash',new THREE.Vector3(-1.55,1.08,29.02),{targetHeight:.30,rot:Math.PI,collide:false,fallback:'box'});

  // Six proper seating islands, arranged as a centered 2 x 3 grid.
  const spots=[[-10.8,22.2],[-3.2,22.2],[-10.8,24.7],[-3.2,24.7],[-10.8,27.0],[-3.2,27.0]];
  for(const [x,z] of spots){
    await placeModel(world.root,'table',new THREE.Vector3(x,0,z),{targetHeight:.76,rot:0,collide:true,fallback:'table'});
    for(let a=0;a<4;a++){
      const ang=a*Math.PI/2;
      const px=x+Math.cos(ang)*1.03,pz=z+Math.sin(ang)*1.03;
      await placeModel(world.root,'chair',new THREE.Vector3(px,0,pz),{targetHeight:.92,rot:-ang-Math.PI/2,collide:true,fallback:'chair'});
    }
  }

  // A little abandoned food dressing, kept correctly at tabletop scale.
  await placeModel(world.root,'pizza',new THREE.Vector3(-10.8,.81,22.2),{targetHeight:.08,rot:.35,collide:false,fallback:'box'});
  await placeModel(world.root,'cup',new THREE.Vector3(-10.45,.82,22.38),{targetHeight:.20,rot:0,collide:false,fallback:'box'});
  await placeModel(world.root,'pizzaBox',new THREE.Vector3(-3.2,.80,24.7),{targetHeight:.07,rot:-.16,collide:false,fallback:'box'});

  const cab=makeCabinet(new THREE.Vector3(-14.5,0,29),Math.PI);world.root.add(cab);world.addCollider(-14.5,29,.95,.65,{navBlock:true,owner:cab});world.interactables.push(cab);
  const dec=makePickup('decoy',new THREE.Vector3(-2.7,.16,28.3),'Pager Decoy');world.root.add(dec);world.interactables.push(dec);
}

`;
  return source.slice(0,start)+replacement+source.slice(end);
}

function normalizeGameSource(source){
  let normalized=source
    .replace("import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';", "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';")
    .replace("import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';", "import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';")
    .replace("import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';", "import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';")
    .replace("import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';", "import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");
  normalized=patchFoodCourt(normalized);
  return normalized;
}

async function preflightThree(){
  const checks=[
    ['three','three'],
    ['GLTFLoader','three/addons/loaders/GLTFLoader.js'],
    ['EffectComposer','three/addons/postprocessing/EffectComposer.js'],
    ['RenderPass','three/addons/postprocessing/RenderPass.js'],
    ['UnrealBloomPass','three/addons/postprocessing/UnrealBloomPass.js'],
  ];
  for(const [name,specifier] of checks){
    try{await import(specifier);}
    catch(cause){
      const err=new Error(`Three.js dependency failed at ${name}: ${cause?.message||cause}`);
      err.cause=cause;
      throw err;
    }
  }
}

try{
  await preflightThree();
  const source=normalizeGameSource(await decodeSource())+'\n//# sourceURL=pinewood-runtime.js\n';
  const moduleUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  try{await import(moduleUrl);}
  finally{URL.revokeObjectURL(moduleUrl);}
}catch(err){
  console.error('Pinewood game bundle failed to start',err);
  if(err?.cause)console.error('Underlying module error',err.cause);
  if(err?.stack)console.error(err.stack);
  const status=document.getElementById('assetStatus');
  if(status)status.textContent=`Game failed to start: ${err?.message||err}`;
}
