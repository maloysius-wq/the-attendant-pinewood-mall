/**
 * Exact pre-v91, unmodified Kenney model restoration for standalone computer
 * keyboards and mice. These source GLBs were always authored with color-only
 * materials (two shaded teal materials on the keyboard, one on the mouse).
 * Do not replace them with a generic color, texture, or alternative mesh.
 *
 * Three.js clone(true) shares underlying source materials / geometries. Give
 * every placed or previewed peripheral independent COPIES of the ORIGINAL
 * glTF objects so enhancements elsewhere can never leak into them.
 */
export const SOURCE_PERIPHERAL_IDS_V93=Object.freeze([
 'kenney-furniture-kit-computerkeyboard','kenney-furniture-kit-computermouse'
]);
export function isSourcePeripheralV93(id=''){
 return SOURCE_PERIPHERAL_IDS_V93.includes(String(id));
}
export function isolateSourcePeripheralV93(root,id){
 if(!isSourcePeripheralV93(id))return 0;
 let meshes=0;
 root.traverse(o=>{
  if(!o.isMesh)return;
  o.geometry=o.geometry.clone();
  const cloneMat=m=>m?.clone?m.clone():m;
  o.material=Array.isArray(o.material)?o.material.map(cloneMat):cloneMat(o.material);
  o.userData={...o.userData,builderOriginalPeripheralV93:true};
  // Preserve ALL original Blender/Kenney source material colors, opacity,
  // geometry positions, dimensions, UVs, emissive values and texture slots.
  meshes++;
 });
 return meshes;
}
