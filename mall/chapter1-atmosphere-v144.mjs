/** V144: in-world staff notices on original, full-height V141 masonry. */
import {PANEL_MOUNTS_V141,mountedPanelSitesV141} from './chapter1-wall-panels-v141.mjs';
export const CHAPTER1_NOTICES_V144=Object.freeze({
 A:Object.freeze({id:'sound',heading:'AFTER-HOURS STAFF',lines:Object.freeze(['SOUND CARRIES FARTHER','THROUGH EMPTY GALLERIES','KEEP FOOTSTEPS QUIET'])}),
 B:Object.freeze({id:'sight',heading:'SECURITY SWEEP - 1997',lines:Object.freeze(['AVOID OPEN SIGHTLINES','USE SOLID SERVICE WALLS','NOT GLASS FRONTS'])}),
 C:Object.freeze({id:'breath',heading:'NIGHT SHIFT - HANDWRITTEN',lines:Object.freeze(['IF IT WAITS OUTSIDE','STAY STILL. CLOSE THE DOOR.','KEEP YOUR BREATH QUIET.'])})
});
export const CHAPTER1_SOUNDS_V144=Object.freeze({firstSighting:'metal-impact-1.ogg',firstHunt:'heartbeat-fast.ogg'});
const WIDTH=.82,HEIGHT=.42,OFFSET=.016;
export function planChapter1NoticesV144(layout){
 const {panels,errors}=mountedPanelSitesV141(layout);
 if(errors.length)throw Error('V144 needs original verified masonry: '+errors.join('; '));
 if(panels.length!==3)throw Error('V144 requires three original breaker walls');
 return panels.map(site=>{
  const mount=PANEL_MOUNTS_V141[site.id],note=CHAPTER1_NOTICES_V144[site.id];
  if(!mount||!note||!site.wall||site.wall.thickness<.19||
   ['glass','storefront-glass','storefront-pier'].includes(site.wall.role))
   throw Error('Cannot mount physical notice on glass or fake partition '+site.id);
  const along=[mount.along+.94,mount.along-.94].find(n=>
   n>site.wall.start+WIDTH/2+.06&&n<site.wall.end-WIDTH/2-.06);
  if(along===undefined)throw Error('No spare original wall span near panel '+site.id);
  const front=site.wallFace+mount.normal*OFFSET;
  const xyz=mount.axis==='x'?{x:front,y:layout.y+1.68,z:along}:{x:along,y:layout.y+1.68,z:front};
  const dist=Math.hypot(xyz.x-site.position.x,xyz.z-site.position.z);
  if(dist<.7||dist>1.2)throw Error('Notice intersects original E breaker '+site.id);
  return Object.freeze({...xyz,id:note.id,breaker:site.id,heading:note.heading,lines:note.lines,
   yaw:mount.yaw,width:WIDTH,height:HEIGHT,wallId:site.wall.id,wallRole:site.wall.role,
   wallFace:site.wallFace,wallThickness:site.wall.thickness,distanceToPanel:dist});
 });
}
