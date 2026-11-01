import { useState, type ComponentType } from 'react';
import { reference } from './guangdang-data';
import { brandCampaignOptions, editorialPlans } from './mobile-editorial-data';

type ImageComponent = ComponentType<{ src: string; alt: string; className?: string; eager?: boolean }>;
type Props = { Image: ImageComponent; inquiryTo: string; experienceTo?: string };

export function PlanNavigation({ items }: { items: { id: string; title: string }[] }) {
  function jump(id: string) {
    const section = document.getElementById(id);
    section?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('motion-paused') ? 'instant' : 'smooth' });
    section?.focus({ preventScroll: true });
  }
  return <nav className="me-plan-nav" aria-label="方案内容导航">{items.map(item => <button type="button" key={item.id} onClick={() => jump(item.id)}>{item.title}</button>)}</nav>;
}

function DiagramIcon({ type }: { type: 'photo' | 'choice' | 'film' | 'brand' }) {
  return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{type === 'photo' ? <><rect x="5" y="3" width="22" height="26" rx="4"/><circle cx="16" cy="11" r="4"/><path d="M9 24c0-8 14-8 14 0"/></> : type === 'choice' ? <><path d="M6 8h20M6 16h20M6 24h20"/><circle cx="12" cy="8" r="3" fill="var(--ae-bg)"/><circle cx="21" cy="16" r="3" fill="var(--ae-bg)"/><circle cx="11" cy="24" r="3" fill="var(--ae-bg)"/></> : type === 'film' ? <><rect x="4" y="5" width="24" height="22" rx="4"/><path d="m13 11 8 5-8 5Z"/></> : <><path d="m4 12 12-8 12 8M6 13h20M6 28h20M9 14v10m7-10v10m7-10v10"/></>}</svg>;
}
const narrative = [
  { title: '我的初来深圳', detail: '以初入职场或生活启程，开启个人与城市的故事。' },
  { title: '我的成长', detail: '沿所选主线，呈现职业、家庭或创业的成长。' },
  { title: '工行相伴', detail: '在统一品牌表达中，连接陪伴、支持与日常生活。' },
  { title: '未来继续向前', detail: '以对美好生活的期待，收束这段成长故事。' },
];
const highlights = [
  { title: '品牌专属主题', description: '围绕“与深圳 共成长”，将品牌陪伴放入个人故事。' },
  { title: 'AI影像互动', description: '用一张照片和个人选择，设计低门槛的参与方式。' },
  { title: '多场景应用', description: '用于客户活动、开放日及社群主题互动。' },
  { title: '品牌传播延展', description: '为客户提供值得留存、可自愿分享的个人内容。' },
];
const growthVisuals = {
  career: { src: reference(8), alt: '工作中的手艺人，表达职业成长', caption: '职业成长画面参考' },
  family: { src: reference(9), alt: '家人一起度过的生活时刻，表达家庭陪伴', caption: '家庭陪伴画面参考' },
  venture: { src: reference(10), alt: '伙伴围绕设计图协作，表达共同创业与投入', caption: '创业协作画面参考' },
};

function CampaignConfigurator({ Image }: { Image: ImageComponent }) {
  const [growth, setGrowth] = useState<keyof typeof growthVisuals>('career');
  const [scenes, setScenes] = useState<string[]>(['bay', 'futian']);
  const [clothing, setClothing] = useState('按主题设定');
  const [style, setStyle] = useState('按主题设定');
  const [message, setMessage] = useState('');
  const selectedGrowth = brandCampaignOptions.growth.find(item => item.id === growth)!;
  const selectedScenes = brandCampaignOptions.scenes.filter(item => scenes.includes(item.id));
  const sceneReady = scenes.length >= 2;
  const visual = growthVisuals[growth];
  function toggleScene(id: string) { setScenes(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current); }
  return <div className="campaign-config" data-testid="campaign-configurator">
    <div className="campaign-config-controls">
      <fieldset className="campaign-field"><legend>成长主题<span className="campaign-selection-rule">选 1 项</span></legend>
        <div className="campaign-segment" role="group" aria-label="方案成长主题">{brandCampaignOptions.growth.map(item => <button type="button" key={item.id} data-testid={'campaign-growth-' + item.id} aria-pressed={growth === item.id} onClick={() => setGrowth(item.id as keyof typeof growthVisuals)}>{item.label}</button>)}</div>
        <p className="campaign-option-meaning" data-testid="campaign-growth-meaning">{selectedGrowth.meaning}</p>
      </fieldset>
      <fieldset className="campaign-field"><legend>深圳场景<span className="campaign-selection-rule">选 2–3 项</span></legend>
        <div className="campaign-scene-options">{brandCampaignOptions.scenes.map(item => <button type="button" key={item.id} data-testid={'campaign-scene-' + item.id} aria-pressed={scenes.includes(item.id)} disabled={!scenes.includes(item.id) && scenes.length === 3} onClick={() => toggleScene(item.id)}><span>{item.label}</span><span aria-hidden="true">{scenes.includes(item.id) ? '✓' : '＋'}</span></button>)}</div>
        <p className="campaign-selection-status" role="status" data-testid="campaign-scene-status">{!sceneReady ? `已选 ${scenes.length} 项，还需选择 ${2 - scenes.length} 项。` : scenes.length === 3 ? '已选 3 项，取消后可换选。' : '已选 2 项，可再加入一个场景。'}</p>
      </fieldset>
      <details className="bp-fold bp-personal"><summary>个性表达<span>服装 · 风格 · 心声</span></summary><fieldset className="campaign-field"><legend className="bp-visually-hidden">个性表达</legend>
        <div className="campaign-personal-options"><label>服装风格<select value={clothing} onChange={event => setClothing(event.currentTarget.value)} aria-label="方案服装风格"><option>按主题设定</option>{brandCampaignOptions.clothing.map(item => <option key={item}>{item}</option>)}</select></label><label>视频风格<select value={style} onChange={event => setStyle(event.currentTarget.value)} aria-label="方案视频风格"><option>按主题设定</option>{brandCampaignOptions.styles.map(item => <option key={item}>{item}</option>)}</select></label></div>
        <label className="campaign-message-label" htmlFor="campaign-personal-message">个人心声<input id="campaign-personal-message" value={message} onChange={event => setMessage(event.currentTarget.value)} maxLength={80} placeholder="在深圳，遇见更好的自己"/></label>
        <p className="campaign-option-meaning">服装影响人物形象，风格影响情绪，心声保留个人表达。</p>
      </fieldset></details>
    </div>
    <aside className="campaign-config-preview" aria-label="当前方案组合示意">
      <figure className="bp-choice-visual"><Image src={visual.src} alt={visual.alt}/><figcaption>{visual.caption} · 非成片</figcaption></figure>
      <div className="campaign-output" data-testid="campaign-combination-summary" aria-live="polite">
        <span className="bp-output-label">这组选择，将得到</span><h3>{selectedGrowth.label}短片</h3><p>{selectedGrowth.outcome}</p>
        <div className="bp-selected-scenes">{selectedScenes.map(item => <span key={item.id}>{item.label}</span>)}</div>
        {clothing !== '按主题设定' || style !== '按主题设定' ? <p>{clothing} · {style}</p> : null}{message.trim() ? <p>个人心声：{message.trim()}</p> : null}
        <p className="campaign-preview-status" data-testid="campaign-preview-status">{sceneReady ? '主题统一，个人故事与画面随选择变化。' : `还需选择 ${2 - scenes.length} 个场景。`}</p>
      </div>
      <p className="campaign-preview-note">仅为方案图解，不生成影片，也不会改变通用体验中心的设置。</p>
    </aside>
  </div>;
}

export default function BrandScenario({ Image, inquiryTo, experienceTo }: Props) {
  const plan = editorialPlans.brand;
  return <article className="application-detail mobile-editorial-plan bs-plan campaign-plan bp-plan" data-plan="brand" data-business="hall">
    <header className="me-plan-hero bs-hero campaign-hero"><div className="campaign-hero-copy"><p className="me-eyebrow">AI影像馆 / 我为品牌代言</p><span className="campaign-proposal-label">品牌客户活动 · 方案示例</span><h1>与深圳 共成长</h1><p className="me-plan-lead">一张照片，把你的成长放进品牌故事。</p></div><figure className="campaign-city-visual"><Image src={plan.image} alt="深圳城市天际线，表达个人与城市共同成长" eager/><figcaption>深圳场景参考</figcaption></figure></header>
    <PlanNavigation items={[{ id: 'brand-overview', title: '怎么玩' }, { id: 'brand-options', title: '选一选' }, { id: 'brand-outcome', title: '得到什么' }, { id: 'brand-cooperation', title: '如何合作' }]}/>
    <section id="brand-overview" className="me-plan-section bs-overview" tabIndex={-1}><p className="me-eyebrow">01 / 玩法图解</p><h2>同一个品牌主题，<br/>每个人自己的故事。</h2>
      <ol className="bp-flow" aria-label="活动玩法图解">{[{type:'photo' as const,title:'一张本人照片',note:'成为故事主角'},{type:'choice' as const,title:'选择成长故事',note:'主题＋深圳场景'},{type:'film' as const,title:'个人成长短片',note:'目标约30秒'}].map(item=><li key={item.title}><DiagramIcon type={item.type}/><strong>{item.title}</strong><span>{item.note}</span></li>)}</ol>
      <p className="bp-audience">品牌／机构发起 · 客户参与<br/>适用于客户活动、开放日与社群运营。</p>
      <details className="bp-fold" data-testid="brand-planning-details"><summary>展开完整策划<span>目标 · 亮点 · 故事</span></summary><div className="bp-fold-content"><h3>项目目标</h3><p>{plan.summary}</p><p>发起方确认品牌模板，参与者选择个人主线；让品牌陪伴与个人记忆共同进入影片。</p><div className="campaign-highlights">{highlights.map(item=><article key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>)}</div><h3>四段共同叙事</h3><ol className="bs-story-grid bp-story">{narrative.map((item,index)=><li key={item.title}><span>0{index+1}</span><div><h4>{item.title}</h4><p>{item.detail}</p></div></li>)}</ol></div></details>
    </section>
    <section id="brand-options" className="me-plan-section bs-options" tabIndex={-1}><p className="me-eyebrow">02 / 选一选</p><h2>点选一下，<br/>看故事如何变化。</h2><CampaignConfigurator Image={Image}/></section>
    <section id="brand-outcome" className="me-plan-section bs-outcome" tabIndex={-1}><p className="me-eyebrow">03 / 得到什么</p><h2>给用户一份纪念，<br/>给品牌一次参与。</h2><div className="bs-outcome-grid bp-deliveries"><article><DiagramIcon type="film"/><span className="bs-recipient">参与者</span><h3>个人成长短片</h3><ul><li>本人主角＋选择的城市画面</li><li>约30秒，含统一活动主题</li><li>保存留念，按意愿分享</li></ul><p className="campaign-value">把自己与深圳的故事，留成可观看的纪念。</p></article><article><DiagramIcon type="brand"/><span className="bs-recipient">品牌与活动方</span><h3>客户影像互动方案</h3><ul><li>统一的活动入口与品牌模板</li><li>个人可选内容与素材规则</li><li>成果呈现及交付安排</li></ul><p className="campaign-value">用客户的个人故事，具体表达品牌陪伴。</p></article></div>
      <details className="bp-fold bs-journey"><summary>活动如何开展<span>查看5步参与流程</span></summary><ol className="bp-journey">{plan.journey.map((step,index)=><li key={step.title}><span>0{index+1}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol></details><p className="bs-status-note">方案目标，非已交付案例。规格与使用范围按项目确认，不保证传播成效。</p>
    </section>
    <section id="brand-cooperation" className="me-plan-section bs-cooperation" tabIndex={-1}><p className="me-eyebrow">04 / 如何合作</p><h2>从你的活动出发。</h2><details className="bp-fold me-plan-preparation"><summary>合作前准备什么<span>素材 · 规模 · 交付</span></summary><ul>{plan.preparation.map(item=><li key={item}>{item}</li>)}</ul></details><div className="application-actions me-plan-actions bs-actions"><a className="button scene-cta" href={`#${inquiryTo}`}>咨询同类项目</a><a className="button secondary" data-testid="plan-experience-link" href={experienceTo || '#/experience-center?mode=template&returnTo=%2Fcategory%2Fbrand'}>查看通用玩法演示</a></div><p className="bs-status-note">本活动的生成与领取需随项目接入。咨询当前仅在本机整理、复制。</p></section>
  </article>;
}
