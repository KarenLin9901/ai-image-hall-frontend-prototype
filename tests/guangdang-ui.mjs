import { navigationLabels, navigationHrefs, productSections, openProductDetails, assertPlanContent, assertSolutionIndex, assertHallPrimaryAction } from './b2b-assertions.mjs';
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
const planTitles={brand:'与深圳 共成长',event:'我的活动高光时刻',team:'退休员工纪念',campus:'我的毕业纪念影像',person:'一位人物的职业故事',family:'一段跨代的家庭记忆',enterprise:'企业周年记忆影片',city:'一条街区的城市记忆'};
const previewThemes={event:'event-0',campus:'campus-0'};
const themePath=theme=>`/experience/${theme.category}/${theme.id}`;
const report={base,status:'running',checks:[],anchors:[],solutionLayouts:[],errors:[],brokenAssets:[],historicalRequests:[],mutationRequests:[]};
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
 const expose=async(locator,label)=>{
  await locator.evaluate(el=>{const b=el.getBoundingClientRect(),top=document.querySelector('.topbar').getBoundingClientRect().bottom,bottom=document.querySelector('.mobile-nav')?.getBoundingClientRect().top||innerHeight;scrollBy({top:b.top+b.height/2-(top+bottom)/2,behavior:'instant'});});await frames();
  const geometry=await locator.evaluate(el=>{const b=el.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2,hit=document.elementFromPoint(x,y);return {top:b.top,bottom:b.bottom,headerBottom:document.querySelector('.topbar').getBoundingClientRect().bottom,navTop:document.querySelector('.mobile-nav')?.getBoundingClientRect().top||innerHeight,hit:el===hit||el.contains(hit)};});
  assert.ok(geometry.hit&&geometry.top>=geometry.headerBottom-1&&geometry.bottom<=geometry.navTop+1,`${label}: reachable without fixed navigation occlusion ${JSON.stringify(geometry)}`);return geometry;
 };
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
  assert.deepEqual(await nav.getByRole('link').allTextContents(),navigationLabels);
  assert.deepEqual(await nav.getByRole('link').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),navigationHrefs);
  assert.deepEqual(await nav.locator('a.active').allTextContents(),active?[active]:[]);assert.equal(await nav.locator('[aria-current=page]').count(),active?1:0);return nav;
 };
 const assertEditorial=async business=>{
  await route('/'+business);const article=page.locator('.editorial-product');assert.equal(await article.getAttribute('data-business'),business);
  assert.equal(await page.getByRole('tab').count(),0,'section navigation should scroll one continuous product page');
  assert.equal(await page.getByRole('tabpanel').count(),0);
  const index=page.getByRole('navigation',{name:'产品内容导航',exact:true});
  const navItems=productSections(business);
  assert.deepEqual(await index.getByRole('button').allTextContents(),navItems.map(([,label])=>label));
  const parts=await article.locator(':scope > section').evaluateAll(nodes=>nodes.map(node=>node.id));
  for(const id of ['overview','benefits','scenes','try'])assert.ok(parts.includes(business+'-'+id),'legacy product anchor remains '+id);
  if(business==='bespoke')assert.ok(parts.includes('bespoke-pricing'),'custom service has a visible pricing section');
  for(const [id] of navItems)assert.equal(await article.locator('#'+business+'-'+id+'[data-nav-section]').count(),1);
  assert.ok((await article.locator('.editorial-overview').innerText()).length>50);assert.equal(await article.locator('.b2b-role-grid article').count(),3);assert.equal(await article.locator('.me-flow-line li').count(),3);
  await openProductDetails(page);
  assert.equal(await article.locator('.benefit-grid > article').count(),3);
  for(const benefit of await article.locator('.benefit-grid > article').all()){
   assert.ok((await benefit.locator('h3').innerText()).length>1);assert.equal(await benefit.locator('.me-benefit-art img').count(),1);await loadImages(benefit.locator('img'));
   const detail=benefit.locator('.me-benefit-details');assert.equal(await detail.getAttribute('open'),null);await detail.locator('summary').click();
   assert.ok((await benefit.locator('.benefit-need').innerText()).length>5);
   assert.deepEqual(await benefit.locator('dt').allTextContents(),['解决方式','产品优势']);
   assert.ok((await benefit.locator('dd').allTextContents()).every(text=>text.trim().length>10));await detail.locator('summary').click();
  }
  const cooperation=article.locator('details.editorial-project-details');assert.equal(await cooperation.getAttribute('open'),null);
  await cooperation.locator('summary').click();
  assert.equal(await cooperation.locator('.feature-card').count(),4);assert.equal(await cooperation.locator('.workflow-list li').count(),4);
  assert.ok((await cooperation.locator('ul li').count())>=3);await cooperation.locator('summary').click();
  assert.deepEqual(await article.locator('a.scenario-card').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),applications[business].map(([id])=>'#/category/'+id));
  assert.deepEqual(await article.locator('.scenario-card h3').allTextContents(),applications[business].map(([,title])=>title));
  for(const [id,label] of navItems){
   const before=await page.url();await index.getByRole('button',{name:label,exact:true}).click();
   await page.waitForFunction(target=>document.activeElement?.id===target,business+'-'+id);await frames();
   await page.waitForFunction(expected=>document.querySelector('.editorial-index button[aria-current="location"]')?.textContent===expected,label);
   const geometry=await page.locator('#'+business+'-'+id).evaluate(el=>({top:el.getBoundingClientRect().top,headingBottom:el.querySelector('h2').getBoundingClientRect().bottom,headerBottom:document.querySelector('.topbar').getBoundingClientRect().bottom,navTop:document.querySelector('.mobile-nav').getBoundingClientRect().top,scrollY}));
   assert.equal(await page.url(),before,'section anchors should not change the route or act as tabs');
   assert.ok(geometry.top>=geometry.headerBottom-1,`${business} ${label}: section hidden by header`);
   assert.ok(geometry.headingBottom<geometry.navTop,`${business} ${label}: target heading must be readable`);
   report.anchors.push({business,label,...geometry});
  }
  const primary=page.getByTestId('product-primary-action');
  if(business==='hall')assert.equal(await primary.getAttribute('href'),null);
  else {assert.match(await primary.innerText(),/咨询定制/);await assertCooperationLink(primary,{product:business,source:'product',section:'experience'});assert.equal(await article.getByRole('link',{name:'立即体验',exact:true}).count(),0);}
  await assertCooperationLink(article.locator('.editorial-experience a[href^="#/cooperate?"]').first(),{product:business,source:'product',section:'experience'});
  await noOverflow(business);await screenshot(business+'-editorial');
  if(business==='hall')await assertHallPrimaryAction(page);
  else {await primary.click();await waitRoute('/cooperate');assert.equal(await page.locator('.demand-form').count(),1);}
  await route('/'+business);
  if(business==='hall'){await page.getByTestId('product-experience-link').click();await waitRoute('/experience-center');assert.equal(await page.getByTestId('experience-center').count(),1);await route('/hall');await openProductDetails(page);await page.locator('.px-samples-compact a').click();}else await page.getByTestId('product-samples-link').click();await waitRoute('/samples/'+business);
  assert.equal(await page.locator('.samples-pending').count(),1);await page.getByRole('heading',{name:'样片制作中',exact:true}).waitFor();
  assert.equal(await page.locator('video,.media-player').count(),0,'unpublished samples must not expose a fake playable case');
  assert.equal(await page.locator('.sample-card').count(),0);
  await assertCooperationLink(page.getByRole('link',{name:/^(整理合作需求|咨询定制|项目合作咨询|整理咨询需求)$/,exact:true}).first(),{product:business,source:'samples'});
  if(business==='hall')assert.equal(await page.locator('.legacy-theme-library').getAttribute('open'),null,'legacy configuration stays secondary until explicitly opened');
  else assert.equal(await page.locator('.legacy-theme-library').count(),0);
  await screenshot(business+'-samples');
 };
 const assertSolutionLayout=async label=>{
  await loadImages(page.locator('.b2b-solution-card img'));
  const boxes=await page.locator('a.b2b-solution-card').evaluateAll(cards=>cards.map(card=>{const r=card.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};}));
  assert.equal(boxes.length,8);assert.ok(boxes.every(box=>box.width>0&&box.height>0));
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(Math.min(a.right,b.right)<=Math.max(a.x,b.x)+1||Math.min(a.bottom,b.bottom)<=Math.max(a.y,b.y)+1,'solution cards do not overlap');}
  assert.equal(await page.locator('.b2b-plan-poster,img[src*="icbc-shenzhen-plan"],a[href*="icbc-shenzhen-plan"]').count(),0,'source poster is absent from the solution index');
  report.solutionLayouts.push({label,layout:'solution-index',cards:boxes.length});await noOverflow(label);
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
  await page.setViewportSize(size);await route('/');assert.equal((await page.locator('.me-home-hero h1').textContent()).replace(/\s+/g,''),'让用户参与，让品牌被看见。');
  await assertNavigation('mobile','首页');assert.equal(await page.locator('.home-choice').count(),2);
  assert.equal(await page.locator('.me-hero-copy > .me-eyebrow').textContent(),'面向品牌与机构的 AI 影像产品');
  assert.deepEqual(await page.locator('.me-product-kind').allTextContents(),['为品牌活动，设计人人可参与的影像体验','从需求与资料出发，由团队完成专属影片']);
  assert.equal(await page.locator('.mobile-editorial-home.me-home-compact > section').count(),2);assert.equal(await page.locator('#home-products[aria-label="选择影像服务"]').count(),1);
  assert.equal(await page.locator('.me-home-hero img,.me-home-featured,.me-outcome-band,.me-contact-band,.me-scroll-cue').count(),0,'home stays focused on choosing between two products');
  await loadImages(page.locator('#home-products img'));assert.equal(await page.locator('#home-products img').count(),2);
  const layout=await page.evaluate(()=>({height:innerHeight,scroll:document.documentElement.scrollHeight}));assert.ok(layout.scroll<=layout.height*2,`compact home stays within two viewports: ${JSON.stringify({size,...layout})}`);
  for(const business of ['hall','bespoke']){const title=page.locator(`.home-choice[href="#/${business}"] h2`);await expose(title,`${size.width} ${business}`);await page.getByRole('link',{name:business==='hall'?'AI影像馆':'高定AI影像',exact:true}).click();await waitRoute('/'+business);await route('/');}
  await noOverflow('home');

 }
 await page.setViewportSize({width:390,height:844});await route('/');
 assert.ok(await page.evaluate(()=>{
  const style=getComputedStyle(document.body);
  const base=style.backgroundColor.match(/[\d.]+/g).map(Number);
  const colors=style.backgroundImage.match(/rgba?\([^)]*\)/g)||[];
  const luminance=rgb=>rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
  return luminance(base)<20&&style.backgroundImage.includes('gradient')&&colors.length>1&&colors.every(color=>{
   const channels=color.match(/[\d.]+/g).map(Number),alpha=channels[3]??1;
   return luminance(channels.slice(0,3).map((value,index)=>value*alpha+base[index]*(1-alpha)))<32;
  });
 }),'selected cinema theme keeps a predominantly black gradient reading surface');
 assert.equal(await page.getByRole('img',{name:'咣当原品牌Logo',exact:true}).getAttribute('src'),'/ai-image-hall-frontend-prototype/images/brand/guangdang-logo.png');
 assert.equal(await page.locator('.header-more').getAttribute('open'),null);assert.equal(await page.locator('.header-actions > button,.header-more > summary').count(),2);await screenshot('home-mobile');
 for(const business of ['hall','bespoke'])await assertEditorial(business);
 report.checks.push('compact image-led home with a short brand opening, two direct product entries and four navigation destinations; each product presents its own four scrolling anchors, honest samples and primary intent; hall leads to applications with a separate capability demo while bespoke leads to consultation; three illustrated benefits and four full scenarios remain');

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
  assert.ok((await page.locator('.scenario-example .application-value').innerText()).length>20);assert.equal(await page.locator('.scenario-production ol li').count(),3);
  for(const step of await page.locator('.scenario-production ol li').all()){assert.ok((await step.locator('h4').innerText()).length>1);assert.ok((await step.locator('p').innerText()).length>10);}
  assert.match(await page.locator('figure.scenario-template figcaption').innerText(),/场景参考图/);await loadImages(page.locator('figure.scenario-template img'));
  const related=page.locator('details.related-theme-section');assert.equal(await related.getAttribute('open'),null);await related.locator('summary').click();assert.deepEqual(await related.getByRole('link').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),['#'+themePath(theme)]);
  const benefits=page.locator('details.application-benefits');await benefits.locator('summary').click();assert.equal(await benefits.locator('.scene-advantages > div').count(),4);
  const preview=page.getByRole('link',{name:'预览主题配置',exact:true});assert.equal(await preview.getAttribute('href'),'#'+themePath(theme));await preview.click();await assertConfig(theme);
 }
 for(const [category,id] of [['brand','shenzhen-belike'],['event','event-0'],['team','team-0'],['campus','campus-0']]){await route('/experience/'+category);await assertConfig(themes.find(theme=>theme.id===id),'/experience/'+category);}
 for(const invalid of ['/experience/brand/not-found','/experience/event/brand-0','/experience/person/shenzhen-belike','/experience/not-found','/samples/other']){await route(invalid);await page.getByRole('heading',{name:'暂时没有这个页面',exact:true}).waitFor();assert.equal(await page.locator('.theme-config').count(),0);}
 report.checks.push('nine distinct high-resolution themes and filters remain in the explicitly opened preview; direct and legacy links keep their own configuration; invalid themes never fall back');

 const exampleTitles=[];
 for(const [business,list] of Object.entries(applications))for(const [id] of list){
  await route('/category/'+id);await assertPlanContent(page,id);exampleTitles.push(await page.locator('main h1').innerText());
  const preparation=page.locator(id==='brand'?'.me-plan-preparation':'.sp-preparation');assert.equal(await preparation.getAttribute('open'),null);await preparation.locator('summary').click();assert.ok(await preparation.locator('li').count()>=3);
  await assertCooperationLink(page.locator('.application-actions a.scene-cta'),{product:business,direction:id,source:'application'});
  const preview=page.locator('.sp-legacy-fold a[href^="#/experience/"]');if(previewThemes[id])assert.equal(await preview.getAttribute('href'),`#/experience/${id}/${previewThemes[id]}`);else assert.equal(await preview.count(),0);
  if(id==='team')assert.match(await page.locator('.sp-planned-note').innerText(),/策划示例.*尚未开放/);else if(business==='bespoke')assert.match(await page.locator('.sp-cooperate > .sp-local-note').innerText(),/高定按需求报价，由团队创作/);
  await page.locator('.application-actions a.scene-cta').click();await waitRoute('/cooperate');assert.match(await page.locator('.inquiry-context').innerText(),new RegExp(id==='brand'?'与深圳 共成长':planTitles[id]));await page.locator('.back-button').click();await waitRoute('/category/'+id);await noOverflow(id);
 }
 assert.equal(new Set(exampleTitles).size,8,'each commercial category has its own plan');
 report.checks.push('eight complete application plans retain meaningful choices, outcomes, participant/project value and consultation context; the bank example has independent options, four narrative segments and five planned stages');

 for(const business of ['hall','bespoke'])for(const section of ['introduction','applications','experience']){
  await route('/'+business+'?section='+section);assert.equal(await page.locator('.editorial-product').count(),1);assert.equal(await page.getByRole('tab').count(),0);
  if(section!=='introduction')assert.ok(await page.evaluate(()=>scrollY>0),'legacy product query should restore an appropriate place in the long page');
 }
 for(const business of ['hall','bespoke']){await route('/scenes/'+business);assert.equal(await page.locator('.editorial-product').count(),1);}
 for(const width of [360,375,390,430,768,1440]){
  await page.setViewportSize({width,height:width>700?1000:844});
  for(const path of ['/','/hall','/bespoke','/samples/hall','/samples/bespoke','/category/city','/cooperate','/mine']){await route(path);await noOverflow(`${path} ${width}`);}
  await route('/works');await assertSolutionIndex(page,{exercise:false});await assertSolutionLayout(width+'px');
 }
 await page.setViewportSize({width:390,height:844});await route('/works');await assertSolutionIndex(page);
 await route('/');const mobileNav=await assertNavigation('mobile','首页');await mobileNav.getByRole('link',{name:'应用方案',exact:true}).click();await waitRoute('/works');await assertNavigation('mobile','应用方案');await screenshot('solutions-mobile');
 await page.setViewportSize({width:1440,height:1000});
 for(const [label,path] of [['首页','/'],['应用方案','/works'],['能力体验','/experience-center'],['合作咨询','/cooperate']]){await page.getByRole('navigation',{name:'主导航',exact:true}).getByRole('link',{name:label,exact:true}).click();await waitRoute(path);await assertNavigation('desktop',label);}
 await route('/mine');await assertNavigation('desktop',null);assert.equal(await page.locator('.profile-card p').innerText(),'账户待开放');assert.equal(await page.locator('.mine-item').getByText('暂未开放',{exact:true}).count(),2);await page.getByRole('button',{name:'返回首页',exact:true}).click();await waitRoute('/');await assertNavigation('desktop','首页');
 await route('/works');await screenshot('solutions-desktop');
 await page.setViewportSize({width:390,height:844});await page.route('**/images/guangdang-v2/person-*.webp',r=>r.abort());await route('/category/person');await page.locator('.sp-hero-visual').getByRole('img',{name:/图片暂时无法加载/}).waitFor();
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.brokenAssets,[]);assert.deepEqual(report.historicalRequests,[]);assert.deepEqual(report.mutationRequests,[]);
 report.checks.push('mobile and desktop solution indexes retain eight plans, matching filters and source-aware returns; reference and published identities, empty states, navigation and image failure recovery remain usable');
 report.status='passed';console.log(JSON.stringify(report));
}catch(error){report.status='failed';report.failure=error.stack||String(error);if(page)try{await page.screenshot({path:'outputs/document3-ui-failure.png'});}catch{}throw error;}
finally{await writeFile('outputs/document3-ui-report.json',JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
