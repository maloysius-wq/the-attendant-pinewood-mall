/**
 * V121 actual GLB design audition for the two mostly empty original 1979
 * department-store anchors. This is a source-measured preview ONLY: do not
 * publish candidate fixtures as gameplay furniture before seeing real WebGL
 * meshes, dimensions and circulation.
 */
import {MALL} from './masterplan-v66.mjs';

export const ANCHOR_ROOMS_V121=Object.freeze([
 Object.freeze({id:'west_anchor',label:"Fallow's Department Store",x1:-46,x2:-29,z1:-73,z2:-48}),
 Object.freeze({id:'east_original_anchor',label:'East Original Department Store',x1:29,x2:46,z1:-61,z2:-43})
]);

const candidate=(shortName,name,path,sha,targetHeight,role)=>Object.freeze({
 shortName,name,path,sha256:sha,targetHeight,role,license:'CC0-1.0'
});
export const ORIGINAL_RETAIL_CANDIDATES_V121=Object.freeze([
 candidate('table_large','Nesting retail display table, large',
 'assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-nesting-display-table-l-d25ccca1.glb',
 'dbaf7dd53e7a078498bf553822bdee30a1cc22fe22dec9218c33086f88c536a8',.95,'freestanding'),
 candidate('table_medium','Nesting retail display table, medium',
 'assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-nesting-display-table-m-88d7c9a2.glb',
 '23c52a95e0f77b11b7e73f92ccd4311ad2efa91437e5a4d16b95d6618890ef3c',.95,'freestanding'),
 candidate('wall_bay','Full-height wall rail and shelf',
 'assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-wall-bay-shelf-and-rail-e1cc3046.glb',
 'c7b20c3ac7582b81782b1fba39e25df0a7abeebbb0c8dd6a5c69aa94034b842f',2.12,'perimeter'),
 candidate('spinner','1979 accessories spinner rack',
 'assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-spinner-rack-accfe5be.glb',
 'e0e56625f643c2d27d4b6a61a075bcf00aa6c8c81a441db7b9a542a2da0c8d8e',1.65,'freestanding'),
 candidate('waterfall','Weathered apparel waterfall display',
 'assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-waterfall-display-stand-f7ed4580.glb',
 '143d35d2ec075216c06a8598760ed07ce6e7e2b9125de463dc2acb52b24731cc',1.78,'perimeter'),
 candidate('podium','Feature display pedestal',
 'assets/vendor/builder/models/retail-store-fixtures-and-mall/three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-feature-display-podium-27ff440d.glb',
 '62f93e04130b801a8fb7ab794b7653e94aa5d32270a8138b6e394641aeeddad9',1.15,'freestanding')
]);

export function validateAnchorSourceV121(rooms=ANCHOR_ROOMS_V121,assets=ORIGINAL_RETAIL_CANDIDATES_V121){
 const issues=[];
 for(const room of rooms){
  const source=MALL.rooms.find(x=>x.id===room.id);
  if(!source||source.level!=='G'||['x1','x2','z1','z2'].some(k=>room[k]!==source[k]))
   issues.push('department store layout does not match original canonical footprint '+room.id);
 }
 if(rooms.length!==2||assets.length!==6)issues.push('lost mandatory original anchor or preview source');
 const names=new Set();
 for(const model of assets){
  if(names.has(model.shortName))issues.push('duplicate preview source '+model.shortName);
  names.add(model.shortName);
  if(model.license!=='CC0-1.0'||!model.path.startsWith('assets/vendor/builder/models/')||
   !model.path.endsWith('.glb')||!/^[a-f0-9]{64}$/.test(model.sha256)||
   model.targetHeight<.7||model.targetHeight>2.8)
   issues.push('unverified or unreal model source '+model.shortName);
 }
 return issues;
}
