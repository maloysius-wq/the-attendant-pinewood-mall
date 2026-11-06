import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader',
 '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
try{
 const page=await browser.newPage({viewport:{width:800,height:600}});
 const res=await page.goto(origin+'/LICENSES.md',{waitUntil:'domcontentloaded'});
 assert.equal(res.status(),200);
 await page.setContent('<!doctype html><script type="importmap">{"imports":{"three":"/vendor/three/build/three.module.js"}}</script>');
 const report=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three/build/three.module.js');
  const {GLTFLoader}=await import('/vendor/three/examples/jsm/loaders/GLTFLoader.js');
  const loader=new GLTFLoader(),results=[];
  const catalog=await (await fetch('/assets/vendor/builder/catalog-v1.json')).json();
  const picks=[
   'kenney-furniture-kit-bench','kenney-furniture-kit-bookcaseopen',
   'kenney-furniture-kit-bookcaseclosed',
   'three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-slatwall-shelf-bracket-9b6bccae',
   'three-d-retail-store-fixtures-and-mall-retail-store-fixtures-and-mall-wall-bay-shelf-and-rail-e1cc3046',
   'three-d-retro-arcade-and-mall-1989-retro-arcade-and-mall-1989-mall-bench-1c2eb350',
   'kenney-graveyard-kit-bench-damaged'
  ];
  const width=256,height=256;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x181818);
  const ambient=new THREE.AmbientLight(0xffffff,.55),hemi=new THREE.HemisphereLight(0xffffff,0xc5ccd0,0);
  scene.add(ambient,hemi);
  const camera=new THREE.PerspectiveCamera(45,1,.01,100);
  const renderer=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});
  renderer.setSize(width,height,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const gl=renderer.getContext();
  const measure=()=>{
   renderer.render(scene,camera);
   const data=new Uint8Array(width*height*4);
   gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,data);
   const bg=[data[0],data[1],data[2]];
   let n=0,w=0,sr=0,sg=0,sb=0,saturation=0;
   for(let i=0;i<data.length;i+=4){
    const r=data[i],g=data[i+1],b=data[i+2];
    if(Math.abs(r-bg[0])+Math.abs(g-bg[1])+Math.abs(b-bg[2])<28)continue;
    n++;sr+=r;sg+=g;sb+=b;
    if(r>225&&g>225&&b>225)w++;
    saturation+=Math.max(r,g,b)-Math.min(r,g,b);
   }
   return {pixels:n,mean:n?[Math.round(sr/n),Math.round(sg/n),Math.round(sb/n)]:[],whiteRatio:n?Math.round(w/n*1000)/1000:0,meanChannelSpread:n?Math.round(saturation/n):0};
  };
  for(const id of picks){
   const item=catalog.models.find(m=>m.id===id);
   if(!item)throw Error('missing catalog '+id);
   const loaded=await loader.loadAsync('/'+item.path);
   const model=loaded.scene;
   const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
   model.position.sub(center);
   scene.add(model);
   const distance=Math.max(size.x,size.y,size.z)*1.7+0.1;
   camera.position.set(distance*.68,distance*.47,distance);
   camera.lookAt(0,0,0);
   camera.updateProjectionMatrix();
   renderer.toneMappingExposure=1.14;hemi.intensity=0;
   const normal=measure();
   renderer.toneMappingExposure=1.881;hemi.intensity=3;
   const bright=measure();
   const alternatives=[];
   for(const {fill,exposure} of [
    {fill:.9,exposure:1.55},{fill:1.2,exposure:1.4},
    {fill:1.4,exposure:1.25},{fill:1.6,exposure:1.3},{fill:1.1,exposure:1.6}
   ]){
    hemi.intensity=fill;renderer.toneMappingExposure=exposure;
    alternatives.push({fill,exposure,...measure()});
   }
   const materials=[];
   model.traverse(o=>{if(o.isMesh){
    for(const m of (Array.isArray(o.material)?o.material:[o.material])){
     materials.push({name:m.name,type:m.type,color:m.color?.getHexString(),map:!!m.map,toneMapped:m.toneMapped,transparent:m.transparent});
    }
   }});
   results.push({id,label:item.label,materials:materials.slice(0,8),normal,bright,alternatives});
   scene.remove(model);
  }
  renderer.dispose();
  return results;
 });
 for(const item of report)console.log('PINEWOOD_SURFACE_RENDER '+JSON.stringify(item));
}finally{await browser.close()}
