/** V145: discoverability tags beside the real original Chapter 1 decoys.
 * No new game items, floor geometry, hidden routes or speculative store rooms.
 */
import {CHAPTER1_STEALTH_V139} from './chapter1-stealth-plan-v139.mjs';
import {buildGameplayLayoutV70,shortestRouteV70} from './gameplay-layout-v70.mjs';
import {storyTargetV70} from './story-placement-v70.mjs';

export const DECOY_TAGS_V145=Object.freeze({
 'Noise Maker':Object.freeze({id:'noise-maker',heading:'NOISE MAKER',
  stamp:'MAINTENANCE / 1997',instruction:'DRAW ATTENTION AWAY FROM YOUR ROUTE'}),
 'Pager Decoy':Object.freeze({id:'pager-decoy',heading:'PAGER DECOY',
  stamp:'SECURITY / 1997',instruction:'MAKE THE SEARCH FOLLOW THE SOUND'})
});
export const DECOY_TAG_DIMENSIONS_V145=Object.freeze({width:.54,height:.34});
const OFFSETS=Object.freeze([
 [.57,.30],[-.57,.30],[.57,-.30],[-.57,-.30],
 [0,.68],[0,-.68],[.70,0],[-.70,0]
]);
function paperStandable(layout,x,z){
 const {width,height}=DECOY_TAG_DIMENSIONS_V145;
 return [[0,0],[-width/2,-height/2],[width/2,-height/2],
  [-width/2,height/2],[width/2,height/2]].every(([dx,dz])=>layout.canStand(x+dx,z+dz));
}
export function planChapter1DecoyTagsV145(layout=buildGameplayLayoutV70({chapter:1})){
 if(layout.chapter!==1||layout.level!=='G')throw Error('V145 needs original Chapter 1 G-floor shell');
 return CHAPTER1_STEALTH_V139.pickups.map(source=>{
  const site=storyTargetV70({chapter:1,type:'decoy',label:source.label});
  const tag=DECOY_TAGS_V145[source.label];
  if(!tag||!site.canonical||site.room!==source.room||
    site.x!==source.x||site.z!==source.z||
    !paperStandable(layout,site.x,site.z))
   throw Error('V145 original decoy is not located at its canonical accessible spot: '+source.label);
  const [x,z]=OFFSETS.map(([dx,dz])=>[site.x+dx,site.z+dz]).find(([x,z])=>
    layout.roomAt(x,z)===site.room&&paperStandable(layout,x,z)&&
    shortestRouteV70(layout,layout.spawn,{x,z}).length>0)||[];
  if(!Number.isFinite(x+z))throw Error('V145 no sound, standable shelf/floor adjacent to '+source.label);
  const range=Math.hypot(x-source.x,z-source.z);
  if(range<.45||range>.85)throw Error('V145 note overlaps the original interactive decoy');
  return Object.freeze({...tag,label:source.label,room:source.room,pickup:Object.freeze({
   x:site.x,z:site.z}),x,z,range,width:DECOY_TAG_DIMENSIONS_V145.width,
   height:DECOY_TAG_DIMENSIONS_V145.height});
 });
}
