import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:4188/ai-image-hall-frontend-prototype/';
const server=process.env.PREVIEW_URL?null:spawn('npm',['exec','vite','preview','--','--host','127.0.0.1','--port','4188','--strictPort'],{stdio:'ignore'});
for(let i=0;i<40;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,150));}
await mkdir('outputs',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1});
const errors=[];const broken=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)broken.push(`${r.status()} ${r.url()}`);});
const route=async path=>{await page.goto(`${base}#${path}`);await page.locator(`main[data-route="${path.split('?')[0]}"]`).waitFor();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
try {
 await route('/');
 await page.getByRole('heading',{name:/属于你的AI片场/}).waitFor();
 assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(8, 11, 20)');
 await page.getByRole('img',{name:'咣当原品牌Logo',exact:true}).waitFor();
 assert.equal(await page.getByRole('img',{name:'咣当原品牌Logo',exact:true}).getAttribute('src'),'/ai-image-hall-frontend-prototype/images/brand/guangdang-logo.png');
 await noOverflow();
 await page.screenshot({path:'outputs/guangdang-home-mobile.png',fullPage:true});
 await page.getByRole('link',{name:/INTERACTIVE EXPERIENCES/}).click();
 await page.locator('main[data-route="/hall"] .category-card').first().waitFor();
 assert.equal(await page.locator('.category-card').count(),4);
 await page.getByRole('button',{name:'员工关怀',exact:true}).click();
 await page.getByRole('button',{name:'员工关怀',exact:true}).evaluate(e=>new Promise(r=>requestAnimationFrame(r)));
 assert.equal(await page.locator('.category-card').count(),1);
 await page.getByRole('link',{name:'我的职场成长影像',exact:true}).click();
 await page.getByRole('heading',{name:'我的职场成长影像',exact:true}).waitFor();
 await page.getByRole('link',{name:'查看模板体验',exact:true}).click();
 const next=page.getByRole('button',{name:/下一步：准备照片/});
 assert.equal(await next.isDisabled(),true);
 for(const x of ['福田CBD','科技研发','调酒师']) await page.getByRole('button',{name:x,exact:true}).click();
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
 for(const text of ['福田CBD','科技研发','调酒师']) await page.getByText(text,{exact:true}).waitFor();
 await noOverflow();
 await page.screenshot({path:'outputs/guangdang-template-mobile.png',fullPage:true});
 await route('/bespoke');assert.equal(await page.locator('.category-card').count(),4);
 await page.getByRole('link',{name:'了解创作方向',exact:true}).first().click();
 await page.getByRole('heading',{name:'人物故事',exact:true}).waitFor();
 await page.getByRole('link',{name:'咨询定制',exact:true}).click();
 assert.equal(await page.locator('select[name="direction"]').inputValue(),'人物故事');
 await page.locator('textarea[name="description"]').fill('用于改版验收的需求摘要测试。');
 await page.locator('input[name="name"]').fill('演示访客');
 await page.locator('input[name="contact"]').fill('示意联系方式');
 await page.getByRole('button',{name:'预览需求摘要',exact:true}).click();
 await page.getByRole('dialog').waitFor();
 assert.match(await page.getByLabel('需求摘要',{exact:true}).inputValue(),/尚未发送/);
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 assert.equal(await page.evaluate(()=>localStorage.length),0);
 await route('/works');assert.equal(await page.locator('.work-card').count(),6);
 await page.getByRole('button',{name:'加载更多',exact:true}).click();assert.equal(await page.locator('.work-card').count(),8);
 await page.getByRole('button',{name:'高定AI影像',exact:true}).click();assert.equal(await page.locator('.work-card').count(),4);
 await page.getByLabel('作品分类',{exact:true}).selectOption('family');assert.equal(await page.locator('.work-card').count(),1);
 await page.locator('.work-card').click();await page.getByRole('dialog').waitFor();
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 await page.getByRole('button',{name:'已发布作品',exact:true}).click();await page.getByRole('heading',{name:'真实作品待上架',exact:true}).waitFor();
 await page.getByRole('button',{name:'布局示意',exact:true}).click();
 await noOverflow();
 await route('/mine');await page.getByRole('heading',{name:'欢迎来到咣当',exact:true}).waitFor();
 for(const id of ['brand','event','team','campus','person','family','enterprise','city']){await route(`/category/${id}`);await page.getByRole('heading',{name:'产品亮点和优势',exact:true}).waitFor();assert.equal(await page.locator('.highlight-card').count(),4);await noOverflow();}
 await route('/category/event');await page.screenshot({path:'outputs/guangdang-event-mobile.png',fullPage:true});
 await route('/category/not-found');await page.getByRole('heading',{name:'暂时没有这个页面',exact:true}).waitFor();
 for(const width of [375,390,430,768,1440]){
  await page.setViewportSize({width,height:width>700?1000:844});
  for(const p of ['/','/hall','/bespoke','/category/city','/works','/cooperate','/mine']){await route(p);await noOverflow();}
 }
 await page.setViewportSize({width:1440,height:1100});await route('/');
 await page.screenshot({path:'outputs/guangdang-home-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await route('/hall');
 await page.screenshot({path:'outputs/guangdang-categories-mobile.png',fullPage:true});
 // Force a missing image response to verify that visitors see a readable fallback.
 await page.route('**/images/guangdang-v2/person-*.webp',r=>r.abort());await route('/category/person');
 await page.getByRole('img',{name:/图片暂时无法加载/}).waitFor();
 assert.deepEqual(errors,[],'browser errors');assert.deepEqual(broken,[],'broken local assets');
 console.log(JSON.stringify({result:'PASS',viewports:[375,390,430,768,1440],flows:['原品牌Logo与新口号','深色主题','八类详情32项亮点','双业务分类与主题','模板必填守卫与预览','需求摘要未发送','作品筛选分页与空状态','个人页','无效链接','图片失败降级'],browserErrors:errors,brokenAssets:broken}));
} finally {await browser.close();server?.kill('SIGTERM');}
