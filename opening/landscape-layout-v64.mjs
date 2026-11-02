/**
 * V64 review-only position overrides for the sourced v63 GLB landscaping.
 * Enlarge each entire imported planter+shrub unit 2×; separate former pairs
 * so neither containers nor foliage intersect. No new mesh generation.
 */
import {MALL_PLANTERS_V63} from './landscape-layout-v63.mjs';
export const MALL_PLANTER_SCALE_V64=2;
const xs=[-34.20,-30.15,-22.20,-13.20,-4.10,20.15,24.20,32.20];
export const MALL_PLANTERS_V64=Object.freeze(
 MALL_PLANTERS_V63.map((spot,i)=>Object.freeze({...spot,x:xs[i]}))
);
