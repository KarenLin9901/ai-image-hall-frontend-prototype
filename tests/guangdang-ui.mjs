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
const businessApplications={
 hall:[['brand','品牌推广与主题传播'],['event','活动互动与用户体验'],['team','企业文化与员工关怀'],['campus','校园与社群纪念']],
 bespoke:[['person','人物故事'],['family','家庭记忆'],['enterprise','企业故事'],['city','城市与历史']],
};
const assertBusinessSections=async business=>{
 const tabs=page.getByRole('tab');
 assert.deepEqual(await tabs.allTextContents(),['产品体验','产品介绍','商业应用'],'each service has the same three user-facing sections');
 assert.equal(await page.getByRole('tab',{name:'产品体验',exact:true}).getAttribute('aria-selected'),'true');
 assert.equal(await page.getByRole('tabpanel').count(),1,'only the active section should be presented');
 const activeTab=page.getByRole('tab',{name:'产品体验',exact:true});
 assert.equal(await activeTab.getAttribute('aria-controls'),await page.getByRole('tabpanel').getAttribute('id'));
 assert.equal(await page.getByRole('tabpanel').getAttribute('aria-labelledby'),await activeTab.getAttribute('id'));
 assert.equal(await page.locator('.business-secondary').count(),0,'the former two-fold structure is replaced by three clear parts');
 await page.getByRole('tab',{name:'产品介绍',exact:true}).click();
 await page.waitForFunction(b=>window.location.hash===`#/${b}?section=introduction`,business);
 await page.getByRole('tab',{name:'产品介绍',exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
 assert.equal(await page.getByRole('tab',{name:'产品介绍',exact:true}).getAttribute('aria-selected'),'true');
 const introduction=page.getByRole('tabpanel');
 assert.ok((await introduction.innerText()).trim().length>50,'product introduction should explain the actual product');
 assert.equal(await introduction.locator('.product-features .feature-card').count(),3,'each product should express its three main features');
 assert.equal(await introduction.locator('details').count(),0,'the selected introduction should be readable directly');
 await page.getByRole('tab',{name:'商业应用',exact:true}).click();
 await page.waitForFunction(b=>window.location.hash===`#/${b}?section=applications`,business);
 await page.getByRole('tab',{name:'商业应用',exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
 const applications=page.getByRole('tabpanel').locator('a.application-card');
 assert.equal(await applications.count(),4,'each service needs four distinct commercial applications');
 assert.deepEqual(await applications.evaluateAll(links=>links.map(link=>link.getAttribute('href'))),businessApplications[business].map(([id])=>`#/category/${id}`));
 for(const [id,title] of businessApplications[business]){
  const card=applications.filter({hasText:title});
  assert.equal(await card.count(),1,`${business} needs the application ${title}`);
  assert.ok((await card.innerText()).trim().length>title.length,'an application card should give a useful reason to open it');
 }
 // The same controls work without touch: the selected tab and its content follow focus.
 await page.getByRole('tab',{name:'商业应用',exact:true}).focus();
 await page.keyboard.press('Home');
 await page.getByRole('tab',{name:'产品体验',exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
 assert.equal(await page.getByRole('tab',{name:'产品体验',exact:true}).getAttribute('aria-selected'),'true');
 await page.keyboard.press('ArrowRight');
 await page.getByRole('tab',{name:'产品介绍',exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
 assert.equal(await page.getByRole('tab',{name:'产品介绍',exact:true}).getAttribute('aria-selected'),'true');
 await page.keyboard.press('End');
 await page.getByRole('tab',{name:'商业应用',exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
 assert.equal(await page.getByRole('tab',{name:'商业应用',exact:true}).getAttribute('aria-selected'),'true');
 await page.keyboard.press('ArrowRight');
 await page.getByRole('tab',{name:'产品体验',exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
 assert.equal(await page.getByRole('tab',{name:'产品体验',exact:true}).getAttribute('aria-selected'),'true');
 await page.keyboard.press('ArrowLeft');
 await page.getByRole('tab',{name:'商业应用',exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
 await page.keyboard.press('Home');
 await page.getByRole('tab',{name:'产品体验',exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
 await noOverflow();
};
const nativeSectionHistory=[];
const assertNativeSectionHistory=async business=>{
 const waitSection=async section=>{
  await page.waitForFunction(({business,section})=>window.location.hash===`#/${business}?section=${section}`,{business,section});
  const labels={experience:'产品体验',introduction:'产品介绍',applications:'商业应用'};
  await page.getByRole('tab',{name:labels[section],exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 };
 const scrollPart=async amount=>{
  await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),amount);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const top=await page.evaluate(()=>window.scrollY);
  assert.ok(top>0,`${business}: test must actually scroll the section`);
  return top;
 };
 const restored=async(section,top,method)=>{
  await waitSection(section);
  await page.waitForFunction(expected=>Math.abs(window.scrollY-expected)<=2,top);
  nativeSectionHistory.push({business,section,method,scrollY:await page.evaluate(()=>window.scrollY)});
 };
 await route('/'+business+'?section=experience');
 const experience=await scrollPart(360);
 await page.getByRole('tab',{name:'产品介绍',exact:true}).click();await waitSection('introduction');
 const introduction=await scrollPart(140);
 await page.getByRole('tab',{name:'商业应用',exact:true}).click();await waitSection('applications');
 const applications=await scrollPart(300);
 await page.goBack();await restored('introduction',introduction,'Back');
 await page.goBack();await restored('experience',experience,'Back');
 await page.goForward();await restored('introduction',introduction,'Forward');
 await page.goForward();await restored('applications',applications,'Forward');
 if(business==='hall'){
  await page.getByRole('navigation',{name:'底部导航',exact:true}).getByRole('link',{name:'主题体验',exact:true}).click();
  await waitSection('experience');
  assert.equal(await page.locator('a.theme-card').count(),9,'the primary theme navigation should open experience even after browsing business applications');
 }
 await route('/'+business+'?section=experience');
};
const assertPrimaryNavigation=async(kind,active)=>{
 const navigation=page.getByRole('navigation',{name:kind==='mobile'?'底部导航':'主导航',exact:true});
 assert.ok(await navigation.isVisible());
 assert.deepEqual(await navigation.getByRole('link').allTextContents(),['首页','主题体验','商务合作','我']);
 assert.deepEqual(await navigation.getByRole('link').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),['#/','#/hall?section=experience','#/cooperate','#/mine']);
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
 assert.equal(await page.locator('a.theme-card').count(),9);
 await assertBusinessSections('hall');
 await assertAspect(page.locator('.theme-card-media'),16/9,'theme covers must be 16:9');
 const covers=page.locator('a.theme-card img');
 assert.equal(await covers.count(),9);
 const coverSources=await covers.evaluateAll(images=>images.map(image=>image.src));
 assert.equal(new Set(coverSources).size,9,'each hall theme should have its own image URL');
 const coverDimensions=await loadImages(covers);
 assert.ok(coverDimensions.every(image=>Math.max(image.width,image.height)>=800&&Math.min(image.width,image.height)>=450),`theme images should have high resolution: ${JSON.stringify(coverDimensions)}`);
 const pixels=await covers.evaluateAll(images=>images.map(image=>{const canvas=document.createElement('canvas');canvas.width=64;canvas.height=36;const context=canvas.getContext('2d');context.drawImage(image,0,0,64,36);return Array.from(context.getImageData(0,0,64,36).data);}));
 const fingerprints=pixels.map(data=>createHash('sha256').update(Uint8Array.from(data)).digest('hex'));
 assert.equal(new Set(fingerprints).size,9,'theme images should contain distinct decoded pixels');
 const filters=page.locator('.experience-filters');
 assert.deepEqual(await filters.getByRole('button').allTextContents(),['全部主题','城市品牌','活动节庆','职场团队','校园青春']);
 for(const [label,count] of [['城市品牌',3],['活动节庆',2],['职场团队',2],['校园青春',2],['全部主题',9]]){
  await filters.getByRole('button',{name:label,exact:true}).click();
  assert.equal(await page.locator('a.theme-card').count(),count,`${label} should show its own themes`);
 }
 await assertNativeSectionHistory('hall');
 await screenshot('hall-mobile');
 // Every card must enter its own configuration directly, without a theme-description intermediary.
 const themeOptions=[];
 for(const theme of directThemes){
  await route('/hall');
  const card=page.locator(`a.theme-card[data-theme="${theme.id}"]`);
  await card.getByRole('heading',{name:theme.title,exact:true}).waitFor();
  const experience=page.getByRole('link',{name:'使用主题：'+theme.title,exact:true});
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
 assert.match(await page.locator('.summary-photo').innerText(),/本机|浏览器|临时/);
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
 assert.equal(await page.locator('article.sample-card').count(),4);
 assert.equal(await page.locator('.sample-status').count(),4);
 assert.equal(await page.locator('.sample-grid video').count(),0,'unconfirmed samples must not simulate playable video');
 await assertBusinessSections('bespoke');
 await assertAspect(page.locator('.sample-card-media'),16/9,'bespoke covers must be 16:9');
 await assertNativeSectionHistory('bespoke');
 await screenshot('bespoke-mobile');
 const customize=page.locator('article.sample-card').first().getByRole('link',{name:'定制这一类',exact:true});
 assert.equal(await customize.getAttribute('href'),'#/cooperate?direction=person');
 await customize.click();
 assert.equal(await page.locator('select[name="direction"]').inputValue(),'人物故事');
 await page.locator('textarea[name="description"]').fill('用于改版验收的需求摘要测试。');
 await page.locator('input[name="name"]').fill('演示访客');
 await page.locator('input[name="contact"]').fill('示意联系方式');
 await page.getByRole('button',{name:'整理需求摘要',exact:true}).click();
 assert.match(await page.getByLabel('需求摘要',{exact:true}).inputValue(),/尚未发送/);
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 assert.equal(await page.evaluate(()=>localStorage.length),0);
 await route('/works');assert.equal(await page.locator('.work-card').count(),6);
 assert.deepEqual(await page.locator('.gallery-controls .segmented button').allTextContents(),['主题灵感','真实作品']);
 assert.equal(await page.locator('.gallery-controls .muted').textContent(),'主题参考图，非生成作品');
 await page.getByRole('button',{name:'加载更多',exact:true}).click();assert.equal(await page.locator('.work-card').count(),8);
 await assertWorkGrid();await screenshot('works-grid-mobile');
 await page.getByRole('button',{name:'高定AI影像',exact:true}).click();assert.equal(await page.locator('.work-card').count(),4);
 await page.getByLabel('作品分类',{exact:true}).selectOption('family');assert.equal(await page.locator('.work-card').count(),1);
 await page.locator('.work-card').click();await page.getByRole('dialog',{name:'主题参考',exact:true}).waitFor();
 assert.equal(await page.getByRole('dialog').locator('p.muted').textContent(),'主题参考图，非客户案例或生成成片。');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'真实作品',exact:true}).click();await page.getByRole('heading',{name:'真实作品待上架',exact:true}).waitFor();
 for(const [business,applications] of Object.entries(businessApplications))for(const [id,title] of applications){
  await route(`/category/${id}`);
  await page.getByRole('heading',{name:title,exact:true}).waitFor();
  for(const text of ['应用场景','可拓展方向'])assert.ok(await page.getByRole('heading',{name:text,exact:true}).isVisible(),`${id} should explain ${text}`);
  assert.ok((await page.locator('.application-audience').innerText()).trim().length>3,`${id} identifies the customer`);
  assert.ok((await page.locator('.application-value').innerText()).trim().length>10,`${id} identifies the commercial value`);
  assert.equal(await page.getByText(/^(体验链路|创作链路)$/).count(),0);
  if(business==='hall'){
   const related=page.locator('a[href^="#/experience/"]');
   const ids=directThemes.filter(theme=>theme.category===id).map(theme=>theme.id);
   for(const themeId of ids)assert.ok(await related.evaluateAll((links,id)=>links.some(link=>link.getAttribute('href').endsWith('/'+id)),themeId),`${id} needs its own direct theme ${themeId}`);
  }else assert.equal(await page.getByRole('link',{name:'整理定制需求',exact:true}).getAttribute('href'),`#/cooperate?direction=${id}`);
  const benefits=page.locator('.application-benefits');
  assert.equal(await benefits.getAttribute('open'),null,'category benefits remain available on demand');
  await benefits.locator('summary').click();
  assert.equal(await benefits.locator('h3').count(),4,'each category retains its four product benefits');
  await benefits.locator('summary').click();
  await loadImages(page.locator('.detail-cover img'));await noOverflow();
 }
 await route('/category/city');
 assert.match(await page.locator('.detail-cover img').getAttribute('src'),/guangdang-v2\/city-1920\.webp$/);
 assert.equal(await page.locator('.history-disclosure,.history-photo').count(),0,'historical gallery should be removed from page references');
 assert.equal(await page.locator('main img[src*="dongmen-history"], main img[srcset*="dongmen-history"]').count(),0);
 await screenshot('city-mobile');
 for(const business of ['hall','bespoke']){await route(`/scenes/${business}`);assert.deepEqual(await page.getByRole('tab').allTextContents(),['产品体验','产品介绍','商业应用']);assert.equal(await page.locator('.simple-scene-card').count(),0,'legacy scene URL should return to its business page');}
 await route('/category/event');await screenshot('event-mobile');
 await route('/category/not-found');await page.getByRole('heading',{name:'暂时没有这个页面',exact:true}).waitFor();
 for(const width of [360,375,390,430,768,1440]){
  await page.setViewportSize({width,height:width>700?1000:844});
  for(const path of ['/','/hall','/bespoke','/scenes/hall','/scenes/bespoke','/category/city','/works','/cooperate','/mine']){await route(path);await noOverflow();}
  await route('/hall?section=experience');await assertAspect(page.locator('.theme-card-media'),16/9,`theme covers at ${width}px`);
  await route('/works');await page.getByRole('button',{name:'加载更多',exact:true}).click();await assertWorkGrid();
 }
 await page.setViewportSize({width:1440,height:1000});await route('/');await screenshot('home-desktop');
 const desktopNavigation=await assertPrimaryNavigation('desktop','首页');
 await desktopNavigation.getByRole('link',{name:'我',exact:true}).click();
 await page.locator('main[data-route="/mine"]').waitFor();
 await page.getByRole('heading',{name:'我的',exact:true}).waitFor();
 await assertPrimaryNavigation('desktop','我');
 assert.equal(await page.locator('.profile-card p').textContent(),'账户待开放');
 assert.equal(await page.locator('.mine-item').count(),2,'existing pending account functions should remain visible');
 assert.equal(await page.locator('.mine-item').getByText('暂未开放',{exact:true}).count(),2);
 await page.getByRole('button',{name:'返回首页',exact:true}).click();
 await page.locator('main[data-route="/"]').waitFor();
 await assertPrimaryNavigation('desktop','首页');
 await route('/hall?section=applications');
 await page.getByRole('tab',{name:'商业应用',exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
 await page.getByRole('navigation',{name:'主导航',exact:true}).getByRole('link',{name:'主题体验',exact:true}).click();
 await page.getByRole('tab',{name:'产品体验',exact:true}).and(page.locator('[aria-selected="true"]')).waitFor();
 assert.equal(await page.locator('a.theme-card').count(),9,'desktop primary theme navigation should open experience directly');
 await route('/works');await screenshot('works-grid-desktop');
 await page.setViewportSize({width:390,height:844});
 await page.route('**/images/guangdang-v2/person-*.webp',r=>r.abort());await route('/category/person');
 await page.getByRole('img',{name:/图片暂时无法加载/}).waitFor();
 assert.deepEqual(errors,[],'browser errors');assert.deepEqual(broken,[],'broken assets');assert.deepEqual(historicalRequests,[],'no historical photo should be requested by any page');
 console.log(JSON.stringify({result:'PASS',singleScreenHome:homeSizes,viewports:[360,375,390,430,768,1440],uniqueThemeImages:{urls:new Set(coverSources).size,pixels:new Set(fingerprints).size},directThemeConfigurations:directThemes.length,distinctThemeOptions:new Set(themeOptions.map(options=>JSON.stringify(options))).size,nativeSectionHistory,flows:['首页一屏双入口、桌面和手机四项主导航含我','桌面我入口、高亮和返回首页','三部分tab触摸和键盘切换、URL同步、浏览器后退前进恢复分区滚动、9主题筛选和16:9封面','九卡立即进入各自配置','旧主题与分类入口兼容、非法配置404','生成未开放且最终按钮禁用','双产品介绍定位与三项特性、商业四类直达详情','旧场景链接返回业务页','高定样品待上架','本机照片与授权校验','需求摘要未发送','作品4:3等高网格、筛选、分页与空态','八类客户场景价值拓展与主题/需求直达','城市图恢复且历史资料请求为零','无效链接和图片降级'],browserErrors:errors,brokenAssets:broken,historicalRequests}));
} finally {await browser.close();server?.kill('SIGTERM');}
