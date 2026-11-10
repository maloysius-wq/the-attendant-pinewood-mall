/**
 * Builder-only finish scale and peripheral policy.
 *
 * A photographic material belongs across a full furniture panel, not in
 * 40-centimetre repeating stamps. Return source-compatible texture roles;
 * existing GLBs and saved draft IDs remain completely untouched.
 */
const normalized = value => String(value||'').toLowerCase();
export function keepPeripheralColorsV92(value=''){
 const name=normalized(value);
 // Standalone computer keyboards, mice, trackpads and their mesh parts.
 // Do not mistake a generic desk containing a CRT for a keyboard model.
 return /keyboard|keypad|trackpad|trackball|computer[_ -]?mouse|(^|[^a-z])mouse([^a-z]|$)/.test(name);
}
export function isFurnitureV92(value=''){
 return /desk|table|cabinet|drawer|counter|shelf|shelving|bookcase|dresser|cupboard|kiosk|display|bench|stool|chair|seat|wardrobe|sofa|rack/.test(normalized(value));
}
export function sourceTextureRoleV92(role,modelName){
 // Source-color-tinted light oak, instead of the v91 heavily mottled,
 // rough "worn table" photo on clean-looking office furniture.
 if(role==='wood'&&isFurnitureV92(modelName))return 'woodLight';
 return role;
}
export function roomFinishRepeatsV92(part,id,width,height){
 const label=normalized(id),w=Math.max(.05,width),h=Math.max(.05,height);
 if(part==='ceiling'&&label==='acoustic'){
  // Preserve intentionally repeating 1990s acoustic ceiling squares.
  return {u:w/2.6,v:h/2.6};
 }
 const patterned=part==='floor'&&/tile|terrazzo|parquet|laminate|checker|marble|pattern/.test(label);
 const span=part==='floor'?6.25:6.5;
 const maxRepeat=patterned?2.7:1.55;
 const count=n=>Math.min(maxRepeat,Math.max(.15,n/span));
 return {u:count(w),v:count(h)};
}

/** v97: Kenney trashcan and coffee maker still used miniature original UV
 * atlases, so their v91 images repeated in obvious postage-stamp patterns.
 * Only these specific user-reported source props use broad single-photo UVs.
 */
export function isBroadSurfacePropV97(value=''){
 return /kenney-furniture-kit-(?:trashcan|kitchencoffeemachine)|(?:^|[^a-z])(?:trashcan|kitchencoffeemachine)(?:[^a-z]|$)/i.test(String(value));
}
