#!/usr/bin/env python3
"""Generate original high-resolution period wall dressing and translucent cobwebs.
These are project-original source artworks, not copies of commercial posters.
Deterministic seeds and the complete source remain in the repository.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import random, math, hashlib, json
DIR=Path('assets/vendor/builder/wall-and-web-v98');DIR.mkdir(parents=True,exist_ok=True)
def sha(b):return hashlib.sha256(b).hexdigest()
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(sz,bold=False):return ImageFont.truetype(BOLD if bold else FONT,int(sz))
# id,label,design theme,small header,large headline,subcopy,accent,width,height
POSTERS=[
 ('contractor-access','Contractor access plaque','notice','SERVICE OPERATIONS','CONTRACTOR ACCESS','Authorized personnel only','#d5ad64',.87,1.17),
 ('maintenance-schedule','Maintenance task board','cork','BUILDING SERVICES','MAINTENANCE','Inspection / repairs / service calls','#c1a76e',1.40,1.00),
 ('shift-roster','Contractor shift roster','cork','SITE OFFICE','SHIFT ROSTER','Please confirm your assigned task','#b4b8a9',1.33,1.00),
 ('bulletin-notices','Cork bulletin board with pinned notes','cork','SITE OFFICE','NOTICE BOARD','Deliveries · Rosters · Memos','#c8a96a',1.62,1.10),
 ('whiteboard-work','Marked-up contractor whiteboard','whiteboard','WORKS TEAM','DAILY WORK','Receive / Inspect / Sign off','#528c9b',1.65,1.08),
 ('calendar-wall','Vintage monthly wall calendar','calendar','MAINTENANCE OFFICE','MONTHLY PLANNER','Inspection and shift notes','#b6a991',.95,1.22),
 ('key-signout','Key checkout and sign-out list','notice','SECURITY DESK','KEY SIGN-OUT','Record every key issued / returned','#c0ad76',.91,1.14),
 ('electrical-safety','Electrical isolation warning','notice','SAFETY NOTICE','POWER ISOLATION','Do not operate tagged equipment','#dca355',.91,1.17),
 ('no-public-access','No public entry sign','notice','SERVICE AREA','NO PUBLIC ACCESS','Employees & contractors only','#d3a66c',.96,.68),
 ('delivery-hours','Loading bay delivery board','notice','RECEIVING','DELIVERIES','Report to service desk on arrival','#c9b18d',.93,1.10),
 ('first-aid-poster','1990s first aid instruction poster','notice','SAFETY FIRST','FIRST AID','First aid kit · Telephone · Exit route','#b57e78',.90,1.25),
 ('work-order-sheet','Smudged contractor work order','notice','WORK ORDER','MAINTENANCE REQUEST','Area / job / materials / sign-off','#bcb39b',.79,1.12),
 ('incident-form','Old staff incident report','notice','REPORT FORM','INCIDENT LOG','Date / description / response','#c2a991',.78,1.12),
 ('hazard-notice','Hazard and wet-floor warning','notice','CAUTION','REPAIR WORK','Wet surfaces · Open fixtures','#d4a34f',1.00,1.22),
 ('storage-label','Materials storage inventory board','cork','STORAGE','MATERIAL INVENTORY','Paint · Fasteners · Spare parts','#b6a18a',1.35,1.0),
 ('fire-equipment','Fire equipment inspection notice','notice','FIRE SAFETY','MONTHLY CHECK','Extinguishers / exits / alarms','#cb7770',.94,1.18),
 ('retro-sale','Faded nineties clearance advertisement','retail','PINEWOOD MALL','CLEARANCE SALE','BIG SAVINGS · SELECTED ITEMS','#dd688f',1.02,1.42),
 ('retro-electronics','1990s electronics promotion','retail','ELECTRONICS','THE FUTURE IS HERE','Portable players · Stereo sound','#4aa7ad',1.02,1.42),
 ('retro-arcade','Arcade tournament promotional poster','retail','ARCADE','HIGH SCORE','WIN A CHANCE TO PLAY','#8752b7',.96,1.34),
 ('retro-food','Food court meal-deal advertisement','retail','FOOD COURT','LUNCH COMBO','A LITTLE SOMETHING FOR EVERYONE','#d5a34b',.96,1.35),
 ('retro-fashion','Faded mall fashion promotion','retail','FALL FASHION','NEW LOOKS','Fresh styles arriving this season','#8c7996',.98,1.36),
 ('retro-music','Music store wall advertisement','retail','MUSIC','TURN IT UP','NEW RELEASES · CASSETTES · CDs','#b45463',.97,1.34),
 ('retro-weekend','Window sale poster with old tape marks','retail','WEEKEND ONLY','SPECIAL OFFERS','VISIT OUR STORES THIS WEEKEND','#d39d47',1.0,1.34),
 ('construction-plan','Contractor pinboard task diagram','whiteboard','PROJECT BOARD','TASKS & STATUS','Prep / Check / Secure / Clean','#7f9a9c',1.55,1.03)
]
WEBS=[
 ('web-ceiling-spokes','Thin ceiling corner web','ceiling','corner',.90,.90,.66),
 ('web-ceiling-dense','Dense ceiling corner cobweb','ceiling','dense',1.22,1.05,.75),
 ('web-ceiling-drift','Ceiling dust and web drift','ceiling','strands',1.58,.95,.61),
 ('web-ceiling-lattice','Ceiling beam web lattice','ceiling','lattice',1.52,.80,.70),
 ('web-ceiling-thread','Single long ceiling cobweb','ceiling','spokes',1.15,1.18,.58),
 ('web-wall-corner','Corner web over wall plaster','wall','corner',.94,.88,.70),
 ('web-wall-heavy','Thick cobweb in wall corner','wall','dense',1.22,1.06,.76),
 ('web-wall-drape','Hanging web strands','wall','strands',1.12,1.74,.68),
 ('web-wall-lattice','Old web crossing wall','wall','lattice',1.53,1.15,.63),
 ('web-wall-thin','Faint wall spiderweb veil','wall','spokes',1.29,1.10,.54),
]
def textfit(draw,text,maxpx,maxwidth,bold=True):
 size=maxpx
 while size>18 and draw.textbbox((0,0),text,font=font(size,bold))[2]>maxwidth:size-=2
 return font(size,bold)
def save(img,slug):
 path=DIR/(slug+'.png');img.save(path,'PNG',optimize=True,compress_level=7)
 data=path.read_bytes()
 return str(path),len(data),sha(data)
def draw_poster(slug,theme,eyebrow,heading,sub,accent,w_m,h_m,seed):
 rnd=random.Random(seed)
 W=850;H=int(round(W*h_m/w_m));H=min(1460,max(510,H))
 if theme=='whiteboard':base=(221,228,220,255)
 elif theme=='cork':base=(150,112,72,255)
 elif theme=='retail':base=(27,27,46,255)
 else:base=(205,194,164,255)
 im=Image.new('RGBA',(W,H),base);d=ImageDraw.Draw(im,'RGBA')
 frame=int(W*.035);d.rectangle((frame,frame,W-frame,H-frame),outline=(45,43,38,255),width=17)
 if theme=='whiteboard':
  d.rectangle((frame+15,frame+15,W-frame-15,H-frame-15),fill=(221,228,222,255))
  d.rectangle((frame,frame,W-frame,frame+19),fill=(110,116,118,255))
  d.rectangle((W*.28,H-frame-15,W*.72,H-frame+8),fill=(107,108,101,255))
 elif theme=='cork':
  for i in range(6500):
   x=rnd.randint(frame+4,W-frame-4);y=rnd.randint(frame+4,H-frame-4)
   c=rnd.choice([(89,64,36,32),(219,188,133,45),(63,44,27,30)])
   d.point((x,y),fill=c)
  # Paper notes pinned to cork, with actual small ruled lines and pushpins.
  for i in range(7):
   x=rnd.randint(frame+26,W-frame-150);y=rnd.randint(int(H*.20),H-frame-165)
   ww=rnd.randint(125,230);hh=rnd.randint(108,185)
   color=rnd.choice([(224,217,190,255),(206,220,197,255),(227,217,213,255)])
   d.rectangle((x+6,y+7,x+ww+6,y+hh+7),fill=(20,18,16,50))
   d.rectangle((x,y,x+ww,y+hh),fill=color)
   for k in range(3):d.line((x+13,y+30+18*k,x+ww-13,y+30+18*k),fill=(77,75,65,65),width=2)
   d.ellipse((x+ww//2-7,y-7,x+ww//2+7,y+7),fill=(176,40,38,255))
 elif theme=='retail':
  d.polygon([(W*.68,H*.18),(W*.90,H*.12),(W*.95,H*.50),(W*.66,H*.57)],fill=(42,39,87,225))
  for i in range(15):
   cx=rnd.randint(32,W-32);cy=rnd.randint(48,H-48);rr=rnd.randint(8,40)
   d.arc((cx-rr,cy-rr,cx+rr,cy+rr),0,290,fill=(215,195,205,52),width=3)
 else:
  d.rectangle((frame+15,frame+15,W-frame-15,H-frame-15),fill=(230,224,203,255))
 A=tuple(bytes.fromhex(accent.lstrip('#')))
 x=int(W*.105);maxWidth=int(W*.79)
 titleY=int(H*.105)
 d.text((x,titleY),eyebrow,font=textfit(d,eyebrow,36,maxWidth),fill=A+(255,))
 headlineY=int(H*(.27 if theme!='cork' else .14))
 if theme=='whiteboard':headlineY=int(H*.15)
 if theme=='retail':headlineY=int(H*.30)
 titleFont=textfit(d,heading,72,maxWidth)
 d.text((x,headlineY),heading,font=titleFont,fill=((238,229,207,255) if theme=='retail' else (43,45,41,255)))
 top=int(headlineY+titleFont.size+25)
 if theme!='cork':
  d.line((x,top,W-x,top),fill=A+(220,),width=10)
  subFont=textfit(d,sub,26,maxWidth,False)
  d.text((x,int(H*.72)),sub,font=subFont,fill=(231,219,198,255) if theme=='retail' else (63,66,64,255))
 if theme=='calendar':
  gridTop=int(H*.39);L=x;R=W-x;T=gridTop;bottom=int(H*.89)
  for i in range(8):d.line((L+(R-L)*i/7,T,L+(R-L)*i/7,bottom),fill=(96,95,89,140),width=2)
  for i in range(7):d.line((L,T+(bottom-T)*i/6,R,T+(bottom-T)*i/6),fill=(96,95,89,135),width=2)
 if theme=='whiteboard':
  for i in range(7):
   tx=x+rnd.randrange(0,int(W*.5));ty=int(H*.45)+rnd.randrange(0,int(H*.31))
   d.line((tx,ty,tx+rnd.randint(70,230),ty+rnd.randint(-15,12)),fill=(50,83,88,150),width=3)
 for i in range(int(W*H*.0017)):
  xx=rnd.randrange(0,W);yy=rnd.randrange(0,H)
  if rnd.random()<.22:d.point((xx,yy),fill=(61,43,25,rnd.randint(18,75)))
 # Visual distress is deliberately mild, preserving readable signage.
 return im
def web_img(kind,seed):
 rnd=random.Random(seed);S=1024
 im=Image.new('RGBA',(S,S),(0,0,0,0))
 layer=Image.new('RGBA',(S,S),(0,0,0,0));d=ImageDraw.Draw(layer,'RGBA')
 color=(198,198,191)
 def stroke(points,width=2,alpha=120):
  d.line(points,fill=color+(alpha,),width=width,joint='curve')
 if kind in ('corner','dense'):
  origin=(42,36) if seed%2 else (S-38,35)
  rays=17 if kind=='dense' else 11
  vectors=[]
  for i in range(rays):
   angle=(.02+1.53*i/max(1,rays-1)) if origin[0]<S/2 else (1.61+1.46*i/max(1,rays-1))
   dx=math.cos(angle);dy=math.sin(angle)
   length=rnd.uniform(S*.56,S*.93)
   vectors.append((origin[0]+dx*length,origin[1]+dy*length))
  for ex,ey in vectors:
   stroke([origin,(ex,ey)],rnd.choice([1,2,2]),rnd.randint(75,150))
  for k in range(1,12 if kind=='dense' else 8):
   portion=k/(14 if kind=='dense' else 10)
   last=None
   for j,(ex,ey) in enumerate(vectors):
    px=origin[0]+(ex-origin[0])*portion
    py=origin[1]+(ey-origin[1])*portion+7*math.sin(j*.92+k)
    if last:stroke([last,(px,py)],1,rnd.randint(62,145))
    last=(px,py)
  if kind=='dense':
   for k in range(65):
    x=rnd.randrange(100,900);y=rnd.randrange(80,700)
    d.ellipse((x,y,x+2,y+2),fill=(205,200,185,rnd.randint(20,65)))
 elif kind=='strands':
  for i in range(38):
   start=rnd.randrange(40,S-40);length=rnd.randint(S//5,S*3//4)
   if i%3==0:stroke([(start,12),(start+20,length//2),(start+48,length)],1,rnd.randint(55,129))
   else:stroke([(start,0),(start-11,length//2),(start+17,length)],1,rnd.randint(28,82))
  for i in range(10):
   y=rnd.randrange(40,500);x=rnd.randrange(80,S-200)
   stroke([(x,y),(x+80,y+12),(x+180,y+8)],1,rnd.randint(48,83))
 elif kind in ('lattice','spokes'):
  ox,oy=S*.51,S*.43
  n=23 if kind=='lattice' else 15
  for i in range(n):
   theta=i*2*math.pi/n+.11
   radius=S*.48*rnd.uniform(.90,1.15)
   ex=ox+math.cos(theta)*radius;ey=oy+math.sin(theta)*radius
   stroke([(ox,oy),(ex,ey)],1,rnd.randint(55,148))
  for ring in range(1,11):
   r=ring*S*.043;last=None
   for j in range(n+1):
    t=j*2*math.pi/n; rr=r+7*math.cos(j*.8+ring)
    p=(ox+math.cos(t)*rr,oy+math.sin(t)*rr)
    if last:stroke([last,p],1,rnd.randint(72,122))
    last=p
 # Multi-opacity line layers and physically faint fibers, no hard rectangle.
 blurred=layer.filter(ImageFilter.GaussianBlur(.9))
 blurred.alpha_composite(layer)
 alpha=blurred.getchannel('A')
 # Texture edges fade, never hard stamp boundaries.
 fade=Image.new('L',(S,S),0);fd=ImageDraw.Draw(fade)
 fd.ellipse((2,2,S-2,S-2),fill=255)
 fade=fade.filter(ImageFilter.GaussianBlur(65))
 from PIL import ImageChops
 alpha=ImageChops.multiply(alpha,fade);blurred.putalpha(alpha)
 return blurred
assets=[]
for i,(slug,label,theme,small,heading,sub,accent,w,h) in enumerate(POSTERS):
 im=draw_poster(slug,theme,small,heading,sub,accent,w,h,seed=231+i*11)
 path,bytes,checksum=save(im,slug)
 assets.append({'id':'vestibule-'+slug,'label':label,
  'category':'Noticeboards & Office Walls' if theme!='retail' else 'Vintage Mall Adverts',
  'kind':'surface-decal','surface':'wall','path':path,'thumb':path,
  'width':w,'height':h,'opacity':.95 if theme!='retail' else .86,
  'materialStyle':'image-mapped','condition':'weathered',
  'bytes':bytes,'sha256':checksum,'license':'Project-Original'})
for i,(slug,label,surface,kind,w,h,opacity) in enumerate(WEBS):
 im=web_img(kind,i*39+213)
 path,bytes,checksum=save(im,slug)
 assets.append({'id':'vestibule-'+slug,'label':label,'category':'Cobwebs & Hanging Dust',
  'kind':'surface-decal','surface':surface,'path':path,'thumb':path,
  'width':w,'height':h,'opacity':opacity,'materialStyle':'image-mapped',
  'condition':'weathered','bytes':bytes,'sha256':checksum,'license':'Project-Original'})
manifest={'version':98,'source':'Pinewood project-original assets','license':'Project-Original',
 'generationScript':'tools/generate-vestibule-surfaces-v98.py',
 'surfaces':assets}
(DIR/'manifest-v98.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('PINEWOOD_V98_SURFACES_COMPLETE',len(assets),sum(x['bytes'] for x in assets),flush=True)
