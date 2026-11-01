import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const temporary=await mkdtemp(join(tmpdir(),'guangdang-content-'));
let data,guards,editorial,navigation,scenarios;
try {
  execFileSync(process.execPath,[resolve(root,'node_modules/typescript/bin/tsc'),'app/guangdang-data.ts','app/guangdang-guards.ts','app/mobile-editorial-data.ts','app/experience-navigation.ts','app/scenario-plans.ts','--target','ES2022','--module','ESNext','--moduleResolution','Bundler','--types','vite/client','--skipLibCheck','--outDir',temporary],{cwd:root,stdio:'pipe'});
  const compiled=(await readFile(join(temporary,'guangdang-data.js'),'utf8')).replaceAll('import.meta.env.BASE_URL',JSON.stringify('/ai-image-hall-frontend-prototype/')).replace("from './guangdang-guards'","from './guangdang-guards.mjs'");
  await writeFile(join(temporary,'guangdang-data.mjs'),compiled);
  await writeFile(join(temporary,'guangdang-guards.mjs'),await readFile(join(temporary,'guangdang-guards.js')));
  await writeFile(join(temporary,'mobile-editorial-data.mjs'),(await readFile(join(temporary,'mobile-editorial-data.js'),'utf8')).replace("from './guangdang-data'","from './guangdang-data.mjs'"));
  await writeFile(join(temporary,'experience-navigation.mjs'),await readFile(join(temporary,'experience-navigation.js')));
  for(const name of ['scenario-plans','scenario-hall-plans','scenario-bespoke-plans']) {
    const compiled=await readFile(join(temporary,name+'.js'),'utf8');
    await writeFile(join(temporary,name+'.mjs'),compiled.replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'"));
  }
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
  assert.deepEqual(navigation.experienceReturnFor('/experience-center?mode=template'),{to:'/hall',label:'返回AI影像馆'});
  assert.equal(navigation.experiencePathFor('custom'),'/experience-center?mode=custom');
});

test('contextual experience return survives mode changes and preserves the solution filter',()=>{
  const source='/category/brand?from=solutions&filter=hall';
  const route=navigation.experiencePathFor('template',source);
  const destination=navigation.experienceReturnFor(route);
  assert.equal(destination.to,source);
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
