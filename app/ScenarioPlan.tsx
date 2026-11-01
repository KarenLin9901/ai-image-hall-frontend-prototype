import { useState, type ComponentType, type ReactNode } from 'react';
import { PlanNavigation } from './BrandScenario';
import { businessName, experiencePath } from './guangdang-data';
import { editorialPlans } from './mobile-editorial-data';
import { experiencePathFor } from './experience-navigation';
import { scenarioPlans } from './scenario-plans';
import type { PlanVisual, ScenarioDetail, ScenarioId } from './scenario-plan-types';

type PictureComponent = ComponentType<{ src: string; alt: string; className?: string; eager?: boolean }>;
type Props = { categoryId: string; Image: PictureComponent; inquiryTo: string; experienceTo?: string; relatedContent?: ReactNode };

type FlowIconName = 'calendar' | 'spark' | 'video' | 'archive' | 'heart' | 'gift' | 'school' | 'map' | 'person' | 'timeline' | 'photos' | 'book' | 'folder' | 'screen' | 'pin' | 'layers';
type FlowNode = { icon: FlowIconName; label: string; actor: string };
const scenarioFlow: Record<ScenarioId, FlowNode[]> = {
  event: [{ icon: 'calendar', label: '选活动主题', actor: '主办方设定' }, { icon: 'spark', label: '定个人高光', actor: '参与者选择' }, { icon: 'video', label: '带走活动短片', actor: '个人纪念' }],
  team: [{ icon: 'archive', label: '整理岗位记忆', actor: '单位与本人' }, { icon: 'heart', label: '写下致谢愿景', actor: '个人表达' }, { icon: 'gift', label: '留下退休纪念', actor: '纪念活动与留存' }],
  campus: [{ icon: 'school', label: '确定届别主题', actor: '学校或社群' }, { icon: 'map', label: '选择校园记忆', actor: '毕业生表达' }, { icon: 'video', label: '留下毕业影像', actor: '专属青春纪念' }],
  person: [{ icon: 'person', label: '核对人物经历', actor: '人物与资料方' }, { icon: 'timeline', label: '确认叙事视角', actor: '委托方与团队' }, { icon: 'video', label: '创作人物影片', actor: '制作与审片' }],
  family: [{ icon: 'photos', label: '汇集家庭资料', actor: '家人共同提供' }, { icon: 'heart', label: '串联跨代记忆', actor: '团队梳理创作' }, { icon: 'book', label: '交付家庭影片', actor: '纪念与家庭留存' }],
  enterprise: [{ icon: 'folder', label: '梳理企业档案', actor: '项目方核实' }, { icon: 'timeline', label: '聚焦人和事件', actor: '团队组织叙事' }, { icon: 'screen', label: '交付周年影片', actor: '活动与约定传播' }],
  city: [{ icon: 'pin', label: '核对地方资料', actor: '资料方核实' }, { icon: 'layers', label: '确认街区叙事', actor: '团队策划重现' }, { icon: 'screen', label: '制作城市影片', actor: '展陈与公共文化' }],
};
const scenarioTags: Record<ScenarioId, string[]> = {
  event: ['品牌／会务机构', '签到区与活动现场'],
  team: ['企业／工会', '退休欢送与纪念'],
  campus: ['学校／结业社群', '毕业季与结业活动'],
  person: ['企业／人物所属机构', '表彰与职业纪念'],
  family: ['工会／家庭服务机构', '家庭关怀与团聚纪念'],
  enterprise: ['企业品牌／文化团队', '周年与内部文化'],
  city: ['文化／文旅机构', '展陈与公共文化'],
};
function FlowIcon({ name }: { name: FlowIconName }) {
  const paths: Record<FlowIconName, ReactNode> = {
    calendar: <><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 10h16m-12 4h2m4 0h2m-8 3h2"/></>,
    spark: <><path d="m12 3 2.8 6.2L21 12l-6.2 2.8L12 21l-2.8-6.2L3 12l6.2-2.8Z"/><path d="m19 3 .6 1.4L21 5l-1.4.6L19 7l-.6-1.4L17 5l1.4-.6Z"/></>,
    video: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/></>,
    archive: <><path d="M4 9h16v11H4Z"/><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M9 13h6m-5 3h4"/></>,
    heart: <path d="M20.8 5.8a5.1 5.1 0 0 0-7.2 0L12 7.4l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8a5.1 5.1 0 0 0 0-7.2Z"/>,
    gift: <><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13m0-13C5 8 5 2 8.2 3 11 3.8 12 8 12 8Zm0 0s1-4.2 3.8-5C19 2 19 8 12 8Z"/></>,
    school: <><path d="m2 8 10-5 10 5-10 5Zm4 3v6c4 3 8 3 12 0v-6M22 8v8"/></>,
    map: <><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/></>,
    person: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    timeline: <><path d="M6 4v16m4-15h10m-10 7h7m-7 7h10"/><circle cx="6" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="6" cy="19" r="2"/></>,
    photos: <><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v13a1 1 0 0 0 1 1h13m-11-7 4-4 3 3 3-3 5 5"/><circle cx="16" cy="7" r="1"/></>,
    book: <><path d="M12 6C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/><path d="M5 8h3m8 0h3M5 12h3m8 0h3"/></>,
    folder: <><path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M7 12h10m-10 4h7"/></>,
    screen: <><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M12 16v5m-5 0h10m-7-14 5 3-5 3Z"/></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    layers: <><path d="m3 7 9-4 9 4-9 4Zm0 5 9 4 9-4M3 17l9 4 9-4"/></>,
  };
  return <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function PlanFigure({ visual, Image, className = '', eager = false }: { visual: PlanVisual; Image: PictureComponent; className?: string; eager?: boolean }) {
  return <figure className={`sp-visual ${className}`}><div className="sp-visual-frame"><Image src={visual.src} alt={visual.alt} eager={eager}/></div><figcaption>{visual.caption}</figcaption></figure>;
}

function jumpTo(id: string) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('motion-paused') ? 'instant' : 'smooth' });
  target?.focus({ preventScroll: true });
}

function PlanChoices({ detail, Image }: { detail: ScenarioDetail; Image: PictureComponent }) {
  const [selected, setSelected] = useState<Record<string, string>>(() => Object.fromEntries(detail.choices.map(group => [group.id, group.options[0].id])));
  const selection = detail.choices.map(group => ({ group, option: group.options.find(option => option.id === selected[group.id]) || group.options[0] }));
  const summaryId = detail.id + '-combination';
  return <div className="sp-config" data-testid="scenario-configurator">
    <div className="sp-config-controls">
      {selection.map(({ group, option }, index) => <fieldset className="sp-choice-group" key={group.id} data-testid={'scenario-group-' + group.id}>
        <legend><span className="sp-number">0{index + 1}</span>{group.title}<span className="sp-choice-rule">选 1 项</span></legend>
        <div className="sp-options" role="group" aria-label={group.title} aria-describedby={`${detail.id}-${group.id}-meaning`}>
          {group.options.map(item => <button type="button" key={item.id} data-testid={`scenario-option-${group.id}-${item.id}`} aria-pressed={option.id === item.id} onClick={() => setSelected(current => ({ ...current, [group.id]: item.id }))}>{item.label}<span className="sp-option-check" aria-hidden="true">{option.id === item.id ? '✓' : ''}</span></button>)}
        </div>
        <p className="sp-choice-meaning" id={`${detail.id}-${group.id}-meaning`} aria-live="polite">{option.meaning}</p>
      </fieldset>)}
      <button className="sp-summary-jump" type="button" onClick={() => jumpTo(summaryId)}>看看这一组选择会得到什么 <span aria-hidden="true">↓</span></button>
    </div>
    <aside className="sp-combination" id={summaryId} tabIndex={-1} aria-label="当前方案组合示意" data-testid="scenario-combination">
      <PlanFigure visual={detail.visuals.detail} Image={Image} className="sp-combination-visual"/>
      <div className="sp-combination-copy"><p className="sp-eyebrow">当前组合 · 内容示意</p><h3>{detail.business === 'hall' ? '你的选择，怎样进入影像。' : '这些选择，怎样影响创作。'}</h3>
        <ol className="sp-selection-results" data-testid="scenario-selection-results">{selection.map(({ group, option }) => <li key={group.id}><strong>{option.label}</strong><p>{option.result}</p></li>)}</ol>
        <p className="sp-local-note">{detail.business === 'hall' ? '此处仅说明方案组合，不生成影片，也不改动体验草稿。' : '此处仅预览创作方向；正式内容由团队结合资料确认。'}</p>
      </div>
    </aside>
  </div>;
}

function ScenarioPage({ detail, Image, inquiryTo, experienceTo, relatedContent }: Omit<Props, 'categoryId'> & { detail: ScenarioDetail }) {
  const plan = editorialPlans[detail.id];
  const hall = detail.business === 'hall';
  const flow = scenarioFlow[detail.id];
  const ids = { audience: detail.id + '-audience', options: detail.id + '-options', outcome: detail.id + '-outcome', cooperate: detail.id + '-cooperate' };
  return <article className="application-detail mobile-editorial-plan sp-plan" data-plan={detail.id} data-business={detail.business}>
    <header className="sp-hero">
      <p className="sp-eyebrow">{businessName(detail.business)} / 方案示例</p><h1>{plan.title}</h1><p className="sp-lead">{detail.lead}</p>
      <PlanFigure visual={detail.visuals.hero} Image={Image} className="sp-hero-visual" eager/>
    </header>
    <PlanNavigation items={[{ id: ids.audience, title: '策划思路' }, { id: ids.options, title: hall ? '用户选择' : '创作选择' }, { id: ids.outcome, title: '成果价值' }, { id: ids.cooperate, title: '如何合作' }]}/>

    <section id={ids.audience} className="sp-section sp-overview" tabIndex={-1}>
      <p className="sp-eyebrow">01 / 策划思路</p><h2>{detail.mechanic.title}</h2><p className="sp-section-intro">{detail.objective}</p>
      <div className="sp-mechanic" aria-label={flow.map(node => node.label).join('，然后')}>
        <ol className="sp-flow" data-testid="scenario-flow">{flow.map(node => <li key={node.label}><span className="sp-flow-icon"><FlowIcon name={node.icon}/></span><strong>{node.label}</strong><small>{node.actor}</small></li>)}</ol>
        <ul className="sp-context-tags" aria-label="适用对象与场合">{scenarioTags[detail.id].map(tag => <li key={tag}>{tag}</li>)}</ul>
      </div>
      <details className="sp-fold sp-planning-details" data-testid="scenario-planning-details"><summary>展开完整策划<span className="sp-fold-hint">亮点 · 内容结构 · 实施步骤</span><span className="sp-plus" aria-hidden="true">＋</span></summary>
        <div className="sp-fold-body">
          <p className="sp-mechanic-explainer">{detail.mechanic.description}</p>
          <section className="sp-detail-block"><h3>适用对象与场合</h3><dl className="sp-project-facts"><div><dt>谁来发起</dt><dd>{detail.organizer}</dd></div><div><dt>{hall ? '谁来参与' : '谁参与创作'}</dt><dd>{detail.participants}</dd></div><div><dt>用在哪里</dt><dd>{detail.setting}</dd></div></dl></section>
          <section className="sp-detail-block"><h3>这套方案的亮点</h3><div className="sp-highlights">{detail.highlights.map(item => <article key={item.title}><h4>{item.title}</h4><p>{item.description}</p></article>)}</div></section>
          <section className="sp-detail-block"><h3>{hall ? '哪些统一，哪些由个人表达' : '哪些先确定，哪些共同创作'}</h3><div className="sp-boundaries"><div><h4>{hall ? '项目方先确定' : '委托方先确认'}</h4><ul>{detail.mechanic.fixed.map(item => <li key={item}>{item}</li>)}</ul></div><div><h4>{hall ? '个人可以表达' : '参与者与团队协同'}</h4><ul>{detail.mechanic.personal.map(item => <li key={item}>{item}</li>)}</ul></div></div></section>
          <section className="sp-detail-block"><h3>内容如何展开</h3><ol className="sp-narrative" aria-label="方案内容结构">{detail.narrative.map((item, index) => <li key={item.title}><span className="sp-number">0{index + 1}</span><div><h4>{item.title}</h4><p>{item.description}</p></div></li>)}</ol></section>
          <section className="sp-detail-block"><h3>{hall ? '参与者怎样完成体验' : '从委托到交付，怎样推进'}</h3><ol className="sp-journey" aria-label={hall ? '方案参与流程' : '方案创作流程'}>{detail.journey.map((item, index) => <li key={item.title}><span className="sp-number">0{index + 1}</span><div><h4>{item.title}</h4><p>{item.description}</p></div></li>)}</ol></section>
        </div>
      </details>
    </section>

    <section id={ids.options} className="sp-section sp-choice-section" tabIndex={-1}>
      <p className="sp-eyebrow">02 / {hall ? '用户选择' : '创作选择'}</p><h2>{hall ? '换个选择，看懂不同的成果。' : '换个侧重，看清创作方向。'}</h2>
      {plan.planned ? <p className="sp-planned-note">退休主题为策划示例，专属体验设置尚未开放。</p> : null}
      <PlanChoices detail={detail} Image={Image}/>
    </section>

    <section id={ids.outcome} className="sp-section sp-outcome" tabIndex={-1}>
      <p className="sp-eyebrow">03 / 成果与价值</p><h2>{hall ? <><span>参与者带走纪念，</span><span>项目方留下内容。</span></> : <><span>故事被看见，</span><span>成果有明确用途。</span></>}</h2>
      <PlanFigure visual={detail.visuals.outcome} Image={Image} className="sp-outcome-visual"/>
      <div className="sp-output-grid">{detail.outputs.map((output, index) => <article key={output.recipient} data-testid={index === 0 ? 'scenario-user-outcome' : 'scenario-business-outcome'}><span className="sp-recipient">{output.recipient}</span><h3>{output.title}</h3><details className="sp-delivery-details" data-testid={index === 0 ? 'scenario-user-items' : 'scenario-business-items'}><summary aria-label={output.recipient + '：包含什么'}>包含什么<span aria-hidden="true">＋</span></summary><ul>{output.items.map(item => <li key={item}>{item}</li>)}</ul></details><p className="sp-output-value"><strong>{index === 0 ? '为什么值得留下' : '对项目方的价值'}</strong>{output.value}</p></article>)}</div>
    </section>

    <section id={ids.cooperate} className="sp-section sp-cooperate" tabIndex={-1}>
      <p className="sp-eyebrow">04 / 如何合作</p><h2>把方案，落到你的具体需求。</h2>
      <details className="sp-fold sp-scope-details"><summary>成果范围与待确认事项<span className="sp-plus" aria-hidden="true">＋</span></summary><div className="sp-fold-body sp-boundaries"><p className="sp-scope-core"><span>核心成果</span>{detail.scope.core}</p><div><h3>按需讨论，不默认包含</h3><ul>{detail.scope.optional.map(item => <li key={item}>{item}</li>)}</ul></div><div><h3>项目开始前确认</h3><ul>{detail.scope.pending.map(item => <li key={item}>{item}</li>)}</ul></div></div></details>
      <details className="sp-fold sp-preparation"><summary>准备哪些资料<span className="sp-plus" aria-hidden="true">＋</span></summary><div className="sp-fold-body"><p>{hall ? '先确认活动对象、参与方式和期望成果，再确定配置、制作与交付。' : '先提供故事线索与使用需求，团队沟通后确认范围与报价。'}</p><ul>{detail.preparation.map(item => <li key={item}>{item}</li>)}</ul></div></details>
      <div className="application-actions me-plan-actions sp-actions"><a className="button scene-cta" href={'#' + inquiryTo}>{hall ? '咨询同类项目' : '咨询定制'}<span aria-hidden="true">→</span></a>{hall && !plan.planned ? <a className="button secondary" data-testid="plan-experience-link" href={experienceTo || '#' + experiencePathFor('template', '/category/' + detail.id)}>查看通用玩法演示<span aria-hidden="true">→</span></a> : <a className="button secondary" href={`#/samples/${detail.business}?category=${detail.id}`}>{hall ? '查看样片状态' : '查看样品状态'}</a>}</div>
      <p className="sp-local-note">{hall ? '本页为方案示例，真实活动生成与领取需按项目接入。' : '高定按需求报价，由团队创作；正式样品待上架。'}咨询当前仅在本机整理、复制，尚未发送。</p>
      {hall && plan.themeId ? <details className="sp-fold sp-legacy-fold"><summary>早期主题配置参考<span className="sp-plus" aria-hidden="true">＋</span></summary><div className="sp-fold-body"><p>保留原有设定供参考，与上方方案图解及通用玩法演示分开。</p><a className="text-link" href={'#' + experiencePath(detail.id, plan.themeId)}>查看原有配置预览 →</a><a className="text-link" href={`#/samples/${detail.business}?category=${detail.id}`}>查看样片状态 →</a></div></details> : null}
    </section>
    {relatedContent}
  </article>;
}

export default function ScenarioPlan({ categoryId, ...props }: Props) {
  const detail = scenarioPlans[categoryId as ScenarioId];
  if (!detail) return null;
  return <ScenarioPage key={detail.id} detail={detail} {...props}/>;
}
