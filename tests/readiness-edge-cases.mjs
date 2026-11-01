import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const out=process.env.READINESS_OUTPUT?resolve(process.env.READINESS_OUTPUT)+'/':fileURLToPath(new URL('../outputs/readiness-edge-cases/',import.meta.url));
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4195/ai-image-hall-frontend-prototype/?version=readiness-edges';
const server=process.env.PREVIEW_URL?null:spawn('npm',['exec','vite','preview','--','--host','127.0.0.1','--port','4195','--strictPort'],{stdio:'ignore'});
for(let i=0;i<60;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
await mkdir(out+'evidence/edges',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
await context.addInitScript(()=>{
  window.__photoAudit={created:[],revoked:[],gated:false,releases:[]};
  const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL),decode=HTMLImageElement.prototype.decode;
  URL.createObjectURL=b=>{const u=create(b);window.__photoAudit.created.push(u);return u;};
  URL.revokeObjectURL=u=>{window.__photoAudit.revoked.push(u);revoke(u);};
  HTMLImageElement.prototype.decode=async function(){
    if(this.src.startsWith('blob:')&&window.__photoAudit.gated)await new Promise(r=>window.__photoAudit.releases.push(r));
    return decode.call(this);
  };
});
const p=await context.newPage();p.setDefaultTimeout(10000);
const report={base,cases:[],pageErrors:[],mutationRequests:[],dataRequests:[]};
p.on('pageerror',e=>report.pageErrors.push(e.message));
p.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))report.mutationRequests.push({method:r.method(),url:r.url()});if(['fetch','xhr','websocket'].includes(r.resourceType()))report.dataRequests.push(r.url());});
const route=async path=>{await p.goto('about:blank');await p.goto(base+'#'+path,{waitUntil:'domcontentloaded'});await p.locator('main').waitFor();};
const shot=async name=>{const file='evidence/edges/'+name+'.png';await p.screenshot({path:out+file});return file;};
async function run(id,fn){try{report.cases.push({id,status:'PASS',data:await fn()});}catch(e){report.cases.push({id,status:'FAIL',error:e.stack,evidence:await shot(id+'-failure')});}await writeFile(out+'evidence/edges/results.json',JSON.stringify(report,null,2));}
const config='/experience/brand/brand-0';
const fixture=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR4nGPwyGz6D8IMMAYASp4IybKNq+0AAAAASUVORK5CYII=','base64');
const file={name:'synthetic-valid.png',mimeType:'image/png',buffer:fixture};
const checked=()=>p.getByText('正在检查照片…',{exact:true}).waitFor({state:'hidden'});
async function photoStep(){await route(config);for(const row of await p.locator('.option-row').all())await row.getByRole('button').first().click();await p.getByRole('button',{name:'下一步：准备照片',exact:true}).click();}
async function validPhoto(){await p.getByLabel('选择照片',{exact:true}).setInputFiles(file);await checked();await p.getByRole('checkbox').check();return p.locator('.upload-box img').getAttribute('src');}
const release=()=>p.evaluate(()=>{window.__photoAudit.gated=false;for(const r of window.__photoAudit.releases.splice(0))r();});
const visibleField=()=>p.locator('input[name=contact]').evaluate(el=>{const r=el.getBoundingClientRect(),h=document.querySelector('.topbar').getBoundingClientRect(),n=document.querySelector('.mobile-nav').getBoundingClientRect();return {focused:document.activeElement===el,top:r.top,bottom:r.bottom,headerBottom:h.bottom,navTop:n.top,viewportHeight:innerHeight};});

await run('PHOTO-FAILED-REPLACEMENT',async()=>{
  await photoStep();const previous=await validPhoto();
  await p.getByLabel('选择照片',{exact:true}).setInputFiles({name:'corrupt.png',mimeType:'image/png',buffer:Buffer.from('invalid image')});
  await p.getByRole('alert').filter({hasText:'无法读取'}).waitFor();await checked();
  assert.equal(await p.locator('.upload-box img').getAttribute('src'),previous);assert.ok(await p.getByRole('checkbox').isChecked());
  const audit=await p.evaluate(()=>window.__photoAudit);assert.ok(!audit.revoked.includes(previous));assert.ok(audit.revoked.includes(audit.created.at(-1)));
  await shot('photo-failed-replacement');return {oldValidPhotoRetained:true,failedCandidateReclaimed:true};
});
await run('PHOTO-REMOVE-DURING-DECODE',async()=>{
  await photoStep();const previous=await validPhoto();await p.evaluate(()=>window.__photoAudit.gated=true);
  await p.getByLabel('选择照片',{exact:true}).setInputFiles({...file,name:'pending.png'});await p.getByText('正在检查照片…',{exact:true}).waitFor();
  assert.ok(await p.getByRole('button',{name:'下一步：确认信息',exact:true}).isDisabled());
  await p.getByRole('button',{name:'移除照片',exact:true}).click();await release();await p.waitForTimeout(100);
  assert.equal(await p.locator('.upload-box img').count(),0);assert.equal(await p.getByRole('checkbox').count(),0);
  const audit=await p.evaluate(()=>window.__photoAudit);assert.ok(audit.revoked.includes(previous));assert.deepEqual([...audit.revoked].sort(),[...audit.created].sort());
  return {noLatePhoto:true,allUrlsReclaimed:true};
});
await run('PHOTO-LEAVE-DURING-DECODE',async()=>{
  await photoStep();const previous=await validPhoto();await p.evaluate(()=>window.__photoAudit.gated=true);
  await p.getByLabel('选择照片',{exact:true}).setInputFiles({...file,name:'pending-away.png'});await p.getByText('正在检查照片…',{exact:true}).waitFor();
  await p.getByRole('navigation',{name:'底部导航',exact:true}).getByRole('link',{name:'应用方案',exact:true}).click();await p.locator('main[data-route="/works"]').waitFor();
  const pending=await p.evaluate(()=>window.__photoAudit.created.at(-1));assert.ok(await p.evaluate(u=>window.__photoAudit.revoked.includes(u),pending));await release();await p.goBack();
  await p.locator('.upload-box img').waitFor();assert.equal(await p.locator('.upload-box img').getAttribute('src'),previous);assert.ok(await p.getByRole('checkbox').isChecked());
  return {pendingCancelled:true,previousDraftPreserved:true};
});
await run('PHOTO-LATEST-SELECTION-WINS',async()=>{
  await photoStep();await p.evaluate(()=>window.__photoAudit.gated=true);
  await p.getByLabel('选择照片',{exact:true}).setInputFiles({...file,name:'first.png'});
  await p.getByLabel('选择照片',{exact:true}).setInputFiles({...file,name:'second.png'});
  const candidates=await p.evaluate(()=>window.__photoAudit.created.slice());assert.equal(candidates.length,2);await release();await checked();
  assert.equal(await p.locator('.upload-box img').getAttribute('src'),candidates[1]);assert.ok(!await p.getByRole('checkbox').isChecked());
  assert.ok(await p.evaluate(u=>window.__photoAudit.revoked.includes(u),candidates[0]));return {latestWins:true};
});

for(const [width,height] of [[320,568],[390,844],[1440,1000]])await run('DIRECTION-GUARD-'+width,async()=>{
  await p.setViewportSize({width,height});await route('/cooperate?product=hall&direction=brand&theme=brand-0&source=theme');
  await p.locator('textarea[name=description]').fill('Synthetic project direction test');
  for(const direction of ['活动互动与用户体验','尚未确定，想先了解']){
    await p.locator('select[name=direction]').selectOption({label:direction});assert.ok(await p.getByRole('button',{name:'整理需求摘要',exact:true}).isDisabled());
    await p.locator('.demand-form').evaluate(form=>form.requestSubmit());assert.equal(await p.getByRole('dialog').count(),0);
    assert.equal(await p.locator('select[name=direction]').getAttribute('aria-invalid'),'true');
  }
  await shot('direction-guard-'+width);await p.locator('select[name=direction]').selectOption({label:'品牌推广与主题传播'});
  await p.getByRole('button',{name:'整理需求摘要',exact:true}).click();await p.getByRole('dialog').waitFor();
  assert.match(await p.getByLabel('需求摘要',{exact:true}).inputValue(),/需求方向：品牌推广与主题传播/);
  return {inconsistentSummaryBlocked:true,userChoicesNotCleared:true};
});
for(const width of [320,390])await run('FOCUS-SHORT-'+width,async()=>{
  await p.setViewportSize({width,height:360});await route('/cooperate?product=hall');await p.locator('input[name=contact]').fill('synthetic contact');await p.waitForTimeout(700);
  const rect=await visibleField();assert.ok(rect.focused&&rect.top>=rect.headerBottom+1&&rect.bottom<rect.navTop-1);await shot('focused-short-'+width);
  await p.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await p.waitForTimeout(100);const hit=await p.locator('button[type=submit]').evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));});assert.ok(hit);return rect;
});
await run('FOCUS-VIEWPORT-RESIZE',async()=>{
  await p.setViewportSize({width:390,height:844});await route('/cooperate?product=hall');await p.locator('input[name=contact]').fill('synthetic contact');
  await p.setViewportSize({width:390,height:360});await p.waitForTimeout(700);const rect=await visibleField();assert.ok(rect.focused&&rect.top>=rect.headerBottom+1&&rect.bottom<rect.navTop-1);return rect;
});
for(const id of ['person','family'])await run('BUYER-ROLE-'+id,async()=>{
  await p.setViewportSize({width:390,height:844});await route('/category/'+id);const text=await p.locator('.application-audience').innerText();assert.match(text,/企业|机构|团队/);assert.doesNotMatch(text,/个人或机构|家庭委托方/);await shot('buyer-role-'+id);return {text};
});
for(const [width,height] of [[320,568],[360,640],[390,844],[430,932],[1440,1000]])await run('INVALID-URL-'+width,async()=>{
  await p.setViewportSize({width,height});
  for(const path of ['/experience/%E0%A4%A','/category/%','/category/brand/extra','/theme/brand/0/extra','/theme/brand/1.0','/theme/brand/01']){
    await route(path);await p.getByRole('heading',{name:'暂时没有这个页面',exact:true}).waitFor();assert.equal(await p.locator('.application-detail,.theme-config').count(),0);
    await p.getByRole('link',{name:'返回首页',exact:true}).click();await p.locator('main[data-route="/"]').waitFor();
  }
  return {invalidRoutesRecover:true};
});
report.totals=report.cases.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
await writeFile(out+'evidence/edges/results.json',JSON.stringify(report,null,2));
await browser.close();server?.kill('SIGTERM');
console.log(JSON.stringify(report,null,2));
if(report.cases.some(c=>c.status==='FAIL')||report.pageErrors.length||report.mutationRequests.length||report.dataRequests.length)process.exitCode=1;
