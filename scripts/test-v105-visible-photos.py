#!/usr/bin/env python3
"""Pixel-level acceptance for visible photographic decay and truly varied paper."""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path('assets/vendor/builder/decay-v105')
m=json.loads((root/'manifest-v105.json').read_text())
assert len(m['decals'])==8 and len(m['posters'])==10
src={x['id']:x for x in m['sources']}
artSources=[src[x['sourceId']] for x in m['posters']]
assert len({s['pixelSignature'] for s in artSources})==10, 'poster sources contain reused artwork'
assert len({s['sha256'] for s in artSources})==10, 'poster source files are duplicates'
for p in m['posters']:
 im=Image.open(p['path']).convert('RGBA')
 alpha=im.getchannel('A')
 lo,hi=alpha.getextrema()
 assert lo<50 and hi>245, 'poster should have missing/torn edges '+p['id']
 print('PERIOD_POSTER_DISTINCT',p['id'],src[p['sourceId']]['originalTitle'])
for d in m['decals']:
 im=Image.open(d['path']).convert('RGBA')
 width,height=im.size
 assert min(width,height)>=512, 'undersized grime texture '+d['id']
 a=im.getchannel('A');h=a.histogram()
 high=sum(h[155:])
 ratio=high/(width*height)
 assert ratio>=.018, 'grime still nearly invisible at full opacity '+d['id']+' ratio='+str(ratio)
 # The high-opacity source-derived strokes are intentionally dark pigments
 # rather than transparent grey haze. They darken a room surface materially.
 rgb=im.convert('RGB')
 extrema=rgb.getextrema()
 assert max(channel[1] for channel in extrema)<=125, 'grime photo pigment washed out '+d['id']
 print('PROMINENT_SOURCE_DIRT',d['id'],'high-opacity-area',round(ratio,3),'maxRGB',extrema)
print('VISIBLE_DECAY_V105_IMAGE_PASS',len(m['decals']),len(m['posters']))
