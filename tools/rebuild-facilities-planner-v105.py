#!/usr/bin/env python3
"""Rebuild only the facilities year planner with absolutely no old printed dates."""
import calendar,hashlib,json,random
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageStat

root=Path('assets/vendor/builder/mood-v101')
source=Image.open(root/'calendar-source/public-domain-wall-calendar.jpg').convert('RGB')
# Read the genuine PD source for a neutral paper color reference, NOT pixels:
# older date glyphs in that photograph must never enter the new final canvas.
palette=ImageStat.Stat(source.resize((32,32))).median
cream=(max(185,min(234,int(palette[0]*.65+220*.35))),
       max(180,min(226,int(palette[1]*.65+213*.35))),
       max(160,min(209,int(palette[2]*.65+187*.35))))
rng=random.Random(1997)
im=Image.new('RGBA',(1024,1024),(*cream,255))
pixels=im.load()
for y in range(1024):
 for x in range(1024):
  v=rng.randrange(-5,6)
  pixels[x,y]=(max(0,min(255,cream[0]+v)),
               max(0,min(255,cream[1]+v)),
               max(0,min(255,cream[2]+v)),255)
draw=ImageDraw.Draw(im)
fontroot='/usr/share/fonts/truetype/dejavu/'
def font(s,bold=False):return ImageFont.truetype(fontroot+('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'),s)
ink=(46,48,44,255)
draw.rectangle((15,15,1009,1009),outline=(110,99,82,255),width=9)
draw.rectangle((27,28,997,137),fill=(63,77,67,255))
draw.text((52,46),'FACILITIES  /  1997',font=font(52,True),fill=(245,238,214,255))
draw.text((52,113),'PROPERTY & MAINTENANCE SERVICES   •   ANNUAL PLANNER',font=font(15,True),fill=(214,205,182,255))
months=calendar.Calendar(firstweekday=6)
for i in range(12):
 col,row=i%4,i//4
 x,y=33+col*246,166+row*277
 w,h=230,249
 draw.rectangle((x,y,x+w,y+h),fill=(230,220,197,255),outline=(102,98,82,255),width=2)
 draw.rectangle((x+2,y+2,x+w-2,y+39),fill=(114,121,110,255))
 draw.text((x+10,y+9),calendar.month_abbr[i+1].upper()+'  1997',font=font(19,True),fill=(249,243,225,255))
 for j,day in enumerate('SMTWTFS'):
  draw.text((x+9+j*31,y+47),day,font=font(15,True),fill=ink)
 for week,days in enumerate(months.monthdayscalendar(1997,i+1)):
  for j,n in enumerate(days):
   if n:draw.text((x+9+j*31,y+77+week*26),str(n),font=font(15),fill=ink)
  draw.line((x+7,y+102+week*26,x+w-7,y+102+week*26),fill=(165,152,130,115),width=1)
draw.text((48,1010-36),'PINEWOOD MALL FACILITIES',font=font(16,True),fill=(92,88,71,255))
target=root/'calendars/facilities-year-planner.png'
im.save(target,'PNG',optimize=True)
data=target.read_bytes()
mf=root/'manifest-v101.json';m=json.loads(mf.read_text())
p=next(x for x in m['calendars'] if x['id']=='mood-v101-calendar-facilities-year-planner')
p['sha256']=hashlib.sha256(data).hexdigest();p['bytes']=len(data)
p['derivation']='New independent 1997 grid on clean paper-tone palette sampled from PD source photo; no original photo pixels or pre-existing dated calendar text retained.'
m['notes']+=' The facilities annual planner was reauthored with no embedded pre-1997 photographed date layer (v105).'
mf.write_text(json.dumps(m,indent=2)+'\n')
print('V105_PLANNER_NO_2007',len(data),p['sha256'],flush=True)
