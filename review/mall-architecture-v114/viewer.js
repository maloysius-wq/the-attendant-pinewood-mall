import {MALL} from '../../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../../mall/furnishing-plan-v69.mjs';
import {constructPhysicalShell} from '../../mall/physical-shell-v67.mjs';
import {auditArchitecturalCoverageV114} from '../../mall/architecture-audit-v114.mjs';

const NS='http://www.w3.org/2000/svg';
const colors={public:'#746b55',retail:'#607f85',staff:'#527165',plant:'#69657b',
 stairs:'#736e67',admin:'#886f52',sealed:'#71546c',control:'#725d7d',egress:'#82665c'};
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
 for(const r of MALL.rooms.filter(r=>r.level===level)){
  const g=node('g',{'data-room':r.id,tabindex:'0',role:'button','aria-label':r.label},svg);
  node('rect',{...boxProps(r),fill:colors[r.kind]||'#777',stroke:'#a7b6af',
   'stroke-width':'.16','fill-opacity':'.83'},g);
  if(r.x2-r.x1>7&&r.z2-r.z1>4){
   const t=node('text',{x:(r.x1+r.x2)/2,y:(r.z1+r.z2)/2,'text-anchor':'middle',
    'dominant-baseline':'middle','font-size':Math.min(1.9,(r.x2-r.x1)/9),
    'font-family':'system-ui, sans-serif','font-weight':'600',fill:'#f4f5eb',
    'pointer-events':'none'},g);
   t.textContent=r.label.length>21?r.label.slice(0,19)+'…':r.label;
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
  headerCount:constructPhysicalShell({level,chapter:6}).walls.filter(w=>w.role==='lintel').length}),
 selectFloor:render,
 selectRoom
};
