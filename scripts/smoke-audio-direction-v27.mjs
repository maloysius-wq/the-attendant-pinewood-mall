import { chromium } from 'playwright';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const fail=msg=>{throw new Error('Audio Direction v27 browser smoke failed: '+msg);};
const expect=(cond,msg)=>{if(!cond)fail(msg);};
const origin=new URL(base).origin;
const pageUrl=new URL(base);pageUrl.searchParams.set('visualTest','last-shift-control');
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1280,height:720}});
const errors=[],remote=[];
page.on('pageerror',e=>errors.push(e.stack||e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('request',r=>{try{const u=new URL(r.url());if((u.protocol==='http:'||u.protocol==='https:')&&u.origin!==origin)remote.push(r.url());}catch{}});
try{
  await page.goto(pageUrl.toString(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true&&window.__PINEWOOD_AUDIO_V27__?.version===27,null,{timeout:120000});
  const bootCharacterAudioRequests=await page.evaluate(()=>performance.getEntriesByType('resource').map(entry=>entry.name).filter(name=>/\/assets\/audio\/characters\/[^/?]+\.ogg(?:\?|$)/.test(name)));
  expect(bootCharacterAudioRequests.length===0,'character OGG files fetched during deterministic boot instead of lazy-loading: '+bootCharacterAudioRequests.join(', '));
  const result=await page.evaluate(async()=>{
    const telemetry={...window.__PINEWOOD_AUDIO_V27__};
    const [pcasResponse,charResponse]=await Promise.all([fetch('./assets/audio/pa/manifest.json',{cache:'no-store'}),fetch('./assets/audio/characters/manifest.json',{cache:'no-store'})]);
    if(!pcasResponse.ok||!charResponse.ok)return {telemetry,error:'manifest HTTP failure'};
    const pcas=await pcasResponse.json(),characters=await charResponse.json();
    const samples=[
      ['./assets/audio/pa/',pcas.files?.ch1_contractor_registered?.file,'pcas'],
      ['./assets/audio/pa/',pcas.files?.ambient_ch1_public_exit?.file,'pcas-ambient'],
      ['./assets/audio/characters/',characters.files?.ch1_start?.file,'renee'],
      ['./assets/audio/characters/',characters.files?.ch4_fake_route?.file,'fake-renee'],
      ['./assets/audio/characters/',characters.files?.ch6_radio_overlap?.file,'radio-overlap'],
      ['./assets/audio/characters/',characters.files?.recording_jo_ls06?.file,'jo'],
      ['./assets/audio/characters/',characters.files?.recording_eli_ls08?.file,'eli']
    ];
    const assets=[];
    for(const [dir,file,label] of samples){
      if(!file){assets.push({label,ok:false,reason:'missing manifest entry'});continue;}
      const response=await fetch(dir+file,{cache:'no-store'});const bytes=new Uint8Array(await response.arrayBuffer());
      const ogg=bytes.length>=4&&String.fromCharCode(...bytes.slice(0,4))==='OggS';
      assets.push({label,file,ok:response.ok&&ogg,size:bytes.length});
    }
    return {telemetry,pcasRevision:pcas.audioDirectionRevision,pcasCount:Object.keys(pcas.files||{}).length,characterVersion:characters.version,characterCount:Object.keys(characters.files||{}).length,assets};
  });
  expect(!result.error,result.error||'manifest fetch failed');
  expect(result.telemetry?.version===27,'runtime telemetry v27 missing');
  expect(result.telemetry.sparsePcas===true&&result.telemetry.serializedVoices===true&&result.telemetry.radioVoices===true&&result.telemetry.deepPcas===true,'v27 runtime flags incomplete');
  expect(result.telemetry.ambientMin===72&&result.telemetry.ambientMax===118&&result.telemetry.openingQuiet===45,'sparse PCAS timing telemetry changed');
  expect(result.telemetry.loaded===0,'character voices decoded during deterministic boot instead of lazy-loading');
  expect(Array.isArray(result.telemetry.failures)&&result.telemetry.failures.length===0,'character voice preload reported failures: '+JSON.stringify(result.telemetry.failures));
  expect(result.pcasRevision===27&&result.pcasCount===25,`PCAS manifest mismatch: revision ${result.pcasRevision}, count ${result.pcasCount}`);
  expect(result.characterVersion===27&&result.characterCount===47,`character manifest mismatch: version ${result.characterVersion}, count ${result.characterCount}`);
  for(const asset of result.assets)expect(asset.ok&&asset.size>1000,`${asset.label} local OGG failed: ${JSON.stringify(asset)}`);
  expect(errors.length===0,'browser errors: '+errors.join(' | '));
  expect(remote.length===0,'remote requests escaped local runtime: '+[...new Set(remote)].join(', '));
  console.log(JSON.stringify({pass:true,...result,bootCharacterAudioRequests,remoteRequests:0,browserErrors:0},null,2));
}finally{await page.close();await browser.close();}
