/** One actual keyed access code, shared by the panel and first-person hand. */
export const ENTRY_CODE=Object.freeze([1,5,8,3]);
export const keypadCenter=(digit)=>{
 if(!Number.isInteger(digit)||digit<1||digit>9)throw Error('Invalid access key');
 const index=digit-1;
 return [13.52+(index%3)*.13,1.30-Math.floor(index/3)*.11,-21.647];
};
