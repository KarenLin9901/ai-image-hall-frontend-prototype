import type { ComponentType } from 'react';
import { brandCampaignOptions, editorialPlans } from './mobile-editorial-data';

type ImageComponent = ComponentType<{ src: string; alt: string; className?: string; eager?: boolean }>;
type Props = { Image: ImageComponent; inquiryTo: string; experienceTo?: string };

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

export default function BrandScenario({ Image, inquiryTo, experienceTo }: Props) {
  const plan = editorialPlans.brand;
  return <article className="soft-plan" data-plan="brand" data-business="hall">
    <header className="soft-plan-hero">
      <div className="soft-plan-hero-image"><Image src={plan.image} alt="深圳城市天际线，表达个人与城市共同成长" eager/></div>
      <span className="soft-plan-status">方案示例</span>
      <div className="soft-plan-hero-copy"><p>AI影像馆 · 我为品牌代言</p><h1>与深圳 共成长</h1><p className="soft-plan-lead">一张照片，把你的成长放进品牌故事。</p><a className="ux-plan-action" href={'#'+inquiryTo}>整理这类项目需求<span aria-hidden="true">↗</span></a></div>
    </header>
    <div className="soft-plan-panel">
      <section className="soft-plan-overview" aria-labelledby="brand-idea"><p className="soft-plan-eyebrow">活动怎样发生</p><h2 id="brand-idea">同一个品牌主题，<br/>每个人自己的故事。</h2><ol className="soft-plan-flow" aria-label="活动玩法图解">{[{ title: '一张本人照片', note: '成为故事主角' }, { title: '选择成长故事', note: '主题＋深圳场景' }, { title: '个人成长短片', note: '目标约30秒' }].map((item, index) => <li key={item.title}><b aria-hidden="true">{String(index + 1).padStart(2, '0')}</b><strong>{item.title}</strong><span>{item.note}</span></li>)}</ol><p className="soft-plan-audience">品牌／机构发起 · 客户参与<br/>适用于客户活动、开放日与社群运营。</p></section>
      <section className="soft-plan-outcomes" aria-label="方案成果"><div><span className="soft-plan-eyebrow">给参与者</span><h3>个人成长短片</h3><p>把自己与深圳的故事，留成可观看的纪念。</p></div><div><span className="soft-plan-eyebrow">给品牌与活动方</span><h3>客户影像互动方案</h3><p>用客户的个人故事，具体表达品牌陪伴。</p></div></section>
      <details className="soft-plan-details" data-testid="brand-planning-details"><summary><span>查看完整策划<small>内容方向、实施步骤与合作准备</small></span><span className="soft-plan-plus" aria-hidden="true">＋</span></summary><div className="soft-plan-detail-body">
        <section><h3>项目目标</h3><p>{plan.summary}</p><p>发起方确认品牌模板，参与者选择个人主线；让品牌陪伴与个人记忆共同进入影片。</p></section>
        <section><h3>方案亮点</h3><div className="soft-plan-text-grid">{highlights.map(item => <div key={item.title}><h4>{item.title}</h4><p>{item.description}</p></div>)}</div></section>
        <section><h3>四段共同叙事</h3><ol className="soft-plan-story">{narrative.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h4>{item.title}</h4><p>{item.detail}</p></div></li>)}</ol></section>
        <section><h3>活动可设计哪些选择</h3><p>以下为方案内容参考，具体可选范围由活动方确认。</p><div className="soft-plan-choice-reference"><div><h4>成长主题 · 选择一条主线</h4><dl>{brandCampaignOptions.growth.map(item => <div key={item.id}><dt>{item.label}</dt><dd>{item.meaning}<br/>{item.outcome}</dd></div>)}</dl></div><div><h4>深圳场景 · 选择2–3项</h4><p>{brandCampaignOptions.scenes.map(item => item.label).join('、')}。</p><p>决定个人故事发生在哪些城市空间，将生活记忆与深圳、品牌连接起来。</p></div><div><h4>个性表达 · 按需设置</h4><p>服装风格：{brandCampaignOptions.clothing.join('、')}。视频风格：{brandCampaignOptions.styles.join('、')}。</p><p>服装影响人物形象，风格影响情绪，心声保留个人表达。可选范围由活动方提前配置与确认。</p></div></div></section>
        <section><h3>活动如何开展</h3><ol className="soft-plan-story">{plan.journey.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h4>{step.title}</h4><p>{step.description}</p></div></li>)}</ol></section>
        <section><h3>成果包含什么</h3><div className="soft-plan-text-grid"><div><h4>参与者 · 个人成长短片</h4><ul><li>本人主角＋选择的城市画面</li><li>目标约30秒，含统一活动主题</li><li>保存留念，按意愿分享</li></ul></div><div><h4>品牌与活动方 · 影像互动方案</h4><ul><li>统一的活动入口与品牌模板</li><li>个人可选内容与素材规则</li><li>成果呈现及交付安排</li></ul></div></div><p>{plan.outcome.extras}</p><p>方案目标，非已交付案例。规格与使用范围按项目确认，不保证传播成效。</p></section>
        <section><h3>合作前准备</h3><ul>{plan.preparation.map(item => <li key={item}>{item}</li>)}</ul></section>
      </div></details>
      <section className="soft-plan-cooperate"><p className="soft-plan-eyebrow">让方案成为你的项目</p><h2>从你的活动出发。</h2><p>一起确认主题、参与方式与成果。</p><div className="soft-plan-actions"><a className="soft-plan-button" href={'#' + inquiryTo}>整理这类项目需求<span aria-hidden="true">↗</span></a><a className="soft-plan-link" data-testid="plan-experience-link" href={experienceTo || '#/experience-center?mode=template&returnTo=%2Fcategory%2Fbrand'}>体验通用玩法<span aria-hidden="true">→</span></a></div><p className="soft-plan-note">方案与配图仅供参考，不代表已交付案例。活动生成与领取按项目接入。当前需求仅在本机整理与复制，尚未发送。</p></section>
    </div>
  </article>;
}
