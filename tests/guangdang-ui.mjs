import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:4188/ai-image-hall-frontend-prototype/';
const server=process.env.PREVIEW_URL?null:spawn('npm',['exec','vite','preview','--','--host','127.0.0.1','--port','4188','--strictPort'],{stdio:'ignore'});
const applications={hall:[['brand','品牌推广与主题传播'],['event','活动互动与用户体验'],['team','企业文化与员工关怀'],['campus','校园与社群纪念']],bespoke:[['person','人物故事'],['family','家庭记忆'],['enterprise','企业故事'],['city','城市与历史']]};
const themes=[
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
const report={base,status:'running',checks:[],anchors:[],waterfalls:[],errors:[],brokenAssets:[],historicalRequests:[],mutationRequests:[]};
let browser,page;
await mkdir('outputs',{recursive:true});
try{
 let ready=false;
 for(let i=0;i<60;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,150));}
 assert.ok(ready,'preview should become available');
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 page.setDefaultTimeout(12000);await page.emulateMedia({reducedMotion:'reduce'});
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('request',r=>{if(r.url().includes('/images/dongmen-history/'))report.historicalRequests.push(r.url());if(!['GET','HEAD'].includes(r.method()))report.mutationRequests.push({method:r.method(),url:r.url()});});
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)report.brokenAssets.push(`${r.status()} ${r.url()}`);});
 const frames=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const waitRoute=async path=>{await page.locator(`main[data-route="${path}"]`).waitFor();await frames();};
 const route=async path=>{await page.goto(`${base}#${path}`);await waitRoute(path.split('?')[0].replace(/^\/scenes\/(hall|bespoke)$/,'/$1'));};
 const noOverflow=async label=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${label}: horizontal overflow`);
 const loadImages=async locator=>{
  await locator.evaluateAll(async images=>Promise.all(images.map(async image=>{image.loading='eager';await image.decode();})));
  const sizes=await locator.evaluateAll(images=>images.map(image=>({src:image.currentSrc||image.src,width:image.naturalWidth,height:image.naturalHeight})));
  assert.ok(sizes.every(image=>image.width>0&&image.height>0),'requested images should decode');return sizes;
 };
 const screenshot=async name=>{await loadImages(page.locator('main img'));await page.screenshot({path:`outputs/document3-${name}.png`});};
 const assertCooperationLink=async(locator,expected)=>{
  const href=await locator.getAttribute('href');assert.ok(href?.startsWith('#/cooperate?'));
  const parsed=new URL(href.slice(1),'https://prototype.invalid');assert.equal(parsed.pathname,'/cooperate');
  for(const [key,value] of Object.entries(expected))assert.equal(parsed.searchParams.get(key),value,`cooperation link carries ${key}`);
  assert.doesNotMatch(decodeURIComponent(href),/blob:|data:image/);return href;
 };
 const assertNavigation=async(kind,active)=>{
  const nav=page.getByRole('navigation',{name:kind==='mobile'?'底部导航':'主导航',exact:true});assert.ok(await nav.isVisible());
  assert.deepEqual(await nav.getByRole('link').allTextContents(),['首页','案例分享','商务合作','我']);
  assert.deepEqual(await nav.getByRole('link').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),['#/','#/works','#/cooperate','#/mine']);
  assert.deepEqual(await nav.locator('a.active').allTextContents(),[active]);return nav;
 };
 const assertEditorial=async business=>{
  await route('/'+business);const article=page.locator('.editorial-product');assert.equal(await article.getAttribute('data-business'),business);
  assert.equal(await page.getByRole('tab').count(),0,'section navigation should scroll one continuous product page');
  assert.equal(await page.getByRole('tabpanel').count(),0);
  const index=page.getByRole('navigation',{name:'产品内容导航',exact:true});
  assert.deepEqual(await index.getByRole('button').allTextContents(),['产品简介','特点优势','场景启发','立即体验']);
  const parts=await article.locator(':scope > section').evaluateAll(nodes=>nodes.map(node=>node.id));
  assert.deepEqual(parts,[business+'-overview',business+'-benefits',business+'-scenes',business+'-try']);
  assert.ok((await article.locator('.editorial-overview').innerText()).length>50);
  assert.equal(await article.locator('.benefit-grid > article').count(),3);
  for(const benefit of await article.locator('.benefit-grid > article').all()){
   assert.ok((await benefit.locator('h3').innerText()).length>1);
   assert.ok((await benefit.locator('.benefit-need').innerText()).length>5);
   assert.deepEqual(await benefit.locator('dt').allTextContents(),['解决方式','产品优势']);
   assert.ok((await benefit.locator('dd').allTextContents()).every(text=>text.trim().length>10));
  }
  const cooperation=article.locator('details.editorial-project-details');assert.equal(await cooperation.getAttribute('open'),null);
  await cooperation.locator('summary').click();
  assert.equal(await cooperation.locator('.feature-card').count(),4);assert.equal(await cooperation.locator('.workflow-list li').count(),4);
  assert.ok((await cooperation.locator('ul li').count())>=3);await cooperation.locator('summary').click();
  assert.deepEqual(await article.locator('a.scenario-card').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),applications[business].map(([id])=>'#/category/'+id));
  assert.deepEqual(await article.locator('.scenario-card h3').allTextContents(),applications[business].map(([,title])=>title));
  for(const [id,label] of [['overview','产品简介'],['benefits','特点优势'],['scenes','场景启发'],['try','立即体验']]){
   const before=await page.url();await index.getByRole('button',{name:label,exact:true}).click();
   await page.waitForFunction(target=>document.activeElement?.id===target,business+'-'+id);await frames();
   const geometry=await page.locator('#'+business+'-'+id).evaluate(el=>({top:el.getBoundingClientRect().top,headingBottom:el.querySelector('h2').getBoundingClientRect().bottom,headerBottom:document.querySelector('.topbar').getBoundingClientRect().bottom,navTop:document.querySelector('.mobile-nav').getBoundingClientRect().top,scrollY}));
   assert.equal(await page.url(),before,'section anchors should not change the route or act as tabs');
   assert.ok(geometry.top>=geometry.headerBottom-1,`${business} ${label}: section hidden by header`);
   assert.ok(geometry.headingBottom<geometry.navTop,`${business} ${label}: target heading must be readable`);
   report.anchors.push({business,label,...geometry});
  }
  const experience=article.locator('.editorial-experience').getByRole('link',{name:'立即体验',exact:true});
  assert.equal(await experience.getAttribute('href'),'#/samples/'+business);
  await assertCooperationLink(article.getByRole('link',{name:'整理合作需求',exact:true}),{product:business,source:'product',section:'introduction'});
  await noOverflow(business);await screenshot(business+'-editorial');
  await experience.click();await waitRoute('/samples/'+business);
  assert.equal(await page.locator('.samples-pending').count(),1);await page.getByRole('heading',{name:'样片制作中',exact:true}).waitFor();
  assert.equal(await page.locator('video,.media-player').count(),0,'unpublished samples must not expose a fake playable case');
  assert.equal(await page.locator('.sample-card').count(),0);
  await assertCooperationLink(page.getByRole('link',{name:'整理合作需求',exact:true}),{product:business,source:'samples'});
  if(business==='hall')assert.equal(await page.locator('.legacy-theme-library').getAttribute('open'),null,'legacy configuration stays secondary until explicitly opened');
  else assert.equal(await page.locator('.legacy-theme-library').count(),0);
  await screenshot(business+'-samples');
 };
 const assertWaterfall=async label=>{
  await loadImages(page.locator('.work-image img'));
  const css=await page.locator('.case-waterfall').evaluate(el=>({display:getComputedStyle(el).display,columns:Number(getComputedStyle(el).columnCount)}));
  assert.notEqual(css.display,'grid','case sharing should be a real column waterfall');assert.ok(css.columns>=2,`${label}: waterfall needs at least two columns`);
  const images=await page.locator('.work-image img').evaluateAll(nodes=>nodes.map(image=>({natural:image.naturalWidth/image.naturalHeight,display:image.getBoundingClientRect().width/image.getBoundingClientRect().height})));
  for(const image of images)assert.ok(Math.abs(image.natural-image.display)<.03,`${label}: image should preserve its original ratio`);
  const boxes=await page.locator('.work-card').evaluateAll(cards=>cards.map(card=>{const r=card.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
  const columns=new Map();for(const box of boxes){const key=Math.round(box.x);const column=columns.get(key)||[];column.push(box);columns.set(key,column);}
  assert.ok(columns.size>=2);for(const column of columns.values())for(let i=1;i<column.length;i++)assert.ok(column[i].y>=column[i-1].y+column[i-1].height-1,'waterfall cards must not overlap');
  report.waterfalls.push({label,...css,cards:boxes.length});await noOverflow(label);
 };
 const assertConfig=async(theme,expectedRoute=themePath(theme))=>{
  await waitRoute(expectedRoute);await page.getByRole('heading',{name:theme.title,exact:true,level:1}).waitFor();
  assert.equal(await page.locator('.option-row').count(),3);assert.ok(await page.getByText('生成未开放',{exact:true}).isVisible());
  assert.equal(await page.getByRole('button',{name:'下一步：准备照片',exact:true}).isDisabled(),true);
  const options=await page.locator('.option-row').evaluateAll(rows=>rows.map(row=>row.querySelector('button').textContent.trim()));
  await noOverflow(theme.id);return options;
 };

 const homeSizes=[{width:360,height:640},{width:375,height:667},{width:390,height:844},{width:430,height:932}];
 for(const size of homeSizes){
  await page.setViewportSize(size);await route('/');await page.getByRole('heading',{name:'你想如何创作一部AI影像？',exact:true}).waitFor();
  await assertNavigation('mobile','首页');assert.equal(await page.locator('.home-choice').count(),2);
  assert.equal(await page.locator('.home-question > p').first().textContent(),'属于你的AI片场');assert.equal(await page.locator('.home-service-note').textContent(),'互动生成，还是专属创作？选择适合你的影像服务。');assert.equal(await page.locator('.home-question h1').textContent(),'你想如何创作一部AI影像？');
  assert.deepEqual(await page.locator('.home-choice-action').allTextContents(),['模板化互动影像产品','精品AI影像创作服务']);
  const layout=await page.evaluate(()=>({height:innerHeight,scroll:document.documentElement.scrollHeight,navTop:document.querySelector('.mobile-nav').getBoundingClientRect().top,lastBottom:document.querySelector('.home-choice:last-child').getBoundingClientRect().bottom}));
  assert.ok(layout.scroll<=layout.height+1,`home should fit one screen: ${JSON.stringify({size,...layout})}`);assert.ok(layout.lastBottom<=layout.navTop);await noOverflow('home');
 }
 await page.setViewportSize({width:390,height:844});await route('/');
 assert.ok(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor.match(/\d+/g).slice(0,3).every(value=>Number(value)<25)),'selected lightfield theme keeps a near-black reading surface');
 assert.equal(await page.getByRole('img',{name:'咣当原品牌Logo',exact:true}).getAttribute('src'),'/ai-image-hall-frontend-prototype/images/brand/guangdang-logo.png');
 assert.equal(await page.getByRole('button',{name:'关于原型',exact:true}).isVisible(),false);await screenshot('home-mobile');
 for(const business of ['hall','bespoke'])await assertEditorial(business);
 report.checks.push('one-screen home and four navigation destinations; both illustrated product pages present introduction, three benefits, four scenarios, four scrolling anchors, and pending samples');

 await route('/samples/hall?preview=themes');assert.notEqual(await page.locator('.legacy-theme-library').getAttribute('open'),null);
 await page.locator('.experience-filters').getByRole('button',{name:'全部主题',exact:true}).click();
 const covers=page.locator('a.theme-card img');assert.equal(await covers.count(),9);
 const sources=await covers.evaluateAll(images=>images.map(image=>image.src));assert.equal(new Set(sources).size,9);
 const dimensions=await loadImages(covers);assert.ok(dimensions.every(image=>Math.max(image.width,image.height)>=800&&Math.min(image.width,image.height)>=450));
 const pixels=await covers.evaluateAll(images=>images.map(image=>{const canvas=document.createElement('canvas');canvas.width=64;canvas.height=36;const context=canvas.getContext('2d');context.drawImage(image,0,0,64,36);return Array.from(context.getImageData(0,0,64,36).data);}));
 assert.equal(new Set(pixels.map(data=>createHash('sha256').update(Uint8Array.from(data)).digest('hex'))).size,9);
 for(const [label,count] of [['城市品牌',3],['活动节庆',2],['职场团队',2],['校园青春',2],['全部主题',9]]){await page.locator('.experience-filters').getByRole('button',{name:label,exact:true}).click();assert.equal(await page.locator('a.theme-card').count(),count);}
 const options=[];
 for(const theme of themes){
  await route('/samples/hall?preview=themes');const card=page.getByRole('link',{name:'使用主题：'+theme.title,exact:true});assert.equal(await card.getAttribute('href'),'#'+themePath(theme));
  await card.click();options.push(await assertConfig(theme));
  await page.getByRole('button',{name:'返回主题配置预览',exact:true}).click();await waitRoute('/samples/hall');assert.notEqual(await page.locator('.legacy-theme-library').getAttribute('open'),null);
 }
 assert.equal(new Set(options.map(x=>JSON.stringify(x))).size,9);
 for(const theme of themes.filter(theme=>theme.id!=='shenzhen-belike')){
  await route(`/theme/${theme.category}/${theme.id.split('-').at(-1)}`);await page.getByRole('heading',{name:theme.title,exact:true,level:1}).waitFor();
  const preview=page.getByRole('link',{name:'预览主题配置',exact:true});assert.equal(await preview.getAttribute('href'),'#'+themePath(theme));await preview.click();await assertConfig(theme);
 }
 for(const [category,id] of [['brand','shenzhen-belike'],['event','event-0'],['team','team-0'],['campus','campus-0']]){await route('/experience/'+category);await assertConfig(themes.find(theme=>theme.id===id),'/experience/'+category);}
 for(const invalid of ['/experience/brand/not-found','/experience/event/brand-0','/experience/person/shenzhen-belike','/experience/not-found','/samples/other']){await route(invalid);await page.getByRole('heading',{name:'暂时没有这个页面',exact:true}).waitFor();assert.equal(await page.locator('.theme-config').count(),0);}
 report.checks.push('nine distinct high-resolution themes and filters remain in the explicitly opened preview; direct and legacy links keep their own configuration; invalid themes never fall back');

 const exampleTitles=[];
 for(const [business,list] of Object.entries(applications))for(const [id,title] of list){
  await route('/category/'+id);await page.getByRole('heading',{name:title,exact:true,level:1}).waitFor();
  await page.locator('.scenario-example').getByRole('heading',{name:'应用示例',exact:true}).waitFor();exampleTitles.push(await page.locator('.scenario-example h3').innerText());
  assert.ok((await page.locator('.scenario-example .application-value').innerText()).length>20);assert.equal(await page.locator('.scenario-production ol li').count(),3);
  for(const step of await page.locator('.scenario-production ol li').all()){assert.ok((await step.locator('h4').innerText()).length>1);assert.ok((await step.locator('p').innerText()).length>10);}
  assert.match(await page.locator('figure.scenario-template figcaption').innerText(),/场景参考图/);await loadImages(page.locator('figure.scenario-template img'));
  assert.equal(await page.getByRole('link',{name:'查看样片',exact:true}).getAttribute('href'),`#/samples/${business}?category=${id}`);
  await assertCooperationLink(page.getByRole('link',{name:'整理合作需求',exact:true}),{product:business,direction:id,source:'application'});
  if(business==='hall'){
   const related=page.locator('details.related-theme-section');assert.equal(await related.getAttribute('open'),null);await related.locator('summary').click();
   const expected=themes.filter(theme=>theme.category===id).map(theme=>'#'+themePath(theme));assert.deepEqual(await related.getByRole('link').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),expected);
  }
  const benefits=page.locator('details.application-benefits');await benefits.locator('summary').click();assert.equal(await benefits.locator('.scene-advantages > div').count(),4);
  assert.equal(await page.locator('.real-case-section').count(),0,'application examples must not be promoted to published customer cases');await noOverflow(id);
 }
 assert.equal(new Set(exampleTitles).size,8,'each commercial category should have its own example');
 report.checks.push('eight distinct application examples include a three-stage process, reference image label, matching sample path, cooperation context, and secondary theme previews');

 for(const business of ['hall','bespoke'])for(const section of ['introduction','applications','experience']){
  await route('/'+business+'?section='+section);assert.equal(await page.locator('.editorial-product').count(),1);assert.equal(await page.getByRole('tab').count(),0);
  if(section!=='introduction')assert.ok(await page.evaluate(()=>scrollY>0),'legacy product query should restore an appropriate place in the long page');
 }
 for(const business of ['hall','bespoke']){await route('/scenes/'+business);assert.equal(await page.locator('.editorial-product').count(),1);}
 for(const width of [360,375,390,430,768,1440]){
  await page.setViewportSize({width,height:width>700?1000:844});
  for(const path of ['/','/hall','/bespoke','/samples/hall','/samples/bespoke','/category/city','/cooperate','/mine']){await route(path);await noOverflow(`${path} ${width}`);}
  await route('/works');await page.getByRole('heading',{name:'案例分享',exact:true}).waitFor();assert.equal(await page.locator('.work-card').count(),6);
  await page.getByRole('button',{name:'加载更多',exact:true}).click();assert.equal(await page.locator('.work-card').count(),8);await assertWaterfall(width+'px');
 }
 await page.setViewportSize({width:390,height:844});await route('/works');
 assert.deepEqual(await page.locator('.gallery-controls .segmented button').allTextContents(),['主题灵感','真实作品']);assert.equal(await page.locator('.gallery-controls .muted').innerText(),'主题参考图，非生成作品');
 await page.getByRole('button',{name:'高定AI影像',exact:true}).click();assert.equal(await page.locator('.work-card').count(),4);
 await page.getByLabel('作品分类',{exact:true}).selectOption('family');assert.equal(await page.locator('.work-card').count(),1);
 await page.locator('.work-card').click();await page.getByRole('dialog',{name:'主题参考',exact:true}).waitFor();assert.equal(await page.getByRole('dialog').locator('p.muted').innerText(),'主题参考图，非客户案例或生成成片。');await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'真实作品',exact:true}).click();await page.getByRole('heading',{name:'真实作品待上架',exact:true}).waitFor();
 await route('/');const mobileNav=await assertNavigation('mobile','首页');await mobileNav.getByRole('link',{name:'案例分享',exact:true}).click();await waitRoute('/works');await assertNavigation('mobile','案例分享');await screenshot('case-sharing-mobile');
 await page.setViewportSize({width:1440,height:1000});await route('/');const desktopNav=await assertNavigation('desktop','首页');await desktopNav.getByRole('link',{name:'我',exact:true}).click();await waitRoute('/mine');await assertNavigation('desktop','我');
 assert.equal(await page.locator('.profile-card p').innerText(),'账户待开放');assert.equal(await page.locator('.mine-item').getByText('暂未开放',{exact:true}).count(),2);await page.getByRole('button',{name:'返回首页',exact:true}).click();await waitRoute('/');await assertNavigation('desktop','首页');
 await route('/works');await screenshot('case-sharing-desktop');
 await page.setViewportSize({width:390,height:844});await page.route('**/images/guangdang-v2/person-*.webp',r=>r.abort());await route('/category/person');await page.getByRole('img',{name:/图片暂时无法加载/}).waitFor();
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.brokenAssets,[]);assert.deepEqual(report.historicalRequests,[]);assert.deepEqual(report.mutationRequests,[]);
 report.checks.push('mobile and desktop case waterfall preserve image ratios; reference/real identities, filters, pagination, modal, empty states, navigation, and image failure recovery remain usable');
 report.status='passed';console.log(JSON.stringify(report));
}catch(error){report.status='failed';report.failure=error.stack||String(error);if(page)try{await page.screenshot({path:'outputs/document3-ui-failure.png'});}catch{}throw error;}
finally{await writeFile('outputs/document3-ui-report.json',JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
