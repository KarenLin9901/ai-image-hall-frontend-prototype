import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4189/ai-image-hall-frontend-prototype/';
const server = process.env.PREVIEW_URL ? null : spawn('npm', ['exec', 'vite', 'preview', '--', '--host', '127.0.0.1', '--port', '4189', '--strictPort'], { stdio: 'ignore' });
const report = { base, viewports: [], errors: [], mutationRequests: [], screenshots: [] };
const themes = [
  { filter: '城市品牌', count: 3, id: 'shenzhen-belike', category: 'brand', title: '我的深圳生活 belike' },
  { filter: '活动节庆', count: 2, id: 'event-1', category: 'event', title: '专属节日影像' },
  { filter: '校园青春', count: 2, id: 'campus-1', category: 'campus', title: '我们的校园记忆' },
];
const pathFor = theme => `/experience/${theme.category}/${theme.id}`;
let browser;
let activePage;
await mkdir('outputs', { recursive: true });
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  assert.ok(ready, `Preview did not become ready: ${base}`);
  browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  for (const viewport of [{ width: 360, height: 640 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await context.addInitScript(() => {
      window.__createdObjectUrls = [];
      window.__revokedObjectUrls = [];
      const create = URL.createObjectURL.bind(URL);
      const revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = object => { const url = create(object); window.__createdObjectUrls.push(url); return url; };
      URL.revokeObjectURL = url => { window.__revokedObjectUrls.push(url); return revoke(url); };
    });
    const page = activePage = await context.newPage();
    page.setDefaultTimeout(12000);
    page.on('pageerror', error => report.errors.push({ viewport, message: error.message }));
    page.on('request', request => {
      if (!['GET', 'HEAD'].includes(request.method())) report.mutationRequests.push({ viewport, method: request.method(), url: request.url() });
    });
    const result = { viewport, checks: [], transitions: [], listReturns: [], releasedPhotos: [] };
    report.viewports.push(result);
    const waitRoute = async path => {
      await page.locator(`main[data-route="${path}"]`).waitFor();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    };
    const atTop = async label => {
      await page.waitForFunction(() => window.scrollY === 0);
      const layout = await page.evaluate(() => {
        const box = selector => { const element = document.querySelector(selector); if (!element) return null; const r = element.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; };
        return { scrollY, header: box('.topbar'), back: box('.back-button'), heading: box('main h1'), tabs: document.querySelector('.step-tabs') ? box('.step-tabs') : null, nav: box('.mobile-nav'), overflow: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      assert.equal(layout.scrollY, 0, `${label}: step/route must reset vertical scroll`);
      if (layout.back) assert.ok(layout.back.top >= layout.header.bottom - 1, `${label}: return button covered by sticky header ${JSON.stringify(layout)}`);
      assert.ok(layout.heading.top >= layout.header.bottom - 1, `${label}: title covered by sticky header`);
      assert.ok(layout.heading.bottom < layout.nav.top, `${label}: title covered by bottom navigation`);
      if (layout.tabs) {
        assert.ok(layout.tabs.top >= layout.header.bottom - 1, `${label}: step indicator covered by sticky header`);
        assert.ok(layout.tabs.bottom <= layout.nav.top, `${label}: step indicator covered by bottom navigation`);
      }
      assert.equal(layout.overflow, false, `${label}: horizontal overflow`);
      result.transitions.push({ label, ...layout });
    };
    const screenshot = async label => {
      const file = `outputs/mobile-navigation-${viewport.width}x${viewport.height}-${label}.png`;
      await page.screenshot({ path: file }); report.screenshots.push(file);
    };
    const moveTo = async theme => {
      await waitRoute('/samples/hall');
      const library=page.locator('details.legacy-theme-library');
      if(await library.getAttribute('open')===null)await library.locator('summary').tap();
      await page.locator('.experience-filters').getByRole('button', { name: theme.filter, exact: true }).tap();
      assert.equal(await page.locator('a.theme-card').count(), theme.count, 'the selected filter must show its matching themes');
      const card = page.locator(`a.theme-card[data-theme="${theme.id}"]`);
      await card.scrollIntoViewIfNeeded();
      await card.evaluate(element => {
        const r = element.getBoundingClientRect();
        const header = document.querySelector('.topbar').getBoundingClientRect();
        const nav = document.querySelector('.mobile-nav').getBoundingClientRect();
        if (r.top < header.bottom + 8) window.scrollBy({ top: r.top - header.bottom - 12, behavior: 'instant' });
        else if (r.bottom > nav.top - 8) window.scrollBy({ top: r.bottom - nav.top + 12, behavior: 'instant' });
      });
      return { scrollY: await page.evaluate(() => window.scrollY), filter: theme.filter };
    };
    const enter = async theme => {
      const position = await moveTo(theme);
      await page.getByRole('link', { name: '使用主题：' + theme.title, exact: true }).tap();
      await waitRoute(pathFor(theme));
      assert.equal(await page.locator('main h1').textContent(), theme.title);
      assert.equal(await page.locator('.option-row').count(), 3);
      await atTop(`enter ${theme.id}`);
      return position;
    };
    const assertListRestored = async (theme, position, method) => {
      assert.notEqual(await page.locator('details.legacy-theme-library').getAttribute('open'), null, `${method}: keep the preview library expanded`);
      assert.equal(await page.locator('a.theme-card').count(), theme.count, `${method}: retain the active theme filter`);
      const card = page.locator(`a.theme-card[data-theme="${theme.id}"]`);
      assert.ok(await card.evaluate(element => element.classList.contains('last-used')), `${method}: mark the last visited theme`);
      await page.waitForFunction(expected => Math.abs(window.scrollY - expected) <= 2, position.scrollY);
      result.listReturns.push({ theme: theme.id, method, filter: theme.filter, scrollY: await page.evaluate(() => window.scrollY) });
    };
    const bottomTap = async (name, label) => {
      const button = page.getByRole('button', { name, exact: true });
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await button.scrollIntoViewIfNeeded();
      await button.evaluate(element => {
        const r = element.getBoundingClientRect(); const nav = document.querySelector('.mobile-nav').getBoundingClientRect();
        if (r.bottom > nav.top - 8) window.scrollBy({ top: r.bottom - nav.top + 16, behavior: 'instant' });
      });
      const before = await page.evaluate(() => ({ scrollY, scrollable: document.documentElement.scrollHeight > innerHeight + 1 }));
      if (before.scrollable) assert.ok(before.scrollY > 0, `${label}: exercise transition after scrolling when the page is scrollable`);
      assert.equal(await button.isEnabled(), true, `${label}: control should be actionable`);
      await button.tap();
      await atTop(label);
    };
    const preparePhoto = async file => {
      await page.getByLabel('选择照片', { exact: true }).setInputFiles(file);
      const photo = await page.locator('.upload-box img').getAttribute('src');
      await page.getByRole('checkbox', { name: '我确认已获得这张照片的使用授权', exact: true }).check();
      return photo;
    };
    const assertConfirmation = async (theme, expectedChoices, photo) => {
      assert.equal(await page.locator('.step-tabs .current').textContent(), '3确认信息');
      assert.equal(await page.locator('main h1').textContent(), theme.title);
      assert.equal(await page.locator('.summary-photo strong').textContent(), '已选择单人照片');
      assert.match(await page.locator('.summary-photo').innerText(), /本机|浏览器|临时/);
      assert.deepEqual(await page.locator('.summary-list dd').allTextContents(), expectedChoices);
      assert.equal(await page.locator('.summary-photo img').getAttribute('src'), photo);
      await page.locator('.summary-photo img').evaluate(image => image.decode());
      assert.ok(await page.locator('.summary-photo img').evaluate(image => image.complete && image.naturalWidth > 0));
      assert.equal(await page.getByRole('button', { name: '生成暂未开放', exact: true }).isDisabled(), true);
      assert.equal(await page.locator('.journey-result').textContent(), '故事设定已就绪。生成未开放，可先复制配置。');
    };

    await page.goto(base);
    await page.locator('.home-choice[href="#/hall"]').tap();
    await waitRoute('/hall');
    await page.locator('.editorial-experience').getByRole('link', { name: '立即体验', exact: true }).tap();
    await waitRoute('/samples/hall');
    for (const theme of themes) {
      let position = await enter(theme);
      await page.getByRole('button', { name: '返回主题配置预览', exact: true }).tap();
      await waitRoute('/samples/hall');
      await assertListRestored(theme, position, 'page return');
      position = await enter(theme);
      await page.goBack(); await waitRoute('/samples/hall');
      await assertListRestored(theme, position, 'browser Back');
    }
    result.checks.push('First, fifth, and ninth themes retain the selected filter, vertical position, and last visited marker after both return methods');
    await screenshot('hall-restored');
    const theme = themes[2];
    await enter(theme);
    const choices = [];
    for (const row of await page.locator('.option-row').all()) {
      const option = row.getByRole('button').first(); choices.push(await option.textContent()); await option.tap();
    }
    await bottomTap('下一步：准备照片', 'content to photo');
    const firstPhoto = await preparePhoto('public/images/v4/live-futian.jpg');
    await bottomTap('下一步：确认信息', 'photo to confirmation');
    await assertConfirmation(theme, choices, firstPhoto);
    await bottomTap('修改照片', 'confirmation to photo');
    assert.equal(await page.locator('.upload-box img').getAttribute('src'), firstPhoto);
    assert.equal(await page.getByRole('checkbox').isChecked(), true);
    await bottomTap('上一步', 'photo to content');
    assert.deepEqual(await page.locator('.option.selected').allTextContents(), choices);
    await bottomTap('下一步：准备照片', 'content to retained photo');
    assert.equal(await page.getByRole('checkbox').isChecked(), true);
    await page.getByLabel('选择照片', { exact: true }).setInputFiles('public/images/v4/live-longhua.jpg');
    const secondPhoto = await page.locator('.upload-box img').getAttribute('src');
    assert.notEqual(secondPhoto, firstPhoto);
    assert.ok(await page.evaluate(url => window.__revokedObjectUrls.includes(url), firstPhoto), 'Replacing a photo must release the previous blob URL');
    result.releasedPhotos.push({ reason: 'replace photo', url: firstPhoto });
    assert.equal(await page.getByRole('checkbox').isChecked(), false, 'A replacement photo needs fresh consent');
    assert.equal(await page.getByRole('button', { name: '下一步：确认信息', exact: true }).isDisabled(), true);
    await page.getByRole('checkbox').check();
    await bottomTap('下一步：确认信息', 'replacement photo to confirmation');
    await assertConfirmation(theme, choices, secondPhoto);
    result.checks.push('All step transitions reset scroll; previous choices, photo, and consent survive previous/modify actions');
    await screenshot('confirmation');

    for (const destination of [{ title: '首页', path: '/' }, { title: '案例分享', path: '/works' }, { title: '商务合作', path: '/cooperate' }, { title: '我', path: '/mine' }]) {
      await page.getByRole('navigation', { name: '底部导航' }).getByRole('link', { name: destination.title, exact: true }).tap();
      await waitRoute(destination.path); await atTop(`bottom navigation to ${destination.path}`);
      assert.deepEqual(await page.getByRole('navigation', { name: '底部导航' }).locator('a.active').allTextContents(), [destination.title]);
      await page.goBack(); await waitRoute(pathFor(theme));
      await atTop(`browser Back from ${destination.path}`);
      await assertConfirmation(theme, choices, secondPhoto);
      await bottomTap('修改照片', `check retained consent after ${destination.path}`);
      assert.equal(await page.getByRole('checkbox').isChecked(), true);
      await bottomTap('下一步：确认信息', `confirm retained draft after ${destination.path}`);
    }
    result.checks.push('Bottom navigation to Home, Case Sharing, Cooperation, and Mine followed by browser Back preserves the same complete draft');
    await page.getByRole('link', { name: '更换主题', exact: true }).tap(); await waitRoute('/samples/hall');
    const guardedPosition = await moveTo(themes[1]);
    await page.getByRole('link', { name: '使用主题：' + themes[1].title, exact: true }).tap();
    await page.getByRole('dialog').getByRole('heading', { name: '更换主题？', exact: true }).waitFor();
    assert.equal(await page.evaluate(url => window.__revokedObjectUrls.includes(url), secondPhoto), false, 'Opening the change-theme confirmation must preserve the old photo');
    await page.getByRole('button', { name: '保留当前配置', exact: true }).tap();
    await waitRoute('/samples/hall');
    assert.equal(await page.evaluate(url => window.__revokedObjectUrls.includes(url), secondPhoto), false, 'Cancelling theme change must preserve the old photo');
    assert.equal(await page.locator('a.theme-card').count(), themes[1].count, 'Cancelling a switch should preserve the filter used to choose it');
    await page.waitForFunction(expected => Math.abs(window.scrollY - expected) <= 2, guardedPosition.scrollY);
    await page.getByRole('link', { name: '使用主题：' + themes[1].title, exact: true }).tap();
    await page.getByRole('button', { name: '更换并清空', exact: true }).tap();
    await waitRoute(pathFor(themes[1]));
    await atTop(`enter ${themes[1].id} after confirmed change`);
    assert.equal(await page.locator('.option.selected').count(), 0, 'A new theme must not inherit selected options');
    assert.equal(await page.getByRole('button', { name: '下一步：准备照片', exact: true }).isDisabled(), true);
    assert.equal(await page.locator('img[src^="blob:"]').count(), 0);
    assert.ok(await page.evaluate(url => window.__revokedObjectUrls.includes(url), secondPhoto), 'Changing themes must release the abandoned draft photo');
    result.releasedPhotos.push({ reason: 'change theme', url: secondPhoto });
    await page.getByRole('button', { name: '返回主题配置预览', exact: true }).tap(); await waitRoute('/samples/hall');
    await enter(theme);
    assert.equal(await page.locator('.option.selected').count(), 0, 'Only one theme draft is retained; changing back starts clean');
    for (const row of await page.locator('.option-row').all()) await row.getByRole('button').first().tap();
    await bottomTap('下一步：准备照片', 'fresh theme photo');
    const refreshPhoto = await preparePhoto('public/images/v4/live-futian.jpg');
    await bottomTap('下一步：确认信息', 'fresh theme confirmation');
    await assertConfirmation(theme, choices, refreshPhoto);
    await page.reload(); await waitRoute(pathFor(theme)); await atTop('refresh clears draft');
    assert.equal(await page.locator('.step-tabs .current').textContent(), '1选择内容');
    assert.equal(await page.locator('.option.selected').count(), 0);
    assert.equal(await page.locator('img[src^="blob:"]').count(), 0);
    assert.equal(await page.getByRole('button', { name: '下一步：准备照片', exact: true }).isDisabled(), true);
    assert.deepEqual(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, created: window.__createdObjectUrls.length })), { local: 0, session: 0, created: 0 });
    result.checks.push('Theme changes release old photo URLs and clear unrelated data; page refresh clears temporary memory');
    await screenshot('refresh-clean');
    await context.close(); activePage = null;
  }
  assert.deepEqual(report.errors, [], 'Browser runtime errors');
  assert.deepEqual(report.mutationRequests, [], 'Prototype navigation must never upload a photo or create a generation task');
  report.status = 'passed';
  console.log(`Mobile navigation regression passed in ${report.viewports.length} mobile viewports; no mutations or browser errors.`);
} catch (error) {
  report.status = 'failed'; report.failure = error.stack || String(error);
  if (activePage) { try { await activePage.screenshot({ path: 'outputs/mobile-navigation-failure.png' }); } catch {} }
  throw error;
} finally {
  await writeFile('outputs/mobile-navigation-report.json', JSON.stringify(report, null, 2));
  await browser?.close();
  server?.kill();
}
