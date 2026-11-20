/** Source-authentic Chapter 1 persistent service-key credential guard.
 * When the original named Master Service Key has genuinely been collected,
 * a spent generic disposable door key cannot softlock the real freight car.
 * No new inventory key is retained, and the original source lock consumes
 * the temporary credential via its same existing mechanism and animation.
 */
export function eligibleFreightCredentialV142({chapter=1,breakers=0,recovered=false,
 keys=0,exit=null}={}){
 return chapter===1&&breakers>=3&&recovered===true&&keys<=0&&
  exit?.userData?.type==='exit'&&exit.userData.state==='idle'&&
  exit.userData.serviceUnlocked!==true;
}
