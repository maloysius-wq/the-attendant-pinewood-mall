from pathlib import Path

p=Path('patches/production-readability-v26.js.txt')
s=p.read_text()

def r(old,new,label):
    global s
    n=s.count(old)
    if n!=1:
        raise SystemExit(f'{label}: expected one marker, found {n}')
    s=s.replace(old,new,1)

# Final art-direction pass after side-by-side review of the tuned six-chapter preview.
# Keep Chapters 3/4 where they are; gently lift the rooms that still crush their identity into black.
for old,new,label in [
    ("ctx.fillStyle='#5a625f';ctx.fillRect(0,0,W,H);","ctx.fillStyle='#646d69';ctx.fillRect(0,0,W,H);",'below-grade final wall lift'),
    ("ctx.fillStyle='#4b5350';for(let y=34;y<H;y+=92)","ctx.fillStyle='#555e5a';for(let y=34;y<H;y+=92)",'below-grade final seam lift'),
    ("if(idx===1){ctx.fillStyle='#2b3532';","if(idx===1){ctx.fillStyle='#333f3b';",'below-grade final floor lift'),
    ("const retailAmbient=new THREE.HemisphereLight(0x4d5158,0x050505,.030);","const retailAmbient=new THREE.HemisphereLight(0x4d5158,0x050505,.045);",'retail ambient'),
    ("const cassetteFill=new THREE.PointLight(0xffc58c,.52,10.5,2);","const cassetteFill=new THREE.PointLight(0xffc58c,.74,11.5,2);",'cassette broad fill'),
    ("intensity:.84,range:7.6,w:1.02,rot:Math.PI/2,tag:'feeder-control'","intensity:1.02,range:8.4,w:1.02,rot:Math.PI/2,tag:'feeder-control'",'feeder task light'),
    ("const recordsFill=new THREE.HemisphereLight(0x6c6855,0x050504,.070);","const recordsFill=new THREE.HemisphereLight(0x6c6855,0x050504,.085);",'records architectural fill'),
    ("intensity:.62,range:8.2,w:1.05,tag:'records-roster-task'","intensity:.74,range:8.8,w:1.05,tag:'records-roster-task'",'records roster task'),
    ("const recordsSpine=new THREE.PointLight(0xb4ac8e,.28,11,2);","const recordsSpine=new THREE.PointLight(0xb4ac8e,.34,11.5,2);",'records spine'),
    ("const paFill=new THREE.HemisphereLight(0x536b64,0x030404,.055);","const paFill=new THREE.HemisphereLight(0x536b64,0x030404,.070);",'pa architectural fill'),
    ("intensity:.54,range:8.6,w:1.16,tag:'pa-control-task'","intensity:.65,range:9.2,w:1.16,tag:'pa-control-task'",'pa control task'),
    ("const paSpine=new THREE.PointLight(0x719a90,.24,11,2);","const paSpine=new THREE.PointLight(0x719a90,.30,11.5,2);",'pa spine'),
    ("surfaceReadabilityTuned:true,surfaceProfiles:","surfaceReadabilityTuned:true,finalVisualReview:true,surfaceProfiles:",'final review telemetry'),
]:
    r(old,new,label)

# Below Grade needs actual ambient service-space information in addition to the task fixture.
r(
    "const fill=new THREE.HemisphereLight(0x556a6b,0x030405,.075);fill.userData.productionReadabilityV26='below-grade-fill';world.root.add(fill);",
    "const fill=new THREE.HemisphereLight(0x556a6b,0x030405,.075);fill.userData.productionReadabilityV26='below-grade-fill';world.root.add(fill);const identityFill=new THREE.HemisphereLight(0x687d78,0x050606,.055);identityFill.userData.productionReadabilityV26='below-grade-identity-fill';world.root.add(identityFill);",
    'below-grade identity fill')

p.write_text(s)
print('v26 final visual-review tuning applied')
