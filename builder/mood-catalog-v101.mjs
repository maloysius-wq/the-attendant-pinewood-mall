/** Publisher-verified PBR desk plants and PD/CC0 photo-derived 1996 calendars. */
export const MOOD_V101_COUNT={plants:4,calendars:4};
const ROOT='assets/vendor/builder/mood-v101/';
const SHA=/^[a-f0-9]{64}$/;
const PHOTO_SOURCES={
 'public-domain-wall-calendar':{
  author:'Claudio Elias',license:'Public-domain (PD-self)',
  page:'https://commons.wikimedia.org/wiki/File:WallCalendar.jpg',
  url:'https://commons.wikimedia.org/wiki/Special:FilePath/WallCalendar.jpg'
 },
 'cc0-wooden-wall-calendar':{
  author:'Amitbalani',license:'CC0-1.0',
  page:'https://commons.wikimedia.org/wiki/File:Manual_scrollable_wooden_wall_calendar.jpg',
  url:'https://commons.wikimedia.org/wiki/Special:FilePath/Manual_scrollable_wooden_wall_calendar.jpg'
 }
};
const PLANTS={
 'mood-v101-haworthia': ['haworthia','James Ray Cock','https://polyhaven.com/a/potted_plant_04',
  'potted-zebra-haworthia-4acc845e6'],
 'mood-v101-heartleaf':['heartleaf','Rico Cilliers','https://polyhaven.com/a/potted_plant_02',
  'potted-plant-in-a-terracotta-pot-fd420e6b'],
 'mood-v101-snake-plant':['snake-plant','Innerscene',
  'https://www.innerscene.com/tools/library/3d-parts/sword-plant-plant-accessory-8a944229',
  'sword-plant-plant-accessory-8a944229'],
 'mood-v101-browning-haworthia':['haworthia','James Ray Cock','https://polyhaven.com/a/potted_plant_04',
  'potted-zebra-haworthia-4acc845e6']
};
const CALENDARS=['facilities-year-planner','service-shift-calendar',
 'family-month-calendar','small-desk-wall-calendar'];
const hash=x=>typeof x==='string'&&SHA.test(x);
const bytes=x=>Number.isInteger(x)&&x>=100&&x<20_000_000;
export function validateMoodV101(m){
 if(m?.version!==101||!Array.isArray(m.plants)||m.plants.length!==4||
    !Array.isArray(m.calendars)||m.calendars.length!==4||
    !Array.isArray(m.sources)||m.sources.length!==2)
  throw Error('Incomplete CC0 plants/calendar media archive v101');
 const sources=new Map(m.sources.map(x=>[x.id,x]));
 if(sources.size!==2)throw Error('Duplicate image sources');
 for(const [id,p] of Object.entries(PHOTO_SOURCES)){
  const x=sources.get(id);
  if(!x||x.author!==p.author||x.license!==p.license||x.sourcePage!==p.page||
   x.downloadUrl!==p.url||x.sourcePath!==ROOT+'calendar-source/'+id+'.jpg'||
   !hash(x.sha256)||!bytes(x.bytes)||x.width<600||x.height<600)
   throw Error('Unverified commercial/personal calendar source '+id);
 }
 const ids=new Set();
 for(const p of m.plants){
  const old=PLANTS[p.id];
  if(!old||ids.has(p.id)||p.category!=='Realistic Desk Plants'||p.kind!=='model'||
   p.condition!=='weathered'||p.license!=='CC0-1.0'||
   p.materialStyle!=='image-mapped'||!p.skipMaterialEnhancement||
   p.path!==ROOT+'models/'+old[0]+'.glb'||p.originalAuthor!==old[1]||
   p.originalSource!==old[2]||p.mirrorPage!=='https://www.innerscene.com/tools/library/3d-parts/'+old[3]||
   p.downloadUrl!=='https://www.innerscene.com/api/library/'+old[3]+'/download'||
   p.sourceSHA256!==p.sha256||p.sourceBytes!==p.bytes||
   !hash(p.sha256)||!bytes(p.bytes)||p.sourceMeshCount<1||p.sourceImageCount<1||
   !(p.targetHeight>0&&p.targetHeight<=1.5)||!(p.radius>.05&&p.radius<=1))
   throw Error('Unpinned sourced desk plant '+p?.id);
  if(p.id==='mood-v101-browning-haworthia'){
   if(p.plantCondition!=='browning'||p.variationOf!=='mood-v101-haworthia')
    throw Error('Unlicensed withering variation');
  }else if(p.plantCondition||p.variationOf)throw Error('Unapproved plant retouch');
  ids.add(p.id);
 }
 for(const [i,slug] of CALENDARS.entries()){
  const x=m.calendars[i];
  const id='mood-v101-calendar-'+slug;
  if(!x||x.id!==id||ids.has(id)||x.category!=='Wall Calendars & Planners'||
   x.kind!=='surface-decal'||x.surface!=='wall'||x.materialStyle!=='image-mapped'||
   x.condition!=='weathered'||x.year!==1996||x.license!=='Source-derived PD/CC0'||
   !sources.has(x.sourceId)||x.originalSource!==sources.get(x.sourceId).sourcePage||
   x.originalAuthor!==sources.get(x.sourceId).author||
   x.path!==ROOT+'calendars/'+slug+'.png'||x.thumb!==x.path||
   !hash(x.sha256)||!bytes(x.bytes)||!Number.isFinite(x.width)||x.width<=.2||x.width>2||
   !Number.isFinite(x.height)||x.height<=.2||x.height>2||
   !Number.isFinite(x.opacity)||x.opacity<.08||x.opacity>1||
   x.calendarStyle!==(i<2?'commercial':'personal'))
   throw Error('Unverified 1996 calendar image '+id);
  ids.add(id);
 }
 if(ids.size!==8)throw Error('Duplicate v101 ID');
 return {plants:m.plants,calendars:m.calendars};
}
export function registerMoodV101(manifest,catalog,index){
 const {plants,calendars}=validateMoodV101(manifest);
 for(const item of [...plants,...calendars]){
  if(index.has(item.id))throw Error('Duplicate mood catalog ID '+item.id);
  const entry=Object.freeze({...item});index.set(entry.id,entry);catalog.push(entry);
 }
 return {models:plants.length,wallCalendars:calendars.length};
}
