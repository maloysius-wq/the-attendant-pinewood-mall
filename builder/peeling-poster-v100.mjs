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
  o.material=(Array.isArray(o.material)?o.material:[o.material]).map(material=>{
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
  if(!Array.isArray(o.material))o.material=o.material[0];
 });
 if(seen<1||mapped<1)throw Error('Untextured third-party board: '+id);
 root.userData.weatheredSourceV100=true;
}
