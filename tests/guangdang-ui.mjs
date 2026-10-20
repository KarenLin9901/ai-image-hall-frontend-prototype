import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:4188/ai-image-hall-frontend-prototype/';
const server=process.env.PREVIEW_URL?null:spawn('npm',['exec','vite','preview','--','--host','127.0.0.1','--port','4188','--strictPort'],{stdio:'ignore'});
for(let i=0;i<40;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,150));}
await mkdir('outputs',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
page.setDefaultTimeout(12000);
const errors=[];const broken=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)broken.push(`${r.status()} ${r.url()}`);});
const route=async path=>{await page.goto(`${base}#${path}`);await page.locator(`main[data-route="${path.split('?')[0]}"]`).waitFor();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal page overflow');
const screenshot=async name=>{await page.locator('main img').first().evaluate(async img=>{if(!img.complete)await new Promise(r=>{img.onload=r;img.onerror=r;});});await page.screenshot({path:`outputs/${name}.png`});};
try {
 const homeSizes=[{width:360,height:640},{width:375,height:667},{width:390,height:844},{width:430,height:932}];
 for(const size of homeSizes){
  await page.setViewportSize(size);await route('/');
  await page.getByRole('heading',{name:'今天，想拍点什么？',exact:true}).waitFor();
  assert.equal(await page.locator('.home-choice').count(),2);
  assert.equal(await page.locator('.home-question p').textContent(),'属于你的AI片场');
  const layout=await page.evaluate(()=>({height:innerHeight,scroll:document.documentElement.scrollHeight,navTop:document.querySelector('.mobile-nav').getBoundingClientRect().top,lastBottom:document.querySelector('.home-choice:last-child').getBoundingClientRect().bottom}));
  assert.ok(layout.scroll<=layout.height+1,`home should fit one screen ${JSON.stringify({size,...layout})}`);
  assert.ok(layout.lastBottom<=layout.navTop,`both home choices must clear navigation ${JSON.stringify({size,...layout})}`);
  await noOverflow();
 }
 await page.setViewportSize({width:390,height:844});await route('/');
 assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(8, 11, 20)');
 assert.equal(await page.getByRole('img',{name:'咣当原品牌Logo',exact:true}).getAttribute('src'),'/ai-image-hall-frontend-prototype/images/brand/guangdang-logo.png');
 await screenshot('guangdang-home-mobile');
 await page.locator('.home-choice[href="#/hall"]').click();
 await page.locator('main[data-route="/hall"]').waitFor();
 assert.equal(await page.locator('.preview-slide').count(),9);
 assert.equal(await page.locator('.product-introduction').getAttribute('open'),null);
 assert.equal(await page.locator('.carousel-count').textContent(),'1 / 9');
 await page.getByRole('button',{name:'下一个主题',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.carousel-count').textContent==='2 / 9');
 await page.locator('.experience-carousel').focus();await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('.carousel-count').textContent==='3 / 9');
 await page.locator('.experience-carousel').evaluate(e=>e.scrollTo({left:0,behavior:'instant'}));
 await page.waitForFunction(()=>document.querySelector('.carousel-count').textContent==='1 / 9');
 await page.waitForFunction(()=>document.querySelector('.experience-carousel').scrollLeft<1);
 // Exercise a touch gesture as well as the accessible arrow controls.
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:320}]});
 for(let x=280;x>=70;x-=30){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:320}]});await new Promise(r=>setTimeout(r,20));}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForFunction(()=>document.querySelector('.experience-carousel').scrollLeft>180);
 await page.waitForFunction(()=>{
  const e=document.querySelector('.experience-carousel');
  const width=e.firstElementChild.getBoundingClientRect().width+12;
  return Math.abs(e.scrollLeft-Math.round(e.scrollLeft/width)*width)<1;
 });
 await cdp.detach();
 await route('/');await route('/hall');
 await screenshot('guangdang-hall-mobile');
 await page.locator('.product-introduction summary').click();
 await page.getByRole('heading',{name:'产品定位',exact:true}).waitFor();
 assert.equal(await page.locator('.product-introduction li').count(),6);
 await page.locator('.product-introduction summary').click();
 await page.getByRole('link',{name:'场景启发',exact:true}).click();
 await page.locator('main[data-route="/scenes/hall"]').waitFor();
 assert.equal(await page.locator('.simple-scene-card').count(),4);
 await screenshot('guangdang-scenes-mobile');
 await page.getByRole('link',{name:'活动互动与用户体验',exact:true}).click();
 await page.getByRole('heading',{name:'活动互动与用户体验',exact:true}).waitFor();
 assert.equal(await page.locator('.simple-fold[open]').count(),0);
 await page.locator('.simple-fold summary').filter({hasText:'产品亮点和优势'}).click();
 assert.equal(await page.locator('.scene-advantages>div').count(),4);
 await page.getByRole('button',{name:'返回场景分类',exact:true}).click();
 await page.getByRole('button',{name:'返回AI影像馆',exact:true}).click();
 await page.locator('main[data-route="/hall"]').waitFor();
 await page.getByRole('link',{name:'预览体验',exact:true}).click();
 const next=page.getByRole('button',{name:/下一步：准备照片/});
 assert.equal(await next.isDisabled(),true);
 for(const x of ['福田CBD','科技研发','调酒师'])await page.getByRole('button',{name:x,exact:true}).click();
 await next.click();
 const photoNext=page.getByRole('button',{name:'下一步：确认信息',exact:true});
 assert.equal(await photoNext.isDisabled(),true);
 await page.getByLabel('选择照片').setInputFiles('public/images/v4/live-futian.jpg');
 await page.getByRole('button',{name:'女性',exact:true}).click();
 assert.equal(await photoNext.isDisabled(),true);
 await page.getByRole('checkbox',{name:'我确认已获得这张照片的使用授权',exact:true}).check();
 await photoNext.click();
 await page.getByRole('heading',{name:'确认你的选择',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'即将开放生成',exact:true}).isDisabled(),true);
 await noOverflow();
 await route('/bespoke');
 assert.equal(await page.locator('.preview-slide').count(),4);
 assert.equal(await page.locator('.sample-pending').count(),4);
 assert.equal(await page.locator('.preview-slide video').count(),0);
 assert.equal(await page.locator('.product-introduction').getAttribute('open'),null);
 await screenshot('guangdang-bespoke-mobile');
 await page.locator('.preview-slide').first().getByRole('link',{name:'了解创作',exact:true}).click();
 await page.getByRole('heading',{name:'人物故事',exact:true}).waitFor();
 await page.getByRole('link',{name:'咨询定制',exact:true}).click();
 assert.equal(await page.locator('select[name="direction"]').inputValue(),'人物故事');
 await page.locator('textarea[name="description"]').fill('用于改版验收的需求摘要测试。');
 await page.locator('input[name="name"]').fill('演示访客');
 await page.locator('input[name="contact"]').fill('示意联系方式');
 await page.getByRole('button',{name:'预览需求摘要',exact:true}).click();
 assert.match(await page.getByLabel('需求摘要',{exact:true}).inputValue(),/尚未发送/);
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 assert.equal(await page.evaluate(()=>localStorage.length),0);
 await route('/works');assert.equal(await page.locator('.work-card').count(),6);
 await page.getByRole('button',{name:'加载更多',exact:true}).click();assert.equal(await page.locator('.work-card').count(),8);
 await page.getByRole('button',{name:'高定AI影像',exact:true}).click();assert.equal(await page.locator('.work-card').count(),4);
 await page.getByLabel('作品分类',{exact:true}).selectOption('family');assert.equal(await page.locator('.work-card').count(),1);
 await page.locator('.work-card').click();await page.getByRole('dialog').waitFor();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'已发布作品',exact:true}).click();await page.getByRole('heading',{name:'真实作品待上架',exact:true}).waitFor();
 for(const id of ['brand','event','team','campus','person','family','enterprise','city']){
  await route(`/category/${id}`);assert.equal(await page.locator('.simple-fold[open]').count(),0);
  await page.locator('.simple-fold summary').filter({hasText:'产品亮点和优势'}).click();
  assert.equal(await page.locator('.scene-advantages>div').count(),4);await noOverflow();
 }
 await route('/category/city');
 assert.match(await page.locator('.detail-cover img').getAttribute('src'),/dongmen-history\/dongmen-pillars-1920\.webp$/);
 await page.locator('.history-disclosure summary').click();
 assert.equal(await page.locator('.history-photo').count(),5);
 await page.getByRole('button',{name:'放大查看东门街区标识',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'上一张',exact:true}).isDisabled(),true);
 await page.getByRole('button',{name:'下一张',exact:true}).click();
 await page.getByRole('dialog').getByRole('heading',{name:'东门街头钟景',exact:true}).waitFor();
 await page.getByRole('button',{name:'上一张',exact:true}).click();
 await page.getByRole('dialog').getByRole('heading',{name:'东门街区标识',exact:true}).waitFor();
 await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
 await route('/category/event');await screenshot('guangdang-event-mobile');
 await route('/category/not-found');await page.getByRole('heading',{name:'暂时没有这个页面',exact:true}).waitFor();
 for(const width of [360,375,390,430,768,1440]){
  await page.setViewportSize({width,height:width>700?1000:844});
  for(const p of ['/','/hall','/bespoke','/scenes/hall','/scenes/bespoke','/category/city','/works','/cooperate','/mine']){await route(p);await noOverflow();}
 }
 await page.setViewportSize({width:1440,height:1000});await route('/');await screenshot('guangdang-home-desktop');
 await page.setViewportSize({width:390,height:844});
 await page.route('**/images/guangdang-v2/person-*.webp',r=>r.abort());await route('/category/person');
 await page.getByRole('img',{name:/图片暂时无法加载/}).waitFor();
 assert.deepEqual(errors,[],'browser errors');assert.deepEqual(broken,[],'broken assets');
 console.log(JSON.stringify({result:'PASS',singleScreenHome:homeSizes,viewports:[360,375,390,430,768,1440],flows:['首页提问与双入口','原生触屏横滑、按钮与键盘切换','产品简介默认折叠','场景分类与详情下钻','高定样品待上架状态','模板必填与本机照片预览','摘要未发送','作品筛选分页与空状态','八类优势按需展开','东门5张资料图及放大翻页','无效链接和图片降级'],browserErrors:errors,brokenAssets:broken}));
} finally {await browser.close();server?.kill('SIGTERM');}
