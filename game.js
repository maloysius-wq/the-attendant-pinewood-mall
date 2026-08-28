// Deployment loader for The Attendant: Pinewood Mall.
// The exact rebuilt game source is gzip-compressed into ten small static files.
const PARTS = Array.from({length:10},(_,i)=>`./bundle/part-${String(i+1).padStart(2,'0')}.txt`);

async function decodeSource(){
  const payload=(await Promise.all(PARTS.map(async url=>{
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok) throw new Error(`Failed to load ${url}: HTTP ${response.status}`);
    return (await response.text()).trim();
  }))).join('');

  const bytes=Uint8Array.from(atob(payload),c=>c.charCodeAt(0));
  if('DecompressionStream' in window){
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  }

  const {ungzip}=await import('https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm');
  return new TextDecoder().decode(ungzip(bytes));
}

try{
  const source=await decodeSource();
  const moduleUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  await import(moduleUrl);
  URL.revokeObjectURL(moduleUrl);
}catch(err){
  console.error('Pinewood game bundle failed to start',err);
  const status=document.getElementById('assetStatus');
  if(status) status.textContent='Game failed to start. Open DevTools for the error details.';
}
