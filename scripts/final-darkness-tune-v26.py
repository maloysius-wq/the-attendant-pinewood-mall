from pathlib import Path

p=Path('patches/production-readability-v26.js.txt')
s=p.read_text()

def r(old,new,label):
    global s
    n=s.count(old)
    if n!=1:
        raise SystemExit(f'{label}: expected one marker, found {n}')
    s=s.replace(old,new,1)

# Final pixel-review correction. Security and East Wing are deliberately left unchanged.
# Cassette Castle gets enough broad warm light to reveal merchandise and fixture depth.
r("const retailAmbient=new THREE.HemisphereLight(0x4d5158,0x050505,.045);","const retailAmbient=new THREE.HemisphereLight(0x59606a,0x060606,.080);",'retail ambient')
r("const cassetteFill=new THREE.PointLight(0xffc58c,.74,11.5,2);","const cassetteFill=new THREE.PointLight(0xffc58c,1.10,13.0,2);",'cassette fill')

# Below Grade remains the darkest chapter, but its service-space identity must read without squinting.
r("ctx.fillStyle='#646d69';ctx.fillRect(0,0,W,H);","ctx.fillStyle='#78817d';ctx.fillRect(0,0,W,H);",'below grade wall')
r("ctx.fillStyle='#555e5a';for(let y=34;y<H;y+=92)","ctx.fillStyle='#646e69';for(let y=34;y<H;y+=92)",'below grade seams')
r("if(idx===1){ctx.fillStyle='#333f3b';","if(idx===1){ctx.fillStyle='#414e49';",'below grade floor')
r("const identityFill=new THREE.HemisphereLight(0x687d78,0x050606,.055);","const identityFill=new THREE.HemisphereLight(0x788f88,0x070808,.125);",'below grade identity fill')
r("intensity:1.02,range:8.4,w:1.02,rot:Math.PI/2,tag:'feeder-control'","intensity:1.58,range:10.2,w:1.02,rot:Math.PI/2,tag:'feeder-control'",'feeder control light')
r(
"    addProductionFixtureV26(world,{x:-26.2,y:2.46,z:-8.55,color:0xb8cbc5,intensity:1.58,range:10.2,w:1.02,rot:Math.PI/2,tag:'feeder-control'});",
"    addProductionFixtureV26(world,{x:-26.2,y:2.46,z:-8.55,color:0xb8cbc5,intensity:1.58,range:10.2,w:1.02,rot:Math.PI/2,tag:'feeder-control'});\n    const loadingFill=new THREE.PointLight(0x92aaa4,.72,13.5,2);loadingFill.position.set(-21.5,2.05,-8.3);loadingFill.userData.productionReadabilityV26='below-grade-loading-fill';world.root.add(loadingFill);",
'loading area fill')

# Records and present-day PA get a modest final lift. Their mystery stays in the distance, not on the objective itself.
r("const recordsFill=new THREE.HemisphereLight(0x6c6855,0x050504,.085);","const recordsFill=new THREE.HemisphereLight(0x766f5b,0x060605,.105);",'records fill')
r("intensity:.74,range:8.8,w:1.05,tag:'records-roster-task'","intensity:.88,range:9.6,w:1.05,tag:'records-roster-task'",'records task')
r("const paFill=new THREE.HemisphereLight(0x536b64,0x030404,.070);","const paFill=new THREE.HemisphereLight(0x607b72,0x050505,.090);",'pa fill')
r("intensity:.65,range:9.2,w:1.16,tag:'pa-control-task'","intensity:.78,range:10.0,w:1.16,tag:'pa-control-task'",'pa task')

r("finalVisualReview:true,surfaceProfiles:","finalVisualReview:true,darkSceneReadabilityApproved:true,surfaceProfiles:",'approval telemetry')

p.write_text(s)
print('final dark-scene readability correction applied')
