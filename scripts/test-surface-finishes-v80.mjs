import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {constructPhysicalShell} from '../mall/physical-shell-v67.mjs';
import {MALL} from '../mall/masterplan-v66.mjs';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const textureFiles=Object.freeze({
 shopCeiling:{path:'opening/assets/v80/aged-acoustic-ceiling-albedo.jpg',sha:'5a3220b6a74319bf77498ec9593dfe2b5a2b4919f1d23684982ab7d5676fe6f7'},
 plasterCeiling:{path:'opening/assets/v80/stained-plaster-ceiling-albedo.jpg',sha:'4541c84a9df0a623db11015744bfca2ab5b591824da9750af9f19699ca65ade3'},
 sidewalk:{path:'opening/assets/v80/worn-sidewalk-albedo.jpg',sha:'872a984cee5c4e9e90377366bcd9a8901e8fa0739362c0acb83219fc8c78eb22'}
});

test('all ground-floor ceiling plates have appropriate distinct local finish sources',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.equal(shell.texturePaths.shopCeiling,textureFiles.shopCeiling.path);
 assert.equal(shell.texturePaths.plasterCeiling,textureFiles.plasterCeiling.path);
 const enclosed=MALL.rooms.filter(r=>r.level==='G'&&r.id!=='central_gallery');
 for(const room of enclosed){
  const plates=shell.ceilings.filter(p=>p.room===room.id);
  assert.ok(plates.length>0,room.id+' missing');
  assert.ok(plates.every(p=>p.material===(room.kind==='retail'?'shop-ceiling':'plaster-ceiling')),
   room.id+' must use its room-appropriate ceiling');
 }
 assert.ok(shell.ceilings.some(p=>p.material==='shop-ceiling'));
 assert.ok(shell.ceilings.some(p=>p.material==='plaster-ceiling'));
});
test('renderer actually binds UV-tiled StandardMaterials to ceiling maps',()=>{
 const renderer=source('mall/render-shell-v67.js');
 assert.match(renderer,/shopCeiling:material\([^\n]+t\.shopCeiling/);
 assert.match(renderer,/plasterCeiling:material\([^\n]+t\.plasterCeiling/);
 assert.match(renderer,/p\.material==='shop-ceiling'\?2\.44:3/);
 assert.match(renderer,/mesh\.userData\.ceilingFinish=p\.material/);
});
test('exterior front walkway has real UV-scaled texture and it preloads behind cover',()=>{
 const scene=source('opening/scene.js'),intro=source('opening/intro-v65.js');
 assert.match(scene,/frontSidewalk\.name='front_mall_sidewalk'/);
 assert.match(scene,/tileBoxUV\(box\(world,0,-\.07,-17\.55,103,\.22,9\.6,sidewalkMaterial\),3\.4\)/);
 assert.match(scene,/new URL\('\.\/assets\/v80\/worn-sidewalk-albedo\.jpg'/);
 assert.match(scene,/Promise\.all\(\[environmentReady,sidewalkReady\]\)/);
 assert.match(scene,/sidewalkMaterial\.map=texture/);
 assert.match(intro,/scene\.js\?v=80/);
 assert.match(source('mall/render-shell-v68.js'),/render-shell-v67\.js\?v=80/);
});
test('all three original square 1024px albedo assets are pinned and valid JPEGs',()=>{
 for(const [name,item] of Object.entries(textureFiles)){
  const bytes=readFileSync(new URL('../'+item.path,import.meta.url));
  assert.equal(bytes[0],0xff,name+' JPEG SOI');
  assert.equal(bytes[1],0xd8,name+' JPEG SOI');
  assert.ok(bytes.length>100000&&bytes.length<750000,name+' compressed local asset');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha,name+' exact asset hash');
  assert.ok(source('LICENSES.md').includes(item.sha),name+' provenance recorded');
 }
});
