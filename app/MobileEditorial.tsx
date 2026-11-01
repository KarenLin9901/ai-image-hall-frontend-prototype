import { useState, type ComponentType, type ReactNode } from 'react';
import { businessName, businessApplications, categoryById, productPresentations, productBenefits, publishedWorks, type Business, type PublishedWork } from './guangdang-data';
import { isPublishedAndAuthorized } from './guangdang-guards';
import { editorialPlans, editorialBenefits, editorialIntroductions } from './mobile-editorial-data';
import { experiencePathFor } from './experience-navigation';
import { bespokePricing } from './bespoke-pricing';
import BrandScenario from './BrandScenario';
import ScenarioPlan from './ScenarioPlan';

type ImageComponent = ComponentType<{ src: string; alt: string; className?: string; eager?: boolean }>;
type ImageProps = { Image: ImageComponent; src: string; alt: string; label?: string; className?: string; eager?: boolean; children?: ReactNode };

function Arrow() {
  return <svg className="me-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>;
}
function Visual({ Image, src, alt, label, className = '', eager = false, children }: ImageProps) {
  return <figure className={`me-image ${className}`}><div className="me-media-frame"><Image src={src} alt={alt} eager={eager}/>{children}</div>{label ? <figcaption className="me-image-label">{label}</figcaption> : null}</figure>;
}
function SectionHeading({ number, title, description }: { number?: string; title: string; description?: string }) {
  return <div className="me-section-heading">{number ? <span className="me-eyebrow">{number}</span> : null}<h2>{title}</h2>{description ? <p>{description}</p> : null}</div>;
}
function Flow({ steps, label }: { steps: string[]; label: string }) {
  return <div className="me-flow-line" aria-label={label}><ol>{steps.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, '0')}</b><span>{step}</span></li>)}</ol></div>;
}
const commissionStages = [
  { title: '整理需求', description: '明确用途、故事重点与已有资料。' },
  { title: '团队沟通', description: '进一步了解内容与创作目标。' },
  { title: '确认方案与报价', description: '共同确认制作范围和交付安排。' },
  { title: '制作与审片', description: '按确认方向创作并阶段反馈。' },
  { title: '交付成果', description: '按项目约定交付影片版本。' },
];
export function EditorialHome({ Image }: { Image: ImageComponent }) {
  return <div className="mobile-editorial-home me-home-compact">
    <section className="me-home-hero" aria-label="面向品牌与机构的AI影像产品">
      <div className="me-hero-copy"><p className="me-eyebrow">面向品牌与机构的 AI 影像产品</p><h1 className="me-display">让用户<span>参与，</span><br/>让品牌被<span>看见。</span></h1><p className="me-lead">活动互动，或专属创作。<br/>先了解产品，再体验它能做什么。</p></div>
    </section>
    <section id="home-products" className="me-home-products" aria-label="选择影像服务">
      <div className="me-product-grid">
        {(['hall', 'bespoke'] as Business[]).map((business, index) => {
          const intro = editorialIntroductions[business];
          return <a className="me-product-card home-choice" href={`#/${business}`} aria-label={businessName(business)} key={business}>
            <Visual Image={Image} src={intro.image} alt={`${businessName(business)}产品概念图`} label={intro.imageLabel} className="me-card-image" eager/>
            <div className="me-product-copy"><span className="me-number" aria-hidden="true">0{index + 1}</span><h2>{businessName(business)}</h2><p className="me-product-kind">{business === 'hall' ? '为品牌活动，设计人人可参与的影像体验' : '从需求与资料出发，由团队完成专属影片'}</p><span className="me-link">{business === 'hall' ? '了解互动产品' : '了解创作服务'}<Arrow/></span></div>
          </a>;
        })}
      </div>
    </section>
  </div>;
}

type ProductProps = { business: Business; Image: ImageComponent; activeSection: string; onSection: (id: string) => void; onSceneVisit: () => void; inquiryTo: string };
function ProductAdvantages({ business, Image }: { business: Business; Image: ImageComponent }) {
  const profile = productPresentations[business];
  const benefits = editorialBenefits[business];
  return <><div className="benefit-grid me-benefit-list">{benefits.map((benefit, index) => <article className="me-benefit" key={benefit.title}>
        <Visual Image={Image} src={benefit.image} alt={benefit.title} label={benefit.imageLabel} className={`me-benefit-art${benefit.imageFormat === 'portrait' ? ' me-portrait-media' : ''}`}>{index === 1 ? <div className="me-media-tags" aria-label={business === 'hall' ? '参与步骤示意' : '影像设计要点'}>{(business === 'hall' ? ['选择内容', '确认设定', '专属影像'] : ['人物', '场景', '影像气质']).map(label => <span key={label}>{label}</span>)}</div> : null}</Visual>
        <div className="me-benefit-copy"><span className="me-number">0{index + 1}</span><h3>{benefit.title}</h3><p className="benefit-need">{benefit.description}</p><details className="me-benefit-details"><summary>了解这一优势<span aria-hidden="true">＋</span></summary><dl><div><dt>解决方式</dt><dd>{productBenefits[business][index].solution}</dd></div><div><dt>产品优势</dt><dd>{productBenefits[business][index].advantage}</dd></div></dl></details></div>
      </article>)}</div>
      <details className="simple-fold editorial-project-details me-project-fold"><summary>项目合作与准备<Arrow/></summary><div className="fold-content"><p>{profile.description}</p><div className="product-features">{profile.features.map(feature => <article className="feature-card" key={feature.title}><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div><h3>项目如何开展</h3><ol className="workflow-list">{profile.workflow.map((step, index) => <li key={step.title}><b>{index + 1}</b><div><h4>{step.title}</h4><p>{step.description}</p></div></li>)}</ol><h3>准备资料</h3><ul>{profile.preparation.map(item => <li key={item}>{item}</li>)}</ul><p className="scope-note">{profile.scopeNote}</p></div></details></>;
}

function SamplePlayer({ work }: { work: PublishedWork }) {
  const [failed, setFailed] = useState(false);
  return <article className="px-sample-card"><div className="px-sample-media">{failed ? <p role="status">这份样品暂时无法播放，请稍后再试。</p> : <video controls playsInline preload="none" poster={work.media.poster} aria-label={work.title} onError={() => setFailed(true)}><source src={work.media.src}/>当前浏览器不支持视频播放。</video>}</div><h3>{work.title}</h3><span className="px-sample-authorized">正式样品</span></article>;
}

function ProductSamples({ business, Image }: { business: Business; Image: ImageComponent }) {
  const ready = publishedWorks.filter(work => work.business === business && work.media.type === 'video' && isPublishedAndAuthorized(work));
  return ready.length ? <div className="px-sample-grid">{ready.map(work => <SamplePlayer key={work.id} work={work}/>)}</div> : <div className="px-samples-pending px-samples-compact" data-testid="product-samples-pending"><div><span className="me-state">正式样品待上架</span><p>当前配图用于解释方案，尚无可播放的正式样品。</p><a className="text-link" href={`#/samples/${business}`}>查看样品状态<Arrow/></a></div></div>;
}

export function EditorialProduct({ business, Image, activeSection, onSection, onSceneVisit, inquiryTo }: ProductProps) {
  const intro = editorialIntroductions[business];
  const hall = business === 'hall';
  const sections = hall ? [{ id: 'overview', label: '产品定义' }, { id: 'scenes', label: '应用方案' }, { id: 'benefits', label: '体验能力' }, { id: 'try', label: '项目合作' }] : [{ id: 'overview', label: '产品介绍' }, { id: 'benefits', label: '创作与样品' }, { id: 'pricing', label: '价格说明' }, { id: 'try', label: '咨询定制' }];
  const roles = hall ? [
    { title: '服务谁', description: '品牌、企业、机构与活动主办方。' },
    { title: '谁来参与', description: '客户、员工、活动观众或社群成员。' },
    { title: '提供什么', description: '围绕项目主题设计影像互动；具体入口、模板与成果按项目确认。' },
  ] : [
    { title: '服务谁', description: '企业、机构及有专属故事创作需求的委托方。' },
    { title: '如何开展', description: '收集需求和资料，沟通方案与报价，再由团队创作。' },
    { title: '提供什么', description: '面向约定用途的专属影片，交付版本与服务范围逐项确认。' },
  ];
  const sceneCards = <section id={`${business}-scenes`} data-nav-section={hall ? 'scenes' : undefined} className="editorial-scenarios" tabIndex={-1}>
    <SectionHeading number={hall ? '应用方案' : '创作方向'} title={hall ? '先看一个项目，怎样用起来。' : '从故事方向，找到创作重点。'} description={hall ? '每份方案说明活动目标、用户选择、成果与品牌价值。它们是方案示例，不是已交付案例。' : '人物、家庭、企业与城市四类方案，帮助你判断资料和用途。'}/>
    <div className="scenario-grid">{businessApplications[business].map(application => { const plan = editorialPlans[application.categoryId]; const category = categoryById.get(application.categoryId)!; return <a className={`scenario-card${category.id === 'brand' ? ' scenario-card-brand' : ''}`} href={`#/category/${category.id}`} key={category.id} onClick={onSceneVisit}><div className="scenario-card-media"><Image src={plan.image} alt={`${plan.title}方案参考`}/><span className="me-card-label">方案示例</span></div><div className="scenario-card-copy"><h3>{application.title}</h3><p className="me-scenario-title">{plan.title}</p><p>{plan.summary}</p><span className="scenario-card-action">了解这套方案<Arrow/></span></div></a>; })}</div>
  </section>;
  return <article className="editorial-product mobile-editorial-product px-product" data-business={business}>
    <header className="editorial-hero me-product-hero px-product-hero"><div className="editorial-heading"><p className="me-eyebrow">{hall ? '品牌活动 · 用户参与 · 影像互动' : '专属需求 · 团队创作 · 影片交付'}</p><h1>{businessName(business)}</h1><p className="definition">{hall ? '面向品牌与机构的 AI 影像互动产品，让每位参与者成为活动故事的主角。' : '从需求与真实资料出发，由团队为企业、机构及委托方创作专属影片。'}</p><div className="px-hero-actions">{hall ? <button className="button" data-testid="product-primary-action" onClick={() => onSection('scenes')}>查看应用方案<Arrow/></button> : <a className="button" data-testid="product-primary-action" href={`#${inquiryTo}`}>咨询定制<Arrow/></a>}<a className="button secondary" data-testid={hall ? 'product-experience-link' : 'product-samples-link'} href={hall ? '#'+experiencePathFor('template','/hall?section=introduction') : '#/samples/bespoke'}>{hall ? '体验产品能力' : '查看样品'}</a></div><p className="px-hero-note">{hall ? '通过通用玩法演示，了解用户将如何参与。' : '按需求报价；先确认创作方案，再推进制作。'}</p></div><div className="editorial-hero-image"><Image src={intro.image} alt={`${businessName(business)}产品概念图`} eager/><span>概念示意</span></div></header>
    <nav className="editorial-index" aria-label="产品内容导航">{sections.map(section => <button className={activeSection === section.id ? 'active' : ''} aria-current={activeSection === section.id ? 'location' : undefined} key={section.id} onClick={() => onSection(section.id)}>{section.label}</button>)}</nav>

    <section id={`${business}-overview`} data-nav-section="overview" className="editorial-overview" tabIndex={-1}>
      <SectionHeading number="产品定义" title={intro.title} description={intro.description}/>
      <div className="buyer-role-grid b2b-role-grid">{roles.map(role => <article key={role.title}><h3>{role.title}</h3><p>{role.description}</p></article>)}</div>
      <Flow steps={hall ? ['项目方确定主题', '用户参与个性表达', '形成个人主题影像'] : ['收集需求与资料', '团队策划与制作', '审片并交付影片']} label={`${businessName(business)}产品关系示意`}/>
    </section>

    {hall ? sceneCards : null}

    <section id={`${business}-benefits`} data-nav-section="benefits" className={hall ? 'editorial-benefits' : 'px-samples-section'} tabIndex={-1}>
      <SectionHeading number={hall ? '体验能力' : '创作与样品'} title={hall ? '两种玩法，适配不同参与需求。' : '先理解创作，再确认想要的成果。'} description={hall ? '品牌方可以直接体验两种参与方式，判断怎样的互动更适合自己的活动。具体活动配置仍需按项目设计。' : '查看创作方向与资料要求，正式样品上架后可直接观看。'}/>
      {hall ? <div className="px-play-grid"><a className="px-play-card" href={'#'+experiencePathFor('template','/hall?section=benefits')} data-testid="template-mode-entry"><Visual Image={Image} src={intro.image} alt="模板体验人物与场景概念" label="画面参考"/><div><span className="px-play-kind">品牌预设，用户选择</span><h3>模板体验</h3><p>角色、场景和行为由模板设定。适合表达统一、参与步骤简单的主题活动。</p><span className="px-play-link">演示模板玩法<Arrow/></span></div></a><a className="px-play-card" href={'#'+experiencePathFor('custom','/hall?section=benefits')} data-testid="custom-mode-entry"><Visual Image={Image} src={editorialBenefits.hall[2].image} alt="自定义体验校园场景参考" label="场景参考"/><div><span className="px-play-kind">限定范围，个人表达</span><h3>自定义体验</h3><p>用户选择身份与场景，再选择或编辑要做的事。适合需要更多个人表达的活动。</p><span className="px-play-link">演示自定义玩法<Arrow/></span></div></a></div> : <ProductSamples business={business} Image={Image}/>}
      {hall ? <p className="px-service-status">当前可体验内容设定与本机素材预览，真实上传与生成服务待接入。</p> : null}
    </section>

    {!hall ? sceneCards : null}

    {!hall ? <><section id="bespoke-pricing" data-nav-section="pricing" className="px-pricing-section" tabIndex={-1}><SectionHeading number="价格与服务范围" title="先明确需求，再确认报价。"/><div className="px-pricing-layout"><div className="px-price-heading" data-testid="bespoke-pricing" data-pricing-status={bespokePricing.status}><span>服务价格</span><h3>{bespokePricing.heading}</h3><p>{bespokePricing.description}</p><a className="button" href={`#${inquiryTo}`}>整理询价需求<Arrow/></a></div><dl className="px-pricing-scope">{bespokePricing.scope.map(item => <div key={item.title}><dt>{item.title}</dt><dd>{item.description}</dd></div>)}</dl></div></section><section className="px-commission-section"><SectionHeading number="合作流程" title="每一步，都围绕你的创作目标。"/><ol className="px-commission-stages">{commissionStages.map((stage, index) => <li key={stage.title}><b>{String(index + 1).padStart(2, '0')}</b><div><h3>{stage.title}</h3><p>{stage.description}</p></div></li>)}</ol></section></> : null}

    <details className="simple-fold b2b-product-details"><summary>{hall ? '了解产品优势、样品与合作准备' : '了解创作优势与资料准备'}<Arrow/></summary><div className="fold-content"><ProductAdvantages business={business} Image={Image}/>{hall ? <ProductSamples business={business} Image={Image}/> : null}</div></details>

    <section id={`${business}-try`} data-nav-section="try" className="editorial-experience px-product-action" tabIndex={-1}>
      <Visual Image={Image} src={hall ? editorialBenefits.hall[0].image : editorialBenefits.bespoke[0].image} alt={`${businessName(business)}成果概念示意`} label="成果示意 · 非真实成片" className="me-experience-art"/>
      <div className="me-experience-copy"><span className="me-state">{hall ? '从活动目标，走向项目方案' : '先提需求，再由团队创作'}</span><h2>{hall ? '把它用在你的项目里。' : '让专属故事开始成形。'}</h2><p>{hall ? '告诉我们活动对象、使用场景与希望用户获得什么，再一起确认主题、玩法与交付范围。' : '告诉我们影片用途、故事重点和已有资料。团队沟通后，再确认方案、报价与制作安排。'}</p><div className="me-actions"><a className="button" href={`#${inquiryTo}`}>{hall ? '项目合作咨询' : '整理咨询需求'}<Arrow/></a>{hall ? <a className="button secondary" href={'#'+experiencePathFor('template','/hall?section=benefits')}>体验产品能力</a> : null}</div><p className="px-service-status">当前可在本机整理和复制需求，正式咨询渠道待接入。</p></div>
    </section>
  </article>;
}

type PlanProps = { categoryId: string; experienceTo?: string; Image: ImageComponent; inquiryTo: string; relatedContent?: ReactNode };
export function EditorialScenario({ categoryId, Image, inquiryTo, experienceTo, relatedContent }: PlanProps) {
  if (categoryId === 'brand') return <BrandScenario Image={Image} inquiryTo={inquiryTo} experienceTo={experienceTo}/>;
  return <ScenarioPlan categoryId={categoryId} Image={Image} inquiryTo={inquiryTo} experienceTo={experienceTo} relatedContent={relatedContent}/>;
}
