/** V151 narrow source amendment to the established V17 save/journal mechanism.
 * No new save key, no changing nine LS anchors or original E implementation.
 * Applied after all older original-source patches and before module import.
 */
export function patchStoryStaffRecognitionV151(source){
 if(typeof source!=='string'||!source.includes('class StoryEventManagerV17'))
  throw Error('V151 requires original expanded V17 story source');
 const once=(needle,replacement,label)=>{
  const first=source.indexOf(needle);
  if(first<0||source.indexOf(needle,first+needle.length)!==-1)
   throw Error('V151 original story signature drift: '+label);
  source=source.slice(0,first)+replacement+source.slice(first+needle.length);
 };
 const method="  evidence(id,text=null){return recordEvidenceV17(id,text);}";
 once(method,`  /** The real, early paper names can add a non-spoiler PEOPLE trace only.
   * Never demote a character whose later LS evidence already upgraded them.
   */
  recognizeStaffV151(id){
    if(!['jo','tessa','luis'].includes(id))return false;
    if(SAVE.story.people[id])return false;
    SAVE.story.people[id]='traces';save();return true;
  }
  staffRecognitionStateV151(id){
    return ['jo','tessa','luis'].includes(id)?SAVE.story.people[id]||null:null;
  }
${method}`,'original story manager method');
 // Real Last Shift evidence supersedes a preliminary first name; save reloads
 // with legacy LS journal material must also promote a prior "traces" state.
 const rewrite=(kind)=>{
  const old=`if(!${kind}.story.people[personId])${kind}.story.people[personId]='known';`;
  const replacement=`if(!${kind}.story.people[personId]||${kind}.story.people[personId]==='traces')${kind}.story.people[personId]='known';`;
  once(old,replacement,kind+' original LS evidence promotion');
 };
 rewrite('SAVE');
 rewrite('o');
 if(!source.includes("recognizeStaffV151(id)")||!source.includes("story.people[personId]==='traces'"))
  throw Error('V151 final source recognition contract missing');
 return source;
}
