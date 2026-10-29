import type { ComponentType, ReactNode } from 'react';
import { businessName, businessApplications, categoryById, productPresentations, productBenefits, experiencePath, type Business } from './guangdang-data';
import { editorialPlans, editorialBenefits, editorialIntroductions, type EditorialPlan } from './mobile-editorial-data';

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
export function EditorialHome({ Image }: { Image: ImageComponent }) {
  return <div className="mobile-editorial-home me-home-compact">
    <section className="me-home-hero" aria-label="属于你的AI片场">
      <div className="me-hero-copy"><p className="me-eyebrow">属于你的AI片场</p><h1 className="me-display">让参与成为<span>影像，</span><br/>让故事被<span>看见。</span></h1><p className="me-lead">选择适合你的影像服务。</p></div>
    </section>
    <section id="home-products" className="me-home-products" aria-label="选择影像服务">
      <div className="me-product-grid">
        {(['hall', 'bespoke'] as Business[]).map((business, index) => {
          const intro = editorialIntroductions[business];
          return <a className="me-product-card home-choice" href={`#/${business}`} aria-label={businessName(business)} key={business}>
            <Visual Image={Image} src={intro.image} alt={`${businessName(business)}产品概念图`} label={intro.imageLabel} className="me-card-image" eager/>
            <div className="me-product-copy"><span className="me-number" aria-hidden="true">0{index + 1}</span><h2>{businessName(business)}</h2><p className="me-product-kind">{business === 'hall' ? '模板化互动影像产品' : '精品AI影像创作服务'}</p><span className="me-link">{business === 'hall' ? '了解互动体验' : '了解专属创作'}<Arrow/></span></div>
          </a>;
        })}
      </div>
    </section>
  </div>;
}

type ProductProps = { business: Business; Image: ImageComponent; activeSection: string; onSection: (id: string) => void; onSceneVisit: () => void; inquiryTo: string };
export function EditorialProduct({ business, Image, activeSection, onSection, onSceneVisit, inquiryTo }: ProductProps) {
  const profile = productPresentations[business];
  const intro = editorialIntroductions[business];
  const benefits = editorialBenefits[business];
  const sections = [{ id: 'overview', label: '产品简介' }, { id: 'benefits', label: '特点优势' }, { id: 'scenes', label: '场景启发' }, { id: 'try', label: '立即体验' }];
  return <article className="editorial-product mobile-editorial-product" data-business={business}>
    <header className="editorial-hero me-product-hero"><div className="editorial-heading"><p className="me-eyebrow">{business === 'hall' ? '共同主题 · 每个人的表达' : '真实资料 · 专属故事'}</p><h1>{businessName(business)}</h1><p className="definition">{profile.definition}</p></div><div className="editorial-hero-image"><Image src={intro.image} alt={`${businessName(business)}产品概念图`} eager/><span>概念示意</span></div></header>
    <nav className="editorial-index" aria-label="产品内容导航">{sections.map(section => <button className={activeSection === section.id ? 'active' : ''} aria-current={activeSection === section.id ? 'location' : undefined} key={section.id} onClick={() => onSection(section.id)}>{section.label}</button>)}</nav>

    <section id={`${business}-overview`} className="editorial-overview" tabIndex={-1}>
      <SectionHeading number="01 / 产品简介" title={business === 'hall' ? '让每个人，都能进入主题。' : '把值得讲述的故事，化为影像。'}/>
      <div className="me-intro-layout"><Visual Image={Image} src={intro.image} alt={intro.title} label={intro.imageLabel} className="me-intro-art"/><div className="me-intro-copy"><h3>{intro.title}</h3><p>{intro.description}</p><div className="buyer-role-grid">{profile.roles.map(role => <article key={role.title}><h3>{role.title}</h3><p>{role.description}</p></article>)}</div></div></div>
      <Flow steps={intro.steps} label={`${businessName(business)}产品关系示意`}/>
    </section>

    <section id={`${business}-benefits`} className="editorial-benefits" tabIndex={-1}>
      <SectionHeading number="02 / 特点优势" title={business === 'hall' ? '把共同主题，变成个人表达。' : '让每份资料，找到它的故事。'}/>
      <div className="benefit-grid me-benefit-list">{benefits.map((benefit, index) => <article className="me-benefit" key={benefit.title}>
        <Visual Image={Image} src={benefit.image} alt={benefit.title} label={benefit.imageLabel} className="me-benefit-art">{index === 1 ? <div className="me-media-tags" aria-label={business === 'hall' ? '参与步骤示意' : '影像设计要点'}>{(business === 'hall' ? ['选择内容', '确认设定', '专属影像'] : ['人物', '场景', '影像气质']).map(label => <span key={label}>{label}</span>)}</div> : null}</Visual>
        <div className="me-benefit-copy"><span className="me-number">0{index + 1}</span><h3>{benefit.title}</h3><p className="benefit-need">{benefit.description}</p><details className="me-benefit-details"><summary>了解这一优势<span aria-hidden="true">＋</span></summary><dl><div><dt>解决方式</dt><dd>{productBenefits[business][index].solution}</dd></div><div><dt>产品优势</dt><dd>{productBenefits[business][index].advantage}</dd></div></dl></details></div>
      </article>)}</div>
      <details className="simple-fold editorial-project-details me-project-fold"><summary>项目合作与准备<Arrow/></summary><div className="fold-content"><p>{profile.description}</p><div className="product-features">{profile.features.map(feature => <article className="feature-card" key={feature.title}><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div><h3>项目如何开展</h3><ol className="workflow-list">{profile.workflow.map((step, index) => <li key={step.title}><b>{index + 1}</b><div><h4>{step.title}</h4><p>{step.description}</p></div></li>)}</ol><h3>准备资料</h3><ul>{profile.preparation.map(item => <li key={item}>{item}</li>)}</ul><p className="scope-note">{profile.scopeNote}</p></div></details>
    </section>

    <section id={`${business}-scenes`} className="editorial-scenarios" tabIndex={-1}>
      <SectionHeading number="03 / 场景启发" title="场景启发" description={business === 'hall' ? '从品牌活动到集体纪念，看看一个主题如何展开。' : '人物、家庭、企业与城市，都有值得讲述的故事。'}/>
      <div className="scenario-grid">{businessApplications[business].map(application => {const plan = editorialPlans[application.categoryId];const category = categoryById.get(application.categoryId)!;return <a className="scenario-card" href={`#/category/${category.id}`} key={category.id} onClick={onSceneVisit}><div className="scenario-card-media"><Image src={plan.image} alt={`${plan.title}场景方案示意`}/><span className="me-card-label">{plan.imageLabel}</span></div><div className="scenario-card-copy"><h3>{application.title}</h3><p className="me-scenario-title">{plan.title}</p><p>{category.intro}</p><span className="scenario-card-action">查看完整方案<Arrow/></span></div></a>;})}</div>
    </section>

    <section id={`${business}-try`} className="editorial-experience" tabIndex={-1}>
      <Visual Image={Image} src={intro.image} alt={`${businessName(business)}成果概念示意`} label="成果示意 · 正式样片制作中" className="me-experience-art"/>
      <div className="me-experience-copy"><span className="me-state">样片制作中</span><h2>立即体验</h2><p>{business === 'hall' ? '了解主题影像的参与方式，预览个人内容设置。' : '了解专属故事的创作方向，从资料和用途开始沟通。'}</p><div className="me-actions"><a className="button" href={`#/samples/${business}`}>立即体验<Arrow/></a><a className="button secondary" href={`#${inquiryTo}`}>整理合作需求</a></div></div>
    </section>
  </article>;
}

type PlanProps = { categoryId: string; Image: ImageComponent; inquiryTo: string; relatedContent?: ReactNode };
export function EditorialScenario({ categoryId, Image, inquiryTo, relatedContent }: PlanProps) {
  const plan: EditorialPlan = editorialPlans[categoryId];
  const category = categoryById.get(categoryId)!;
  const hall = plan.business === 'hall';
  const roleLabel = hall ? '参与者可以选择什么' : '委托方需要确认什么';
  const choiceTitle = hall ? '每个选择，都有它的意义。' : '先找到故事最重要的表达。';
  return <article className="application-detail mobile-editorial-plan" data-plan={categoryId} data-business={plan.business}>
    <header className="me-plan-hero"><p className="me-eyebrow">{businessName(plan.business)} / {plan.kicker}</p><h1>{plan.title}</h1><p className="me-plan-lead">{plan.summary}</p><div className="me-plan-facts"><span>{hall ? '个人参与 · 主题影像' : '专属策划 · 委托创作'}</span><span>{hall ? '短视频为主，按需求延展' : '完整影片，版本按需约定'}</span></div></header>
    <Visual Image={Image} src={plan.image} alt={`${plan.title}产品方案主视觉`} label={plan.imageLabel} className="me-plan-cover" eager/>
    <section className="me-plan-section me-plan-audience"><SectionHeading number="01 / 适合谁" title={hall ? '共同的主题，个人的表达。' : '围绕故事，确定创作目标。'}/><p className="application-audience">{plan.audience}</p></section>

    <section className="me-plan-section me-plan-options"><SectionHeading number={`02 / ${roleLabel}`} title={choiceTitle} description={hall ? '看清可以选择的内容，以及它会影响什么。' : '这些是创作沟通要点，围绕真实资料逐步确定。'}/>
      <div className="me-choice-visual"><Visual Image={Image} src={plan.image} alt={hall ? '选项与主题影像表达的对应示意' : '资料与影片表达的对应示意'} label={hall ? '选项与影像表达示意' : '创作方向示意'} className="me-choice-visual-art"><div className="me-selection-caption"><span>{hall ? '一种内容组合示意' : '一种故事方向示意'}</span><div className="me-selection-chips">{plan.choices.map(choice => <span key={choice.title}>{choice.items[0]}</span>)}</div></div></Visual>
        <div className="me-choice-grid">{plan.choices.map((choice, index) => <article className="me-choice-card" key={choice.title}><span className="me-number">0{index + 1}</span><h3>{choice.title}</h3><div className="me-choice-items">{choice.items.map(item => <span key={item}>{item}</span>)}</div><p>{choice.meaning}</p></article>)}</div>
      </div>
      <div className="me-plan-status">{plan.planned ? <p>退休主题的选项为方案示意，体验设置尚未开放。</p> : hall ? <p>可预览主题设置，影像生成尚未开放。具体成片效果需在项目中确认。</p> : <p>以上为委托创作要点，具体内容与制作范围在项目中确认。</p>}</div>
    </section>

    <section className="me-plan-section scenario-production me-plan-process"><SectionHeading number="03 / 如何展开" title={hall ? '从一次参与，到专属影像。' : '从一份资料，到完整影片。'}/>
      <div className="me-plan-process-layout"><div className="me-plan-process-art"><div className="me-process-graphic" aria-label={hall ? '主题、个人设定与影像成果的关系示意' : '资料、故事确认与影片交付的关系示意'}><div className="me-process-panel"><span className="me-process-label">01 / {hall ? '共同主题' : '故事线索'}</span><strong>{plan.title}</strong><small>{hall ? '围绕项目目标与参与对象' : '照片 · 文字 · 口述资料'}</small></div><div className="me-process-panel"><span className="me-process-label">02 / {hall ? '个人表达' : '创作确认'}</span><strong>{plan.choices.map(choice => choice.title).join(' · ')}</strong><small>{hall ? '每个选择，对应一种表达方向' : '围绕故事与样段逐步确认'}</small></div><div className="me-process-panel me-process-final"><Image className="me-process-thumb" src={plan.image} alt="影片画面概念示意"/><div><span className="me-process-label">03 / 影像成果</span><strong>{hall ? '个人主题短片' : '专属故事影片'}</strong><small>成果示意 · 按约定用途交付</small></div></div></div></div><ol>{plan.journey.map((step, index) => <li key={step.title}><b>{String(index + 1).padStart(2, '0')}</b><div className="me-step-copy"><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol></div>
    </section>

    <section className="me-plan-section me-plan-outcome"><SectionHeading number="04 / 最后得到什么" title="让内容，成为值得留存的成果。"/>
      <div className="me-result-layout"><div className="me-result-frame"><Visual Image={Image} src={plan.image} alt={`${plan.title}影像成果呈现概念`} label="成果示意 · 非真实成片" className="me-result-picture"/><div className="me-result-caption"><span className="me-state">影片成果示意</span><strong>{plan.title}</strong></div><div className="me-result-meta"><span>{hall ? '个人主题影像' : '专属故事影片'}</span><span>按约定用途交付</span></div></div><div className="me-result-copy"><h3>{plan.outcome.title}</h3><p>{plan.outcome.description}</p><p className="me-result-extra">{plan.outcome.extras}</p></div></div>
    </section>

    <section className="me-plan-section me-plan-values"><SectionHeading number="05 / 为什么值得做" title="对每个人，也对整个项目。"/><div className="me-value-grid"><article><span className="me-eyebrow">{hall ? '参与者获得什么' : categoryId === 'city' ? '观看者获得什么' : '故事人物与观看者'}</span><h3>{plan.participantValue.title}</h3><p>{plan.participantValue.description}</p></article><article><span className="me-eyebrow">项目方可如何使用</span><h3>{plan.projectValue.title}</h3><p>{plan.projectValue.description}</p></article></div></section>
    <section className="me-plan-section application-detail-section"><SectionHeading number="06 / 适用场景" title="围绕实际用途，规划表达。"/><div className="application-tags">{businessApplications[plan.business].find(item => item.categoryId === categoryId)!.scenes.map(scene => <span key={scene}>{scene}</span>)}</div><p>{businessApplications[plan.business].find(item => item.categoryId === categoryId)!.extension}</p></section>
    <details className="simple-fold me-plan-preparation"><summary>项目开始前，准备什么？<Arrow/></summary><div className="fold-content"><ul>{plan.preparation.map(item => <li key={item}>{item}</li>)}</ul><p>影片形式、交付版本与素材使用范围，按项目约定。</p></div></details>
    <div className="application-actions me-plan-actions"><a className="button scene-cta" href={`#/samples/${plan.business}?category=${categoryId}`}>查看样片<Arrow/></a>{hall && plan.themeId ? <a className="button secondary" href={`#${experiencePath(categoryId, plan.themeId)}`}>预览主题设置</a> : null}<a className="button secondary" href={`#${inquiryTo}`}>整理合作需求<Arrow/></a></div>
    <p className="me-local-note">{hall ? '真实生成与正式咨询暂未开放。' : '高定样片制作中，正式咨询暂未开放。'}需求可先在本机整理并复制。</p>
    {relatedContent}
  </article>;
}
