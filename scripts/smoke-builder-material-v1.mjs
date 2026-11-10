import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))remote.push(r.url())});
 const response=await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'});
 assert.equal(response?.status(),200);
 await page.waitForFunction(()=>window.__PINEWOOD_BUILDER__?.ready||window.__PINEWOOD_BUILDER__?.getState().errors.length>0,null,{timeout:120000});
 const api=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getState());
 assert.equal(api.ready,true,JSON.stringify(api.errors));
 const catalog=await page.evaluate(()=>window.__PINEWOOD_BUILDER__.getCatalog());
 assert.equal(catalog.length,511);
 assert.equal(catalog.filter(x=>x.materialStyle==='image-mapped').length,172);
 assert.equal(catalog.filter(x=>x.materialStyle==='color-only').length,339);
 const picker=page.locator('#catalog-material');
 await picker.selectOption('image-mapped');
 assert.equal(await page.locator('.catalog-item').count(),172);
 await picker.selectOption('color-only');
 assert.equal(await page.locator('.catalog-item').count(),338);
 const bench=page.locator('.catalog-item').filter({hasText:'Bench'}).first();
 assert.ok((await bench.count())>=1,'color-only bench remains selectable');
 assert.match(await bench.getAttribute('title'),/Original CC0 source uses flat colors; compatible surfaces are textured in the Builder/);
 await picker.selectOption('');
 assert.equal(await page.locator('.catalog-item').count(),510);
 assert.equal((await page.locator('#catalog-material option').count()),3);
 assert.deepEqual(remote,[],'all runtime resources are served locally');
 assert.deepEqual(errors,[]);
 console.log('PINEWOOD_BUILDER_MATERIAL_DESKTOP_PASS',JSON.stringify({total:catalog.length,imageMapped:172,colorOnly:339}));
}finally{await browser.close()}
