#!/usr/bin/env python3
"""Development-only source-verified 1K ambientCG decals, not a browser asset loader.

Fetch seven authentic CC0 ambientCG imperfection archives. Rasterize 36 individually
labelled, repeat-free RGBA stamps using their image content and deterministic soft
alpha boundaries. Preserve original source ZIP SHA, JPEG member, final PNG SHA and
license in the bundled manifest. Do not generate at runtime.
"""
import hashlib, io, json, math, os, random, re, urllib.request, zipfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance, ImageStat

ROOT=Path('assets/vendor/builder/decals-v97')
ROOT.mkdir(parents=True,exist_ok=True)
SOURCES={
 'SurfaceImperfections004': 'Grimy smears',
 'SurfaceImperfections005': 'Coffee rings and stains',
 'SurfaceImperfections006': 'Old spill marks',
 'Smear005': 'Surface smudges',
 'Fingerprints001': 'Handled grime',
 'Fingerprints002': 'Dusty handmarks',
 'Scratches005': 'Scrapes and wear',
}
# id, label, surface, source ID, effect, tint, intensity, width metres, height metres
DATA=[
 ('dust-floor-soft','Fine settled dust','floor','SurfaceImperfections004','dust','#a4a092',.34,1.50,1.15),
 ('dust-floor-heavy','Heavy dust patch','floor','Smear005','dust','#858476',.49,1.75,1.3),
 ('dust-floor-corner','Corner dust buildup','floor','Fingerprints002','corner','#999789',.51,1.5,1.2),
 ('dust-floor-corner-2','Dust in a floor corner','floor','SurfaceImperfections004','corner','#aaa696',.4,1.3,1.2),
 ('dust-under-counter','Dust under shelving','floor','Smear005','band','#858678',.47,2.15,.58),
 ('dust-track','Dust drift from doorway','floor','Fingerprints001','band','#888879',.34,1.85,.85),
 ('dust-aisle','Scattered dusty footprint haze','floor','Fingerprints002','scattered','#6a6b5f',.44,2.1,1.5),
 ('dirt-floor-patch','Ground-in floor dirt','floor','Smear005','blob','#504737',.55,1.35,.90),
 ('dirt-floor-patch-2','Asymmetric muddy patch','floor','SurfaceImperfections004','blob','#5b483b',.58,1.20,1.35),
 ('dirt-floor-edges','Dirt along baseboards','floor','Fingerprints001','band','#483e32',.50,2.30,.50),
 ('dirt-sweep','Swept-away grime','floor','Smear005','sweep','#454036',.53,1.50,.95),
 ('floor-scuffs','Dark shoe scuff marks','floor','Scratches005','sweep','#383b3b',.49,1.10,.65),
 ('floor-scuffs-2','Long shoe drag marks','floor','Scratches005','band','#2f3132',.52,1.70,.48),
 ('floor-scratches','Scratched commercial tile','floor','Scratches005','blob','#55504a',.47,1.05,.84),
 ('coffee-rings','Coffee cup rings','floor','SurfaceImperfections005','blob','#5a3928',.58,.59,.54),
 ('coffee-spill','Dried brown coffee spill','floor','SurfaceImperfections006','blob','#50352a',.53,.88,.86),
 ('soda-sticky','Old sticky drink spill','floor','SurfaceImperfections005','blob','#51402f',.45,1.05,.80),
 ('water-floor-stain','Dried water damage on tile','floor','Smear005','blob','#565d52',.45,1.70,1.32),
 ('water-floor-rings','Old leak rings','floor','SurfaceImperfections006','blob','#666253',.38,1.60,1.0),
 ('water-tracked','Water tracked across walkway','floor','Fingerprints001','scattered','#555e59',.30,1.85,1.1),
 ('oil-dull','Old machine oil stain','floor','SurfaceImperfections004','blob','#262820',.46,1.02,.88),
 ('rust-floor','Rust stains beneath fixture','floor','Smear005','blob','#694532',.54,1.02,.91),
 ('water-wall-streak','Vertical water leak','wall','Smear005','streak','#625e4b',.53,.91,2.10),
 ('water-wall-streak-2','Wide wall water damage','wall','SurfaceImperfections004','streak','#696354',.51,1.17,2.60),
 ('water-wall-streak-3','Narrow drip streaks','wall','SurfaceImperfections006','streak','#514b40',.46,.63,1.90),
 ('water-wall-streak-4','Old ceiling-to-wall leak','wall','Smear005','streak','#64594c',.54,1.34,2.55),
 ('grime-wall-edge','Dirty vertical wall edge','wall','SurfaceImperfections004','streak','#474238',.50,.73,2.32),
 ('grime-wall-lower','Scuffed lower wall dirt','wall','Fingerprints002','band','#514839',.51,1.85,.82),
 ('grime-wall-smears','Finger marks on wall','wall','Fingerprints001','blob','#555147',.45,.81,.82),
 ('grime-wall-smears-2','Handled wall smudges','wall','Fingerprints002','blob','#4c4a41',.53,1.30,.97),
 ('wall-old-scuffs','Wall furniture scuffs','wall','Scratches005','sweep','#4a4740',.44,1.29,.70),
 ('wall-dark-scrapes','Deep wall scrapes','wall','Scratches005','band','#4a423a',.57,1.45,.65),
 ('wall-leak-spread','Blotchy damp plaster','wall','Smear005','blob','#62594a',.45,1.72,1.25),
 ('wall-rust-runoff','Rust-colored water streaks','wall','SurfaceImperfections006','streak','#784e37',.50,.88,2.40),
 ('wall-adhesive-residue','Old adhesive residue','wall','SurfaceImperfections005','blob','#746a58',.40,.85,1.03),
 ('wall-dust-bloom','Powdery wall dust','wall','SurfaceImperfections004','blob','#aaa59b',.36,1.65,1.60),
]
def sha(b):return hashlib.sha256(b).hexdigest()
def mask_shape(mode,seed):
 rnd=random.Random(seed)
 # All masks are soft and irregular, no tile edges.
 W=640
 base=Image.new('L',(W,W),0); px=base.load()
 coarse=Image.new('L',(28,28)); coarse.putdata([rnd.randint(35,215) for _ in range(28*28)])
 noise=coarse.resize((W,W),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(9))
 npx=noise.load()
 for y in range(W):
  yy=(y-W*.5)/(W*.5)
  for x in range(W):
   xx=(x-W*.5)/(W*.5)
   warp=(npx[x,y]-127)/850
   if mode=='streak':
    # Long downward gravity-streaked drips; top wider, tails taper.
    weighted=abs(xx+math.sin(yy*5+seed)*.043)
    hx=.64 if yy<-.1 else .4+(.45-(yy+.1)*.25)
    taper=max(0,1-abs(yy)*.88)
    v=max(0,1-weighted/max(.09,hx+warp))**1.35 * taper
   elif mode=='band':
    v=max(0,1-abs(xx)*1.23)**1.7*max(0,1-abs(yy)*3.9)**.73
   elif mode=='corner':
    cx=(xx+.45);cy=(yy+.40)
    v=max(0,1-math.hypot(cx*1.30,cy*1.16)+warp)**1.25
   elif mode=='sweep':
    v=max(0,1-math.hypot(xx*1.3,yy*2.2)+warp)**.88
   elif mode=='scattered':
    v=(max(0,1-math.hypot(xx+.48,yy-.29)*2.3)**1.2+
       max(0,1-math.hypot(xx-.35,yy+.30)*2.8)**1.2+
       max(0,1-math.hypot(xx+.16,yy+.03)*2.7)**1.2)*.70
   else:
    v=max(0,1-math.hypot(xx*(1.05+(.1*math.sin(seed))),yy*1.17)+warp)**1.45
   px[x,y]=int(max(0,min(255,v*255)))
 return base.filter(ImageFilter.GaussianBlur(8))
def normalize_original(data):
 im=Image.open(io.BytesIO(data)).convert('L').resize((640,640),Image.Resampling.LANCZOS)
 im=ImageOps.autocontrast(im,cutoff=3)
 return im.filter(ImageFilter.GaussianBlur(.33))
def output_rgba(base,mode,color,intensity,seed):
 pattern=normalize_original(base)
 # Physical dirt draws from the actual ambientCG source photo,
 # with irregular matte/micrograin within a broad, alpha-cut silhouette.
 from PIL import ImageChops
 shape=mask_shape(mode,seed)
 pattern=ImageEnhance.Contrast(pattern).enhance(1.55)
 extrema=ImageStat.Stat(pattern).mean[0]
 pat=pattern.point(lambda x:int(255*min(1,abs(x-extrema)*2/175 + .26)))
 alpha=ImageChops.multiply(shape,pat).point(lambda x:int(min(240,x*intensity)))
 rgb=tuple(int(color[i:i+2],16) for i in (1,3,5))
 out=Image.new('RGBA',(640,640),rgb+(0,))
 out.putalpha(alpha)
 return out
sourceInfo={}
for asset in SOURCES:
 url=f'https://ambientcg.com/get?file={asset}_1K-JPG.zip'
 req=urllib.request.Request(url,headers={'User-Agent':'Pinewood-Builder-CC0-Decal-V97/1.0'})
 with urllib.request.urlopen(req,timeout=160) as response:
  blob=response.read()
 if len(blob)<18000 or len(blob)>19_000_000:raise RuntimeError('Implausible CC0 source archive '+asset)
 z=zipfile.ZipFile(io.BytesIO(blob))
 members=[x for x in z.namelist() if re.search(rf'(?:^|/){asset}_1K-JPG_(?:Color|Roughness|Displacement|Opacity)\.jpg$',x,re.I)]
 if not members:raise RuntimeError('No usable photo member: '+asset+' '+repr(z.namelist()[:20]))
 choice=next((x for x in members if x.endswith('_Color.jpg')),members[0])
 original=z.read(choice)
 if original[:2]!=b'\xff\xd8':raise RuntimeError('Source JPEG corrupt')
 sourceInfo[asset]={'id':asset,'sourceUrl':f'https://ambientcg.com/view?id={asset}',
  'downloadUrl':url,'downloadSHA256':sha(blob),'downloadBytes':len(blob),
  'archiveMember':choice,'archiveMemberSHA256':sha(original),
  'license':'CC0-1.0','originalBytes':original}
 print('PINEWOOD_DECAL_SOURCE_PIN',asset,len(blob),choice,flush=True)
entries=[]
for i,(slug,label,surface,sourceID,mode,tint,alpha,width,height) in enumerate(DATA):
 if not re.fullmatch(r'[a-z0-9-]+',slug):raise RuntimeError('Unsafe decal '+slug)
 im=output_rgba(sourceInfo[sourceID]['originalBytes'],mode,tint,alpha,i*59+33)
 out=io.BytesIO();im.save(out,format='PNG',optimize=True,compress_level=8)
 data=out.getvalue();p=ROOT/(slug+'.png');p.write_bytes(data)
 entries.append({'id':'grime-'+slug,'label':label,'surface':surface,'sourceId':sourceID,
   'path':str(p),'thumb':str(p),'category':'Surface Decals & Grime',
   'materialStyle':'image-mapped','condition':'weathered',
   'kind':'surface-decal','width':width,'height':height,'opacity':.9,
   'bytes':len(data),'sha256':sha(data),'license':'CC0-1.0'})
sources=[]
for name,item in sourceInfo.items():
 src={k:v for k,v in item.items() if k!='originalBytes'}
 sources.append(src)
manifest={'version':97,'license':'CC0-1.0','licenseUrl':'https://creativecommons.org/publicdomain/zero/1.0/',
  'sourceOwner':'ambientCG','decals':entries,'sources':sources}
(ROOT/'manifest-v97.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('PINEWOOD_DECALS_V97_VENDOR_PASS',len(entries),'assets',sum(x['bytes'] for x in entries),'bytes',flush=True)
