import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
const errors=[];const broken=[];const historicalRequests=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(r.url().includes('/images/dongmen-history/'))historicalRequests.push(r.url());});
page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)broken.push(`${r.status()} ${r.url()}`);});
const normalizedRoute=path=>path.split('?')[0].replace(/^\/scenes\/(hall|bespoke)$/,'/$1');
const route=async path=>{await page.goto(`${base}#${path}`);await page.locator(`main[data-route="${normalizedRoute(path)}"]`).waitFor();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal page overflow');
const loadImages=async locator=>{
 await locator.evaluateAll(async images=>Promise.all(images.map(async image=>{image.loading='eager';await image.decode();})));
 const dimensions=await locator.evaluateAll(images=>images.map(image=>({src:image.currentSrc||image.src,width:image.naturalWidth,height:image.naturalHeight})));
 assert.ok(dimensions.every(image=>image.width>0&&image.height>0),'all requested images should decode');
 return dimensions;
};
const screenshot=async name=>{await loadImages(page.locator('main img'));await page.screenshot({path:`outputs/guangdang-20261021-${name}.png`});};
const businessIntroductions={
 hall:{positioning:'选择单人主题，自行配置属于你的影像内容。',points:['以自己为主角参与故事','按主题选择内容设定','从模板开始，降低参与门槛'],highlights:['以自己为主角参与故事','围绕不同场景组织参与','从主题开始，选择更清楚','共同主题，保留个人表达']},
 bespoke:{positioning:'围绕真实人物与故事，整理需求并规划专属AI影像。',points:['围绕真实故事专属策划','整合照片、影像与口述资料','用画面与声音表达情感'],highlights:['真实故事，专属表达','把零散资料整理成故事线','为故事选择画面与声音','围绕纪念与传播需求策划']},
};
const assertBusinessFolds=async business=>{
 const expected=businessIntroductions[business];
 const folds=page.locator('.business-secondary details');
 assert.equal(await folds.count(),2,'business page should contain exactly two disclosure rows');
 assert.deepEqual(await folds.locator('summary').allTextContents(),['产品简介','产品优势']);
 assert.equal(await page.locator('.business-secondary details[open]').count(),0,'both product sections start collapsed');
 assert.equal(await page.getByRole('link',{name:'场景启发',exact:true}).count(),0);
 assert.equal(await page.getByText(/^(体验链路|创作链路)$/).count(),0);
 await folds.nth(0).locator('summary').click();
 assert.ok(await folds.nth(0).locator('.fold-content').isVisible());
 assert.equal(await folds.nth(0).locator('.fold-content>p').textContent(),expected.positioning);
 assert.deepEqual(await folds.nth(0).locator('.fold-content ul li').allTextContents(),expected.points,'the former three advantages should be retained in the introduction');
 await folds.nth(0).locator('summary').click();
 await folds.nth(1).locator('summary').click();
 assert.equal(await folds.nth(1).locator('li').count(),0,'the old three-point list must not repeat under product advantages');
 const advantages=folds.nth(1).locator('.fold-content.scene-advantages>div');
 assert.equal(await advantages.count(),4,'each business needs four detailed product advantages');
 const titles=await advantages.locator('h2').allTextContents();
 assert.deepEqual(titles,expected.highlights,'business advantages must explain the corresponding service');
 assert.equal(new Set(titles).size,4,'product advantage titles should be distinct');
 assert.ok(titles.every(title=>title.trim().length>1));
 const descriptions=await advantages.locator('p').allTextContents();
 assert.equal(descriptions.length,4);
 assert.ok(descriptions.every(description=>description.trim().length>10),'each advantage needs a meaningful explanation');
 assert.ok(await folds.nth(1).locator('.fold-content').isVisible());
 await folds.nth(1).locator('summary').click();
};
const assertPrimaryNavigation=async(kind,active)=>{
 const navigation=page.getByRole('navigation',{name:kind==='mobile'?'底部导航':'主导航',exact:true});
 assert.ok(await navigation.isVisible());
 assert.deepEqual(await navigation.getByRole('link').allTextContents(),['首页','主题体验','商务合作','我']);
 assert.deepEqual(await navigation.getByRole('link').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),['#/','#/hall','#/cooperate','#/mine']);
 assert.deepEqual(await navigation.locator('a.active').allTextContents(),[active],'exactly the current primary destination should be active');
 return navigation;
};
const assertAspect=async(locator,ratio,label)=>{
 const boxes=await locator.evaluateAll(elements=>elements.map(element=>{const r=element.getBoundingClientRect();return {width:r.width,height:r.height};}));
 assert.ok(boxes.length>0,`${label}: missing media`);
 for(const box of boxes)assert.ok(Math.abs(box.width/box.height-ratio)<.02,`${label}: ${JSON.stringify(box)}`);
};
const assertWorkGrid=async()=>{
 await loadImages(page.locator('.work-image img'));
 await assertAspect(page.locator('.work-image'),4/3,'work covers must be 4:3');
 const grid=await page.locator('.masonry').evaluate(element=>({display:getComputedStyle(element).display,columns:getComputedStyle(element).gridTemplateColumns.split(' ').length}));
 assert.equal(grid.display,'grid','works should use a regular grid');
 assert.ok(grid.columns>=2,'works should have multiple columns at supported viewports');
 const boxes=await page.locator('.work-card').evaluateAll(cards=>cards.map(card=>{const r=card.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
 assert.ok(Math.max(...boxes.map(b=>b.width))-Math.min(...boxes.map(b=>b.width))<2,'work cards should share a width');
 assert.ok(Math.max(...boxes.map(b=>b.height))-Math.min(...boxes.map(b=>b.height))<2,'work cards should share a height');
 const columns=new Map();
 for(const box of boxes){const key=Math.round(box.x);const column=columns.get(key)||[];column.push(box);columns.set(key,column);}
 for(const column of columns.values())for(let i=1;i<column.length;i++)assert.ok(column[i].y>=column[i-1].y+column[i-1].height,'grid cards should not overlap');
};
const directThemes=[
 {id:'shenzhen-belike',category:'brand',title:'我的深圳生活 belike'},
 {id:'brand-0',category:'brand',title:'来了就是深圳人'},
 {id:'brand-1',category:'brand',title:'我为品牌代言'},
 {id:'event-0',category:'event',title:'我的活动高光时刻'},
 {id:'event-1',category:'event',title:'专属节日影像'},
 {id:'team-0',category:'team',title:'我的职场成长影像'},
 {id:'team-1',category:'team',title:'我们团队的专属记忆'},
 {id:'campus-0',category:'campus',title:'我的毕业纪念影像'},
 {id:'campus-1',category:'campus',title:'我们的校园记忆'},
];
const themePath=theme=>`/experience/${theme.category}/${theme.id}`;
const assertDirectConfig=async theme=>{
 await page.locator(`main[data-route="${themePath(theme)}"]`).waitFor();
 await page.locator('.theme-config').waitFor();
 await page.getByRole('heading',{name:theme.title,exact:true}).waitFor();
 assert.ok(await page.getByText('生成未开放',{exact:true}).isVisible(),'generation status must be visible on the configuration screen');
 assert.equal(await page.locator('aside.template-info').count(),0,'no informational preview panel before configuration');
 assert.equal(await page.getByRole('heading',{name:'看看，你的影像如何开始',exact:true}).count(),0,'no preview introduction before configuration');
 assert.equal(await page.locator('.option-row').count(),3,'each theme needs its own three configuration groups');
 assert.equal(await page.getByRole('button',{name:/下一步：准备照片/}).isDisabled(),true,'new theme configuration should start with no choices');
 const firstOptions=await page.locator('.option-row').evaluateAll(rows=>rows.map(row=>row.querySelector('button')?.textContent?.trim()));
 assert.ok(firstOptions.every(Boolean),'each configuration group has a selectable option');
 await noOverflow();
 return firstOptions;
};
try {
 const homeSizes=[{width:360,height:640},{width:375,height:667},{width:390,height:844},{width:430,height:932}];
 for(const size of homeSizes){
  await page.setViewportSize(size);await route('/');
  await page.getByRole('heading',{name:'今天，想拍点什么？',exact:true}).waitFor();
  await assertPrimaryNavigation('mobile','首页');
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
 await screenshot('home-mobile');
 await page.locator('.home-choice[href="#/hall"]').click();
 await page.locator('main[data-route="/hall"]').waitFor();
 assert.equal(await page.locator('.preview-slide').count(),9);
 await assertBusinessFolds('hall');
 await assertAspect(page.locator('.slide-media'),16/9,'theme covers must be 16:9');
 const covers=page.locator('.preview-slide .slide-media img');
 assert.equal(await covers.count(),9);
 const coverSources=await covers.evaluateAll(images=>images.map(image=>image.src));
 assert.equal(new Set(coverSources).size,9,'each hall theme should have its own image URL');
 const coverDimensions=await loadImages(covers);
 assert.ok(coverDimensions.every(image=>Math.max(image.width,image.height)>=800&&Math.min(image.width,image.height)>=450),`theme images should have high resolution: ${JSON.stringify(coverDimensions)}`);
 const pixels=await covers.evaluateAll(images=>images.map(image=>{const canvas=document.createElement('canvas');canvas.width=64;canvas.height=36;const context=canvas.getContext('2d');context.drawImage(image,0,0,64,36);return Array.from(context.getImageData(0,0,64,36).data);}));
 const fingerprints=pixels.map(data=>createHash('sha256').update(Uint8Array.from(data)).digest('hex'));
 assert.equal(new Set(fingerprints).size,9,'theme images should contain distinct decoded pixels');
 assert.equal(await page.locator('.carousel-count').textContent(),'1 / 9');
 await page.getByRole('button',{name:'下一个主题',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.carousel-count').textContent==='2 / 9');
 await page.locator('.experience-carousel').focus();await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('.carousel-count').textContent==='3 / 9');
 await page.locator('.experience-carousel').evaluate(e=>e.scrollTo({left:0,behavior:'instant'}));
 await page.waitForFunction(()=>document.querySelector('.carousel-count').textContent==='1 / 9');
 await page.waitForFunction(()=>document.querySelector('.experience-carousel').scrollLeft<1);
 const touchBox=await page.locator('.preview-slide .slide-media').first().boundingBox();
 const touchY=Math.round(touchBox.y+touchBox.height/2);
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:touchY}]});
 for(let x=280;x>=70;x-=30){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:touchY}]});await new Promise(r=>setTimeout(r,20));}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForFunction(()=>document.querySelector('.experience-carousel').scrollLeft>180);
 await page.waitForFunction(()=>{const e=document.querySelector('.experience-carousel');const width=e.firstElementChild.getBoundingClientRect().width+12;return Math.abs(e.scrollLeft-Math.round(e.scrollLeft/width)*width)<1;});
 await cdp.detach();
 await route('/hall');await screenshot('hall-mobile');
 // Every card must enter its own configuration directly, without a theme-description intermediary.
 const themeOptions=[];
 for(const theme of directThemes){
  await route('/hall');
  const card=page.locator(`.preview-slide[data-slide="${theme.id}"]`);
  await card.getByRole('heading',{name:theme.title,exact:true}).waitFor();
  const experience=card.getByRole('link',{name:'立即体验',exact:true});
  assert.equal(await experience.getAttribute('href'),`#${themePath(theme)}`);
  await experience.click();
  themeOptions.push(await assertDirectConfig(theme));
  await page.locator('.back-button').filter({hasText:'返回AI影像馆'}).click();
  await page.locator('main[data-route="/hall"]').waitFor();
 }
 assert.equal(new Set(themeOptions.map(options=>JSON.stringify(options))).size,9,'theme configuration options must differ rather than sharing the belike configuration');
 // Legacy theme and category URLs remain usable, and their CTA skips the former preview.
 for(const theme of directThemes.filter(theme=>theme.id!=='shenzhen-belike')){
  await route(`/theme/${theme.category}/${theme.id.split('-').at(-1)}`);
  await page.getByRole('heading',{name:theme.title,exact:true}).waitFor();
  const experience=page.locator('.scene-cta').filter({hasText:'立即体验'});
  assert.equal(await experience.getAttribute('href'),`#${themePath(theme)}`);
  await experience.click();await assertDirectConfig(theme);
 }
 for(const [category,id] of [['brand','shenzhen-belike'],['event','event-0'],['team','team-0'],['campus','campus-0']]){
  const theme=directThemes.find(theme=>theme.id===id);
  await route(`/experience/${category}`);
  await page.locator('.theme-config').waitFor();
  await page.getByRole('heading',{name:theme.title,exact:true}).waitFor();
  assert.ok(await page.getByText('生成未开放',{exact:true}).isVisible());
  assert.equal(await page.locator('aside.template-info').count(),0);
  await route(`/category/${category}`);
  const experience=page.locator('.scene-cta').filter({hasText:'立即体验'});
  assert.equal(await experience.getAttribute('href'),`#${themePath(theme)}`);
  await experience.click();await assertDirectConfig(theme);
 }
 for(const invalidPath of ['/experience/brand/not-found','/experience/event/brand-0','/experience/person/shenzhen-belike','/experience/not-found']){
  await route(invalidPath);
  await page.getByRole('heading',{name:'暂时没有这个页面',exact:true}).waitFor();
  assert.equal(await page.locator('.theme-config').count(),0,'invalid theme must not fall back to an unrelated configuration');
 }
 // The confirmed belike photo/authorization flow remains local and cannot generate a real task.
 await route(themePath(directThemes[0]));await assertDirectConfig(directThemes[0]);
 const next=page.getByRole('button',{name:/下一步：准备照片/});
 assert.equal(await next.isDisabled(),true);
 for(const x of ['福田CBD','科技研发','调酒师'])await page.getByRole('button',{name:x,exact:true}).click();
 await next.click();
 const photoNext=page.getByRole('button',{name:'下一步：确认信息',exact:true});
 assert.equal(await photoNext.count(),0,'without a photo the confirmation action should explicitly allow skipping');
 assert.ok(await page.getByRole('button',{name:'暂不选照片，确认配置',exact:true}).isEnabled());
 await page.getByLabel('选择照片').setInputFiles('public/images/v4/live-futian.jpg');
 assert.equal(await photoNext.isDisabled(),true);
 await page.getByRole('checkbox',{name:'我确认已获得这张照片的使用授权',exact:true}).check();
 assert.equal(await photoNext.isDisabled(),false);
 await page.getByLabel('选择照片').setInputFiles('public/images/v4/live-longhua.jpg');
 assert.equal(await page.getByRole('checkbox',{name:'我确认已获得这张照片的使用授权',exact:true}).isChecked(),false,'changing the selected photo must require new authorization');
 assert.equal(await photoNext.isDisabled(),true,'a previous photo authorization must not enable the replacement photo');
 await page.getByRole('checkbox',{name:'我确认已获得这张照片的使用授权',exact:true}).check();
 assert.equal(await photoNext.isDisabled(),false);
 await photoNext.click();
 await page.getByRole('heading',{name:'确认你的选择',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'生成暂未开放',exact:true}).isDisabled(),true);
 assert.equal(await page.locator('main h1').textContent(),directThemes[0].title);
 assert.equal(await page.locator('.summary-photo strong').textContent(),'已选择单人照片');
 await page.locator('.summary-photo img').evaluate(image=>image.decode());
 assert.ok(await page.locator('.summary-photo img').evaluate(image=>image.complete&&image.naturalWidth>0),'selected photo should decode in confirmation');
 assert.match(await page.locator('.summary-photo').innerText(),/仅在当前浏览器中临时预览/);
 await noOverflow();
 // A different theme must keep its own title and chosen content through the photo and confirmation steps.
 const campusTheme=directThemes.find(theme=>theme.id==='campus-1');
 await page.goto(`${base}#${themePath(campusTheme)}`);
 await page.getByRole('dialog').getByRole('heading',{name:'更换主题？',exact:true}).waitFor();
 await page.getByRole('button',{name:'更换并清空',exact:true}).click();
 const campusOptions=await assertDirectConfig(campusTheme);
 await screenshot('theme-config-mobile');
 for(const row of await page.locator('.option-row').all())await row.getByRole('button').first().click();
 await page.getByRole('button',{name:/下一步：准备照片/}).click();
 await page.getByLabel('选择照片').setInputFiles('public/images/v4/live-futian.jpg');
 await page.getByRole('checkbox',{name:'我确认已获得这张照片的使用授权',exact:true}).check();
 await page.getByRole('button',{name:'下一步：确认信息',exact:true}).click();
 await page.getByRole('heading',{name:'确认你的选择',exact:true}).waitFor();
 assert.equal(await page.locator('main h1').textContent(),campusTheme.title);
 assert.equal(await page.locator('.summary-photo strong').textContent(),'已选择单人照片');
 await page.locator('.summary-photo img').evaluate(image=>image.decode());
 assert.ok(await page.locator('.summary-photo img').evaluate(image=>image.complete&&image.naturalWidth>0),'campus selected photo should decode in confirmation');
 assert.deepEqual(await page.locator('.summary-list dd').allTextContents(),campusOptions);
 assert.equal(await page.getByRole('button',{name:'生成暂未开放',exact:true}).isDisabled(),true);
 await route('/bespoke');
 assert.equal(await page.locator('.preview-slide').count(),4);
 assert.equal(await page.locator('.sample-pending').count(),4);
 assert.equal(await page.locator('.preview-slide video').count(),0);
 await assertBusinessFolds('bespoke');
 await assertAspect(page.locator('.slide-media'),16/9,'bespoke covers must be 16:9');
 await screenshot('bespoke-mobile');
 await page.locator('.preview-slide').first().getByRole('link',{name:'了解创作',exact:true}).click();
 await page.getByRole('heading',{name:'人物故事',exact:true}).waitFor();
 await page.getByRole('link',{name:'整理定制需求',exact:true}).click();
 assert.equal(await page.locator('select[name="direction"]').inputValue(),'人物故事');
 await page.locator('textarea[name="description"]').fill('用于改版验收的需求摘要测试。');
 await page.locator('input[name="name"]').fill('演示访客');
 await page.locator('input[name="contact"]').fill('示意联系方式');
 await page.getByRole('button',{name:'整理需求摘要',exact:true}).click();
 assert.match(await page.getByLabel('需求摘要',{exact:true}).inputValue(),/尚未发送/);
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 assert.equal(await page.evaluate(()=>localStorage.length),0);
 await route('/works');assert.equal(await page.locator('.work-card').count(),6);
 await page.getByRole('button',{name:'加载更多',exact:true}).click();assert.equal(await page.locator('.work-card').count(),8);
 await assertWorkGrid();await screenshot('works-grid-mobile');
 await page.getByRole('button',{name:'高定AI影像',exact:true}).click();assert.equal(await page.locator('.work-card').count(),4);
 await page.getByLabel('作品分类',{exact:true}).selectOption('family');assert.equal(await page.locator('.work-card').count(),1);
 await page.locator('.work-card').click();await page.getByRole('dialog').waitFor();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'已发布作品',exact:true}).click();await page.getByRole('heading',{name:'真实作品待上架',exact:true}).waitFor();
 for(const id of ['brand','event','team','campus','person','family','enterprise','city']){
  await route(`/category/${id}`);assert.equal(await page.locator('.simple-fold[open]').count(),0);
  assert.equal(await page.getByText(/^(体验链路|创作链路)$/).count(),0);
  await page.locator('.simple-fold summary').filter({hasText:'产品亮点和优势'}).click();
  assert.equal(await page.locator('.scene-advantages>div').count(),4);await loadImages(page.locator('.detail-cover img'));await noOverflow();
 }
 await route('/category/city');
 assert.match(await page.locator('.detail-cover img').getAttribute('src'),/guangdang-v2\/city-1920\.webp$/);
 assert.equal(await page.locator('.history-disclosure,.history-photo').count(),0,'historical gallery should be removed from page references');
 assert.equal(await page.locator('main img[src*="dongmen-history"], main img[srcset*="dongmen-history"]').count(),0);
 await screenshot('city-mobile');
 for(const business of ['hall','bespoke']){await route(`/scenes/${business}`);await assertBusinessFolds(business);assert.equal(await page.locator('.simple-scene-card').count(),0,'legacy scene URL should return to its business page');}
 await route('/category/event');await screenshot('event-mobile');
 await route('/category/not-found');await page.getByRole('heading',{name:'暂时没有这个页面',exact:true}).waitFor();
 for(const width of [360,375,390,430,768,1440]){
  await page.setViewportSize({width,height:width>700?1000:844});
  for(const path of ['/','/hall','/bespoke','/scenes/hall','/scenes/bespoke','/category/city','/works','/cooperate','/mine']){await route(path);await noOverflow();}
  await route('/hall');await assertAspect(page.locator('.slide-media'),16/9,`theme covers at ${width}px`);
  await route('/works');await page.getByRole('button',{name:'加载更多',exact:true}).click();await assertWorkGrid();
 }
 await page.setViewportSize({width:1440,height:1000});await route('/');await screenshot('home-desktop');
 const desktopNavigation=await assertPrimaryNavigation('desktop','首页');
 await desktopNavigation.getByRole('link',{name:'我',exact:true}).click();
 await page.locator('main[data-route="/mine"]').waitFor();
 await page.getByRole('heading',{name:'我的',exact:true}).waitFor();
 await assertPrimaryNavigation('desktop','我');
 assert.equal(await page.locator('.mine-item').count(),2,'existing pending account functions should remain visible');
 assert.equal(await page.locator('.mine-item').getByText('暂未开放',{exact:true}).count(),2);
 await page.getByRole('button',{name:'返回首页',exact:true}).click();
 await page.locator('main[data-route="/"]').waitFor();
 await assertPrimaryNavigation('desktop','首页');
 await route('/works');await screenshot('works-grid-desktop');
 await page.setViewportSize({width:390,height:844});
 await page.route('**/images/guangdang-v2/person-*.webp',r=>r.abort());await route('/category/person');
 await page.getByRole('img',{name:/图片暂时无法加载/}).waitFor();
 assert.deepEqual(errors,[],'browser errors');assert.deepEqual(broken,[],'broken assets');assert.deepEqual(historicalRequests,[],'no historical photo should be requested by any page');
 console.log(JSON.stringify({result:'PASS',singleScreenHome:homeSizes,viewports:[360,375,390,430,768,1440],uniqueThemeImages:{urls:new Set(coverSources).size,pixels:new Set(fingerprints).size},directThemeConfigurations:directThemes.length,distinctThemeOptions:new Set(themeOptions.map(options=>JSON.stringify(options))).size,flows:['首页一屏双入口、桌面和手机四项主导航含我','桌面我入口、高亮和返回首页','轮播16:9、触屏横滑、按钮和键盘切换','九卡立即进入各自配置','旧主题与分类入口兼容、非法配置404','生成未开放且最终按钮禁用','简介保留原三条文案、优势四组独立说明且默认折叠','旧场景链接返回业务页','高定样品待上架','本机照片与授权校验','需求摘要未发送','作品4:3等高网格、筛选、分页与空态','八类优势按需展开','城市图恢复且历史资料请求为零','无效链接和图片降级'],browserErrors:errors,brokenAssets:broken,historicalRequests}));
} finally {await browser.close();server?.kill('SIGTERM');}
