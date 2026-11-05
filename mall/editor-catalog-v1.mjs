/** Curated starter entries: existing repo-pinned CC0 GLBs, no remote URLs. */
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
const category=role=>{
 if(/arcade|game/.test(role))return 'Retail & Displays';
 if(/counter|shelf|rack|display/.test(role))return 'Retail & Displays';
 if(/desk|office|cabinet|radio/.test(role))return 'Offices & 1990s Electronics';
 if(/table|seat|stool|chair/.test(role))return 'Benches & Seating';
 if(/cup|pizza|food|loose_prop/.test(role))return 'Food Court & Small Props';
 return 'Abandoned Mall Furnishings';
};
const readable=path=>decodeURIComponent(path.split('/').pop().replace(/\.glb$/i,''))
 .replace(/[_-]+/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').trim();
const ordered=new Map();
for(const f of FURNISHINGS_V69.fixtures){
 if(!f.model.startsWith('assets/vendor/runtime/')||!/\.glb$/i.test(f.model))continue;
 if(/ShelfLarge|ShelfSmall|Shelf%20Large|Shelf%20Small|\/Shelf Large\.glb|\/Shelf Small\.glb/i.test(f.model))continue;
 if(ordered.has(f.model))continue;
 const parts=f.model.split('/');
 ordered.set(f.model,Object.freeze({
  id:'local-'+parts.at(-2)+'-'+parts.at(-1).replace(/\.glb$/i,'').replace(/[^a-z0-9_-]/gi,'-').toLowerCase(),
  label:readable(f.model),
  category:category(f.role),
  path:f.model,
  targetHeight:f.targetHeight,
  radius:f.radius||.3,
  source:'Repo-pinned CC0 runtime fixture'
 }));
}
export const EDITOR_CATALOG_V1=Object.freeze([...ordered.values()]);
export const EDITOR_CATALOG_BY_ID=new Map(EDITOR_CATALOG_V1.map(x=>[x.id,x]));
