import { assertPlanContent, assertHallPrimaryAction } from './b2b-assertions.mjs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

// Independent user journeys complement the retained nine-theme compatibility suites.
// The new experience flow is local: no generation, upload, billing or consultation API is expected.
const base = new URL(process.env.PREVIEW_URL || 'http://127.0.0.1:4203/ai-image-hall-frontend-prototype/');
base.hash = '';
if (!base.searchParams.has('version')) base.searchParams.set('version', 'experience-center-qa');
const out = resolve(process.env.EXPERIENCE_OUTPUT || fileURLToPath(new URL('../outputs/experience-center-20261030/evidence/', import.meta.url)));
await mkdir(out, { recursive: true });
const server = process.env.PREVIEW_URL ? null : spawn('npm', ['exec', 'vite', 'preview', '--', '--host', '127.0.0.1', '--port', '4203', '--strictPort'], { stdio: 'ignore' });
const report = { base: base.href, cases: [], errors: [], mutationRequests: [], dataRequests: [], missingAssets: [], failedRequests: [], screenshots: [] };
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR4nGPwyGz6D8IMMAYASp4IybKNq+0AAAAASUVORK5CYII=', 'base64');
const photo = { name: 'synthetic-user.png', mimeType: 'image/png', buffer: image };
const viewports = [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 1440, height: 1000 }];
const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
let browser, context, p;
function urlFor(path) { const url = new URL(base); url.hash = path; return url.href; }
async function route(path) { await p.goto('about:blank'); await p.goto(urlFor(path)); await p.locator('main').waitFor(); await frames(p); }
async function hash(path) { await p.evaluate(next => { location.hash = next; }, path); await p.locator(`main[data-route="${path.split('?')[0]}"]`).waitFor(); await frames(p); }
const id = value => p.getByTestId(value);
async function appearance(mode) { if (await p.locator('html').getAttribute('data-theme') !== mode) await id('theme-toggle').click(); await frames(p); assert.equal(await p.locator('html').getAttribute('data-theme'), mode); }
async function shot(name) { const filename = name.replace(/[^a-zA-Z0-9_-]/g, '-') + '.png'; await p.screenshot({ path: join(out, filename) }); report.screenshots.push(filename); }
async function run(name, task) { try { report.cases.push({ id: name, status: 'PASS', data: await task() }); } catch (error) { await shot(name + '-failure').catch(() => {}); report.cases.push({ id: name, status: 'FAIL', error: error.stack || String(error) }); } await writeFile(join(out, 'results.json'), JSON.stringify(report, null, 2)); }
async function noOverflow(label) { const result = await p.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth })); assert.ok(result.scrollWidth <= result.width + 1, label + ': ' + JSON.stringify(result)); return result; }
async function chooseCustom(action = '沿着步道慢慢走，向镜头挥手，再望向远方。') { await id('ec-mode-custom').click(); await id('ec-identity-explorer').click(); await id('ec-scene-city').click(); await id('ec-action').fill(action); return action; }
async function toMaterials() { await id('ec-to-materials').click(); await id('ec-photo-input').waitFor(); await frames(p); }
async function awaitPhoto() { await p.waitForFunction(() => !document.querySelector('[data-testid="ec-photo-input"]')?.disabled && ![...document.querySelectorAll('[role=status]')].some(el => /正在检查/.test(el.textContent))); await frames(p); }
const preview = () => p.locator('[data-testid="ec-photo-preview"] img, img[data-testid="ec-photo-preview"]');
async function setPhoto(file = photo) { await id('ec-photo-input').setInputFiles(file); await awaitPhoto(); await preview().waitFor(); await preview().evaluate(img => img.decode()); return preview().getAttribute('src'); }
async function review() { await id('ec-to-review').click(); await id('ec-copy').waitFor(); await frames(p); }
async function createContext(viewport = viewports[1]) {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 700, hasTouch: viewport.width < 700, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    window.__ecQA = { copied: [], reject: false, created: [], revoked: [], writes: [], hold: false, pending: [], copyHold: false, copyPending: [] };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { if (window.__ecQA.copyHold) await new Promise((resolve, reject) => window.__ecQA.copyPending.push({ value, resolve, reject })); if (window.__ecQA.reject) throw new Error('Synthetic clipboard denial'); window.__ecQA.copied.push(value); } } });
    const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL), decode = Image.prototype.decode;
    URL.createObjectURL = value => { const url = create(value); window.__ecQA.created.push(url); return url; };
    URL.revokeObjectURL = value => { window.__ecQA.revoked.push(value); return revoke(value); };
    Image.prototype.decode = function (...args) { const value = decode.apply(this, args); return value.then(() => window.__ecQA.hold ? new Promise(resolve => window.__ecQA.pending.push({ src: this.src, resolve })) : undefined); };
    const set = Storage.prototype.setItem; Storage.prototype.setItem = function (key, value) { window.__ecQA.writes.push({ key, value }); return set.call(this, key, value); };
  });
  const page = await ctx.newPage(); page.setDefaultTimeout(10000);
  page.on('pageerror', error => report.errors.push({ url: page.url(), message: error.message }));
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) report.mutationRequests.push({ method: request.method(), url: request.url() }); if (['fetch', 'xhr', 'websocket'].includes(request.resourceType())) report.dataRequests.push(request.url()); });
  page.on('response', response => { if (new URL(response.url()).origin === base.origin && response.status() >= 400) report.missingAssets.push({ url: response.url(), status: response.status() }); });
  page.on('requestfailed', request => { if (request.failure()?.errorText !== 'net::ERR_ABORTED') report.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }); });
  return { ctx, page };
}
try {
  let ready = false; for (let attempt = 0; attempt < 60; attempt++) { try { if ((await fetch(base)).ok) { ready = true; break; } } catch {} await new Promise(resolve => setTimeout(resolve, 150)); } assert.ok(ready, 'Preview not available');
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  for (const viewport of viewports) {
    ({ ctx: context, page: p } = await createContext(viewport));
    for (const mode of ['dark', 'light']) for (const play of ['template', 'custom']) await run(`SURFACE-${viewport.width}-${mode}-${play}`, async () => {
      await route('/experience-center?mode=' + play); await appearance(mode); await id('experience-center').waitFor();
      assert.equal(await id('ec-mode-' + play).getAttribute('aria-pressed'), 'true');
      if (play === 'template') { assert.equal(await id('ec-action').count(), 0); assert.equal(await p.locator('[data-testid^="ec-template-"]').count(), 3); assert.ok(await id('ec-step-1').isDisabled()); assert.ok(await id('ec-step-2').isDisabled()); }
      else { assert.equal(await id('ec-action').count(), 1); assert.equal(await p.locator('[data-testid^="ec-identity-"]').count(), 3); assert.equal(await p.locator('[data-testid^="ec-scene-"]').count(), 3); }
      await p.locator('main img').evaluateAll(async images => Promise.all(images.map(async img => { img.loading = 'eager'; await img.decode(); })));
      assert.ok(await p.locator('main img').evaluateAll(images => images.every(img => img.naturalWidth > 0)));
      if (viewport.width === 390) await shot(`${mode}-${play}-entry-390`);
      return { ...await noOverflow(play), mode, play };
    });
    await context.close(); context = null;
  }
  ({ ctx: context, page: p } = await createContext());
  await run('CUSTOM-EDIT-NODE-FOCUS', async () => {
    await route('/experience-center?mode=custom'); await id('ec-identity-explorer').click(); await id('ec-scene-city').click();
    const action = id('ec-action'), node = await action.elementHandle(); await action.fill(''); await action.pressSequentially('我想慢慢走进这段风景，再向镜头挥手。');
    assert.equal(await action.inputValue(), '我想慢慢走进这段风景，再向镜头挥手。'); assert.ok(await node.evaluate(el => el.isConnected && document.activeElement === el));
    await id('ec-suggestion-0').click(); assert.ok(await node.evaluate(el => el.isConnected)); const suggestion = await action.inputValue(); assert.ok(suggestion.length > 3);
    await action.press('End'); await action.pressSequentially('然后回头微笑。'); const composed = await action.inputValue(); assert.equal(composed, suggestion + '然后回头微笑。');
    const current = await p.locator('html').getAttribute('data-theme'); await appearance(current === 'light' ? 'dark' : 'light'); assert.ok(await node.evaluate(el => el.isConnected)); assert.equal(await action.inputValue(), composed);
    return { sequentialInput: true, focused: true, suggestionEditsSameNode: true, themeKeepsNode: true };
  });
  await run('MODES-AND-ROUTE-RETAIN-DRAFTS', async () => {
    await route('/experience-center?mode=custom'); const action = await chooseCustom('走到观景台前，向远处挥手。');
    await id('ec-mode-template').click(); assert.equal(await id('ec-action').count(), 0); await id('ec-use-city-walk').click(); await id('ec-photo-input').waitFor();
    const url = await setPhoto(); await id('ec-photo-consent').check(); await id('ec-step-0').click(); await id('ec-mode-custom').click();
    assert.equal(await id('ec-action').inputValue(), action); assert.equal(await id('ec-identity-explorer').getAttribute('aria-pressed'), 'true');
    await id('ec-mode-template').click(); await id('ec-step-1').click(); assert.equal(await preview().getAttribute('src'), url); assert.ok(await id('ec-photo-consent').isChecked());
    const source = p.url(); await hash('/works'); await p.goBack(); await id('experience-center').waitFor(); assert.equal(await preview().getAttribute('src'), url); assert.ok(await id('ec-photo-consent').isChecked());
    assert.equal(p.url(), source); return { isolatedModes: true, photoAndConsentRetained: true, nativeBack: true };
  });
  await run('TEMPLATE-FIXED-COPY-AND-FALLBACK', async () => {
    await route('/experience-center?mode=template'); const fixed = await id('ec-template-city-walk').locator('dl dd').allTextContents(); assert.deepEqual(fixed, ['城市探索者', '城市天际线', '走上观景步道，在城市灯光前停下，望向远方。']);
    await id('ec-mode-custom').click(); await chooseCustom('这个自定义行为不能混进固定模板。'); await id('ec-mode-template').click(); assert.deepEqual(await id('ec-template-city-walk').locator('dl dd').allTextContents(), fixed);
    await id('ec-use-city-walk').click(); await id('ec-photo-input').waitFor(); await review(); assert.equal(await id('ec-action').count(), 0); assert.ok(await id('ec-generate').isDisabled());
    await id('ec-copy').click(); const copied = await p.evaluate(() => window.__ecQA.copied.at(-1)); assert.ok(copied.includes('模板')); assert.ok(!copied.includes('这个自定义行为')); assert.doesNotMatch(copied, /blob:|data:image/);
    await p.evaluate(() => { window.__ecQA.reject = true; }); await id('ec-copy').click(); await id('ec-copy-summary').waitFor(); assert.equal(await id('ec-copy-summary').inputValue(), copied); assert.ok(await id('ec-copy-summary').getAttribute('readonly') !== null); await p.keyboard.press('Escape'); await p.getByRole('dialog', { name: '我的体验配置', exact: true }).waitFor({ state: 'hidden' }); await p.waitForFunction(() => document.activeElement?.dataset.testid === 'ec-copy');
    return { fixedTemplate: true, copy: true, manualFallback: true, noFakeGeneration: true };
  });
  for (const outcome of ['reject', 'resolve']) for (const destination of ['mode', 'step']) await run(`COPY-RACE-${outcome}-${destination}`, async () => {
    await route('/experience-center?mode=template'); await id('ec-use-city-walk').click(); await review();
    await p.evaluate(() => { window.__ecQA.copyHold = true; }); await id('ec-copy').click(); await p.waitForFunction(() => window.__ecQA.copyPending.length === 1);
    if (destination === 'mode') await id('ec-mode-custom').click(); else await id('ec-step-0').click();
    await p.evaluate(outcome => { const pending = window.__ecQA.copyPending.shift(); if (outcome === 'reject') pending.reject(new Error('Delayed clipboard denial')); else pending.resolve(); }, outcome); await frames(p);
    assert.equal(await id('ec-copy-summary').count(), 0, 'expired copy must not open a summary in another mode or step'); assert.equal(await p.getByText('配置已复制', { exact: true }).count(), 0, 'expired success must not add feedback to a new mode or step');
    return { outcome, destination, expiredFeedbackIgnored: true };
  });
  await run('COPY-DELAYED-FALLBACK-SNAPSHOT', async () => {
    await route('/experience-center?mode=custom'); const action = await chooseCustom('本次点击复制时确认的行为描述。'); await toMaterials(); await review();
    await p.evaluate(() => { window.__ecQA.copyHold = true; }); await id('ec-copy').click(); await p.waitForFunction(() => window.__ecQA.copyPending.length === 1);
    const snapshot = await p.evaluate(() => window.__ecQA.copyPending[0].value); assert.ok(snapshot.includes(action)); assert.ok(snapshot.includes('城市探索者'));
    await appearance('light'); await p.evaluate(() => window.__ecQA.copyPending.shift().reject(new Error('Delayed clipboard denial'))); await id('ec-copy-summary').waitFor(); assert.equal(await id('ec-copy-summary').inputValue(), snapshot);
    await p.keyboard.press('Escape'); await p.getByRole('dialog', { name: '我的体验配置', exact: true }).waitFor({ state: 'hidden' });
    return { validSameViewFallback: true, usesClickedSnapshot: true, appearanceDoesNotInvalidate: true };
  });
  await run('PHOTO-VALIDATION-REPLACEMENT-AND-CONSENT', async () => {
    await route('/experience-center?mode=custom'); await chooseCustom(); await toMaterials(); const original = await setPhoto(); await id('ec-photo-consent').check();
    await id('ec-photo-input').setInputFiles({ name: 'corrupt.png', mimeType: 'image/png', buffer: Buffer.from('not an image') }); await awaitPhoto();
    assert.equal(await preview().getAttribute('src'), original); assert.ok(await id('ec-photo-consent').isChecked()); assert.ok((await id('ec-photo-error').innerText()).length > 2);
    const replaced = await setPhoto({ ...photo, name: 'replacement.png' }); assert.notEqual(replaced, original); assert.ok(await p.evaluate(url => window.__ecQA.revoked.includes(url), original)); assert.equal(await id('ec-photo-consent').isChecked(), false); assert.ok(await id('ec-to-review').isDisabled());
    await id('ec-photo-consent').check(); await review(); assert.ok(await id('ec-generate').isDisabled()); await id('ec-step-1').click(); assert.ok(await id('ec-photo-consent').isChecked());
    return { badReplacementRetainsOld: true, oldUrlReleased: true, replacementNeedsConsent: true, reviewKeepsConsent: true };
  });
  await run('PHOTO-SIZE-AND-TYPE-BOUNDARIES', async () => {
    await route('/experience-center?mode=custom'); await chooseCustom(); await toMaterials();
    await id('ec-photo-input').setInputFiles({ name: 'wrong.gif', mimeType: 'image/gif', buffer: image }); await awaitPhoto(); assert.equal(await preview().count(), 0); assert.ok((await id('ec-photo-error').innerText()).length > 2);
    await id('ec-photo-input').setInputFiles({ name: 'too-large.png', mimeType: 'image/png', buffer: Buffer.concat([image, Buffer.alloc(10 * 1024 * 1024 + 1 - image.length)]) }); await awaitPhoto(); assert.equal(await preview().count(), 0); assert.match(await id('ec-photo-error').innerText(), /10|大小/);
    await setPhoto({ name: 'exact-10MiB.png', mimeType: 'image/png', buffer: Buffer.concat([image, Buffer.alloc(10 * 1024 * 1024 - image.length)]) });
    return { invalidTypeRejected: true, overLimitRejected: true, exactLimitDecoded: true };
  });
  await run('PHOTO-RACE-CANCEL-ON-LEAVE', async () => {
    await route('/experience-center?mode=custom'); await chooseCustom(); await toMaterials(); const original = await setPhoto(); await id('ec-photo-consent').check();
    await p.evaluate(() => { window.__ecQA.hold = true; }); await id('ec-photo-input').setInputFiles({ ...photo, name: 'pending.png' }); await p.waitForFunction(() => window.__ecQA.pending.length > 0); const pending = await p.evaluate(() => window.__ecQA.created.at(-1));
    await hash('/works'); assert.ok(await p.evaluate(url => window.__ecQA.revoked.includes(url), pending)); assert.ok(!await p.evaluate(url => window.__ecQA.revoked.includes(url), original));
    await p.evaluate(() => { window.__ecQA.hold = false; window.__ecQA.pending.splice(0).forEach(item => item.resolve()); }); await hash('/experience-center?mode=custom');
    assert.equal(await preview().getAttribute('src'), original); assert.ok(await id('ec-photo-consent').isChecked());
    return { candidateReleased: true, validDraftRetained: true, lateDecodeIgnored: true };
  });
  await run('PHOTO-RACE-REMOVE', async () => {
    await route('/experience-center?mode=custom'); await chooseCustom(); await toMaterials(); const original = await setPhoto(); await id('ec-photo-consent').check();
    await p.evaluate(() => { window.__ecQA.hold = true; }); await id('ec-photo-input').setInputFiles({ ...photo, name: 'pending-remove.png' }); await p.waitForFunction(() => window.__ecQA.pending.length === 1); const candidate = await p.evaluate(() => window.__ecQA.created.at(-1));
    await id('ec-remove-photo').click(); assert.equal(await preview().count(), 0); assert.equal(await id('ec-photo-consent').count(), 0); assert.ok(await p.evaluate(urls => urls.every(url => window.__ecQA.revoked.includes(url)), [original, candidate]));
    await p.evaluate(() => { window.__ecQA.hold = false; window.__ecQA.pending.splice(0).forEach(item => item.resolve()); }); await frames(p); assert.equal(await preview().count(), 0); assert.ok(await id('ec-to-review').isEnabled());
    return { validAndCandidateUrlsReleased: true, lateDecodeCannotRestoreRemovedPhoto: true };
  });
  await run('PHOTO-RACE-LATEST-SELECTION', async () => {
    await route('/experience-center?mode=custom'); await chooseCustom(); await toMaterials(); await p.evaluate(() => { window.__ecQA.hold = true; });
    await id('ec-photo-input').setInputFiles({ ...photo, name: 'older.png' }); await p.waitForFunction(() => window.__ecQA.pending.length === 1); const older = await p.evaluate(() => window.__ecQA.created.at(-1));
    await id('ec-photo-input').setInputFiles({ ...photo, name: 'latest.png' }); await p.waitForFunction(() => window.__ecQA.pending.length === 2); const latest = await p.evaluate(() => window.__ecQA.created.at(-1));
    await p.evaluate(() => { window.__ecQA.hold = false; window.__ecQA.pending[1].resolve(); }); await p.waitForFunction(expected => document.querySelector('[data-testid="ec-photo-preview"] img')?.getAttribute('src') === expected, latest);
    await p.evaluate(() => window.__ecQA.pending[0].resolve()); await frames(p); assert.equal(await preview().getAttribute('src'), latest); assert.ok(await p.evaluate(url => window.__ecQA.revoked.includes(url), older)); assert.ok(!await p.evaluate(url => window.__ecQA.revoked.includes(url), latest));
    return { latestWinsEvenWhenOlderCompletesLast: true, abandonedCandidateReleased: true };
  });
  await run('EMPTY-ACTION-KEYBOARD-AND-ZERO-STORAGE', async () => {
    await route('/experience-center?mode=custom'); await id('ec-identity-explorer').click(); await id('ec-scene-city').click(); await id('ec-action').fill('   ');
    const next = id('ec-to-materials'); if (await next.isEnabled()) { await next.click(); assert.equal(await id('ec-photo-input').count(), 0); assert.ok(await p.locator('[role=alert]').isVisible()); }
    await id('ec-action').fill('以轻快的步伐走向镜头。'); await id('ec-action').focus(); await p.keyboard.press('Tab'); assert.ok(await p.evaluate(() => document.activeElement instanceof HTMLButtonElement || document.activeElement instanceof HTMLAnchorElement));
    const result = await p.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), writes: window.__ecQA.writes })); assert.deepEqual(result, { local: [], session: [], writes: [] });
    await appearance('light'); await p.reload(); await id('experience-center').waitFor(); assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark'); assert.equal(await id('ec-action').inputValue(), '');
    return { emptyActionBlocked: true, keyboardNavigation: true, temporaryOnly: true, refreshClears: true };
  });
  await context.close(); context = null;
  ({ ctx: context, page: p } = await createContext());
  await run('SAMPLES-CATEGORY-ISOLATION', async () => {
    await route('/samples/hall?preview=themes');
    await p.locator('.experience-filters').getByRole('button', { name: '校园青春', exact: true }).click();
    assert.equal(await p.locator('a.theme-card').count(), 2);
    await hash('/samples/hall?category=brand');await p.locator('.samples-page').waitFor();
    assert.ok(p.url().includes('category=brand')); const fold = p.locator('.legacy-theme-library'); if (await fold.getAttribute('open') === null) await fold.locator('summary').click();
    const ids = await p.locator('a.theme-card').evaluateAll(cards => cards.map(card => card.dataset.theme));
    assert.deepEqual(ids, ['shenzhen-belike', 'brand-0', 'brand-1']);
    await hash('/samples/hall?preview=themes'); assert.equal(await p.locator('a.theme-card').count(), 2); assert.equal(await p.locator('.experience-filters button[aria-pressed="true"]').innerText(), '校园青春');
    return { categoryUsesMatchingThemes: true, fullLibraryRetainsOwnFilter: true };
  });
  await run('LEGACY-SETTING-SOURCE-RETURN', async () => {
    await route('/theme/brand/1'); await p.getByRole('link', { name: '预览主题配置', exact: true }).click(); await p.locator('.theme-config').waitFor();
    await p.getByRole('navigation', { name: '底部导航', exact: true }).getByRole('link', { name: '应用方案', exact: true }).click(); await p.locator('main[data-route="/works"]').waitFor();
    await p.goBack(); await p.locator('main[data-route="/experience/brand/brand-1"]').waitFor();
    await p.locator('.back-button').click(); await p.locator('main[data-route="/theme/brand/1"]').waitFor();
    await route('/experience/brand/brand-1'); await p.locator('.back-button').click(); await p.locator('main[data-route="/samples/hall"]').waitFor();
    return { legacyThemeSourceReturn: true, globalRoundtripKeepsSource: true, directLinkFallback: true };
  });
  for (const [category, title, representative] of [['brand', '来了就是深圳人', '我为品牌代言'], ['team', '我的职场成长影像', '退休员工纪念']]) await run('LEGACY-INQUIRY-' + category, async () => {
    await route('/theme/' + category + '/0'); await p.locator('.application-actions a[href^="#/cooperate?"]').click(); await p.locator('.demand-form').waitFor();
    assert.ok((await p.locator('.inquiry-context').innerText()).includes(title)); assert.ok(!(await p.locator('.inquiry-context').innerText()).includes(representative));
    await p.locator('textarea[name=description]').fill('测试：保留旧主题真实来源。'); await p.getByRole('button', { name: '整理需求摘要', exact: true }).click(); const dialog = p.getByRole('dialog', { name: '你的需求摘要', exact: true }); const text = await dialog.getByLabel('需求摘要', { exact: true }).inputValue();
    assert.ok(text.includes('参考主题：' + title)); assert.ok(!text.includes('参考方案：' + representative)); assert.match(text, /尚未发送/);
    await dialog.getByRole('button', { name: '返回修改', exact: true }).click(); await p.locator('.back-button').click(); await p.locator('main[data-route="/category/' + category + '"]').waitFor();
    return { category, correctLegacyTheme: title, doesNotImpersonatePlan: representative, legacyCategoryReturn: true };
  });
  await run('BRAND-PLAN-DEMO-AND-CONSULTATION',async()=>{
    await route('/works?product=hall');await p.getByTestId('solution-brand').click();await p.locator('main[data-route="/category/brand"]').waitFor();await assertPlanContent(p,'brand');
    const source=p.url(),returnTo=new URL(source).hash.slice(1);await p.getByTestId('plan-experience-link').click();await id('experience-center').waitFor();assert.equal(new URLSearchParams(new URL(p.url()).hash.split('?')[1]).get('returnTo'),returnTo);await id('ec-mode-custom').click();assert.equal(new URLSearchParams(new URL(p.url()).hash.split('?')[1]).get('returnTo'),returnTo);
    await p.locator('.back-button').click();await p.locator('main[data-route="/category/brand"]').waitFor();assert.equal(p.url(),source);
    await p.locator('.application-actions a.scene-cta').click();await p.locator('.demand-form').waitFor();assert.match(await p.locator('.inquiry-context').innerText(),/与深圳 共成长/);await p.locator('textarea[name=description]').fill('Synthetic brand activity request');await p.getByRole('button',{name:'整理需求摘要',exact:true}).click();const summary=await p.getByLabel('需求摘要',{exact:true}).inputValue();assert.match(summary,/需求方向：我为品牌代言/);assert.match(summary,/参考方案：与深圳 共成长/);assert.match(summary,/尚未发送/);await p.getByRole('button',{name:'返回修改',exact:true}).click();await p.locator('.back-button').click();await p.locator('main[data-route="/category/brand"]').waitFor();assert.equal(p.url(),source);return {independentCampaign:true,sourcePreserved:true,consultationNotSent:true};
  });
  await run('PRODUCT-SPLIT-PRICING-AND-PLAN-SOURCE', async () => {
    await route('/hall');await assertHallPrimaryAction(p);await route('/hall');await id('product-experience-link').click();await id('experience-center').waitFor();
    await route('/bespoke'); const primary = id('product-primary-action'); assert.match(await primary.innerText(), /咨询定制/); assert.match(await primary.getAttribute('href'), /^#\/cooperate\?/); assert.equal(await p.getByRole('link', { name: '立即体验', exact: true }).count(), 0);
    const pricing = p.locator('#bespoke-pricing'); assert.equal(await id('bespoke-pricing').getAttribute('data-pricing-status'), 'quote-on-request'); assert.equal(await id('bespoke-pricing').locator('h3').innerText(), '按需求报价'); assert.match(await pricing.innerText(), /报价|价格/); assert.ok((await pricing.innerText()).length > 50); assert.doesNotMatch(await pricing.innerText(), /[¥￥]\s*\d|\d[\d,.]*\s*元/);
    await route('/category/enterprise'); await p.locator('.application-actions a[href^="#/cooperate?"]').click(); await p.locator('.demand-form').waitFor(); await p.locator('textarea[name=description]').fill('测试：企业周年影片需求。'); await p.getByRole('button', { name: '整理需求摘要', exact: true }).click(); const summary = await p.getByRole('dialog', { name: '你的需求摘要', exact: true }).getByLabel('需求摘要', { exact: true }).inputValue(); assert.ok(summary.includes('企业周年记忆影片')); assert.match(summary, /尚未发送/); assert.doesNotMatch(summary, /已提交|已受理/);
    return { productIntentSplit: true, priceScopeVisible: true, noInventedPrice: true, specificPlanRetained: true, notSent: true };
  });
} catch (error) { report.fatal = error.stack || String(error); process.exitCode = 1; }
finally {
  await context?.close(); await browser?.close(); server?.kill('SIGTERM');
  report.totals = report.cases.reduce((counts, item) => { counts[item.status] = (counts[item.status] || 0) + 1; return counts; }, {});
  report.status = report.fatal || report.cases.some(item => item.status === 'FAIL') || report.errors.length || report.mutationRequests.length || report.dataRequests.length || report.missingAssets.length || report.failedRequests.length ? 'FAIL' : 'PASS';
  if (report.status !== 'PASS') process.exitCode = 1;
  await writeFile(join(out, 'results.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ status: report.status, totals: report.totals, fatal: report.fatal, errors: report.errors, mutationRequests: report.mutationRequests, dataRequests: report.dataRequests, missingAssets: report.missingAssets, failedRequests: report.failedRequests, failed: report.cases.filter(item => item.status === 'FAIL').map(item => ({ id: item.id, error: item.error })) }, null, 2));
}
