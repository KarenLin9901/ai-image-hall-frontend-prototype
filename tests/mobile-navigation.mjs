import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4189/ai-image-hall-frontend-prototype/';
const server = process.env.PREVIEW_URL ? null : spawn('npm', ['exec', 'vite', 'preview', '--', '--host', '127.0.0.1', '--port', '4189', '--strictPort'], { stdio: 'ignore' });
const report = { base, viewports: [], errors: [], mutationRequests: [], screenshots: [] };
const themes = [
  { index: 0, id: 'shenzhen-belike', category: 'brand', title: '我的深圳生活 belike' },
  { index: 4, id: 'event-1', category: 'event', title: '专属节日影像' },
  { index: 8, id: 'campus-1', category: 'campus', title: '我们的校园记忆' },
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
    const result = { viewport, checks: [], transitions: [], carouselReturns: [], releasedPhotos: [] };
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
    const moveTo = async index => {
      await waitRoute('/hall');
      for (let attempts = 0; attempts < 12; attempts++) {
        const current = Number((await page.locator('.carousel-count').textContent()).split('/')[0]) - 1;
        if (current === index) break;
        await page.getByRole('button', { name: current < index ? '下一个主题' : '上一个主题', exact: true }).tap();
        await page.waitForFunction(previous => Number(document.querySelector('.carousel-count').textContent.split('/')[0]) - 1 !== previous, current);
      }
      assert.equal(await page.locator('.carousel-count').textContent(), `${index + 1} / 9`);
      const visible = await page.locator('.preview-slide').nth(index).evaluate(element => {
        const card = element.getBoundingClientRect(); const track = element.parentElement.getBoundingClientRect();
        return card.left >= track.left - 1 && card.right <= track.right + 1;
      });
      assert.ok(visible, `Card ${index + 1} must be visible before the real touch`);
    };
    const enter = async theme => {
      await moveTo(theme.index);
      await page.locator(`.preview-slide[data-slide="${theme.id}"]`).getByRole('link', { name: '立即体验', exact: true }).tap();
      await waitRoute(pathFor(theme));
      assert.equal(await page.locator('main h1').textContent(), theme.title);
      assert.equal(await page.locator('.option-row').count(), 3);
      await atTop(`enter ${theme.id}`);
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
      assert.match(await page.locator('.summary-photo').innerText(), /仅在当前浏览器中临时预览/);
      assert.deepEqual(await page.locator('.summary-list dd').allTextContents(), expectedChoices);
      assert.equal(await page.locator('.summary-photo img').getAttribute('src'), photo);
      await page.locator('.summary-photo img').evaluate(image => image.decode());
      assert.ok(await page.locator('.summary-photo img').evaluate(image => image.complete && image.naturalWidth > 0));
      assert.equal(await page.getByRole('button', { name: '生成暂未开放', exact: true }).isDisabled(), true);
      assert.match(await page.locator('.experience-panel .notice').textContent(), /不会上传照片或创建生成任务/);
    };

    await page.goto(base);
    await page.locator('.home-choice[href="#/hall"]').tap();
    await waitRoute('/hall');
    for (const theme of themes) {
      await enter(theme);
      await page.getByRole('button', { name: '返回AI影像馆', exact: true }).tap();
      await waitRoute('/hall');
      result.carouselReturns.push({ card: theme.index + 1, method: 'page return', count: await page.locator('.carousel-count').textContent() });
      // Check before moving again: a reset to the first theme must fail this regression.
      assert.equal(await page.locator('.carousel-count').textContent(), `${theme.index + 1} / 9`);
      await enter(theme);
      await page.goBack(); await waitRoute('/hall');
      assert.equal(await page.locator('.carousel-count').textContent(), `${theme.index + 1} / 9`, 'Browser Back must restore the selected theme');
      result.carouselReturns.push({ card: theme.index + 1, method: 'browser Back', count: await page.locator('.carousel-count').textContent() });
    }
    result.checks.push('First, fifth, and ninth themes preserve their carousel position after both return methods');
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

    for (const destination of [{ title: '首页', path: '/' }, { title: '商务合作', path: '/cooperate' }, { title: '我', path: '/mine' }]) {
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
    result.checks.push('Bottom navigation to Home, Cooperation, and Mine followed by browser Back preserves the same complete draft');
    await page.getByRole('link', { name: '更换主题', exact: true }).tap(); await waitRoute('/hall');
    assert.equal(await page.locator('.carousel-count').textContent(), '9 / 9');
    await moveTo(themes[1].index);
    await page.locator(`.preview-slide[data-slide="${themes[1].id}"]`).getByRole('link', { name: '立即体验', exact: true }).tap();
    await page.getByRole('dialog').getByRole('heading', { name: '更换主题？', exact: true }).waitFor();
    assert.equal(await page.evaluate(url => window.__revokedObjectUrls.includes(url), secondPhoto), false, 'Opening the change-theme confirmation must preserve the old photo');
    await page.getByRole('button', { name: '保留当前配置', exact: true }).tap();
    await waitRoute('/hall');
    assert.equal(await page.evaluate(url => window.__revokedObjectUrls.includes(url), secondPhoto), false, 'Cancelling theme change must preserve the old photo');
    await page.locator(`.preview-slide[data-slide="${themes[1].id}"]`).getByRole('link', { name: '立即体验', exact: true }).tap();
    await page.getByRole('button', { name: '更换并清空', exact: true }).tap();
    await waitRoute(pathFor(themes[1]));
    await atTop(`enter ${themes[1].id} after confirmed change`);
    assert.equal(await page.locator('.option.selected').count(), 0, 'A new theme must not inherit selected options');
    assert.equal(await page.getByRole('button', { name: '下一步：准备照片', exact: true }).isDisabled(), true);
    assert.equal(await page.locator('img[src^="blob:"]').count(), 0);
    assert.ok(await page.evaluate(url => window.__revokedObjectUrls.includes(url), secondPhoto), 'Changing themes must release the abandoned draft photo');
    result.releasedPhotos.push({ reason: 'change theme', url: secondPhoto });
    await page.getByRole('button', { name: '返回AI影像馆', exact: true }).tap(); await waitRoute('/hall');
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
