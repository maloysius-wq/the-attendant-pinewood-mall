// Development-time discovery only, no remote browser-runtime requests.
const queries=['crt','retro computer','vintage computer','computer','desktop tower',
 'old computer','rubble','trash pile','debris','garbage','broken tiles','broken glass','trash bags'];
for(const q of [...queries,'crt computer monitor','old desktop monitor','1990s monitor','retro pc','classic computer','computer 1995','office terminal','horizontal computer','beige desktop','computer monitor vintage']){
 const url='https://3dassets.dev/api/v1/assets?q='+encodeURIComponent(q)+'&limit=25';
 const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
 if(!response.ok){console.log('PINEWOOD_ASSET_SEARCH_ERROR',q,response.status);continue;}
 const data=await response.json();
 const items=Array.isArray(data)?data:(
  data.assets||data.results||data.data?.assets||data.data||data.items||[]);
 console.log('PINEWOOD_ASSET_SEARCH',JSON.stringify({q,total:items.length,
  matches:items.slice(0,22).map(x=>({id:x.id,slug:x.slug,title:x.title||x.name,
   description:(x.summary||x.description||'').slice(0,135),url:x.cdnUrl||x.downloadUrl,
   license:x.license?.id||x.license,triangles:x.stats?.triangles}))}));
}

for(const id of ['Bw55oYsbp8','8jVB0zIXKCv']){
 const uri='https://poly.pizza/m/'+id;
 try{
  const res=await fetch(uri,{signal:AbortSignal.timeout(15000)});
  const body=await res.text();
  const snippets=[...body.matchAll(/.{0,85}(?:\.glb|static\.poly\.pizza|Download|gltf|\.fbx).{0,90}/gi)]
   .slice(0,20).map(m=>m[0].slice(0,250));
  console.log('PINEWOOD_POLYPIZZA_PAGE',JSON.stringify({id,status:res.status,bytes:body.length,snippets}));
 }catch(e){console.log('PINEWOOD_POLYPIZZA_ERROR',id,String(e).slice(0,180))}
}
