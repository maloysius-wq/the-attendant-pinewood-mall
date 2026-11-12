/** DOM- and WebGL-free authored scene collision translation.
 * Original physical collision array stays alive for navigation closures.
 */
/** Merge measured solids into existing canonical collision without replacing
 * scripted door/gate colliders or story destinations.
 */
export function applyAuthoredCollidersV111(layout,authored){
 if(!layout||!authored)return layout;
 // Removed/repositioned/scaled canonical fixtures must not leave their old
 // phantom colliders behind. Keep story walls, shafts and gate colliders intact.
 const hidden=new Set(authored.draft.deleted||[]);
 // Mutate the SAME array: canonical canStand()/blocked() close over it.
 for(let i=layout.colliders.length-1;i>=0;i--){
  const c=layout.colliders[i];
  if(c.kind==='furnishing'&&hidden.has(c.id))layout.colliders.splice(i,1);
 }
 for(const c of layout.colliders){
  if(c.kind!=='furnishing'||!authored.draft.overrides[c.id])continue;
  const bounds=authored.baselineColliderBounds?.(c.id);
  if(bounds)Object.assign(c,bounds);
 }
 const next=authored.collidersForLevel(layout.level);
 const reserved=[
  {x:12,z:-26,level:'G'}, {x:23,z:-110,level:'B1'},
  {x:35,z:-110,level:'G'}, {x:52,z:-99,level:'G'},
  {x:51,z:-103,level:'M1'}, {x:75,z:-110,level:'M1'}
 ];
 for(const box of next){
  const blocksReserved=reserved.some(p=>p.level===layout.level&&
   p.x>box.minX-.55&&p.x<box.maxX+.55&&p.z>box.minZ-.55&&p.z<box.maxZ+.55);
  if(!blocksReserved)layout.colliders.push(box);
 }
 return layout;
}
