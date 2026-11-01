import assert from 'node:assert/strict';

// Shared acceptance rules for the 2026-11-01 Apple-style B2B information architecture.
export const navigationLabels = ['首页', '应用方案', '能力体验', '合作咨询'];
export const navigationHrefs = ['#/', '#/works', '#/experience-center?mode=template', '#/cooperate'];
export const planIds = ['brand', 'event', 'team', 'campus', 'person', 'family', 'enterprise', 'city'];
export const planTitles = { brand: '与深圳 共成长', event: '我的活动高光时刻', team: '退休员工纪念', campus: '我的毕业纪念影像', person: '一位人物的职业故事', family: '一段跨代的家庭记忆', enterprise: '企业周年记忆影片', city: '一条街区的城市记忆' };
export const productSections = business => business === 'hall' ? [['overview','产品定义'],['scenes','应用方案'],['benefits','体验能力'],['try','项目合作']] : [['overview','产品介绍'],['benefits','创作与样品'],['pricing','价格说明'],['try','咨询定制']];
export async function openHeaderMore(page) {
  const more = page.locator('details.header-more');
  if (await more.getAttribute('open') === null) await more.locator('summary').click();
  assert.notEqual(await more.getAttribute('open'), null);
}
export async function openProductDetails(page) {
  const details = page.locator('details.b2b-product-details');
  if (await details.getAttribute('open') === null) await details.locator('summary').click();
  assert.notEqual(await details.getAttribute('open'), null);
}
export async function assertHallPrimaryAction(page, { tap = false } = {}) {
  const before = page.url();
  const primary = page.getByTestId('product-primary-action');
  assert.equal(await primary.getAttribute('href'), null, 'product hero navigates within its own page');
  if (tap) await primary.tap(); else await primary.click();
  await page.waitForFunction(() => document.activeElement?.id === 'hall-scenes');
  await page.waitForFunction(() => document.querySelector('.editorial-index [aria-current="location"]')?.textContent.trim() === '应用方案');
  assert.equal(page.url(), before, 'product hero retains the product route');
  assert.equal(await page.locator('#hall-scenes a.scenario-card').count(), 4);
}
export async function assertPlanContent(page, id) {
  assert.equal(await page.locator('main h1').innerText(), planTitles[id]);
  assert.equal(await page.locator('.me-plan-nav button').count(), 4);
  assert.equal(await page.getByRole('heading', { name: '暂时没有这个页面', exact: true }).count(), 0);
  if (id === 'brand') {
    assert.equal(await page.locator('.bp-plan').count(), 1);
    assert.match(await page.locator('.campaign-proposal-label').innerText(), /方案示例/);
    assert.equal(await page.locator('.bp-flow > li').count(), 3, 'mobile overview leads with an illustrated flow');
    const planning = page.getByTestId('brand-planning-details');
    assert.equal(await planning.getAttribute('open'), null, 'complete planning starts collapsed');
    await planning.locator('summary').click();
    assert.equal(await planning.locator('.bs-story-grid > li').count(), 4);
    assert.equal(await planning.locator('.campaign-highlights article').count(), 4);
    await planning.locator('summary').click();
    const configuration = page.getByTestId('campaign-configurator');
    assert.equal(await configuration.locator('fieldset').count(), 3);
    assert.deepEqual(await configuration.getByRole('group', { name: '方案成长主题', exact: true }).getByRole('button').allTextContents(), ['职场成长', '家庭相伴', '创业逐梦']);
    assert.equal(await configuration.locator('.campaign-scene-options button').count(), 5);
    assert.match(await page.locator('.bs-options').innerText(), /选 2–3 项/);
    const personal = configuration.locator('.bp-personal');
    assert.equal(await personal.getAttribute('open'), null);
    await personal.locator('summary').click();
    assert.match(await personal.innerText(), /服装风格.*视频风格.*个人心声/s);
    await personal.locator('summary').click();
    const initialImage = await page.locator('.bp-choice-visual img').getAttribute('src');
    await page.getByTestId('campaign-growth-family').click();
    assert.match(await page.getByTestId('campaign-combination-summary').innerText(), /家庭相伴/);
    assert.notEqual(await page.locator('.bp-choice-visual img').getAttribute('src'), initialImage, 'growth selection changes its corresponding illustration');
    await page.getByTestId('campaign-growth-career').click();
    assert.ok((await page.getByTestId('campaign-growth-meaning').innerText()).length > 15);
    assert.match(await page.locator('.campaign-preview-note').innerText(), /不生成影片.*不会改变通用体验中心/s);
    const journey = page.locator('.bs-journey');
    assert.equal(await journey.getAttribute('open'), null);
    await journey.locator('summary').click();
    assert.equal(await journey.locator('ol > li').count(), 5);
    await journey.locator('summary').click();
    assert.equal(await page.locator('.bs-outcome-grid article').count(), 2);
    assert.equal(await page.locator('.campaign-value').count(), 2);
    assert.match(await page.locator('.bs-outcome').innerText(), /30\s*秒/);
    assert.match(await page.locator('.bs-cooperation').innerText(), /本活动的生成与领取需随项目接入/);
    const image = page.locator('.campaign-city-visual img'); await image.evaluate(async el => { el.loading = 'eager'; await el.decode(); });
    assert.ok(await image.evaluate(el => el.naturalWidth > 0 && el.naturalHeight > 0));
    assert.equal(await page.locator('img[src*="icbc-shenzhen-plan"],a[href*="icbc-shenzhen-plan"]').count(), 0, 'source poster is not embedded or linked');
    assert.equal(await page.getByRole('link', { name: '查看完整方案图', exact: true }).count(), 0);
    assert.equal(await page.locator('a[href*="/experience/brand/brand-1"]').count(), 0);
  } else {
    assert.equal(await page.locator('.sp-plan').count(), 1);
    assert.equal(await page.getByTestId('scenario-flow').locator('li').count(), 3, 'mobile overview uses a three-node illustrated flow');
    const planning = page.getByTestId('scenario-planning-details');
    assert.equal(await planning.getAttribute('open'), null, 'long planning detail is progressively disclosed');
    await planning.locator('summary').click();
    assert.equal(await planning.locator('.sp-highlights article').count(), 3);
    assert.equal(await planning.locator('.sp-narrative > li').count(), 4);
    assert.equal(await planning.locator('.sp-journey > li').count(), 5);
    assert.ok((await planning.locator('.sp-project-facts').innerText()).length > 30);
    await planning.locator('summary').click();
    const configuration = page.getByTestId('scenario-configurator');
    assert.equal(await configuration.locator('fieldset').count(), 3);
    const result = page.getByTestId('scenario-selection-results');
    for (const group of await configuration.locator('fieldset').all()) {
      const buttons = group.getByRole('button');
      assert.equal(await buttons.count(), 3);
      assert.equal(await group.locator('button[aria-pressed="true"]').count(), 1);
      const initial = await result.innerText();
      await buttons.nth(1).click();
      assert.equal(await group.locator('button[aria-pressed="true"]').count(), 1);
      assert.equal(await buttons.nth(1).getAttribute('aria-pressed'), 'true');
      assert.notEqual(await result.innerText(), initial, 'selection changes its explained outcome');
      assert.ok((await group.locator('.sp-choice-meaning').innerText()).length > 10);
      await buttons.first().click();
    }
    assert.equal(await result.locator('li').count(), 3);
    assert.match(await page.locator('.sp-combination .sp-local-note').innerText(), /不生成影片|团队结合资料确认/);
    await page.locator('.sp-summary-jump').click();
    await page.waitForFunction(expected => document.activeElement?.id === expected, id + '-combination');
    for (const side of ['user', 'business']) {
      const outcome = page.getByTestId('scenario-' + side + '-outcome');
      assert.ok((await outcome.locator('h3').innerText()).length > 5);
      assert.ok((await outcome.locator('.sp-output-value').innerText()).length > 15);
      const items = page.getByTestId('scenario-' + side + '-items');
      assert.equal(await items.getAttribute('open'), null);
      await items.locator('summary').click();
      assert.equal(await items.locator('li').count(), 3);
      await items.locator('summary').click();
    }
    assert.equal(await page.locator('.sp-visual').count(), 3);
    for (const caption of await page.locator('.sp-visual figcaption').all()) assert.match(await caption.innerText(), /参考|示意|概念|非成片|非项目成片/);
    assert.equal(await page.locator('.sp-scope-details').getAttribute('open'), null);
    assert.equal(await page.locator('.sp-preparation').getAttribute('open'), null);
    if (id === 'team') assert.match(await page.locator('.sp-planned-note').innerText(), /策划示例.*尚未开放/);
  }
  assert.equal(await page.locator('video,input[type="file"]').count(), 0, 'proposal explanation is separate from upload or generation');
  const targetIds=id==='brand'?['brand-overview','brand-options','brand-outcome','brand-cooperation']:[id+'-audience',id+'-options',id+'-outcome',id+'-cooperate'];
  const before=page.url();
  for(let i=0;i<targetIds.length;i++){
    await page.locator('.me-plan-nav button').nth(i).click();
    await page.waitForFunction(target=>document.activeElement?.id===target,targetIds[i]);
    assert.equal(page.url(),before,'local plan navigation does not replace the route or source context');
    await page.waitForFunction(target=>{const el=document.getElementById(target);if(!el)return false;const r=el.getBoundingClientRect(),header=document.querySelector('.topbar').getBoundingClientRect(),index=document.querySelector('.me-plan-nav').getBoundingClientRect(),nav=document.querySelector('.mobile-nav'),bottom=nav&&getComputedStyle(nav).display!=='none'?nav.getBoundingClientRect().top:innerHeight;return document.activeElement===el&&r.top>=Math.max(header.bottom,index.bottom)-2&&r.top<bottom;},targetIds[i]);
  }
  const primary = page.locator('.application-actions a.scene-cta');
  const href = await primary.getAttribute('href'); assert.match(href, /^#\/cooperate\?/);
  const params = new URL(href.slice(1), 'https://prototype.invalid').searchParams;
  assert.equal(params.get('direction'), id); assert.equal(params.get('source'), 'application');
  assert.equal(params.get('product'), planIds.indexOf(id) < 4 ? 'hall' : 'bespoke');
  assert.equal(await page.locator('.real-case-section').count(), 0);
}
export async function assertSolutionIndex(page, { exercise = true } = {}) {
  await page.getByRole('heading', { name: '应用方案', exact: true, level: 1 }).waitFor();
  const filters = page.getByRole('navigation', { name: '按产品筛选方案', exact: true });
  const modes = page.getByRole('navigation', { name: '方案与作品', exact: true });
  assert.deepEqual(await filters.getByRole('link').allTextContents(), ['全部产品', 'AI影像馆', '高定AI影像']);
  if (new URL(page.url()).hash.includes('view=published')) await modes.getByRole('link', { name: '方案示例', exact: true }).click();
  assert.equal(await modes.count(), 0, 'normal proposal entry hides an empty published-work tab');
  await filters.getByRole('link', { name: '全部产品', exact: true }).click();
  assert.equal(await page.locator('a.b2b-solution-card').count(), 8);
  assert.deepEqual(await page.locator('a.b2b-solution-card').evaluateAll(cards => cards.map(card => card.dataset.testid)), planIds.map(id => 'solution-' + id));
  await page.locator('.b2b-solution-card img').evaluateAll(async images => { await Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode(); })); });
  assert.ok(await page.locator('.b2b-solution-card img').evaluateAll(images => images.every(image => image.naturalWidth > 0 && image.naturalHeight > 0)));
  if (exercise) for (const [product, label, ids] of [['hall', 'AI影像馆', planIds.slice(0, 4)], ['bespoke', '高定AI影像', planIds.slice(4)]]) {
    await filters.getByRole('link', { name: label, exact: true }).click();
    assert.equal(await page.locator('a.b2b-solution-card').count(), 4);
    assert.ok(new URL(page.url()).hash.includes('product=' + product));
    for (const id of ids) {
      await page.getByTestId('solution-' + id).click();
      await page.locator(`main[data-route="/category/${id}"]`).waitFor();
      await assertPlanContent(page, id);
      await page.locator('.back-button').click();
      await page.locator('main[data-route="/works"]').waitFor();
      assert.ok(new URL(page.url()).hash.includes('product=' + product));
      assert.equal(await page.locator('a.b2b-solution-card').count(), 4);
    }
  }
  await page.evaluate(() => { location.hash = '/works?view=published'; });
  await page.getByRole('heading', { name: '正式作品待上架', exact: true }).waitFor();
  assert.deepEqual(await modes.getByRole('link').allTextContents(), ['方案示例', '正式作品']);
  assert.equal(await page.locator('video,a.b2b-solution-card').count(), 0);
  await page.getByRole('link', { name: '查看方案示例', exact: true }).click();
  assert.equal(await modes.count(), 0);
  await filters.getByRole('link', { name: '全部产品', exact: true }).click();
  assert.equal(await page.locator('a.b2b-solution-card').count(), 8);
}
