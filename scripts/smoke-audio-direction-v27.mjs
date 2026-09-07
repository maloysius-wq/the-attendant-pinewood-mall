import { chromium } from 'playwright';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const fail=msg=>{throw new Error('Audio Direction v27 browser smoke failed: '+msg);};
const expect=(cond,msg)=>{if(!cond)fail(msg);};
const origin=new URL(base).origin;
const pageUrl=new URL(base);pageUrl.searchParams.set('visualTest','last-shift-control');
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
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
    return {
      telemetry,
      pcasRevision:pcas.audioDirectionRevision,
      pcasCount:Object.keys(pcas.files||{}).length,
      characterVersion:characters.version,
      characterCount:Object.keys(characters.files||{}).length,
      reneeEngine:characters.engine?.renee||'',
      characterProcessing:characters.processing?.description||'',
      reneeSourceDuration:Number(characters.files?.ch1_start?.sourceDuration||0),
      reneeDuration:Number(characters.files?.ch1_start?.duration||0),
      firstPowerSourceDuration:Number(characters.files?.ch1_first_power?.sourceDuration||0),
      firstPowerDuration:Number(characters.files?.ch1_first_power?.duration||0),
      assets
    };
  });
  expect(!result.error,result.error||'manifest fetch failed');
  expect(result.telemetry?.version===27,'runtime telemetry v27 missing');
  expect(result.telemetry.sparsePcas===true&&result.telemetry.serializedVoices===true&&result.telemetry.radioVoices===true&&result.telemetry.deepPcas===true,'v27 runtime flags incomplete');
  expect(result.telemetry.subtitleTracksVoice===true,'Renee subtitle lifecycle is not tied to actual character voice playback');
  expect(result.telemetry.retainedCharacterSources===true,'Renee character sources are not explicitly retained through onended');
  expect(result.telemetry.ambientMin===72&&result.telemetry.ambientMax===118&&result.telemetry.openingQuiet===45,'sparse PCAS timing telemetry changed');
  expect(result.telemetry.loaded===0,'character voices decoded during deterministic boot instead of lazy-loading');
  expect(Array.isArray(result.telemetry.failures)&&result.telemetry.failures.length===0,'character voice preload reported failures: '+JSON.stringify(result.telemetry.failures));
  expect(result.pcasRevision===27&&result.pcasCount===25,`PCAS manifest mismatch: revision ${result.pcasRevision}, count ${result.pcasCount}`);
  expect(result.characterVersion===27&&result.characterCount===47,`character manifest mismatch: version ${result.characterVersion}, count ${result.characterCount}`);
  expect(result.reneeEngine.includes('Crisp / approved Take 1'),'approved Renee Crisp Take 1 provenance missing from served character manifest');
  expect(result.characterProcessing.includes('pronounced dispatch-radio chain at reduced level'),'served Renee master does not contain the strengthened reduced-level radio treatment');
  expect(result.characterProcessing.includes('duration-safe 44.1 kHz normalization/mix boundary with source/output duration guard'),'served Renee master does not advertise the duration-safe render boundary');
  expect(result.reneeSourceDuration>10&&result.reneeDuration>10,'opening Renee line is still the historical truncated render');
  expect(result.reneeDuration+.05>=result.reneeSourceDuration,`opening Renee render ${result.reneeDuration}s is shorter than ${result.reneeSourceDuration}s source`);
  expect(result.firstPowerSourceDuration>7&&result.firstPowerDuration>7,'first-power Renee line is still the historical truncated render');
  expect(result.firstPowerDuration+.05>=result.firstPowerSourceDuration,`first-power Renee render ${result.firstPowerDuration}s is shorter than ${result.firstPowerSourceDuration}s source`);
  for(const asset of result.assets)expect(asset.ok&&asset.size>1000,`${asset.label} local OGG failed: ${JSON.stringify(asset)}`);

  // Actually run the full restored opening Renee buffer through the production WebAudio graph.
  // This proves the local OGG remains retained and reaches its natural onended event after the
  // duration-safe render, rather than merely proving that the file can be fetched.
  const testStarted=await page.evaluate(()=>{
    const t=window.__PINEWOOD_AUDIO_V27__;
    if(typeof t?.playCharacterTest!=='function')return false;
    t.playCharacterTest('ch1_start');
    return true;
  });
  expect(testStarted,'deterministic Renee playback hook missing');
  await page.waitForFunction(()=>window.__PINEWOOD_AUDIO_V27__?.lastCharacter?.id==='ch1_start'&&window.__PINEWOOD_AUDIO_V27__.lastCharacter.ended===true,null,{timeout:30000});
  const playback=await page.evaluate(()=>JSON.parse(JSON.stringify({lastCharacter:window.__PINEWOOD_AUDIO_V27__.lastCharacter,activeCharacters:window.__PINEWOOD_AUDIO_V27__.activeCharacters,failures:window.__PINEWOOD_AUDIO_V27__.failures})));
  expect(playback.lastCharacter?.endedNaturally===true,'Renee source ended early: '+JSON.stringify(playback.lastCharacter));
  expect(playback.lastCharacter.elapsed>=result.reneeDuration-.15,`Renee played ${playback.lastCharacter.elapsed}s but manifest duration is ${result.reneeDuration}s`);
  expect(playback.activeCharacters===0,'Renee active source was not released after natural completion');
  expect((playback.failures||[]).length===0,'Renee playback reported failures: '+JSON.stringify(playback.failures));

  expect(errors.length===0,'browser errors: '+errors.join(' | '));
  expect(remote.length===0,'remote requests escaped local runtime: '+[...new Set(remote)].join(', '));
  console.log(JSON.stringify({pass:true,...result,playback,bootCharacterAudioRequests,remoteRequests:0,browserErrors:0},null,2));
}finally{await page.close();await browser.close();}
