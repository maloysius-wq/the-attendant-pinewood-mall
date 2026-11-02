import * as THREE from '../../vendor/three/build/three.module.js';
import {OrbitControls} from '../../vendor/three/examples/jsm/controls/OrbitControls.js';
import {MALL,validateMasterplan} from '../../mall/masterplan-v66.mjs';

const svg=document.getElementById('blueprint');
const NS='http://www.w3.org/2000/svg';
const area=document.getElementById('model3d');
const controlsRoot=document.querySelector('aside');
const state={floor:'G',chapter:1,selectedRoom:'central_gallery',showRoute:true,showLabels:true};
const qa={ready:false,geometryErrors:validateMasterplan(),getState:()=>({
 ...state,roomCount:MALL.rooms.filter(r=>r.level===state.floor).length,
 visibleRouteSteps:MALL.routes.find(r=>r.chapter===state.chapter)?.sequence.filter(id=>room(id)?.level===state.floor).length??0,
 rooms:MALL.rooms.length,links:MALL.links.length,evidence:MALL.evidence.length,
 renderer:renderer?'webgl':'not-ready',
 errors:qa.geometryErrors.slice()
}),selectFloor,selectChapter};
window.__PINEWOOD_MALL_MASTERPLAN_V66__=qa;
const room=id=>MALL.rooms.find(r=>r.id===id);
const floor=id=>MALL.levels.find(l=>l.id===id);
const selectedRoute=()=>MALL.routes.find(r=>r.chapter===state.chapter);
const S=5,sx=x=>32+(x+50)*S,sy=z=>28+(z+123)*S;
const colByKind={public:'#367d74',staff:'#537b94',retail:'#a47751',egress:'#b99458',plant:'#527f97',stairs:'#847a9c',admin:'#95788c',control:'#966e83',sealed:'#a16467'};
const scene=new THREE.Scene();scene.background=new THREE.Color('#091519');
scene.add(new THREE.AmbientLight(0xb7cdd2,1.4));
const lamp=new THREE.DirectionalLight(0xffdfb0,2.4);lamp.position.set(-80,150,50);scene.add(lamp);
const camera=new THREE.OrthographicCamera(-90,90,90,-90,.1,800);
camera.position.set(135,135,75);camera.lookAt(20,0,-70);
let renderer=null,orbit=null,worldGroup=null;
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(area.clientWidth,Math.max(area.clientHeight,320));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 area.prepend(renderer.domElement);
 orbit=new OrbitControls(camera,renderer.domElement);
 orbit.enableDamping=true;orbit.dampingFactor=.08;
 orbit.maxPolarAngle=Math.PI/2.15;
 orbit.minDistance=40;orbit.maxDistance=350;
 orbit.enablePan=true;
}catch(error){
 qa.geometryErrors.push('WebGL unavailable: '+error.message);
 const fallback=document.createElement('p');fallback.textContent='3D preview unavailable on this device; the scale blueprint remains usable.';
 fallback.style.cssText='padding:30px;color:#e5c89a;font-size:14px';area.prepend(fallback);
}

function el(name,attrs={},text=null){
 const e=document.createElementNS(NS,name);
 for(const [key,val] of Object.entries(attrs))e.setAttribute(key,String(val));
 if(text!==null)e.textContent=text;
 return e;
}
function labelFor(r,pxWidth){
 const parts=r.label.replace(/\s+\/\s+/g,' / ').split(' ');
 const short=parts.length>3?parts.slice(0,3).join(' '):r.label;
 const max=Math.max(5,Math.floor(pxWidth/6.15));
 return short.length>max?short.slice(0,Math.max(4,max-1))+'…':short;
}
function drawBlueprint(){
 svg.replaceChildren(el('title',{},MALL.title+' '+floor(state.floor).label));
 const background=el('g',{'data-purpose':'grid'});
 for(let x=-40;x<=80;x+=10)background.append(el('line',{x1:sx(x),x2:sx(x),y1:28,y2:568,stroke:'#7fa59b','stroke-opacity':.10,'stroke-width':.8}));
 for(let z=-120;z<=-20;z+=10)background.append(el('line',{x1:28,x2:735,y1:sy(z),y2:sy(z),stroke:'#7fa59b','stroke-opacity':.10,'stroke-width':.8}));
 svg.append(background);
 const shells=state.floor==='G'?[['ORIGINAL MALL / 1979',MALL.footprints.original],['EAST ANNEX / 1988–94',MALL.footprints.annex]]
  :[[state.floor==='B1'?'MECHANICAL SUBLEVEL':'ADMINISTRATIVE DECK',MALL.footprints[state.floor]]];
 for(const [name,b] of shells){
  svg.append(el('rect',{x:sx(b.x1),y:sy(b.z1),width:(b.x2-b.x1)*S,height:(b.z2-b.z1)*S,fill:'#0e292b','fill-opacity':.45,stroke:'#c49d5f','stroke-width':2,'stroke-dasharray':'5 3'}));
  svg.append(el('text',{x:sx(b.x1)+6,y:sy(b.z1)-7,'font-size':10,'font-weight':750,'letter-spacing':1.3,fill:'#cbb785'},name));
 }
 const route=selectedRoute(),participates=new Set(route?.sequence||[]);
 const floorRooms=MALL.rooms.filter(r=>r.level===state.floor);
 for(const r of floorRooms){
  const highlighted=state.chapter==='all'||participates.has(r.id);
  const group=el('g',{'class':'room-group'+(r.id===state.selectedRoom?' selected':''),
   'data-room':r.id,tabindex:0,role:'button','aria-label':r.label+': '+r.story});
  const w=(r.x2-r.x1)*S,h=(r.z2-r.z1)*S;
  group.append(el('rect',{x:sx(r.x1),y:sy(r.z1),width:w,height:h,rx:1,fill:colByKind[r.kind]||'#5e7a80','fill-opacity':highlighted?.67:.21,
    stroke:participates.has(r.id)?'#f6bd6b':'#78928c','stroke-width':participates.has(r.id)?2:.6}));
  if(state.showLabels&&w>=36&&h>=28){
   const label=labelFor(r,w-6);
   const size=Math.min(10,Math.max(7,w/(Math.max(label.length,5)*.62)));
   group.append(el('text',{x:sx(r.x1)+w/2,y:sy(r.z1)+h/2+3,'text-anchor':'middle','font-size':size,'font-weight':r.id===state.selectedRoom?900:650,
    fill:highlighted?'#f6f0df':'#8aaba9',style:'pointer-events:none'},label));
  }
  group.addEventListener('click',()=>selectRoom(r.id));
  group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectRoom(r.id)}});
  svg.append(group);
 }
 const activePoints=MALL.landmarks.filter(p=>p.level===state.floor);
 for(const p of activePoints){
  const isBlocked=p.status==='sealed'||p.status==='boarded';
  svg.append(el('circle',{cx:sx(p.x),cy:sy(p.z),r:isBlocked?5:4.2,fill:isBlocked?'#dd7768':'#ecd0a3',stroke:'#071214','stroke-width':1.5,
   'data-landmark':p.id}));
 }
 if(state.showRoute&&route){
  const points=route.sequence.map(room).filter(Boolean);
  const segments=el('g',{'class':'route-wire','data-route':route.chapter});
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i];
   if(a.level!==state.floor||b.level!==state.floor)continue;
   const aX=sx((a.x1+a.x2)/2),aY=sy((a.z1+a.z2)/2),bX=sx((b.x1+b.x2)/2),bY=sy((b.z1+b.z2)/2);
   segments.append(el('line',{x1:aX,y1:aY,x2:bX,y2:bY,stroke:'#f7cc75','stroke-width':3.1,'stroke-opacity':.85,'stroke-dasharray':'7 5'}));
   segments.append(el('circle',{cx:bX,cy:bY,r:3.3,fill:'#fce4aa',stroke:'#51391b','stroke-width':1}));
  }
  svg.append(segments);
 }
 // Explicit front reference and exit. The boarded entrance is not a selectable path.
 if(state.floor==='G'){
  const service=MALL.doors.find(d=>d.id==='service_entry');
  const main=MALL.doors.find(d=>d.id==='main_entry');
  const east=MALL.doors.find(d=>d.id==='east_employee_exit');
  for(const [d,color,txt,dx,dy]of [[service,'#8fd7c8','AUTHORIZED ENTRY',5,22],[main,'#ee756f','BOARDED',-72,22],[east,'#e5b56a','EXIT / CH6',-48,19]]){
   svg.append(el('rect',{x:sx(d.x)-4,y:sy(d.z)-4,width:8,height:8,fill:color,stroke:'#18221b','stroke-width':1.3}));
   svg.append(el('text',{x:sx(d.x)+dx,y:sy(d.z)+dy,'font-size':9,fill:color,'font-weight':850,'letter-spacing':.6},txt));
  }
 }
 svg.append(el('text',{x:49,y:592,fill:'#8aacaf','font-size':10,'letter-spacing':1.2},'0'));
 svg.append(el('line',{x1:49,x2:149,y1:608,y2:608,stroke:'#b5d0ce','stroke-width':2}));
 [49,99,149].forEach(x=>svg.append(el('line',{x1:x,x2:x,y1:603,y2:613,stroke:'#b5d0ce','stroke-width':1.4})));
 svg.append(el('text',{x:149,y:592,fill:'#8aacaf','font-size':10,'text-anchor':'end'},'20 M'));
 svg.append(el('text',{x:711,y:26,fill:'#9eb8b7','font-size':17,'font-weight':800},'↑ N'));
 if(state.floor==='G')svg.append(el('text',{x:sx(1),y:sy(-71)-14,fill:'#fae1b3','font-size':11,'font-weight':800,'text-anchor':'middle'},'DRY FOUNTAIN'));
}
function selectRoom(id){
 const r=room(id);if(!r)return;
 state.selectedRoom=id;
 document.getElementById('room-details').replaceChildren();
 const container=document.getElementById('room-details');
 const small=document.createElement('small');small.textContent=(r.level==='G'?'GROUND':r.level==='B1'?'B1 / BELOW GRADE':'M1 / ADMIN')+' · '+r.kind.toUpperCase();
 const title=document.createElement('h3');title.textContent=r.label;
 const p=document.createElement('p');p.textContent=r.story;
 const badge=document.createElement('div');badge.className='compact';
 const tag=document.createElement('span');tag.className='tag';tag.textContent='CHAPTER '+r.chapter;
 const bounds=document.createElement('span');bounds.className='tag';bounds.textContent='X '+r.x1+'..'+r.x2+' / Z '+r.z1+'..'+r.z2;
 badge.append(tag,bounds);container.append(small,title,p,badge);
 drawBlueprint();draw3D();
}
function selectFloor(next){
 if(!MALL.levels.some(l=>l.id===next))return;
 state.floor=next;
 const name=floor(next);
 document.getElementById('floor-title').textContent=name.label;
 document.getElementById('floor-description').textContent=name.description;
 document.querySelectorAll('[data-floor]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.floor===next)));
 if(room(state.selectedRoom)?.level!==next)state.selectedRoom=MALL.rooms.find(r=>r.level===next).id;
 selectRoom(state.selectedRoom);
}
function selectChapter(next){
 const n=next==='all'?'all':Number(next);
 if(n!=='all'&&!MALL.routes.some(r=>r.chapter===n))return;
 state.chapter=n;
 document.getElementById('chapter').value=String(n);
 const route=selectedRoute();
 document.getElementById('chapter-story').textContent=route?.beats||'Every occupied zone, without chapter highlighting.';
 document.getElementById('route-status').textContent=route?route.title+' · '+route.sequence.length+' ordered room visits':'Whole complex · 3 physical levels';
 document.getElementById('story-heading').textContent=route?'CH '+route.chapter+' / '+route.title:'One physical property';
 document.getElementById('story-explain').textContent=route?.beats||'Original mall, later annex, industrial B1 and limited office mezzanine occupy one building.';
 if(route){
  const first=MALL.rooms.find(r=>route.sequence.includes(r.id)&&r.level===state.floor);
  if(!first){const r=room(route.sequence[0]);selectFloor(r.level);}
 }
 selectRoom(state.selectedRoom);
}

function buildMassing(){
 if(!renderer)return;
 if(worldGroup){
  scene.remove(worldGroup);
  worldGroup.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material){if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material.dispose();}});
 }
 worldGroup=new THREE.Group();scene.add(worldGroup);
 const lvl=floor(state.floor),y=lvl.y,route=selectedRoute();
 const active=new Set(route?.sequence||[]);
 const bounds=state.floor==='G'?[MALL.footprints.original,MALL.footprints.annex]:[MALL.footprints[state.floor]];
 for(const b of bounds){
  const outer=new THREE.BoxGeometry(b.x2-b.x1,.32,b.z2-b.z1);
  const base=new THREE.Mesh(outer,new THREE.MeshStandardMaterial({color:0x203137,roughness:1}));
  base.position.set((b.x1+b.x2)/2,y-.18,(b.z1+b.z2)/2);worldGroup.add(base);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(b.x2-b.x1,.35,b.z2-b.z1)),new THREE.LineBasicMaterial({color:0x9b8052,transparent:true,opacity:.95}));
  edge.position.copy(base.position);edge.position.y=y+.11;worldGroup.add(edge);
 }
 for(const r of MALL.rooms.filter(r=>r.level===state.floor)){
  const isActive=state.chapter==='all'||active.has(r.id);
  const selected=r.id===state.selectedRoom,w=r.x2-r.x1,d=r.z2-r.z1;
  const color=new THREE.Color(colByKind[r.kind]||'#5e7a80');
  const mat=new THREE.MeshStandardMaterial({color,metalness:.08,roughness:.88,transparent:true,opacity:isActive?.78:.18});
  const floorMesh=new THREE.Mesh(new THREE.BoxGeometry(w,.16,d),mat);
  floorMesh.position.set((r.x1+r.x2)/2,y+.045,(r.z1+r.z2)/2);worldGroup.add(floorMesh);
  const h=r.id==='central_gallery'?12:r.kind==='retail'?5.5:3.6;
  const cage=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w,h,d)),new THREE.LineBasicMaterial({color:selected?0xffd58e:isActive?0x9caeb3:0x38535c,transparent:true,opacity:selected?1:isActive?.56:.25}));
  cage.position.set((r.x1+r.x2)/2,y+h/2,(r.z1+r.z2)/2);worldGroup.add(cage);
  if(selected){
   const top=new THREE.Mesh(new THREE.BoxGeometry(w,.09,d),new THREE.MeshBasicMaterial({color:0xf1bb72,transparent:true,opacity:.24}));
   top.position.set((r.x1+r.x2)/2,y+.22,(r.z1+r.z2)/2);worldGroup.add(top);
  }
 }
 if(state.floor==='G'){
  const geometry=new THREE.TorusGeometry(5.2,.32,8,52);
  const ring=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0xa98b60,roughness:.9,metalness:.18}));
  ring.rotation.x=-Math.PI/2;ring.position.set(0,y+.45,-71);worldGroup.add(ring);
 }
 for(const p of MALL.landmarks.filter(p=>p.level===state.floor)){
  const material=new THREE.MeshStandardMaterial({color:p.status==='sealed'?0xea635d:0xffd88f,emissive:p.status==='sealed'?0x74120f:0x493a19,emissiveIntensity:.42});
  const marker=new THREE.Mesh(new THREE.SphereGeometry(1.1,10,8),material);marker.position.set(p.x,y+1.3,p.z);worldGroup.add(marker);
 }
 if(orbit){
  const target=new THREE.Vector3(state.floor==='G'?20:state.floor==='B1'?0:57,y,-76);
  const offset=camera.position.clone().sub(orbit.target);
  orbit.target.copy(target);camera.position.copy(target).add(offset);orbit.update();
 }
}
function draw3D(){buildMassing();if(renderer)renderer.render(scene,camera);}
function resizeThree(){
 if(!renderer)return;
 const w=Math.max(area.clientWidth,320),h=Math.max(area.clientHeight,300);
 renderer.setSize(w,h);
 const extent=state.floor==='G'?165:state.floor==='B1'?100:92;
 camera.left=-extent*w/h/2;camera.right=extent*w/h/2;camera.top=extent/2;camera.bottom=-extent/2;
 camera.updateProjectionMatrix();renderer.render(scene,camera);
}
document.querySelectorAll('[data-floor]').forEach(b=>b.addEventListener('click',()=>selectFloor(b.dataset.floor)));
document.getElementById('chapter').addEventListener('change',e=>selectChapter(e.target.value));
document.getElementById('route-toggle').addEventListener('click',e=>{state.showRoute=!state.showRoute;e.currentTarget.setAttribute('aria-pressed',String(state.showRoute));e.currentTarget.textContent='Route lines '+(state.showRoute?'on':'off');drawBlueprint()});
document.getElementById('labels-toggle').addEventListener('click',e=>{state.showLabels=!state.showLabels;e.currentTarget.setAttribute('aria-pressed',String(state.showLabels));e.currentTarget.textContent='Labels '+(state.showLabels?'on':'off');drawBlueprint()});
if(renderer){
 new ResizeObserver(resizeThree).observe(area);
 const animate=()=>{orbit.update();renderer.render(scene,camera);requestAnimationFrame(animate)};requestAnimationFrame(animate);
}
selectChapter(1);resizeThree();
requestAnimationFrame(()=>requestAnimationFrame(()=>{qa.ready=qa.geometryErrors.length===0}));
