#!/usr/bin/env python3
"""Development-only vendoring for the Builder's period-appropriate service vestibule.
Official 3DAssets.dev CC0 source pages and immutable GLB download URLs are
recorded per item. The shipped browser loads only repository-local GLBs.
"""
from pathlib import Path
import hashlib,json,struct,urllib.request
ROOT=Path('assets/vendor/builder/models/vestibule-v98')
ROOT.mkdir(parents=True,exist_ok=True)
# tuple: item ID, name, category, 3DAssets ID, verified source page, physical height, safe horizontal radius
ITEMS=[
 ('vestibule-compact-forklift','Compact contractor forklift','Contractor Vestibule & Loading',27856,'car-factory-production-line-forklift-4daac5a1',2.65,3.25),
 ('vestibule-pallet-jack','Manual pallet jack','Contractor Vestibule & Loading',26806,'supermarket-operations-pallet-jack-160a1bb9',1.26,1.70),
 ('vestibule-wooden-pallet','Single wooden shipping pallet','Contractor Vestibule & Loading',36796,'chocolate-and-confectionery-factory-pallet-eea1b60c',.20,1.55),
 ('vestibule-stacked-pallets','Stack of five timber pallets','Contractor Vestibule & Loading',34717,'self-storage-facility-and-loading-bay-self-storage-fac-1204bf59',.70,1.65),
 ('vestibule-stepladder','Four-tread maintenance ladder','Contractor Vestibule & Loading',23950,'hardware-store-and-diy-warehouse-step-ladder-40e70d6b',1.60,1.10),
 ('vestibule-rolling-tool-chest','Rolling tool chest with drawers','Contractor Vestibule & Loading',34254,'woodworking-workshop-and-joinery-woodworking-workshop--d5cab84d',.96,1.25),
 ('vestibule-tool-cabinet','Maintenance tool cabinet','Contractor Vestibule & Loading',32012,'abandoned-telephone-exchange-maintenance-tool-chest-fae767a4',.77,1.22),
 ('vestibule-wall-whiteboard','Wall-mounted contractor whiteboard','Noticeboards & Office Walls',17019,'downtown-office-interiors-whiteboard-wall-mounted-251627dd',1.26,2.20),
 ('vestibule-mobile-whiteboard','Freestanding wheeled whiteboard','Noticeboards & Office Walls',29964,'police-station-and-detective-office-whiteboard-mobile-1e0eb149',1.50,1.70),
 ('vestibule-clipboard','Clipboard and paper log sheets','Contractor Vestibule & Loading',15713,'cold-war-missile-silo-and-command-bunker-clipboard-and-d6bed08e',.06,.54),
 ('vestibule-safety-cone','Warehouse safety traffic cone','Contractor Vestibule & Loading',35974,'motorway-services-and-truck-park-traffic-cone-338a0889',.76,.74),
]
def sha(x):return hashlib.sha256(x).hexdigest()
def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Pinewood-Mall-Builder-CC0-Asset-Vendor/1.0'})
 with urllib.request.urlopen(req,timeout=70) as r:return r.read()
def inspect_glb(data):
 if len(data)<64 or data[:4]!=b'glTF' or struct.unpack_from('<I',data,8)[0]!=len(data):
  raise ValueError('invalid source GLB header or byte length')
 chunk=struct.unpack_from('<I',data,12)[0]
 if data[16:20]!=b'JSON':raise ValueError('missing GLB json chunk')
 meta=json.loads(data[20:20+chunk].decode())
 if not meta.get('meshes') or not meta.get('nodes'):raise ValueError('unusable GLB meshes/nodes')
 if any(ext in meta.get('extensionsRequired',[]) for ext in ('KHR_draco_mesh_compression','EXT_meshopt_compression')):
  raise ValueError('missing decoder for source model')
 return meta
out=[]
for name,label,category,id,slug,height,radius in ITEMS:
 url=f'https://cdn.3dassets.dev/assets/{id}/v1/model.glb'
 page=f'https://3dassets.dev/assets/{slug}'
 data=fetch(url)
 if len(data)>3500000:raise ValueError('needlessly heavy source model '+name)
 meta=inspect_glb(data)
 path=ROOT/(name+'.glb');path.write_bytes(data)
 has_image=bool(meta.get('textures')) or bool(meta.get('images')) or any(
  'baseColorTexture' in m.get('pbrMetallicRoughness',{}) for m in meta.get('materials',[]))
 record={'id':name,'label':label,'category':category,
  'condition':'weathered' if 'pallets' in name or 'cabinet' in name else 'standard',
  'path':str(path),'bytes':len(data),'sha256':sha(data),'sourceId':id,
  'sourcePage':page,'downloadUrl':url,'sourceAuthor':'3DAssets.dev',
  'license':'CC0-1.0','licenseUrl':'https://creativecommons.org/publicdomain/zero/1.0/',
  'targetHeight':height,'radius':radius,'materialStyle':'image-mapped' if has_image else 'color-only',
  'meshes':len(meta['meshes']),'materials':len(meta.get('materials',[])),
  'animations':len(meta.get('animations',[]))}
 out.append(record)
 print('PINEWOOD_V98_MODEL '+name+' '+str(len(data))+' '+sha(data),flush=True)
manifest={'version':98,'source':'3DAssets.dev','license':'CC0-1.0','models':out}
(ROOT/'manifest-v98.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('PINEWOOD_V98_MODELS_VENDOR_COMPLETE',len(out),sum(x['bytes'] for x in out),flush=True)
