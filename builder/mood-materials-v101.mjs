/**
 * A source-geometry-safe, explicitly named 'browning' variant of a genuinely
 * sourced Poly Haven haworthia. No new plant mesh or invented texture.
 */
export function ageRealPlantV101(THREE,root,id){
 if(id!=='mood-v101-browning-haworthia')return;
 const meshParts=[];
 root.traverse(o=>{if(o.isMesh)meshParts.push(o)});
 if(meshParts.length===0)throw Error('Missing real third-party plant geometry');
 const total=new THREE.Box3().setFromObject(root);
 const h=total.max.y-total.min.y;
 let colored=0;
 for(const mesh of meshParts){
  const b=new THREE.Box3().setFromObject(mesh);
  const name=(mesh.name+' '+(Array.isArray(mesh.material)?mesh.material.map(m=>m.name).join(' '):mesh.material?.name||'')).toLowerCase();
  const isPot=/pot|terra|ceramic|soil|dirt/.test(name);
  const high=b.max.y>=total.min.y+h*.58;
  // Poly Haven's original Haworthia parts all inherit pot-prefixed mesh
  // names, including the leaves. Spatial height outranks the name so we
  // never skip genuine foliage just because the source model is "potted".
  // Preserve true low pot/soil-only meshes and their existing source maps.
  if(!high)continue;
  if(isPot&&b.max.y<total.min.y+h*.77)continue;
  const tint=(mat)=>{
   const m=mat.clone();
   // Brown/muted olive chlorosis, but all original source photographs and
   // source-authored normal/roughness maps remain intact.
   m.color?.multiply(new THREE.Color(0xc8a66f));
   if(typeof m.roughness==='number')m.roughness=Math.max(.86,m.roughness);
   m.emissive?.setHex(0);
   m.userData={...m.userData,sourceVegetationBrowningV101:true};
   return m;
  };
  mesh.material=Array.isArray(mesh.material)?mesh.material.map(tint):tint(mesh.material);
  colored++;
 }
 if(!colored)throw Error('No source foliage available for browning variant');
 root.userData.builderBrowningPlantV101=true;
}

/** The calendar source photograph is genuine PD/CC0, while the paper mount is
 * only an ordinary subdivided surface decal. Corners curl gently off the wall.
 * Dates were deliberately verified as year 1997 in the vendor script.
 */
export function makeCalendarPaperV101(THREE,item){
 const g=new THREE.PlaneGeometry(item.width,item.height,16,20);
 const a=g.attributes.position;
 for(let i=0;i<a.count;i++){
  const x=a.getX(i)/item.width;
  const y=a.getY(i)/item.height;
  const edge=Math.pow(Math.max(0,(Math.abs(x)-.35)/.15),2);
  const lower=Math.pow(Math.max(0,(-y-.20)/.30),2);
  a.setZ(i,.007*edge+.016*lower*edge);
 }
 g.computeVertexNormals();
 g.userData.builderCalendarPaperV101=true;
 return g;
}
