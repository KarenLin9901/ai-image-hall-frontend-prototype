"use client";

import { ChangeEvent, ReactNode, RefObject, useEffect, useRef, useState } from "react";

type Tab = "gallery" | "create" | "mine";
type Stage = 1 | 2 | 3;
type Verify = "idle" | "checking" | "passed" | "failed";
type TaskState = "review" | "running" | "succeeded" | "failed";
type GalleryState = "works" | "loading" | "empty" | "failed";

type Scene = {
  id: string;
  name: string;
  image: string;
  places: { id: string; name: string; tag: string; lines: string[] }[];
};

const scenes: Scene[] = [
  { id: "dongmen", name: "东门", image: "/images/city-04.jpg", places: [
    { id: "old-street", name: "深圳墟老街记忆", tag: "在旧街巷里遇见深圳的过去", lines: ["老街还在，故事也一直都在。", "从深圳墟出发，我又走回熟悉的东门。", "每一条旧街，都藏着一段深圳记忆。"] },
    { id: "walking-street", name: "东门步行街烟火", tag: "在人潮与霓虹中感受城市脉搏", lines: ["人潮来往，这里一直是深圳最热闹的地方。", "熟悉的街口，装着一代人的青春。"] },
  ] },
  { id: "huaqiangbei", name: "华强北", image: "/images/city-01.jpg", places: [
    { id: "seg", name: "赛格电子市场", tag: "走进中国电子第一街的高光时刻", lines: ["一块屏幕、一颗芯片，也能连接整个世界。", "这里的每一层楼，都跳动着创新的速度。", "从柜台到世界，华强北从不缺少可能。"] },
    { id: "tech-street", name: "科技街区新生", tag: "在霓虹与科技中看见城市更新", lines: ["老街区不断更新，创新的脚步从未停下。", "今天的华强北，依然比想象更快一步。"] },
  ] },
  { id: "shekou", name: "蛇口", image: "/images/city-03.jpg", places: [
    { id: "sea-world", name: "海上世界与明华轮", tag: "在海港灯火中遇见浪漫蛇口", lines: ["海风吹过明华轮，也吹来了新的生活。", "港湾的灯亮起，蛇口拥有了另一种浪漫。"] },
    { id: "first-blast", name: "开山第一炮", tag: "回到改革开放的历史起点", lines: ["一声炮响，打开了向未来出发的道路。", "敢闯敢试，是这片土地最早的回声。"] },
  ] },
];

const works = [
  { id: "dongmen", name: "东门 · 老街还在", scene: "dongmen", place: "old-street", line: "老街还在，故事也一直都在。", image: "/images/city-04.jpg", tall: true },
  { id: "shekou", name: "蛇口 · 海风吹过", scene: "shekou", place: "sea-world", line: "海风吹过明华轮，也吹来了新的生活。", image: "/images/city-03.jpg", tall: false },
  { id: "huaqiangbei", name: "华强北 · 创新的速度", scene: "huaqiangbei", place: "seg", line: "这里的每一层楼，都跳动着创新的速度。", image: "/images/city-01.jpg", tall: true },
  { id: "dongmen-night", name: "东门 · 人潮与霓虹", scene: "dongmen", place: "walking-street", line: "人潮来往，这里一直是深圳最热闹的地方。", image: "/images/demo-video-poster.jpg", tall: false },
];

type Work = (typeof works)[number];
type Place = Scene["places"][number];
type CreateProps = {
  stage: Stage; title: string; consent: boolean; setConsent: (value: boolean) => void; face?: string;
  faceInput: RefObject<HTMLInputElement | null>; onFace: (event: ChangeEvent<HTMLInputElement>, target: "face" | "appearance") => void;
  verify: Verify; onVerify: () => void; appearance: "system" | "upload"; setAppearance: (value: "system" | "upload") => void;
  appearanceImage?: string; appearanceInput: RefObject<HTMLInputElement | null>; onAppearance: (event: ChangeEvent<HTMLInputElement>, target: "face" | "appearance") => void;
  currentScene: Scene; currentPlace: Place; line: string; selectScene: (scene: Scene) => void; setPlace: (id: string) => void; setLine: (line: string) => void;
  task: TaskState | null; published: boolean; canNext: boolean; onStage: (stage: Stage) => void; onSubmit: () => void; onAdmin: () => void; onRetry: () => void; onPublish: () => void; notify: (value: string) => void;
};

function IconButton({ children, label, onClick }: { children: ReactNode; label: string; onClick?: () => void }) {
  return <button className="icon-button" aria-label={label} onClick={onClick}>{children}</button>;
}

export default function AiImageHall() {
  const [tab, setTab] = useState<Tab>("gallery");
  const [detail, setDetail] = useState<(typeof works)[number] | null>(null);
  const [stage, setStage] = useState<Stage>(1);
  const [consent, setConsent] = useState(false);
  const [face, setFace] = useState<string>();
  const [verify, setVerify] = useState<Verify>("idle");
  const [appearance, setAppearance] = useState<"system" | "upload">("system");
  const [appearanceImage, setAppearanceImage] = useState<string>();
  const [sceneId, setSceneId] = useState("dongmen");
  const [placeId, setPlaceId] = useState("old-street");
  const [line, setLine] = useState("老街还在，故事也一直都在。");
  const [task, setTask] = useState<TaskState | null>(null);
  const [published, setPublished] = useState(false);
  const [activeVideo, setActiveVideo] = useState("dongmen");
  const [galleryState, setGalleryState] = useState<GalleryState>("works");
  const [demoOpen, setDemoOpen] = useState(false);
  const [toast, setToast] = useState("");
  const faceInput = useRef<HTMLInputElement>(null);
  const appearanceInput = useRef<HTMLInputElement>(null);
  const currentScene = scenes.find((item) => item.id === sceneId) ?? scenes[0];
  const currentPlace = currentScene.places.find((item) => item.id === placeId) ?? currentScene.places[0];
  const canNext = consent && Boolean(face) && verify === "passed";

  useEffect(() => {
    if (task !== "running") return;
    const timer = window.setTimeout(() => setTask("succeeded"), 2400);
    return () => window.clearTimeout(timer);
  }, [task]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1900);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const stageTitle = ["上传素材", "选择场景和台词", "视频生成"][stage - 1];
  const notify = (message: string) => setToast(message);
  const goCreate = (work?: (typeof works)[number]) => {
    if (work) {
      setSceneId(work.scene); setPlaceId(work.place); setLine(work.line);
      notify("已带入同款场景与台词，只需补充你的素材");
    }
    setDetail(null); setStage(1); setTab("create");
  };
  const selectScene = (next: Scene) => {
    setSceneId(next.id); setPlaceId(next.places[0].id); setLine(next.places[0].lines[0]);
  };
  const handleFile = (event: ChangeEvent<HTMLInputElement>, target: "face" | "appearance") => {
    const file = event.target.files?.[0]; if (!file) return;
    const url = URL.createObjectURL(file);
    if (target === "face") setFace(url); else setAppearanceImage(url);
    notify("素材已加入本次 Demo，不会上传或保存");
  };
  const runVerify = () => {
    setVerify("checking");
    window.setTimeout(() => setVerify("passed"), 900);
  };

  return <div className="site-shell high-fidelity-shell">
    <div className="ambient-word">AI IMAGE HALL</div>
    <main className="phone-shell high-fidelity-phone">
      {detail ? <WorkDetail work={detail} onBack={() => setDetail(null)} onCreate={() => goCreate(detail)} notify={notify} /> :
        tab === "gallery" ? <Gallery state={galleryState} activeVideo={activeVideo} onActive={setActiveVideo} onOpen={setDetail} onCreate={goCreate} onDemo={() => setDemoOpen(true)} /> :
        tab === "create" ? <Create stage={stage} title={stageTitle} consent={consent} setConsent={setConsent} face={face} faceInput={faceInput} onFace={handleFile} verify={verify} onVerify={runVerify} appearance={appearance} setAppearance={setAppearance} appearanceImage={appearanceImage} appearanceInput={appearanceInput} onAppearance={handleFile} currentScene={currentScene} currentPlace={currentPlace} line={line} selectScene={selectScene} setPlace={(id) => { const place = currentScene.places.find((item) => item.id === id) ?? currentScene.places[0]; setPlaceId(place.id); setLine(place.lines[0]); }} setLine={setLine} task={task} published={published} canNext={canNext} onStage={setStage} onSubmit={() => { setTask("review"); notify("生成申请已提交，等待 Mac 管理员确认"); }} onAdmin={() => setTask("running")} onRetry={() => setTask("review")} onPublish={() => { setPublished(true); notify("已确认公开发布到作品展示"); }} notify={notify} /> :
        <Mine task={task} published={published} onCreate={() => goCreate()} notify={notify} />}
      {!detail && <BottomNav tab={tab} setTab={setTab} onCreate={() => goCreate()} />}
    </main>
    {demoOpen && <DemoPanel close={() => setDemoOpen(false)} setGallery={setGalleryState} forceFail={() => { setTask("failed"); setStage(3); setTab("create"); setDemoOpen(false); }} />}
    {toast && <div className="toast">{toast}</div>}
  </div>;
}

function Gallery({ state, activeVideo, onActive, onOpen, onCreate, onDemo }: { state: GalleryState; activeVideo: string; onActive: (id: string) => void; onOpen: (work: Work) => void; onCreate: (work?: Work) => void; onDemo: () => void }) {
  const gridRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (state !== "works" || !gridRef.current) return;
    const scroller = gridRef.current.closest<HTMLElement>(".screen");
    const updatePlayingWork = () => {
      const center = scroller ? (scroller.getBoundingClientRect().top + scroller.getBoundingClientRect().bottom) / 2 : window.innerHeight / 2;
      const nearest = [...gridRef.current!.querySelectorAll<HTMLElement>("[data-work-id]")]
        .filter((item) => { const box = item.getBoundingClientRect(); return box.bottom > 0 && box.top < window.innerHeight; })
        .sort((a, b) => Math.abs((a.getBoundingClientRect().top + a.getBoundingClientRect().bottom) / 2 - center) - Math.abs((b.getBoundingClientRect().top + b.getBoundingClientRect().bottom) / 2 - center))[0];
      const id = nearest?.dataset.workId;
      if (id) onActive(id);
    };
    updatePlayingWork();
    scroller?.addEventListener("scroll", updatePlayingWork, { passive: true });
    window.addEventListener("resize", updatePlayingWork);
    return () => { scroller?.removeEventListener("scroll", updatePlayingWork); window.removeEventListener("resize", updatePlayingWork); };
  }, [state, onActive]);
  if (state === "loading") return <ScreenTop title="作品展示" right={<IconButton label="演示状态" onClick={onDemo}>⌁</IconButton>}><div className="gallery-empty"><i className="loader" /><b>正在汇集城市影像</b><p>请稍候，新的故事正在进入影像馆。</p></div></ScreenTop>;
  if (state === "empty") return <ScreenTop title="作品展示" right={<IconButton label="演示状态" onClick={onDemo}>⌁</IconButton>}><div className="gallery-empty"><em>⌑</em><b>还没有公开作品</b><p>你的第一支城市影像，或许会从这里开始。</p><button className="primary-button" onClick={() => onCreate()}>开始生成 <span>↗</span></button></div></ScreenTop>;
  return <ScreenTop title="AI影像馆" right={<IconButton label="演示状态" onClick={onDemo}>⌁</IconButton>}>
    <section className="gallery-intro"><span className="eyebrow">CITY MEMORIES · PUBLIC WORKS</span><h1>每一段城市记忆，<br />都有新的主角。</h1><p>精选样片和用户公开作品在此相遇。视区中央的一支，会自动静音循环播放。</p></section>
    <section ref={gridRef} className="work-waterfall" aria-label="公开作品瀑布流">
      {works.map((work) => <article key={work.id} data-work-id={work.id} className={`work-tile ${work.tall ? "tall" : ""} ${activeVideo === work.id ? "playing" : ""}`} onClick={() => onOpen(work)}>
        {activeVideo === work.id ? <video src="/media/demo-video-15s.mp4" poster={work.image} muted autoPlay loop playsInline onError={() => onActive("")} /> : <img src={work.image} alt="" />}
        <div className="work-vignette" />
        {activeVideo === work.id && <span className="play-badge"><i /> 静音播放</span>}
        <div className="work-meta"><strong>{work.name}</strong><small>15 秒 · 公开作品</small></div>
      </article>)}
    </section>
    {state === "failed" && <div className="gallery-warning">部分作品播放失败，已展示封面。<button onClick={() => onActive("dongmen")}>重试</button></div>}
  </ScreenTop>;
}

function Create(props: CreateProps) {
  const { stage, title, onStage } = props;
  return <div className="screen create-screen">
    <header className="topbar"><div className="top-slot">{stage > 1 && <IconButton label="上一步" onClick={() => onStage((stage - 1) as Stage)}>←</IconButton>}</div><div className="brand">视频生成</div><div className="top-slot" /></header>
    <div className="create-heading"><span className="eyebrow">THREE-STEP CREATION</span><h1>{title}</h1><p>{stage === 1 ? "授权、素材、本人核验与人物形象，在同一页完成。" : stage === 2 ? "大场景、小场景与预设台词联动选择，不开放自由输入。" : "生成申请、管理员确认、进度与成品都在此处切换。"}</p></div>
    <div className="three-stepper">{["上传素材", "选择场景和台词", "视频生成"].map((item, index) => <button key={item} disabled={index + 1 > stage} className={index + 1 === stage ? "active" : index + 1 < stage ? "done" : ""} onClick={() => onStage((index + 1) as Stage)}><i>{index + 1 < stage ? "✓" : index + 1}</i><span>{item}</span></button>)}</div>
    {stage === 1 ? <MaterialStep {...props} /> : stage === 2 ? <SceneStep {...props} /> : <GenerationStep {...props} />}
  </div>;
}

function MaterialStep({ consent, setConsent, face, faceInput, onFace, verify, onVerify, appearance, setAppearance, appearanceImage, appearanceInput, onAppearance, canNext, onStage }: Pick<CreateProps, "consent" | "setConsent" | "face" | "faceInput" | "onFace" | "verify" | "onVerify" | "appearance" | "setAppearance" | "appearanceImage" | "appearanceInput" | "onAppearance" | "canNext" | "onStage">) {
  const verifyText = verify === "passed" ? ["✓", "已通过", "Demo 状态：已完成人脸与本人核验"] : verify === "checking" ? ["◌", "核验中", "正在演示本人核验状态…"] : verify === "failed" ? ["!", "核验失败", "请更换清晰照片后重新尝试"] : ["◌", "未核验", "上传人脸照片后完成本人核验"];
  return <>
    <section className="glass-panel material-panel"><span className="eyebrow">MATERIALS IN ONE PLACE</span><h2>完成你的素材准备</h2><p>所有素材仅用于本次影像生成。Demo 不上传、不保存真实文件。</p>
      <label className="check-row compact-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span className="fake-check">{consent ? "✓" : ""}</span><span><b>我已确认素材使用授权</b><small>我拥有所提交素材的合法使用权。</small></span></label>
      <button className="upload-card" onClick={() => faceInput.current?.click()}><img src={face || "/images/appearance-reference-v1.png"} alt="人脸照片案例参考" /><span><b>{face ? "人脸照片已添加" : "上传清晰人脸照片"}</b><small>JPG / PNG · 正脸、单人、无遮挡</small></span><em>＋</em></button><input className="visually-hidden" ref={faceInput} type="file" accept="image/jpeg,image/png" onChange={(event) => onFace(event, "face")} />
      <div className={`verify-card ${verify}`}><i>{verifyText[0]}</i><span><b>{verifyText[1]}</b><small>{verifyText[2]}</small></span><button disabled={!face || verify === "checking"} onClick={onVerify}>{verify === "passed" ? "重新演示" : "开始核验"}</button></div>
    </section>
    <section className="glass-panel material-panel"><span className="eyebrow">APPEARANCE</span><h2>选择人物形象</h2><p>上传形象参考，或由系统依据场景自动生成。</p><div className="appearance-options"><button className={appearance === "system" ? "selected" : ""} onClick={() => setAppearance("system")}><i>✦</i><b>系统自动生成</b><small>依据场景匹配人物形象</small></button><button className={appearance === "upload" ? "selected" : ""} onClick={() => setAppearance("upload")}><i>↑</i><b>上传形象图</b><small>全身照或服装参考</small></button></div>{appearance === "upload" && <><button className="upload-card compact-upload" onClick={() => appearanceInput.current?.click()}><img src={appearanceImage || "/images/appearance-reference-v1.png"} alt="形象图案例参考" /><span><b>{appearanceImage ? "形象图已添加" : "上传形象参考图"}</b><small>JPG / PNG · Demo 不保存文件</small></span><em>＋</em></button><input className="visually-hidden" ref={appearanceInput} type="file" accept="image/jpeg,image/png" onChange={(event) => onAppearance(event, "appearance")} /></>}</section>
    <div className="sticky-action"><button className="primary-button" disabled={!canNext} onClick={() => onStage(2)}>继续：选择场景和台词 <span>↗</span></button></div>
  </>;
}

function SceneStep({ currentScene, currentPlace, line, selectScene, setPlace, setLine, onStage }: Pick<CreateProps, "currentScene" | "currentPlace" | "line" | "selectScene" | "setPlace" | "setLine" | "onStage">) {
  return <>
    <section className="glass-panel scene-panel"><span className="eyebrow">SCENE & DIALOGUE</span><h2>一页选定故事</h2><div className="scene-tabs">{scenes.map((scene) => <button key={scene.id} className={scene.id === currentScene.id ? "selected" : ""} onClick={() => selectScene(scene)}>{scene.name}</button>)}</div><div className="scene-visual"><img src={currentScene.image} alt={currentScene.name} /><span>{currentScene.name} · 城市记忆</span></div><div className="place-list">{currentScene.places.map((place) => <button key={place.id} className={place.id === currentPlace.id ? "selected" : ""} onClick={() => setPlace(place.id)}><b>{place.name}</b><small>{place.tag}</small><i>{place.id === currentPlace.id ? "✓" : ""}</i></button>)}</div></section>
    <section className="glass-panel line-panel"><span className="eyebrow">PRESET LINES</span><h2>选择一句台词</h2>{currentPlace.lines.map((item: string) => <label key={item} className={line === item ? "selected" : ""}><input type="radio" checked={line === item} onChange={() => setLine(item)} /><span>{item}</span><i>{line === item ? "✓" : ""}</i></label>)}</section>
    <div className="sticky-action split"><button className="secondary-button" onClick={() => onStage(1)}>上一步</button><button className="primary-button" onClick={() => onStage(3)}>确认并生成 <span>↗</span></button></div>
  </>;
}

function GenerationStep({ currentScene, currentPlace, line, appearance, task, published, onSubmit, onAdmin, onRetry, onPublish, onStage, notify }: Pick<CreateProps, "currentScene" | "currentPlace" | "line" | "appearance" | "task" | "published" | "onSubmit" | "onAdmin" | "onRetry" | "onPublish" | "onStage" | "notify">) {
  if (!task) return <><section className="glass-panel summary-panel"><span className="eyebrow">READY TO CREATE</span><h2>确认生成内容</h2><div><span>场景</span><b>{currentScene.name} · {currentPlace.name}</b></div><div><span>台词</span><b>{line}</b></div><div><span>人物形象</span><b>{appearance === "system" ? "系统自动生成" : "已上传形象图"}</b></div><div><span>生成规则</span><b>需 Mac 管理员确认</b></div></section><div className="sticky-action split"><button className="secondary-button" onClick={() => onStage(2)}>返回修改</button><button className="primary-button" onClick={onSubmit}>提交生成申请 <span>↗</span></button></div></>;
  if (task === "review") return <TaskCard icon="⌘" title="等待 Mac 管理员确认" eyebrow="ADMIN APPROVAL REQUIRED" text="只有管理员在指定 Mac 上明确确认后，才会开始生成。本 Demo 不连接真实后台。"><button className="secondary-button" onClick={onAdmin}>演示：管理员已确认</button><button className="text-only" onClick={() => { onStage(2); notify("已返回场景选择"); }}>返回修改</button></TaskCard>;
  if (task === "running") return <TaskCard icon="✦" title="正在生成城市影像" eyebrow="GENERATING" text="正在合成画面与场景节奏，请稍候。"><div className="progress-line"><i /></div><small>生成状态模拟中 · 不调用真实服务</small></TaskCard>;
  if (task === "failed") return <TaskCard bad icon="!" title="这次生成没有完成" eyebrow="GENERATION FAILED" text="Demo 异常状态。真实产品会保留失败原因和可重试任务，但不会公开你的素材。"><button className="primary-button" onClick={onRetry}>重新提交生成 <span>↗</span></button><button className="text-only" onClick={() => onStage(2)}>返回调整场景</button></TaskCard>;
  return <TaskCard good icon="✓" title="你的影像已生成" eyebrow="YOUR FILM IS READY" text="作品默认仅自己可见。公开前需要你的单独确认。"><div className="result-video"><video src="/media/demo-video-15s.mp4" poster="/images/demo-video-poster.jpg" muted autoPlay loop playsInline /><span>{currentScene.name} · {currentPlace.name}</span></div><button className="primary-button" onClick={() => notify("已打开成品预览（Demo）")}>预览成品 <span>↗</span></button><button className="secondary-button" onClick={onPublish}>{published ? "已发布到作品展示" : "单独确认公开发布"}</button></TaskCard>;
}

function TaskCard({ icon, title, eyebrow, text, children, good, bad }: { icon: string; title: string; eyebrow: string; text: string; children: ReactNode; good?: boolean; bad?: boolean }) { return <section className={`task-card ${good ? "good" : ""} ${bad ? "bad" : ""}`}><i className="task-orb">{icon}</i><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p><div className="task-children">{children}</div></section>; }

function Mine({ task, published, onCreate, notify }: { task: TaskState | null; published: boolean; onCreate: () => void; notify: (value: string) => void }) { const taskText = task === "running" ? "生成中" : task === "review" ? "待确认" : task === "failed" ? "生成失败" : task === "succeeded" ? "已完成" : "暂无任务"; return <ScreenTop title="我的" right={<IconButton label="更多">···</IconButton>}><section className="profile-card"><div className="avatar">林</div><div><b>林先生</b><small>lin@example.com · 已登录</small></div><button onClick={() => notify("已退出登录（Demo）")}>退出登录</button></section><section className="mine-section"><header><h2>我的创作</h2><button onClick={onCreate}>新建视频 ↗</button></header><div className="creation-row"><img src="/images/city-03.jpg" alt="" /><span><b>蛇口 · 海港灯火</b><small>城市影像生成任务</small></span><em className={task === "failed" ? "bad" : task === "succeeded" ? "good" : ""}>{taskText}</em></div></section><section className="mine-section"><header><h2>我的作品</h2><button onClick={() => notify("全部作品（Demo）")}>查看全部</button></header><div className="creation-row"><img src="/images/city-01.jpg" alt="" /><span><b>华强北 · 创新的速度</b><small>{published ? "已公开展示" : "仅自己可见"}</small></span><button className="small-icon" onClick={() => notify("下载开始（Demo）")}>⇩</button><button className="small-icon" onClick={() => notify("分享链接已复制（Demo）")}>⌁</button><button className="small-icon" onClick={() => notify("删除确认（Demo）")}>⌫</button></div></section></ScreenTop>; }

function WorkDetail({ work, onBack, onCreate, notify }: { work: (typeof works)[number]; onBack: () => void; onCreate: () => void; notify: (value: string) => void }) { return <div className="dark-screen work-detail"><header className="topbar"><div className="top-slot"><IconButton label="返回" onClick={onBack}>←</IconButton></div><div className="brand">作品详情</div><div className="top-slot top-action"><IconButton label="分享" onClick={() => notify("分享链接已复制（Demo）")}>⌁</IconButton></div></header><section className="detail-film"><video src="/media/demo-video-15s.mp4" poster={work.image} muted autoPlay loop playsInline /><div /><article><span className="eyebrow">PUBLIC WORK · 15S</span><h1>{work.name}</h1><p>“{work.line}”</p></article></section><div className="detail-actions"><button className="secondary-button" onClick={() => notify("分享链接已复制（Demo）")}>⌁ 分享</button><button className="primary-button" onClick={onCreate}>生成同款视频 <span>↗</span></button></div></div>; }

function ScreenTop({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) { return <div className="screen gallery-screen"><header className="topbar"><div className="top-slot" /><div className="brand">{title}</div><div className="top-slot top-action">{right}</div></header>{children}</div>; }
function BottomNav({ tab, setTab, onCreate }: { tab: Tab; setTab: (tab: Tab) => void; onCreate: () => void }) { return <nav className="prototype-nav"><button className={tab === "gallery" ? "active" : ""} onClick={() => setTab("gallery")}><i>▦</i>作品展示</button><button className="create-tab" onClick={onCreate}><i>＋</i>视频生成</button><button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}><i>◉</i>我的</button></nav>; }
function DemoPanel({ close, setGallery, forceFail }: { close: () => void; setGallery: (state: GalleryState) => void; forceFail: () => void }) { return <div className="demo-layer"><section><button className="sheet-close" onClick={close}>×</button><span className="eyebrow">DEMO STATES</span><h2>演示状态面板</h2><p>仅用于展示异常与空状态，不影响任何真实数据。</p><button onClick={() => { setGallery("works"); close(); }}>作品展示：正常</button><button onClick={() => { setGallery("loading"); close(); }}>作品展示：加载中</button><button onClick={() => { setGallery("empty"); close(); }}>作品展示：暂无作品</button><button onClick={() => { setGallery("failed"); close(); }}>作品播放失败</button><button onClick={forceFail}>视频生成失败</button></section></div>; }
