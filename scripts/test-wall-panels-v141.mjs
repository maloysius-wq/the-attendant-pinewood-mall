
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {PANEL_MOUNTS_V141,PANEL_BASE_Y_V141,mountedPanelSitesV141} from '../mall/chapter1-wall-panels-v141.mjs';
import {installChapter1WallPanelsV141} from '../mall/chapter1-wall-panels-v141.js';
import {buildGameplayLayoutV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';

test('all three original panel backs rest just 8mm from true solid masonry, with real access',()=>{
 const layout=buildGameplayLayoutV70({chapter:1});
 const result=mountedPanelSitesV141(layout);
 assert.deepEqual(result.errors,[]);
 assert.deepEqual(result.panels.map(p=>p.id),['A','B','C']);
 for(const site of result.panels){
  const m=PANEL_MOUNTS_V141[site.id],w=site.wall;
  const center=w.axis==='x'?site.position.x:site.position.z;
  const actualBack=center-m.normal*.07;
  const expectedBack=w.at+m.normal*(w.thickness/2+.008);
  assert.ok(Math.abs(actualBack-expectedBack)<1e-8,site.id+' not flush with physical wall');
  assert.equal(w.bottom,0);
  assert.ok(w.top>=2.1);
  assert.ok(!w.role.includes('storefront'));
  assert.ok(m.along>=w.start+.55&&m.along<=w.end-.55);
  assert.equal(site.position.y,PANEL_BASE_Y_V141);
  assert.ok(site.clearDistance<2.45);
  assert.ok(layout.canStand(site.approach.x,site.approach.z));
  assert.equal(layout.roomAt(site.approach.x,site.approach.z),site.room);
  assert.ok(shortestRouteV70(layout,layout.spawn,site.approach).length>0);
  assert.ok(shortestRouteV70(layout,{x:6,z:-81},site.approach).length>0);
  assert.ok(shortestRouteV70(layout,site.approach,{x:17,z:-113}).length>0);
  const mapped=storyTargetV70({chapter:1,type:'breaker',id:site.id});
  assert.deepEqual([mapped.room,mapped.x,mapped.z],
   [site.room,site.approach.x,site.approach.z]);
 }
});
test('no glass or missing masonry support is ever accepted',()=>{
 const layout=buildGameplayLayoutV70({chapter:1});
 const broken={...layout,shell:{...layout.shell,walls:layout.shell.walls.filter(w=>w.id!==PANEL_MOUNTS_V141.A.wallId)}};
 assert.ok(mountedPanelSitesV141(broken).errors.some(x=>x.includes('missing actual solid wall')));
 const glass={...layout,shell:{...layout.shell,walls:layout.shell.walls.map(w=>w.id===PANEL_MOUNTS_V141.B.wallId?{...w,role:'storefront-glass'}:w)}};
 assert.ok(mountedPanelSitesV141(glass).errors.some(x=>x.includes('not full-height')));
});
test('same actual original panel meshes get repositioned without clones and rebind on restart',()=>{
 const layout=buildGameplayLayoutV70({chapter:1}),scene=new THREE.Scene();
 const make=id=>{
  const o=new THREE.Group(),mesh=new THREE.Mesh(new THREE.BoxGeometry(.42,.5,.14)),lamp=new THREE.Mesh(new THREE.SphereGeometry(.025));
  o.add(mesh,lamp);o.userData={type:'breaker',id,on:false,lamp};scene.add(o);return o;
 };
 let list=['A','B','C'].map(make);
 const yaw=new THREE.Group(),pitch=new THREE.Group(),camera=new THREE.PerspectiveCamera();
 yaw.add(pitch);pitch.add(camera);
 const game={levelIndex:0,mallLayoutV70:layout,world:{interactables:list},
  controls:{yaw,pitch},camera,__chapter1WorkOrderV137:{},__chapter1LightsV138:{},
  updateInteraction(){},interact(){this.interactTarget.userData.on=true;}};
 const c=installChapter1WallPanelsV141(game);
 assert.equal(installChapter1WallPanelsV141(game),c);
 const mounted=mountedPanelSitesV141(layout).panels;
 for(const site of mounted){
  const o=list.find(x=>x.userData.id===site.id);
  assert.equal(o.parent,scene);
  assert.equal(o.children.length,2);
  assert.ok(o.position.distanceTo(new THREE.Vector3(site.position.x,site.position.y,site.position.z))<1e-8);
  assert.equal(o.rotation.y,site.yaw);
  assert.equal(o.userData.lamp.isMesh,true);
  assert.equal(o.userData.physicalMasonryV141,site.wall.id);
  game.interactTarget=o;game.interact();assert.equal(o.userData.on,true);
 }
 list=['A','B','C'].map(make);
 game.world.interactables=list;
 game.mallLayoutV70=buildGameplayLayoutV70({chapter:1});
 c.bind();
 assert.deepEqual(c.getState().panels.map(p=>p.on),[false,false,false]);
 game.levelIndex=1;
 const old=list.map(x=>x.position.clone());c.bind();
 assert.ok(list.every((x,i)=>x.position.equals(old[i])),'later chapters unaffected');
});
