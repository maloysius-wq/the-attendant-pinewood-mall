#!/usr/bin/env python3
"""One-time archival download of existing CC0 boards and torn-poster imagery.

This tool does NOT invent/model substitute 3D props. Both GLBs are publisher files
and six distress variants are cropped/alpha-masked derivatives of an existing
CC0 illustration texture by GGBotNet. Final runtime assets are all local.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
from io import BytesIO
from hashlib import sha256
import json,random,math

ROOT=Path("assets/vendor/builder/wall-decay-v100")
MDIR=ROOT/"models";IDIR=ROOT/"posters";SRC=ROOT/"source"
for p in (MDIR,IDIR,SRC):p.mkdir(parents=True,exist_ok=True)
UA={"User-Agent":"Mozilla/5.0 (Pinewood Mall CC0 license preservation)"}
def get(url,maxbytes=15_000_000):
 with urlopen(Request(url,headers=UA),timeout=60) as r:
  b=r.read(maxbytes+1)
  resolved=r.geturl()
 if not b or len(b)>maxbytes:raise RuntimeError("Invalid file size for "+url)
 return b,resolved
def sig(b):return sha256(b).hexdigest()
def pin(path,b):path.write_bytes(b);return {"bytes":len(b),"sha256":sig(b)}
sources=[
 ("vintage-office-whiteboard","Used mobile whiteboard with charts and marker tray","whiteboard","Grab3D",
  "https://grab3d.com/models/furniture/whiteboard/","https://grab3d.com/dl/whiteboard/whiteboard.glb",1.74,1.55),
 ("aged-cork-bulletin-board","Pinned cork noticeboard with curling notes","cork-board","Grab3D",
  "https://grab3d.com/models/furniture/cork-board/","https://grab3d.com/dl/cork-board/cork-board.glb",.60,.76)
]
models=[]
for slug,label,orig,provider,page,url,height,radius in sources:
 print("DOWNLOAD_MODEL",slug,url,flush=True)
 b,resolved=get(url)
 if b[:4]!=b"glTF" or int.from_bytes(b[4:8],"little")!=2 or int.from_bytes(b[8:12],"little")!=len(b):
  raise RuntimeError("Not a complete 3D source GLB: "+slug)
 jlen=int.from_bytes(b[12:16],"little");j=json.loads(b[20:20+jlen])
 if not j.get("meshes") or not j.get("materials") or not j.get("images"):
  raise RuntimeError("Missing sourced textured geometry: "+slug)
 p=MDIR/(slug+".glb");info=pin(p,b)
 models.append({
  "id":"v100-"+slug,"label":label,"category":"Abandoned Office Boards",
  "kind":"model","path":str(p),"condition":"weathered","materialStyle":"image-mapped",
  "license":"CC0-1.0","originalAuthor":"Grab3D","sourceCreatorMethod":"Source website discloses Blender procedural scripts written with AI coding assistance; no AI-generated mesh/image",
  "originalSource":page,"downloadUrl":url,"resolvedDownloadUrl":resolved,
  "sourceSHA256":sig(b),"sourceBytes":len(b),"targetHeight":height,"radius":radius,
  "skipMaterialEnhancement":True,"sourceMeshCount":len(j["meshes"]),
  "sourceImageCount":len(j["images"]),"sourceMaterialCount":len(j["materials"]),**info
 })
 print("PINNED_MODEL",slug,info,j["meshes"][0].get("name"),flush=True)
# The original licensed worn-torn poster collage is an external artist asset.
poster_url="https://opengameart.org/sites/default/files/torn-posters-1.1.png"
print("DOWNLOAD_POSTERS",poster_url,flush=True)
raw,resolved=get(poster_url,8_000_000)
source=Image.open(BytesIO(raw)).convert("RGBA")
if source.width<500 or source.height<500:raise RuntimeError("Unexpected source poster image")
p=SRC/"ggbotnet-torn-posters.png";sourcepin=pin(p,raw)
print("PINNED_SOURCE_POSTER",source.size,sourcepin,flush=True)
# Distressing here is surface processing of CC0 source art, not new art.
variants=[
 ("nearly-intact","Old poster, lifting corners",.89,0,1.2,.16,"corners"),
 ("top-corner-peel","Poster, top corner peeling",.82,1,1.12,.28,"top"),
 ("bottom-curl","Poster, lower edge curling",.76,2,1.03,.42,"bottom"),
 ("side-detaching","Poster, loose side hanging",.68,3,1.17,.55,"right"),
 ("ragged-half","Poster, torn halfway down",.62,4,1.16,.62,"half"),
 ("last-fragments","Poster remnants and paper strips",.48,5,1.07,.7,"strips")
]
items=[]
for slug,label,opacity,index,zoom,wear,style in variants:
 rng=random.Random(1000+index)
 size=768
 crop_side=round(min(source.size)/zoom)
 ox=max(0,min(source.width-crop_side,(index%3)*70))
 oy=max(0,min(source.height-crop_side,(index//3)*90))
 if crop_side>min(source.size):crop_side=min(source.size)
 art=source.crop((ox,oy,ox+crop_side,oy+crop_side)).resize((size,size),Image.Resampling.LANCZOS)
 art=ImageEnhance.Color(art).enhance(.80-index*.058)
 art=ImageEnhance.Contrast(art).enhance(.92-index*.026)
 art=ImageEnhance.Brightness(art).enhance(.92-index*.036)
 # Scanned source imagery stays intact; only the silhouette alpha and fold
 # shading are changed. These masks create realistic torn/peeling states.
 alpha=Image.new("L",(size,size));d=ImageDraw.Draw(alpha)
 l=[(26,20),(200,9),(406,16),(735,21)]
 r=[(750,182),(739,350),(745,527),(736,744)]
 b=[(562,749),(325,744),(160,748),(23,738)]
 left=[(15,523),(23,275)]
 poly=l+r+b+left
 if style=="top":poly=[(16,15),(570,22),(646,70),(686,175),(745,207),(749,745),(21,752)]
 elif style=="bottom":poly=[(23,12),(747,23),(750,538),(690,585),(610,630),(595,748),(20,746)]
 elif style=="right":poly=[(18,15),(736,23),(717,226),(630,386),(657,588),(539,751),(23,744)]
 elif style=="half":poly=[(18,20),(744,19),(720,319),(698,354),(644,360),(607,386),(581,409),(523,429),(469,451),(441,429),(388,477),(307,462),(265,507),(208,497),(163,515),(91,502),(23,533)]
 elif style=="strips":poly=[(25,20),(744,23),(735,198),(653,254),(627,361),(538,300),(495,498),(412,410),(366,577),(305,443),(261,690),(204,488),(158,723),(115,491),(41,650)]
 d.polygon(poly,fill=255)
 # Fibrous tears: punch small erratic contours near ragged areas, no square stamps.
 for i in range(23+index*17):
  x=rng.randrange(14,755);y=rng.randrange(14,755)
  if style in ("half","strips") and y<270:continue
  if style=="top" and x<480:continue
  radius=rng.randrange(2,9+index*2)
  d.ellipse((x-radius,y-radius,x+radius,y+radius),fill=0)
 alpha=alpha.filter(ImageFilter.GaussianBlur(.65))
 if style=="corners":pass
 # Deep grey folds at the released edges make the bitmap read as physical paper.
 shaded=art.copy()
 sd=ImageDraw.Draw(shaded,"RGBA")
 if style=="top":sd.polygon([(585,24),(657,94),(688,181),(743,209),(719,40)],fill=(27,23,22,76))
 elif style=="bottom":sd.polygon([(601,736),(607,641),(691,590),(749,560),(740,731)],fill=(23,20,17,74))
 elif style=="right":sd.polygon([(705,199),(650,384),(680,581),(551,738),(745,736)],fill=(17,17,14,83))
 shaded.putalpha(alpha)
 out=BytesIO();shaded.save(out,"PNG",optimize=True)
 path=IDIR/(slug+".png");info=pin(path,out.getvalue())
 items.append({
  "id":"v100-poster-"+slug,"label":label,"category":"Peeling Posters & Paper",
  "surface":"wall","kind":"surface-decal","condition":"weathered","materialStyle":"image-mapped",
  "license":"CC0-1.0","originalAuthor":"GGBotNet","originalSource":"https://opengameart.org/content/torn-posters-texture",
  "sourceId":"ggbotnet-torn-posters","derivation":"Artist CC0 poster-colllage crop, color aging, alpha tear/curl mask; no invented poster image or new model",
  "path":str(path),"thumb":str(path),"width":.80 if index<3 else .94,"height":1.07 if index<3 else 1.22,
  "opacity":opacity,"peelStyle":style,**info
 })
manifest={
 "version":100,"models":models,"posters":items,
 "sources":[{"id":"ggbotnet-torn-posters","originalAuthor":"GGBotNet",
   "sourcePage":"https://opengameart.org/content/torn-posters-texture",
   "license":"CC0-1.0","downloadUrl":poster_url,"resolvedDownloadUrl":resolved,
   "sourcePath":str(p),"sourceWidth":source.width,"sourceHeight":source.height,**sourcepin}],
 "sourcePolicy":"Publisher GLBs are used unmodified, and poster imagery is derived entirely from preexisting CC0 artwork. Original geometry and image maps are preserved. Source creator AI coding-assistance disclosed for Grab3D."
}
(ROOT/"manifest-v100.json").write_text(json.dumps(manifest,indent=2)+"\n")
print("DONE v100",len(models),len(items),flush=True)
