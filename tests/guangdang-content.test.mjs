import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const temporary=await mkdtemp(join(tmpdir(),'guangdang-content-'));
let data,guards,editorial;
try {
  execFileSync(process.execPath,[resolve(root,'node_modules/typescript/bin/tsc'),'app/guangdang-data.ts','app/guangdang-guards.ts','app/mobile-editorial-data.ts','--target','ES2022','--module','ESNext','--moduleResolution','Bundler','--types','vite/client','--skipLibCheck','--outDir',temporary],{cwd:root,stdio:'pipe'});
  const compiled=(await readFile(join(temporary,'guangdang-data.js'),'utf8')).replaceAll('import.meta.env.BASE_URL',JSON.stringify('/ai-image-hall-frontend-prototype/')).replace("from './guangdang-guards'","from './guangdang-guards.mjs'");
  await writeFile(join(temporary,'guangdang-data.mjs'),compiled);
  await writeFile(join(temporary,'guangdang-guards.mjs'),await readFile(join(temporary,'guangdang-guards.js')));
  await writeFile(join(temporary,'mobile-editorial-data.mjs'),(await readFile(join(temporary,'mobile-editorial-data.js'),'utf8')).replace("from './guangdang-data'","from './guangdang-data.mjs'"));
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
    assert.equal(plan.title,data.scenarioExamples[id].title);
    for(const field of ['kicker','summary','audience','image','imageLabel'])assert.ok(plan[field]?.trim(),`${id}: ${field}`);
    assert.equal(plan.choices.length,3);assert.equal(plan.journey.length,3);
    for(const choice of plan.choices){assert.ok(choice.title.trim());assert.ok(choice.items.length>=2&&choice.items.every(item=>item.trim()));assert.ok(choice.meaning.trim().length>=15);}
    for(const step of plan.journey){assert.ok(step.title.trim());assert.ok(step.description.trim().length>=15);}
    for(const value of [plan.outcome,plan.participantValue,plan.projectValue]){assert.ok(value.title.trim());assert.ok(value.description.trim().length>=15);}
    assert.ok(plan.outcome.extras.trim().length>=15);assert.ok(plan.preparation.length>=3&&plan.preparation.every(item=>item.trim()));
    assert.ok(['概念示意','成果示意','场景参考'].includes(plan.imageLabel));
    assert.doesNotMatch(JSON.stringify(plan),/已上线|实时生成|自动获客|可用API/);
  }
});

test('editorial previews match configured choices and preserve retirement and commissioning boundaries',()=>{
  for(const [id,themeId] of [['brand','brand-1'],['event','event-0'],['campus','campus-0']]){
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
