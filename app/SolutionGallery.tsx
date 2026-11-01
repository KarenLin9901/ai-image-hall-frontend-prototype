import { useLayoutEffect, type ComponentType } from 'react';
import { categories, businessName, publishedWorks, type Media, type Business } from './guangdang-data';
import { editorialPlans } from './mobile-editorial-data';
import { isPublishedAndAuthorized } from './guangdang-guards';

type Props = {
  route: string;
  view: { scroll: number };
  Image: ComponentType<{ src: string; alt: string; className?: string; eager?: boolean }>;
  MediaDisplay: ComponentType<{ media: Media }>;
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
  return <section className="b2b-solutions">
    <header className="b2b-page-heading"><span className="b2b-kicker">从产品能力，到项目用途</span><h1>应用方案</h1><p>用具体方案，看清活动如何开展、用户如何参与，以及双方能获得什么。</p></header>
    {publishedWorks.some(isPublishedAndAuthorized)||published ? <nav className="b2b-library-tabs" aria-label="方案与作品"><a href={to(business, false)} aria-current={!published ? 'page' : undefined}>方案示例</a><a href={to(business, true)} aria-current={published ? 'page' : undefined}>正式作品</a></nav> : null}
    <nav className="b2b-filter-row" aria-label="按产品筛选方案">{(['all', 'hall', 'bespoke'] as const).map(item => <a key={item} className={'chip' + (business === item ? ' active' : '')} href={to(item)} aria-current={business === item ? 'true' : undefined}>{item === 'all' ? '全部产品' : businessName(item)}</a>)}</nav>
    {published ? works.length ? <div className="b2b-solution-grid">{works.map(work => <article key={work.id} className="b2b-solution-card"><MediaDisplay media={work.media}/><div className="b2b-solution-copy"><span className="b2b-kicker">{businessName(work.business)}</span><h2>{work.title}</h2><a className="b2b-text-link" href={`#/category/${work.categoryId}?from=solutions&filter=${business}`}>了解同类方案 →</a></div></article>)}</div> : <div className="empty b2b-evidence-note"><h2>正式作品待上架</h2><p>当前展示的是产品与活动方案，尚无可公开播放的交付作品。</p><a className="button secondary" href={to(business, false)}>查看方案示例</a></div> : <>
      <p className="b2b-evidence-note">以下是方案示例，用于讨论项目设计；不代表已交付案例或传播成绩。</p>
      <div className="b2b-solution-grid">{visible.map(category => { const plan = editorialPlans[category.id]; return <a className="b2b-solution-card" key={category.id} href={`#/category/${category.id}?from=solutions&filter=${business}`} data-testid={'solution-' + category.id}>
        <figure><Image src={plan.image} alt={plan.title + '方案参考'} eager={category.id === visible[0].id}/><figcaption>方案示例</figcaption></figure>
        <div className="b2b-solution-copy"><span className="b2b-kicker">{businessName(category.business as Business)} · {category.short}</span><h2>{plan.title}</h2><p>{category.id === 'brand' ? '以“与深圳 共成长”为例，让客户在品牌主题中表达自己的成长故事。' : plan.summary}</p><span className="b2b-text-link">了解方案与价值 <span aria-hidden="true">→</span></span></div>
      </a>; })}</div>
    </>}
  </section>;
}
