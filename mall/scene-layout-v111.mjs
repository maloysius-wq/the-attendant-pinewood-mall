/** Strict, versioned published/preview Builder layout selector.
 * A public published scene is a reviewed Git-tracked layout. Browser-private
 * edits are NEVER read without ?builderPreview=1, even on the same origin.
 * Preview uses the existing v1 IndexedDB key and never mutates that layout.
 */
import {createEmptyDraft,validateDraft} from './editor-schema-v1.mjs';

export const BUILDER_PREVIEW_PARAM_V111='builderPreview';
export const PUBLISHED_LAYOUT_V111='assets/world/published-layout-v111.json';

export function validateSceneLayoutV111(draft,catalog){
 const errors=validateDraft(draft,catalog);
 if(errors.length)throw Error('Unsafe authored mall scene: '+errors.join('; '));
 // No local author's display-state override may force a scripted cinematic
 // or campaign door open. Doors are inspector previews, not story commands.
 return JSON.parse(JSON.stringify(draft));
}

export function selectSceneLayoutV111({preview,published,local,catalog}){
 const source=preview?'browser-preview':'published';
 const draft=validateSceneLayoutV111(preview?local:published,catalog);
 return {source,draft};
}

export async function readBrowserSceneLayoutV111({indexedDB=globalThis.indexedDB}={}){
 if(!indexedDB)throw Error('Browser storage unavailable for Builder preview');
 const db=await new Promise((resolve,reject)=>{
  const request=indexedDB.open('pinewood-builder-v1',1);
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||Error('Cannot open saved Builder layout'));
 });
 try{
  if(!db.objectStoreNames.contains('drafts'))
   throw Error('No saved Builder scene. Open the Builder and press Save first.');
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction('drafts','readonly');
   const request=tx.objectStore('drafts').get('pinewood-v69');
   request.onsuccess=()=>request.result?resolve(request.result):
    reject(Error('No saved Builder scene. Open the Builder and press Save first.'));
   request.onerror=()=>reject(request.error||Error('Cannot read saved Builder layout'));
   tx.onabort=()=>reject(tx.error||Error('Builder layout read aborted'));
  });
 }finally{db.close()}
}

export async function loadActiveSceneLayoutV111({catalog,
 preview=typeof location!=='undefined'&&new URLSearchParams(location.search).get(BUILDER_PREVIEW_PARAM_V111)==='1',
 fetchImpl=globalThis.fetch,localRead=readBrowserSceneLayoutV111}={}){
 if(!catalog?.length)throw Error('Scene catalog not loaded');
 if(preview){
  const local=await localRead();
  return selectSceneLayoutV111({preview:true,local,catalog});
 }
 const url=new URL('../'+PUBLISHED_LAYOUT_V111,import.meta.url);
 if(url.origin!==(new URL(import.meta.url)).origin)throw Error('Invalid published scene origin');
 const response=await fetchImpl(url.href);
 if(!response.ok)throw Error('Pinned published mall layout unavailable: HTTP '+response.status);
 const published=await response.json();
 return selectSceneLayoutV111({preview:false,published,catalog});
}
