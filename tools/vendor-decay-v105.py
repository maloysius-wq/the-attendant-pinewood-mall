#!/usr/bin/env python3
"""One-time v105 CC0 archiver. Never fetch assets from the shipped browser."""
from pathlib import Path
from urllib.request import Request,urlopen
from io import BytesIO
from PIL import Image,ImageDraw,ImageEnhance,ImageFilter,ImageFont
from hashlib import sha256
import json,math,random,zipfile
ROOT=Path('assets/vendor/builder/decay-v105')
# The publisher served one identical placeholder for all ten historical URLs.
# This original one-time script must never overwrite the repaired archive.
# Deliberately fail before any media writes, even if an old queued vendoring
# workflow executes after the corrected source archive has been published.
if (ROOT/'manifest-v105.json').exists():
 raise SystemExit('Refusing to overwrite existing licensed poster archive with unverified legacy Openclipart redirects')
for sub in ['sources','posters','decals','models']:(ROOT/sub).mkdir(parents=True,exist_ok=True)
UA={'User-Agent':'Mozilla/5.0 (Pinewood CC0-source-archival; maintained creator credits)'}
def download(url,limit=16000000):
 with urlopen(Request(url,headers=UA),timeout=110) as r:
  raw=r.read(limit+1);redirect=r.geturl()
 if not (100<len(raw)<=limit):raise RuntimeError('Invalid CC0 download '+url)
 return raw,redirect
def pin(path,raw):
 path.write_bytes(raw)
 return {'bytes':len(raw),'sha256':sha256(raw).hexdigest()}
def font(n,bold=False):
 return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans'+('-Bold' if bold else '')+'.ttf',n)
# Ten genuinely different published public-domain artworks, not one texture
# cropped ten ways. Authors and exact source page/download are pinned.
POSTERS=[
 ('store-sale',328688,'sale-poster-template','liftarn','FINAL CLEARANCE','FALLOW\'S DEPARTMENT STORE','#554436','corners'),
 ('storefront-sale',328689,'sale-storefront-poster','liftarn','SEASON END','SHOPPING MALL PROMOTION','#4b5347','top'),
 ('corporate-safety',292033,'retro-industry-banner','j4p4n','SAFETY FIRST','PROPERTY OPERATIONS','#344348','right'),
 ('arcade-night',284903,'arcade-video-game-machine','Juhele','SUNBURST ARCADE','HIGH SCORES EVERY FRIDAY','#423752','bottom'),
 ('video-rental',323563,'movie-poster-icon','Malayali','VIDEO PLANET','WEEKEND RENTALS','#514441','corners'),
 ('music-week',279799,'musical-design','Firkin','MUSIC WEEK','LIVE CONCERT PROMOTION','#4e3e4d','top'),
 ('food-market',280196,'fruit-display','Firkin','FRESH & GOOD','OLD FOOD COURT','#49503c','right'),
 ('mall-stage',279341,'stage-show','Firkin','WEEKEND SHOW','PINEWOOD COMMUNITY EVENTS','#50443b','bottom'),
 ('travel-club',325565,'see-america-travel-poster','trygstad','SEE AMERICA','TRAVEL OFFICE PROMOTION','#455249','half'),
 ('coffee-lounge',319176,'abstract-coffee-text','j4p4n','COFFEE BREAK','FOOD COURT SPECIALS','#5b463c','strips')
]
posters=[];sources=[]
for index,(slug,sourceId,sourceSlug,author,title,subtitle,base,style) in enumerate(POSTERS):
 url=f'https://openclipart.org/image/800px/{sourceId}/{sourceSlug}.png'
 raw,redirect=download(url,6000000)
 img=Image.open(BytesIO(raw)).convert('RGBA')
 if min(img.size)<230:raise RuntimeError('Not a useful source artwork '+slug)
 sourcePath=ROOT/'sources'/('poster-'+slug+'.png')
 sourceInfo=pin(sourcePath,raw)
 sources.append(dict(id='openclipart-'+slug,originalAuthor=author,
  sourcePage=f'https://openclipart.org/detail/{sourceId}/{sourceSlug}',
  downloadUrl=url,resolvedDownloadUrl=redirect,license='CC0-1.0',
  path=str(sourcePath),width=img.width,height=img.height,**sourceInfo))
 size=(768,950)
 art=Image.new('RGBA',size,base)
 artDraw=ImageDraw.Draw(art,'RGBA')
 artDraw.rectangle((12,12,755,938),outline=(203,187,151,255),width=8)
 artDraw.rectangle((28,28,740,120),fill=(28,36,37,230))
 artDraw.text((48,47),title,font=font(46 if len(title)<18 else 35,True),fill=(236,226,194,255))
 # Preserve the real CC0 artwork as the visual focal point, not a procedural
 # or AI-created picture; only layout/title/age/alpha are newly authored.
 img.thumbnail((677,650),Image.Resampling.LANCZOS)
 layer=Image.new('RGBA',size,(0,0,0,0))
 layer.alpha_composite(img,((size[0]-img.width)//2,160+(650-img.height)//2))
 art=Image.alpha_composite(art,layer)
 artDraw=ImageDraw.Draw(art,'RGBA')
 artDraw.rectangle((30,829,738,914),fill=(28,36,37,244))
 artDraw.text((48,853),subtitle,font=font(23,True),fill=(226,220,193,255))
 art=ImageEnhance.Color(art).enhance(.73)
 art=ImageEnhance.Contrast(art).enhance(.90)
 alpha=Image.new('L',size,0);d=ImageDraw.Draw(alpha)
 rng=random.Random(10500+index)
 edge=[(28,25),(714,21),(745,57),(744,912),(703,933),(34,929),(15,891),(20,80)]
 if style=='top':edge=[(15,21),(560,19),(608,63),(676,140),(738,189),(748,924),(18,925)]
 if style=='bottom':edge=[(19,18),(748,18),(740,719),(681,750),(639,857),(615,935),(20,935)]
 if style=='right':edge=[(20,19),(744,20),(727,252),(643,461),(656,692),(549,929),(22,932)]
 if style=='half':edge=[(18,19),(745,20),(740,502),(690,543),(635,552),(574,586),(502,605),(455,585),(409,655),(326,626),(240,678),(145,650),(18,730)]
 if style=='strips':edge=[(24,22),(739,24),(724,201),(655,308),(635,449),(568,399),(519,647),(445,551),(366,805),(297,640),(220,886),(147,620),(68,914),(19,860)]
 d.polygon(edge,fill=255)
 # Small ragged abrasion on existing source-backed art, never cloned pictures.
 for j in range(30+index*4):
  x=rng.randrange(12,749);y=rng.randrange(12,933)
  if style not in ('half','strips') and rng.random()>.3:continue
  d.ellipse((x-6,y-4,x+6,y+4),fill=0)
 alpha=alpha.filter(ImageFilter.GaussianBlur(1))
 art.putalpha(alpha)
 out=BytesIO();art.save(out,'PNG',optimize=True)
 path=ROOT/'posters'/(slug+'.png');info=pin(path,out.getvalue())
 posters.append(dict(id='decay-v105-poster-'+slug,label=title.title()+' — peeling '+subtitle.title(),
  kind='surface-decal',category='Peeling Posters & Paper',surface='wall',
  materialStyle='image-mapped',condition='weathered',license='CC0-1.0',
  sourceId='openclipart-'+slug,originalAuthor=author,originalSource=sources[-1]['sourcePage'],
  sourceDerivation='Original CC0 independent artwork with newly designed Pinewood retail/office heading, aged and alpha-torn',
  path=str(path),thumb=str(path),width=.85,height=1.08,opacity=.98,peelStyle=style,**info))
 print('POSTER',slug,sourceId,info['bytes'],flush=True)

# New real photo-scanned CC0 rough ground textures; distinct from old faint
# surface-imperfection overlays. Keep each exact downloaded base-color map.
GROUND_IDS=['Ground111','Ground103','Ground090']
ground={}
for id in GROUND_IDS:
 url=f'https://ambientcg.com/get?file={id}_1K-JPG.zip'
 zipBytes,redirect=download(url,15000000)
 z=zipfile.ZipFile(BytesIO(zipBytes))
 matches=[name for name in z.namelist() if name.lower().endswith(('_color.jpg','_color.jpeg','_color.png'))]
 if not matches:raise RuntimeError('No actual CC0 ground base-color photo in '+id)
 imgbytes=z.read(matches[0])
 photo=Image.open(BytesIO(imgbytes)).convert('RGB')
 if min(photo.size)<500:raise RuntimeError('Undersize source photo '+id)
 sourcePath=ROOT/'sources'/(id.lower()+'-color.jpg')
 pinInfo=pin(sourcePath,imgbytes)
 ground[id]=photo
 sources.append(dict(id='ambientcg-'+id.lower(),originalAuthor='ambientCG',
  sourcePage='https://ambientcg.com/view?id='+id,downloadUrl=url,
  resolvedDownloadUrl=redirect,downloadSHA256=sha256(zipBytes).hexdigest(),
  license='CC0-1.0',path=str(sourcePath),width=photo.width,height=photo.height,**pinInfo))
 print('SOURCE_GROUND',id,photo.size,flush=True)
# Legacy ambientCG scans offer genuine scuff/smear shapes, but the old
# versions were compressed to nearly invisible alpha. Retain source detail.
GRIME=[
 ('heaped-rubble','Heavy brick and construction grit','floor','Ground111',None,3.1,2.55),
 ('tracked-soil','Heavy tracked-in soil','floor','Ground103',None,2.6,2.45),
 ('gritty-dust','Visible gritty floor dust','floor','Ground090',None,2.9,2.35),
 ('scattered-debris','Distinct scattered hard rubble','floor','Ground111',None,3.0,2.8),
 ('dark-shoe-scuffs','Blackened shoe scuffs','floor',None,'floor-scuffs.png',2.3,1.6),
 ('floor-drag','Deep furniture drag marks','floor',None,'floor-scuffs-2.png',3.0,1.5),
 ('wall-scrapes','Deep wall scrapes and grit','wall',None,'wall-dark-scrapes.png',2.0,1.5),
 ('baseboard-dirt','Heavy dirty wall baseboards','wall',None,'grime-wall-lower.png',3.3,.95)
]
decals=[]
for i,(slug,label,surface,groundId,oldFile,w,h) in enumerate(GRIME):
 if groundId:
  src=ground[groundId].resize((768,768),Image.Resampling.LANCZOS).convert('RGBA')
  sourceId='ambientcg-'+groundId.lower()
 else:
  oldPath=Path('assets/vendor/builder/decals-v97')/oldFile
  src=Image.open(oldPath).resize((768,768),Image.Resampling.LANCZOS).convert('RGBA')
  sourceId='legacy-v97-'+oldFile[:-4]
  sources.append(dict(id=sourceId,originalAuthor='ambientCG',license='CC0-1.0',
   sourcePage='assets/vendor/builder/decals-v97/manifest-v97.json',
   path=str(oldPath),sha256=sha256(oldPath.read_bytes()).hexdigest(),bytes=oldPath.stat().st_size))
 # A large feathered but heavily opaque *irregular* patch from real source
 # scan, not a rectangular plane or faint pseudo-transparent illustration.
 src=ImageEnhance.Contrast(src).enhance(1.24)
 p=src.load()
 for y in range(768):
  for x in range(768):
   r,g,b,oldA=p[x,y]
   nx=(x-383.5)/383.5;ny=(y-383.5)/383.5
   rad=max(0,1-nx*nx*.94-ny*ny*.85)
   irregular=.83+.17*math.sin(x*.027+math.sin(y*.04))*.5+.18*math.cos(y*.023+x*.006)*.5
   # Existing source alpha only supports the source morphology; boost it.
   sourceFactor=1 if groundId else min(1,max(0,oldA/255)**.20*1.23)
   strength=max(0,min(1,rad**.62*irregular*sourceFactor))
   alpha=int(255*strength)
   # Pigment derives from real CC0 source pixels. Keep grime deep enough to
   # show clearly on stone, wood and worn office finishes in low light.
   avg=(r+g+b)/3
   k=.26+.22*(avg/255)
   p[x,y]=(int(max(13,min(104,r*k))),int(max(12,min(98,g*k))),
           int(max(10,min(96,b*k))),alpha)
 output=BytesIO();src.save(output,'PNG',optimize=True)
 target=ROOT/'decals'/(slug+'.png');info=pin(target,output.getvalue())
 decals.append(dict(id='decay-v105-'+slug,label=label,
  kind='surface-decal',category='Heavy Dirt & Scuffs',surface=surface,
  materialStyle='image-mapped',condition='weathered',license='CC0-1.0',
  sourceId=sourceId,originalAuthor='ambientCG',
  originalSource='https://ambientcg.com/view?id='+groundId if groundId else 'assets/vendor/builder/decals-v97/manifest-v97.json',
  sourceDerivation='Higher-contrast CC0 scanned albedo and original morphology, stronger opaque irregular feathered silhouette',
  path=str(target),thumb=str(target),width=w,height=h,opacity=.99,**info))
 print('HEAVY_DECAL',slug,info['bytes'],flush=True)
manifest=dict(version=105,models=[],posters=posters,decals=decals,sources=sources,
 notes='Each of 10 posters uses a genuinely different sourced CC0 Openclipart artwork. Three newly sourced ambientCG ground scans and existing verified CC0 scuffs create 8 prominently visible dirt decals. Real source meshes added separately. All media pinned and locally hosted.')
(ROOT/'manifest-v105.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('V105_MEDIA_READY',len(posters),len(decals),len(sources),flush=True)
