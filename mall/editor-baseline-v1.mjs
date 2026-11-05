/** Additional original CC0 props. These are decorations, never building fabric. */
import {constructPhysicalShell} from './physical-shell-v67.mjs';
const FIXED=new Set(['dry_fountain_art','service_floor_panel','service_wall_panel']);
export const EDITOR_EXTRA_FIXTURES_V1=Object.freeze(
 ['B1','G','M1'].flatMap(level=>constructPhysicalShell({level,chapter:6}).fixtures)
  .filter(item=>!FIXED.has(item.id)).map(item=>Object.freeze(item))
);
