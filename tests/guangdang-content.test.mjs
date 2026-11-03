import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, readdir, symlink, rm } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const temporary=await mkdtemp(join(tmpdir(),'guangdang-content-'));
let data,guards,editorial,navigation,scenarios,App;
try {
  execFileSync(process.execPath,[resolve(root,'node_modules/typescript/bin/tsc'),'app/guangdang-data.ts','app/guangdang-guards.ts','app/mobile-editorial-data.ts','app/experience-navigation.ts','app/scenario-plans.ts','app/Guangdang.tsx','--jsx','react-jsx','--target','ES2022','--module','ESNext','--moduleResolution','Bundler','--types','vite/client','--skipLibCheck','--outDir',temporary],{cwd:root,stdio:'pipe'});
  // Render the actual React pages without a browser to guard public entry points.
  await symlink(resolve(root,'node_modules'),join(temporary,'node_modules'),'dir');
  for(const name of (await readdir(temporary)).filter(name=>name.endsWith('.js'))) {
    const compiled=(await readFile(join(temporary,name),'utf8'))
      .replaceAll('import.meta.env.BASE_URL',JSON.stringify('/ai-image-hall-frontend-prototype/'))
      .replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");
    await writeFile(join(temporary,name.replace(/\.js$/,'.mjs')),compiled);
  }
  App=(await import(pathToFileURL(join(temporary,'Guangdang.mjs')).href)).default;
  scenarios=(await import(pathToFileURL(join(temporary,'scenario-plans.mjs')).href)).scenarioPlans;
  navigation=await import(pathToFileURL(join(temporary,'experience-navigation.mjs')).href);
  editorial=await import(pathToFileURL(join(temporary,'mobile-editorial-data.mjs')).href);
  data=await import(pathToFileURL(join(temporary,'guangdang-data.mjs')).href);
  guards=await import(pathToFileURL(join(temporary,'guangdang-guards.mjs')).href);
} finally {
  await rm(temporary,{recursive:true,force:true});
}

test('every current configuration has one stable content record with matching identity and image',()=>{
  const expected={
    'shenzhen-belike':['brand','我的深圳生活 belike'],
    'brand-0':['brand','来了就是深圳人'],'brand-1':['brand','我为品牌代言'],
    'event-0':['event','我的活动高光时刻'],'event-1':['event','专属节日影像'],
    'team-0':['team','我的职场成长影像'],'team-1':['team','我们团队的专属记忆'],
    'campus-0':['campus','我的毕业纪念影像'],'campus-1':['campus','我们的校园记忆'],
  };
  assert.equal(data.themes.length,9);assert.equal(new Set(data.themes.map(t=>t.id)).size,9);
  assert.equal(data.themeConfigurations.length,9);
  for(const [id,[category,title]] of Object.entries(expected)){
    const record=data.themes.find(t=>t.id===id),config=data.getThemeConfiguration(category,id);
    assert.ok(record&&config);assert.equal(record.categoryId,category);assert.equal(record.title,title);
    assert.equal(config.title,record.title);assert.equal(config.image,record.image);
    assert.equal(config.options.length,3);assert.ok(config.options.every(g=>g.items.length===3));
    assert.equal(data.experiencePath(category,id),`/experience/${category}/${id}`);
  }
});

test('all existing numeric theme aliases and default category routes retain their meaning',()=>{
  for(const category of data.categories.filter(c=>c.business==='hall')){
    category.themes.forEach((title,index)=>assert.equal(data.themes.find(t=>t.id===`${category.id}-${index}`)?.title,title));
  }
  assert.equal(data.experiencePath('brand'),'/experience/brand/shenzhen-belike');
  assert.equal(data.experiencePath('event'),'/experience/event/event-0');
  assert.equal(data.getThemeConfiguration('event','brand-0'),undefined);
});

test('publication never implies authorization, and authorization never publishes a draft',()=>{
  const input=[
    {id:'draft-approved',status:'draft',displayAuthorized:true},
    {id:'published-unspecified',status:'published'},
    {id:'published-denied',status:'published',displayAuthorized:false},
    {id:'published-approved',status:'published',displayAuthorized:true},
  ];
  assert.deepEqual(input.filter(guards.isPublishedAndAuthorized).map(x=>x.id),['published-approved']);
  assert.equal(guards.isPublishedAndAuthorized({status:'published',displayAuthorized:'true'}),false);
  assert.equal(guards.isPublishedAndAuthorized({status:'published',displayAuthorized:1}),false);
});

test('local configuration and media placeholders do not silently enable services',()=>{
  assert.deepEqual(data.cases,[]);assert.deepEqual(data.publishedWorks,[]);
  assert.equal(data.templateEntries.length,1);
  assert.equal(data.templateEntries[0].status,'coming-soon');assert.equal(data.templateEntries[0].url,null);
});

test('decoding errors recover and valid existing aliases remain supported',()=>{
  for(const bad of ['/category/%','/experience/%E0%A4%A','/hall?source=%GG'])assert.equal(guards.safeRoute(bad),'/invalid-link');
  assert.equal(guards.safeRoute('/scenes/hall'),'/hall');
  assert.equal(guards.safeRoute('/scenes/bespoke'),'/bespoke');
  assert.equal(guards.safeRoute('/cooperate?product=hall&source=theme'),'/cooperate?product=hall&source=theme');
});


test('eight editorial plans explain choices, process, outcome and value with their own title and image',()=>{
  assert.deepEqual(Object.keys(editorial.editorialPlans),['brand','event','team','campus','person','family','enterprise','city']);
  for(const [id,plan] of Object.entries(editorial.editorialPlans)){
    assert.equal(plan.categoryId,id);assert.equal(plan.business,data.categoryById.get(id).business);
    assert.equal(plan.title,id==='brand'?'我为品牌代言 · 与深圳 共成长':data.scenarioExamples[id].title);
    for(const field of ['kicker','summary','audience','image','imageLabel'])assert.ok(plan[field]?.trim(),`${id}: ${field}`);
    assert.equal(plan.choices.length,3);assert.equal(plan.journey.length,id==='brand'?5:3);
    for(const choice of plan.choices){assert.ok(choice.title.trim());assert.ok(choice.items.length>=2&&choice.items.every(item=>item.trim()));assert.ok(choice.meaning.trim().length>=15);}
    for(const step of plan.journey){assert.ok(step.title.trim());assert.ok(step.description.trim().length>=15);}
    for(const value of [plan.outcome,plan.participantValue,plan.projectValue]){assert.ok(value.title.trim());assert.ok(value.description.trim().length>=15);}
    assert.ok(plan.outcome.extras.trim().length>=15);assert.ok(plan.preparation.length>=3&&plan.preparation.every(item=>item.trim()));
    assert.ok(['概念示意','成果示意','场景参考','品牌活动方案示例 · 非落地案例'].includes(plan.imageLabel));
    assert.doesNotMatch(JSON.stringify(plan),/已上线|实时生成|自动获客|可用API/);
  }
});

test('editorial previews match configured choices and preserve retirement and commissioning boundaries',()=>{
  for(const [id,themeId] of [['event','event-0'],['campus','campus-0']]){
    const plan=editorial.editorialPlans[id],config=data.getThemeConfiguration(id,themeId);
    assert.equal(plan.themeId,themeId);assert.deepEqual(plan.choices.map(({title,items})=>({title,items})),config.options.map(({title,items})=>({title,items})));
  }
  const retired=editorial.editorialPlans.team;assert.equal(retired.planned,true);assert.equal(retired.themeId,undefined);
  assert.match(retired.title,/退休/);assert.doesNotMatch(JSON.stringify(retired.choices),/我的职场成长影像|team-0/);
  for(const id of ['person','family','enterprise','city']){
    const plan=editorial.editorialPlans[id];assert.equal(plan.business,'bespoke');assert.equal(plan.themeId,undefined);
    assert.doesNotMatch(JSON.stringify({choices:plan.choices,journey:plan.journey}),/自助生成|自动生成|选择模板|一键生成/);
  }
});

test('both product introductions and all three benefits contain corresponding visual material',()=>{
  for(const business of ['hall','bespoke']){
    const intro=editorial.editorialIntroductions[business];assert.ok(intro.title&&intro.description&&intro.image&&intro.imageLabel);assert.equal(intro.steps.length,3);
    const benefits=editorial.editorialBenefits[business];assert.equal(benefits.length,3);
    for(const benefit of benefits)for(const field of ['title','description','image','imageLabel'])assert.ok(benefit[field]?.trim(),`${business}: ${field}`);
  }
});


test('ICBC campaign is an independent proposal with poster-matched choices and no legacy template binding',async()=>{
  const plan=editorial.editorialPlans.brand;
  const legacy=data.getThemeConfiguration('brand','brand-1');
  assert.equal(plan.themeId,undefined,'a campaign proposal must not advertise the old general configuration as its generator');
  assert.equal(plan.imageLabel,'场景参考');
  assert.match(plan.kicker,/方案示例/);
  assert.deepEqual(plan.choices.map(({items})=>items),[
    ['职场成长','家庭相伴','创业逐梦'],
    ['深圳湾','福田 CBD','前海','工行网点','城市生活'],
    ['服装风格','视频风格','个性化文案'],
  ]);
  assert.match(plan.choices[0].title,/选\s*1\s*项/);
  assert.match(plan.choices[1].title,/选\s*2[–-]3\s*项/);
  assert.match(plan.choices[2].meaning,/活动方.*确认/);
  assert.deepEqual(plan.journey.map(({title})=>title),['扫码进入','准备个人照片','选择主题与配置','形成专属影像','保存与自愿分享']);
  assert.match(plan.outcome.title,/30\s*秒/);
  assert.match(plan.outcome.description,/成果目标/);
  assert.match(plan.outcome.extras,/不生成工行专属影片/);
  assert.match(plan.projectValue.description,/不承诺传播量或业务转化/);
  assert.ok(!data.cases.some(item=>item.categoryId==='brand'),'a proposal must not create a published customer case');
  assert.ok(!data.publishedWorks.some(item=>item.categoryId==='brand'),'a proposal poster must not become a produced work');

  assert.equal(legacy.title,'我为品牌代言');
  assert.deepEqual(legacy.options.map(({title})=>title),['代言场景','主角身份','表达风格']);
  assert.deepEqual(legacy.options[0].items,['品牌发布','产品推广','城市推荐']);
  assert.notDeepEqual(plan.choices.map(({items})=>items),legacy.options.map(({items})=>items));
  const before=JSON.stringify(legacy.options),saved=plan.choices[0].items[0];
  try { plan.choices[0].items[0]='仅用于检测引用隔离';assert.equal(JSON.stringify(legacy.options),before); }
  finally { plan.choices[0].items[0]=saved; }
  assert.equal(data.experiencePath('brand','brand-1'),'/experience/brand/brand-1');

  assert.ok(!plan.image.includes('icbc-shenzhen-plan'),'source poster must not be used as a website illustration');
  const illustration=await readFile(resolve(root,'public',plan.image.replace('/ai-image-hall-frontend-prototype/','')));
  assert.ok(illustration.length>1000,'the independent scene illustration must exist');
  const page=await readFile(resolve(root,'app/BrandScenario.tsx'),'utf8');
  assert.ok(!page.includes('bs-reference-card')&&!page.includes('查看完整方案图'),'the campaign must be rendered as web content, not a poster link');
});


test('global experience entry is independent of previously visited campaign',()=>{
  assert.deepEqual(navigation.experienceReturnFor('/experience-center?mode=template'),{to:'/works?product=hall',label:'查看活动方案'});
  assert.equal(navigation.experiencePathFor('custom'),'/experience-center?mode=custom');
});

test('contextual experience return survives mode changes and preserves the solution filter',()=>{
  const source='/category/brand?from=solutions&filter=hall';
  const route=navigation.experiencePathFor('template',source);
  const destination=navigation.experienceReturnFor(route);
  assert.deepEqual(destination,{to:source,label:'返回方案详情'});
  assert.equal(navigation.experienceReturnFor(navigation.experiencePathFor('custom',destination.to)).to,source);
  assert.equal(navigation.experienceReturnFor('/experience-center?source=brand').to,'/category/brand');
});

test('experience return accepts only public catalogue context and discards arbitrary inputs',()=>{
  for(const target of ['https://example.com','//example.com','/cooperate?contact=private','/category/person','/hall/../cooperate']){
    assert.equal(navigation.normalizeExperienceReturn(target),undefined);
  }
  assert.equal(navigation.normalizeExperienceReturn('/category/brand?from=solutions&filter=hall&contact=private'),'/category/brand?from=solutions&filter=hall');
  assert.equal(navigation.normalizeExperienceReturn('/hall?section=benefits'),'/hall?section=benefits&restore=1');
});


test('seven expanded proposals specify participants, mechanics and two concrete outcomes',()=>{
  assert.deepEqual(Object.keys(scenarios),['event','team','campus','person','family','enterprise','city']);
  for(const [id,plan] of Object.entries(scenarios)){
    assert.equal(plan.id,id);assert.equal(plan.business,data.categoryById.get(id).business);
    for(const field of ['lead','organizer','participants','setting','objective'])assert.ok(plan[field]?.trim(),id+': '+field);
    assert.equal(plan.narrative.length,4);assert.equal(plan.journey.length,5);
    assert.ok(plan.mechanic.fixed.length>=2&&plan.mechanic.personal.length>=2);
    assert.equal(plan.outputs.length,2);
    for(const output of plan.outputs){assert.ok(output.recipient&&output.title&&output.value);assert.equal(output.items.length,3);assert.ok(output.items.every(item=>item.trim()));}
    assert.ok(plan.scope.core&&plan.scope.optional.length&&plan.scope.pending.length&&plan.preparation.length);
  }
});

test('each proposal choice explains distinct meaning and resulting content without backend bindings',()=>{
  for(const [id,plan] of Object.entries(scenarios)){
    assert.equal(plan.choices.length,3);
    assert.equal(new Set(plan.choices.map(group=>group.id)).size,3);
    for(const group of plan.choices){
      assert.equal(group.options.length,3);
      assert.equal(new Set(group.options.map(option=>option.id)).size,3);
      assert.equal(new Set(group.options.map(option=>option.meaning)).size,3);
      assert.equal(new Set(group.options.map(option=>option.result)).size,3);
      for(const option of group.options){assert.ok(option.label&&option.meaning.length>=10&&option.result.length>=10,id+': '+option.id);}
    }
    assert.equal(plan.templateId,undefined);assert.equal(plan.api,undefined);
  }
});

test('expanded proposals use existing matched visual references rather than the source poster',async()=>{
  for(const [id,plan] of Object.entries(scenarios)){
    const visuals=Object.values(plan.visuals);assert.equal(visuals.length,3);
    assert.ok(new Set(visuals.map(v=>v.src)).size>=2,id+' needs more than one repeated illustration');
    for(const visual of visuals){
      assert.ok(visual.alt.length>5&&visual.caption.length>5);
      assert.ok(!visual.src.includes('icbc-shenzhen-plan'));
      const file=resolve(root,'public',visual.src.replace('/ai-image-hall-frontend-prototype/',''));
      assert.ok((await readFile(file)).length>1000,file);
    }
  }
});

test('expanded retirement and commissioned stories retain product and evidence boundaries',()=>{
  assert.equal(editorial.editorialPlans.team.planned,true);assert.equal(editorial.editorialPlans.team.themeId,undefined);
  for(const id of ['person','family','enterprise','city']){
    assert.equal(scenarios[id].business,'bespoke');
    assert.doesNotMatch(JSON.stringify(scenarios[id]),/一键生成|实时生成|保证转化|已交付案例/);
    assert.match(JSON.stringify(scenarios[id].journey),/确认|审核|审片/);
  }
  assert.match(JSON.stringify(scenarios.city),/核实|核验/);
  assert.match(JSON.stringify(scenarios.family),/公开|授权/);
  assert.equal(data.cases.length,0);assert.equal(data.publishedWorks.length,0);
});


function renderPublicPage(route) {
  const previousWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
  const previousMatchMedia=Object.getOwnPropertyDescriptor(globalThis,'matchMedia');
  try {
    Object.defineProperty(globalThis,'window',{configurable:true,value:{location:{hash:'#'+route}}});
    Object.defineProperty(globalThis,'matchMedia',{configurable:true,value:()=>({matches:false})});
    const html=renderToStaticMarkup(createElement(App));
    const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
    assert.ok(main,route+' must render its main content');
    const anchors=[...main.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([,attributes,body])=>({
      href:attributes.match(/href="([^"]*)"/)?.[1].replaceAll('&amp;','&'),
      text:body.replace(/<[^>]*>/g,''),
    }));
    return {main,anchors,hrefs:anchors.map(anchor=>anchor.href).filter(Boolean)};
  } finally {
    if(previousWindow)Object.defineProperty(globalThis,'window',previousWindow);else delete globalThis.window;
    if(previousMatchMedia)Object.defineProperty(globalThis,'matchMedia',previousMatchMedia);else delete globalThis.matchMedia;
  }
}

test('public proposals are read-only explanations with one contextual experience destination for hall products',()=>{
  for(const category of data.categories) {
    const route='/category/'+category.id+'?from=solutions&filter='+category.business;
    const {main,hrefs}=renderPublicPage(route);
    assert.doesNotMatch(main,/<(?:form|input|select|textarea)\b|aria-pressed=/,category.id+': configuration belongs in the experience center');
    assert.match(main,/方案示例/,category.id+': proposed work must not appear as delivered work');
    assert.ok(hrefs.some(href=>href.startsWith('#/cooperate?')&&new URLSearchParams(href.split('?')[1]).get('direction')===category.id),category.id+': cooperation retains the chosen direction');
    const experiences=hrefs.filter(href=>href.startsWith('#/experience-center?'));
    if(category.business==='hall') {
      assert.equal(experiences.length,1,category.id+': one clear experience destination');
      assert.equal(navigation.experienceReturnFor(experiences[0].slice(1)).to,route,category.id+': return preserves solution context');
    } else assert.equal(experiences.length,0,category.id+': commissioned stories are not a self-service generator');
  }
});

test('normal browsing exposes no legacy theme configuration or empty sample destinations',()=>{
  const routes=['/','/hall','/bespoke','/works',...data.categories.map(category=>'/category/'+category.id),'/samples/hall?preview=themes','/samples/bespoke'];
  for(const route of routes) {
    const {hrefs}=renderPublicPage(route);
    assert.ok(!hrefs.some(href=>/^#\/(?:experience|theme)(?:[/?]|$)/.test(href)),route+': old configuration stays outside normal browsing');
    assert.ok(!hrefs.some(href=>/^#\/samples(?:[/?]|$)/.test(href)),route+': no empty sample pages are promoted');
  }
});


test('experience-to-cooperation returns retain valid mode and catalogue context while rejecting arbitrary destinations',()=>{
  const sources=['/works?product=hall','/category/brand?from=solutions&filter=hall','/hall?section=benefits'];
  for(const mode of ['template','custom'])for(const source of sources) {
    const route=navigation.experiencePathFor(mode,source);
    assert.equal(navigation.normalizeExperienceRoute(route),route);
    assert.equal(new URLSearchParams(navigation.normalizeExperienceRoute(route).split('?')[1]).get('mode'),mode);
    assert.equal(navigation.experienceReturnFor(route).to,navigation.normalizeExperienceReturn(source));
  }
  for(const target of ['https://example.com','//example.com','/cooperate?mode=template','/experience-center/other?mode=template','/experience-center?mode=invalid','/experience-center','/experience-center?mode=custom#private']) {
    assert.equal(navigation.normalizeExperienceRoute(target),undefined,target);
  }
  const unsafe='/experience-center?'+new URLSearchParams({mode:'custom',returnTo:'https://example.com/private',contact:'private'});
  assert.equal(navigation.normalizeExperienceRoute(unsafe),'/experience-center?mode=custom');
  const valid='/experience-center?'+new URLSearchParams({mode:'template',returnTo:'/category/brand?from=solutions&filter=hall&contact=private',contact:'private'});
  assert.equal(navigation.normalizeExperienceRoute(valid),navigation.experiencePathFor('template','/category/brand?from=solutions&filter=hall'));
});

test('the homepage sends both service choices directly to their corresponding solution lists',()=>{
  const {anchors}=renderPublicPage('/');
  for(const [service,business] of [['AI影像馆','hall'],['高定AI影像','bespoke']]) {
    const entry=anchors.filter(anchor=>anchor.text.includes(service));
    assert.equal(entry.length,1,service+': one clear service choice');
    assert.equal(entry[0].href,'#/works?product='+business,service+': go directly to suitable solutions');
    const {hrefs}=renderPublicPage('/works?product='+business);
    const destinations=hrefs.filter(href=>href.startsWith('#/category/'));
    assert.equal(destinations.length,data.categories.filter(category=>category.business===business).length);
    for(const href of destinations)assert.equal(data.categoryById.get(href.split('?')[0].split('/')[2]).business,business);
  }
});

test('cooperation opened from a solution list retains its explicit business and a clear return label',()=>{
  for(const [business,label] of [['hall','返回活动方案'],['bespoke','返回定制方案']]) {
    const {main,anchors}=renderPublicPage('/cooperate?product='+business+'&source=solutions');
    assert.equal(anchors.find(anchor=>anchor.text===label)?.href,'#/works?product='+business,business+': return points to the originating list');
    assert.ok(main.includes(data.businessName(business)),business+': business context remains visible');
    assert.doesNotMatch(main,/返回体验演示|参考方案：/,'a list must not invent an experience or a selected proposal');
  }
  for(const product of ['invalid','']) {
    const {main}=renderPublicPage('/cooperate?product='+product+'&source=solutions&direction=brand');
    assert.doesNotMatch(main,/返回活动方案|返回定制方案/,'a guessed business must not activate solutions source');
  }
});

test('cooperation from an experience preserves its proposal only when it matches the validated experience context',()=>{
  const returnTo='/category/brand?from=solutions&filter=hall';
  for(const mode of ['template','custom']) {
    const experienceReturn=navigation.experiencePathFor(mode,returnTo);
    const route='/cooperate?'+new URLSearchParams({product:'hall',source:'experience',experienceReturn,direction:'brand',origin:'solutions',filter:'hall'});
    assert.equal(guards.safeRoute(route),route,'route guard must preserve nested return encoding');
    const {main,anchors}=renderPublicPage(guards.safeRoute(route));
    assert.equal(anchors.find(anchor=>anchor.text==='返回体验演示')?.href,'#'+experienceReturn,'cooperation returns to the exact mode and proposal filter');
    assert.ok(main.includes('参考方案：'+editorial.editorialPlans.brand.title));
    assert.match(main,/尚未发送/,'return context must not imply a sent consultation');
    const mismatched=renderPublicPage(route.replace('direction=brand','direction=event')).main;
    assert.match(mismatched,/返回体验演示/);
    assert.doesNotMatch(mismatched,/参考方案：/,'an unrelated direction must not inherit the experience proposal');
  }
  for(const invalid of ['/cooperate?contact=private','https://example.com','/experience-center?mode=invalid']) {
    const {main}=renderPublicPage('/cooperate?'+new URLSearchParams({product:'hall',source:'experience',experienceReturn:invalid,direction:'brand'}));
    assert.doesNotMatch(main,/返回体验演示|参考方案：/,'an invalid return must not create experience context');
  }
  const wrongBusiness=renderPublicPage('/cooperate?'+new URLSearchParams({product:'bespoke',source:'experience',experienceReturn:navigation.experiencePathFor('template',returnTo),direction:'person'})).main;
  assert.doesNotMatch(wrongBusiness,/返回体验演示|参考方案：/,'self-service experience context cannot be assigned to bespoke work');
  const direct=renderPublicPage('/cooperate?product=hall&source=application&direction=brand&origin=solutions&filter=hall').main;
  assert.match(direct,/返回方案详情/);
  assert.ok(direct.includes('参考方案：'+editorial.editorialPlans.brand.title));
});


test('route validation preserves nested query encoding and still rejects malformed escapes',()=>{
  const experience=navigation.experiencePathFor('custom','/category/brand?from=solutions&filter=hall');
  const route='/cooperate?'+new URLSearchParams({product:'hall',source:'experience',experienceReturn:experience});
  assert.equal(guards.safeRoute(route),route);
  assert.equal(guards.safeRoute(guards.safeRoute(route)),route,'repeated route handling must not decode another layer');
  const nested=new URLSearchParams(guards.safeRoute(route).split('?')[1]).get('experienceReturn');
  assert.equal(navigation.normalizeExperienceRoute(nested),experience);
  assert.equal(navigation.experienceReturnFor(nested).to,'/category/brand?from=solutions&filter=hall');
  for(const query of ['source=%','source=%GG','source=%E0%A4%A','source=%ED%A0%80']) {
    assert.equal(guards.safeRoute('/hall?'+query),'/invalid-link',query+': invalid query escapes remain rejected');
  }
  assert.equal(guards.safeRoute('/category/%62rand?from=solutions&returnTo=%252Fhall'),'/category/brand?from=solutions&returnTo=%252Fhall','only the path is decoded');
});

test('product explanations return to the appropriate solution list instead of the homepage',()=>{
  for(const [business,label] of [['hall','返回活动方案'],['bespoke','返回定制方案']]) {
    const {anchors}=renderPublicPage('/'+business);
    assert.equal(anchors.find(anchor=>anchor.text===label)?.href,'#/works?product='+business);
  }
});
