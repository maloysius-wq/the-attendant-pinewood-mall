import {MALL} from '../../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../../mall/furnishing-plan-v69.mjs';
import {constructPhysicalShell} from '../../mall/physical-shell-v67.mjs';
import {auditArchitecturalCoverageV114} from '../../mall/architecture-audit-v114.mjs';
import {SEALED_BAYS_V116,auditSealedBayCoverageV116} from '../../mall/sealed-bay-plan-v116.mjs';

const NS='http://www.w3.org/2000/svg';
const colors={public:'#746b55',retail:'#607f85',staff:'#527165',plant:'#69657b',
 stairs:'#736e67',admin:'#886f52',sealed:'#71546c',control:'#725d7d',egress:'#82665c'};
const shortNames={
 central_gallery:'Atrium',west_gallery:'West Walk',east_gallery:'East Walk',
 west_anchor:"Fallow's",cassette_castle:'Cassette Castle',
 sunburst_arcade:'Sunburst Arcade',east_original_anchor:'East Department',
 video_planet:'Video Planet',food_court:'Food Court',service_vestibule:'Contractor Entry',
 boarded_lobby:'Main Entrance',north_service:'North Service',freight_lobby:'Freight Lobby',
 annex_threshold:'East Connector',receiving_r12:'Receiving R-12',
 east_wing_spine:'East Staff Hall',training_t04:'Training T-04',
 break_room:'Break Room',staff_lockers:'Staff Lockers',annex_anchor:'East Anchor',
 east_exit_vestibule:'Employee Exit',freight_b1:'Freight B1',b1_spine:'Utility Spine',
 b1_cross:'Cross Corridor',relay_d:'Relay D',relay_e:'Relay E',
 feeder_room:'Feeder',sump_pit:'Sump Room',flooded_walk:'Flooded Walk',
 gavin_niche:'Gavin Workpoint',b1_stair:'Fire Stair',m1_stair:'Admin Stair',
 mezz_hall:'Admin Hall',payroll_office:'Payroll',roster_records:'Personnel',
 kessler_office:'Kessler',contractor_ledger:'Contractor Records',
 eli_chase:'Eli Chase',pa_control:'PA Control',pcas_control:'PCAS'
};
const reports=new Map(auditArchitecturalCoverageV114().map(r=>[r.level,r]));
const byId=new Map(MALL.rooms.map(r=>[r.id,r]));
const $=id=>document.getElementById(id);
let level='G',selected=null;
function node(tag,props={},parent=null){
 const e=document.createElementNS(NS,tag);
 for(const [k,v] of Object.entries(props))e.setAttribute(k,String(v));
 if(parent)parent.append(e);
 return e;
}
const boxProps=r=>({x:r.x1,y:r.z1,width:r.x2-r.x1,height:r.z2-r.z1});
function selectRoom(id){
 const r=byId.get(id);if(!r)return;
 selected=id;
 document.querySelectorAll('#drawing g[data-room]').forEach(g=>
  g.classList.toggle('selected',g.dataset.room===id));
 const fixtures=FURNISHINGS_V69.fixtures.filter(f=>f.room===id);
 $('room-name').textContent=r.label;
 $('room-note').replaceChildren();
 const lines=[
  'ID: '+r.id,
  'Level: '+r.level+' · '+r.kind,
  'Bounds: x '+r.x1+' to '+r.x2+' m; z '+r.z1+' to '+r.z2+' m',
  'Floor: '+((r.x2-r.x1)*(r.z2-r.z1)).toLocaleString()+' m²',
  'V69 authored furnishings: '+fixtures.length,
  'First story chapter: '+r.chapter,
  r.story
 ];
 for(const line of lines){const p=document.createElement('p');p.textContent=line;$('room-note').append(p);}
}
function render(nextLevel){
 level=nextLevel;
 const report=reports.get(level),footprints=level==='G'?
  [MALL.footprints.original,MALL.footprints.annex]:[MALL.footprints[level]];
 const minX=Math.min(...footprints.map(r=>r.x1)),maxX=Math.max(...footprints.map(r=>r.x2)),
  minZ=Math.min(...footprints.map(r=>r.z1)),maxZ=Math.max(...footprints.map(r=>r.z2));
 const width=maxX-minX,height=maxZ-minZ,host=$('drawing');host.replaceChildren();
 const svg=node('svg',{viewBox:[minX-4,minZ-4,width+8,height+8].join(' '),
  role:'img','aria-label':level+' floor source architecture with unallocated orange cells'},host);
 for(const f of footprints)node('rect',{...boxProps(f),fill:'#1e3131',stroke:'#8c9f94','stroke-width':'.4'},svg);
 for(const p of report.unassignedTiles)
  node('rect',{...boxProps(p),fill:'#aa573b','fill-opacity':'.62',stroke:'none'},svg);
 if(level==='G')for(const bay of SEALED_BAYS_V116){
  const g=node('g',{'data-sealed':bay.id,tabindex:'0',role:'button','aria-label':'Closed: '+bay.label},svg);
  node('rect',{...boxProps(bay),fill:bay.kind==='retail'?'#644f47':'#414e47',stroke:'#c08f69',
   'stroke-width':'.18','stroke-dasharray':'.9 .4','fill-opacity':'.88'},g);
  const short=bay.front?.sign||bay.label;
  const fs=Math.min(1.25,(bay.x2-bay.x1-1)/Math.max(1,short.length*.62));
  if(fs>.65){const t=node('text',{x:(bay.x1+bay.x2)/2,y:(bay.z1+bay.z2)/2,
   'text-anchor':'middle','dominant-baseline':'middle','font-size':fs.toFixed(2),
   fill:'#f6e6cc','pointer-events':'none'},g);t.textContent=short;}
  const details=()=>{selected=null;$('room-name').textContent=bay.label+' · Sealed';
   $('room-note').textContent=bay.kind+' · '+((bay.x2-bay.x1)*(bay.z2-bay.z1))+' m². Permanently closed, not a playable narrative room. '+
    (bay.front?'Shutter faces '+bay.front.adjacent+'.':'Building support/overflow space.');};
  g.addEventListener('click',details);
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();details();}});
 }
 for(const r of MALL.rooms.filter(r=>r.level===level)){
  const g=node('g',{'data-room':r.id,tabindex:'0',role:'button','aria-label':r.label},svg);
  node('rect',{...boxProps(r),fill:colors[r.kind]||'#777',stroke:'#a7b6af',
   'stroke-width':'.16','fill-opacity':'.83'},g);
  // Abbreviated map labels are intentionally distinct from the complete
  // accessible and sidebar titles. Never draw text outside the source room.
  const short=shortNames[r.id]||r.label;
  const textSize=Math.min(1.7,(r.x2-r.x1-1.2)/(Math.max(1,short.length)*.64));
  if(textSize>=.9&&r.z2-r.z1>4.2){
   const t=node('text',{x:(r.x1+r.x2)/2,y:(r.z1+r.z2)/2,'text-anchor':'middle',
    'dominant-baseline':'middle','font-size':textSize.toFixed(3),
    'font-family':'system-ui, sans-serif','font-weight':'600',fill:'#f4f5eb',
    'pointer-events':'none'},g);
   t.textContent=short;
  }
  g.addEventListener('click',()=>selectRoom(r.id));
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectRoom(r.id);}});
 }
 const shell=constructPhysicalShell({level,chapter:6});
 for(const p of shell.portals.filter(p=>p.type==='doorway')){
  const x1=p.axis==='z'?p.start:p.at,y1=p.axis==='z'?p.at:p.start;
  const x2=p.axis==='z'?p.end:p.at,y2=p.axis==='z'?p.at:p.end;
  node('line',{x1,y1,x2,y2,stroke:'#f6d68f','stroke-width':'.56',
   'stroke-linecap':'round','pointer-events':'none'},svg);
 }
 for(const f of footprints)
  node('rect',{...boxProps(f),fill:'none',stroke:'#bcc5aa','stroke-width':'.35','pointer-events':'none'},svg);
 for(const b of document.querySelectorAll('[data-level]'))
  b.setAttribute('aria-pressed',b.dataset.level===level);
 $('floor-title').textContent={G:'Ground · Retail',B1:'Basement · Mechanical',M1:'Mezzanine · Administration'}[level];
 $('metrics').replaceChildren();
 for(const [label,value] of [
  ['Defined rooms',report.roomCount],
  ['Footprint',report.footprintArea.toLocaleString()+' m²'],
  ['Assigned',report.assignedArea.toLocaleString()+' m²'],
  ['Unallocated',report.unassignedArea.toLocaleString()+' m²'],
  ['Unallocated share',report.unassignedPercent.toFixed(1)+'%'],
  ['Overlapping floor',report.overlapArea.toLocaleString()+' m²'],
  ...(level==='G'?[
   ['Closed bays',SEALED_BAYS_V116.length],
   ['Newly enclosed',auditSealedBayCoverageV116().sealedSquareMetres.toLocaleString()+' m²'],
   ['Still unallocated',auditSealedBayCoverageV116().unassignedRemainderSquareMetres.toLocaleString()+' m²']
  ]:[]),
  ['Door headers',shell.walls.filter(w=>w.role==='lintel').length]
 ]){
  const dt=document.createElement('dt'),dd=document.createElement('dd');
  dt.textContent=label;dd.textContent=String(value);$('metrics').append(dt,dd);
 }
 selected=null;
 const defaultRoom={G:'central_gallery',B1:'relay_d',M1:'kessler_office'}[level];
 selectRoom(defaultRoom);
}
for(const b of document.querySelectorAll('[data-level]'))
 b.addEventListener('click',()=>render(b.dataset.level));
render(level);
window.__PINEWOOD_ARCHITECTURE_V114__={
 ready:true,
 getState:()=>({level,selected,rooms:reports.get(level).roomCount,
  unassignedArea:reports.get(level).unassignedArea,
  sealedBays:level==='G'?SEALED_BAYS_V116.length:0,
  headerCount:constructPhysicalShell({level,chapter:6}).walls.filter(w=>w.role==='lintel').length}),
 selectFloor:render,
 selectRoom
};
