/**
 * Serialize IndexedDB draft writes in the order they were requested.
 * A rejected write must never poison later saves; the caller still receives
 * that rejection. Only the newest completed write may display "Saved".
 */
export function createOrderedDraftSaves(write){
 if(typeof write!=='function')throw new TypeError('Draft writer must be a function');
 let tail=Promise.resolve(),revision=0;
 return {
  enqueue(snapshot){
   const current=++revision;
   const writing=tail.catch(()=>{}).then(()=>write(snapshot));
   tail=writing;
   return writing.then(()=>({revision:current,latest:current===revision}));
  },
  flush:()=>tail
 };
}
