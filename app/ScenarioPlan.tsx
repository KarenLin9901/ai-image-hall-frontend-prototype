import type { ComponentType, ReactNode } from 'react';
import { businessName } from './guangdang-data';
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

function PlanFigure({ visual, Image }: { visual: PlanVisual; Image: PictureComponent }) {
  return <figure className="soft-plan-figure"><div><Image src={visual.src} alt={visual.alt}/></div><figcaption>{visual.caption}</figcaption></figure>;
}

function FullPlan({ detail, Image }: { detail: ScenarioDetail; Image: PictureComponent }) {
  const hall = detail.business === 'hall';
  return <details className="soft-plan-details" data-testid="scenario-planning-details">
    <summary><span>查看完整策划<small>内容方向、实施步骤与合作准备</small></span><span className="soft-plan-plus" aria-hidden="true">＋</span></summary>
    <div className="soft-plan-detail-body">
      <section><h3>适用对象与场合</h3><dl className="soft-plan-facts"><div><dt>谁来发起</dt><dd>{detail.organizer}</dd></div><div><dt>{hall ? '谁来参与' : '谁参与创作'}</dt><dd>{detail.participants}</dd></div><div><dt>用在哪里</dt><dd>{detail.setting}</dd></div></dl></section>
      <section><h3>方案亮点</h3><div className="soft-plan-text-grid">{detail.highlights.map(item => <div key={item.title}><h4>{item.title}</h4><p>{item.description}</p></div>)}</div></section>
      <section><h3>{hall ? '共同主题，个人表达' : '确认方向，共同创作'}</h3><p>{detail.mechanic.description}</p><div className="soft-plan-text-grid"><div><h4>{hall ? '项目方先确定' : '委托方先确认'}</h4><ul>{detail.mechanic.fixed.map(item => <li key={item}>{item}</li>)}</ul></div><div><h4>{hall ? '个人可以表达' : '参与者与团队协同'}</h4><ul>{detail.mechanic.personal.map(item => <li key={item}>{item}</li>)}</ul></div></div></section>
      <section><h3>内容如何展开</h3><ol className="soft-plan-story">{detail.narrative.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h4>{item.title}</h4><p>{item.description}</p></div></li>)}</ol></section>
      <section><h3>{hall ? '活动可设计哪些选择' : '可以讨论的创作方向'}</h3><p>以下用于说明方案，具体内容按项目确认。</p><div className="soft-plan-choice-reference">{detail.choices.map(group => <div key={group.id}><h4>{group.title}</h4><p>{group.meaning}</p><dl>{group.options.map(option => <div key={option.id}><dt>{option.label}</dt><dd>{option.meaning}<br/>{option.result}</dd></div>)}</dl></div>)}</div><PlanFigure visual={detail.visuals.detail} Image={Image}/></section>
      <section><h3>{hall ? '参与者怎样完成体验' : '从委托到交付'}</h3><ol className="soft-plan-story">{detail.journey.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h4>{item.title}</h4><p>{item.description}</p></div></li>)}</ol></section>
      <section><h3>成果包含什么</h3><div className="soft-plan-text-grid">{detail.outputs.map(output => <div key={output.recipient}><h4>{output.recipient} · {output.title}</h4><ul>{output.items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div><PlanFigure visual={detail.visuals.outcome} Image={Image}/></section>
      <section><h3>成果范围与待确认事项</h3><p>{detail.scope.core}</p><div className="soft-plan-text-grid"><div><h4>按需讨论，不默认包含</h4><ul>{detail.scope.optional.map(item => <li key={item}>{item}</li>)}</ul></div><div><h4>项目开始前确认</h4><ul>{detail.scope.pending.map(item => <li key={item}>{item}</li>)}</ul></div></div></section>
      <section><h3>合作前准备</h3><ul>{detail.preparation.map(item => <li key={item}>{item}</li>)}</ul></section>
    </div>
  </details>;
}

function ScenarioPage({ detail, Image, inquiryTo, experienceTo, relatedContent }: Omit<Props, 'categoryId'> & { detail: ScenarioDetail }) {
  const plan = editorialPlans[detail.id];
  const hall = detail.business === 'hall';
  return <article className="soft-plan" data-plan={detail.id} data-business={detail.business}>
    <header className="soft-plan-hero">
      <div className="soft-plan-hero-image"><Image src={detail.visuals.hero.src} alt={detail.visuals.hero.alt} eager/></div>
      <span className="soft-plan-status">方案示例</span>
      <div className="soft-plan-hero-copy"><p>{businessName(detail.business)}</p><h1>{plan.title}</h1><p className="soft-plan-lead">{detail.lead}</p><a className="ux-plan-action" href={'#'+inquiryTo}>整理这类项目需求<span aria-hidden="true">↗</span></a></div>
    </header>
    <div className="soft-plan-panel">
      <section className="soft-plan-overview" aria-labelledby={detail.id + '-idea'}>
        <p className="soft-plan-eyebrow">{hall ? '活动怎样发生' : '故事怎样展开'}</p><h2 id={detail.id + '-idea'}>{detail.mechanic.title}</h2><p className="soft-plan-intro">{detail.objective}</p>
        <ol className="soft-plan-flow" data-testid="scenario-flow" aria-label="方案流程">{scenarioFlow[detail.id].map(node => <li key={node.label}><FlowIcon name={node.icon}/><strong>{node.label}</strong><span>{node.actor}</span></li>)}</ol>
        <p className="soft-plan-audience">{scenarioTags[detail.id].join(' · ')}</p>
      </section>
      <section className="soft-plan-outcomes" aria-label="方案成果">
        {detail.outputs.map((output, index) => <div key={output.recipient} data-testid={index === 0 ? 'scenario-user-outcome' : 'scenario-business-outcome'}><span className="soft-plan-eyebrow">{output.recipient}</span><h3>{output.title}</h3><p>{output.value}</p></div>)}
      </section>
      <FullPlan detail={detail} Image={Image}/>
      <section className="soft-plan-cooperate"><p className="soft-plan-eyebrow">让方案成为你的项目</p><h2>{hall ? '从你的活动出发。' : '从你的故事出发。'}</h2><p>{hall ? '一起确认参与方式与成果。' : '团队了解资料与用途后，确认方案和报价。'}</p><div className="soft-plan-actions"><a className="soft-plan-button" href={'#' + inquiryTo}>整理这类项目需求<span aria-hidden="true">↗</span></a>{hall ? <a className="soft-plan-link" data-testid="plan-experience-link" href={experienceTo || '#' + experiencePathFor('template', '/category/' + detail.id)}>体验通用玩法<span aria-hidden="true">→</span></a> : null}</div><p className="soft-plan-note">{plan.planned ? '退休主题为策划示例，专属体验设置尚未开放。' : '方案与配图仅供参考，不代表已交付案例。'}{hall ? '活动生成与领取按项目接入。' : '高定由团队创作、按需求报价。'}当前需求仅在本机整理与复制，尚未发送。</p></section>
      {relatedContent ? <div className="soft-plan-related">{relatedContent}</div> : null}
    </div>
  </article>;
}

export default function ScenarioPlan({ categoryId, ...props }: Props) {
  const detail = scenarioPlans[categoryId as ScenarioId];
  if (!detail) return null;
  return <ScenarioPage key={detail.id} detail={detail} {...props}/>;
}
