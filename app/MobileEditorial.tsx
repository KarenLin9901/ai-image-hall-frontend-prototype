import { useState, type ComponentType, type ReactNode } from 'react';
import { businessName, businessApplications, productPresentations, publishedWorks, type Business, type PublishedWork } from './guangdang-data';
import { isPublishedAndAuthorized } from './guangdang-guards';
import { editorialPlans, editorialBenefits, editorialIntroductions } from './mobile-editorial-data';
import { experiencePathFor } from './experience-navigation';
import { bespokePricing } from './bespoke-pricing';
import BrandScenario from './BrandScenario';
import ScenarioPlan from './ScenarioPlan';

type ImageComponent = ComponentType<{ src: string; alt: string; className?: string; eager?: boolean }>;
function Arrow() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>; }

export function EditorialHome({ Image }: { Image: ImageComponent }) {
  return <div className="ux-home">
    <header className="ux-home-intro"><p>咣当 AI影像 · 面向品牌与机构</p><h1>AI 影像互动，<br/>与专属影片创作。</h1><p className="ux-home-description">先选你的需求，看看我们能怎样帮你。</p></header>
    <section className="ux-service-choices" aria-label="选择你的项目需求">
      <a className="ux-service-choice" data-testid="home-hall-entry" href="#/works?product=hall"><div className="ux-choice-copy"><span>AI影像馆</span><h2>做一场影像互动</h2><p>让客户、员工或活动观众<br/>拥有自己的主题短片。</p><strong>查看活动方案<Arrow/></strong></div><div className="ux-choice-image"><Image src={editorialIntroductions.hall.image} alt="AI影像互动概念示意" eager/><small>概念示意</small></div></a>
      <a className="ux-service-choice" data-testid="home-bespoke-entry" href="#/works?product=bespoke"><div className="ux-choice-copy"><span>高定AI影像</span><h2>定制一部影片</h2><p>把人物、品牌或城市故事，<br/>交给团队策划与制作。</p><strong>查看定制方案<Arrow/></strong></div><div className="ux-choice-image"><Image src={editorialIntroductions.bespoke.image} alt="团队专属影片创作概念示意" eager/><small>概念示意</small></div></a>
    </section>
    <div className="ux-home-trial"><span>想先看看用户如何参与？</span><a href={'#'+experiencePathFor('template','/works?product=hall')}>试试体验演示<Arrow/></a></div>
  </div>;
}

type ProductProps = { business: Business; Image: ImageComponent; activeSection: string; onSection: (id: string) => void; onSceneVisit: () => void; inquiryTo: string };
function SamplePlayer({ work }: { work: PublishedWork }) {
  const [failed,setFailed]=useState(false);
  return <article className="soft-sample">{failed?<p role="status">样品暂时无法播放，请稍后再试。</p>:<video controls playsInline preload="none" poster={work.media.poster} aria-label={work.title} onError={()=>setFailed(true)}><source src={work.media.src}/></video>}<h3>{work.title}</h3><span>正式样品</span></article>;
}
export function EditorialProduct({business,Image,onSceneVisit,inquiryTo}:ProductProps){
  const hall=business==='hall';
  const intro=editorialIntroductions[business];
  const profile=productPresentations[business];
  const ready=publishedWorks.filter(work=>work.business===business&&work.media.type==='video'&&isPublishedAndAuthorized(work));
  return <article className="soft-product" data-business={business}>
    <header className="soft-product-hero"><Image src={intro.image} alt={`${businessName(business)}产品概念图`} eager/><div className="soft-product-hero-copy"><p className="soft-kicker">{hall?'品牌活动 · 影像互动':'专属故事 · 团队创作'}</p><h1>{businessName(business)}</h1><p>{hall?'一个主题，每个人都是主角。':'让值得留下的故事，成为影像。'}</p></div><span className="soft-image-label">概念示意</span></header>
    <div className="soft-product-body">
      <section id={`${business}-overview`} data-nav-section="overview" className="soft-product-intro" tabIndex={-1}><p className="soft-kicker">{hall?'为活动而设计':'为你的需求而创作'}</p><h2>{intro.title}</h2><p>{hall?'品牌确定主题，用户参与表达，带走属于自己的影像纪念。':'收集需求与资料，沟通方案与报价，由团队完成策划、制作和交付。'}</p><div className="soft-actions"><a className="button" data-testid="product-primary-action" href={hall?'#/works?product=hall':'#'+inquiryTo}>{hall?'看看应用方案':'整理定制需求'}<Arrow/></a>{hall?<a className="soft-inline-link" data-testid="product-experience-link" href={'#'+experiencePathFor('template','/hall?section=benefits')}>体验一下<Arrow/></a>:<span className="soft-caption">按需求报价</span>}</div></section>
      {!hall&&!ready.length?<div id="bespoke-benefits" className="soft-anchor" aria-hidden="true"/>:null}<section id={`${business}-scenes`} data-nav-section="scenes" className="soft-product-scenarios" tabIndex={-1}><div className="soft-section-heading soft-heading-row"><div><p className="soft-kicker">方案参考</p><h2>{hall?'把它用在你的活动里。':'从一个故事方向开始。'}</h2></div><a className="soft-inline-link" href={`#/works?product=${business}`}>全部方案<Arrow/></a></div><div className="soft-featured-grid">{businessApplications[business].slice(0,2).map(application=>{const plan=editorialPlans[application.categoryId];return <a className="soft-featured-plan" href={`#/category/${application.categoryId}`} key={application.categoryId} onClick={onSceneVisit}><Image src={plan.image} alt={plan.title+'方案参考'}/><div><span>方案示例</span><h3>{plan.title}</h3><Arrow/></div></a>;})}</div></section>
      {hall?<section id="hall-benefits" data-nav-section="benefits" className="soft-play-section" tabIndex={-1}><p className="soft-kicker">统一体验中心</p><h2>选一个模板，<br/>或者加一点自己的想法。</h2><div className="soft-play-options"><a href={'#'+experiencePathFor('template','/hall?section=benefits')} data-testid="template-mode-entry"><span>01</span><div><h3>模板体验</h3><p>设定好了，选你喜欢的。</p></div><Arrow/></a><a href={'#'+experiencePathFor('custom','/hall?section=benefits')} data-testid="custom-mode-entry"><span>02</span><div><h3>自定义体验</h3><p>选择身份、场景，写下情节。</p></div><Arrow/></a></div><p className="soft-caption">当前为设定演示，照片仅在本机预览，生成暂未开放。</p></section>:<section id="bespoke-pricing" data-nav-section="pricing" className="soft-pricing" tabIndex={-1}><p className="soft-kicker">关于报价</p><h2>先聊需求，再定方案。</h2><p data-testid="bespoke-pricing" data-pricing-status={bespokePricing.status}>{bespokePricing.description}</p></section>}
      {ready.length?<section className="soft-samples" id={hall?'hall-samples':'bespoke-benefits'}><h2>正式样品</h2>{ready.map(work=><SamplePlayer key={work.id} work={work}/>)}</section>:null}
      <details className="soft-project-details"><summary>项目说明与准备资料<span aria-hidden="true">＋</span></summary><div className="soft-project-details-body"><h3>产品优势</h3>{editorialBenefits[business].map(item=><div key={item.title}><h4>{item.title}</h4><p>{item.description}</p></div>)}<h3>项目如何开展</h3><ol>{profile.workflow.map(step=><li key={step.title}><strong>{step.title}</strong><p>{step.description}</p></li>)}</ol><h3>准备资料</h3><ul>{profile.preparation.map(item=><li key={item}>{item}</li>)}</ul><p className="soft-caption">{profile.scopeNote}</p></div></details>
      <section id={`${business}-try`} data-nav-section="try" className="soft-product-cta" tabIndex={-1}><h2>从你的项目出发。</h2><p>{hall?'告诉我们活动对象与想传递的主题。':'告诉我们影片用途与已有的故事资料。'}</p><a className="button" href={'#'+inquiryTo}>整理合作需求<Arrow/></a><p className="soft-caption">当前可整理、复制需求，尚未发送。</p></section>
    </div>
  </article>;
}

type PlanProps={categoryId:string;experienceTo?:string;Image:ImageComponent;inquiryTo:string;relatedContent?:ReactNode};
export function EditorialScenario({categoryId,Image,inquiryTo,experienceTo,relatedContent}:PlanProps){
  return categoryId==='brand'?<BrandScenario Image={Image} inquiryTo={inquiryTo} experienceTo={experienceTo}/>:<ScenarioPlan categoryId={categoryId} Image={Image} inquiryTo={inquiryTo} experienceTo={experienceTo} relatedContent={relatedContent}/>;
}
