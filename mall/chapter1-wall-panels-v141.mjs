/** V141: source-authentic grounded wall locations for the existing A/B/C breakers.
 * Structural masonry is from the actual V67/V116 G-floor shell, not guessed
 * coordinates or faux wall geometry. The panel is the original makeBreaker.
 */
import {buildGameplayLayoutV70,shortestRouteV70} from './gameplay-layout-v70.mjs';
const ORIGINAL_BACK_HALF_DEPTH=.07; // makeBreaker A/B/C addBox body depth .14
const INSTALL_GAP=.008; // 8mm behind mounting face, no hovering or Z-fighting
export const PANEL_MOUNTS_V141=Object.freeze({
 A:Object.freeze({room:'central_gallery',wallId:'north_service_z_-112_1.85',
  along:7,normal:1,axis:'z',yaw:0,approach:Object.freeze({x:7,z:-110.4}),
  site:'Concourse emergency electrical feed, original solid service-room wall'}),
 B:Object.freeze({room:'west_gallery',wallId:'v116_west_rear_receiving_closed-bay-partition_x_-29_-118.00',
  along:-109,normal:1,axis:'x',yaw:Math.PI/2,approach:Object.freeze({x:-27.45,z:-109}),
  site:'West retail emergency branch, solid former receiving service partition'}),
 C:Object.freeze({room:'freight_lobby',wallId:'freight_lobby_z_-110_11',
  along:12.5,normal:-1,axis:'z',yaw:Math.PI,approach:Object.freeze({x:12.5,z:-111.55}),
  site:'Freight service emergency branch, solid original lobby entry partition'})
});
export const PANEL_BASE_Y_V141=1.18; // original mesh +.0..+.5m, LED +.37m

export function mountedPanelSitesV141(layout=buildGameplayLayoutV70({chapter:1})){
 const errors=[],panels=[];
 if(layout.level!=='G'||layout.chapter!==1)errors.push('Panels require the original Chapter 1 G shell');
 const wallSet=layout.shell?.walls||[],key={x:6,z:-81},freight={x:17,z:-113};
 for(const [id,m]of Object.entries(PANEL_MOUNTS_V141)){
  const wall=wallSet.find(w=>w.id===m.wallId);
  if(!wall){errors.push(id+' missing actual solid wall '+m.wallId);continue;}
  if(wall.axis!==m.axis||wall.role==='storefront-pier'||wall.role==='lintel'||
    wall.role==='glass'||wall.role==='storefront-glass'||
    wall.bottom!==0||wall.top<2.1||wall.thickness<.19)
   errors.push(id+' wall support is not full-height ground-floor masonry');
  if(m.along<wall.start+.55||m.along>wall.end-.55)
   errors.push(id+' panel intersects an edge, doorway or unsupported span');
  const stand=m.approach;
  const offset=wall.thickness/2+INSTALL_GAP+ORIGINAL_BACK_HALF_DEPTH;
  const panel=m.axis==='x'?
   {x:wall.at+m.normal*offset,z:m.along}:
   {x:m.along,z:wall.at+m.normal*offset};
  const distance=Math.hypot(panel.x-stand.x,panel.z-stand.z);
  const target={...panel,y:PANEL_BASE_Y_V141+layout.y};
  const wallFace=wall.at+m.normal*wall.thickness/2;
  const back=wall.at+m.normal*(wall.thickness/2+INSTALL_GAP);
  if(Math.abs((m.axis==='x'?panel.x:panel.z)-back-m.normal*ORIGINAL_BACK_HALF_DEPTH)>1e-6)
   errors.push(id+' real box back does not fit the wall face');
  if(!layout.canStand(stand.x,stand.z))errors.push(id+' standing spot physically blocked');
  if(layout.roomAt(stand.x,stand.z)!==m.room)errors.push(id+' approach belongs to wrong original room');
  if(!(distance>=1.1&&distance<2.15))errors.push(id+' cannot reach E within original 2.45m raycast');
  if(!shortestRouteV70(layout,layout.spawn,stand).length)errors.push(id+' inaccessible from real V113 door');
  if(!shortestRouteV70(layout,key,stand).length)errors.push(id+' unreachable from genuine Master Service Key');
  if(!shortestRouteV70(layout,stand,freight).length)errors.push(id+' no route to actual G freight lobby');
  if(layout.colliders.some(c=>{
    const {x,z}=stand;return x>c.minX&&x<c.maxX&&z>c.minZ&&z<c.maxZ;
  }))errors.push(id+' approach overlaps real collider');
  if(m.axis==='x'&&Math.abs(Math.sin(m.yaw)-m.normal)>1e-7||
     m.axis==='z'&&Math.abs(Math.cos(m.yaw)-m.normal)>1e-7)
   errors.push(id+' original front face does not point toward player');
  panels.push({id,wall,site:m.site,room:m.room,wallFace,back,position:target,
   yaw:m.yaw,approach:stand,clearDistance:distance,geometry:'original makeBreaker 0.42×0.50×0.14m'});
 }
 return {panels,errors};
}
