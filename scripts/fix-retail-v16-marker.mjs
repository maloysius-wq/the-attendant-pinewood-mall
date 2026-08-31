import { readFile, writeFile } from 'node:fs/promises';

const path='patches/retail-geometry-v16.js.txt';
let text=await readFile(path,'utf8');
const old=`  replaceRange(\n    'Cassette Castle checkout standardization',\n    'async function buildCassetteCheckoutV14(world){',\n    '\\n\\nasync function buildArcade(world){',\n\`async function buildCassetteCheckoutV14(world){\n  return await makeSharedRetailCheckoutV16(world,13.40,28.72,0,'arcadeCash',Math.PI/2);\n}\n\\nasync function buildArcade(world){\`\n  );`;
const replacement=`  replaceOnce(\n    'Cassette Castle checkout standardization',\n\`async function buildCassetteCheckoutV14(world){\n  const counter=await placeCassetteGrounded(world.root,'cassetteServiceCounter',new THREE.Vector3(12.05,0,28.72),{targetHeight:.96,rot:0,collide:true,pad:.035,tag:'checkout-counter-v14'});\n  if(!counter)return null;\n  const box=cassetteWorldBox(counter.obj),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),top=box.max.y;\n  await placeCassetteOnSurface(world.root,'arcadeCash',center.x-.02,center.z-size.z*.22,top+.012,{targetHeight:.27,rot:Math.PI/2,tag:'checkout-register-v14'});\n  return counter;\n}\`,\n\`async function buildCassetteCheckoutV14(world){\n  return await makeSharedRetailCheckoutV16(world,13.40,28.72,0,'arcadeCash',Math.PI/2);\n}\`\n  );`;
if(!text.includes(old))throw new Error('Expected brittle Cassette checkout replacement block was not found.');
text=text.replace(old,replacement);
await writeFile(path,text);
console.log('Retail Geometry v16 Cassette checkout marker fixed.');
