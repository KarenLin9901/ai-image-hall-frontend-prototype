import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4191/ai-image-hall-frontend-prototype/';
const server = process.env.PREVIEW_URL ? null : spawn('npm', ['exec', 'vite', 'preview', '--', '--host', '127.0.0.1', '--port', '4191', '--strictPort'], { stdio: 'ignore' });
const themes = [
  { id: 'shenzhen-belike', category: 'brand', title: '我的深圳生活 belike' },
  { id: 'brand-0', category: 'brand', title: '来了就是深圳人' },
  { id: 'brand-1', category: 'brand', title: '我为品牌代言' },
  { id: 'event-0', category: 'event', title: '我的活动高光时刻' },
  { id: 'event-1', category: 'event', title: '专属节日影像' },
  { id: 'team-0', category: 'team', title: '我的职场成长影像' },
  { id: 'team-1', category: 'team', title: '我们团队的专属记忆' },
  { id: 'campus-0', category: 'campus', title: '我的毕业纪念影像' },
  { id: 'campus-1', category: 'campus', title: '我们的校园记忆' },
];
const themePath = theme => `/experience/${theme.category}/${theme.id}`;
const assertCooperationLink=async(locator,expected)=>{
 const href=await locator.getAttribute('href');
 assert.ok(href?.startsWith('#/cooperate?'),'project action must lead to the cooperation form with context');
 const parsed=new URL(href.slice(1),'https://prototype.invalid');
 assert.equal(parsed.pathname,'/cooperate');
 for(const [key,value] of Object.entries(expected))assert.equal(parsed.searchParams.get(key),value,`cooperation link must carry ${key}`);
 assert.doesNotMatch(decodeURIComponent(href),/blob:|data:image|ObjectURL/,'a project link must not contain a browser photo');
 return href;
};
const report = { base, status: 'running', checks: [], errors: [], mutationRequests: [], screenshots: [] };
let browser;
let page;
await mkdir('outputs', { recursive: true });
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  assert.ok(ready, `Preview did not become ready: ${base}`);
  browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  // Simulate both browser clipboard outcomes without changing the system clipboard.
  await context.addInitScript(() => {
    window.__copiedConfig = '';
    window.__rejectClipboard = false;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => {
      if (window.__rejectClipboard) throw new Error('Clipboard blocked for regression test');
      window.__copiedConfig = text;
    } } });
  });
  page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('request', request => {
    if (!['GET', 'HEAD'].includes(request.method())) report.mutationRequests.push({ method: request.method(), url: request.url() });
  });
  const waitRoute = async path => {
    await page.locator(`main[data-route="${path}"]`).waitFor();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  const route = async path => { await page.goto(`${base}#${path}`); await waitRoute(path.split('?')[0]); };
  const screenshot = async label => {
    const path = `outputs/product-journey-${label}.png`;
    await page.screenshot({ path }); report.screenshots.push(path);
  };
  const assertNoOverflow = async label => {
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: horizontal overflow`);
  };
  const categoryTitles = {
    hall: ['品牌推广与主题传播', '活动互动与用户体验', '企业文化与员工关怀', '校园与社群纪念'],
    bespoke: ['人物故事', '家庭记忆', '企业故事', '城市与历史'],
  };
  const assertDirections = async business => {
    const labels = await page.locator('select[name="direction"] option').allTextContents();
    for (const title of categoryTitles[business]) assert.ok(labels.includes(title), `${business} offers ${title}`);
    for (const title of categoryTitles[business === 'hall' ? 'bespoke' : 'hall']) assert.ok(!labels.includes(title), `${business} must not mix in ${title}`);
  };
  const selectedDirection = async () => page.locator('select[name="direction"]').evaluate(select => select.selectedOptions[0].textContent);
  const assertInquiryValues = async expected => {
    for (const [name, value] of Object.entries(expected)) assert.equal(await page.locator(`.demand-form [name="${name}"]`).inputValue(), value, `${name} is retained in this project context`);
  };
  const selectContent = async () => {
    const choices = [];
    for (const row of await page.locator('.option-row').all()) {
      const button = row.getByRole('button').first(); choices.push((await button.textContent()).trim()); await button.tap();
    }
    await page.getByRole('button', { name: '下一步：准备照片', exact: true }).tap();
    return choices;
  };

  await route('/');
  assert.equal(await page.locator('.home-choice').count(), 2);
  assert.equal((await page.locator('.me-home-hero h1').textContent()).replace(/\s+/g,''),'让参与成为影像，让故事被看见。');
  assert.equal(await page.locator('.mobile-editorial-home.me-home-compact > section').count(),2);assert.equal(await page.locator('.me-home-hero img,.me-home-featured,.me-outcome-band,.me-contact-band,.me-scroll-cue').count(),0);assert.equal(await page.locator('#home-products img').count(),2);
  assert.match(await page.locator('.home-choice[href="#/hall"]').innerText(), /模板化互动影像产品/);
  assert.match(await page.locator('.home-choice[href="#/bespoke"]').innerText(), /精品AI影像创作服务/);
  const nav = page.getByRole('navigation', { name: '底部导航' });
  assert.deepEqual(await nav.getByRole('link').allTextContents(), ['首页', '案例分享', '商务合作', '我']);
  assert.deepEqual(await nav.getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href'))), ['#/', '#/works', '#/cooperate', '#/mine']);
  assert.equal(await nav.getByRole('link', { name: '我的', exact: true }).count(), 0);
  assert.equal(await nav.getByRole('link', { name: '影像作品', exact: true }).count(), 0);
  for (const viewport of [{ width: 360, height: 640 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await route('/');
    const layout=await page.evaluate(()=>({height:innerHeight,scrollHeight:document.documentElement.scrollHeight}));
    assert.ok(layout.scrollHeight<=layout.height*2,`Home stays compact while keeping both products reachable: ${JSON.stringify({viewport,...layout})}`);
    for(const business of ['hall','bespoke']){
      const title=page.locator(`.home-choice[href="#/${business}"] h2`);
      await title.evaluate(el=>{const b=el.getBoundingClientRect(),top=document.querySelector('.topbar').getBoundingClientRect().bottom,bottom=document.querySelector('.mobile-nav').getBoundingClientRect().top;scrollBy({top:b.top+b.height/2-(top+bottom)/2,behavior:'instant'});});
      const target=await title.evaluate(el=>{const b=el.getBoundingClientRect(),hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return {hit:el===hit||el.contains(hit),top:b.top,bottom:b.bottom,headerBottom:document.querySelector('.topbar').getBoundingClientRect().bottom,navTop:document.querySelector('.mobile-nav').getBoundingClientRect().top};});
      assert.ok(target.hit&&target.top>=target.headerBottom&&target.bottom<=target.navTop,`${viewport.width} ${business}: entry reachable above navigation ${JSON.stringify(target)}`);
      await title.tap();await waitRoute('/'+business);await route('/');
    }
    await assertNoOverflow(`Home ${viewport.width}x${viewport.height}`);
  }
  await nav.getByRole('link', { name: '我', exact: true }).tap();
  await waitRoute('/mine');
  await page.getByRole('heading', { name: '我的', exact: true }).waitFor();
  assert.deepEqual(await nav.locator('a.active').allTextContents(), ['我']);
  assert.equal(await nav.getByRole('link', { name: '我', exact: true }).getAttribute('aria-current'), 'page');
  assert.equal(await page.locator('.mine-item').getByText('暂未开放', { exact: true }).count(), 2);
  await page.getByRole('button', { name: '返回首页', exact: true }).tap();
  await waitRoute('/');
  assert.deepEqual(await nav.locator('a.active').allTextContents(), ['首页']);
  await screenshot('home');
  report.checks.push('Home contains only a short brand opening and two direct image-led products at 360x640 and 390x844; both product entries are individually reachable above fixed navigation; four primary links include the exact label 我, which opens the pending account page, highlights correctly, and returns home');

  // The illustrated product page leads to scene details and honest sample preparation states.
  await route('/hall?section=applications');
  assert.equal(await page.locator('.editorial-product').count(), 1);
  assert.equal(await page.getByRole('tab').count(), 0);
  await page.locator('a.scenario-card[href="#/category/event"]').tap();
  await waitRoute('/category/event');
  await page.getByRole('heading', { name: '我的活动高光时刻', exact: true, level: 1 }).waitFor();
  assert.match(await page.locator('.me-plan-hero .me-eyebrow').innerText(),/活动互动与用户体验/);assert.equal(await page.locator('.me-choice-card').count(),3);
  await page.locator('.back-button').tap(); await waitRoute('/hall');
  assert.equal(await page.locator('.scenario-grid a.scenario-card').count(), 4);
  await page.locator('.editorial-experience').getByRole('link', { name: '立即体验', exact: true }).tap();
  await waitRoute('/samples/hall');
  assert.equal(await page.locator('.legacy-theme-library').getAttribute('open'), null, 'theme configuration starts as a secondary disclosure');
  await page.getByRole('heading', { name: '样片制作中', exact: true }).waitFor();
  assert.equal(await page.locator('video').count(), 0);
  await page.locator('.legacy-theme-library summary').tap();
  assert.notEqual(await page.locator('.legacy-theme-library').getAttribute('open'), null);
  await nav.getByRole('link', { name: '案例分享', exact: true }).tap(); await waitRoute('/works');
  await page.getByRole('heading', { name: '案例分享', exact: true }).waitFor();
  await page.goBack(); await waitRoute('/samples/hall');
  assert.notEqual(await page.locator('.legacy-theme-library').getAttribute('open'), null, 'Returning to samples keeps the explicitly opened preview');
  report.checks.push('Illustrated product and scenario pages lead to the pending sample area; the legacy preview stays secondary and keeps its expanded state after Case Sharing and native Back');

  // Every theme is visible in the catalogue and enters its own configuration in one action.
  for (const theme of themes) {
    await route('/samples/hall?preview=themes');
    await page.locator('.experience-filters').getByRole('button', { name: '全部主题', exact: true }).tap();
    assert.equal(await page.locator('a.theme-card').count(), 9);
    for (const entry of themes) assert.equal(await page.getByRole('link', { name: '使用主题：' + entry.title, exact: true }).count(), 1);
    const card = page.locator(`a.theme-card[data-theme="${theme.id}"]`);
    assert.equal(await card.getAttribute('href'), '#' + themePath(theme));
    await card.tap();
    await waitRoute(themePath(theme));
    await page.getByRole('heading', { name: theme.title, exact: true }).waitFor();
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await page.locator('.option-row').count(), 3);
    assert.match(await page.locator('.theme-config').innerText(), /单人主角|单人.*主角/);
    assert.ok(await page.getByText('生成未开放', { exact: true }).isVisible());
    await assertCooperationLink(page.locator('a.theme-project-link'), { product: 'hall', direction: theme.category, theme: theme.id, source: 'theme' });
    await assertNoOverflow(theme.title);
  }
  report.checks.push('All nine whole-card catalogue entries open their own configuration directly, with generation status visible');

  // Completing a plan requires no personal photo and creates no fake generation output.
  const theme = themes[8];
  await route(themePath(theme));
  const choices = await selectContent();
  assert.equal(await page.getByRole('button', { name: '男性', exact: true }).count(), 0);
  assert.equal(await page.getByRole('button', { name: '女性', exact: true }).count(), 0);
  const skip = page.getByRole('button', { name: '暂不选照片，确认配置', exact: true });
  assert.equal(await skip.isEnabled(), true);
  await skip.tap();
  await page.getByRole('heading', { name: '确认你的选择', exact: true }).waitFor();
  assert.equal(await page.locator('.summary-photo img').count(), 0);
  assert.equal(await page.locator('.summary-photo strong').textContent(), '未选择照片');
  assert.equal(await page.locator('main h1').textContent(), theme.title);
  assert.deepEqual(await page.locator('.summary-list dd').allTextContents(), choices);
  assert.equal(await page.getByRole('button', { name: '生成暂未开放', exact: true }).isDisabled(), true);
  assert.equal(await page.getByRole('button', { name: '复制我的配置', exact: true }).isEnabled(), true);
  await screenshot('confirmation-without-photo');
  const steps = page.locator('.step-tabs');
  assert.equal(await steps.getByRole('button').count(), 3);
  await steps.getByRole('button', { name: /^1\s*选择内容$/ }).tap();
  assert.deepEqual(await page.locator('.option.selected').allTextContents(), choices);
  await steps.getByRole('button', { name: /^3\s*确认信息$/ }).tap();
  await page.getByRole('heading', { name: '确认你的选择', exact: true }).waitFor();

  await page.getByRole('button', { name: '修改内容', exact: true }).tap();
  assert.deepEqual(await page.locator('.option.selected').allTextContents(), choices);
  const newChoice = page.locator('.option-row').first().getByRole('button').nth(1);
  choices[0] = (await newChoice.textContent()).trim();
  await newChoice.tap();
  await page.getByRole('button', { name: '下一步：准备照片', exact: true }).tap();
  await skip.tap();
  assert.deepEqual(await page.locator('.summary-list dd').allTextContents(), choices);
  await page.getByRole('button', { name: '修改照片', exact: true }).tap();
  assert.ok(await skip.isEnabled());
  await skip.tap();
  report.checks.push('Photo-free configuration, revisiting completed steps, direct content editing, and returning from optional photo preserve the other choices');

  await page.getByRole('button', { name: '复制我的配置', exact: true }).tap();
  const copied = await page.evaluate(() => window.__copiedConfig);
  assert.match(copied, new RegExp(theme.title));
  for (const choice of choices) assert.ok(copied.includes(choice), `Copied plan should include ${choice}`);
  assert.doesNotMatch(copied, /blob:/, 'A shared plan must not expose a browser-only photo URL');
  assert.match(copied, /未开放|未生成|尚未生成/, 'Copied content must distinguish configuration from generated output');
  assert.ok(await page.getByRole('status').filter({ hasText: '配置已复制' }).isVisible());
  await page.evaluate(() => { window.__rejectClipboard = true; });
  await page.getByRole('button', { name: '复制我的配置', exact: true }).tap();
  const copyDialog = page.getByRole('dialog');
  await copyDialog.getByRole('heading', { name: '我的主题配置', exact: true }).waitFor();
  const fallback = copyDialog.getByLabel('我的配置摘要', { exact: true });
  assert.equal(await fallback.getAttribute('readonly'), '');
  assert.equal(await fallback.inputValue(), copied);
  await screenshot('manual-copy-fallback');
  await copyDialog.getByRole('button', { name: '关闭', exact: true }).tap();
  report.checks.push('Configuration can be copied with truthful state; a blocked clipboard provides selectable text instead of a dead end');

  // A buyer can carry a chosen theme into a project without exposing the local participant photo.
  await page.getByRole('button', { name: '修改照片', exact: true }).tap();
  await page.getByLabel('选择照片', { exact: true }).setInputFiles(fileURLToPath(new URL('../public/images/v4/live-futian.jpg',import.meta.url)));
  await page.getByText('正在检查照片…', { exact: true }).waitFor({ state: 'hidden' });
  const projectPhoto = await page.locator('.upload-box img').getAttribute('src');
  assert.match(projectPhoto, /^blob:/);
  await page.getByRole('checkbox', { name: '我确认已获得这张照片的使用授权', exact: true }).check();
  await page.getByRole('button', { name: '下一步：确认信息', exact: true }).tap();
  const bridge = page.locator('.project-bridge').getByRole('link', { name: '整理合作需求', exact: true });
  await assertCooperationLink(bridge, { product: 'hall', direction: theme.category, theme: theme.id, source: 'theme' });
  await bridge.tap(); await waitRoute('/cooperate');
  await assertDirections('hall');
  assert.equal(await selectedDirection(), '校园与社群纪念');
  const projectContext = await page.locator('.inquiry-context').innerText();
  assert.ok(projectContext.includes('AI影像馆') && projectContext.includes(theme.title));
  for (const choice of choices) assert.ok(projectContext.includes(choice), `Project reference carries ${choice}`);
  assert.doesNotMatch(await page.url(), /blob:|data:image/);
  assert.equal(await page.locator('main img[src^="blob:"]').count(), 0, 'The cooperation page must not receive a participant photo');
  for (const name of ['organization', 'timing', 'scope', 'name', 'contact']) assert.equal(await page.locator(`.demand-form [name="${name}"]`).getAttribute('required'), null, `${name} remains optional`);
  const buyerFields = { description: '回归测试：为毕业纪念项目规划主题互动。', organization: '测试项目组', timing: '计划于毕业季开展', scope: '主题互动与一份项目交付方案' };
  for (const [name, value] of Object.entries(buyerFields)) await page.locator(`.demand-form [name="${name}"]`).fill(value);
  await page.getByRole('button', { name: '整理需求摘要', exact: true }).tap();
  let buyerSummary = page.getByRole('dialog', { name: '你的需求摘要', exact: true });
  await buyerSummary.waitFor();
  const projectSummary = await buyerSummary.getByLabel('需求摘要', { exact: true }).inputValue();
  for (const value of ['AI影像馆', theme.title, ...choices, ...Object.values(buyerFields)]) assert.ok(projectSummary.includes(value), `Project summary includes ${value}`);
  assert.match(projectSummary, /尚未发送/);
  assert.doesNotMatch(projectSummary, /blob:|data:image/);
  assert.equal(await page.locator('input[name="name"]').inputValue(), '');
  assert.equal(await page.locator('input[name="contact"]').inputValue(), '');
  await page.evaluate(() => { window.__rejectClipboard = false; });
  await buyerSummary.getByRole('button', { name: '复制需求摘要', exact: true }).tap();
  assert.equal(await page.evaluate(() => window.__copiedConfig), projectSummary);
  await page.evaluate(() => { window.__rejectClipboard = true; });
  await buyerSummary.locator('.action-row button').first().tap();
  assert.equal(await buyerSummary.getByLabel('需求摘要', { exact: true }).inputValue(), projectSummary);
  assert.equal(await buyerSummary.getByLabel('需求摘要', { exact: true }).getAttribute('readonly'), '', 'Blocked copying must leave manually selectable summary text');
  await buyerSummary.getByRole('button', { name: '返回修改', exact: true }).tap();
  await assertInquiryValues(buyerFields);
  await page.locator('.back-button').tap(); await waitRoute(themePath(theme));
  await page.getByRole('heading', { name: '确认你的选择', exact: true }).waitFor();
  assert.deepEqual(await page.locator('.summary-list dd').allTextContents(), choices);
  assert.equal(await page.locator('.summary-photo img').getAttribute('src'), projectPhoto, 'Returning to participant configuration preserves its local photo');
  await page.locator('.project-bridge').getByRole('link', { name: '整理合作需求', exact: true }).tap();
  await waitRoute('/cooperate'); await assertInquiryValues(buyerFields);
  await screenshot('theme-project-context');
  await page.locator('.back-button').tap(); await waitRoute(themePath(theme));
  report.checks.push('Theme-to-project handoff carries the product, theme, and selected words; contact details stay optional, the photo stays in participant memory, copying has a fallback, and source return/re-entry retains both drafts');

  // A dirty theme change is reversible until the user explicitly confirms discarding the plan.
  await page.getByRole('link', { name: '更换主题', exact: true }).tap();
  await waitRoute('/samples/hall');
  await page.getByRole('link', { name: '使用主题：' + themes[0].title, exact: true }).tap();
  let guard = page.getByRole('dialog');
  await guard.getByRole('heading', { name: '更换主题？', exact: true }).waitFor();
  await guard.getByRole('button', { name: '保留当前配置', exact: true }).tap();
  await waitRoute('/samples/hall');
  await page.getByRole('link', { name: '使用主题：' + theme.title, exact: true }).tap();
  await waitRoute(themePath(theme));
  await page.getByRole('heading', { name: '确认你的选择', exact: true }).waitFor();
  assert.deepEqual(await page.locator('.summary-list dd').allTextContents(), choices);
  await page.getByRole('link', { name: '更换主题', exact: true }).tap();
  await waitRoute('/samples/hall');
  await page.getByRole('link', { name: '使用主题：' + themes[0].title, exact: true }).tap();
  guard = page.getByRole('dialog');
  await guard.getByRole('button', { name: '更换并清空', exact: true }).tap();
  await waitRoute(themePath(themes[0]));
  assert.equal(await page.locator('.option.selected').count(), 0);
  assert.equal(await page.getByRole('button', { name: '下一步：准备照片', exact: true }).isDisabled(), true);
  report.checks.push('Cancelling a theme switch preserves the complete plan; confirming starts a clean unrelated theme');

  await route('/samples/bespoke?category=enterprise');
  await page.getByRole('heading', { name: '高定样片', exact: true }).waitFor();
  await page.getByRole('heading', { name: '样片制作中', exact: true }).waitFor();
  assert.equal(await page.locator('.samples-page video').count(), 0);
  assert.equal(await page.locator('.samples-page > header p').textContent(), '企业故事');
  const sampleInquiry = page.getByRole('link', { name: '整理合作需求', exact: true });
  await assertCooperationLink(sampleInquiry, { product: 'bespoke', direction: 'enterprise', source: 'samples' });
  await sampleInquiry.tap();
  await waitRoute('/cooperate');
  await page.getByRole('heading', { name: '合作需求', exact: true }).waitFor();
  assert.equal(await page.locator('.page-intro p').textContent(), '明确项目目标，整理合作范围。');
  assert.equal(await page.locator('.consultation-state').textContent(), '可先整理并复制需求，正式咨询待开放。');
  assert.equal(await page.locator('.demand-form .field-hint').textContent(), '仅本机临时保留，刷新后清空。不会上传或发送。');
  assert.equal(await page.locator('input[name="name"]').getAttribute('required'), null);
  assert.equal(await page.locator('input[name="contact"]').getAttribute('required'), null);
  assert.equal(await selectedDirection(), '企业故事');
  await assertDirections('bespoke');
  const description = '产品回归测试：希望梳理一段企业故事，尚未发送。';
  await page.locator('textarea[name="description"]').fill(description);
  await page.locator('.demand-form button[type="submit"]').tap();
  const summary = page.getByRole('dialog');
  await summary.getByRole('heading', { name: '你的需求摘要', exact: true }).waitFor();
  assert.equal(await summary.locator('.notice').textContent(), '尚未发送 · 可复制留存');
  const summaryText = await summary.getByLabel('需求摘要', { exact: true }).inputValue();
  assert.ok(summaryText.includes(description));
  assert.match(summaryText, /尚未发送/);
  assert.doesNotMatch(summaryText, /已联系的项目对接人/);
  await summary.getByRole('button', { name: '返回修改', exact: true }).tap();
  assert.equal(await page.locator('textarea[name="description"]').inputValue(), description);
  assert.equal(await page.locator('input[name="name"]').inputValue(), '');
  assert.equal(await page.locator('input[name="contact"]').inputValue(), '');
  report.checks.push('Bespoke uses a clear planning action; an unsigned local demand summary needs no personal contact details and remains editable');

  await page.locator('.back-button').tap(); await waitRoute('/samples/bespoke');
  assert.equal(await page.locator('.samples-page > header p').textContent(), '企业故事');
  await page.getByRole('link', { name: '整理合作需求', exact: true }).tap();
  await waitRoute('/cooperate');
  assert.equal(await page.locator('textarea[name="description"]').inputValue(), description, 'The same sample-direction context restores the buyer draft');

  // A product introduction and a commercial application each return to their own source.
  await route('/hall?section=introduction');
  const productInquiry = page.locator('.editorial-experience').getByRole('link', { name: '整理合作需求', exact: true }).first();
  await assertCooperationLink(productInquiry, { product: 'hall', source: 'product', section: 'introduction' });
  await productInquiry.tap(); await waitRoute('/cooperate'); await assertDirections('hall');
  assert.equal(await page.locator('textarea[name="description"]').inputValue(), '', 'A new hall product context must not inherit an unrelated bespoke inquiry');
  const undecided = await page.locator('select[name="direction"]').evaluate(select => Array.from(select.options).find(option => option.textContent.includes('尚未确定')).value);
  await page.locator('select[name="direction"]').selectOption(undecided);
  const productDescription = '测试项目：希望了解主题互动合作范围。';
  await page.locator('textarea[name="description"]').fill(productDescription);
  await page.locator('.back-button').tap(); await waitRoute('/hall');
  await page.waitForFunction(() => window.location.hash === '#/hall?section=introduction');
  assert.equal(await page.locator('.editorial-product[data-business="hall"]').count(), 1);
  assert.ok((await page.locator('.editorial-overview').innerText()).length > 50);
  await page.locator('.editorial-experience').getByRole('link', { name: '整理合作需求', exact: true }).first().tap();
  await waitRoute('/cooperate');
  assert.equal(await page.locator('textarea[name="description"]').inputValue(), productDescription);
  assert.ok((await selectedDirection()).includes('尚未确定'));
  await page.getByRole('button', { name: '整理需求摘要', exact: true }).tap();
  buyerSummary = page.getByRole('dialog', { name: '你的需求摘要', exact: true }); await buyerSummary.waitFor();
  assert.ok((await buyerSummary.getByLabel('需求摘要', { exact: true }).inputValue()).includes('AI影像馆'));
  await buyerSummary.getByRole('button', { name: '返回修改', exact: true }).tap();

  await route('/category/city');
  const applicationInquiry = page.getByRole('link', { name: '整理合作需求', exact: true }).first();
  await assertCooperationLink(applicationInquiry, { product: 'bespoke', direction: 'city', source: 'application' });
  await applicationInquiry.tap(); await waitRoute('/cooperate'); await assertDirections('bespoke');
  assert.equal(await selectedDirection(), '城市与历史');
  const cityDescription = '测试项目：围绕街区历史策划一部城市记忆影片。';
  await page.locator('textarea[name="description"]').fill(cityDescription);
  await page.locator('.back-button').tap(); await waitRoute('/category/city');
  await page.getByRole('link', { name: '整理合作需求', exact: true }).first().tap();
  await waitRoute('/cooperate');
  assert.equal(await page.locator('textarea[name="description"]').inputValue(), cityDescription);
  await page.reload(); await waitRoute('/cooperate');
  assert.equal(await selectedDirection(), '城市与历史', 'A shareable source context survives refresh');
  for (const name of ['description', 'organization', 'timing', 'scope', 'name', 'contact']) assert.equal(await page.locator(`.demand-form [name="${name}"]`).inputValue(), '', 'Refresh clears local inquiry drafts');
  report.checks.push('Illustrated-product and application inquiries preserve their own source, direction, and temporary draft; a new context stays separate, and refresh retains only shareable source information');

  // Existing links still work, while an explicitly chosen product cannot preselect the other product's direction.
  await route('/cooperate?direction=family');
  assert.equal(await selectedDirection(), '家庭记忆');
  await page.locator('.back-button').tap(); await waitRoute('/category/family');
  await route('/cooperate?product=hall&direction=family'); await assertDirections('hall');
  assert.notEqual(await selectedDirection(), '家庭记忆', 'A hall inquiry must reject a bespoke category');
  await route('/cooperate');
  const genericDirections = await page.locator('select[name="direction"] option').allTextContents();
  for (const title of [...categoryTitles.hall, ...categoryTitles.bespoke]) assert.ok(genericDirections.includes(title));
  await page.locator('.back-button').tap(); await waitRoute('/');
  report.checks.push('Legacy direction links return to the matching application; mismatched product directions are rejected; the generic cooperation entry keeps all eight directions and returns home');

  for (const path of ['/mine', '/works']) { await route(path); assert.equal(await page.getByRole('heading', { name: '暂时没有这个页面', exact: true }).count(), 0); }
  assert.deepEqual(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })), { local: 0, session: 0 });
  report.checks.push('Mine and Works routes remain compatible; no plan or personal information is persisted to browser storage');
  // Cancelling browser Back must restore the history position without overwriting its original destination.
  // A query change forces a clean document so only these two theme entries participate in this check.
  const historyUrl = new URL(base);
  historyUrl.searchParams.set('history-case', '1');
  historyUrl.hash = themePath(themes[0]);
  await page.goto(historyUrl.href);
  await waitRoute(themePath(themes[0]));
  assert.equal(await page.locator('.option.selected').count(), 0);
  await page.evaluate(path => { window.location.hash = path; }, themePath(themes[8]));
  await waitRoute(themePath(themes[8]));
  const historyChoices = [];
  for (const row of await page.locator('.option-row').all()) {
    const button = row.getByRole('button').first();
    historyChoices.push((await button.textContent()).trim());
    await button.tap();
  }
  await page.goBack();
  await page.getByRole('dialog').getByRole('heading', { name: '更换主题？', exact: true }).waitFor();
  await page.getByRole('dialog').getByRole('button', { name: '保留当前配置', exact: true }).tap();
  await waitRoute(themePath(themes[8]));
  await page.waitForFunction(path => window.location.hash === '#' + path, themePath(themes[8]));
  assert.deepEqual(await page.locator('.option.selected').allTextContents(), historyChoices);
  await page.goBack();
  await page.getByRole('dialog').getByRole('heading', { name: '更换主题？', exact: true }).waitFor();
  await page.getByRole('dialog').getByRole('button', { name: '更换并清空', exact: true }).tap();
  await waitRoute(themePath(themes[0]));
  await page.waitForFunction(path => window.location.hash === '#' + path, themePath(themes[0]));
  assert.equal(await page.locator('main h1').textContent(), themes[0].title);
  assert.equal(await page.locator('.option.selected').count(), 0);
  assert.equal(await page.getByRole('button', { name: '下一步：准备照片', exact: true }).isDisabled(), true);
  report.checks.push('Native browser Back can be cancelled without losing choices or corrupting its history destination; repeating Back still offers the original theme and a clean confirmed switch');
  assert.deepEqual(report.errors, [], 'Browser runtime errors');
  assert.deepEqual(report.mutationRequests, [], 'Review prototype must not upload a photo, create a task, or submit a lead');
  report.status = 'passed';
  console.log(JSON.stringify(report));
} catch (error) {
  report.status = 'failed'; report.failure = error.stack || String(error);
  if (page) { try { await page.screenshot({ path: 'outputs/product-journey-failure.png' }); } catch {} }
  throw error;
} finally {
  await writeFile('outputs/product-journey-report.json', JSON.stringify(report, null, 2));
  await browser?.close();
  server?.kill('SIGTERM');
}
