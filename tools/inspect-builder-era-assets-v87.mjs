// Development-time discovery only, no remote browser-runtime requests.
const queries=['crt','retro computer','vintage computer','computer','desktop tower',
 'old computer','rubble','trash pile','debris','garbage','broken tiles','broken glass','trash bags'];
for(const q of queries){
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
