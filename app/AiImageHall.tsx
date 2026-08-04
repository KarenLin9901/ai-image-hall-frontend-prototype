import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type Tab = "gallery" | "create" | "mine";
type Stage = 1 | 2 | 3;
type VerifyState = "idle" | "checking" | "passed" | "failed";
type TaskState = "running" | "success" | "failed";
type GalleryMode = "works" | "loading" | "empty" | "failed";
type Motion = "" | "up" | "down" | "left" | "right";
type IconName = "gallery" | "create" | "mine" | "back" | "share" | "download" | "delete" | "more" | "play" | "pause" | "check" | "upload" | "retry" | "close";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

type Shot = {
  id: string;
  name: string;
  tag: string;
  image: string;
  lines: string[];
};

type Scene = {
  id: string;
  name: string;
  image: string;
  shots: Shot[];
};

type Work = {
  id: string;
  title: string;
  sceneId: string;
  shotId: string;
  scene: string;
  duration: string;
  image: string;
  line: string;
  tags: string[];
  visibility?: "公开展示" | "仅自己可见" | "发布中";
  time?: string;
};

type TaskItem = {
  id: string;
  title: string;
  scene: string;
  image: string;
  status: TaskState;
  time: string;
  progress?: number;
  workId?: string;
};

const scenes: Scene[] = [
  {
    id: "dongmen",
    name: "东门",
    image: asset("images/v3/dongmen-main.jpg"),
    shots: [
      {
        id: "dongmen-night",
        name: "雨夜食堂",
        tag: "街巷烟火",
        image: asset("images/v3/dongmen-main.jpg"),
        lines: ["忙了一天，这一口就是深圳的安慰。", "城市很快，热饭要慢慢吃。", "今晚的东门，替我留了一盏灯。"],
      },
      {
        id: "dongmen-morning",
        name: "清晨闸机",
        tag: "通勤日常",
        image: asset("images/v3/dongmen-morning.jpg"),
        lines: ["八点二十九分，我和早餐一起冲线。", "脚步不停，生活也在向前。", "深圳的早晨，从闸机声里醒来。"],
      },
      {
        id: "dongmen-milktea",
        name: "一杯回魂",
        tag: "下班片刻",
        image: asset("images/v3/dongmen-milktea.jpg"),
        lines: ["这一口，先把今天原谅了。", "下班后的快乐，可以很简单。", "城市没慢下来，我先喘口气。"],
      },
    ],
  },
  {
    id: "huaqiangbei",
    name: "华强北",
    image: asset("images/v3/huaqiangbei-main.jpg"),
    shots: [
      {
        id: "huaqiangbei-market",
        name: "芯片市场",
        tag: "创新现场",
        image: asset("images/v3/huaqiangbei-main.jpg"),
        lines: ["一块芯片，也能装下一个新世界。", "灵感在柜台之间通电。", "华强北的速度，永远比想象快一步。"],
      },
      {
        id: "huaqiangbei-night",
        name: "凌晨工位",
        tag: "城市夜班",
        image: asset("images/v3/huaqiangbei-night.jpg"),
        lines: ["灯还亮着，答案就还在路上。", "凌晨一点半，灵感刚刚开机。", "今天的难题，留给明天的惊喜。"],
      },
      {
        id: "huaqiangbei-commute",
        name: "人潮向上",
        tag: "通勤节奏",
        image: asset("images/v3/huaqiangbei-commute.jpg"),
        lines: ["人潮向上，我也一样。", "每一步，都是城市的脉冲。", "抱紧今天，也抱紧新的可能。"],
      },
    ],
  },
  {
    id: "shekou",
    name: "蛇口",
    image: asset("images/v3/shekou-main.jpg"),
    shots: [
      {
        id: "shekou-sunset",
        name: "海湾落日",
        tag: "海风时刻",
        image: asset("images/v3/shekou-main.jpg"),
        lines: ["看到海的这一刻，今天值得被原谅。", "风从海上来，也把疲惫带走。", "下班以后，把时间还给晚霞。"],
      },
      {
        id: "shekou-warehouse",
        name: "旧仓新生",
        tag: "城市漫游",
        image: asset("images/v3/shekou-warehouse.jpg"),
        lines: ["旧砖墙里，也住着新的故事。", "时间留下痕迹，也留下惊喜。", "沿着海港，遇见深圳的另一面。"],
      },
      {
        id: "shekou-night",
        name: "港湾夜色",
        tag: "夜间松弛",
        image: asset("images/v3/shekou-night.jpg"),
        lines: ["海风一吹，今天就轻了一点。", "万家灯火，也有一盏属于我。", "深圳的夜，替我收好所有疲惫。"],
      },
    ],
  },
];

const works: Work[] = scenes.flatMap((scene) =>
  scene.shots.map((shot, index) => ({
    id: shot.id,
    title: shot.name,
    sceneId: scene.id,
    shotId: shot.id,
    scene: scene.name,
    duration: index === 1 ? "18秒" : "15秒",
    image: shot.image,
    line: shot.lines[0],
    tags: [shot.tag, index === 0 ? "城市记忆" : "深圳日常"],
    visibility: index === 0 ? "公开展示" : index === 1 ? "仅自己可见" : "发布中",
    time: `8月${3 - index}日`,
  })),
);

const initialTasks: TaskItem[] = [
  { id: "task-running", title: "凌晨工位", scene: "华强北", image: asset("images/v3/huaqiangbei-night.jpg"), status: "running", time: "今天 14:20", progress: 68 },
  { id: "task-success", title: "海湾落日", scene: "蛇口", image: asset("images/v3/shekou-main.jpg"), status: "success", time: "8月3日 18:42", workId: "shekou-sunset" },
  { id: "task-failed", title: "清晨闸机", scene: "东门", image: asset("images/v3/dongmen-morning.jpg"), status: "failed", time: "8月2日 09:08" },
];

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "gallery") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="5" /><path d="M7 15l3-3 2 2 3-4 3 5" /></svg>;
  if (name === "create") return <svg {...common}><path d="M12 3v18M3 12h18" /></svg>;
  if (name === "mine") return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>;
  if (name === "back") return <svg {...common}><path d="M15 18l-6-6 6-6" /></svg>;
  if (name === "share") return <svg {...common}><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="M8 11l8-5M8 13l8 5" /></svg>;
  if (name === "download") return <svg {...common}><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" /></svg>;
  if (name === "delete") return <svg {...common}><path d="M4 7h16M9 7V4h6v3m3 0l-1 14H7L6 7m4 4v6m4-6v6" /></svg>;
  if (name === "more") return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
  if (name === "play") return <svg {...common}><path d="M9 7l8 5-8 5z" fill="currentColor" stroke="none" /></svg>;
  if (name === "pause") return <svg {...common}><path d="M9 7v10M15 7v10" /></svg>;
  if (name === "check") return <svg {...common}><path d="M5 12l4 4L19 6" /></svg>;
  if (name === "upload") return <svg {...common}><path d="M12 16V4m0 0L8 8m4-4l4 4M4 20h16" /></svg>;
  if (name === "retry") return <svg {...common}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M18 12a6 6 0 0 0-10-4L4 12m16 0l-4 4a6 6 0 0 1-10-4" /></svg>;
  if (name === "close") return <svg {...common}><path d="M6 6l12 12M18 6L6 18" /></svg>;
  return null;
}

function IconButton({ name, label, onClick, className = "" }: { name: IconName; label: string; onClick?: () => void; className?: string }) {
  return <button type="button" className={`icon-button ${className}`} aria-label={label} title={label} onClick={onClick}><Icon name={name} /></button>;
}

function CinematicLoop({ work, playing = true }: { work: Work; playing?: boolean }) {
  const scene = scenes.find((item) => item.id === work.sceneId) ?? scenes[0];
  const initial = Math.max(0, scene.shots.findIndex((item) => item.id === work.shotId));
  const [frame, setFrame] = useState(initial);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFrame((current) => (current + 1) % scene.shots.length), 2800);
    return () => window.clearInterval(timer);
  }, [playing, scene.shots.length]);
  const shot = scene.shots[frame] ?? scene.shots[0];
  return <div className={`cinematic-loop ${playing ? "playing" : "paused"}`}><img key={shot.id} src={shot.image} width="941" height="1672" alt="" /></div>;
}

function Header({ title, dark = false, back, more }: { title: string; dark?: boolean; back?: () => void; more?: () => void }) {
  return <header className={`app-header ${dark ? "dark" : ""}`}>
    <div>{back && <IconButton name="back" label="返回" onClick={back} />}</div>
    <strong>{title}</strong>
    <div>{more && <IconButton name="more" label="更多状态" onClick={more} />}</div>
  </header>;
}

export default function AiImageHall() {
  const [tab, setTab] = useState<Tab>("gallery");
  const [stage, setStage] = useState<Stage>(1);
  const [sceneId, setSceneId] = useState("dongmen");
  const [shotId, setShotId] = useState("dongmen-night");
  const [line, setLine] = useState(scenes[0].shots[0].lines[0]);
  const [galleryMode, setGalleryMode] = useState<GalleryMode>("works");
  const [detailWork, setDetailWork] = useState<Work | null>(null);
  const [taskDetail, setTaskDetail] = useState<TaskItem | null>(null);
  const [mineTab, setMineTab] = useState<"tasks" | "works">("tasks");
  const [taskState, setTaskState] = useState<TaskState | null>(null);
  const [published, setPublished] = useState(false);
  const [consent, setConsent] = useState(false);
  const [face, setFace] = useState<string | null>(null);
  const [verify, setVerify] = useState<VerifyState>("idle");
  const [appearance, setAppearance] = useState<"auto" | "upload">("auto");
  const [appearanceImage, setAppearanceImage] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"states" | "busy" | "publish" | "unpublish" | "delete" | null>(null);
  const [toast, setToast] = useState("");
  const [deleted, setDeleted] = useState<string[]>([]);
  const [visibilityOverrides, setVisibilityOverrides] = useState<Record<string, boolean>>({});
  const faceInput = useRef<HTMLInputElement>(null);
  const appearanceInput = useRef<HTMLInputElement>(null);

  const scene = scenes.find((item) => item.id === sceneId) ?? scenes[0];
  const shot = scene.shots.find((item) => item.id === shotId) ?? scene.shots[0];
  const visibleWorks = works.filter((work) => !deleted.includes(work.id));
  const theme = tab === "gallery" || detailWork ? "dark" : "light";
  const canNext = Boolean(consent && face && verify === "passed" && (appearance === "auto" || appearanceImage));

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const chooseScene = (next: Scene) => {
    setSceneId(next.id);
    setShotId(next.shots[0].id);
    setLine(next.shots[0].lines[0]);
  };

  const chooseShot = (next: Shot) => {
    setShotId(next.id);
    setLine(next.lines[0]);
  };

  const goCreate = (work?: Work) => {
    if (work) {
      const nextScene = scenes.find((item) => item.id === work.sceneId) ?? scenes[0];
      const nextShot = nextScene.shots.find((item) => item.id === work.shotId) ?? nextScene.shots[0];
      setSceneId(nextScene.id);
      setShotId(nextShot.id);
      setLine(work.line);
    }
    setDetailWork(null);
    setTaskDetail(null);
    setTab("create");
    setStage(1);
  };

  const addFile = (event: ChangeEvent<HTMLInputElement>, target: "face" | "appearance") => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (target === "face") {
      setFace(url);
      setVerify("checking");
      window.setTimeout(() => setVerify("passed"), 1100);
    } else {
      setAppearanceImage(url);
    }
  };

  const submitGeneration = () => setSheet("busy");
  const continueGeneration = () => {
    setSheet(null);
    setTaskState("running");
    setToast("已加入生成队列");
  };
  const share = () => setToast("分享链接已准备好");
  const download = () => setToast("开始下载视频");

  const openTaskWork = (item: TaskItem) => {
    if (!item.workId) return;
    const work = works.find((candidate) => candidate.id === item.workId);
    if (work) {
      setTaskDetail(null);
      setDetailWork(work);
    }
  };

  if (detailWork) {
    const isPublic = visibilityOverrides[detailWork.id] ?? detailWork.visibility === "公开展示";
    return <div className="prototype-frame dark-frame"><WorkViewer work={detailWork} mineMode={tab === "mine"} onBack={() => setDetailWork(null)} onCreate={() => goCreate(detailWork)} onShare={share} onDownload={download} onDelete={() => setSheet("delete")} isPublic={isPublic} onPublish={() => setSheet(isPublic ? "unpublish" : "publish")} />{sheet && <Sheet kind={sheet} onClose={() => setSheet(null)} onContinue={continueGeneration} onProgress={() => {}} onPublish={() => { const next = sheet === "publish"; setVisibilityOverrides((items) => ({ ...items, [detailWork.id]: next })); setSheet(null); setToast(next ? "作品已公开展示" : "作品已取消公开"); }} onDelete={() => { setDeleted((items) => [...items, detailWork.id]); setDetailWork(null); setSheet(null); setToast("作品已删除"); }} />}{toast && <Toast text={toast} />}</div>;
  }

  if (taskDetail) {
    return <div className="prototype-frame light-frame"><TaskDetail item={taskDetail} onBack={() => setTaskDetail(null)} onOpenWork={() => openTaskWork(taskDetail)} onRetry={() => { setTaskDetail(null); goCreate(); }} />{toast && <Toast text={toast} />}</div>;
  }

  return <div className={`prototype-frame ${theme}-frame`}>
    <a className="skip-link" href="#main-content">跳到主要内容</a>
    <main id="main-content" className="app-main">
      {tab === "gallery" && <Gallery mode={galleryMode} works={visibleWorks} onOpen={setDetailWork} onCreate={goCreate} onMore={() => setSheet("states")} />}
      {tab === "create" && <CreateFlow stage={stage} setStage={setStage} scene={scene} shot={shot} line={line} chooseScene={chooseScene} chooseShot={chooseShot} setLine={setLine} consent={consent} setConsent={setConsent} face={face} faceInput={faceInput} addFile={addFile} verify={verify} setVerify={setVerify} appearance={appearance} setAppearance={setAppearance} appearanceImage={appearanceImage} appearanceInput={appearanceInput} canNext={canNext} taskState={taskState} published={published} onSubmit={submitGeneration} onOpenResult={() => setDetailWork(works.find((work) => work.shotId === shot.id) ?? works[0])} onMine={() => { setTab("mine"); setMineTab("tasks"); }} onPublish={() => setSheet("publish")} onDownload={download} onShare={share} onMore={() => setSheet("states")} />}
      {tab === "mine" && <Mine mineTab={mineTab} setMineTab={setMineTab} works={visibleWorks.slice(0, 4)} onOpenTask={setTaskDetail} onOpenWork={setDetailWork} onCreate={() => goCreate()} onShare={share} onDownload={download} onDelete={(work) => { setDetailWork(work); setSheet("delete"); }} onExit={() => setToast("已退出登录")} />}
    </main>
    {!sheet && <BottomNav tab={tab} setTab={(next) => { setTab(next); if (next === "create") setStage(1); }} />}
    {sheet && <Sheet kind={sheet} onClose={() => setSheet(null)} onContinue={continueGeneration} onProgress={() => { setSheet(null); setTab("mine"); setMineTab("tasks"); }} onGallery={setGalleryMode} onVerify={setVerify} onTask={setTaskState} onSample={() => { setFace(asset("images/v3/dongmen-main.jpg")); setVerify("passed"); setConsent(true); }} onPublish={() => { setPublished(true); setSheet(null); setToast("作品已公开展示"); }} onDelete={() => setSheet(null)} />}
    {toast && <Toast text={toast} />}
  </div>;
}

function Gallery({ mode, works: items, onOpen, onCreate, onMore }: { mode: GalleryMode; works: Work[]; onOpen: (work: Work) => void; onCreate: (work?: Work) => void; onMore: () => void }) {
  const [index, setIndex] = useState(0);
  const [motion, setMotion] = useState<Motion>("");
  const start = useRef({ x: 0, y: 0, moved: false });
  const safeIndex = items.length ? index % items.length : 0;
  const active = items[safeIndex];

  useEffect(() => {
    if (index >= items.length && items.length) setIndex(0);
  }, [index, items.length]);

  const move = (direction: Motion) => {
    if (!items.length || motion) return;
    setMotion(direction);
    window.setTimeout(() => {
      setIndex((current) => direction === "down" || direction === "right" ? (current - 1 + items.length) % items.length : (current + 1) % items.length);
      setMotion("");
    }, 330);
  };

  const pointerDown = (event: ReactPointerEvent) => {
    start.current = { x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerUp = (event: ReactPointerEvent) => {
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    const distance = Math.max(Math.abs(dx), Math.abs(dy));
    if (distance < 36) {
      if (active) onOpen(active);
      return;
    }
    start.current.moved = true;
    if (Math.abs(dy) > Math.abs(dx)) move(dy < 0 ? "up" : "down");
    else move(dx < 0 ? "left" : "right");
  };

  if (mode === "loading") return <section className="gallery-page"><GalleryHeader onMore={onMore} /><StateCard><span className="spinner" /><h2>正在载入作品…</h2></StateCard></section>;
  if (mode === "empty" || !active) return <section className="gallery-page"><GalleryHeader onMore={onMore} /><StateCard><div className="state-symbol"><Icon name="gallery" size={28} /></div><h2>还没有作品</h2><button className="solid-button" onClick={() => onCreate()}>生成第一支视频</button></StateCard></section>;
  if (mode === "failed") return <section className="gallery-page"><GalleryHeader onMore={onMore} /><StateCard><div className="state-symbol"><Icon name="retry" size={28} /></div><h2>作品载入失败</h2><button className="solid-button" onClick={() => window.location.reload()}>重新载入</button></StateCard></section>;

  const back1 = items[(safeIndex + 1) % items.length];
  const back2 = items[(safeIndex + 2) % items.length];
  return <section className="gallery-page">
    <GalleryHeader onMore={onMore} />
    <div className="deck-wrap">
      <div className="deck-stage" role="button" tabIndex={0} aria-label={`查看作品：${active.title}`} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onOpen(active); if (event.key === "ArrowUp" || event.key === "ArrowRight") move("up"); if (event.key === "ArrowDown" || event.key === "ArrowLeft") move("down"); }} onPointerDown={pointerDown} onPointerUp={pointerUp} onWheel={(event) => { if (Math.abs(event.deltaY) > 18) move(event.deltaY > 0 ? "up" : "down"); }}>
        <article className="poster-card deck-back deck-back-two" aria-hidden="true"><img src={back2.image} width="941" height="1672" alt="" /></article>
        <article className="poster-card deck-back deck-back-one" aria-hidden="true"><img src={back1.image} width="941" height="1672" alt="" /></article>
        <article className={`poster-card deck-front ${motion ? `motion-${motion}` : ""}`}>
          <CinematicLoop key={active.id} work={active} />
          <div className="poster-shade" />
          <div className="poster-top"><span>{active.scene}</span><span>{active.duration}</span></div>
          <div className="poster-copy"><div className="tag-row">{active.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><h2>{active.title}</h2><p>{active.line}</p></div>
          <span className="tap-hint"><Icon name="play" size={16} /> 点击观看</span>
        </article>
      </div>
      <p className="gesture-hint"><span /> 上下浏览 · 左右翻牌</p>
      <button className="same-style" onClick={() => onCreate(active)}>生成同款视频 <Icon name="create" size={18} /></button>
    </div>
  </section>;
}

function GalleryHeader({ onMore }: { onMore: () => void }) {
  return <header className="gallery-header"><div><small>深圳AI影像馆</small><h1>作品展示</h1></div><IconButton name="more" label="更多状态" onClick={onMore} /></header>;
}

function StateCard({ children }: { children: ReactNode }) {
  return <div className="state-card">{children}</div>;
}

type CreateFlowProps = {
  stage: Stage;
  setStage: (stage: Stage) => void;
  scene: Scene;
  shot: Shot;
  line: string;
  chooseScene: (scene: Scene) => void;
  chooseShot: (shot: Shot) => void;
  setLine: (line: string) => void;
  consent: boolean;
  setConsent: (value: boolean) => void;
  face: string | null;
  faceInput: React.RefObject<HTMLInputElement | null>;
  addFile: (event: ChangeEvent<HTMLInputElement>, target: "face" | "appearance") => void;
  verify: VerifyState;
  setVerify: (state: VerifyState) => void;
  appearance: "auto" | "upload";
  setAppearance: (value: "auto" | "upload") => void;
  appearanceImage: string | null;
  appearanceInput: React.RefObject<HTMLInputElement | null>;
  canNext: boolean;
  taskState: TaskState | null;
  published: boolean;
  onSubmit: () => void;
  onOpenResult: () => void;
  onMine: () => void;
  onPublish: () => void;
  onDownload: () => void;
  onShare: () => void;
  onMore: () => void;
};

function CreateFlow(props: CreateFlowProps) {
  return <section className="light-page create-page">
    <Header title="视频生成" more={props.onMore} />
    <StepBar stage={props.stage} />
    {props.stage === 1 && <MaterialStep {...props} />}
    {props.stage === 2 && <SceneStep {...props} />}
    {props.stage === 3 && <GenerationStep {...props} />}
  </section>;
}

function StepBar({ stage }: { stage: Stage }) {
  const labels = ["上传素材", "场景台词", "视频生成"];
  return <div className="step-bar">{labels.map((label, index) => <div key={label} className={index + 1 === stage ? "active" : index + 1 < stage ? "done" : ""}><i>{index + 1 < stage ? <Icon name="check" size={13} /> : index + 1}</i><span>{label}</span></div>)}</div>;
}

function MaterialStep(props: CreateFlowProps) {
  const verifyCopy = props.verify === "checking" ? ["核验中", "请保持页面开启"] : props.verify === "passed" ? ["核验已通过", "可以继续下一步"] : props.verify === "failed" ? ["核验未通过", "请更换清晰照片"] : ["等待本人核验", "上传照片后自动开始"];
  return <div className="flow-body material-flow">
    <div className="flow-title"><span>第一步</span><h1>上传素材</h1></div>
    <label className={`glass-card consent-card ${props.consent ? "selected" : ""}`}><input type="checkbox" name="material_authorization" checked={props.consent} onChange={(event) => props.setConsent(event.target.checked)} /><i>{props.consent && <Icon name="check" size={15} />}</i><div><strong>素材使用授权</strong><small>我拥有所提交素材的合法使用权</small></div></label>
    <button className="glass-card upload-row" onClick={() => props.faceInput.current?.click()}>{props.face ? <img src={props.face} width="941" height="1672" alt="人脸照片" /> : <span className="upload-placeholder"><Icon name="upload" /></span>}<div><strong>{props.face ? "人脸照片已上传" : "上传人脸照片"}</strong><small>正脸 · 单人 · 清晰无遮挡</small></div><Icon name="upload" /></button>
    <input ref={props.faceInput} className="hidden-input" type="file" name="face_photo" aria-label="选择人脸照片" autoComplete="off" accept="image/jpeg,image/png" onChange={(event) => props.addFile(event, "face")} />
    <div className={`glass-card verify-row ${props.verify}`}><span>{props.verify === "checking" ? <i className="mini-spinner" /> : props.verify === "passed" ? <Icon name="check" size={17} /> : props.verify === "failed" ? "!" : "·"}</span><div><strong>{verifyCopy[0]}</strong><small>{verifyCopy[1]}</small></div>{props.verify === "failed" && <button onClick={() => props.faceInput.current?.click()}>重新上传</button>}</div>
    <section className="glass-card appearance-card"><header><strong>人物形象</strong><small>选择一种生成方式</small></header><div className="choice-grid"><button className={props.appearance === "auto" ? "selected" : ""} onClick={() => props.setAppearance("auto")}><span className="spark">✦</span><strong>自动生成</strong><small>按场景匹配</small></button><button className={props.appearance === "upload" ? "selected" : ""} onClick={() => props.setAppearance("upload")}><Icon name="upload" /><strong>上传形象图</strong><small>服装或全身照</small></button></div>{props.appearance === "upload" && <button className="appearance-upload" onClick={() => props.appearanceInput.current?.click()}>{props.appearanceImage ? <img src={props.appearanceImage} width="941" height="1672" alt="已上传形象" /> : <Icon name="upload" />}<span>{props.appearanceImage ? "形象图已上传" : "选择形象图"}</span></button>}<input ref={props.appearanceInput} className="hidden-input" type="file" name="appearance_photo" aria-label="选择人物形象图" autoComplete="off" accept="image/jpeg,image/png" onChange={(event) => props.addFile(event, "appearance")} /></section>
    <div className="sticky-cta"><button className="primary-cta" disabled={!props.canNext} onClick={() => props.setStage(2)}>下一步</button></div>
  </div>;
}

function SceneStep(props: CreateFlowProps) {
  return <div className="flow-body scene-flow">
    <div className="flow-title"><span>第二步</span><h1>选择场景和台词</h1></div>
    <div className="scene-tabs">{scenes.map((scene) => <button key={scene.id} className={scene.id === props.scene.id ? "selected" : ""} onClick={() => props.chooseScene(scene)}>{scene.name}</button>)}</div>
    <div className="scene-hero"><img src={props.shot.image} width="941" height="1672" alt={props.shot.name} /><div><span>{props.scene.name}</span><h2>{props.shot.name}</h2></div></div>
    <div className="shot-row">{props.scene.shots.map((shot) => <button key={shot.id} className={shot.id === props.shot.id ? "selected" : ""} onClick={() => props.chooseShot(shot)}><img src={shot.image} width="941" height="1672" loading="lazy" alt={shot.name} /><span>{shot.name}</span></button>)}</div>
    <section className="line-card"><header><strong>选择台词</strong></header>{props.shot.lines.map((item) => <label key={item} className={props.line === item ? "selected" : ""}><input type="radio" name="preset_line" checked={props.line === item} onChange={() => props.setLine(item)} /><i>{props.line === item && <Icon name="check" size={14} />}</i><span>{item}</span></label>)}</section>
    <div className="sticky-cta split"><button className="ghost-cta" onClick={() => props.setStage(1)}>上一步</button><button className="primary-cta" onClick={() => props.setStage(3)}>确认选择</button></div>
  </div>;
}

function GenerationStep(props: CreateFlowProps) {
  if (!props.taskState) return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>确认生成</h1></div><div className="summary-poster"><img src={props.shot.image} width="941" height="1672" alt={props.shot.name} /><div><span>{props.scene.name}</span><h2>{props.shot.name}</h2></div></div><section className="summary-card"><div><span>台词</span><strong>{props.line}</strong></div><div><span>人物形象</span><strong>{props.appearance === "auto" ? "自动生成" : "已上传形象图"}</strong></div></section><div className="sticky-cta split"><button className="ghost-cta" onClick={() => props.setStage(2)}>返回修改</button><button className="primary-cta" onClick={props.onSubmit}>开始生成</button></div></div>;
  if (props.taskState === "running") return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>视频生成中</h1></div><div className="status-visual"><img src={props.shot.image} width="941" height="1672" alt={props.shot.name} /><span className="render-ring"><i /></span><div><strong>正在合成场景</strong><small>68%</small></div></div><div className="progress-track"><i style={{ width: "68%" }} /></div><p className="status-note">预计还需 2 分钟</p><div className="sticky-cta"><button className="soft-cta" onClick={props.onMine}>查看我的创作</button></div></div>;
  if (props.taskState === "failed") return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>生成未完成</h1></div><div className="result-status failed"><span>!</span><strong>画面合成中断</strong><small>素材清晰度不足，请调整后重试</small></div><div className="sticky-cta split"><button className="ghost-cta" onClick={() => props.setStage(2)}>修改素材</button><button className="primary-cta" onClick={props.onSubmit}>重新生成</button></div></div>;
  return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>视频已完成</h1></div><button className="result-poster" onClick={props.onOpenResult}><img src={props.shot.image} width="941" height="1672" alt={props.shot.name} /><span><Icon name="play" size={24} /></span><div><strong>{props.shot.name}</strong><small>点击查看视频</small></div></button><div className="result-actions"><button onClick={props.onDownload}><Icon name="download" />下载</button><button onClick={props.onShare}><Icon name="share" />分享</button><button className={props.published ? "published" : ""} onClick={props.onPublish}><Icon name="gallery" />{props.published ? "已公开" : "发布"}</button></div></div>;
}

function Mine({ mineTab, setMineTab, works: mineWorks, onOpenTask, onOpenWork, onCreate, onShare, onDownload, onDelete, onExit }: { mineTab: "tasks" | "works"; setMineTab: (tab: "tasks" | "works") => void; works: Work[]; onOpenTask: (task: TaskItem) => void; onOpenWork: (work: Work) => void; onCreate: () => void; onShare: () => void; onDownload: () => void; onDelete: (work: Work) => void; onExit: () => void }) {
  return <section className="light-page mine-page"><Header title="我的" /><div className="profile"><div className="avatar">林</div><div><strong>林先生</strong><small>账号 138****6628 · 已登录</small></div><button onClick={onExit}>退出登录</button></div><div className="mine-tabs"><button className={mineTab === "tasks" ? "selected" : ""} onClick={() => setMineTab("tasks")}>创作任务</button><button className={mineTab === "works" ? "selected" : ""} onClick={() => setMineTab("works")}>我的作品</button></div>{mineTab === "tasks" ? <div className="task-list">{initialTasks.map((task) => <TaskRow key={task.id} task={task} onClick={() => onOpenTask(task)} />)}</div> : <div className="mine-work-list">{mineWorks.map((work) => <article key={work.id}><button className="work-main" onClick={() => onOpenWork(work)}><img src={work.image} width="941" height="1672" loading="lazy" alt={work.title} /><div><strong>{work.title}</strong><small>{work.scene} · {work.time}</small><span className={`visibility ${work.visibility === "公开展示" ? "public" : work.visibility === "发布中" ? "pending" : ""}`}>{work.visibility}</span></div></button><div className="work-quick"><IconButton name="download" label="下载" onClick={onDownload} /><IconButton name="share" label="分享" onClick={onShare} /><IconButton name="delete" label="删除" onClick={() => onDelete(work)} /></div></article>)}</div>}<button className="mine-create" onClick={onCreate}><Icon name="create" />生成新视频</button></section>;
}

function TaskRow({ task, onClick }: { task: TaskItem; onClick: () => void }) {
  const label = task.status === "running" ? "生成中" : task.status === "success" ? "已完成" : "生成失败";
  return <button className="task-row" onClick={onClick}><img src={task.image} width="941" height="1672" loading="lazy" alt={task.title} /><div><strong>{task.title}</strong><small>{task.scene} · {task.time}</small>{task.status === "running" && <span className="row-progress"><i style={{ width: `${task.progress}%` }} /></span>}</div><em className={task.status}>{label}</em></button>;
}

function TaskDetail({ item, onBack, onOpenWork, onRetry }: { item: TaskItem; onBack: () => void; onOpenWork: () => void; onRetry: () => void }) {
  const label = item.status === "running" ? "生成中" : item.status === "success" ? "已完成" : "生成失败";
  return <section className="light-page detail-page"><Header title="任务详情" back={onBack} /><div className="task-cover"><img src={item.image} width="941" height="1672" alt={item.title} /><span className={item.status}>{label}</span></div><section className="detail-info"><h1>{item.title}</h1><div><span>场景</span><strong>{item.scene}</strong></div><div><span>提交时间</span><strong>{item.time}</strong></div><div><span>当前状态</span><strong>{label}</strong></div></section>{item.status === "running" && <><div className="progress-track"><i style={{ width: `${item.progress}%` }} /></div><p className="status-note">正在合成场景 · {item.progress}%</p></>}{item.status === "failed" && <div className="failure-reason"><strong>画面合成中断</strong><small>素材清晰度不足，请调整后重试</small></div>}<div className="detail-bottom">{item.status === "success" ? <button className="primary-cta" onClick={onOpenWork}>查看视频</button> : item.status === "failed" ? <button className="primary-cta" onClick={onRetry}>重新生成</button> : <button className="soft-cta" onClick={onBack}>返回我的创作</button>}</div></section>;
}

function WorkViewer({ work, mineMode, onBack, onCreate, onShare, onDownload, onDelete, isPublic, onPublish }: { work: Work; mineMode: boolean; onBack: () => void; onCreate: () => void; onShare: () => void; onDownload: () => void; onDelete: () => void; isPublic: boolean; onPublish: () => void }) {
  const [playing, setPlaying] = useState(true);
  const toggle = () => setPlaying((value) => !value);
  return <section className="work-viewer"><button className="viewer-media" onClick={toggle} aria-label={playing ? "暂停视频" : "播放视频"}><CinematicLoop work={work} playing={playing} /></button><div className="viewer-shade" /><header><IconButton name="back" label="返回" onClick={onBack} /><strong>作品详情</strong><IconButton name="share" label="分享" onClick={onShare} /></header><button className="viewer-play" onClick={toggle} aria-label={playing ? "暂停" : "播放"}><Icon name={playing ? "pause" : "play"} size={26} /></button><div className="viewer-copy"><div className="tag-row">{work.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><h1>{work.title}</h1><p>{work.line}</p>{mineMode ? <div className="viewer-actions"><button onClick={onDownload}><Icon name="download" />下载</button><button onClick={onShare}><Icon name="share" />分享</button><button onClick={onPublish}><Icon name="gallery" />{isPublic ? "取消公开" : "公开"}</button><button onClick={onDelete}><Icon name="delete" />删除</button></div> : <button className="same-style viewer-cta" onClick={onCreate}>生成同款视频 <Icon name="create" size={18} /></button>}</div></section>;
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  return <nav className="bottom-nav" aria-label="主菜单"><button className={tab === "gallery" ? "active" : ""} onClick={() => setTab("gallery")}><Icon name="gallery" /><span>作品展示</span></button><button className={`create-nav ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}><i><Icon name="create" size={25} /></i><span>视频生成</span></button><button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}><Icon name="mine" /><span>我的</span></button></nav>;
}

function Sheet({ kind, onClose, onContinue, onProgress, onGallery, onVerify, onTask, onSample, onPublish, onDelete }: { kind: "states" | "busy" | "publish" | "unpublish" | "delete"; onClose: () => void; onContinue: () => void; onProgress: () => void; onGallery?: (mode: GalleryMode) => void; onVerify?: (state: VerifyState) => void; onTask?: (state: TaskState | null) => void; onSample?: () => void; onPublish: () => void; onDelete: () => void }) {
  if (kind === "busy") return <div className="sheet-layer" role="dialog" aria-modal="true"><section className="sheet"><IconButton name="close" label="关闭" onClick={onClose} /><div className="sheet-icon"><Icon name="retry" size={25} /></div><h2>已有视频正在生成中</h2><div className="sheet-actions"><button className="soft-cta" onClick={onProgress}>查看生成进度</button><button className="primary-cta" onClick={onContinue}>继续生成</button></div></section></div>;
  if (kind === "publish") return <div className="sheet-layer" role="dialog" aria-modal="true"><section className="sheet"><IconButton name="close" label="关闭" onClick={onClose} /><div className="sheet-icon"><Icon name="gallery" size={25} /></div><h2>公开到作品展示？</h2><p>公开后，其他用户可以观看和分享这支视频。</p><div className="sheet-actions"><button className="soft-cta" onClick={onClose}>暂不公开</button><button className="primary-cta" onClick={onPublish}>确认公开</button></div></section></div>;
  if (kind === "unpublish") return <div className="sheet-layer" role="dialog" aria-modal="true"><section className="sheet"><IconButton name="close" label="关闭" onClick={onClose} /><div className="sheet-icon"><Icon name="gallery" size={25} /></div><h2>取消公开展示？</h2><p>取消后，这支视频仅自己可见。</p><div className="sheet-actions"><button className="soft-cta" onClick={onClose}>保持公开</button><button className="primary-cta" onClick={onPublish}>确认取消</button></div></section></div>;
  if (kind === "delete") return <div className="sheet-layer" role="dialog" aria-modal="true"><section className="sheet"><IconButton name="close" label="关闭" onClick={onClose} /><div className="sheet-icon danger"><Icon name="delete" size={25} /></div><h2>删除这支作品？</h2><p>删除后无法恢复。</p><div className="sheet-actions"><button className="soft-cta" onClick={onClose}>取消</button><button className="danger-cta" onClick={onDelete}>确认删除</button></div></section></div>;
  return <div className="sheet-layer" role="dialog" aria-modal="true"><section className="sheet state-sheet"><IconButton name="close" label="关闭" onClick={onClose} /><h2>状态预览</h2><strong>作品展示</strong><div className="state-options">{(["works", "loading", "empty", "failed"] as GalleryMode[]).map((mode, index) => <button key={mode} onClick={() => { onGallery?.(mode); onClose(); }}>{["正常", "加载中", "暂无作品", "载入失败"][index]}</button>)}</div><strong>上传素材</strong><div className="state-options"><button onClick={() => { onSample?.(); onClose(); }}>填充测试素材</button></div><strong>本人核验</strong><div className="state-options">{(["checking", "passed", "failed"] as VerifyState[]).map((state, index) => <button key={state} onClick={() => { onVerify?.(state); onClose(); }}>{["核验中", "已通过", "未通过"][index]}</button>)}</div><strong>视频生成</strong><div className="state-options">{(["running", "success", "failed"] as TaskState[]).map((state, index) => <button key={state} onClick={() => { onTask?.(state); onClose(); }}>{["生成中", "已完成", "生成失败"][index]}</button>)}</div></section></div>;
}

function Toast({ text }: { text: string }) {
  return <div className="toast" role="status">{text}</div>;
}
