import { experiencePathFor, experienceReturnFor } from './experience-navigation';
import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import {
  experienceActionSuggestions,
  experienceIdentities,
  experienceScenes,
  experienceTemplates,
  type ExperienceMode,
} from './experience-center-data';

type ExperienceStep = 0 | 1 | 2;
export type ExperienceDraft = {
  step: ExperienceStep;
  templateId: string;
  identity: string;
  sceneId: string;
  action: string;
  photo: string;
  authorized: boolean;
};
export type ExperienceMemory = {
  mode: ExperienceMode;
  drafts: Record<ExperienceMode, ExperienceDraft>;
};

export function createExperienceMemory(): ExperienceMemory {
  return {
    mode: 'template',
    drafts: {
      template: { step: 0, templateId: '', identity: '', sceneId: '', action: '', photo: '', authorized: false },
      custom: { step: 0, templateId: '', identity: '', sceneId: '', action: '', photo: '', authorized: false },
    },
  };
}

export function releaseExperienceMemory(memory: ExperienceMemory) {
  for (const draft of Object.values(memory.drafts)) {
    if (draft.photo) URL.revokeObjectURL(draft.photo);
    draft.photo = '';
    draft.authorized = false;
  }
}

type PictureProps = { src: string; alt: string; className?: string; eager?: boolean };
type ExperienceCenterProps = {
  route: string;
  memory: ExperienceMemory;
  Image: ComponentType<PictureProps>;
  backLabel?: string;
  onBack?: () => void;
  onConsult?: () => void;
};

const steps = ['内容设定', '准备素材', '确认创作'];
const modes: ExperienceMode[] = ['template', 'custom'];
function requestedMode(route: string): ExperienceMode | undefined {
  const value = new URLSearchParams(route.split('?')[1] || '').get('mode');
  return value === 'template' || value === 'custom' ? value : undefined;
}
function Arrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
}
function Check() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

export default function ExperienceCenter({ route, memory, Image: Picture, backLabel, onBack, onConsult }: ExperienceCenterProps) {
  const [mode, setMode] = useState<ExperienceMode>(() => requestedMode(route) || memory.mode);
  const [, setRevision] = useState(0);
  const [copyState, setCopyState] = useState('');
  const [copyFallback, setCopyFallback] = useState(false);
  const [copySummary, setCopySummary] = useState('');
  const copyVersion = useRef(0);
  const alive = useRef(true);
  const checks = useRef<Record<ExperienceMode, { version: number; pending: string; error: string }>>({ template: { version: 0, pending: '', error: '' }, custom: { version: 0, pending: '', error: '' } });
  const stageHeading = useRef<HTMLHeadingElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const copyDialog = useRef<HTMLDialogElement>(null);
  const copyReturnFocus = useRef<Element | null>(null);
  const draft = memory.drafts[mode];
  const selectedTemplate = experienceTemplates.find(item => item.id === draft.templateId) || experienceTemplates[0];
  const identity = mode === 'template' ? selectedTemplate.identity : experienceIdentities.find(item => item.id === draft.identity)?.label || '';
  const selectedScene = experienceScenes.find(item => item.id === draft.sceneId);
  const scene = mode === 'template' ? selectedTemplate.scene : selectedScene?.label || '';
  const action = mode === 'template' ? selectedTemplate.action : draft.action;
  const image = mode === 'template' ? selectedTemplate.image : selectedScene?.image || experienceTemplates[0].image;
  const contentReady = mode === 'template' ? experienceTemplates.some(item => item.id === draft.templateId) : Boolean(identity && scene && action.trim());
  const checkingPhoto = Boolean(checks.current[mode].pending);
  const photoReady = !checkingPhoto && (!draft.photo || draft.authorized);
  const summary = [
    '咣当 AI影像 · 我的体验配置',
    '玩法：' + (mode === 'template' ? '模板体验' : '自定义体验'),
    ...(mode === 'template' ? ['设定模板：' + selectedTemplate.title] : []),
    '身份：' + identity,
    '场景：' + scene,
    '做什么：' + action.trim(),
    '照片：' + (draft.photo ? '已选，仅本机预览，复制内容不含照片' : '未选择照片'),
    '生成服务待接入；此配置未上传，不会创建生成任务。',
  ].join('\n');

  function redraw() { if (alive.current) setRevision(value => value + 1); }
  function invalidateCopy() {
    copyVersion.current += 1;
    setCopyState('');
    setCopyFallback(false);
    setCopySummary('');
  }
  function cancelPhotoCheck(target: ExperienceMode, update = true) {
    const check = checks.current[target];
    check.version += 1;
    if (check.pending) URL.revokeObjectURL(check.pending);
    check.pending = '';
    if (update) redraw();
  }
  function changeMode(next: ExperienceMode, updateAddress = true) {
    if (next === mode) return;
    cancelPhotoCheck(mode, false);
    if (photoInput.current) photoInput.current.value = '';
    memory.mode = next;
    setMode(next);
    invalidateCopy();
    if (updateAddress) {
      const params = new URLSearchParams(route.split('?')[1] || '');
      window.location.hash = experiencePathFor(next, params.has('returnTo') || params.get('source') === 'brand' ? experienceReturnFor(route).to : undefined);
    }
  }
  function changeStep(next: ExperienceStep) {
    if (next === 1 && !contentReady || next === 2 && (!contentReady || !photoReady)) return;
    if (next !== 1) cancelPhotoCheck(mode, false);
    draft.step = next;
    checks.current[mode].error = '';
    invalidateCopy();
    redraw();
  }
  function chooseTemplate(id: string) {
    const template = experienceTemplates.find(item => item.id === id);
    if (!template) return;
    invalidateCopy();
    Object.assign(memory.drafts.template, { templateId: template.id, identity: template.identity, sceneId: experienceScenes.find(item => item.label === template.scene)?.id || '', action: template.action, step: 1 });
    redraw();
  }
  function removePhoto() {
    cancelPhotoCheck(mode, false);
    checks.current[mode].error = '';
    if (draft.photo) URL.revokeObjectURL(draft.photo);
    draft.photo = '';
    draft.authorized = false;
    if (photoInput.current) photoInput.current.value = '';
    redraw();
  }
  async function choosePhoto(file: File, input: HTMLInputElement) {
    const target = mode;
    const targetDraft = memory.drafts[target];
    const check = checks.current[target];
    cancelPhotoCheck(target, false);
    check.error = '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      input.value = '';
      check.error = '请选择10MB以内的JPG、PNG或WebP照片。';
      redraw();
      return;
    }
    const version = check.version;
    const url = URL.createObjectURL(file);
    check.pending = url;
    redraw();
    try {
      const photo = new window.Image();
      photo.src = url;
      await photo.decode();
      if (!photo.naturalWidth || !photo.naturalHeight) throw new Error('Invalid image');
      if (check.version !== version || !alive.current) return;
      check.pending = '';
      if (targetDraft.photo) URL.revokeObjectURL(targetDraft.photo);
      targetDraft.photo = url;
      targetDraft.authorized = false;
    } catch {
      if (check.version === version && alive.current) {
        input.value = '';
        check.error = '这张照片无法读取，请重新选择一张有效图片。';
      }
    } finally {
      if (check.pending === url) {
        URL.revokeObjectURL(url);
        check.pending = '';
      }
      if (check.version === version) redraw();
    }
  }
  async function copy() {
    const version = ++copyVersion.current;
    const snapshot = summary;
    const returnFocus = document.activeElement;
    setCopyState('');
    setCopyFallback(false);
    try {
      await navigator.clipboard.writeText(snapshot);
      if (alive.current && version === copyVersion.current) setCopyState('配置已复制');
    } catch {
      if (!alive.current || version !== copyVersion.current) return;
      copyReturnFocus.current = returnFocus;
      setCopySummary(snapshot);
      setCopyFallback(true);
    }
  }

  useLayoutEffect(() => () => { copyVersion.current += 1; }, []);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      for (const target of modes) cancelPhotoCheck(target, false);
    };
  }, []);
  const routeMode = requestedMode(route);
  useLayoutEffect(() => {
    if (routeMode && routeMode !== mode) changeMode(routeMode, false);
  }, [routeMode]);
  useLayoutEffect(() => { memory.mode = mode; }, [memory, mode]);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    stageHeading.current?.focus({ preventScroll: true });
  }, [mode, draft.step]);
  useEffect(() => {
    if (!copyState) return;
    const timer = window.setTimeout(() => setCopyState(''), 3500);
    return () => window.clearTimeout(timer);
  }, [copyState]);
  useLayoutEffect(() => {
    if (!copyFallback) return;
    const dialog = copyDialog.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      requestAnimationFrame(() => {
        const target = copyReturnFocus.current;
        if (target instanceof HTMLElement && target.isConnected) target.focus({ preventScroll: true });
      });
    };
  }, [copyFallback]);

  return <section className="ec-shell ec-center" data-testid="experience-center" data-initial-template={mode === 'template' && draft.step === 0 && !contentReady ? 'true' : undefined} aria-label="AI影像馆体验中心">
    <header className="ec-heading">
      <p className="ec-eyebrow">AI影像馆 · 能力体验</p>
      <h1 ref={draft.step === 0 ? stageHeading : undefined} tabIndex={-1}>{draft.step === 0 ? mode === 'template' ? '选一套喜欢的模板' : '这段情节，由你来写。' : '让你的设定，成为影像。'}</h1>
      <p>{mode === 'template' ? '身份、场景和行为已设定，选择喜欢的故事。' : '选好身份与场景，再写下你想做的事。'}</p>
    </header>

    <div className="ec-mode-tabs" role="group" aria-label="体验玩法">
      <button type="button" data-testid="ec-mode-template" aria-pressed={mode === 'template'} onClick={() => changeMode('template')}><strong>模板体验</strong><span>设定好了，直接用</span></button>
      <button type="button" data-testid="ec-mode-custom" aria-pressed={mode === 'custom'} onClick={() => changeMode('custom')}><strong>自定义体验</strong><span>怎么演，由你来写</span></button>
    </div>
    <p className="ec-demo-context">体验用户如何参与。这里展示通用玩法，具体活动的内容与交付按项目配置。</p>
    <p className="ec-service-state" role="status">{mode === 'template' && draft.step === 0 ? '本机设定预览 · 生成服务待接入。' : '当前可预览设定、准备本机素材并复制配置。生成服务待接入。'}</p>
    <nav className="ec-steps" aria-label="创作步骤">{steps.map((label, index) => <button type="button" key={label} data-testid={'ec-step-' + index} aria-current={draft.step === index ? 'step' : undefined} disabled={index === 1 ? !contentReady : index === 2 ? !contentReady || !photoReady : false} onClick={() => changeStep(index as ExperienceStep)}><b>{index + 1}</b><span>{label}</span></button>)}</nav>

    {draft.step === 0 && mode === 'template' ? <div className="ec-template-grid">
      {experienceTemplates.map((template, index) => <article className={'ec-template' + (draft.templateId === template.id ? ' ec-template-selected' : '')} data-testid={'ec-template-' + template.id} key={template.id}>
        <div className="ec-template-media"><Picture src={template.image} alt={template.scene + '设定画面参考'} eager={index === 0} /><span>设定画面参考</span></div>
        <div className="ec-template-copy"><div className="ec-card-heading"><h2>{template.title}</h2><span className="ec-badge">{draft.templateId === template.id ? <><Check />已选模板</> : '整套设定'}</span></div><p className="ec-template-description">{template.description}</p>
          <dl className="ec-template-facts"><div><dt>身份</dt><dd>{template.identity}</dd></div><div><dt>场景</dt><dd>{template.scene}</dd></div><div><dt>行为</dt><dd>{template.action}</dd></div></dl>
          <button type="button" className="ec-btn ec-btn-primary" data-testid={'ec-use-' + template.id} onClick={() => chooseTemplate(template.id)}>使用这个模板<Arrow /></button>
        </div>
      </article>)}
    </div> : null}

    {draft.step === 0 && mode === 'custom' ? <div className="ec-custom-editor">
      <fieldset className="ec-field"><legend><span>01</span>你想成为谁</legend><div className="ec-identity-options">{experienceIdentities.map(item => <button type="button" className="ec-choice" data-testid={'ec-identity-' + item.id} key={item.id} aria-pressed={draft.identity === item.id} onClick={() => { draft.identity = item.id; redraw(); }}><strong>{item.label}</strong><span>{item.description}</span>{draft.identity === item.id ? <Check /> : null}</button>)}</div></fieldset>
      <fieldset className="ec-field"><legend><span>02</span>这段故事发生在哪里</legend><div className="ec-scene-options">{experienceScenes.map(item => <button type="button" className="ec-choice ec-scene-choice" data-testid={'ec-scene-' + item.id} aria-pressed={draft.sceneId === item.id} key={item.id} onClick={() => { draft.sceneId = item.id; redraw(); }}><div className="ec-scene-image"><Picture src={item.image} alt={item.label + '画面参考'} /></div><strong>{item.label}{draft.sceneId === item.id ? <Check /> : null}</strong><span>画面参考</span></button>)}</div></fieldset>
      <div className="ec-field"><label className="ec-field-label" htmlFor="ec-custom-action"><span>03</span>你想在这里做什么</label><div className="ec-action-suggestions" aria-label="行为建议">{experienceActionSuggestions.map((item, index) => <button type="button" key={item.label} data-testid={'ec-suggestion-' + index} onClick={() => { draft.action = item.text; redraw(); }}>{item.label}</button>)}</div><textarea id="ec-custom-action" data-testid="ec-action" aria-label="你想在这里做什么" value={draft.action} rows={4} placeholder="例如：走上观景步道，向镜头挥手，再转身望向远方。" onChange={event => { draft.action = event.currentTarget.value; redraw(); }} /><p className="ec-field-help">可以点上方建议，再按自己的想法修改。这里只保存本次浏览的文字。</p></div>
      <div className="ec-selection-status" aria-live="polite">{identity || '待选择身份'}<span> · </span>{scene || '待选择场景'}</div>
      <button type="button" className="ec-btn ec-btn-primary" data-testid="ec-to-materials" disabled={!contentReady} onClick={() => changeStep(1)}>下一步：准备素材<Arrow /></button>
      {!contentReady ? <p className="ec-field-help">选好身份与场景，并写下你想做的事。</p> : null}
    </div> : null}

    {draft.step === 1 ? <section className="ec-stage-panel" aria-label="准备素材">
      <h2 ref={stageHeading} tabIndex={-1}>准备主角照片</h2><p className="ec-stage-intro">照片选填，仅在本机预览；当前不会上传。</p>
      <div className="ec-mini-summary" data-testid="ec-summary"><span>{mode === 'template' ? '模板体验 · ' + selectedTemplate.title : '自定义体验'}</span><dl><div><dt>身份</dt><dd>{identity}</dd></div><div><dt>场景</dt><dd>{scene}</dd></div><div><dt>做什么</dt><dd>{action}</dd></div></dl></div>
      <label className={'ec-upload' + (draft.photo ? ' ec-upload-filled' : '')} data-testid="ec-photo-preview">{draft.photo ? <img src={draft.photo} alt="本机照片预览" /> : <><span className="ec-upload-mark" aria-hidden="true">＋</span><strong>选择一张人物照片</strong><span>JPG / PNG / WebP，10MB以内</span></>}<input ref={photoInput} type="file" data-testid="ec-photo-input" accept="image/jpeg,image/png,image/webp" aria-label="选择主角照片" aria-invalid={Boolean(checks.current[mode].error)} aria-describedby={checks.current[mode].error ? 'ec-photo-error' : undefined} onChange={event => { const file = event.currentTarget.files?.[0]; if (file) void choosePhoto(file, event.currentTarget); }} /></label>
      {checkingPhoto ? <p className="ec-field-help" role="status">正在检查照片…</p> : null}
      {checks.current[mode].error ? <p className="ec-error" id="ec-photo-error" data-testid="ec-photo-error" role="alert">{checks.current[mode].error}</p> : null}
      {draft.photo ? <><div className="ec-photo-actions"><button type="button" className="ec-text-link" onClick={() => photoInput.current?.click()}>更换照片</button><button type="button" className="ec-text-link" data-testid="ec-remove-photo" onClick={removePhoto}>移除照片</button></div><label className="ec-consent"><input type="checkbox" data-testid="ec-photo-consent" checked={draft.authorized} onChange={event => { draft.authorized = event.currentTarget.checked; redraw(); }} /><span>我确认已获得这张照片的使用授权</span></label></> : null}
      <div className="ec-stage-actions"><button type="button" className="ec-btn ec-btn-secondary" onClick={() => changeStep(0)}>上一步</button><button type="button" className="ec-btn ec-btn-primary" data-testid="ec-to-review" disabled={!photoReady} onClick={() => changeStep(2)}>{draft.photo ? '下一步：确认创作' : '暂不选照片，确认配置'}<Arrow /></button></div>
      {draft.photo && !draft.authorized ? <p className="ec-field-help">确认照片授权后继续；更换照片需要重新确认。</p> : null}
    </section> : null}

    {draft.step === 2 ? <section className="ec-stage-panel" aria-label="确认创作">
      <h2 ref={stageHeading} tabIndex={-1}>这次，你会这样出场</h2><p className="ec-stage-intro">{mode === 'template' ? '模板中的身份、场景和行为保持固定。' : '确认你的身份、场景和行为，也可以返回修改。'}</p>
      <div className="ec-review-layout"><div className="ec-review-picture"><Picture src={image} alt={scene + '场景画面参考'} /><span>场景参考 · 非生成结果</span></div><div className="ec-review-copy">
        <div className="ec-summary-heading"><span>{mode === 'template' ? '模板体验 · ' + selectedTemplate.title : '自定义体验'}</span><button type="button" className="ec-text-link" onClick={() => changeStep(0)}>{mode === 'template' ? '更换模板' : '修改内容'}</button></div>
        <dl className="ec-review-summary" data-testid="ec-summary"><div><dt>身份</dt><dd>{identity}</dd></div><div><dt>场景</dt><dd>{scene}</dd></div><div><dt>做什么</dt><dd>{action}</dd></div></dl>
        <div className="ec-summary-photo" data-testid="ec-summary-photo">{draft.photo ? <img src={draft.photo} alt="已选照片" /> : <span className="ec-photo-placeholder" aria-hidden="true">＋</span>}<div><strong>{draft.photo ? '已选择人物照片' : '未选择照片'}</strong><p>{draft.photo ? '仅本机预览' : '照片选填'}</p></div><button type="button" className="ec-text-link" onClick={() => changeStep(1)}>修改照片</button></div>
      </div></div>
      <div className="ec-generation-state"><strong>设定已整理，生成服务待接入。</strong><p>当前可以复制配置；不会上传照片或创建生成任务。影片时长、费用与领取方式需随实际主题服务确认。</p></div>
      <div className="ec-stage-actions"><button type="button" className="ec-btn ec-btn-primary" data-testid="ec-copy" onClick={() => void copy()}>复制我的配置</button><button type="button" className="ec-btn ec-btn-secondary" data-testid="ec-generate" disabled>生成服务待接入</button></div>
    </section> : null}

    <footer className="ec-footer"><button type="button" className="ec-text-link" onClick={() => onBack ? onBack() : window.location.hash = '/hall'}>{backLabel || '返回AI影像馆'}</button><button type="button" className="ec-text-link" onClick={() => onConsult ? onConsult() : window.location.hash = '/cooperate?product=hall&source=product'}>项目合作咨询<Arrow /></button></footer>
    {copyState ? <p className="ec-toast" role="status">{copyState}</p> : null}
    {copyFallback ? <dialog ref={copyDialog} className="ec-copy-dialog" aria-label="我的体验配置" onCancel={event => { event.preventDefault(); setCopyFallback(false); }} onClick={event => { if (event.target === copyDialog.current) setCopyFallback(false); }}><div className="ec-dialog-heading"><h2>我的体验配置</h2><button type="button" className="ec-text-link" onClick={() => setCopyFallback(false)}>关闭</button></div><p>复制下方文字，照片仅留在本机。</p><textarea data-testid="ec-copy-summary" aria-label="我的体验配置摘要" readOnly value={copySummary} rows={14} /><button type="button" className="ec-btn ec-btn-primary" onClick={() => setCopyFallback(false)}>返回配置</button></dialog> : null}
  </section>;
}
