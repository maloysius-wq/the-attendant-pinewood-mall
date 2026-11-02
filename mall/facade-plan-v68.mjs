// Authored material landmarks, attached to the original 1979 mall facade.
// This is the same coordinate system used by v66 blueprint and v67 shell.
export const FACADE_V68=Object.freeze({
 version:68,originalFrontZ:-22.5,originalRoofY:12.8,originalWidth:94,frontWindows:[],
 sign:{lettering:'PINEWOOD MALL',x:0,y:9.7,z:-22.04,width:32,height:2.95,
  style:'aged 1979 oxblood and mint enamel with faded bronze trim'},
 boarded:{
  x:-10.5,z:-22.08,width:9.6,height:5.7,planeY:2.85,
  panels:[
   {id:'left',x:-13.7,width:3.2},
   {id:'center',x:-10.5,width:3.2},
   {id:'right',x:-7.3,width:3.2}
  ],
  braces:[
   {id:'left_lower',from:[-15.1,.6],to:[-12.3,3.8],width:.24},
   {id:'left_upper',from:[-15.1,4.8],to:[-12.3,2.0],width:.22},
   {id:'center_lower',from:[-11.9,.5],to:[-9.1,3.9],width:.25},
   {id:'center_upper',from:[-11.9,4.8],to:[-9.1,1.9],width:.23},
   {id:'right_lower',from:[-8.7,.55],to:[-5.9,4.0],width:.25},
   {id:'right_upper',from:[-8.7,4.9],to:[-5.9,1.9],width:.22}
  ]
 },
 service:{x:12,z:-22.5,width:1.78,height:2.27,
  plaque:'AUTHORIZED CONTRACTORS / SERVICE ACCESS',
  frame:[
   {id:'west',x1:10.79,x2:11.07,y1:0,y2:2.57},
   {id:'east',x1:12.93,x2:13.21,y1:0,y2:2.57},
   {id:'lintel',x1:11.07,x2:12.93,y1:2.31,y2:2.57}
  ]},
 employeeExit:{x:86,z:-42,width:2,height:2.5},
 weathering:[
  {id:'west_runoff',x:-42,y1:1.2,y2:11.9,z:-22.5,width:.35,opacity:.11},
  {id:'seam_1',x:-31,y1:3.4,y2:12.1,z:-22.5,width:.20,opacity:.17},
  {id:'old_canopy_stain',x:-19,y1:1.6,y2:8.0,z:-22.5,width:.42,opacity:.09},
  {id:'service_canopy',x:15,y1:2.65,y2:10.7,z:-22.5,width:.28,opacity:.2},
  {id:'west_sign_drip',x:23,y1:4.4,y2:12.1,z:-22.5,width:.30,opacity:.14},
  {id:'east_runoff',x:41,y1:.7,y2:12.0,z:-22.5,width:.38,opacity:.16}
 ]
});
export function validateFacadeV68(f=FACADE_V68){
 const issues=[];
 if(f.version!==68||f.originalFrontZ!==-22.5||f.originalWidth!==94||f.originalRoofY!==12.8)issues.push('outdated original mall dimensions');
 if(f.frontWindows.length)issues.push('too many arbitrary front windows');
 if(f.sign.lettering!=='PINEWOOD MALL'||f.sign.width<29||f.sign.y+f.sign.height/2>f.originalRoofY)issues.push('facade sign misplaced');
 if(f.boarded.x!==-10.5||f.boarded.width!==9.6||f.boarded.height!==5.7)issues.push('public entrance no longer aligned');
 const sum=f.boarded.panels.reduce((n,p)=>n+p.width,0);
 if(Math.abs(sum-f.boarded.width)>.01||f.boarded.braces.length<4)issues.push('boarded opening lacks believable closure');
 const door=f.service,lo=door.x-door.width/2,hi=door.x+door.width/2;
 if(door.x!==12||door.z!==-22.5||door.width!==1.78||door.height!==2.27)issues.push('cinematic service threshold moved');
 for(const b of door.frame)if(b.x1<hi&&b.x2>lo&&b.y1<door.height&&b.y2>0)issues.push('service passage obstructed by '+b.id);
 for(const w of f.weathering)if(w.x<-47||w.x>47||w.z!==f.originalFrontZ||w.y1<0||w.y2>12.8||w.y2<=w.y1)issues.push('unattached weather stain '+w.id);
 if(f.employeeExit.x!==86||f.employeeExit.z!==-42)issues.push('employee exit disconnected from annex');
 return issues;
}
