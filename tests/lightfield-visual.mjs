import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

// Exercise the animated release as customers see it: motion is enabled by default.
// The other interaction suites cover the nine configuration flows in more depth.
const base = new URL(process.env.PREVIEW_URL || 'http://127.0.0.1:4193/ai-image-hall-frontend-prototype/');
base.hash = '';
if (!base.searchParams.has('version')) base.searchParams.set('version', process.env.RELEASE_VERSION || 'lightfield-qa');
const server = process.env.PREVIEW_URL ? null : spawn('npm', ['exec', 'vite', 'preview', '--', '--host', '127.0.0.1', '--port', '4193', '--strictPort'], { stdio: 'ignore' });
const viewports = [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 390, height: 844 }, { width: 430, height: 932 }];
const products = { hall: 'AI影像馆', bespoke: '高定AI影像' };
const scenarios = {
  hall: [['brand', '品牌推广与主题传播'], ['event', '活动互动与用户体验'], ['team', '企业文化与员工关怀'], ['campus', '校园与社群纪念']],
  bespoke: [['person', '人物故事'], ['family', '家庭记忆'], ['enterprise', '企业故事'], ['city', '城市与历史']],
};
const report = { base: base.href, status: 'running', viewports: [], anchors: [], scenarios: [], motion: [], sharedLinks: [], pages: [], screenshots: [], errors: [], missingAssets: [], failedRequests: [] };
let browser;
let activePage;
await mkdir('outputs', { recursive: true });

const urlFor = path => { const result = new URL(base); result.hash = path; return result.href; };
const continuousAnimations = page => page.evaluate(() => document.getAnimations().filter(animation => {
  const timing = animation.effect?.getComputedTiming();
  return timing && (timing.iterations === Infinity || timing.activeDuration === Infinity) && animation.playState === 'running';
}).map(animation => ({ name: animation.animationName || animation.constructor.name, target: animation.effect?.target?.className?.baseVal || animation.effect?.target?.className || '' })));

function observe(page) {
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => report.errors.push({ url: page.url(), message: error.message }));
  page.on('response', response => {
    if (new URL(response.url()).origin === base.origin && response.status() >= 400) report.missingAssets.push({ status: response.status(), url: response.url() });
  });
  page.on('requestfailed', request => {
    if (request.failure()?.errorText !== 'net::ERR_ABORTED') report.failedRequests.push({ url: request.url(), error: request.failure()?.errorText });
  });
}

async function frames(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function waitRoute(page, path) {
  await page.locator(`main[data-route="${path.split('?')[0]}"]`).waitFor();
  await frames(page);
}

async function route(page, path) {
  await page.goto(urlFor(path));
  await waitRoute(page, path);
}

async function noOverflow(page, label) {
  const geometry = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth }));
  assert.ok(geometry.scrollWidth <= geometry.width + 1 && geometry.bodyWidth <= geometry.width + 1, `${label}: horizontal overflow ${JSON.stringify(geometry)}`);
  report.pages.push({ label, ...geometry });
}

async function imagesDecode(page) {
  const images = await page.locator('main img, .brand img').evaluateAll(async elements => Promise.all(elements.map(async image => {
    image.loading = 'eager';
    try { await image.decode(); } catch { /* The returned dimensions identify a failed image. */ }
    return { src: image.currentSrc || image.src, width: image.naturalWidth, height: image.naturalHeight };
  })));
  assert.ok(images.every(image => image.width > 0 && image.height > 0), `images must decode: ${JSON.stringify(images.filter(image => !image.width || !image.height))}`);
}

async function hitTarget(locator, label) {
  const result = await locator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { x, y, width: rect.width, height: rect.height, exposed: !!hit && (hit === element || element.contains(hit)), hit: hit?.tagName + '.' + hit?.className };
  });
  assert.ok(result.width > 0 && result.height > 0 && result.exposed, `${label}: decoration must not cover the interactive target ${JSON.stringify(result)}`);
  return result;
}

async function lightfieldPresent(page, label) {
  const visual = page.locator('.lf-visual');
  assert.ok(await visual.count() > 0, `${label}: selected lightfield design should be present`);
  for (const layer of await visual.all()) {
    const semantics = await layer.evaluate(element => ({ role: element.getAttribute('role'), name: element.getAttribute('aria-label'), tabIndex: element.tabIndex }));
    assert.equal(semantics.role, 'img', `${label}: main visual should expose its image meaning`);
    assert.ok(semantics.name?.trim(), `${label}: main visual should have an accessible description`);
    assert.ok(semantics.tabIndex < 0, `${label}: touch-responsive artwork should not add a decoration-only tab stop`);
    assert.equal(await layer.locator('a[href], button, input, select, textarea, [tabindex="0"]').count(), 0, `${label}: decorative layers should not add navigation stops`);
  }
}

async function screenshot(page, name) {
  const path = `outputs/lightfield-${name}.png`;
  await page.screenshot({ path });
  report.screenshots.push(path);
}

async function assertAnchors(page, business, viewport) {
  const index = page.getByRole('navigation', { name: '产品内容导航', exact: true });
  const entries = [['overview', '产品简介'], ['benefits', '特点优势'], ['scenes', '场景启发'], ['try', '立即体验']];
  for (const [id, label] of entries) {
    await index.getByRole('button', { name: label, exact: true }).click();
    await page.waitForFunction(target => {
      const section = document.getElementById(target);
      const heading = section?.querySelector('h2');
      const sticky = document.querySelector('.editorial-index');
      const header = document.querySelector('.topbar');
      const bottom = document.querySelector('.mobile-nav');
      if (!heading || !sticky || !header || !bottom) return false;
      const headingBox = heading.getBoundingClientRect();
      return document.activeElement === section && headingBox.top >= Math.max(header.getBoundingClientRect().bottom, sticky.getBoundingClientRect().bottom) - 1 && headingBox.bottom <= bottom.getBoundingClientRect().top - 2;
    }, `${business}-${id}`);
    const geometry = await page.locator(`#${business}-${id} > h2, #${business}-${id} .editorial-experience-copy > h2`).first().evaluate(element => {
      const box = element.getBoundingClientRect(); return { top: box.top, bottom: box.bottom };
    });
    report.anchors.push({ business, label, viewport, ...geometry });
    await noOverflow(page, `${viewport.width} ${business} ${label}`);
  }
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  assert.ok(ready, `Preview did not become ready: ${base.href}`);
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const page = activePage = await context.newPage();
    observe(page);
    await route(page, '/');
    await imagesDecode(page);
    await lightfieldPresent(page, 'home');
    const heading = await page.locator('main h1').innerText();
    assert.doesNotMatch(heading, /你想如何创作/);
    assert.ok(heading.trim().length > 5, 'home needs a meaningful customer-facing statement');
    const nav = page.getByRole('navigation', { name: '底部导航', exact: true });
    assert.deepEqual(await nav.getByRole('link').allTextContents(), ['首页', '案例分享', '商务合作', '我']);
    const geometry = await page.evaluate(() => ({ height: innerHeight, scrollHeight: document.documentElement.scrollHeight, headerBottom: document.querySelector('.topbar').getBoundingClientRect().bottom, navTop: document.querySelector('.mobile-nav').getBoundingClientRect().top, cards: [...document.querySelectorAll('.home-choice')].map(element => { const r = element.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; }) }));
    assert.equal(geometry.cards.length, 2, 'both product entries must remain present');
    assert.ok(geometry.scrollHeight <= geometry.height + 1, `${viewport.width}: the home should fit the initial mobile viewport ${JSON.stringify(geometry)}`);
    assert.ok(geometry.cards.every(card => card.top >= geometry.headerBottom - 1 && card.bottom <= geometry.navTop + 1), `${viewport.width}: both products must be visible above bottom navigation`);
    await hitTarget(page.getByRole('link', { name: '咣当首页', exact: true }), 'brand');
    for (const [business, name] of Object.entries(products)) await hitTarget(page.getByRole('link', { name, exact: true }), `${viewport.width} ${business}`);
    for (const link of await nav.getByRole('link').all()) await hitTarget(link, `${viewport.width} bottom navigation`);
    await noOverflow(page, `${viewport.width} home`);
    await screenshot(page, `${viewport.width}-home`);
    report.viewports.push({ viewport, heading, ...geometry });
    for (const [business, name] of Object.entries(products)) {
      await route(page, '/');
      await page.getByRole('link', { name, exact: true }).tap();
      await waitRoute(page, '/' + business);
      assert.equal(await page.locator('main h1').innerText(), name);
      await imagesDecode(page);
      await noOverflow(page, `${viewport.width} ${business} intro`);
      await screenshot(page, `${viewport.width}-${business}`);
      await assertAnchors(page, business, viewport);
      await page.getByRole('button', { name: '返回首页', exact: true }).click();
      await waitRoute(page, '/');
    }
    for (const path of ['/works', '/cooperate', '/mine', '/samples/hall', '/samples/bespoke', '/experience/brand/shenzhen-belike']) {
      await route(page, path);
      await imagesDecode(page);
      await noOverflow(page, `${viewport.width} ${path}`);
    }
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base.origin });
  const page = activePage = await context.newPage();
  observe(page);
  for (const [business, list] of Object.entries(scenarios)) {
    for (const [id, title] of list) {
      await route(page, '/' + business);
      const card = page.locator(`.scenario-card[href="#/category/${id}"]`);
      await card.click();
      await waitRoute(page, '/category/' + id);
      assert.equal(await page.locator('main h1').innerText(), title);
      assert.equal(await page.locator('.scenario-production li').count(), 3);
      await imagesDecode(page);
      await noOverflow(page, `${business} scenario ${id}`);
      await page.getByRole('button', { name: '返回' + products[business], exact: true }).click();
      await waitRoute(page, '/' + business);
      await page.waitForFunction(category => {
        const rect = document.querySelector(`.scenario-card[href="#/category/${category}"]`)?.getBoundingClientRect();
        return rect && rect.bottom > document.querySelector('.topbar').getBoundingClientRect().bottom && rect.top < document.querySelector('.mobile-nav').getBoundingClientRect().top;
      }, id);
      report.scenarios.push({ business, id, title, returnedTo: page.url() });
    }
    await route(page, '/samples/' + business);
    await page.getByRole('heading', { name: '样片制作中', exact: true }).waitFor();
    assert.equal(await page.locator('video').count(), 0, 'pending samples must not expose a fake playable video');
    await imagesDecode(page);
    await noOverflow(page, business + ' pending samples');
    await page.getByRole('button', { name: '返回' + products[business], exact: true }).click();
    await waitRoute(page, '/' + business);
  }

  // Clipboard is read back and followed, so this checks the actual customer link.
  for (const business of Object.keys(products)) {
    await route(page, '/' + business);
    const expected = page.url();
    await page.getByRole('button', { name: '复制当前页面链接', exact: true }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(copied, expected, 'copied URL must retain the selected product and release version');
    assert.equal(new URL(copied).searchParams.get('version'), base.searchParams.get('version'));
    assert.equal(new URL(copied).hash, '#/' + business);
    const sharedPage = await context.newPage();
    observe(sharedPage);
    await sharedPage.goto(copied);
    await waitRoute(sharedPage, '/' + business);
    assert.equal(await sharedPage.locator('main h1').innerText(), products[business]);
    report.sharedLinks.push({ business, copied });
    await sharedPage.close();
  }

  for (const path of ['/works', '/cooperate', '/mine', '/samples/hall?preview=themes', '/experience/brand/shenzhen-belike']) {
    await route(page, path);
    await imagesDecode(page);
    await noOverflow(page, path);
  }

  // Persistent decorative motion must be controllable without losing navigation.
  await route(page, '/');
  await page.waitForFunction(() => document.getAnimations().some(animation => {
    const timing = animation.effect?.getComputedTiming();
    return timing && (timing.iterations === Infinity || timing.activeDuration === Infinity) && animation.playState === 'running';
  }));
  report.motion.push({ state: 'default', running: await continuousAnimations(page) });
  await page.getByRole('button', { name: '暂停动效', exact: true }).click();
  await page.getByRole('button', { name: '恢复动效', exact: true }).waitFor();
  await frames(page);
  assert.deepEqual(await continuousAnimations(page), [], 'global pause must stop continuous animations');
  for (const business of Object.keys(products)) {
    await page.getByRole('link', { name: products[business], exact: true }).tap();
    await waitRoute(page, '/' + business);
    await frames(page);
    assert.deepEqual(await continuousAnimations(page), [], `${business}: pause should survive route changes`);
    await page.getByRole('button', { name: '返回首页', exact: true }).click();
    await waitRoute(page, '/');
  }
  report.motion.push({ state: 'paused', running: await continuousAnimations(page) });
  await page.getByRole('button', { name: '恢复动效', exact: true }).click();
  await page.getByRole('button', { name: '暂停动效', exact: true }).waitFor();
  assert.ok((await continuousAnimations(page)).length > 0, 'resume should restore motion when the system allows it');
  report.motion.push({ state: 'resumed', running: await continuousAnimations(page) });
  await context.close();

  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const reducedPage = activePage = await reduced.newPage();
  observe(reducedPage);
  for (const path of ['/', '/hall', '/bespoke']) {
    await route(reducedPage, path);
    await frames(reducedPage);
    assert.deepEqual(await continuousAnimations(reducedPage), [], `${path}: system reduced motion must stop continuous animation`);
    await noOverflow(reducedPage, path + ' reduced motion');
  }
  report.motion.push({ state: 'system reduced motion', running: await continuousAnimations(reducedPage) });
  await reduced.close();

  assert.deepEqual(report.errors, [], 'no browser JavaScript errors');
  assert.deepEqual(report.missingAssets, [], 'no missing same-origin assets');
  assert.deepEqual(report.failedRequests, [], 'no failed resources');
  report.status = 'passed';
  console.log(`Lightfield visual/mobile checks passed: ${report.viewports.length} viewports, ${report.anchors.length} product anchors, ${report.scenarios.length} scenarios, motion controls, and ${report.sharedLinks.length} followed share links.`);
} catch (error) {
  report.status = 'failed';
  report.failure = { message: error.message, stack: error.stack, url: activePage && !activePage.isClosed() ? activePage.url() : null };
  if (activePage && !activePage.isClosed()) {
    try { await screenshot(activePage, 'failure'); } catch {}
  }
  throw error;
} finally {
  await writeFile('outputs/lightfield-visual-report.json', JSON.stringify(report, null, 2));
  if (browser) await browser.close();
  if (server) server.kill('SIGTERM');
}
