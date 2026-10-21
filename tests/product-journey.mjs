import assert from 'node:assert/strict';
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
  assert.match(await page.locator('.home-choice[href="#/hall"]').innerText(), /选主题体验/);
  assert.match(await page.locator('.home-choice[href="#/bespoke"]').innerText(), /专属故事定制/);
  const nav = page.getByRole('navigation', { name: '底部导航' });
  assert.deepEqual(await nav.getByRole('link').allTextContents(), ['首页', '主题体验', '商务合作', '我']);
  assert.deepEqual(await nav.getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href'))), ['#/', '#/hall', '#/cooperate', '#/mine']);
  assert.equal(await nav.getByRole('link', { name: '我的', exact: true }).count(), 0);
  assert.equal(await nav.getByRole('link', { name: '影像作品', exact: true }).count(), 0);
  for (const viewport of [{ width: 360, height: 640 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const layout = await page.evaluate(() => ({
      height: innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      navTop: document.querySelector('.mobile-nav').getBoundingClientRect().top,
      choicesBottom: document.querySelector('.home-choice:last-child').getBoundingClientRect().bottom,
    }));
    assert.ok(layout.scrollHeight <= layout.height + 1, `Four-item navigation must preserve one-screen home: ${JSON.stringify({ viewport, ...layout })}`);
    assert.ok(layout.choicesBottom <= layout.navTop, `Home actions must remain clear of four-item navigation: ${JSON.stringify({ viewport, ...layout })}`);
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
  report.checks.push('Home remains one screen at 360x640 and 390x844; four primary links include the exact label 我, which opens the pending account page, highlights correctly, and returns home');

  // The overview exposes every theme in one place, and all nine still enter the correct direct configuration.
  for (const theme of themes) {
    await route('/hall');
    await page.getByRole('button', { name: '全部主题', exact: true }).tap();
    const overview = page.getByRole('dialog');
    await overview.getByRole('heading', { name: '选择影像主题', exact: true }).waitFor();
    for (const entry of themes) assert.equal(await overview.getByRole('button', { name: entry.title, exact: true }).count(), 1);
    assert.equal(await overview.locator('img').count(), 9);
    await overview.getByRole('button', { name: theme.title, exact: true }).tap();
    await waitRoute(themePath(theme));
    await page.getByRole('heading', { name: theme.title, exact: true }).waitFor();
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await page.locator('.option-row').count(), 3);
    assert.match(await page.locator('.theme-config').innerText(), /单人主角|单人.*主角/);
    assert.ok(await page.getByText('生成未开放', { exact: true }).isVisible());
    await assertNoOverflow(theme.title);
  }
  report.checks.push('All nine overview entries directly open their own configuration, with generation status visible');

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

  // A dirty theme change is reversible until the user explicitly confirms discarding the plan.
  await page.getByRole('link', { name: '更换主题', exact: true }).tap();
  await waitRoute('/hall');
  await page.getByRole('button', { name: '全部主题', exact: true }).tap();
  await page.getByRole('dialog').getByRole('button', { name: themes[0].title, exact: true }).tap();
  let guard = page.getByRole('dialog');
  await guard.getByRole('heading', { name: '更换主题？', exact: true }).waitFor();
  await guard.getByRole('button', { name: '保留当前配置', exact: true }).tap();
  await waitRoute('/hall');
  await page.getByRole('button', { name: '全部主题', exact: true }).tap();
  await page.getByRole('dialog').getByRole('button', { name: theme.title, exact: true }).tap();
  await waitRoute(themePath(theme));
  await page.getByRole('heading', { name: '确认你的选择', exact: true }).waitFor();
  assert.deepEqual(await page.locator('.summary-list dd').allTextContents(), choices);
  await page.getByRole('link', { name: '更换主题', exact: true }).tap();
  await waitRoute('/hall');
  await page.getByRole('button', { name: '全部主题', exact: true }).tap();
  await page.getByRole('dialog').getByRole('button', { name: themes[0].title, exact: true }).tap();
  guard = page.getByRole('dialog');
  await guard.getByRole('button', { name: '更换并清空', exact: true }).tap();
  await waitRoute(themePath(themes[0]));
  assert.equal(await page.locator('.option.selected').count(), 0);
  assert.equal(await page.getByRole('button', { name: '下一步：准备照片', exact: true }).isDisabled(), true);
  report.checks.push('Cancelling a theme switch preserves the complete plan; confirming starts a clean unrelated theme');

  await route('/bespoke');
  await page.getByRole('heading', { name: '定制方向', exact: true }).waitFor();
  assert.equal(await page.locator('.sample-pending').count(), 4);
  assert.equal(await page.locator('.preview-slide video').count(), 0);
  await page.locator('.preview-slide').first().getByRole('link', { name: '了解创作', exact: true }).tap();
  await page.getByRole('link', { name: '整理定制需求', exact: true }).tap();
  await waitRoute('/cooperate');
  assert.equal(await page.locator('input[name="name"]').getAttribute('required'), null);
  assert.equal(await page.locator('input[name="contact"]').getAttribute('required'), null);
  assert.equal(await page.locator('select[name="direction"]').inputValue(), '人物故事');
  const description = '产品回归测试：希望梳理一段人物故事，尚未发送。';
  await page.locator('textarea[name="description"]').fill(description);
  await page.locator('.demand-form button[type="submit"]').tap();
  const summary = page.getByRole('dialog');
  await summary.getByRole('heading', { name: '你的需求摘要', exact: true }).waitFor();
  const summaryText = await summary.getByLabel('需求摘要', { exact: true }).inputValue();
  assert.ok(summaryText.includes(description));
  assert.match(summaryText, /尚未发送/);
  assert.doesNotMatch(summaryText, /已联系的项目对接人/);
  await summary.getByRole('button', { name: '返回修改', exact: true }).tap();
  assert.equal(await page.locator('textarea[name="description"]').inputValue(), description);
  assert.equal(await page.locator('input[name="name"]').inputValue(), '');
  assert.equal(await page.locator('input[name="contact"]').inputValue(), '');
  report.checks.push('Bespoke uses a clear planning action; an unsigned local demand summary needs no personal contact details and remains editable');

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
