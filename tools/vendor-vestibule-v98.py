#!/usr/bin/env python3
"""One-time licensed Quaternius models + original Pinewood prop/wall art vendor.

External GLTF meshes come only from a public CC0 Quaternius model archive, are
stored as isolated GLB with SHA-256 and fixed provenance. Other geometry and
graphic/cobweb textures are original, authored for Pinewood with no remote art.
Shipped runtime does not perform any network call.
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import io,json,hashlib,random,math,copy,urllib.request,urllib.parse
import numpy as np
import trimesh

OUT=Path('assets/vendor/builder/vestibule-v98')
MDIR=OUT/'models';IMDIR=OUT/'images'
MDIR.mkdir(parents=True,exist_ok=True);IMDIR.mkdir(parents=True,exist_ok=True)
rng=random.Random(98431)
def sha(b):return hashlib.sha256(b).hexdigest()
def save(data,path):path.write_bytes(data);return {'bytes':len(data),'sha256':sha(data)}
def font(sz,bold=False):
 for path in [
  '/usr/share/fonts/truetype/dejavu/DejaVuSans'+('-Bold' if bold else '')+'.ttf',
  '/usr/share/fonts/truetype/liberation2/LiberationSans-'+('Bold' if bold else 'Regular')+'.ttf'
 ]:
  try:return ImageFont.truetype(path,sz)
  except OSError:continue
 return ImageFont.load_default()

# Real-source, official Quaternius (CC0) models mirrored byte-for-byte by
# agentkaerf/FreeModels. Their glTF is SELF-CONTAINED (buffer data URI).
# Store the source glTF digest and final GLB digest in a durable manifest.
quaternius=[
 ('wood-pallet','Wooden shipping pallet','Pallet',.16,1.32),
 ('broken-wood-pallet','Broken wooden pallet','Pallet_Broken',.16,1.36),
 ('traffic-cone','Contractor traffic cone','TrafficCone_1',.82,.52),
 ('weathered-traffic-cone','Worn traffic cone','TrafficCone_2',.82,.52),
 ('plastic-work-barrier','Plastic construction barrier','PlasticBarrier',1.0,1.65),
 ('pipe-bundle','Spare service pipes','Pipes',.48,1.35),
 ('concrete-cinder-block','Loose cinder block','CinderBlock',.19,.62),
 ('contractor-steel-barrel','Steel contractor barrel','Barrel',.93,.62),
 ('metal-traffic-barrier','Work zone safety barrier','TrafficBarrier_1',.93,1.4)
]
models=[]
upstream='Zombie Apocalypse Kit - March 2024/Environment/glTF/'
for slug,label,source,height,radius in quaternius:
 path=upstream+source+'.gltf'
 rawurl='https://raw.githubusercontent.com/agentkaerf/FreeModels/main/'+urllib.parse.quote(path,safe='/')
 print('FETCH_QUATERNIUS',source,flush=True)
 with urllib.request.urlopen(urllib.request.Request(rawurl,headers={'User-Agent':'Pinewood CC0 asset vendor/1.0'}),timeout=60) as response:raw=response.read()
 if len(raw)<1000 or len(raw)>3_000_000:raise RuntimeError('Unexpected source GLTF bytes '+source)
 j=json.loads(raw)
 if j.get('asset',{}).get('version')!='2.0' or not all(x['uri'].startswith('data:') for x in j.get('buffers',[])):
  raise RuntimeError('Source glTF is not isolated/local '+source)
 # Trimesh retains geometry, image atlas, and UVs in GLB binary.
 scene=trimesh.load(io.BytesIO(raw),file_type='gltf',force='scene',process=False)
 glb=scene.export(file_type='glb')
 if glb[:4]!=b'glTF' or len(glb)<1000:raise RuntimeError('Failed glTF->GLB '+source)
 p=MDIR/(slug+'.glb')
 details=save(glb,p)
 models.append({'id':'vestibule-'+slug,'label':label,'category':'Contractor Vestibule & Loading',
  'kind':'model','path':str(p),'condition':'weathered','materialStyle':'image-mapped',
  'license':'CC0-1.0','originalAuthor':'Quaternius','originalSource':f'https://poly.pizza/search/{source}',
  'verifiedSourcePage':'https://poly.pizza/m/'+{
  'Pallet':'MwOFAOgOhg','Pallet_Broken':'dGcOK3Azfl',
  'TrafficCone_1':'aDIrUbMbW3'}.get(source,''),
  'sourceMirror':rawurl,'sourceSHA256':sha(raw),'sourceBytes':len(raw),
  'targetHeight':height,'radius':radius,**details})

# Original builder-made geometry, not third-party media. Fixed dimensions,
# distinct painted metals/wood/rubber, serviceable silhouettes, no toy-sized
# modern gadgets and no semantic material misclassification.
COL={
 'yellow':(196,139,32,255),'deep_yellow':(146,99,32,255),'orange':(206,91,30,255),
 'steel':(106,116,118,255),'dark_steel':(49,57,59,255),'black':(31,34,36,255),
 'rubber':(37,39,40,255),'cream':(185,182,160,255),'wood':(112,83,51,255),
 'old_wood':(87,63,43,255),'rust':(112,63,40,255),'silver':(149,151,145,255),
 'red':(150,48,37,255),'green':(68,104,71,255),'paper':(208,204,186,255),
 'white':(201,200,186,255),'blue':(69,93,119,255)
}
def geom():
 return trimesh.Scene()
def place(scene,mesh,color,x=0,y=0,z=0,label=None):
 mesh.visual.vertex_colors=np.tile(np.array(COL.get(color,color),dtype=np.uint8),(len(mesh.vertices),1))
 if label:mesh.metadata['name']=label
 mesh.apply_translation((x,y,z))
 scene.add_geometry(mesh)
def box(scene,what,size,p):
 place(scene,trimesh.creation.box(extents=size),what,*p)
def rod(scene,what,a,b,rad=.025,sides=12):
 a=np.array(a,float);b=np.array(b,float);vec=b-a
 if np.linalg.norm(vec)<.001:return
 m=trimesh.creation.cylinder(radius=rad,height=float(np.linalg.norm(vec)),sections=sides)
 m.apply_transform(trimesh.geometry.align_vectors((0,0,1),vec))
 place(scene,m,what,*((a+b)/2))
def cylinder(scene,what,rad,height,p,axis=(0,1,0),sections=16):
 m=trimesh.creation.cylinder(radius=rad,height=height,sections=sections)
 m.apply_transform(trimesh.geometry.align_vectors((0,0,1),axis))
 place(scene,m,what,*p)
def wheel(scene,x,z,rad=.21,width=.12):
 cylinder(scene,'rubber',rad,width,(x,rad,z),axis=(1,0,0),sections=16)
 cylinder(scene,'steel',rad*.4,width+.01,(x,rad,z),axis=(1,0,0),sections=12)
def original_asset(slug,label,scene,height,radius):
 payload=scene.export(file_type='glb')
 p=MDIR/(slug+'.glb')
 if not payload.startswith(b'glTF'):raise RuntimeError('Original mesh not GLB')
 stats=save(payload,p)
 models.append({'id':'vestibule-'+slug,'label':label,'category':'Contractor Vestibule & Loading',
  'kind':'model','path':str(p),'condition':'weathered','materialStyle':'color-only',
  'skipMaterialEnhancement':True,'license':'Original-Pinewood','originalAuthor':'Pinewood Builder',
  'originalSource':'tools/vendor-vestibule-v98.py',
  'targetHeight':height,'radius':radius,**stats})
# Compact low-poly seated forklift, late-1980s industrial profile.
s=geom()
box(s,'yellow',(1.20,.24,1.65),(0,.45,.04))
box(s,'yellow',(.95,.87,.82),(0,.96,.43))
box(s,'deep_yellow',(.93,.11,.64),(0,1.38,.44))
box(s,'black',(.74,.25,.45),(0,.97,-.11))
box(s,'dark_steel',(.81,.45,.15),(0,.86,-.44))
for x in [-.66,.66]:
 for z in [-.63,.67]:wheel(s,x,z,.25,.13)
for x in [-.5,.5]:
 rod(s,'dark_steel',(x,.73,-.34),(x,1.92,-.42),.043)
 rod(s,'dark_steel',(x,1.92,-.42),(x,2.04,.34),.038)
 rod(s,'dark_steel',(x,2.04,.34),(x,1.12,.89),.038)
for x in [-.54,.54]:
 box(s,'dark_steel',(.105,1.80,.12),(x,1.04,-1.00))
 box(s,'steel',(.20,.09,1.25),(x,.23,-1.39))
box(s,'steel',(1.18,.14,.23),(0,.48,-1.04))
box(s,'black',(.12,.36,.12),(-.22,1.25,-.18))
rod(s,'black',(-.22,1.42,-.16),(-.35,1.63,-.10),.03)
cylinder(s,'black',.17,.035,(-.35,1.64,-.10),axis=(0,1,0))
box(s,'red',(.24,.11,.045),(.4,.92,.857))
original_asset('compact-forklift','Compact 1990s warehouse forklift',s,2.04,2.2)
# Narrow pallet jack for the actual vestibule.
s=geom()
for x in [-.34,.34]:
 box(s,'orange',(.155,.105,1.47),(x,.16,-.51))
 cylinder(s,'rubber',.088,.15,(x,.086,-1.09),axis=(1,0,0))
box(s,'orange',(.86,.17,.47),(0,.28,.38))
for x in [-.37,.37]:
 cylinder(s,'rubber',.14,.105,(x,.14,.48),axis=(1,0,0))
rod(s,'steel',(0,.33,.57),(0,.95,.90),.054)
rod(s,'dark_steel',(0,.95,.9),(0,1.35,1.05),.043)
rod(s,'black',(-.22,1.36,1.05),(.22,1.36,1.05),.042)
original_asset('manual-pallet-jack','Manual hydraulic pallet jack',s,1.37,1.9)
# Compact service ladder.
s=geom()
for side in [-.3,.3]:
 rod(s,'silver',(side,.05,-.18),(side,1.82,.1),.037)
 rod(s,'silver',(side,.05,.48),(side,1.82,.10),.035)
for step in range(5):
 y=.35+step*.30;z=-.18+(y/1.82)*.28
 box(s,'steel',(.67,.045,.22),(0,y,z))
box(s,'silver',(.7,.09,.28),(0,1.78,.1))
original_asset('service-stepladder','Fold-out aluminum step ladder',s,1.86,.68)
# Tool chest rolling: 4 front drawers with pulls, wheels, upper handle.
s=geom()
box(s,'red',(.82,.89,.48),(0,.59,0))
box(s,'dark_steel',(.87,.06,.52),(0,1.06,0))
for y in [.38,.58,.78,.97]:
 box(s,'rust',(.75,.15,.035),(0,y,-.255))
 box(s,'steel',(.27,.022,.038),(0,y,-.28))
for x in [-.31,.31]:
 for z in [-.17,.17]:cylinder(s,'black',.082,.075,(x,.092,z),axis=(1,0,0))
rod(s,'steel',(.43,.97,-.20),(.67,.97,-.20),.026)
original_asset('rolling-tool-chest','Rolling contractor tool chest',s,1.11,.76)
# Toolcase with folding handle.
s=geom()
box(s,'dark_steel',(.62,.27,.31),(0,.18,0))
box(s,'orange',(.63,.07,.32),(0,.33,0))
box(s,'steel',(.19,.05,.055),(0,.37,0))
rod(s,'black',(-.14,.34,0),(-.14,.51,0),.023)
rod(s,'black',(.14,.34,0),(.14,.51,0),.023)
rod(s,'black',(-.14,.51,0),(.14,.51,0),.027)
original_asset('metal-toolbox','Old metal contractor toolbox',s,.54,.57)
# Cable reel with wound electrical cable.
s=geom()
cylinder(s,'old_wood',.39,.062,(-.28,.41,0),axis=(1,0,0))
cylinder(s,'old_wood',.39,.062,(.28,.41,0),axis=(1,0,0))
cylinder(s,'wood',.19,.58,(0,.41,0),axis=(1,0,0))
for x in np.linspace(-.23,.23,11):
 cylinder(s,'black',.25,.02,(x,.41,0),axis=(1,0,0),sections=24)
original_asset('electrical-cable-reel','Reel of old electrical cable',s,.83,.70)
# Wheeled push cart / equipment cart.
s=geom()
for y in [.31,.93]:
 box(s,'steel',(1.05,.055,.55),(0,y,0))
for x in [-.48,.48]:
 for z in [-.24,.24]:
  rod(s,'dark_steel',(x,.13,z),(x,1.02,z),.025)
  cylinder(s,'rubber',.105,.07,(x,.105,z),axis=(1,0,0))
rod(s,'steel',(-.52,.98,.27),(-.52,1.2,.34),.028)
rod(s,'steel',(.52,.98,.27),(.52,1.2,.34),.028)
rod(s,'black',(-.52,1.2,.34),(.52,1.2,.34),.034)
original_asset('utility-push-cart','Two-shelf contractor utility cart',s,1.24,1.25)
# Portable hanging site lamp, unpowered.
s=geom()
for angle in range(3):
 a=angle*math.tau/3
 rod(s,'dark_steel',(0,.9,0),(.47*math.cos(a),.05,.47*math.sin(a)),.036)
rod(s,'steel',(0,.40,0),(0,1.86,0),.037)
box(s,'yellow',(.34,.28,.23),(0,1.87,0))
box(s,'white',(.27,.21,.025),(0,1.87,-.12))
original_asset('tripod-work-light','Unpowered portable tripod work light',s,2.0,1.04)
# Utility broom leaned upright. 
s=geom()
rod(s,'old_wood',(0,.09,0),(.18,1.45,0),.026)
box(s,'wood',(.44,.15,.13),(-.014,.10,0))
for x in np.linspace(-.18,.18,9):
 rod(s,'cream',(x,.04,-.02),(x,.105,-.02),.012,8)
original_asset('maintenance-broom','Abandoned contractor push broom',s,1.5,.46)
# Aluminum wall conduit and clamps.
s=geom()
for zz in [-.09,.09]:
 box(s,'steel',(1.7,.07,.06),(0,.05,zz))
for x in [-.65,.0,.65]:
 box(s,'dark_steel',(.08,.115,.24),(x,.1,0))
original_asset('spare-conduit','Loose aluminum conduit lengths',s,.16,1.74)

# Paint convincing physical wall decor as softly aged self-contained RGBA
# textures; all lettering and graphics are ORIGINAL to this repository.
def rgba():return Image.new('RGBA',(768,768),(0,0,0,0))
def text(d,xy,value,size=24,fill=(40,37,31,255),bold=False):
 d.text(xy,value,font=font(size,bold),fill=fill)
def noise_bg(seed,color=(214,208,187)):
 rng=random.Random(seed)
 image=Image.new('RGBA',(768,768),color+(255,))
 pix=image.load()
 for i in range(22000):
  x=rng.randrange(768);y=rng.randrange(768)
  r,g,b,a=pix[x,y]
  m=rng.randrange(-12,11)
  pix[x,y]=(min(255,max(0,r+m)),min(255,max(0,g+m)),min(255,max(0,b+m)),a)
 return image
def poster_style(kind,slug,index):
 im=rgba();d=ImageDraw.Draw(im)
 if kind in ('notice','advert','calendar'):
  paper=noise_bg(index*93+8,(221,215,190) if kind!='advert' else (196,199,179))
  im.alpha_composite(paper,(0,0));d=ImageDraw.Draw(im)
  d.rectangle((24,24,743,742),outline=(90,83,66,255),width=9)
  d.line((60,690,700,690),fill=(87,82,71,255),width=3)
 else:
  frame=(88,67,48,255) if kind=='bulletin' else (77,80,79,255)
  d.rounded_rectangle((10,10,758,758),radius=14,fill=frame)
  if kind=='bulletin':
   d.rectangle((40,40,730,730),fill=(139,110,76,255))
   for a in range(1500):
    x=rng.randrange(44,726);y=rng.randrange(44,726)
    d.point((x,y),fill=(159+rng.randrange(-20,15),121+rng.randrange(-20,15),84,180))
  else:
   d.rectangle((37,37,732,730),fill=(216,214,195,255))
   d.rectangle((37,37,732,730),outline=(120,122,113,255),width=9)
 if kind=='calendar':
  months=['JANUARY','APRIL','JULY','OCTOBER'];name=months[index%4]
  text(d,(64,74),name,54,bold=True,fill=(61,69,74,255))
  d.rectangle((60,152,707,169),fill=(112,55,47,255))
  days=['S','M','T','W','T','F','S']
  for c,v in enumerate(days):
   text(d,(75+c*90,193),v,26)
  for n in range(1,32):
   c=(n+2)%7;r=(n+2)//7
   if r<6:
    text(d,(75+c*90,245+r*75),str(n),28,fill=(70,65,60,255))
  d.ellipse((615,550,668,600),outline=(147,47,39,225),width=5)
 elif kind=='bulletin':
  papers=[(70,80,300,314,'STAFF','SHIFT ROSTER'),(365,95,680,310,'NOTICE','CHECK ACCESS'),
          (85,375,420,670,'WORK','ORDER LOG'),(468,380,660,680,'SITE','RULES')]
  for j,(x1,y1,x2,y2,head,line) in enumerate(papers):
   d.rectangle((x1,y1,x2,y2),fill=(215,213,190,255),outline=(81,71,57,255),width=4)
   d.ellipse((x1+(x2-x1)//2-9,y1+10,x1+(x2-x1)//2+9,y1+27),fill=(147,46,38,255))
   text(d,(x1+20,y1+60),head,22,bold=True)
   text(d,(x1+20,y1+99),line,15)
   for lineY in range(y1+131,y2-25,25):
    d.line((x1+18,lineY,x2-20,lineY),fill=(114,109,100,255),width=2)
 elif kind=='whiteboard':
  heading=['WORK ORDERS','SERVICE SCHEDULE','TOOLS CHECKOUT'][index%3]
  text(d,(76,85),heading,39,bold=True,fill=(52,73,82,255))
  for rr in range(4):
   y=200+rr*115
   d.rectangle((95,y-20,118,y+3),outline=(50,71,80,255),width=3)
   text(d,(148,y-22),['HVAC - INSPECT','SERVICE ENTRY','CEILING LEAK','LIGHTS - CHECK'][rr],26,fill=(58,80,91,255))
  d.line((80,710,678,710),fill=(98,92,85,255),width=10)
 elif kind=='advert':
  heading=[
   ('PINEWOOD','WEEKEND SAVINGS','EVERYTHING MUST GO'),
   ('RADIO & HI-FI','NEW ARRIVALS','SOUND FOR YOUR HOME'),
   ('FOOD COURT','COME ON IN','OPEN SEVEN DAYS'),
   ('SUPER SALE','BIG CLEARANCE','SAVE IN STORE'),
   ('ARCADE','PLAY ALL DAY','TOKENS AVAILABLE'),
   ('PHOTO STUDIO','MEMORIES MADE','PICK UP PRINTS'),
  ][index%6]
  d.rectangle((38,42,730,205),fill=[(77,102,102,255),(114,72,57,255),(73,95,69,255)][index%3])
  text(d,(60,74),heading[0],55,bold=True,fill=(242,235,207,255))
  text(d,(75,280),heading[1],44,bold=True)
  text(d,(65,440),heading[2],30,bold=True)
  for x in range(140,650,66):
   d.ellipse((x,560,x+26,587),fill=(170,120,71,255))
 else:
  title,subtitle={
   'site-safety':('SITE SAFETY','AUTHORIZED WORKERS ONLY'),
   'first-aid':('FIRST AID','EQUIPMENT LOCATION'),
   'contractor-access':('CONTRACTOR ACCESS','SIGN IN AT OFFICE'),
   'no-admittance':('NO ADMITTANCE','MAINTENANCE PERSONNEL'),
   'service-schedule':('MAINTENANCE LOG','CHECK WORK ORDER'),
   'caution-wet-floor':('CAUTION','WET FLOOR AREA'),
   'electrical-room':('WARNING','ELECTRICAL ROOM'),
   'emergency-exit':('EXIT','KEEP CLEAR'),
   'evacuation-plan':('FIRE SAFETY','CHECK EXIT ROUTES'),
   'delivery-notice':('DELIVERIES','USE SERVICE DOOR'),
   'lost-notice':('NOTICE','PLEASE SEE MANAGER'),
   'contractor-rules':('SITE RULES','WEAR SAFETY EQUIPMENT'),
  }.get(slug,('NOTICE','READ ALL INSTRUCTIONS'))
  text(d,(65,130),title,43,bold=True,fill=(99,39,33,255))
  d.rectangle((58,240,710,257),fill=(99,39,33,255))
  text(d,(65,320),subtitle,26,bold=True)
  for y in range(420,620,42):d.line((72,y,660,y),fill=(108,103,91,185),width=3)
 # gentle wear at the edges, no tiled image pattern
 d=ImageDraw.Draw(im)
 for i in range(180):
  x=rng.randrange(0,768);y=rng.choice([rng.randrange(0,32),rng.randrange(730,767)])
  d.point((x,y),fill=(78,69,55,120))
 return im
graphics=[
 ('notice','site-safety','1990s Site Safety Notice'),
 ('notice','contractor-access','Contractor Access Notice'),
 ('notice','delivery-notice','Deliveries Through Service Door'),
 ('notice','electrical-room','Electrical Room Warning'),
 ('notice','caution-wet-floor','Wet Floor Caution Notice'),
 ('notice','emergency-exit','Keep Emergency Exit Clear'),
 ('notice','no-admittance','No Admittance Service Notice'),
 ('notice','contractor-rules','Contractor Safety Rules'),
 ('notice','lost-notice','Old Staff Notice'),
 ('notice','service-schedule','Service Repair Schedule'),
 ('notice','first-aid','First Aid Station Notice'),
 ('notice','evacuation-plan','Emergency Evacuation Plan'),
 ('calendar','wall-calendar-winter','Old Paper Wall Calendar January'),
 ('calendar','wall-calendar-spring','Old Paper Wall Calendar April'),
 ('calendar','wall-calendar-summer','Old Paper Wall Calendar July'),
 ('calendar','wall-calendar-autumn','Old Paper Wall Calendar October'),
 ('bulletin','contractor-bulletin','Corkboard with Contractor Notices'),
 ('bulletin','staff-bulletin','Staff Bulletin Board'),
 ('bulletin','workorder-bulletin','Work Orders Bulletin Board'),
 ('whiteboard','service-whiteboard','Service Work Whiteboard'),
 ('whiteboard','maintenance-whiteboard','Maintenance Schedule Whiteboard'),
 ('whiteboard','toolroom-whiteboard','Tools Checkout Whiteboard'),
 ('advert','mall-advert-weekend','Pinewood Weekend Savings Advert'),
 ('advert','mall-advert-radio','Retro Radio & Hi-Fi Advert'),
 ('advert','mall-advert-food','Food Court Vintage Advert'),
 ('advert','mall-advert-sale','Store Clearance Advert'),
 ('advert','mall-advert-arcade','Arcade Token Advert'),
 ('advert','mall-advert-photo','Photo Studio Advert')
]
decals=[]
for kind,slug,label in graphics:
 index=sum(1 for k,_,_ in graphics[:graphics.index((kind,slug,label))] if k==kind)
 im=poster_style(kind,slug,index)
 buf=io.BytesIO();im.save(buf,format='PNG',optimize=True)
 p=IMDIR/(slug+'.png');attrs=save(buf.getvalue(),p)
 decals.append({'id':'wall-'+slug,'label':label,'category':'Wall Notices & Advertising',
   'surface':'wall','kind':'surface-decal','condition':'weathered' if kind=='notice' else 'standard',
   'materialStyle':'image-mapped','license':'Original-Pinewood','originalAuthor':'Pinewood Builder',
   'originalSource':'tools/vendor-vestibule-v98.py','path':str(p),'thumb':str(p),
   'opacity':1.0,'width':1.24 if kind!='calendar' else .80,
   'height':1.13 if kind not in ('calendar','notice') else 1.06,**attrs})

# Original transparent silk webs. Each variant uses irregular strands,
# droop and irregular radial arc supports; no stock image licensing ambiguity.
def spiderweb(seed,kind):
 rnd=random.Random(seed);N=768
 im=Image.new('RGBA',(N,N),(0,0,0,0));d=ImageDraw.Draw(im,'RGBA')
 if kind=='corner':
  origin=(35,45)
  arms=[]
  for k in range(18):
   ang=(k/17)*(math.pi/2)
   radius=580+rnd.randint(-50,65)
   arms.append((origin[0]+math.cos(ang)*radius,origin[1]+math.sin(ang)*radius))
  for k,(x,y) in enumerate(arms):
   d.line((origin[0],origin[1],x,y),fill=(219,223,218,rnd.randint(110,195)),width=2)
  for lev in range(1,12):
   pts=[]
   for k,(x,y)in enumerate(arms):
    frac=(lev/12)+rnd.uniform(-.028,.028)
    pts.append((origin[0]+(x-origin[0])*frac,origin[1]+(y-origin[1])*frac))
   d.line(pts,fill=(213,221,221,rnd.randint(55,132)),width=1)
 else:
  center=(390+rnd.randint(-70,70),350+rnd.randint(-55,55))
  arms=[]
  for k in range(22):
   theta=(k/22)*math.tau
   radius=rnd.randint(250,375)
   arms.append((center[0]+math.cos(theta)*radius,center[1]+math.sin(theta)*radius))
  for x,y in arms:d.line((center[0],center[1],x,y),fill=(217,224,221,rnd.randint(80,160)),width=1)
  for lev in range(1,15):
   points=[]
   for x,y in arms:
    f=lev/15+rnd.uniform(-.012,.015)
    points.append((center[0]+(x-center[0])*f,center[1]+(y-center[1])*f))
   d.line(points+[points[0]],fill=(218,222,219,rnd.randint(72,160)),width=1)
 if kind=='drooping':
  for k in range(7):
   x=120+k*82+rnd.randrange(-15,15)
   y=180+rnd.randrange(-30,30)
   mx=x+40+rnd.randrange(-40,40)
   yy=590+rnd.randrange(-80,55)
   d.line([(x,y),(mx,(y+yy)/2+70),(mx+25,yy)],fill=(223,223,210,102),width=2)
 for k in range(34):
  x=rnd.randint(90,650);y=rnd.randint(95,670)
  d.ellipse((x,y,x+2,y+2),fill=(246,249,237,90))
 return im
cobwebs=[
 ('cobweb-corner-fine','Delicate ceiling corner cobweb','ceiling','corner',1.26,1.23),
 ('cobweb-corner-dense','Dense ceiling corner cobweb','ceiling','corner',1.43,1.38),
 ('cobweb-ceiling-radial','Wide ceiling spider web','ceiling','radial',1.25,1.20),
 ('cobweb-ceiling-old','Dusty ceiling web patch','ceiling','drooping',1.42,1.32),
 ('cobweb-wall-corner','Wall corner cobweb','wall','corner',1.12,1.00),
 ('cobweb-wall-large','Large abandoned wall web','wall','radial',1.36,1.25),
 ('cobweb-wall-draped','Hanging wall cobweb strands','wall','drooping',1.23,1.6),
 ('cobweb-ceiling-wisps','Thin ceiling web strands','ceiling','drooping',1.66,1.40)
]
for i,(slug,label,surface,kind,width,height) in enumerate(cobwebs):
 im=spiderweb(3401+i*113,kind)
 buf=io.BytesIO();im.save(buf,format='PNG',optimize=True)
 p=IMDIR/(slug+'.png');stats=save(buf.getvalue(),p)
 decals.append({'id':slug,'label':label,'category':'Cobwebs & Ceiling Dust',
  'kind':'surface-decal','surface':surface,'condition':'weathered',
  'materialStyle':'image-mapped','license':'Original-Pinewood','originalAuthor':'Pinewood Builder',
  'originalSource':'tools/vendor-vestibule-v98.py',
  'path':str(p),'thumb':str(p),'opacity':.74,'width':width,'height':height,**stats})
assert len(models)==19 and len(decals)==36,(len(models),len(decals))
manifest={'version':98,'models':models,'decals':decals,
 'provenance':{'quaterniusLicense':'CC0-1.0',
    'quaterniusLicensePage':'https://quaternius.com/faq.html',
    'quaterniusSourceArchive':'https://github.com/agentkaerf/FreeModels',
    'originalVisualAssets':'tools/vendor-vestibule-v98.py'}}
(OUT/'manifest-v98.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('PINEWOOD_V98_VENDOR_PASS',len(models),'models',len(decals),'wall/ceiling art assets',flush=True)
