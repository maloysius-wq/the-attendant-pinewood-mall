/** Resilient repository-local GLB fetch for the standalone Builder.
 * GitHub Pages can briefly return 503/502 while serving large already-pinned
 * models such as the 6.25 MB Haworthia. The old GLTFLoader.loadAsync failure
 * immediately rejected and could become a permanently cached rejection.
 *
 * Only committed same-origin /assets/vendor/*.glb binaries are allowed.
 * Do not add external fallbacks, substitute models, change the user's layout
 * or mask a genuine missing 404 asset.
 */
export const LOCAL_GLB_ATTEMPTS_V109=4;
const TEMPORARY_STATUS=status=>status===408||status===429||(status>=500&&status<600);
const backoffMs=attempt=>[200,600,1400][attempt-1];
const defaultWait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

export function assertLocalGlbV109(url){
 const root=new URL('../assets/vendor/',import.meta.url);
 const target=new URL(url,root);
 if(target.origin!==root.origin||!target.href.startsWith(root.href)||
  !target.pathname.toLowerCase().endsWith('.glb')||target.search||target.hash)
  throw Error('Nonlocal or unpinned GLB fetch rejected');
 return target;
}
export function validateGlbResponseV109(data,expectedBytes){
 if(!(data instanceof ArrayBuffer)||data.byteLength<20)
  throw Error('Incomplete GLB asset response');
 const header=new DataView(data);
 if(header.getUint32(0,true)!==0x46546c67||header.getUint32(4,true)!==2||
  header.getUint32(8,true)!==data.byteLength)
  throw Error('Corrupted GLB asset response');
 if(Number.isInteger(expectedBytes)&&expectedBytes>0&&data.byteLength!==expectedBytes)
  throw Error('Pinned GLB asset byte count mismatch: expected '+expectedBytes+', got '+data.byteLength);
 return data;
}

/** Retry HTTP 408/429/5xx, truncated responses and true network failures.
 * 404/401/403 are permanent and stop immediately. Every attempt uses the
 * SAME locally vendored URL; retries bypass a possibly cached failed reply.
 * Dependencies are injectable for deterministic failure-recovery CI checks.
 */
export async function fetchLocalGlbV109(input,{expectedBytes,
 fetchImpl=globalThis.fetch,wait=defaultWait,onRetry=()=>{},
 maxAttempts=LOCAL_GLB_ATTEMPTS_V109}={}){
 const url=assertLocalGlbV109(input);
 if(!Number.isInteger(maxAttempts)||maxAttempts<1||maxAttempts>6)
  throw Error('Invalid GLB retry limit');
 for(let attempt=1;attempt<=maxAttempts;attempt++){
  let reason='',retryable=false;
  try{
   const response=await fetchImpl(url.href,{
    cache:attempt===1?'default':'reload',
    signal:AbortSignal.timeout(45_000)
   });
   if(!response.ok){
    reason='HTTP '+response.status;
    retryable=TEMPORARY_STATUS(response.status);
   }else{
    try{return validateGlbResponseV109(await response.arrayBuffer(),expectedBytes)}
    catch(e){reason=e.message||String(e);retryable=true;}
   }
  }catch(e){
   reason=e?.message||String(e);
   retryable=true;
  }
  if(!retryable||attempt===maxAttempts)
   throw Error('Local model '+url.pathname+' unavailable ('+reason+
    ', '+attempt+' attempt'+(attempt===1?'':'s')+'). '+
    (retryable?'The host did not deliver valid model bytes; try reloading once the server recovers.':
     'This asset is missing or access is denied; it cannot be retried.'));
  onRetry({path:url.pathname,reason,attempt,remaining:maxAttempts-attempt});
  await wait(backoffMs(attempt));
 }
 throw Error('Unreachable GLB retry state');
}
