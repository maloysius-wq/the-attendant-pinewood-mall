/** Builder v93: verified CC0 paperboard materials for the original Kenney boxes. */
export const CARDBOARD_MAPS_V93=Object.freeze({
 cardboardWorn:'assets/vendor/builder/materials-v93/cardboard_worn_color_1k.jpg',
 cardboardClean:'assets/vendor/builder/materials-v93/cardboard_clean_color_1k.jpg'
});
export function isCardboardBoxV93(name=''){
 return /cardboard[ _-]?box[ _-]?(?:open|closed)?/i.test(String(name));
}
export function cardboardMaterialRoleV93(materialName='',modelName=''){
 const id=String(modelName).toLowerCase(),name=String(materialName).toLowerCase();
 if(!isCardboardBoxV93(id))return null;
 // These are the ACTUAL names in both source Kenney cardboard GLBs. Do not
 // infer that their wood / woodDark components are made of timber.
 if(name!=='wood'&&name!=='wooddark')return null;
 if(/cardboard[ _-]?box[ _-]?open/.test(id))return 'cardboardWorn';
 if(/cardboard[ _-]?box[ _-]?closed/.test(id))return 'cardboardClean';
 return null;
}
