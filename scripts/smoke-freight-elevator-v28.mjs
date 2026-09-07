import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.env.PINEWOOD_BASE_URL||'http://127.0.0.1:4173/';
const out='elevator-v28-artifacts';await mkdir(out,{recursive:true});
const report={base,closed:null,open:null,reclosed:null,errors:[],remote:[],failed:false};
const origin=new URL(base).origin;
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
  const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
  page.on('pageerror',e=>report.errors.push(e.stack||e.message));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  page.on('request',r=>{try{const u=new URL(r.url());if((u.protocol==='http:'||u.protocol==='https:')&&u.origin!==origin)report.remote.push(r.url());}catch{}});
  const url=new URL(base);url.searchParams.set('visualTest','elevator-front');
  await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.__PINEWOOD_VISUAL_READY__===true&&window.__PINEWOOD_ELEVATOR_V28__?.version===28,null,{timeout:120000});
  const probe=()=>page.evaluate(()=>window.__PINEWOOD_ELEVATOR_V28__.probe());
  report.closed=await probe();
  await page.screenshot({path:`${out}/elevator-closed.png`,fullPage:true});
  if(!(report.closed.openFraction<.02&&!report.closed.blockerDisabled&&!report.closed.doorwayCanStand&&report.closed.leftVisuals>0&&report.closed.rightVisuals>0))throw new Error('closed freight elevator is not visibly/physically closed: '+JSON.stringify(report.closed));

  report.open=await page.evaluate(()=>window.__PINEWOOD_ELEVATOR_V28__.open());
  await page.waitForTimeout(80);
  report.open=await probe();
  await page.screenshot({path:`${out}/elevator-open.png`,fullPage:true});
  if(!(report.open.state==='waiting'&&report.open.openFraction>=.985&&report.open.blockerDisabled&&report.open.doorwayCanStand&&Math.abs(report.open.leftZ-report.open.openL)<.01&&Math.abs(report.open.rightZ-report.open.openR)<.01))throw new Error('freight elevator did not visibly and physically open together: '+JSON.stringify(report.open));

  report.reclosed=await page.evaluate(()=>window.__PINEWOOD_ELEVATOR_V28__.close());
  await page.waitForTimeout(80);
  report.reclosed=await probe();
  if(!(report.reclosed.openFraction<.02&&!report.reclosed.blockerDisabled&&!report.reclosed.doorwayCanStand&&Math.abs(report.reclosed.leftZ-report.reclosed.closedL)<.01&&Math.abs(report.reclosed.rightZ-report.reclosed.closedR)<.01))throw new Error('freight elevator did not visibly and physically re-close together: '+JSON.stringify(report.reclosed));

  report.remote=[...new Set(report.remote)];
  if(report.errors.length||report.remote.length)throw new Error(`browser telemetry failed: errors=${report.errors.join(' | ')} remote=${report.remote.join(', ')}`);
  await page.close();
}catch(err){report.failed=true;report.error=err.stack||String(err);process.exitCode=1;}finally{
  await browser.close();await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
}
console.log(JSON.stringify(report,null,2));
