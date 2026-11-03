/**
 * V64 review-only position overrides for the sourced v63 GLB landscaping.
 * Enlarge each entire imported planter+shrub unit 2×; separate former pairs
 * so neither containers nor foliage intersect. No new mesh generation.
 */
import {MALL_PLANTERS_V63} from './landscape-layout-v63.mjs';
export const MALL_PLANTER_SCALE_V64=2;
// Mirror four matched pairs around the public entrance at x=-10.5 while
// leaving the independent x=12 service route entirely unobstructed.
const xs=[-28.3,-24.7,-21.1,-17.5,-3.5,0.1,3.7,7.3];
export const MALL_PLANTERS_V64=Object.freeze(
 MALL_PLANTERS_V63.map((spot,i)=>Object.freeze({...spot,x:xs[i]}))
);
