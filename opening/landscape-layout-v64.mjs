/**
 * V64 review-only position overrides for the sourced v63 GLB landscaping.
 * Enlarge each entire imported planter+shrub unit 2×; separate former pairs
 * so neither containers nor foliage intersect. No new mesh generation.
 */
import {MALL_PLANTERS_V63} from './landscape-layout-v63.mjs';
export const MALL_PLANTER_SCALE_V64=2;
// Four mirrored pairs about the public doorway x=-10.5; identical setbacks.
const xs=[-45.5,-36.5,-27.5,-18.5,-2.5,6.5,15.5,24.5];
export const MALL_PLANTERS_V64=Object.freeze(
 MALL_PLANTERS_V63.map((spot,i)=>Object.freeze({...spot,x:xs[i],z:-18.85}))
);
