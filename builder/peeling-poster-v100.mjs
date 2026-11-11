/**
 * Damage treatment for preexisting CC0 poster image assets.
 * A subdivided wall decal lets the real printed source lift away from masonry.
 * No substitute 3D prop models are authored by this utility.
 */
const ramp=(v,start)=>Math.max(0,Math.min(1,(v-start)/(1-start)));
export function makePeelingPosterGeometryV100(THREE,item){
 const g=new THREE.PlaneGeometry(item.width,item.height,20,24);
 const a=g.attributes.position;
 let raised=0;
 for(let i=0;i<a.count;i++){
  const x=a.getX(i)/item.width+.5;
  const y=a.getY(i)/item.height+.5;
  let z=0;
  switch(item.peelStyle){
   case 'corners':
    z=.025*Math.pow(Math.max(0,(x-.76)/.24),2)*Math.pow(Math.max(0,(y-.76)/.24),2);
    break;
   case 'top':
    z=.120*ramp(x,.52)*ramp(y,.54);
    break;
   case 'bottom':
    z=.115*ramp(1-y,.46)*(.2+.8*ramp(x,.54));
    break;
   case 'right':
    z=.165*ramp(x,.55)*(.30+.70*(1-y));
    break;
   case 'half':
    z=.120*ramp(1-y,.38)*(.50+.50*x);
    break;
   case 'strips':
    z=.140*ramp(1-y,.25)*(.55+.45*Math.sin(x*Math.PI*5)**2);
    break;
   default:throw Error('Unlicensed peeling poster condition');
  }
  a.setZ(i,z);
  raised=Math.max(raised,z);
 }
 if(raised<.008)throw Error('Missing physical loose poster edge');
 g.computeVertexNormals();
 g.userData={v100ActualPeel:true,style:item.peelStyle,maxCurlMeters:raised,sourceMaterial:'GGBotNet CC0 image'};
 return g;
}

/**
 * Mildly age original PBR materials without discarding any embedded original
 * diffuse/normal/roughness images, texture coordinates, or real source meshes.
 */
export function weatherSourceBoardV100(root,id){
 if(!['v100-vintage-office-whiteboard','v100-aged-cork-bulletin-board'].includes(id))return;
 let seen=0,mapped=0;
 root.traverse(o=>{
  if(!o.isMesh)return;
  const hadArray=Array.isArray(o.material);
  const updated=(hadArray?o.material:[o.material]).map(material=>{
   if(!material)return material;
   const m=material.clone();
   // Leave enamel white-ish, but older and less plasticky. Cork and wooden
   // surfaces acquire a darker 1990s yellowed cast.
   m.color?.multiply(new m.color.constructor(id==='v100-aged-cork-bulletin-board'?0xe5d4b9:0xeee6db));
   if(typeof m.roughness==='number')m.roughness=Math.max(m.roughness,id==='v100-aged-cork-bulletin-board'?.86:.65);
   m.userData={...m.userData,weatheredSourceV100:true,sourceImagesPreserved:!!m.map};
   if(m.map)mapped++;
   seen++;
   return m;
  });
  o.material=hadArray?updated:updated[0];
 });
 if(seen<1||mapped<1)throw Error('Untextured third-party board: '+id);
 root.userData.weatheredSourceV100=true;
}


// The stains were already derived from independently sourced ambientCG CC0
// photographs and pinned by the original v97 grime manifest. Reuse those
// real scanned source images for the new boards rather than drawing fake dirt.
const overlayTextures=new Map();
export async function attachBoardGrimeV100(THREE,root,id){
 const whiteboard=id==='v100-vintage-office-whiteboard';
 const cork=id==='v100-aged-cork-bulletin-board';
 if(!whiteboard&&!cork)return;
 const name=whiteboard?'grime-wall-smears.png':'wall-dust-bloom.png';
 if(!overlayTextures.has(name)){
  const path=new URL('../assets/vendor/builder/decals-v97/'+name,import.meta.url).href;
  overlayTextures.set(name,new THREE.TextureLoader().loadAsync(path).then(t=>{
   t.colorSpace=THREE.SRGBColorSpace;
   t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
   t.anisotropy=4;
   return t;
  }));
 }
 const texture=await overlayTextures.get(name);
 const width=whiteboard?1.06:.74;
 const height=whiteboard?.67:.47;
 const y=whiteboard?1.22:.31;
 const distance=whiteboard?.083:.040;
 for(const front of [true,false]){
  const mat=new THREE.MeshBasicMaterial({
   name:'CC0_original_patina_'+name,map:texture,
   transparent:true,opacity:whiteboard?.18:.13,depthWrite:false,depthTest:true,
   polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,
   side:THREE.DoubleSide,toneMapped:true
  });
  mat.userData={builderRealCC0PatinaV100:true,source:'ambientCG CC0 v97 scan',sourceMapPreserved:true};
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);
  mesh.position.set(0,y,front?distance:-distance);
  if(!front)mesh.rotation.y=Math.PI;
  mesh.name='Pinned source CC0 dirt overlay '+id;
  mesh.userData.builderRealCC0PatinaV100=true;
  mesh.receiveShadow=false;mesh.castShadow=false;
  root.add(mesh);
 }
}
export function disposeBoardGrimeV100(){
 for(const promise of overlayTextures.values())promise.then(t=>t.dispose()).catch(()=>{});
 overlayTextures.clear();
}
