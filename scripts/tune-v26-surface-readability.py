from pathlib import Path

p=Path('patches/production-readability-v26.js.txt')
s=p.read_text()

def r(old,new,label):
    global s
    n=s.count(old)
    if n!=1:
        raise SystemExit(f'{label}: expected one marker, found {n}')
    s=s.replace(old,new,1)

# Raise authored surface albedo just enough that the identity survives horror exposure.
for old,new,label in [
("ctx.fillStyle='#4c514f';ctx.fillRect(0,0,W,H);","ctx.fillStyle='#5a625f';ctx.fillRect(0,0,W,H);",'below-grade wall base'),
("ctx.fillStyle='#414745';for(let y=34;y<H;y+=92)","ctx.fillStyle='#4b5350';for(let y=34;y<H;y+=92)",'below-grade seams'),
("ctx.fillStyle='#a0803f';ctx.fillRect(0,342,W,38);","ctx.fillStyle='#b1934c';ctx.fillRect(0,342,W,38);",'below-grade hazard'),
("ctx.fillStyle='#343a39';ctx.fillRect(0,H-34,W,34);","ctx.fillStyle='#3d4542';ctx.fillRect(0,H-34,W,34);",'below-grade kick'),
("ctx.fillStyle='#283430';ctx.fillRect(0,0,W,H);","ctx.fillStyle='#33443e';ctx.fillRect(0,0,W,H);",'security wall base'),
("ctx.fillStyle='#315c4d';ctx.fillRect(0,304,W,28);","ctx.fillStyle='#3c715e';ctx.fillRect(0,304,W,28);",'security stripe'),
("ctx.fillStyle='#6d6657';ctx.fillRect(0,0,W,H);","ctx.fillStyle='#817663';ctx.fillRect(0,0,W,H);",'east wall base'),
("ctx.fillStyle='#4a5b4d';ctx.fillRect(0,286,W,190);","ctx.fillStyle='#596b5a';ctx.fillRect(0,286,W,190);",'east lower wall'),
("ctx.fillStyle='#4b4c40';ctx.fillRect(0,0,W,H);","ctx.fillStyle='#626353';ctx.fillRect(0,0,W,H);",'records wall base'),
("ctx.fillStyle='#3d4037';for(let x=0;x<W;x+=52)","ctx.fillStyle='#4e5245';for(let x=0;x<W;x+=52)",'records panel ribs'),
("ctx.fillStyle='#70634c';ctx.fillRect(0,328,W,16);","ctx.fillStyle='#8b795a';ctx.fillRect(0,328,W,16);",'records chair rail'),
("ctx.fillStyle='#263432';ctx.fillRect(0,0,W,H);","ctx.fillStyle='#354944';ctx.fillRect(0,0,W,H);",'pa wall base'),
("ctx.strokeStyle='#172321';ctx.lineWidth=8;","ctx.strokeStyle='#22332f';ctx.lineWidth=8;",'pa acoustic seams'),
("ctx.fillStyle='#387a70';ctx.fillRect(0,300,W,18);","ctx.fillStyle='#47978a';ctx.fillRect(0,300,W,18);",'pa stripe'),
("if(idx===1){ctx.fillStyle='#222a29';","if(idx===1){ctx.fillStyle='#2b3532';",'below-grade floor'),
("else if(idx===2){ctx.fillStyle='#18211f';","else if(idx===2){ctx.fillStyle='#202b28';",'security floor'),
("else if(idx===3){ctx.fillStyle='#5b5549';","else if(idx===3){ctx.fillStyle='#6b6252';",'east floor'),
("else if(idx===4){ctx.fillStyle='#37382f';","else if(idx===4){ctx.fillStyle='#494a3e';",'records floor'),
("else{ctx.fillStyle='#17201f';","else{ctx.fillStyle='#202d2a';",'pa floor'),
("map.repeat.set(Math.max(1,Math.max(size.x,size.z)/4.0),Math.max(1,size.y/2.4));","map.repeat.set(Math.max(1,Math.max(size.x,size.z)/5.5),Math.max(1,size.y/3.2));",'surface repeat scale'),
]: r(old,new,label)

# Chapter 1 keeps authored retail surfaces, but Cassette Castle needs enough broad warm fill to reveal its stock and shelving.
r(
"    const elevatorWarm=new THREE.PointLight(0xffb46d,.48,3.0,2);elevatorWarm.position.set(26.0,1.65,0);elevatorWarm.userData.productionReadabilityV26='freight-elevator-call';world.root.add(elevatorWarm);\n  }else if(idx===1){",
"    const elevatorWarm=new THREE.PointLight(0xffb46d,.48,3.0,2);elevatorWarm.position.set(26.0,1.65,0);elevatorWarm.userData.productionReadabilityV26='freight-elevator-call';world.root.add(elevatorWarm);\n    const retailAmbient=new THREE.HemisphereLight(0x4d5158,0x050505,.030);retailAmbient.userData.productionReadabilityV26='retail-ambient';world.root.add(retailAmbient);\n    const cassetteFill=new THREE.PointLight(0xffc58c,.52,10.5,2);cassetteFill.position.set(19,2.25,25.6);cassetteFill.userData.productionReadabilityV26='cassette-broad-fill';world.root.add(cassetteFill);\n  }else if(idx===1){",
'chapter1 broad fill')

# Feed the Chapter 2 opening mechanic with a visible maintenance fixture, which the first preview proved was missing.
r(
"    const fill=new THREE.HemisphereLight(0x556a6b,0x030405,.075);fill.userData.productionReadabilityV26='below-grade-fill';world.root.add(fill);",
"    const fill=new THREE.HemisphereLight(0x556a6b,0x030405,.075);fill.userData.productionReadabilityV26='below-grade-fill';world.root.add(fill);\n    addProductionFixtureV26(world,{x:-26.2,y:2.46,z:-8.55,color:0xb8cbc5,intensity:.84,range:7.6,w:1.02,rot:Math.PI/2,tag:'feeder-control'});",
'chapter2 feeder fixture')

# The first identity preview showed Chapters 3–6 needed broad low-level architectural fill, especially Records and PA Control.
r(
"    const evidenceLight=new THREE.PointLight(0xe2bd7d,.62,3.4,2);evidenceLight.position.set(24.55,1.30,-11.65);evidenceLight.userData.productionReadabilityV26='gavin-evidence';world.root.add(evidenceLight);\n  }\n  addProductionSurfaceIdentityV26(world,idx);",
"    const evidenceLight=new THREE.PointLight(0xe2bd7d,.62,3.4,2);evidenceLight.position.set(24.55,1.30,-11.65);evidenceLight.userData.productionReadabilityV26='gavin-evidence';world.root.add(evidenceLight);\n  }else if(idx===2){\n    const securityFill=new THREE.HemisphereLight(0x465b55,0x030404,.035);securityFill.userData.productionReadabilityV26='security-architectural-fill';world.root.add(securityFill);\n    const securityTask=new THREE.PointLight(0x8ab2a5,.28,9.5,2);securityTask.position.set(-23.5,2.15,-26.7);securityTask.userData.productionReadabilityV26='security-console-fill';world.root.add(securityTask);\n  }else if(idx===3){\n    const eastFill=new THREE.HemisphereLight(0x6d6758,0x050504,.045);eastFill.userData.productionReadabilityV26='east-wing-architectural-fill';world.root.add(eastFill);\n    const eastTask=new THREE.PointLight(0xc4b47f,.30,8.8,2);eastTask.position.set(-22.0,2.10,4.8);eastTask.userData.productionReadabilityV26='east-wing-map-fill';world.root.add(eastTask);\n  }else if(idx===4){\n    const recordsFill=new THREE.HemisphereLight(0x6c6855,0x050504,.070);recordsFill.userData.productionReadabilityV26='records-architectural-fill';world.root.add(recordsFill);\n    addProductionFixtureV26(world,{x:-8.0,y:2.44,z:11.8,color:0xd1c39c,intensity:.62,range:8.2,w:1.05,tag:'records-roster-task'});\n    const recordsSpine=new THREE.PointLight(0xb4ac8e,.28,11,2);recordsSpine.position.set(4.5,2.15,0);recordsSpine.userData.productionReadabilityV26='records-spine-fill';world.root.add(recordsSpine);\n  }else if(idx===5){\n    const paFill=new THREE.HemisphereLight(0x536b64,0x030404,.055);paFill.userData.productionReadabilityV26='pa-architectural-fill';world.root.add(paFill);\n    addProductionFixtureV26(world,{x:0,y:2.44,z:11.7,color:0x9fc4b8,intensity:.54,range:8.6,w:1.16,tag:'pa-control-task'});\n    const paSpine=new THREE.PointLight(0x719a90,.24,11,2);paSpine.position.set(0,2.05,0);paSpine.userData.productionReadabilityV26='pa-spine-fill';world.root.add(paSpine);\n  }\n  addProductionSurfaceIdentityV26(world,idx);",
'chapter3-6 architectural fills')

# Telemetry marker lets the visual gate prove it is looking at the tuned identity pass.
r("chapterSurfaceIdentity:true,surfaceProfiles:","chapterSurfaceIdentity:true,surfaceReadabilityTuned:true,surfaceProfiles:",'tuned telemetry')

p.write_text(s)
print('v26 surface readability tuning applied')
