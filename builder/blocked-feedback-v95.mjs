/**
 * Builder-only collision feedback. Nothing in here changes placement validation,
 * saves, assets, or the undo/redo history.
 */
export function blockedOperationV95(before,requested){
 if(!before||!requested)return 'Edit';
 const changed=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)>1e-7;
 if(changed(before.scale,requested.scale))return 'Scale';
 if(['x','y','z'].some(k=>changed(before.position?.[k],requested.position?.[k])))return 'Move';
 if(['x','y','z'].some(k=>changed(before.rotation?.[k],requested.rotation?.[k])))return 'Rotation';
 return 'Edit';
}
export function blockedMessageV95(reason,operation='Edit'){
 const text=String(reason||'Placement validation rejected this change.');
 const kind=/wall intersection/i.test(text)?'wall':
  /support|floor|hover/i.test(text)?'support':'other';
 const detail=kind==='wall'?'This change would intersect a wall.':
  kind==='support'?'The object would not have continuous floor or furniture support.':text;
 const title=(['Move','Rotation','Scale','Edit'].includes(operation)?operation:'Edit')+' blocked';
 return {title,detail,
  hint:kind==='support'?'Keep the object supported, or enable Allow overlap to bypass this check.':
   kind==='wall'?'Move it clear of the wall, or enable Allow overlap to bypass this check.':
   'Adjust the object or enable Allow overlap if the placement is intentional.'};
}
