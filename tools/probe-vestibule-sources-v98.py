#!/usr/bin/env python3
"""One-time safe investigation of original CC0/CC-BY asset download endpoints; logs no secrets."""
from urllib.request import Request,urlopen
from urllib.error import HTTPError
import re,json,html
urls=[
 'https://poly.pizza/m/EHYNWew6JK',
 'https://poly.pizza/m/MwOFAOgOhg',
 'https://poly.pizza/m/DTQBuenKJY',
 'https://poly.pizza/m/snDq7v3GRO',
 'https://kenney.nl/assets/factory-kit'
]
for url in urls:
 print('CHECK',url,flush=True)
 try:
  with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=28) as r:
   doc=r.read(2400000).decode('utf8','replace')
   print('SIZE',len(doc),'FINAL',r.url,flush=True)
   for pattern in [r'https?[^"\s<>]+\.glb[^"\s<>]*',r'[^"\s<>]{0,120}\.glb[^"\s<>]{0,120}',r'.{0,100}(?:Download|downloadUrl|downloadLink|static\.poly|media/pages/assets).{0,160}']:
    matches=re.findall(pattern,doc,re.I)
    print('MATCH',pattern,'COUNT',len(matches),str(matches[:10])[:2400],flush=True)
 except Exception as e:print('ERROR',repr(e),flush=True)
