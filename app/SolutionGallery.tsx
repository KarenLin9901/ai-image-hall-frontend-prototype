import { useLayoutEffect, type ComponentType } from 'react';
import { categories, businessName, publishedWorks, type Media, type Business } from './guangdang-data';
import { editorialPlans } from './mobile-editorial-data';
import { isPublishedAndAuthorized } from './guangdang-guards';
import { experiencePathFor } from './experience-navigation';

type Props = {
  route: string;
  view: { scroll: number };
  Image: ComponentType<{ src: string; alt: string; className?: string; eager?: boolean }>;
  MediaDisplay: ComponentType<{ media: Media }>;
};

const purposes:Record<string,string> = {
  brand:'客户活动 · 把个人成长放进品牌故事',
  event:'发布会与节庆 · 留下个人高光短片',
  team:'退休纪念 · 留存岗位故事与集体致谢',
  campus:'毕业纪念 · 留住每个人的校园记忆',
  person:'人物纪实 · 讲述经历与关键选择',
  family:'家庭留念 · 串联照片与跨代记忆',
  enterprise:'企业周年 · 记录人物与发展历程',
  city:'城市展陈 · 重现有依据的街区记忆',
};

export default function SolutionGallery({ route, view, Image, MediaDisplay }: Props) {
  useLayoutEffect(() => {
    let restoring = true;
    const save = () => { if (!restoring) view.scroll = window.scrollY; };
    window.addEventListener('scroll', save, { passive: true });
    const frame = requestAnimationFrame(() => { window.scrollTo({ top: view.scroll, behavior: 'instant' }); restoring = false; });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', save); };
  }, [view]);
  const params = new URLSearchParams(route.split('?')[1] || '');
  const product = params.get('product');
  const business = product === 'hall' || product === 'bespoke' ? product : 'all';
  const published = params.get('view') === 'published';
  const to = (filter: string, showPublished = published) => '#/works' + (filter !== 'all' || showPublished ? '?' + new URLSearchParams({ ...(filter !== 'all' ? { product: filter } : {}), ...(showPublished ? { view: 'published' } : {}) }).toString() : '');
  const visible = categories.filter(category => business === 'all' || category.business === business);
  const works = publishedWorks.filter(work => isPublishedAndAuthorized(work) && (business === 'all' || work.business === business));
  return <section className="b2b-solutions soft-gallery ux-gallery">
    <header className="b2b-page-heading"><span className="b2b-kicker">{business==='hall'?'AI影像馆':business==='bespoke'?'高定AI影像':'按项目需求，找到适合的方式'}</span><h1>{business==='hall'?'活动互动方案':business==='bespoke'?'影片定制方案':'应用方案'}</h1><p>{business==='hall'?'项目方确定活动主题，参与者获得个人影像。':business==='bespoke'?'团队根据需求与资料创作影片，按项目报价。':'活动互动，或委托团队创作一部影片。'}</p></header>
    {publishedWorks.some(isPublishedAndAuthorized)||published ? <nav className="b2b-library-tabs" aria-label="方案与作品"><a href={to(business, false)} aria-current={!published ? 'page' : undefined}>方案示例</a><a href={to(business, true)} aria-current={published ? 'page' : undefined}>正式作品</a></nav> : null}
    <nav className="b2b-filter-row" aria-label="按产品筛选方案">{(['all', 'hall', 'bespoke'] as const).map(item => <a key={item} className={'chip' + (business === item ? ' active' : '')} href={to(item)} aria-current={business === item ? 'true' : undefined}>{item === 'all' ? '全部' : item==='hall'?'活动互动':'影片定制'}</a>)}</nav>
    {business!=='all'?<div className="ux-product-context">{business==='hall'?<a href={'#'+experiencePathFor('template','/works?product=hall')}>体验参与方式 <span>仅设定演示</span> →</a>:null}<a href={'#/'+business}>了解产品说明 →</a></div>:null}
    {published ? works.length ? <div className="b2b-solution-grid">{works.map(work => <article key={work.id} className="b2b-solution-card"><MediaDisplay media={work.media}/><div className="b2b-solution-copy"><span className="b2b-kicker">{businessName(work.business)}</span><h2>{work.title}</h2><a className="b2b-text-link" href={`#/category/${work.categoryId}?from=solutions&filter=${business}`}>了解同类方案 →</a></div></article>)}</div> : <div className="empty b2b-evidence-note"><h2>正式作品待上架</h2><p>当前展示的是产品与活动方案，尚无可公开播放的交付作品。</p><a className="button secondary" href={to(business, false)}>查看方案示例</a></div> : <>
      <p className="b2b-evidence-note">方案参考 · 非已交付案例</p>
      <div className="b2b-solution-grid">{visible.map(category => { const plan = editorialPlans[category.id]; return <a className="b2b-solution-card" key={category.id} href={`#/category/${category.id}?from=solutions&filter=${business}`} data-testid={'solution-' + category.id}>
        <figure><Image src={plan.image} alt={plan.title + '方案参考'} eager={category.id === visible[0].id}/><figcaption>方案示例</figcaption></figure>
        <div className="b2b-solution-copy"><span className="b2b-kicker">{businessName(category.business as Business)} · {category.short}</span><h2>{plan.title}</h2><p className="ux-plan-purpose">{purposes[category.id]}</p><span className="b2b-text-link">查看方案详情 <span aria-hidden="true">→</span></span></div>
      </a>; })}</div>
    </>}
    <div className="ux-gallery-next"><p>已有项目想法？</p><a className="button" href={business==='all'?'#/cooperate':'#/cooperate?product='+business+'&source=solutions'}>整理合作需求 →</a></div>
  </section>;
}
