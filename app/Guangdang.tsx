import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { asset, reference, categories, categoryById, businessName, illustrativeWorks, publishedWorks, cases, highlights, productPresentations, productBenefits, scenarioExamples, businessApplications, themeImages, getShowcaseSlides, getThemeConfiguration, themeConfigurations, experiencePath, type ThemeConfiguration, type Media, type Business, type Category } from './guangdang-data';

type ThemeDraft={step:number;choices:string[];photo:string;authorized:boolean};
type ProductSection='experience'|'introduction'|'applications';
type ProductView={section:ProductSection;filter:string;scroll:Record<ProductSection,number>};
type InquiryDraft={direction:string;description:string;organization:string;timing:string;scope:string;name:string;contact:string};
type BrowsingMemory={carouselIndices:Record<Business,number>;productViews:Record<Business,ProductView>;draft:{themeId:string;value:ThemeDraft}|null;inquiryDrafts:Record<string,InquiryDraft>;sampleViews:Record<Business,{open:boolean;scroll:number}>};
type InquirySource='product'|'application'|'theme'|'samples';
type InquiryOptions={source?:InquirySource;section?:ProductSection;direction?:string;theme?:string};
function inquiryPath(business:Business,options:InquiryOptions={}){
 const params=new URLSearchParams({product:business,source:options.source||'product'});
 if(options.section)params.set('section',options.section);
 if(options.direction)params.set('direction',options.direction);
 if(options.theme)params.set('theme',options.theme);
 return '/cooperate?'+params.toString();
}
function inquiryContext(route:string){
 const params=new URLSearchParams(route.split('?')[1]||'');
 const requested=params.get('product');
 const rawCategory=categoryById.get(params.get('direction')||'');
 const rawTheme=themeConfigurations.find(theme=>theme.id===params.get('theme'));
 const business:Business|undefined=requested==='hall'||requested==='bespoke'?requested:rawCategory?.business||(rawTheme?'hall':undefined);
 const category=rawCategory?.business===business?rawCategory:undefined;
 const theme=business==='hall'&&rawTheme&&(!category||rawTheme.categoryId===category.id)?rawTheme:undefined;
 const direction=category||(theme?categoryById.get(theme.categoryId):undefined);
 const requestedSection=params.get('section');
 const section:ProductSection=requestedSection==='introduction'||requestedSection==='applications'?requestedSection:'experience';
 const source:InquirySource=params.get('source')==='samples'&&business?'samples':params.get('source')==='theme'&&theme?'theme':params.get('source')==='application'&&direction?'application':params.has('source')||!direction?'product':'application';
 const returnTo=source==='samples'&&business?'/samples/'+business+(direction?'?category='+direction.id:''):source==='theme'&&theme?experiencePath(theme.categoryId,theme.id):source==='application'&&direction?'/category/'+direction.id:business?'/'+business+'?section='+section:'/';
 const returnLabel=source==='samples'?'返回样片专区':source==='theme'?'返回主题配置':source==='application'?'返回应用详情':business?'返回'+businessName(business):'返回首页';
 return {business,direction,theme,section,source,returnTo,returnLabel,key:[business||'all',direction?.id||'',theme?.id||''].join(':')};
}
type IconName = 'home'|'works'|'cooperate'|'mine'|'arrow'|'back'|'close'|'play'|'pause'|'check'|'spark'|'copy'|'image';
function Icon({name,size=22}:{name:IconName;size?:number}) {
 const paths:Record<IconName,ReactNode> = {
  home:<><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
  works:<><rect x="3" y="3" width="7" height="10" rx="2"/><rect x="14" y="3" width="7" height="6" rx="2"/><rect x="3" y="17" width="7" height="4" rx="1"/><rect x="14" y="13" width="7" height="8" rx="2"/></>,
  cooperate:<><path d="m3 9 5-5 4 3 4-3 5 5-7 10-4-1Z"/><path d="m7 12 6 6M10 9l7 6"/></>,
  mine:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  arrow:<><path d="M4 12h15m-6-6 6 6-6 6"/></>, back:<path d="m15 5-7 7 7 7"/>,close:<path d="m6 6 12 12M6 18 18 6"/>,
  play:<path d="m9 5 11 7-11 7Z"/>,pause:<><path d="M9 5v14M15 5v14"/></>,check:<path d="m5 12 4 4L19 6"/>, spark:<><path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></>,
  copy:<><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></>,image:<><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="2"/><path d="m3 17 6-5 4 3 3-3 5 5"/></>,
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function Picture({src,alt,className='',eager=false}:{src:string;alt:string;className?:string;eager?:boolean}) {
 const [failed,setFailed]=useState(false);
 return failed ? <div className={`image-fallback ${className}`} role="img" aria-label={`${alt}，图片暂时无法加载`}><Icon name="image"/><span>图片暂时无法加载</span></div> : <img className={className} src={src} srcSet={src.endsWith('-1920.webp')?`${src.replace('-1920.webp','-800.webp')} 1x, ${src} 2.4x`:undefined} alt={alt} loading={eager?'eager':'lazy'} onError={()=>setFailed(true)}/>;
}
function MediaDisplay({media}:{media:Media}){
 const [failed,setFailed]=useState(false);
 if(media.type==='image')return <Picture src={media.src} alt={media.alt} className="modal-image"/>;
 return <div className="media-player">{failed?<div className="notice" role="status">视频暂时无法加载，请稍后重试。</div>:<video key={media.src} controls playsInline preload="none" poster={media.poster} aria-label={media.alt} onError={()=>setFailed(true)}><source src={media.src}/>当前浏览器不支持视频播放。</video>}</div>;
}
function Modal({children,onClose,title}:{children:ReactNode;onClose:()=>void;title:string}) {
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{ const d=ref.current;d?.showModal();return()=>d?.close(); },[]);
 return <dialog ref={ref} onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose();}} aria-label={title}><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="关闭"><Icon name="close"/></button></div>{children}</dialog>;
}
const getRoute=()=>decodeURI(window.location.hash.slice(1)||'/').replace(/^\/scenes\/(hall|bespoke)$/,'/$1');
const go=(path:string)=>{ window.location.hash=path; };
function LinkButton({to,children,className='button',ariaLabel}:{to:string;children:ReactNode;className?:string;ariaLabel?:string}) { return <a className={className} href={`#${to}`} aria-label={ariaLabel}>{children}</a>; }
function Eyebrow(_props:{children:ReactNode}) { return null; }
function Empty({title,children}:{title:string;children:ReactNode}) { return <div className="empty"><div className="empty-icon"><Icon name="image" size={30}/></div><h3>{title}</h3><p>{children}</p></div>; }

function Home(){return <section className="simple-home lightfield-home cinema-home" aria-label="选择影像服务">
 <div className="home-question"><p className="slogan">属于你的AI片场</p><h1 aria-label="你想如何创作一部AI影像？">你想如何创作<span>一部<em>AI影像</em>？</span></h1><p className="home-service-note">互动生成，还是专属创作？选择适合你的影像服务。</p></div>
 <div className="home-choices">
  <a className="home-choice" aria-label="AI影像馆" href="#/hall"><span className="home-choice-backdrop" aria-hidden="true"><Picture src={reference(2)} alt="" className="home-choice-image" eager/></span><span className="home-choice-no" aria-hidden="true">01</span><div><h2>AI影像馆</h2><span className="home-choice-action">模板化互动影像产品</span></div><span className="home-choice-arrow" aria-hidden="true"><Icon name="arrow" size={20}/></span></a>
  <a className="home-choice bespoke-choice" aria-label="高定AI影像" href="#/bespoke"><span className="home-choice-backdrop" aria-hidden="true"><Picture src={reference(3)} alt="" className="home-choice-image" eager/></span><span className="home-choice-no" aria-hidden="true">02</span><div><h2>高定AI影像</h2><span className="home-choice-action">精品AI影像创作服务</span></div><span className="home-choice-arrow" aria-hidden="true"><Icon name="arrow" size={20}/></span></a>
 </div>
 <div className="home-end"><span>让想象，成为影像。</span><LinkButton to="/cooperate" className="text-link">聊聊你的项目<Icon name="arrow" size={16}/></LinkButton></div>
</section>;}

const themeGroups=[{id:'all',label:'全部主题'},{id:'brand',label:'城市品牌'},{id:'event',label:'活动节庆'},{id:'team',label:'职场团队'},{id:'campus',label:'校园青春'}];
function Catalogue({business,memory,route}:{business:Business;memory:BrowsingMemory;route:string}){
 const view=memory.productViews[business];
 const requested=new URLSearchParams(route.split('?')[1]||'').get('section');
 const section:ProductSection=requested==='experience'||requested==='applications'?requested:'introduction';
 const [activeSection,setActiveSection]=useState('overview');
 const profile=productPresentations[business];
 const sections=[{id:'overview',label:'产品简介'},{id:'benefits',label:'特点优势'},{id:'scenes',label:'场景启发'},{id:'try',label:'立即体验'}];
 useLayoutEffect(()=>{
  view.section=section;let restoring=true;let release=0;
  const save=()=>{if(!restoring)view.scroll[section]=window.scrollY;};
  window.addEventListener('scroll',save,{passive:true});
  const frame=requestAnimationFrame(()=>{
   const target=section==='applications'?'scenes':section==='experience'?'try':'';
   if(view.scroll[section]>0)window.scrollTo({top:view.scroll[section],behavior:'instant'});
   else if(target)document.getElementById(business+'-'+target)?.scrollIntoView({block:'start'});
   release=requestAnimationFrame(()=>{restoring=false;});
  });
  return()=>{cancelAnimationFrame(frame);cancelAnimationFrame(release);window.removeEventListener('scroll',save);};
 },[route,business,section,view]);
 useEffect(()=>{
  let frame=0;
  const update=()=>{
   frame=0;
   const navigationBottom=document.querySelector('.editorial-index')?.getBoundingClientRect().bottom||0;
   let selected='overview';
   for(const id of ['overview','benefits','scenes','try']){
    const target=document.getElementById(business+'-'+id);
    if(!target)continue;
    const scrollMargin=parseFloat(getComputedStyle(target).scrollMarginTop)||0;
    if(target.getBoundingClientRect().top<=Math.max(navigationBottom,scrollMargin)+24)selected=id;
   }
   if(scrollY+innerHeight>=document.documentElement.scrollHeight-2)selected='try';
   setActiveSection(selected);
  };
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
  window.addEventListener('scroll',scroll,{passive:true});frame=requestAnimationFrame(update);
  return()=>{window.removeEventListener('scroll',scroll);cancelAnimationFrame(frame);};
 },[business]);
 function scrollTo(id:string){const target=document.getElementById(business+'-'+id);target?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('motion-paused')?'instant':'smooth'});target?.focus({preventScroll:true});}
 return <article className="editorial-product" data-business={business}>
  <header className="editorial-hero"><div className="editorial-heading"><h1>{businessName(business)}</h1><p className="definition">{profile.definition}</p></div><div className="editorial-hero-image"><Picture src={reference(business==='hall'?2:3)} alt={businessName(business)+'产品概念图'} eager/><span>概念配图</span></div></header>
  <nav className="editorial-index" aria-label="产品内容导航">{sections.map(item=><button key={item.id} className={activeSection===item.id?'active':''} aria-current={activeSection===item.id?'location':undefined} onClick={()=>scrollTo(item.id)}>{item.label}</button>)}</nav>
  <section id={business+'-overview'} tabIndex={-1} className="editorial-overview"><h2>产品简介</h2><p>{profile.description}</p><div className="buyer-role-grid">{profile.roles.map(role=><article key={role.title}><h3>{role.title}</h3><p>{role.description}</p></article>)}</div></section>
  <section id={business+'-benefits'} tabIndex={-1} className="editorial-benefits"><h2>产品特点与优势</h2><div className="benefit-grid">{productBenefits[business].map(item=><article key={item.title}><h3>{item.title}</h3><p className="benefit-need">{item.need}</p><dl><div><dt>解决方式</dt><dd>{item.solution}</dd></div><div><dt>产品优势</dt><dd>{item.advantage}</dd></div></dl></article>)}</div><details className="simple-fold editorial-project-details"><summary>项目合作与准备<Icon name="arrow" size={18}/></summary><div className="fold-content"><div className="product-features">{profile.features.map(item=><article className="feature-card" key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>)}</div><h3>项目如何开展</h3><ol className="workflow-list">{profile.workflow.map((item,index)=><li key={item.title}><b>{index+1}</b><div><h4>{item.title}</h4><p>{item.description}</p></div></li>)}</ol><h3>准备资料</h3><ul>{profile.preparation.map(item=><li key={item}>{item}</li>)}</ul><p className="scope-note">{profile.scopeNote}</p></div></details></section>
  <section id={business+'-scenes'} tabIndex={-1} className="editorial-scenarios"><h2>场景启发</h2><p>{business==='hall'?'让品牌、活动与集体纪念，成为用户可以参与的内容。':'从人物经历到城市记忆，为不同的故事找到影像表达。'}</p><div className="scenario-grid">{businessApplications[business].map(application=>{
   const category=categoryById.get(application.categoryId)!;
   return <a className="scenario-card" key={category.id} href={'#/category/'+category.id} onClick={()=>{view.scroll.applications=window.scrollY;}}><div className="scenario-card-media"><Picture src={reference(category.image)} alt={application.title+'场景参考'}/></div><div className="scenario-card-copy"><h3>{application.title}</h3><p>{category.intro}</p><span className="scenario-card-action">查看应用示例<Icon name="arrow" size={17}/></span></div></a>;
  })}</div></section>
  <section id={business+'-try'} tabIndex={-1} className="editorial-experience"><div className="editorial-experience-media"><Picture src={reference(business==='hall'?5:10)} alt={businessName(business)+'样片专区场景参考'}/></div><div className="editorial-experience-copy"><span className="status-tag">样片制作中</span><h2>立即体验</h2><p>{business==='hall'?'通过模板样片，了解主题互动的影像风格与参与方式。':'通过高定样片，了解专属故事的叙事与影像表达。'}</p><div className="action-row"><LinkButton to={'/samples/'+business}>立即体验<Icon name="arrow" size={18}/></LinkButton><LinkButton to={inquiryPath(business,{section})} className="button secondary">整理合作需求</LinkButton></div></div></section>
 </article>;
}
function Samples({business,memory,route}:{business:Business;memory:BrowsingMemory;route:string}){
 const params=new URLSearchParams(route.split('?')[1]||'');
 const category=categoryById.get(params.get('category')||'');
 const selectedCategory=category?.business===business?category:undefined;
 const view=memory.sampleViews[business];
 const [expanded,setExpanded]=useState(view.open||params.get('preview')==='themes');
 const [filter,setFilter]=useState(memory.productViews.hall.filter);
 const works=publishedWorks.filter(work=>work.business===business&&work.displayAuthorized&&work.status==='published'&&work.media.type==='video'&&(!selectedCategory||work.categoryId===selectedCategory.id));
 const themes=themeConfigurations.filter(theme=>filter==='all'||theme.categoryId===filter);
 useLayoutEffect(()=>{
  let restoring=true;let release=0;const saved=view.scroll;
  const save=()=>{if(!restoring)view.scroll=window.scrollY;};window.addEventListener('scroll',save,{passive:true});
  const frame=requestAnimationFrame(()=>{window.scrollTo({top:saved,behavior:'instant'});release=requestAnimationFrame(()=>{restoring=false;});});
  return()=>{cancelAnimationFrame(frame);cancelAnimationFrame(release);window.removeEventListener('scroll',save);};
 },[view]);
 return <section className="samples-page"><header><h1>{business==='hall'?'模板样片':'高定样片'}</h1>{selectedCategory?<p>{selectedCategory.title}</p>:null}</header>
  {works.length?<div className="sample-grid">{works.map(work=><article className="sample-card" key={work.id}><div className="sample-card-media"><MediaDisplay media={work.media}/></div><div className="sample-card-copy"><h2>{work.title}</h2><LinkButton to={inquiryPath(business,{source:'samples',direction:work.categoryId})} className="button secondary">整理合作需求</LinkButton></div></article>)}</div>:<div className="samples-pending"><Picture src={reference(selectedCategory?.image||(business==='hall'?2:3))} alt="样片创作方向参考图"/><div><span className="status-tag">制作中</span><h2>样片制作中</h2><p>{business==='hall'?'模板样片正在准备，上架后可在此观看。':'高定样片正在准备，上架后可在此观看。'}</p><div className="action-row"><LinkButton to={selectedCategory?'/category/'+selectedCategory.id:'/'+business+'?section=applications'} className="button secondary">查看场景启发</LinkButton><LinkButton to={inquiryPath(business,{source:'samples',direction:selectedCategory?.id})}>整理合作需求</LinkButton></div></div></div>}
  {business==='hall'?<details className="simple-fold legacy-theme-library" open={expanded} onToggle={event=>{const next=event.currentTarget.open;view.open=next;setExpanded(next);}}><summary>主题配置预览<Icon name="arrow" size={18}/></summary><div className="fold-content"><p>预览主题选项，影像生成尚未开放。</p><div className="experience-filters" aria-label="主题分类">{themeGroups.map(group=><button key={group.id} className={filter===group.id?'chip active':'chip'} aria-pressed={filter===group.id} onClick={()=>{setFilter(group.id);memory.productViews.hall.filter=group.id;}}>{group.label}</button>)}</div><div className="theme-grid">{themes.map(theme=><a key={theme.id} data-theme={theme.id} className={'theme-card'+(memory.draft?.themeId===theme.id?' last-used':'')} href={'#'+experiencePath(theme.categoryId,theme.id)} aria-label={'使用主题：'+theme.title} onClick={()=>{view.scroll=window.scrollY;}}><div className="theme-card-media"><Picture src={theme.image} alt={theme.title}/></div><div className="theme-card-copy"><h3>{theme.title}</h3><span className="theme-card-action">{memory.draft?.themeId===theme.id&&memory.draft.value.choices.some(Boolean)?'继续配置':'使用主题'}<Icon name="arrow" size={17}/></span></div></a>)}</div></div></details>:null}
 </section>;
}
function Detail({category:c,themeIndex}:{category:Category;themeIndex?:number}){
 const theme=themeIndex===undefined?undefined:c.themes[themeIndex];const isHall=c.business==='hall';
 const application=businessApplications[c.business].find(item=>item.categoryId===c.id)!;
 const example=scenarioExamples[c.id];
 const relevantThemes=themeConfigurations.filter(item=>item.categoryId===c.id&&(themeIndex===undefined||item.id===c.id+'-'+themeIndex));
 const relatedCases=cases.filter(item=>item.categoryId===c.id&&item.status==='published'&&(themeIndex===undefined||item.themeId===c.id+'-'+themeIndex));
 return <article className="application-detail"><h1>{theme||application.title}</h1><p className="application-audience">{application.audience}</p>
  <section className="scenario-example"><h2>应用示例</h2><h3>{example.title}</h3><p className="application-value">{example.summary}</p></section>
  <section className="scenario-production"><h2>制作过程</h2><ol>{example.steps.map(item=><li key={item.title}><h4>{item.title}</h4><p>{item.description}</p></li>)}</ol></section>
  <figure className="scenario-template"><div className="application-cover detail-cover"><Picture src={example.image} alt={example.title+'场景参考图'} eager/></div><figcaption>{example.caption}</figcaption></figure>
  <div className="application-actions"><LinkButton to={theme&&isHall?experiencePath(c.id,c.id+'-'+themeIndex):'/samples/'+c.business+'?category='+c.id} className="button scene-cta">{theme&&isHall?'预览主题配置':'查看样片'}<Icon name="arrow" size={18}/></LinkButton><LinkButton to={inquiryPath(c.business,{source:'application',direction:c.id})} className="button secondary">整理合作需求<Icon name="arrow" size={18}/></LinkButton></div>
  <section className="application-detail-section"><h2>应用场景</h2><div className="application-tags">{application.scenes.map(scene=><span key={scene}>{scene}</span>)}</div></section>
  <section className="application-detail-section"><h2>可拓展方向</h2><p>{application.extension}</p></section>
  {isHall?<details className="simple-fold related-theme-section"><summary>主题配置预览<Icon name="arrow" size={18}/></summary><div className="fold-content related-theme-links">{relevantThemes.map(item=><LinkButton key={item.id} to={experiencePath(item.categoryId,item.id)} ariaLabel={'使用主题：'+item.title} className="button secondary">{item.title}<Icon name="arrow" size={16}/></LinkButton>)}</div></details>:null}
  <details className="simple-fold application-benefits"><summary>产品亮点和优势<Icon name="arrow" size={20}/></summary><div className="fold-content scene-advantages">{highlights[c.id].map(item=><div key={item.title}><h3>{item.title}</h3><p>{item.description}</p></div>)}</div></details>
  {relatedCases.length?<section className="real-case-section"><h2>精品样品</h2>{relatedCases.map(item=><article key={item.id}><h3>{item.title}</h3>{item.media.map((media,index)=><MediaDisplay key={item.id+'-'+index} media={media}/>)}</article>)}</section>:null}
 </article>;
}

function Experience({theme,draft,onDraftChange}:{theme:ThemeConfiguration;draft?:ThemeDraft;onDraftChange:(themeId:string,value:ThemeDraft)=>void}) {
 const [step,setStep]=useState(draft?.step||0);
 const [choices,setChoices]=useState<string[]>(()=>draft?.choices||theme.options.map(()=>''));
 const [photo,setPhoto]=useState(draft?.photo||'');
 const photoRef=useRef(draft?.photo||'');
 const photoInput=useRef<HTMLInputElement>(null);
 const [authorized,setAuthorized]=useState(draft?.authorized||false);
 const [copyState,setCopyState]=useState('');
 const [copyFallback,setCopyFallback]=useState(false);
 const stageHeading=useRef<HTMLHeadingElement>(null);
 const contentReady=choices.every(Boolean);
 const photoReady=!photo||authorized;
 useLayoutEffect(()=>{onDraftChange(theme.id,{step,choices,photo,authorized});},[theme.id,step,choices,photo,authorized,onDraftChange]);
 useLayoutEffect(()=>{window.scrollTo({top:0,behavior:'instant'});stageHeading.current?.focus({preventScroll:true});},[step]);
 useEffect(()=>{if(!copyState)return;const timer=setTimeout(()=>setCopyState(''),3500);return()=>clearTimeout(timer);},[copyState]);
 const edit=(next:number)=>{setCopyState('');setStep(next);};
 function removePhoto(){if(photoRef.current)URL.revokeObjectURL(photoRef.current);photoRef.current='';setPhoto('');setAuthorized(false);if(photoInput.current)photoInput.current.value='';}
 const summary=['咣当 AI影像 · 我的主题配置','主题：'+theme.title,'参与方式：'+theme.participation,...choices.map((choice,i)=>theme.options[i].title+'：'+choice),'照片：'+(photo?'已选，仅本机预览，复制内容不含照片':'未选择照片'),'真实生成尚未开放，此配置不会创建生成任务。'].join('\n');
 async function copy(){try{await navigator.clipboard.writeText(summary);setCopyState('配置已复制');}catch{setCopyFallback(true);}}
 return <section className="theme-config" aria-label={theme.title+'主题配置'}>
  <div className="config-theme-strip"><Picture src={theme.image} alt=""/><div><h1>{theme.title}</h1><div className="config-badges"><span className="config-state">生成未开放</span><span className="config-state">{theme.participation}</span></div></div></div>
  <LinkButton to={inquiryPath('hall',{source:'theme',direction:theme.categoryId,theme:theme.id})} className="text-link theme-project-link">将主题用于项目<Icon name="arrow" size={17}/></LinkButton>
  <section className="experience-panel">
   <div className="step-tabs" aria-label="配置步骤">{['选择内容','准备照片','确认信息'].map((label,i)=><button key={label} className={i===step?'current':i<step?'complete':''} aria-current={i===step?'step':undefined} disabled={i===1?!contentReady:i===2?!contentReady||!photoReady:false} onClick={()=>edit(i)}><b>{i+1}</b>{label}</button>)}</div>
   {step===0?<>
    <h2 ref={stageHeading} tabIndex={-1}>配置你的故事</h2>
    {theme.options.map((group,i)=><fieldset key={group.title}><legend>{group.title}</legend><div className="option-row">{group.items.map(item=><button className={choices[i]===item?'option selected':'option'} aria-pressed={choices[i]===item} key={item} onClick={()=>setChoices(v=>v.map((x,n)=>n===i?item:x))}>{item}{choices[i]===item?<Icon name="check" size={16}/>:null}</button>)}</div></fieldset>)}
    <button className="button wide" disabled={!contentReady} onClick={()=>edit(1)}>下一步：准备照片 <Icon name="arrow" size={17}/></button>
    {!contentReady?<p className="field-hint">每组选择一项</p>:null}
   </>:null}
   {step===1?<>
    <h2 ref={stageHeading} tabIndex={-1}>准备主角照片</h2>
    <p className="muted">照片选填 · 单人正脸 · 仅本机预览，不上传</p>
    <label className="upload-box">{photo?<img src={photo} alt="本机照片"/>:<><Icon name="image" size={30}/><span>选择一张照片</span><small>JPG / PNG / WebP，10MB以内</small></>}
     <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="选择照片" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){e.target.value='';alert('请选择10MB以内的JPG、PNG或WebP照片。');return;}if(photoRef.current)URL.revokeObjectURL(photoRef.current);const url=URL.createObjectURL(file);photoRef.current=url;setPhoto(url);setAuthorized(false);}}/>
    </label>
    {photo?<><div className="photo-actions"><button className="text-link" onClick={()=>photoInput.current?.click()}>更换照片</button><button className="text-link" onClick={removePhoto}>移除照片</button></div><label className="check-label"><input type="checkbox" checked={authorized} onChange={e=>setAuthorized(e.target.checked)}/>我确认已获得这张照片的使用授权</label></>:null}
    <div className="action-row optional-photo-actions"><button className="button secondary" onClick={()=>edit(0)}>上一步</button><button className="button" disabled={!photoReady} onClick={()=>edit(2)}>{photo?'下一步：确认信息':'暂不选照片，确认配置'}</button></div>
    {photo&&!authorized?<p className="field-hint">确认照片授权后继续</p>:null}
   </>:null}
   {step===2?<>
    <h2 ref={stageHeading} tabIndex={-1}>确认你的选择</h2>
    <div className="summary-section-heading"><h3>故事内容</h3><button className="text-link" onClick={()=>edit(0)}>修改内容</button></div>
    <dl className="summary-list">{choices.map((choice,i)=><div key={theme.options[i].title}><dt>{theme.options[i].title}</dt><dd>{choice}</dd></div>)}</dl>
    <div className="summary-section-heading"><h3>主角照片（选填）</h3><button className="text-link" onClick={()=>edit(1)}>修改照片</button></div>
    <div className="summary-photo">{photo?<img src={photo} alt="已选照片"/>:<div className="summary-placeholder"><Icon name="mine" size={28}/></div>}<div><strong>{photo?'已选择单人照片':'未选择照片'}</strong><p>{photo?'仅本机预览':'照片选填'}</p></div></div>
    <div className="notice journey-result">故事设定已就绪。生成未开放，可先复制配置。</div>
    <div className="action-row"><button className="button" onClick={copy}><Icon name="copy" size={17}/>复制我的配置</button><button className="button secondary" disabled>生成暂未开放</button></div>
    <section className="project-bridge"><h3>把这个主题用于你的项目</h3><p>围绕活动目标、品牌呈现和参与规模，规划合适的互动方式。</p><LinkButton to={inquiryPath('hall',{source:'theme',direction:theme.categoryId,theme:theme.id})}>整理合作需求<Icon name="arrow" size={17}/></LinkButton></section>
    <LinkButton to="/samples/hall?preview=themes" className="text-link">更换主题 <Icon name="arrow" size={16}/></LinkButton>
   </>:null}
  </section>
  {copyState?<div className="toast" role="status">{copyState}</div>:null}
  {copyFallback?<Modal title="我的主题配置" onClose={()=>setCopyFallback(false)}><div className="copy-panel"><p>长按复制文字，照片仅留在本机。</p><textarea className="summary-text" aria-label="我的配置摘要" readOnly value={summary} rows={12}/></div><button className="button wide" onClick={()=>setCopyFallback(false)}>返回配置</button></Modal>:null}
 </section>;
}

function Gallery(){const [business,setBusiness]=useState('all');const [category,setCategory]=useState('all');const [mode,setMode]=useState('layout');const [count,setCount]=useState(6);const [active,setActive]=useState<string|null>(null);
 const liveWorks=publishedWorks.filter(w=>w.status==='published'&&w.displayAuthorized);const works=illustrativeWorks.filter(w=>(business==='all'||w.business===business)&&(category==='all'||w.categoryId===category));const filteredLive=liveWorks.filter(w=>(business==='all'||w.business===business)&&(category==='all'||w.categoryId===category)).sort((a,b)=>a.sort-b.sort);const liveWork=liveWorks.find(w=>w.id===active);const work=illustrativeWorks.find(w=>w.id===active);
 return <><section className="page-intro compact"><Eyebrow>THE VISUAL COLLECTION</Eyebrow><h1>案例分享</h1><p>看见影像的更多可能。</p></section><div className="gallery-controls"><div className="segmented"><button className={mode==='layout'?'active':''} onClick={()=>setMode('layout')}>主题灵感</button><button className={mode==='published'?'active':''} onClick={()=>setMode('published')}>真实作品</button></div><span className="muted">主题参考图，非生成作品</span></div><div className="filter-row"><button className={business==='all'?'chip active':'chip'} onClick={()=>{setBusiness('all');setCategory('all');setCount(6);}}>全部业务</button>{(['hall','bespoke'] as Business[]).map(b=><button key={b} className={business===b?'chip active':'chip'} onClick={()=>{setBusiness(b);setCategory('all');setCount(6);}}>{businessName(b)}</button>)}<label className="select-filter">分类<select aria-label="作品分类" value={category} onChange={e=>{setCategory(e.target.value);setCount(6);}}><option value="all">全部分类</option>{categories.filter(c=>business==='all'||c.business===business).map(c=><option value={c.id} key={c.id}>{c.short}</option>)}</select></label></div>
 {mode==='published'?(filteredLive.length?<><div className="masonry case-waterfall">{filteredLive.slice(0,count).map(w=><button className="work-card" key={w.id} onClick={()=>setActive(w.id)} aria-label={`查看作品${w.title}`}><div className="work-image"><Picture src={w.media.type==='image'?w.media.src:(w.media.poster||'')} alt={w.title}/>{w.media.type==='video'?<span className="work-open"><Icon name="play"/></span>:null}</div><div className="work-copy"><span>{businessName(w.business)}</span><h3>{w.title}</h3></div></button>)}</div><div className="load-more">{count<filteredLive.length?<button className="button secondary" onClick={()=>setCount(n=>n+6)}>加载更多</button>:<span>没有更多作品了</span>}</div></>:<Empty title="真实作品待上架">探索主题灵感，找到想讲述的故事。</Empty>):<><div className="masonry case-waterfall">{works.slice(0,count).map(w=><button className="work-card" key={w.id} onClick={()=>setActive(w.id)} aria-label={`查看${w.title}主题参考`}><div className="work-image"><Picture src={w.image} alt={`${w.title}主题参考`}/><span className="photo-caption">主题参考</span><span className="work-open"><Icon name="image" size={20}/></span></div><div className="work-copy"><span>{businessName(w.business)}</span><h3>{w.title}</h3><p>{categoryById.get(w.categoryId)?.short}</p></div></button>)}</div><div className="load-more">{count<works.length?<button className="button secondary" onClick={()=>setCount(n=>n+6)}>加载更多</button>:<span>已经看到全部主题参考</span>}</div></>}
 {liveWork?<Modal title={liveWork.title} onClose={()=>setActive(null)}><MediaDisplay media={liveWork.media}/><p>{businessName(liveWork.business)} · {categoryById.get(liveWork.categoryId)?.title}</p><LinkButton to={liveWork.business==='hall'?experiencePath(liveWork.categoryId,liveWork.themeId):`/category/${liveWork.categoryId}`}>{liveWork.business==='hall'?'立即体验':'咨询同类创作'}<Icon name="arrow" size={17}/></LinkButton></Modal>:null}{work?<Modal title="主题参考" onClose={()=>setActive(null)}><Picture src={work.image} alt={work.title} className="modal-image"/><h3>{work.title}</h3><p className="muted">主题参考图，非客户案例或生成成片。</p><LinkButton to={work.business==='hall'?experiencePath(work.categoryId,`${work.categoryId}-0`):`/category/${work.categoryId}`} className="button">{work.business==='hall'?'立即体验':'探索同类创作'} <Icon name="arrow" size={17}/></LinkButton></Modal>:null}</>;
}

function Cooperation({route,draft,themeChoices,onDraftChange}:{route:string;draft?:InquiryDraft;themeChoices?:string[];onDraftChange:(key:string,value:InquiryDraft)=>void}){
 const context=inquiryContext(route);
 const initial=draft||{direction:context.direction?.title||'',description:'',organization:'',timing:'',scope:'',name:'',contact:''};
 const [summary,setSummary]=useState('');
 const [copyState,setCopyState]=useState('复制需求摘要');
 const directions=context.business?categories.filter(category=>category.business===context.business):categories;
 const selections=context.theme?context.theme.options.flatMap((group,index)=>themeChoices?.[index]?[group.title+'：'+themeChoices[index]]:[]):[];
 function values(form:HTMLFormElement):InquiryDraft{
  const data=new FormData(form);const get=(key:string)=>String(data.get(key)||'').trim();
  return {direction:get('direction'),description:get('description'),organization:get('organization'),timing:get('timing'),scope:get('scope'),name:get('name'),contact:get('contact')};
 }
 function remember(form:HTMLFormElement){onDraftChange(context.key,values(form));}
 async function copy(){try{await navigator.clipboard.writeText(summary);setCopyState('已复制');}catch{setCopyState('请长按下方摘要手动复制');}}
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget;const data=values(form);
  if(!data.description){const field=form.elements.namedItem('description') as HTMLTextAreaElement;field.setCustomValidity('请简单描述项目的目标和用途。');field.reportValidity();return;}
  onDraftChange(context.key,data);
  const business=categories.find(category=>category.title===data.direction)?.business||context.business;
  setSummary(['咣当 AI影像 · 合作需求',...(business?['产品：'+businessName(business)]:[]),...(context.theme?['参考主题：'+context.theme.title,...selections]:[]),...(data.organization?['单位／项目：'+data.organization]:[]),'需求方向：'+data.direction,'需求描述：'+data.description,...(data.timing?['计划时间：'+data.timing]:[]),...(data.scope?['规模与交付要求：'+data.scope]:[]),...(data.name?['联系人：'+data.name]:[]),...(data.contact?['联系方式：'+data.contact]:[]),'','尚未发送，仅供复制留存。正式咨询渠道待开放。'].join('\n'));
  setCopyState('复制需求摘要');
 }
 return <>
  <section className="page-intro compact"><h1>合作需求</h1><p>明确项目目标，整理合作范围。</p></section>
  {context.business?<section className="inquiry-context" aria-label="当前合作方向"><div><span>{businessName(context.business)}</span>{context.theme?<strong>参考主题：{context.theme.title}</strong>:context.direction?<strong>{context.direction.title}</strong>:null}</div>{selections.length?<ul className="inquiry-theme-options">{selections.map(item=><li key={item}>{item}</li>)}</ul>:null}</section>:null}
  <div className="cooperate-grid">
   <p className="notice consultation-state">可先整理并复制需求，正式咨询待开放。</p>
   <form className="demand-form" onSubmit={submit} onChange={e=>remember(e.currentTarget)}>
    <div className="section-line"><h2>你的项目计划</h2></div>
    <label>需求方向<select name="direction" required defaultValue={initial.direction}><option value="" disabled>请选择需求方向</option>{(['hall','bespoke'] as Business[]).filter(business=>directions.some(category=>category.business===business)).map(business=><optgroup key={business} label={businessName(business)}>{directions.filter(category=>category.business===business).map(category=><option key={category.id}>{category.title}</option>)}</optgroup>)}<option>尚未确定，想先了解</option></select></label>
    <label>单位／项目（选填）<input name="organization" maxLength={100} defaultValue={initial.organization} autoComplete="organization" placeholder="单位名称或项目名称"/></label>
    <label>需求描述<textarea name="description" required maxLength={2000} defaultValue={initial.description} rows={4} placeholder={context.business==='hall'?'希望谁参与？传递什么主题？用于什么活动或传播场景？':'希望讲述什么故事？给谁观看？用于什么场景？有哪些现成资料？'} onInput={e=>e.currentTarget.setCustomValidity('')}/></label>
    <div className="form-pair"><label>计划时间（选填）<input name="timing" maxLength={100} defaultValue={initial.timing} placeholder="活动或交付时间"/></label><label>规模与交付要求（选填）<input name="scope" maxLength={160} defaultValue={initial.scope} placeholder={context.business==='hall'?'人数、场次':'片长、画幅'}/></label></div>
    <div className="form-pair"><label>联系人（选填）<input name="name" maxLength={50} defaultValue={initial.name} autoComplete="name" placeholder="怎么称呼你"/></label><label>联系方式（选填）<input name="contact" maxLength={100} defaultValue={initial.contact} placeholder="手机、邮箱或微信" autoComplete="off"/></label></div>
    <p className="field-hint">仅本机临时保留，刷新后清空。不会上传或发送。</p>
    <button type="submit" className="button wide">整理需求摘要 <Icon name="arrow" size={18}/></button>
   </form>
  </div>
  {summary?<Modal title="你的需求摘要" onClose={()=>setSummary('')}><div className="notice">尚未发送 · 可复制留存</div><textarea className="summary-text" readOnly value={summary} aria-label="需求摘要" rows={12}/><div className="action-row"><button className="button" onClick={copy}><Icon name="copy" size={17}/>{copyState}</button><button className="button secondary" onClick={()=>setSummary('')}>返回修改</button></div></Modal>:null}
 </>;
}

function Mine(){return <><section className="page-intro compact"><Eyebrow>YOUR STORY SPACE</Eyebrow><h1>我的</h1><p>为你的故事，留一个位置。</p></section><section className="profile-card"><div className="avatar"><Icon name="mine" size={36}/></div><div><h2>欢迎来到咣当</h2><p>账户待开放</p></div><span className="status-tag">访客浏览</span></section><div className="mine-grid">{[{title:'我的作品',desc:'账户与作品服务接入后开放。',icon:'works'},{title:'生成记录',desc:'现有体验产品的任务记录待核实接入。',icon:'image'}].map(x=><div className="mine-item" key={x.title}><Icon name={x.icon as IconName} size={28}/><h3>{x.title}</h3><span>暂未开放</span></div>)}</div><div className="content-panel"><h2>先从一段故事开始</h2><p>探索模板互动，或了解适合自己的专属影像创作。</p><div className="action-row"><LinkButton to="/hall">探索AI影像馆 <Icon name="arrow" size={17}/></LinkButton><LinkButton to="/bespoke" className="button secondary">了解高定AI影像</LinkButton></div></div></>;}

function configurationForRoute(route:string){
 const parts=route.split('?')[0].split('/').filter(Boolean);
 return parts[0]==='experience'&&parts.length<=3&&categoryById.get(parts[1])?.business==='hall'?getThemeConfiguration(parts[1],parts[2]):undefined;
}

export default function Guangdang(){
 const [route,setRoute]=useState(getRoute);
 const [reduceMotion,setReduceMotion]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [manualPaused,setManualPaused]=useState(false);
 const motionPaused=reduceMotion||manualPaused;
 const routeRef=useRef(route);
 const [share,setShare]=useState('');
 const [about,setAbout]=useState(false);
 const [pendingRoute,setPendingRoute]=useState<string|null>(null);
 const main=useRef<HTMLElement>(null);
 const focusedPath=useRef('');
 const memory=useRef<BrowsingMemory>({carouselIndices:{hall:0,bespoke:0},productViews:{hall:{section:'experience',filter:'all',scroll:{experience:0,introduction:0,applications:0}},bespoke:{section:'experience',filter:'all',scroll:{experience:0,introduction:0,applications:0}}},draft:null,inquiryDrafts:{},sampleViews:{hall:{open:false,scroll:0},bespoke:{open:false,scroll:0}}});
 useEffect(()=>{const preference=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduceMotion(preference.matches);preference.addEventListener('change',change);return()=>preference.removeEventListener('change',change);},[]);
 useLayoutEffect(()=>{document.body.classList.add('lightfield-app','cinema-app');document.body.classList.toggle('motion-paused',motionPaused);return()=>{document.body.classList.remove('lightfield-app','cinema-app','motion-paused');};},[motionPaused]);
 useEffect(()=>{
  if(motionPaused||!('IntersectionObserver' in window))return;
  const animations:Animation[]=[];
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);animations.push(entry.target.animate([{opacity:.55,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.2,.7,.2,1)'}));}},{threshold:.08});
  main.current?.querySelectorAll('.editorial-product > section,.scenario-card,.scenario-production li').forEach(node=>observer.observe(node));
  return()=>{observer.disconnect();animations.forEach(animation=>animation.cancel());};
 },[route,motionPaused]);
 const rememberDraft=useCallback((themeId:string,value:ThemeDraft)=>{
  const previous=memory.current.draft;
  if(previous&&previous.themeId!==themeId&&previous.value.photo)URL.revokeObjectURL(previous.value.photo);
  memory.current.draft={themeId,value};
  const index=getShowcaseSlides('hall').findIndex(slide=>slide.id===themeId);
  if(index>=0)memory.current.carouselIndices.hall=index;
 },[]);
 useLayoutEffect(()=>{const previous=history.scrollRestoration;history.scrollRestoration='manual';return()=>{history.scrollRestoration=previous;};},[]);
 useEffect(()=>{
  let position=typeof history.state?.guangdangPosition==='number'?history.state.guangdangPosition:0;
  let restoringTo:string|null=null;
  let blockedRoute:string|null=null;
  history.replaceState({...history.state,guangdangPosition:position},'');
  const needsConfirmation=(next:string)=>{
   const nextTheme=configurationForRoute(next);const draft=memory.current.draft;
   return Boolean(nextTheme&&draft&&nextTheme.id!==draft.themeId&&(draft.value.photo||draft.value.choices.some(Boolean)));
  };
  const change=()=>{
   const next=getRoute();
   if(restoringTo===next){
    restoringTo=null;setPendingRoute(blockedRoute);blockedRoute=null;return;
   }
   if(next===routeRef.current)return;
   const storedPosition=history.state?.guangdangPosition;
   const nextPosition=typeof storedPosition==='number'?storedPosition:position+1;
   if(needsConfirmation(next)){
    restoringTo=routeRef.current;blockedRoute=next;
    history.go(typeof storedPosition==='number'?position-nextPosition:-1);
    return;
   }
   position=nextPosition;
   if(typeof storedPosition!=='number')history.replaceState({...history.state,guangdangPosition:position},'');
   routeRef.current=next;setRoute(next);
  };
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target instanceof Element?event.target.closest('a'):null;
   const href=anchor?.getAttribute('href');
   if(!href?.startsWith('#/'))return;
   const next=decodeURI(href.slice(1));
   if(needsConfirmation(next)){event.preventDefault();setPendingRoute(next);}
  };
  window.addEventListener('hashchange',change);document.addEventListener('click',click,true);
  return()=>{window.removeEventListener('hashchange',change);document.removeEventListener('click',click,true);};
 },[]);
 useLayoutEffect(()=>{window.scrollTo({top:0,behavior:'instant'});},[route]);
 useEffect(()=>()=>{const photo=memory.current.draft?.value.photo;if(photo)URL.revokeObjectURL(photo);memory.current.draft=null;},[]);
 useEffect(()=>{const configuration=configurationForRoute(route);const title=configuration?.title||(route.startsWith('/hall')?'AI影像馆':route.startsWith('/bespoke')?'高定AI影像':route.startsWith('/samples/hall')?'模板样片':route.startsWith('/samples/bespoke')?'高定样片':route.startsWith('/works')?'案例分享':route.startsWith('/cooperate')?'商务合作':route.startsWith('/mine')?'我的':'属于你的AI片场');document.title='咣当 AI影像 · '+title;const nextPath=route.split('?')[0];if(focusedPath.current!==nextPath){main.current?.focus({preventScroll:true});focusedPath.current=nextPath;}},[route]);
 useEffect(()=>{if(!share)return;const timer=setTimeout(()=>setShare(''),3500);return()=>clearTimeout(timer);},[share]);
 async function sharePage(){try{await navigator.clipboard.writeText(window.location.href);setShare('页面链接已复制，可分享给客户或同事。');}catch{setShare('请复制浏览器地址：'+window.location.href);}}
 function confirmThemeChange(){
  if(!pendingRoute)return;const next=pendingRoute;const photo=memory.current.draft?.value.photo;
  if(photo)URL.revokeObjectURL(photo);memory.current.draft=null;setPendingRoute(null);go(next);
 }
 const path=route.split('?')[0];const parts=path.split('/').filter(Boolean);const c=categoryById.get(parts[1]||'');
 const configuration=configurationForRoute(route);
 const active=path.startsWith('/cooperate')?'cooperate':path.startsWith('/mine')?'mine':path==='/works'?'works':path==='/'||path==='/hall'||path==='/bespoke'||parts[0]==='experience'||parts[0]==='samples'||Boolean(c)?'home':'';
 let page:ReactNode;
 if(path==='/')page=<Home/>;
 else if(path==='/hall'||path==='/bespoke')page=<Catalogue key={path} business={path.slice(1) as Business} memory={memory.current} route={route}/>;
 else if(parts[0]==='samples'&&(parts[1]==='hall'||parts[1]==='bespoke')&&parts.length===2)page=<Samples key={route} business={parts[1]} memory={memory.current} route={route}/>;
 else if(parts[0]==='category'&&c)page=<Detail key={route} category={c}/>;
 else if(parts[0]==='theme'&&c&&c.themes[Number(parts[2])])page=<Detail key={route} category={c} themeIndex={Number(parts[2])}/>;
 else if(parts[0]==='experience'&&configuration)page=<Experience key={configuration.id} theme={configuration} draft={memory.current.draft?.themeId===configuration.id?memory.current.draft.value:undefined} onDraftChange={rememberDraft}/>;
 else if(path==='/works')page=<Gallery/>;
 else if(path==='/cooperate'){const context=inquiryContext(route);page=<Cooperation key={route} route={route} draft={memory.current.inquiryDrafts[context.key]} themeChoices={context.theme&&memory.current.draft?.themeId===context.theme.id?memory.current.draft.value.choices:undefined} onDraftChange={(key,value)=>{memory.current.inquiryDrafts[key]=value;}}/>;}
 else if(path==='/mine')page=<Mine/>;
 else page=<><Empty title="暂时没有这个页面">这个入口可能已经更新，可以返回首页重新探索。</Empty><LinkButton to="/">返回首页</LinkButton></>;
 return <>
  <div className="aurora-backdrop" aria-hidden="true"/>
  <a href="#main" className="skip-link" onClick={e=>{e.preventDefault();main.current?.focus();}}>跳到主要内容</a>
  <header className="topbar"><div className="topbar-inner">
   <a className="brand" href="#/" aria-label="咣当首页"><span className="brand-mark"><img className="brand-logo" src={asset('images/brand/guangdang-logo.png')} alt="咣当原品牌Logo"/></span><span className="brand-wordmark"><strong>咣当</strong><small>GUANGDANG</small></span></a>
   <nav className="desktop-nav" aria-label="主导航"><a href="#/" className={active==='home'?'active':''}>首页</a><a href="#/works" className={active==='works'?'active':''}>案例分享</a><a href="#/cooperate" className={active==='cooperate'?'active':''}>商务合作</a><a href="#/mine" className={active==='mine'?'active':''}>我</a></nav>
   <div className="header-actions"><button className="icon-button about-button" onClick={()=>setAbout(true)} aria-label="关于原型"><Icon name="spark" size={18}/></button><button className="icon-button motion-toggle" onClick={()=>setManualPaused(value=>!value)} disabled={reduceMotion} aria-pressed={motionPaused} aria-label={reduceMotion?'已遵循系统减少动态效果设置':motionPaused?'恢复动效':'暂停动效'} title={reduceMotion?'已遵循系统减少动态效果设置':motionPaused?'恢复动效':'暂停动效'}><Icon name={motionPaused?'play':'pause'} size={18}/></button><button className="icon-button share-button" onClick={sharePage} aria-label="复制当前页面链接"><Icon name="copy" size={19}/></button></div>
  </div></header>
  <main id="main" data-route={path} ref={main} tabIndex={-1} key={path} className={'page-shell compact-shell lightfield-page '+(path==='/'?'is-home':'')+' '+(path==='/hall'||path==='/bespoke'?'is-business':'')}>
   {parts.length>0?<button className="back-button" onClick={()=>{if(parts[0]==='experience')go('/samples/hall?preview=themes');else if(parts[0]==='samples')go('/'+parts[1]+'?section=experience');else if(parts[0]==='theme')go('/category/'+c?.id);else if(parts[0]==='category')go(c?'/'+c.business+'?section=applications':'/');else if(path==='/cooperate')go(inquiryContext(route).returnTo);else go('/');}}><Icon name="back" size={16}/>{path==='/cooperate'?inquiryContext(route).returnLabel:'返回'+(parts[0]==='experience'?'主题配置预览':parts[0]==='samples'?businessName(parts[1] as Business):parts[0]==='category'?businessName(c?.business||'hall'):parts[0]==='theme'?'主题详情':'首页')}</button>:null}{page}
  </main>
  <nav className="mobile-nav" aria-label="底部导航">{([{id:'home',title:'首页',to:'/'},{id:'works',title:'案例分享',to:'/works'},{id:'cooperate',title:'商务合作',to:'/cooperate'},{id:'mine',title:'我',to:'/mine'}] as const).map(item=><a key={item.id} href={'#'+item.to} className={active===item.id?'active':''} aria-current={active===item.id?'page':undefined}><Icon name={item.id}/><span>{item.title}</span></a>)}</nav>
  {share?<div className="toast" role="status">{share}</div>:null}
  {about?<Modal title="关于本次改版预览" onClose={()=>setAbout(false)}><p>AI影像馆可自行配置单人主题；高定AI影像围绕专属故事整理创作需求。</p><div className="about-links"><a className="button secondary" href="#/works" onClick={()=>setAbout(false)}>影像作品示意</a><a className="button secondary" href="#/mine" onClick={()=>setAbout(false)}>我的（待开放）</a></div><p>场景配图不代表真实案例，高定样品待上架。真实生成、咨询渠道和账户服务尚未开放。</p><p className="muted">配置只在本次浏览中临时保留；确认更换主题或刷新页面会清除，不会上传照片或提交需求。</p><button className="button wide" onClick={()=>setAbout(false)}>继续浏览</button></Modal>:null}
  {pendingRoute?<Modal title="更换主题？" onClose={()=>setPendingRoute(null)}><p>更换后，当前主题的选择和本机照片将被清空。复制的文字配置可继续留存。</p><div className="action-row"><button className="button secondary" onClick={()=>setPendingRoute(null)}>保留当前配置</button><button className="button" onClick={confirmThemeChange}>更换并清空</button></div></Modal>:null}
 </>;
}
