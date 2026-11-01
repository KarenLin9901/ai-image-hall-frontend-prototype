import { productSections, openHeaderMore, openProductDetails, assertHallPrimaryAction } from './b2b-assertions.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

// Theme-specific regression complements the unchanged dark cinematic suite.
// Computed solid-surface contrast is a guard, not a replacement for visual review.
const base = new URL(process.env.PREVIEW_URL || 'http://127.0.0.1:4201/ai-image-hall-frontend-prototype/');
base.hash = '';
if (!base.searchParams.has('version')) base.searchParams.set('version', 'color-themes-qa');
const output = resolve(process.env.THEME_OUTPUT || fileURLToPath(new URL('../outputs/ui-themes-20261029/evidence/themes/', import.meta.url)));
await mkdir(output, { recursive: true });
const server = process.env.PREVIEW_URL ? null : spawn('npm', ['exec', 'vite', 'preview', '--', '--host', '127.0.0.1', '--port', '4201', '--strictPort'], { stdio: 'ignore' });
const report = { base: base.href, cases: [], surfaces: [], screenshots: [], pageErrors: [], mutationRequests: [], dataRequests: [], missingAssets: [], failedRequests: [], expectedFailures: [] };
const viewports = [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 1440, height: 1000 }];
const paths = ['/', '/hall', '/bespoke', ...['brand', 'event', 'team', 'campus', 'person', 'family', 'enterprise', 'city'].map(id => '/category/' + id), '/samples/hall?preview=themes', '/samples/bespoke', '/works', '/cooperate', '/mine', '/experience/brand/brand-1', '/not-found'];
let browser, activePage, allowImageFailure = false;
const urlFor = path => { const url = new URL(base); url.hash = path; return url.href; };
const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const toggle = p => p.getByTestId('theme-toggle');
const modeOf = p => p.locator('html').getAttribute('data-theme');
async function setMode(p, mode) {
  if (await modeOf(p) !== mode) await toggle(p).click();
  await p.waitForFunction(expected => document.documentElement.dataset.theme === expected, mode);
  assert.equal(await toggle(p).getAttribute('aria-pressed'), String(mode === 'light'));
  await frames(p);
}
async function goto(p, path, mode = 'dark') {
  await p.goto('about:blank');
  await p.goto(urlFor(path));
  await p.locator('main').waitFor();
  await p.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await setMode(p, mode);
}
async function hash(p, path) {
  await p.evaluate(next => { location.hash = next; }, path);
  await p.locator('main[data-route=' + JSON.stringify(path.split('?')[0]) + ']').waitFor();
  await frames(p);
}
function observe(p) {
  p.setDefaultTimeout(12000);
  p.on('pageerror', error => report.pageErrors.push({ url: p.url(), message: error.message }));
  p.on('request', request => {
    if (!['GET', 'HEAD'].includes(request.method())) report.mutationRequests.push({ method: request.method(), url: request.url() });
    if (['fetch', 'xhr', 'websocket'].includes(request.resourceType())) report.dataRequests.push(request.url());
  });
  p.on('response', response => {
    if (new URL(response.url()).origin === base.origin && response.status() >= 400) report.missingAssets.push({ url: response.url(), status: response.status() });
  });
  p.on('requestfailed', request => {
    const error = request.failure()?.errorText;
    if (error === 'net::ERR_ABORTED') return;
    const value = { url: request.url(), error };
    if (allowImageFailure && request.resourceType() === 'image') report.expectedFailures.push(value);
    else report.failedRequests.push(value);
  });
}
async function shot(p, name) {
  const file = name.replace(/[^a-zA-Z0-9_-]/g, '-') + '.png';
  await p.screenshot({ path: join(output, file) });
  report.screenshots.push(file);
  return file;
}
async function run(id, p, task) {
  try { report.cases.push({ id, status: 'PASS', data: await task() }); }
  catch (error) {
    let screenshot;
    try { screenshot = await shot(p, id + '-failure'); } catch {}
    report.cases.push({ id, status: 'FAIL', error: error.stack || String(error), screenshot });
  }
  await writeFile(join(output, 'results.json'), JSON.stringify(report, null, 2));
}
async function decodeImages(p) {
  const images = await p.locator('main img,.brand img').evaluateAll(async items => Promise.all(items.map(async img => {
    img.loading = 'eager';
    try { await img.decode(); } catch {}
    return { src: img.currentSrc || img.src, width: img.naturalWidth, height: img.naturalHeight };
  })));
  assert.ok(images.every(img => img.width > 0 && img.height > 0), 'images decode: ' + JSON.stringify(images.filter(img => !img.width || !img.height)));
  return images.length;
}
async function palette(p, selector) {
  return p.locator(selector).first().evaluate(element => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rgba = value => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].map((v, i) => i === 3 ? v / 255 : v); };
    const over = (a, b) => a.slice(0, 3).map((v, i) => v * a[3] + b[i] * (1 - a[3]));
    const luminance = rgb => rgb.map(v => { const c = v / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
    const ancestry = []; for (let el = element; el; el = el.parentElement) ancestry.unshift(el);
    let background = [255, 255, 255];
    for (const el of ancestry) background = over(rgba(getComputedStyle(el).backgroundColor), background);
    const css = getComputedStyle(element), foreground = over(rgba(css.color), background);
    const a = luminance(foreground), b = luminance(background);
    return { text: element.textContent?.trim().slice(0, 70), color: css.color, backgroundColor: css.backgroundColor, backgroundImage: css.backgroundImage, foreground, background, contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05), colorScheme: css.colorScheme };
  });
}
async function surface(p, viewport, path, mode) {
  await goto(p, path, mode);
  const geometry = await p.evaluate(() => {
    const rect = el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
    const visible = el => { const r = el.getBoundingClientRect(), css = getComputedStyle(el); return r.width > 0 && r.height > 0 && css.visibility !== 'hidden' && css.display !== 'none'; };
    const buttons = [...document.querySelectorAll('.header-actions > button,.header-more > summary')].filter(visible).map(el => {
      const r = rect(el), hit = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
      return { name: el.getAttribute('aria-label'), ...r, exposed: hit === el || el.contains(hit) };
    });
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, brand: rect(document.querySelector('.brand')), buttons, scheme: getComputedStyle(document.body).colorScheme };
  });
  assert.ok(geometry.scrollWidth <= geometry.width + 1 && geometry.bodyWidth <= geometry.width + 1, 'no horizontal overflow ' + JSON.stringify(geometry));
  assert.equal(geometry.buttons.length, 2, 'appearance and secondary-options controls remain visible');
  assert.ok(geometry.buttons.every(b => b.width >= 43.5 && b.height >= 43.5 && b.exposed && b.left >= 0 && b.right <= geometry.width), 'header controls retain their hit areas ' + JSON.stringify(geometry));
  assert.ok(geometry.brand.right <= Math.min(...geometry.buttons.map(b => b.left)) + 1, 'brand and header controls do not overlap');
  assert.ok(geometry.scheme.includes(mode), 'native controls use ' + mode + ' color scheme');
  await openHeaderMore(p);
  const motionLabel=await p.locator('.motion-toggle').innerText();assert.ok(['暂停动效','恢复动效','遵循系统减少动态效果'].includes(motionLabel));
  assert.deepEqual(await p.locator('.header-more-panel button').allTextContents(), ['关于产品与预览', motionLabel, '复制当前页面链接']);
  const secondary = await p.locator('.header-more-panel button').evaluateAll(buttons => buttons.map(el => { const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom,hit:hit===el||el.contains(hit)}; }));
  assert.equal(secondary.length,3);assert.ok(secondary.every(r=>r.width>=44&&r.height>=44&&r.left>=0&&r.right<=viewport.width&&r.top>=0&&r.bottom<=viewport.height&&r.hit),'secondary header actions remain reachable: '+JSON.stringify(secondary));
  await p.locator('.header-more > summary').click();assert.equal(await p.locator('.header-more').getAttribute('open'),null);

  const foundation = await palette(p, 'body');
  const lum = rgb => rgb.map(v => { const c = v / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
  assert.ok(mode === 'light' ? lum(foundation.background) > .65 : lum(foundation.background) < .15, mode + ' foundation remains intentional');
  assert.ok(foundation.contrast >= 4.5, 'default body text contrasts with its solid foundation ' + JSON.stringify(foundation));
  const copySelector = path === '/' ? '.me-hero-copy .me-lead' : path === '/hall' || path === '/bespoke' ? '.me-section-heading p,.me-intro-copy > p' : path.startsWith('/category/') ? '.sp-lead,.me-plan-lead' : path.startsWith('/samples/') ? '.samples-pending p' : path === '/works' ? '.b2b-page-heading p' : path === '/cooperate' ? '.page-intro p' : path === '/mine' ? '.page-intro p' : path.startsWith('/experience/') ? 'fieldset legend' : '.empty p';
  assert.ok(await p.locator(copySelector).count(), 'representative readable copy exists: ' + path);
  const copy = await palette(p, copySelector);
  assert.ok(copy.contrast >= 4.5, 'representative body copy has readable solid-surface contrast ' + JSON.stringify(copy));
  if (path === '/') {
    const titlePalette = await palette(p, '.me-product-copy h2');
    assert.ok(titlePalette.contrast >= 4.5, 'home product copy contrasts with its separate solid surface');
    const textAreas = await p.locator('.me-product-copy h2').evaluateAll(items => items.map(el => {
      const text = el.getBoundingClientRect(), image = el.closest('.me-product-card').querySelector('.me-card-image').getBoundingClientRect();
      return { text: el.textContent.trim(), overlapsImage: Math.min(text.right, image.right) > Math.max(text.left, image.left) && Math.min(text.bottom, image.bottom) > Math.max(text.top, image.top) };
    }));
    assert.ok(textAreas.every(item => !item.overlapsImage), 'home cards separate readable titles from photography ' + JSON.stringify(textAreas));
  }
  if (path === '/hall' || path === '/bespoke') {
    // The approved product hero now places copy beside/before the photo on a solid surface.
    // Home cards also keep their copy on a solid surface separate from the photograph.
    assert.equal(await p.locator('.px-product-hero').count(), 1);
    const hero = await p.locator('.px-product-hero').evaluate(el => {
      const copy = el.querySelector('.editorial-heading').getBoundingClientRect(), image = el.querySelector('.editorial-hero-image').getBoundingClientRect();
      return { copy: { x: copy.x, y: copy.y, width: copy.width, height: copy.height }, image: { x: image.x, y: image.y, width: image.width, height: image.height }, overlap: Math.max(0, Math.min(copy.right, image.right) - Math.max(copy.left, image.left)) * Math.max(0, Math.min(copy.bottom, image.bottom) - Math.max(copy.top, image.top)) };
    });
    assert.ok(hero.copy.width > 0 && hero.copy.height > 0 && hero.image.width > 0 && hero.image.height > 0 && hero.overlap <= 1, 'product hero copy and image occupy distinct visible regions ' + JSON.stringify(hero));
    for (const selector of ['.px-product-hero .editorial-heading h1', '.px-product-hero .definition']) {
      const paletteValue = await palette(p, selector); assert.ok(paletteValue.contrast >= 4.5, 'product hero copy/control contrasts with its solid surface ' + selector + ' ' + JSON.stringify(paletteValue));
    }
  }
  const imageCount = await decodeImages(p);
  report.surfaces.push({ viewport, path, mode, geometry, foundation, copy, imageCount });
  if (viewport.width === 390 && ['/', '/hall', '/cooperate', '/experience/brand/brand-1'].includes(path)) await shot(p, mode + '-' + (path === '/' ? 'home' : path.replaceAll('/', '-')) + '-390');
  return { viewport, path, mode, images: imageCount, copyContrast: copy.contrast };
}
try {
  let ready = false;
  for (let i = 0; i < 60; i++) { try { if ((await fetch(base)).ok) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r, 150)); }
  assert.ok(ready, 'production preview responds at ' + base.href);
  browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, isMobile: viewport.width < 700, hasTouch: viewport.width < 700, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const p = activePage = await context.newPage(); observe(p);
    for (const mode of ['dark', 'light']) for (const path of paths) await run('SURFACE-' + viewport.width + '-' + mode + '-' + path.replace(/[^a-zA-Z0-9]/g, '_'), p, () => surface(p, viewport, path, mode));
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    window.__themeQA = { copied: [], writes: [], created: [], revoked: [] };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__themeQA.copied.push(text); } } });
    const set = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v) { window.__themeQA.writes.push(k); return set.call(this, k, v); };
    const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = blob => { const u = create(blob); window.__themeQA.created.push(u); return u; };
    URL.revokeObjectURL = u => { window.__themeQA.revoked.push(u); return revoke(u); };
  });
  const p = activePage = await context.newPage(); observe(p);
  await run('CROSS-ROUTE-AND-KEYBOARD', p, async () => {
    await goto(p, '/', 'dark'); await toggle(p).focus(); await p.keyboard.press('Space'); await p.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    assert.ok(await toggle(p).evaluate(el => document.activeElement === el), 'keyboard toggle retains focus');
    await p.keyboard.press('Enter'); await p.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await p.keyboard.press('Enter'); await p.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await hash(p, '/hall'); assert.equal(await modeOf(p), 'light');
    await hash(p, '/category/brand'); assert.equal(await modeOf(p), 'light');
    await hash(p, '/works'); assert.equal(await modeOf(p), 'light');
    return { keyboard: true, routesPreserveTheme: true };
  });
  await run('FORM-NODE-VALUES-AND-SCROLL', p, async () => {
    await goto(p, '/cooperate?product=hall&direction=brand&source=application', 'light');
    await p.locator('input[name=organization]').fill('Synthetic Theme QA');
    await p.locator('textarea[name=description]').fill('合成测试：主题切换应保留项目描述。');
    await p.locator('input[name=scope]').fill('合成测试规模');
    await p.evaluate(() => { window.__qaForm = document.querySelector('.demand-form'); scrollTo({ top: 300, behavior: 'instant' }); });
    await frames(p); const before = await p.evaluate(() => scrollY);
    await setMode(p, 'dark'); const darkScroll = await p.evaluate(() => scrollY);
    await setMode(p, 'light'); const lightScroll = await p.evaluate(() => scrollY);
    assert.ok(Math.abs(before - darkScroll) <= 2 && Math.abs(before - lightScroll) <= 2, 'theme keeps reading/working position');
    assert.ok(await p.evaluate(() => window.__qaForm === document.querySelector('.demand-form')), 'form is not remounted');
    assert.equal(await p.locator('input[name=organization]').inputValue(), 'Synthetic Theme QA');
    assert.equal(await p.locator('textarea[name=description]').inputValue(), '合成测试：主题切换应保留项目描述。');
    assert.equal(await p.locator('input[name=scope]').inputValue(), '合成测试规模');
    return { before, darkScroll, lightScroll, sameFormNode: true };
  });
  await run('PHOTO-CHOICES-CONSENT-AND-STEP', p, async () => {
    await goto(p, '/experience/brand/brand-1', 'light');
    for (const row of await p.locator('.option-row').all()) await row.getByRole('button').first().click();
    const choices = await p.locator('.option.selected').allTextContents();
    await p.getByRole('button', { name: '下一步：准备照片', exact: true }).click();
    await p.getByLabel('选择照片', { exact: true }).setInputFiles({ name: 'synthetic-theme.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR4nGPwyGz6D8IMMAYASp4IybKNq+0AAAAASUVORK5CYII=', 'base64') });
    await p.getByText('正在检查照片…', { exact: true }).waitFor({ state: 'hidden' });
    await p.getByRole('checkbox', { name: '我确认已获得这张照片的使用授权', exact: true }).check();
    const photo = await p.locator('.upload-box img').getAttribute('src');
    await p.evaluate(() => { window.__qaConfiguration = document.querySelector('.theme-config'); });
    await setMode(p, 'dark'); await setMode(p, 'light');
    assert.ok(await p.evaluate(() => window.__qaConfiguration === document.querySelector('.theme-config')));
    assert.equal(await p.locator('.upload-box img').getAttribute('src'), photo);
    assert.ok(await p.getByRole('checkbox', { name: '我确认已获得这张照片的使用授权', exact: true }).isChecked());
    assert.equal(await p.locator('.step-tabs .current').textContent(), '2准备照片');
    await p.getByRole('button', { name: '下一步：确认信息', exact: true }).click();
    const summary = await p.locator('.summary-list dd').allTextContents();
    await setMode(p, 'dark'); await setMode(p, 'light');
    assert.deepEqual(await p.locator('.summary-list dd').allTextContents(), summary);
    assert.equal(summary.length, 3); assert.equal(choices.length, 3);
    assert.equal(await p.locator('.summary-photo img').getAttribute('src'), photo);
    assert.ok(await p.getByRole('button', { name: '生成暂未开放', exact: true }).isDisabled());
    assert.ok(await p.evaluate(u => !window.__themeQA.revoked.includes(u), photo), 'theme switching does not release a live photo');
    return { choices: summary, photoPreserved: true, consentPreserved: true, sameConfigurationNode: true };
  });
  await run('DIALOG-READABILITY-AND-TOUCH-COPY', p, async () => {
    await goto(p, '/cooperate?product=hall&direction=brand&source=application', 'light');
    await p.locator('textarea[name=description]').fill('合成测试：对话框明暗主题、复制与原字段保留。');
    let expected;
    const palettes = [];
    for (const mode of ['light', 'dark']) {
      await setMode(p, mode);
      await p.getByRole('button', { name: '整理需求摘要', exact: true }).click();
      const dialog = p.getByRole('dialog'); await dialog.waitFor();
      const value = await dialog.getByLabel('需求摘要', { exact: true }).inputValue();
      if (expected) assert.equal(value, expected); else expected = value;
      const summaryPalette = await palette(p, 'dialog .summary-text');
      assert.ok(summaryPalette.contrast >= 4.5, 'summary remains readable ' + JSON.stringify(summaryPalette));
      const backdrop = await dialog.evaluate(el => getComputedStyle(el, '::backdrop').backgroundColor);
      assert.match(backdrop, /rgba?\(/, 'dialog has a visible scrim');
      const scrimChannels = backdrop.match(/[\d.]+/g)?.map(Number) || [];
      assert.ok(scrimChannels.length >= 3 && (scrimChannels.length < 4 || scrimChannels[3] >= .25), 'dialog backdrop is visibly opaque: ' + backdrop);
      const button = dialog.locator('.action-row > button').first();
      const before = await button.evaluate(el => { const c = getComputedStyle(el); return { color: c.color, backgroundColor: c.backgroundColor, backgroundImage: c.backgroundImage }; });
      await button.tap(); await frames(p);
      const after = await button.evaluate(el => { const c = getComputedStyle(el); return { color: c.color, backgroundColor: c.backgroundColor, backgroundImage: c.backgroundImage }; });
      assert.deepEqual(after, before, 'real touch does not leak the superseded hover palette');
      assert.equal(await p.evaluate(() => window.__themeQA.copied.at(-1)), expected);
      await shot(p, 'dialog-copy-' + mode);
      palettes.push({ mode, summaryPalette, backdrop, button: after });
      await dialog.getByRole('button', { name: '返回修改', exact: true }).click(); await dialog.waitFor({ state: 'hidden' });
      assert.equal(await p.locator('textarea[name=description]').inputValue(), '合成测试：对话框明暗主题、复制与原字段保留。');
    }
    return palettes;
  });
  await run('SHORT-SCREEN-AND-OPTIONS', p, async () => {
    await p.setViewportSize({ width: 320, height: 568 });
    const checks = [];
    for (const mode of ['dark', 'light']) {
      const productChecks = [];
      for (const business of ['hall', 'bespoke']) {
        await goto(p, '/' + business, mode);
        const primary = p.getByTestId('product-primary-action');
        const actionBox = await primary.evaluate(el => { const r = el.getBoundingClientRect(), header = document.querySelector('.topbar').getBoundingClientRect(), bottom = document.querySelector('.mobile-nav').getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { top: r.top, bottom: r.bottom, height: r.height, headerBottom: header.bottom, navTop: bottom.top, exposed: hit === el || el.contains(hit), scrollY }; });
        assert.ok(actionBox.scrollY === 0 && actionBox.top >= actionBox.headerBottom - 1 && actionBox.bottom <= actionBox.navTop - 1 && actionBox.height >= 43.5 && actionBox.exposed, 'the primary product action is reachable in the short initial viewport ' + JSON.stringify({ business, ...actionBox }));
        if (business === 'hall') await assertHallPrimaryAction(p, { tap: true });
        else { await primary.tap(); await p.locator('main[data-route="/cooperate"]').waitFor(); assert.ok(await p.getByRole('heading', { name: '高定创作咨询', exact: true }).isVisible()); }
        await goto(p, '/' + business, mode); await p.locator('.editorial-index').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' })); await frames(p);
        const nav = await p.locator('.editorial-index').evaluate(el => { const r = el.getBoundingClientRect(), bottom = document.querySelector('.mobile-nav').getBoundingClientRect().top; return { top: r.top, bottom: r.bottom, navTop: bottom, buttons: [...el.querySelectorAll('button')].map(b => { const box = b.getBoundingClientRect(), hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2); return hit === b || b.contains(hit); }) }; });
        assert.ok(nav.bottom <= nav.navTop + 1 && nav.buttons.length === 4 && nav.buttons.every(Boolean), 'all product chapters are reachable after scrolling ' + JSON.stringify(nav));
        const entries = productSections(business);
        for (const [section, label] of entries) {
          await p.getByRole('navigation', { name: '产品内容导航', exact: true }).getByRole('button', { name: label, exact: true }).tap();
          await p.waitForFunction(expected => document.activeElement?.id === expected, business + '-' + section);
          await p.waitForFunction(expected => document.querySelector('.editorial-index [aria-current="location"]')?.textContent.trim() === expected, label);
          const target = await p.locator('#' + business + '-' + section + ' h2').first().evaluate(el => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, headerBottom: Math.max(document.querySelector('.topbar').getBoundingClientRect().bottom, document.querySelector('.editorial-index').getBoundingClientRect().bottom), navTop: document.querySelector('.mobile-nav').getBoundingClientRect().top }; });
          assert.ok(target.top >= target.headerBottom - 1 && target.bottom < target.navTop, 'short-screen chapter heading remains readable ' + JSON.stringify({ business, section, ...target }));
        }
        productChecks.push({ business, primary: actionBox, nav });
      }
      await goto(p, '/category/team', mode);
      const notice = await p.locator('.sp-planned-note').evaluate(el => ({ text: el.textContent, y: el.getBoundingClientRect().top + scrollY }));
      const choiceY = await p.locator('.sp-choice-group').first().evaluate(el => el.getBoundingClientRect().top + scrollY);
      assert.ok(notice.y < choiceY && /策划示例.*尚未开放/.test(notice.text), 'planned options are labelled before they appear');
      const options = await p.locator('.sp-options > button').evaluateAll(items => items.map(el => ({ tag: el.tagName, selected: el.getAttribute('aria-pressed'), tabIndex: el.tabIndex })));
      assert.equal(options.length, 9);
      assert.ok(options.every(el => el.tag === 'BUTTON' && el.tabIndex === 0 && ['true', 'false'].includes(el.selected)));
      assert.equal(options.filter(el => el.selected === 'true').length, 3, 'each explanatory group has one selection');
      const before = await p.getByTestId('scenario-selection-results').innerText();
      await p.locator('.sp-choice-group').first().getByRole('button').nth(1).tap();
      assert.notEqual(await p.getByTestId('scenario-selection-results').innerText(), before, 'interactive proposal choices update their explained result');
      assert.equal(await p.locator('video,input[type=file]').count(), 0, 'proposal explanation does not expose a real generator');
      checks.push({ mode, products: productChecks, notice, choiceY });
    }
    return checks;
  });
  await run('SCENARIO-AND-PORTRAIT-FRAMES', p, async () => {
    await p.setViewportSize({ width: 390, height: 844 });
    const checks = [];
    for (const mode of ['dark', 'light']) {
      for (const path of ['/hall', '/category/event']) {
        await goto(p, path, mode);
        if(path==='/hall')await openProductDetails(p);
        const visual = p.locator(path === '/hall' ? '.me-benefit-art.me-portrait-media' : '.sp-hero-visual');
        await visual.waitFor(); await visual.locator('img').evaluate(async img => { img.loading = 'eager'; await img.decode(); });
        const frame = await visual.evaluate(el => {
          const media = el.querySelector('.me-media-frame,.sp-visual-frame'), img = el.querySelector('img'), r = media.getBoundingClientRect();
          const scale = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight);
          return { width: r.width, height: r.height, sourceWidth: img.naturalWidth, sourceHeight: img.naturalHeight, occupiedArea: img.naturalWidth * img.naturalHeight * scale * scale / (r.width * r.height), objectFit: getComputedStyle(img).objectFit };
        });
        if (path === '/hall') assert.ok(frame.height > frame.width && frame.occupiedArea > .9, 'portrait benefit keeps its natural frame ' + JSON.stringify(frame));
        else assert.ok(frame.width > 0 && frame.height > 0 && frame.sourceWidth > 0 && frame.sourceHeight > 0 && frame.objectFit === 'cover', 'scene hero uses a readable illustrated frame ' + JSON.stringify(frame));
        checks.push({ mode, path, frame });
      }
    }
    return checks;
  });
  await run('IMAGE-FAILURE-LIGHT', p, async () => {
    allowImageFailure = true;
    await p.route('**/images/editorial-20261029/brand-story-*.webp', route => route.abort('failed'));
    try {
      await goto(p, '/', 'light');
      const fallback = p.locator('.me-card-image .image-fallback');
      await fallback.waitFor();
      const copy = await palette(p, '.me-card-image .image-fallback span');
      assert.ok(copy.contrast >= 4.5, 'failed-image fallback remains readable');
      await shot(p, 'light-image-failure');
      await p.getByRole('link', { name: 'AI影像馆', exact: true }).click(); await p.locator('main[data-route="/hall"]').waitFor();
      return { fallback: true, navigationWorks: true, contrast: copy.contrast };
    } finally {
      await p.unroute('**/images/editorial-20261029/brand-story-*.webp'); allowImageFailure = false;
    }
  });
  await run('REFRESH-DEFAULT-AND-ZERO-PERSISTENCE', p, async () => {
    await goto(p, '/experience/brand/brand-1', 'light');
    await p.locator('.option-row').first().getByRole('button').first().click();
    const storage = await p.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), writes: window.__themeQA.writes }));
    assert.deepEqual(storage, { local: [], session: [], writes: [] });
    await p.reload(); await p.locator('.option-row').first().waitFor();
    assert.equal(await modeOf(p), 'dark'); assert.equal(await p.locator('.option.selected').count(), 0);
    assert.equal(await toggle(p).getAttribute('aria-pressed'), 'false');
    return { refreshedToDefault: true, configurationCleared: true, storage };
  });
  await context.close();
} catch (error) {
  report.fatal = error.stack || String(error);
  process.exitCode = 1;
} finally {
  await browser?.close(); server?.kill('SIGTERM');
  report.totals = report.cases.reduce((counts, item) => { counts[item.status] = (counts[item.status] || 0) + 1; return counts; }, {});
  report.status = report.fatal || report.cases.some(c => c.status === 'FAIL') || report.pageErrors.length || report.mutationRequests.length || report.dataRequests.length || report.missingAssets.length || report.failedRequests.length ? 'FAIL' : 'PASS';
  if (report.status !== 'PASS') process.exitCode = 1;
  await writeFile(join(output, 'results.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ status: report.status, totals: report.totals, surfaces: report.surfaces.length, pageErrors: report.pageErrors, mutationRequests: report.mutationRequests, dataRequests: report.dataRequests, missingAssets: report.missingAssets, failedRequests: report.failedRequests, failed: report.cases.filter(c => c.status === 'FAIL').map(c => ({ id: c.id, error: c.error })), fatal: report.fatal }, null, 2));
}
