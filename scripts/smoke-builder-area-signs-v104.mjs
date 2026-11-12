import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';

const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[],external=[];
 page.on('pageerror',err=>errors.push(err.message));
 page.on('request',req=>{if(/^https?:/.test(req.url())&&!req.url().startsWith(origin))external.push(req.url())});
 assert.equal((await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'}))?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||
  window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:160000});
 const api=()=>page.evaluate(()=>window.__PINEWOOD_BUILDER__.getAreaSignState());
 const initial=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 assert.equal(initial.ready,true,JSON.stringify(initial.errors));
 assert.equal(initial.roomCount,41);
 assert.equal(initial.catalogCount,638);
 const signs=await api();
 assert.equal(signs.sceneAttached,true,'signs actually attach to loaded three-level 3D building');
 assert.equal(signs.count,41,'one sign group per canonical area');
 assert.equal(signs.faceCount,82,'two face meshes per area, legible from either approach');
 assert.equal(signs.texturedFaces,82,'all sign faces have canvas text maps');
 assert.equal(signs.nonEmissive,true,'wayfinding must not glow like earlier poster bug');
 assert.equal(signs.visible,true);
 assert.equal(await page.locator('#area-signs').isChecked(),true);
 for(const label of ['Cassette Castle','Sunburst Arcade','Video Planet',
  'Old Food Court','Contractor Service Vestibule','Security Office and CCTV',
  'Relay D Switch Room','Personnel and Roster Archive']){
  assert.ok(signs.labels.includes(label),'missing readable zone '+label);
 }
 const initialJSON=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 await page.locator('#area-signs').uncheck();
 assert.equal((await api()).visible,false,'hide only developer signage');
 await page.locator('#area-signs').check();
 assert.equal((await api()).visible,true,'show restored room signage');
 const finalJSON=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.exportJSON());
 assert.equal(finalJSON,initialJSON,'toggle must not modify editable v1 layout');
 assert.deepEqual((await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState())).placementOptions,
  {gridSize:0,allowClipping:true});
 await page.evaluate(()=>window.__PINEWOOD_BUILDER__.jumpRoom('cassette_castle'));
 mkdirSync('artifacts',{recursive:true});
 await page.screenshot({path:'artifacts/pinewood-area-signs-v104.png'});
 assert.deepEqual(external,[],'no third-party image/font/runtime requests');
 assert.deepEqual(errors,[],'no renderer or Builder JavaScript errors');
 console.log('PINEWOOD_BUILDER_AREA_SIGNS_V104_DESKTOP_PASS',JSON.stringify({
  areas:signs.count,doubleSidedFaces:signs.faceCount,levels:[...new Set(signs.placements.map(p=>p.level))],
  readable:true,nonEmissive:true,toggle:true,draftUnchanged:true
 }));
}finally{await browser.close()}
