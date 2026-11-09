/** Pinewood Builder-only CC0 room finishes. No changes to campaign renderer. */
export const ROOM_FINISHES_V87=Object.freeze({
 wall:Object.freeze([
  Object.freeze({id:'original',label:'Original walls',path:null}),
  Object.freeze({id:'concrete',label:'Aged concrete / utility',path:'assets/vendor/runtime/2cc17a586ae39128/concrete_wall_001_diff_1k.jpg'}),
  Object.freeze({id:'worn-plaster',label:'Worn pale plaster',path:'assets/vendor/builder/finishes/concrete_wall_003_diff_1k.jpg'}),
  Object.freeze({id:'painted-wall',label:'Faded painted wall',path:'assets/vendor/builder/finishes/concrete_wall_004_diff_1k.jpg'})
 ]),
 floor:Object.freeze([
  Object.freeze({id:'original',label:'Original floor',path:null}),
  Object.freeze({id:'terrazzo',label:'1990s speckled terrazzo',path:'assets/vendor/runtime/4c5fa06ac517f4a9/terrazzo_tiles_diff_1k.jpg'}),
  Object.freeze({id:'marble-check',label:'Weathered marble checker',path:'assets/vendor/runtime/5e2a13faf5d98437/floor_tiles_06_diff_1k.jpg'}),
  Object.freeze({id:'dirty-carpet',label:'Abandoned carpet',path:'assets/vendor/runtime/282ba676c940051b/dirty_carpet_diff_1k.jpg'}),
  Object.freeze({id:'worn-tile',label:'Chipped commercial tile',path:'assets/vendor/builder/finishes/worn_tile_floor_diff_1k.jpg'}),
  Object.freeze({id:'beige-tile',label:'1990s beige ceramic tile',path:'assets/vendor/builder/finishes/interior_tiles_diff_1k.jpg'}),
  Object.freeze({id:'dirty-tile',label:'Scuffed dirty tile',path:'assets/vendor/builder/finishes/dirty_tiles_diff_1k.jpg'}),
  Object.freeze({id:'concrete-floor',label:'Dirty concrete floor',path:'assets/vendor/builder/finishes/concrete_floor_diff_1k.jpg'})
 ]),
 ceiling:Object.freeze([
  Object.freeze({id:'original',label:'Original ceiling',path:null}),
  Object.freeze({id:'acoustic',label:'Aged acoustic ceiling tiles',path:'opening/assets/v80/aged-acoustic-ceiling-albedo.jpg'}),
  Object.freeze({id:'stained-plaster',label:'Stained plaster ceiling',path:'opening/assets/v80/stained-plaster-ceiling-albedo.jpg'}),
  Object.freeze({id:'concrete',label:'Bare utility concrete',path:'assets/vendor/runtime/2cc17a586ae39128/concrete_wall_001_diff_1k.jpg'})
 ])
});
export const ROOM_FINISH_IDS_V87=Object.freeze(Object.fromEntries(
 Object.entries(ROOM_FINISHES_V87).map(([part,items])=>[part,new Set(items.map(x=>x.id))])
));
