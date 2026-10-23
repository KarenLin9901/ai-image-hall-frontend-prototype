import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

// Exercise the dark glass release as customers see it: motion is enabled by default.
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
const report = { base: base.href, status: 'running', viewports: [], anchors: [], scenarios: [], motion: [], showcase: [], surfaces: [], sharedLinks: [], pages: [], screenshots: [], errors: [], missingAssets: [], failedRequests: [] };
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
  const visual = page.locator('.lf-visual.glass-showcase');
  assert.equal(await visual.count(), 1, `${label}: the selected glass photo showcase should be present`);
  const semantics = await visual.evaluate(element => ({ role: element.getAttribute('role'), name: element.getAttribute('aria-label') }));
  assert.equal(semantics.role, 'region', `${label}: interactive photo showcase should expose a named region`);
  assert.equal(semantics.name, '影像场景灵感', `${label}: photo showcase needs a clear accessible name`);
  assert.equal(await visual.locator('img').count(), 5, `${label}: all five scene photographs should remain available`);
  const controls = visual.getByRole('button');
  const names = await controls.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label') || element.textContent?.trim()));
  const keyboardStops = await visual.locator('button:not([tabindex="-1"])').count();
  assert.ok(keyboardStops >= 2 && keyboardStops <= 8, `${label}: showcase controls should provide a small set of useful keyboard navigation choices`);
  assert.ok(names.every(name => name?.trim()), `${label}: every showcase button needs an accessible name`);
  assert.equal(new Set(names).size, names.length, `${label}: showcase control names should identify distinct actions`);
  assert.equal(await visual.locator('a[href], input, select, textarea').count(), 0, `${label}: photo gallery must not introduce unrelated tasks`);
}

async function glassSurfaces(page, label) {
  const background = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const root = getComputedStyle(document.documentElement);
    return { image: body.backgroundImage, color: body.backgroundColor, rootImage: root.backgroundImage, rootColor: root.backgroundColor, colorScheme: body.colorScheme };
  });
  assert.ok(/gradient\(/.test(background.image + background.rootImage), `${label}: the main background should retain dark colour gradients`);
  const bodyChannels = background.color.match(/[\d.]+/g)?.map(Number) || [];
  const foundation = bodyChannels.length === 4 && bodyChannels[3] === 0 ? background.rootColor : background.color;
  const channels = foundation.match(/[\d.]+/g)?.map(Number) || [];
  assert.ok(channels.length >= 3 && channels.slice(0, 3).some(value => value > 0) && Math.max(...channels.slice(0, 3)) < 100, `${label}: background needs a dark coloured foundation rather than solid black or white`);
  assert.ok(background.colorScheme.includes('dark'), `${label}: native controls should use the dark colour scheme`);
  const panel = page.locator('.home-choice').first();
  const initial = await panel.evaluate(element => {
    const style = getComputedStyle(element); const rect = element.getBoundingClientRect();
    return { background: style.backgroundColor, image: style.backgroundImage, filter: style.backdropFilter || style.webkitBackdropFilter, width: rect.width, height: rect.height };
  });
  const glassFilters = await page.locator('.topbar,.home-choice,.glass-showcase .gs-card').evaluateAll(elements => elements.map(element => { const style = getComputedStyle(element); return style.backdropFilter || style.webkitBackdropFilter || 'none'; }));
  assert.ok(glassFilters.some(filter => filter !== 'none'), `${label}: supported glass filtering should be present on a limited set of surfaces`);
  const fallbackStyle = await page.addStyleTag({ content: '.home-choice,.topbar,.glass-showcase{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}' });
  const fallback = await panel.evaluate(element => {
    const style = getComputedStyle(element); const rect = element.getBoundingClientRect();
    return { background: style.backgroundColor, image: style.backgroundImage, color: style.color, width: rect.width, height: rect.height };
  });
  await fallbackStyle.evaluate(element => element.remove());
  const fallbackChannels = fallback.background.match(/[\d.]+/g)?.map(Number) || [];
  assert.ok((fallbackChannels.length >= 3 && (fallbackChannels.length < 4 || fallbackChannels[3] > 0)) || /gradient\(/.test(fallback.image), `${label}: disabling backdrop filters should retain a visible panel background`);
  assert.ok(Math.abs(initial.width - fallback.width) < 1 && Math.abs(initial.height - fallback.height) < 1, `${label}: glass fallback must not change the product entry geometry`);
  report.surfaces.push({ label, background, initial, fallback, glassFilters });
}

async function touchGesture(page, from, to) {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] });
    for (let step = 1; step <= 8; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * step / 8, y: from.y + (to.y - from.y) * step / 8 }] });
      await page.waitForTimeout(20);
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } finally {
    await session.detach();
  }
}

const showcaseIndex = page => page.locator('.glass-showcase .gs-card').evaluateAll(elements => elements.findIndex(element => element.getAttribute('aria-pressed') === 'true'));

async function waitShowcase(page, index) {
  await page.waitForFunction(expected => {
    const cards = [...document.querySelectorAll('.glass-showcase .gs-card')];
    const dots = [...document.querySelectorAll('.glass-showcase .gs-dot')];
    return cards.findIndex(element => element.getAttribute('aria-pressed') === 'true') === expected && dots.findIndex(element => element.getAttribute('aria-current') === 'true') === expected && cards.filter(element => element.getAttribute('aria-pressed') === 'true').length === 1 && dots.filter(element => element.getAttribute('aria-current') === 'true').length === 1;
  }, index);
}

async function galleryControls(page, label, { swipe = false, verticalScroll = false } = {}) {
  const visual = page.getByRole('region', { name: '影像场景灵感', exact: true });
  const cards = visual.locator('.gs-card');
  const dots = visual.locator('.gs-dot');
  const initial = await showcaseIndex(page);
  await hitTarget(visual.getByRole('button', { name: '下一个影像场景', exact: true }), `${label} next scene`);
  await visual.getByRole('button', { name: '下一个影像场景', exact: true }).click();
  await waitShowcase(page, (initial + 1) % 5);
  await visual.getByRole('button', { name: '上一个影像场景', exact: true }).click();
  await waitShowcase(page, initial);
  await dots.nth(2).click();
  await waitShowcase(page, 2);
  // Only the selected photo is a keyboard stop; arrow/Home/End bubble from it.
  await cards.nth(2).focus();
  await page.keyboard.press('ArrowRight');
  await waitShowcase(page, 3);
  await page.keyboard.press('ArrowLeft');
  await waitShowcase(page, 2);
  await page.keyboard.press('Home');
  await waitShowcase(page, 0);
  await page.keyboard.press('End');
  await waitShowcase(page, 4);
  await dots.nth(0).focus();
  await page.keyboard.press('Enter');
  await waitShowcase(page, 0);
  // Clicking an exposed side photograph brings that photograph to the centre.
  await page.waitForTimeout(800);
  const side = cards.nth(1);
  const exposed = await side.evaluate(element => {
    const rect = element.getBoundingClientRect();
    for (const fx of [.9, .75, .6, .4, .25, .1]) for (const fy of [.35, .5, .65]) {
      const x = rect.left + rect.width * fx, y = rect.top + rect.height * fy;
      const hit = document.elementFromPoint(x, y);
      if (hit && (hit === element || element.contains(hit))) return { x, y };
    }
    return null;
  });
  assert.ok(exposed, `${label}: a neighbouring photograph must remain touchable`);
  await page.mouse.click(exposed.x, exposed.y);
  await waitShowcase(page, 1);
  if (swipe) {
    await page.waitForTimeout(800);
    const bounds = await visual.boundingBox();
    assert.ok(bounds, `${label}: gallery bounds required for native touch`);
    const y = bounds.y + bounds.height * .34;
    await touchGesture(page, { x: bounds.x + bounds.width * .72, y }, { x: bounds.x + bounds.width * .3, y });
    await waitShowcase(page, 2);
    await page.waitForTimeout(450);
    await touchGesture(page, { x: bounds.x + bounds.width * .3, y }, { x: bounds.x + bounds.width * .72, y });
    await waitShowcase(page, 1);
  }
  if (verticalScroll) {
    // The real home fits one screen. A temporary inert spacer allows an actual
    // browser touch scroll to verify that the gallery does not swallow pan-y.
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.dataset.qaScrollSpacer = 'true';
      spacer.setAttribute('aria-hidden', 'true');
      spacer.style.height = '900px';
      document.body.append(spacer);
      scrollTo(0, 0);
    });
    try {
      const bounds = await visual.boundingBox();
      const start = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height * .6 };
      const before = await showcaseIndex(page);
      await touchGesture(page, start, { x: start.x + 3, y: start.y - 80 });
      await page.waitForFunction(() => scrollY > 15);
      assert.equal(await showcaseIndex(page), before, `${label}: a vertical gesture should scroll without changing the photograph`);
    } finally {
      await page.evaluate(() => { document.querySelector('[data-qa-scroll-spacer]')?.remove(); scrollTo(0, 0); });
      await frames(page);
    }
  }
  report.showcase.push({ label, initial, final: await showcaseIndex(page), click: true, keyboard: true, nativeHorizontalTouch: swipe, nativeVerticalScroll: verticalScroll });
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
    await page.waitForFunction(expected => {
      const selected = [...document.querySelectorAll('.editorial-index [aria-current="location"]')];
      return selected.length === 1 && selected[0].textContent?.trim() === expected;
    }, label);
    const activeLabel = (await index.locator('[aria-current="location"]').innerText()).trim();
    assert.equal(activeLabel, label, `${business} ${label}: navigation highlight should match the section reached, including the final viewport-clamped experience section`);
    const geometry = await page.locator(`#${business}-${id} > h2, #${business}-${id} .editorial-experience-copy > h2`).first().evaluate(element => {
      const box = element.getBoundingClientRect(); return { top: box.top, bottom: box.bottom };
    });
    report.anchors.push({ business, label, activeLabel, viewport, ...geometry });
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
    await glassSurfaces(page, `${viewport.width} home`);
    await galleryControls(page, `${viewport.width} default`, { swipe: true, verticalScroll: true });
    const heading = await page.locator('main h1').innerText();
    assert.equal(await page.locator('main h1').getAttribute('aria-label'), '你想如何创作一部AI影像？');
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
    await page.waitForTimeout(750);
    const overlayPosition = await page.locator('main').evaluate(main => {
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;bottom:20px;left:0;width:20px;height:20px;pointer-events:none';
      main.append(probe);
      const geometry = { bottom: probe.getBoundingClientRect().bottom, expected: innerHeight - 20 };
      probe.remove();
      return geometry;
    });
    assert.ok(Math.abs(overlayPosition.bottom - overlayPosition.expected) < 1, 'finished page transitions must keep fixed feedback inside the viewport');
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
  await galleryControls(page, 'manual pause', { swipe: true });
  assert.deepEqual(await continuousAnimations(page), [], 'carousel interaction must not restart globally paused motion');
  for (const business of Object.keys(products)) {
    await page.getByRole('link', { name: products[business], exact: true }).tap();
    await waitRoute(page, '/' + business);
    await frames(page);
    assert.deepEqual(await continuousAnimations(page), [], `${business}: pause should survive route changes`);
    await page.getByRole('button', { name: '场景启发', exact: true }).click();
    await frames(page);
    const immediateScroll = await page.evaluate(() => scrollY);
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => scrollY), immediateScroll, 'manual pause should also remove smooth anchor scrolling');
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
    if (path === '/') {
      await galleryControls(reducedPage, 'system reduced motion', { swipe: true });
      assert.deepEqual(await continuousAnimations(reducedPage), [], 'carousel interaction must respect system reduced motion');
    }
  }
  report.motion.push({ state: 'system reduced motion', running: await continuousAnimations(reducedPage) });
  await reduced.close();

  assert.deepEqual(report.errors, [], 'no browser JavaScript errors');
  assert.deepEqual(report.missingAssets, [], 'no missing same-origin assets');
  assert.deepEqual(report.failedRequests, [], 'no failed resources');
  report.status = 'passed';
  console.log(`Lightfield visual/mobile checks passed: ${report.viewports.length} viewports, ${report.anchors.length} product anchors, ${report.scenarios.length} scenarios, gallery click/keyboard/native touch, motion controls, and ${report.sharedLinks.length} followed share links.`);
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
