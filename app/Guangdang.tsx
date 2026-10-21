import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { asset, reference, categories, categoryById, businessName, illustrativeWorks, publishedWorks, cases, highlights, businessProfiles, themeImages, getShowcaseSlides, getThemeConfiguration, themeConfigurations, experiencePath, type ThemeConfiguration, type Media, type Business, type Category } from './guangdang-data';

type ThemeDraft={step:number;choices:string[];photo:string;authorized:boolean};
type BrowsingMemory={carouselIndices:Record<Business,number>;draft:{themeId:string;value:ThemeDraft}|null};
type IconName = 'home'|'works'|'cooperate'|'mine'|'arrow'|'back'|'close'|'play'|'check'|'spark'|'copy'|'image';
function Icon({name,size=22}:{name:IconName;size?:number}) {
 const paths:Record<IconName,ReactNode> = {
  home:<><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
  works:<><rect x="3" y="3" width="7" height="10" rx="2"/><rect x="14" y="3" width="7" height="6" rx="2"/><rect x="3" y="17" width="7" height="4" rx="1"/><rect x="14" y="13" width="7" height="8" rx="2"/></>,
  cooperate:<><path d="m3 9 5-5 4 3 4-3 5 5-7 10-4-1Z"/><path d="m7 12 6 6M10 9l7 6"/></>,
  mine:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  arrow:<><path d="M4 12h15m-6-6 6 6-6 6"/></>, back:<path d="m15 5-7 7 7 7"/>,close:<path d="m6 6 12 12M6 18 18 6"/>,
  play:<path d="m9 5 11 7-11 7Z"/>,check:<path d="m5 12 4 4L19 6"/>, spark:<><path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></>,
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

function Home(){return <section className="simple-home" aria-label="选择影像服务">
 <div className="home-question"><p>属于你的AI片场</p><h1>今天，想拍点什么？</h1></div>
 <div className="home-choices">
  <a className="home-choice" aria-label="AI影像馆" href="#/hall"><div><h2>AI影像馆</h2><span className="home-choice-action">选主题体验<Icon name="arrow" size={20}/></span></div><Picture src={reference(2)} alt="AI影像馆" eager/></a>
  <a className="home-choice bespoke-choice" aria-label="高定AI影像" href="#/bespoke"><div><h2>高定AI影像</h2><span className="home-choice-action">专属故事定制<Icon name="arrow" size={20}/></span></div><Picture src={reference(3)} alt="高定AI影像" eager/></a>
 </div>
</section>;}

function SampleCarousel({business,memory}:{business:Business;memory:BrowsingMemory}){
 const [pickerOpen,setPickerOpen]=useState(false);const slides=getShowcaseSlides(business);const track=useRef<HTMLDivElement>(null);const [index,setIndex]=useState(()=>Math.min(memory.carouselIndices[business],slides.length-1));
 function moveTo(next:number){const container=track.current;if(!container)return;const item=container.children[next] as HTMLElement;const first=container.children[0] as HTMLElement;if(!item||!first)return;container.scrollTo({left:item.offsetLeft-first.offsetLeft,behavior:'instant'});}
 function updatePosition(){const container=track.current;if(!container)return;const item=container.children[0] as HTMLElement;if(!item)return;const gap=12;const next=Math.max(0,Math.min(slides.length-1,Math.round(container.scrollLeft/(item.getBoundingClientRect().width+gap))));memory.carouselIndices[business]=next;setIndex(next);}
 useLayoutEffect(()=>{const container=track.current;if(!container)return;const restore=()=>{const next=Math.min(memory.carouselIndices[business],slides.length-1);moveTo(next);setIndex(next);};restore();const observer=new ResizeObserver(restore);observer.observe(container);return()=>observer.disconnect();},[business,memory]);
 useEffect(()=>{track.current?.querySelectorAll('video').forEach((video,i)=>{if(i!==index)video.pause();});},[index]);
 return <section className="primary-experience" aria-label={business==='hall'?'立即体验':'定制方向'}><div className="experience-heading"><h2>{business==='hall'?'立即体验':slides.some(slide=>slide.media)?'精品样品':'定制方向'}</h2>{business==='hall'?<button className="text-link theme-picker-button" onClick={()=>setPickerOpen(true)}>全部主题</button>:null}<div className="carousel-controls"><button className="icon-button" disabled={index===0} onClick={()=>moveTo(index-1)} aria-label="上一个主题"><Icon name="back" size={20}/></button><span className="carousel-count" aria-live="polite">{index+1} / {slides.length}</span><button className="icon-button next-slide" disabled={index===slides.length-1} onClick={()=>moveTo(index+1)} aria-label="下一个主题"><Icon name="back" size={20}/></button></div></div>
 <div className="experience-carousel" ref={track} onScroll={updatePosition} role="region" aria-label={business==='hall'?'滑动选择影像主题':'滑动查看定制方向'} tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();moveTo(Math.min(slides.length-1,index+1));}if(e.key==='ArrowLeft'){e.preventDefault();moveTo(Math.max(0,index-1));}}}>
 {slides.map((slide,i)=><article className="preview-slide" key={slide.id} aria-label={slide.title} data-slide={slide.id}><div className="slide-media">{slide.media?<MediaDisplay media={slide.media}/>:<Picture src={slide.image} alt={slide.pending?`${slide.title}场景配图，样品待上架`:slide.title} eager={i===0}/>} {slide.pending?<span className="sample-pending">样品待上架</span>:null}</div><div className="slide-bottom"><h3>{slide.title}</h3><LinkButton to={slide.to} className="button">{slide.media?'了解创作':slide.action}<Icon name="arrow" size={17}/></LinkButton></div></article>)}
 </div>
 {pickerOpen?<Modal title="选择影像主题" onClose={()=>setPickerOpen(false)}><div className="theme-picker-grid">{themeConfigurations.map(theme=><button className="theme-picker-card" key={theme.id} aria-label={theme.title} onClick={()=>{setPickerOpen(false);go(experiencePath(theme.categoryId,theme.id));}}><Picture src={theme.image} alt=""/><span>{theme.title}</span></button>)}</div></Modal>:null}</section>;
}

function Catalogue({business,memory}:{business:Business;memory:BrowsingMemory}){
 const profile=businessProfiles[business];
 return <div className="business-page"><h1 className="business-title">{businessName(business)}</h1><SampleCarousel business={business} memory={memory}/><div className="business-secondary">
 <details className="simple-fold product-introduction"><summary>产品简介<Icon name="arrow" size={20}/></summary><div className="fold-content"><p>{profile.positioning}</p><ul>{profile.advantages.map(item=><li key={item}>{item}</li>)}</ul></div></details>
 <details className="simple-fold product-advantages"><summary>产品优势<Icon name="arrow" size={20}/></summary><div className="fold-content scene-advantages">{profile.highlights.map(item=><div key={item.title}><h2>{item.title}</h2><p>{item.description}</p></div>)}</div></details>
 </div></div>;
}

function Detail({category:c,themeIndex}:{category:Category;themeIndex?:number}){
 const theme=themeIndex===undefined?undefined:c.themes[themeIndex];const isHall=c.business==='hall';const relatedCases=cases.filter(x=>x.categoryId===c.id&&x.status==='published'&&(themeIndex===undefined||x.themeId===`${c.id}-${themeIndex}`));
 return <article className="simple-detail"><h1>{theme||c.title}</h1><div className="detail-cover"><Picture src={themeIndex===undefined?reference(c.image):themeImages[`${c.id}-${themeIndex}`]} alt={`${theme||c.title}场景配图`} eager/></div><p className="scene-description">{c.intro}</p><LinkButton to={isHall?experiencePath(c.id,themeIndex===undefined?undefined:`${c.id}-${themeIndex}`):`/cooperate?direction=${c.id}`} className="button scene-cta">{isHall?'立即体验':'整理定制需求'}<Icon name="arrow" size={18}/></LinkButton>
 <div className="scene-folds"><details className="simple-fold"><summary>适用场景<Icon name="arrow" size={20}/></summary><div className="fold-content"><p>{c.audience}</p></div></details>
 <details className="simple-fold"><summary>产品亮点和优势<Icon name="arrow" size={20}/></summary><div className="fold-content scene-advantages">{highlights[c.id].map(item=><div key={item.title}><h2>{item.title}</h2><p>{item.description}</p></div>)}</div></details>
</div>
 {relatedCases.length?<section className="real-case-section"><h2>精品样品</h2>{relatedCases.map(item=><article key={item.id}><h3>{item.title}</h3>{item.media.map((media,i)=><MediaDisplay key={`${item.id}-${i}`} media={media}/>)}</article>)}</section>:null}
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
  <div className="theme-config-heading"><h1>{theme.title}</h1><div className="config-badges"><span className="config-state">生成未开放</span><span className="config-state">{theme.participation}</span></div></div>
  <p className="theme-material-hint">{theme.materialHint}</p>
  <section className="experience-panel">
   <div className="step-tabs" aria-label="配置步骤">{['选择内容','准备照片','确认信息'].map((label,i)=><button key={label} className={i===step?'current':i<step?'complete':''} aria-current={i===step?'step':undefined} disabled={i===1?!contentReady:i===2?!contentReady||!photoReady:false} onClick={()=>edit(i)}><b>{i+1}</b>{label}</button>)}</div>
   {step===0?<>
    <h2 ref={stageHeading} tabIndex={-1}>配置你的故事</h2>
    {theme.options.map((group,i)=><fieldset key={group.title}><legend>{group.title}</legend><div className="option-row">{group.items.map(item=><button className={choices[i]===item?'option selected':'option'} aria-pressed={choices[i]===item} key={item} onClick={()=>setChoices(v=>v.map((x,n)=>n===i?item:x))}>{item}{choices[i]===item?<Icon name="check" size={16}/>:null}</button>)}</div></fieldset>)}
    <button className="button wide" disabled={!contentReady} onClick={()=>edit(1)}>下一步：准备照片 <Icon name="arrow" size={17}/></button>
    <p className="field-hint">{!contentReady?'请在每组中各选择一项。':'内容已选好，可以继续。'}</p>
   </>:null}
   {step===1?<>
    <h2 ref={stageHeading} tabIndex={-1}>准备主角照片</h2>
    <p className="muted">照片选填，仅在本次浏览中预览，不会上传。请选择单人、清晰、无遮挡的正脸照。</p>
    <label className="upload-box">{photo?<img src={photo} alt="本机照片"/>:<><Icon name="image" size={30}/><span>选择一张照片</span><small>JPG / PNG / WebP，10MB以内</small></>}
     <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="选择照片" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){e.target.value='';alert('请选择10MB以内的JPG、PNG或WebP照片。');return;}if(photoRef.current)URL.revokeObjectURL(photoRef.current);const url=URL.createObjectURL(file);photoRef.current=url;setPhoto(url);setAuthorized(false);}}/>
    </label>
    {photo?<><div className="photo-actions"><button className="text-link" onClick={()=>photoInput.current?.click()}>更换照片</button><button className="text-link" onClick={removePhoto}>移除照片</button></div><label className="check-label"><input type="checkbox" checked={authorized} onChange={e=>setAuthorized(e.target.checked)}/>我确认已获得这张照片的使用授权</label></>:null}
    <div className="action-row optional-photo-actions"><button className="button secondary" onClick={()=>edit(0)}>上一步</button><button className="button" disabled={!photoReady} onClick={()=>edit(2)}>{photo?'下一步：确认信息':'暂不选照片，确认配置'}</button></div>
    <p className="field-hint">{!photo?'照片为选填，可先确认配置。':!authorized?'请确认照片使用授权，或移除照片后继续。':'照片及授权已准备好。'}</p>
   </>:null}
   {step===2?<>
    <h2 ref={stageHeading} tabIndex={-1}>确认你的选择</h2>
    <div className="summary-section-heading"><h3>故事内容</h3><button className="text-link" onClick={()=>edit(0)}>修改内容</button></div>
    <dl className="summary-list">{choices.map((choice,i)=><div key={theme.options[i].title}><dt>{theme.options[i].title}</dt><dd>{choice}</dd></div>)}</dl>
    <div className="summary-section-heading"><h3>主角照片（选填）</h3><button className="text-link" onClick={()=>edit(1)}>修改照片</button></div>
    <div className="summary-photo">{photo?<img src={photo} alt="已选照片"/>:<div className="summary-placeholder"><Icon name="mine" size={28}/></div>}<div><strong>{photo?'已选择单人照片':'未选择照片'}</strong><p>{photo?'仅在当前浏览器中临时预览':'可先保留文字配置'}</p></div></div>
    <div className="notice journey-result">主题配置已完成，可以复制留存。真实生成尚未开放，不会上传照片或创建生成任务。</div>
    <div className="action-row"><button className="button" onClick={copy}><Icon name="copy" size={17}/>复制我的配置</button><button className="button secondary" disabled>生成暂未开放</button></div>
    <LinkButton to="/hall" className="text-link">更换主题 <Icon name="arrow" size={16}/></LinkButton>
   </>:null}
  </section>
  {copyState?<div className="toast" role="status">{copyState}</div>:null}
  {copyFallback?<Modal title="我的主题配置" onClose={()=>setCopyFallback(false)}><div className="copy-panel"><p>请长按或选中文字复制。摘要不包含照片。</p><textarea className="summary-text" aria-label="我的配置摘要" readOnly value={summary} rows={12}/></div><button className="button wide" onClick={()=>setCopyFallback(false)}>返回配置</button></Modal>:null}
 </section>;
}

function Gallery(){const [business,setBusiness]=useState('all');const [category,setCategory]=useState('all');const [mode,setMode]=useState('layout');const [count,setCount]=useState(6);const [active,setActive]=useState<string|null>(null);
 const liveWorks=publishedWorks.filter(w=>w.status==='published'&&w.displayAuthorized);const works=illustrativeWorks.filter(w=>(business==='all'||w.business===business)&&(category==='all'||w.categoryId===category));const filteredLive=liveWorks.filter(w=>(business==='all'||w.business===business)&&(category==='all'||w.categoryId===category)).sort((a,b)=>a.sort-b.sort);const liveWork=liveWorks.find(w=>w.id===active);const work=illustrativeWorks.find(w=>w.id===active);
 return <><section className="page-intro compact"><Eyebrow>THE VISUAL COLLECTION</Eyebrow><h1>影像作品</h1><p>在故事里看见别人，也遇见自己。</p></section><div className="gallery-controls"><div className="segmented"><button className={mode==='layout'?'active':''} onClick={()=>setMode('layout')}>布局示意</button><button className={mode==='published'?'active':''} onClick={()=>setMode('published')}>已发布作品</button></div><span className="muted">场景配图不代表真实生成作品</span></div><div className="filter-row"><button className={business==='all'?'chip active':'chip'} onClick={()=>{setBusiness('all');setCategory('all');setCount(6);}}>全部业务</button>{(['hall','bespoke'] as Business[]).map(b=><button key={b} className={business===b?'chip active':'chip'} onClick={()=>{setBusiness(b);setCategory('all');setCount(6);}}>{businessName(b)}</button>)}<label className="select-filter">分类<select aria-label="作品分类" value={category} onChange={e=>{setCategory(e.target.value);setCount(6);}}><option value="all">全部分类</option>{categories.filter(c=>business==='all'||c.business===business).map(c=><option value={c.id} key={c.id}>{c.short}</option>)}</select></label></div>
 {mode==='published'?(filteredLive.length?<><div className="masonry">{filteredLive.slice(0,count).map(w=><button className="work-card" key={w.id} onClick={()=>setActive(w.id)} aria-label={`查看作品${w.title}`}><div className="work-image"><Picture src={w.media.type==='image'?w.media.src:(w.media.poster||'')} alt={w.title}/>{w.media.type==='video'?<span className="work-open"><Icon name="play"/></span>:null}</div><div className="work-copy"><span>{businessName(w.business)}</span><h3>{w.title}</h3></div></button>)}</div><div className="load-more">{count<filteredLive.length?<button className="button secondary" onClick={()=>setCount(n=>n+6)}>加载更多</button>:<span>没有更多作品了</span>}</div></>:<Empty title="真实作品待上架">可公开展示的样品与客户作品确认后将在此发布。你可以先浏览布局示意，了解作品库的呈现方式。</Empty>):<><div className="masonry">{works.slice(0,count).map(w=><button className="work-card" key={w.id} onClick={()=>setActive(w.id)} aria-label={`查看${w.title}布局示意`}><div className="work-image"><Picture src={w.image} alt={`${w.title}布局示意`}/><span className="photo-caption">布局示意</span><span className="work-open"><Icon name="image" size={20}/></span></div><div className="work-copy"><span>{businessName(w.business)}</span><h3>{w.title}</h3><p>{categoryById.get(w.categoryId)?.short}</p></div></button>)}</div><div className="load-more">{count<works.length?<button className="button secondary" onClick={()=>setCount(n=>n+6)}>加载更多</button>:<span>已经看到全部布局示意</span>}</div></>}
 {liveWork?<Modal title={liveWork.title} onClose={()=>setActive(null)}><MediaDisplay media={liveWork.media}/><p>{businessName(liveWork.business)} · {categoryById.get(liveWork.categoryId)?.title}</p><LinkButton to={liveWork.business==='hall'?experiencePath(liveWork.categoryId,liveWork.themeId):`/category/${liveWork.categoryId}`}>{liveWork.business==='hall'?'立即体验':'咨询同类创作'}<Icon name="arrow" size={17}/></LinkButton></Modal>:null}{work?<Modal title="作品布局示意" onClose={()=>setActive(null)}><Picture src={work.image} alt={work.title} className="modal-image"/><h3>{work.title}</h3><p className="muted">此图为主题配图，用于展示作品详情布局，不是客户案例或AI生成成片。</p><LinkButton to={work.business==='hall'?experiencePath(work.categoryId,`${work.categoryId}-0`):`/category/${work.categoryId}`} className="button">{work.business==='hall'?'立即体验':'了解相关创作方向'} <Icon name="arrow" size={17}/></LinkButton></Modal>:null}</>;
}

function Cooperation({route}:{route:string}){
 const direction=new URLSearchParams(route.split('?')[1]||'').get('direction');
 const initial=categoryById.get(direction||'')?.title||'';
 const [summary,setSummary]=useState('');
 const [copyState,setCopyState]=useState('复制需求摘要');
 async function copy(){try{await navigator.clipboard.writeText(summary);setCopyState('已复制');}catch{setCopyState('请长按下方摘要手动复制');}}
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget;const data=new FormData(form);const description=String(data.get('description')||'').trim();
  if(!description){const field=form.elements.namedItem('description') as HTMLTextAreaElement;field.setCustomValidity('请简单描述你的创作需求。');field.reportValidity();return;}
  const name=String(data.get('name')||'').trim();const contact=String(data.get('contact')||'').trim();
  setSummary(['咣当 AI影像 · 创作需求','需求方向：'+data.get('direction'),'需求描述：'+description,...(name?['联系人：'+name]:[]),...(contact?['联系方式：'+contact]:[]),'','本摘要仅供复制留存，尚未发送。正式咨询渠道待开放。'].join('\n'));
  setCopyState('复制需求摘要');
 }
 return <>
  <section className="page-intro compact"><h1>整理创作需求</h1><p>想记录什么故事？先把想法整理清楚。</p></section>
  <div className="cooperate-grid">
   <p className="notice consultation-state">当前可整理并复制需求摘要，正式咨询渠道待开放。</p>
   <form className="demand-form" onSubmit={submit}>
    <div className="section-line"><h2>你的创作想法</h2></div>
    <label>需求方向<select name="direction" required defaultValue={initial}><option value="" disabled>请选择需求方向</option><optgroup label="AI影像馆">{categories.filter(c=>c.business==='hall').map(c=><option key={c.id}>{c.title}</option>)}</optgroup><optgroup label="高定AI影像">{categories.filter(c=>c.business==='bespoke').map(c=><option key={c.id}>{c.title}</option>)}</optgroup><option>尚未确定，想先了解</option></select></label>
    <label>需求描述<textarea name="description" required maxLength={2000} rows={4} placeholder="想讲述什么故事？用于什么场景？是否有预期交付时间？" onInput={e=>e.currentTarget.setCustomValidity('')}/></label>
    <div className="form-pair"><label>联系人（选填）<input name="name" maxLength={50} autoComplete="name" placeholder="怎么称呼你"/></label><label>联系方式（选填）<input name="contact" maxLength={100} placeholder="手机、邮箱或微信" autoComplete="off"/></label></div>
    <p className="field-hint">仅在本页整理，不上传、不保存。</p>
    <button type="submit" className="button wide">整理需求摘要 <Icon name="arrow" size={18}/></button>
   </form>
  </div>
  {summary?<Modal title="你的需求摘要" onClose={()=>setSummary('')}><div className="notice">摘要已整理，尚未发送。可复制留存，正式咨询渠道待开放。</div><textarea className="summary-text" readOnly value={summary} aria-label="需求摘要" rows={12}/><div className="action-row"><button className="button" onClick={copy}><Icon name="copy" size={17}/>{copyState}</button><button className="button secondary" onClick={()=>setSummary('')}>返回修改</button></div></Modal>:null}
 </>;
}

function Mine(){return <><section className="page-intro compact"><Eyebrow>YOUR STORY SPACE</Eyebrow><h1>我的</h1><p>为你的故事，留一个位置。</p></section><section className="profile-card"><div className="avatar"><Icon name="mine" size={36}/></div><div><h2>欢迎来到咣当</h2><p>当前为展示预览，尚未连接账户服务。</p></div><span className="status-tag">访客浏览</span></section><div className="mine-grid">{[{title:'我的作品',desc:'账户与作品服务接入后开放。',icon:'works'},{title:'生成记录',desc:'现有体验产品的任务记录待核实接入。',icon:'image'}].map(x=><div className="mine-item" key={x.title}><Icon name={x.icon as IconName} size={28}/><h3>{x.title}</h3><p>{x.desc}</p><span>暂未开放</span></div>)}</div><div className="content-panel"><h2>先从一段故事开始</h2><p>探索模板互动，或了解适合自己的专属影像创作。</p><div className="action-row"><LinkButton to="/hall">探索AI影像馆 <Icon name="arrow" size={17}/></LinkButton><LinkButton to="/bespoke" className="button secondary">了解高定AI影像</LinkButton></div></div></>;}

function configurationForRoute(route:string){
 const parts=route.split('?')[0].split('/').filter(Boolean);
 return parts[0]==='experience'&&parts.length<=3&&categoryById.get(parts[1])?.business==='hall'?getThemeConfiguration(parts[1],parts[2]):undefined;
}

export default function Guangdang(){
 const [route,setRoute]=useState(getRoute);
 const routeRef=useRef(route);
 const [share,setShare]=useState('');
 const [about,setAbout]=useState(false);
 const [pendingRoute,setPendingRoute]=useState<string|null>(null);
 const main=useRef<HTMLElement>(null);
 const memory=useRef<BrowsingMemory>({carouselIndices:{hall:0,bespoke:0},draft:null});
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
 useEffect(()=>{const configuration=configurationForRoute(route);const title=configuration?.title||(route.startsWith('/hall')?'AI影像馆':route.startsWith('/bespoke')?'高定AI影像':route.startsWith('/works')?'影像作品':route.startsWith('/cooperate')?'商务合作':route.startsWith('/mine')?'我的':'属于你的AI片场');document.title='咣当 AI影像 · '+title;main.current?.focus({preventScroll:true});},[route]);
 useEffect(()=>{if(!share)return;const timer=setTimeout(()=>setShare(''),3500);return()=>clearTimeout(timer);},[share]);
 async function sharePage(){try{await navigator.clipboard.writeText(window.location.href);setShare('当前页面链接已复制，可以分享给朋友。');}catch{setShare('请复制浏览器地址：'+window.location.href);}}
 function confirmThemeChange(){
  if(!pendingRoute)return;const next=pendingRoute;const photo=memory.current.draft?.value.photo;
  if(photo)URL.revokeObjectURL(photo);memory.current.draft=null;setPendingRoute(null);go(next);
 }
 const path=route.split('?')[0];const parts=path.split('/').filter(Boolean);const c=categoryById.get(parts[1]||'');
 const configuration=configurationForRoute(route);
 const active=path==='/'?'home':path==='/hall'||parts[0]==='experience'||c?.business==='hall'?'hall':path.startsWith('/cooperate')?'cooperate':path.startsWith('/mine')?'mine':'';
 let page:ReactNode;
 if(path==='/')page=<Home/>;
 else if(path==='/hall'||path==='/bespoke')page=<Catalogue key={path} business={path.slice(1) as Business} memory={memory.current}/>;
 else if(parts[0]==='category'&&c)page=<Detail key={route} category={c}/>;
 else if(parts[0]==='theme'&&c&&c.themes[Number(parts[2])])page=<Detail key={route} category={c} themeIndex={Number(parts[2])}/>;
 else if(parts[0]==='experience'&&configuration)page=<Experience key={configuration.id} theme={configuration} draft={memory.current.draft?.themeId===configuration.id?memory.current.draft.value:undefined} onDraftChange={rememberDraft}/>;
 else if(path==='/works')page=<Gallery/>;
 else if(path==='/cooperate')page=<Cooperation key={route} route={route}/>;
 else if(path==='/mine')page=<Mine/>;
 else page=<><Empty title="暂时没有这个页面">这个入口可能已经更新，可以返回首页重新探索。</Empty><LinkButton to="/">返回首页</LinkButton></>;
 return <>
  <a href="#main" className="skip-link" onClick={e=>{e.preventDefault();main.current?.focus();}}>跳到主要内容</a>
  <header className="topbar"><div className="topbar-inner">
   <a className="brand" href="#/" aria-label="咣当首页"><img className="brand-logo" src={asset('images/brand/guangdang-logo.png')} alt="咣当原品牌Logo"/><span>AI影像</span></a>
   <nav className="desktop-nav" aria-label="主导航"><a href="#/" className={active==='home'?'active':''}>首页</a><a href="#/hall" className={active==='hall'?'active':''}>主题体验</a><a href="#/cooperate" className={active==='cooperate'?'active':''}>商务合作</a><a href="#/mine" className={active==='mine'?'active':''}>我</a></nav>
   <div className="header-actions"><button className="icon-button about-button" onClick={()=>setAbout(true)} aria-label="关于原型"><Icon name="spark" size={18}/></button><button className="icon-button share-button" onClick={sharePage} aria-label="复制当前页面链接"><Icon name="copy" size={19}/></button></div>
  </div></header>
  <main id="main" data-route={path} ref={main} tabIndex={-1} key={path} className={'page-shell compact-shell '+(path==='/'?'is-home':'')+' '+(path==='/hall'||path==='/bespoke'?'is-business':'')}>
   {parts.length>0?<button className="back-button" onClick={()=>{if(parts[0]==='experience')go('/hall');else if(parts[0]==='theme')go('/category/'+c?.id);else if(parts[0]==='category')go(c?'/'+c.business:'/');else go('/');}}><Icon name="back" size={16}/>返回{parts[0]==='experience'?'AI影像馆':parts[0]==='category'?businessName(c?.business||'hall'):parts[0]==='theme'?'主题详情':'首页'}</button>:null}{page}
  </main>
  <nav className="mobile-nav" aria-label="底部导航">{([{id:'home',title:'首页',to:'/'},{id:'hall',title:'主题体验',to:'/hall'},{id:'cooperate',title:'商务合作',to:'/cooperate'},{id:'mine',title:'我',to:'/mine'}] as const).map(item=><a key={item.id} href={'#'+item.to} className={active===item.id?'active':''} aria-current={active===item.id?'page':undefined}><Icon name={item.id==='hall'?'image':item.id}/><span>{item.title}</span></a>)}</nav>
  {share?<div className="toast" role="status">{share}</div>:null}
  {about?<Modal title="关于本次改版预览" onClose={()=>setAbout(false)}><p>AI影像馆可自行配置单人主题；高定AI影像围绕专属故事整理创作需求。</p><div className="about-links"><a className="button secondary" href="#/works" onClick={()=>setAbout(false)}>影像作品示意</a><a className="button secondary" href="#/mine" onClick={()=>setAbout(false)}>我的（待开放）</a></div><p>场景配图不代表真实案例，高定样品待上架。真实生成、咨询渠道和账户服务尚未开放。</p><p className="muted">配置只在本次浏览中临时保留；确认更换主题或刷新页面会清除，不会上传照片或提交需求。</p><button className="button wide" onClick={()=>setAbout(false)}>继续浏览</button></Modal>:null}
  {pendingRoute?<Modal title="更换主题？" onClose={()=>setPendingRoute(null)}><p>更换后，当前主题的选择和本机照片将被清空。复制的文字配置可继续留存。</p><div className="action-row"><button className="button secondary" onClick={()=>setPendingRoute(null)}>保留当前配置</button><button className="button" onClick={confirmThemeChange}>更换并清空</button></div></Modal>:null}
 </>;
}
