import { readFile, writeFile } from 'node:fs/promises';

for(const file of ['scripts/audit-cassette-castle-v13.mjs','scripts/audit-cassette-castle-v14.mjs']){
  let text=await readFile(file,'utf8');
  text=text.replace(
    "  'const source=cassetteV14Source+'\n",
    "  \"const LOCAL_ASSETS_PATCH='./patches/local-assets-v15.js.txt';\",\n  'const localAssetsV15Source=await applyLocalAssetsV15Runtime(cassetteV14Source,localAssetsPatch,localAssetsManifest);',\n  'const source=localAssetsV15Source+'\n"
  );
  text=text.replace(
    '  "const source=cassetteV14Source+"\n',
    "  \"const LOCAL_ASSETS_PATCH='./patches/local-assets-v15.js.txt';\",\n  'const localAssetsV15Source=await applyLocalAssetsV15Runtime(cassetteV14Source,localAssetsPatch,localAssetsManifest);',\n  \"const source=localAssetsV15Source+\"\n"
  );
  if(!text.includes('const source=localAssetsV15Source+'))throw new Error(`${file}: v15 loader-chain marker patch failed`);
  await writeFile(file,text,'utf8');
}
console.log('Cassette v13/v14 audits now recognize the v15 localization handoff.');
