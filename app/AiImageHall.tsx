import {
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type Tab = "gallery" | "create" | "mine";
type Stage = 1 | 2 | 3;
type VerifyState = "idle" | "checking" | "passed" | "failed";
type TaskState = "pending" | "running" | "success" | "failed" | "cancelled" | "retrying";
type Motion = "" | "up" | "down" | "left" | "right";
type IconName = "gallery" | "create" | "mine" | "back" | "share" | "download" | "delete" | "play" | "pause" | "check" | "upload" | "retry" | "close";

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
  memoryIds: string[];
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
    id: "home",
    name: "我住在",
    image: asset("images/v4/live-futian.jpg"),
    shots: [
      {
        id: "live-futian",
        name: "福田",
        tag: "城市精英",
        image: asset("images/v4/live-futian.jpg"),
        lines: ["客户面前是精英；客户一走，腰先离职。"],
      },
      {
        id: "live-nanshan",
        name: "南山",
        tag: "科技夜班",
        image: asset("images/v4/live-nanshan.jpg"),
        lines: ["Bug一个没少，头发挺有执行力，说走就走。"],
      },
      {
        id: "live-longhua",
        name: "龙华",
        tag: "通勤日常",
        image: asset("images/v4/live-longhua.jpg"),
        lines: ["龙华到公司八站，脸型换八次，工伤不好定责。"],
      },
    ],
  },
  {
    id: "food",
    name: "我的续命补给",
    image: asset("images/v4/eat-muffin.jpg"),
    shots: [
      {
        id: "eat-muffin",
        name: "猪柳蛋",
        tag: "早餐续航",
        image: asset("images/v4/eat-muffin.jpg"),
        lines: ["猪柳蛋差点替我刷闸，比我清醒，也比我像工牌。"],
      },
      {
        id: "eat-pork-rice",
        name: "隆江猪脚饭",
        tag: "打工人回血",
        image: asset("images/v4/eat-pork-rice.jpg"),
        lines: ["不辣，余额有点刺眼。"],
      },
      {
        id: "eat-milk-tea",
        name: "续命奶茶",
        tag: "一口回魂",
        image: asset("images/v4/eat-milk-tea.jpg"),
        lines: ["奶茶刚把命续上，老板顺手拔了电源。"],
      },
    ],
  },
  {
    id: "place",
    name: "我的精神打卡地",
    image: asset("images/v4/place-fanshen.jpg"),
    shots: [
      {
        id: "place-fanshen",
        name: "翻身站",
        tag: "深圳玄学",
        image: asset("images/v4/place-fanshen.jpg"),
        lines: ["听说在翻身站转一圈，能转运。运还没转，车先走了。"],
      },
      {
        id: "place-restroom",
        name: "写字楼卫生间",
        tag: "短暂避风港",
        image: asset("images/v4/place-restroom.jpg"),
        lines: ["卫生间，按分钟出租的深圳豪宅。下次假期一定出去玩。"],
      },
      {
        id: "place-shenzhen-bay",
        name: "深圳湾公园",
        tag: "晚风治愈",
        image: asset("images/v4/place-shenzhen-bay.jpg"),
        lines: ["老板消息秒回，Bug倒是一动不动。项目可以延期，晚霞不行。"],
      },
    ],
  },
];

const memoryById = (id: string) => scenes.flatMap((scene) => scene.shots).find((shot) => shot.id === id) ?? scenes[0].shots[0];

const works: Work[] = [
  { id: "work-futian-pork-bay", title: "我在深圳的生活", sceneId: "home", shotId: "live-futian", scene: "深圳记忆", duration: "30秒", image: asset("images/v4/live-futian.jpg"), line: "住在福田，靠猪脚饭回血，在深圳湾吹晚风。", tags: ["福田", "隆江猪脚饭", "深圳湾公园"], memoryIds: ["live-futian", "eat-pork-rice", "place-shenzhen-bay"], visibility: "公开展示", time: "8月4日" },
  { id: "work-nanshan-tea-rest", title: "南山续命日常", sceneId: "home", shotId: "live-nanshan", scene: "深圳记忆", duration: "30秒", image: asset("images/v4/live-nanshan.jpg"), line: "凌晨的南山，一杯奶茶和五分钟安静就能重新开机。", tags: ["南山", "续命奶茶", "写字楼卫生间"], memoryIds: ["live-nanshan", "eat-milk-tea", "place-restroom"], visibility: "仅自己可见", time: "8月3日" },
  { id: "work-longhua-muffin-fanshen", title: "通勤人的翻身愿望", sceneId: "home", shotId: "live-longhua", scene: "深圳记忆", duration: "30秒", image: asset("images/v4/live-longhua.jpg"), line: "从龙华出发，带着猪柳蛋，在翻身站许一个愿望。", tags: ["龙华", "猪柳蛋", "翻身站"], memoryIds: ["live-longhua", "eat-muffin", "place-fanshen"], visibility: "发布中", time: "8月2日" },
  { id: "work-futian-tea-bay", title: "精英下班以后", sceneId: "home", shotId: "live-futian", scene: "深圳记忆", duration: "30秒", image: asset("images/v4/place-shenzhen-bay.jpg"), line: "福田的白天很快，深圳湾的晚风刚刚好。", tags: ["福田", "续命奶茶", "深圳湾公园"], memoryIds: ["live-futian", "eat-milk-tea", "place-shenzhen-bay"], visibility: "公开展示", time: "8月1日" },
  { id: "work-nanshan-pork-fanshen", title: "南山翻身计划", sceneId: "home", shotId: "live-nanshan", scene: "深圳记忆", duration: "30秒", image: asset("images/v4/eat-pork-rice.jpg"), line: "代码没写完，猪脚饭吃完了，翻身的愿望还在。", tags: ["南山", "隆江猪脚饭", "翻身站"], memoryIds: ["live-nanshan", "eat-pork-rice", "place-fanshen"], visibility: "公开展示", time: "7月31日" },
  { id: "work-longhua-muffin-bay", title: "从早高峰到晚霞", sceneId: "home", shotId: "live-longhua", scene: "深圳记忆", duration: "30秒", image: asset("images/v4/place-shenzhen-bay.jpg"), line: "挤过早高峰，也要赶上深圳湾的晚霞。", tags: ["龙华", "猪柳蛋", "深圳湾公园"], memoryIds: ["live-longhua", "eat-muffin", "place-shenzhen-bay"], visibility: "仅自己可见", time: "7月30日" },
];

const initialTasks: TaskItem[] = [
  { id: "task-pending", title: "等待管理员确认", scene: "福田 · 猪柳蛋 · 深圳湾公园", image: asset("images/v4/live-futian.jpg"), status: "pending", time: "今天 15:18" },
  { id: "task-running", title: "南山续命日常", scene: "南山 · 续命奶茶 · 写字楼卫生间", image: asset("images/v4/live-nanshan.jpg"), status: "running", time: "今天 14:20", progress: 68 },
  { id: "task-success", title: "我在深圳的生活", scene: "福田 · 隆江猪脚饭 · 深圳湾公园", image: asset("images/v4/live-futian.jpg"), status: "success", time: "8月3日 18:42", workId: "work-futian-pork-bay" },
  { id: "task-failed", title: "通勤人的翻身愿望", scene: "龙华 · 猪柳蛋 · 翻身站", image: asset("images/v4/live-longhua.jpg"), status: "failed", time: "8月2日 09:08" },
  { id: "task-cancelled", title: "已取消的生成任务", scene: "南山 · 隆江猪脚饭 · 翻身站", image: asset("images/v4/live-nanshan.jpg"), status: "cancelled", time: "8月1日 16:30" },
];

const taskStatusLabel: Record<TaskState, string> = {
  pending: "待管理员确认",
  running: "生成中",
  success: "已完成",
  failed: "生成失败",
  cancelled: "已取消",
  retrying: "重试中",
};

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "gallery") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="5" /><path d="M7 15l3-3 2 2 3-4 3 5" /></svg>;
  if (name === "create") return <svg {...common}><path d="M12 3v18M3 12h18" /></svg>;
  if (name === "mine") return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>;
  if (name === "back") return <svg {...common}><path d="M15 18l-6-6 6-6" /></svg>;
  if (name === "share") return <svg {...common}><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="M8 11l8-5M8 13l8 5" /></svg>;
  if (name === "download") return <svg {...common}><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" /></svg>;
  if (name === "delete") return <svg {...common}><path d="M4 7h16M9 7V4h6v3m3 0l-1 14H7L6 7m4 4v6m4-6v6" /></svg>;
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
  const memories = work.memoryIds.map(memoryById);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFrame((current) => (current + 1) % memories.length), 2800);
    return () => window.clearInterval(timer);
  }, [playing, memories.length]);
  const shot = memories[frame] ?? memories[0];
  return <div className={`cinematic-loop ${playing ? "playing" : "paused"}`}><img key={shot.id} src={shot.image} width="941" height="1672" alt="" /></div>;
}

function Header({ title, dark = false, back }: { title: string; dark?: boolean; back?: () => void }) {
  return <header className={`app-header ${dark ? "dark" : ""}`}>
    <div>{back && <IconButton name="back" label="返回" onClick={back} />}</div>
    <strong>{title}</strong>
    <div />
  </header>;
}

export default function AiImageHall() {
  const [tab, setTab] = useState<Tab>("gallery");
  const [stage, setStage] = useState<Stage>(1);
  const [memorySelections, setMemorySelections] = useState<Record<string, string>>({ home: "", food: "", place: "" });
  const [detailWork, setDetailWork] = useState<Work | null>(null);
  const [shareWork, setShareWork] = useState<Work | null>(() => window.location.pathname.includes("/share/") ? works[0] : null);
  const [taskDetail, setTaskDetail] = useState<TaskItem | null>(null);
  const [mineTab, setMineTab] = useState<"tasks" | "works">("tasks");
  const [taskState, setTaskState] = useState<TaskState | null>(null);
  const [published, setPublished] = useState(false);
  const [consent, setConsent] = useState(false);
  const [face, setFace] = useState<string | null>(null);
  const [verify, setVerify] = useState<VerifyState>("idle");
  const [appearance, setAppearance] = useState<"auto" | "upload">("auto");
  const [appearanceImage, setAppearanceImage] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"busy" | "publish" | "unpublish" | "delete" | null>(null);
  const [toast, setToast] = useState("");
  const [deleted, setDeleted] = useState<string[]>([]);
  const [visibilityOverrides] = useState<Record<string, boolean>>({});
  const faceInput = useRef<HTMLInputElement>(null);
  const appearanceInput = useRef<HTMLInputElement>(null);

  const selectedMemories = scenes.map((scene) => scene.shots.find((shot) => shot.id === memorySelections[scene.id])).filter((shot): shot is Shot => Boolean(shot));
  const visibleWorks = works.filter((work) => !deleted.includes(work.id));
  const selectedWork = works.find((work) => work.memoryIds.every((id) => selectedMemories.some((memory) => memory.id === id))) ?? works[0];
  const currentTask: TaskItem | null = taskState ? {
    id: "task-current",
    title: "我在深圳的生活",
    scene: selectedMemories.map((memory) => memory.name).join(" · ") || "记忆组合待确认",
    image: selectedMemories[0]?.image ?? asset("images/v4/live-futian.jpg"),
    status: taskState,
    time: "刚刚",
    progress: taskState === "running" || taskState === "retrying" ? 68 : undefined,
  } : null;
  const taskItems = currentTask ? [currentTask, ...initialTasks] : initialTasks;
  const theme = tab === "gallery" || detailWork ? "dark" : "light";
  const canNext = Boolean(consent && face && verify === "passed" && (appearance === "auto" || appearanceImage));
  const canConfirmMemories = selectedMemories.length === scenes.length;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => {
    if (face?.startsWith("blob:")) URL.revokeObjectURL(face);
  }, [face]);

  useEffect(() => () => {
    if (appearanceImage?.startsWith("blob:")) URL.revokeObjectURL(appearanceImage);
  }, [appearanceImage]);

  const chooseMemory = (layerId: string, shotId: string) => setMemorySelections((current) => ({ ...current, [layerId]: shotId }));

  const goCreate = (work?: Work) => {
    if (work) {
      const nextSelections = Object.fromEntries(scenes.map((scene) => [scene.id, work.memoryIds.find((id) => scene.shots.some((shot) => shot.id === id)) ?? ""]));
      setMemorySelections(nextSelections);
    } else {
      setMemorySelections({ home: "", food: "", place: "" });
    }
    setDetailWork(null);
    setShareWork(null);
    setTaskDetail(null);
    setTaskState(null);
    setPublished(false);
    setConsent(false);
    setFace(null);
    setVerify("idle");
    setAppearance("auto");
    setAppearanceImage(null);
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

  const submitGeneration = () => {
    setTaskState("pending");
    setToast("已提交，等待 Mac 管理员确认");
  };
  const continueGeneration = () => {
    setSheet(null);
    setTaskState("running");
    setToast("管理员已确认，任务进入生成中");
  };
  const download = () => setToast("开始下载视频");
  const copyShareLink = async () => {
    const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}share/demo-share/`;
    try {
      await navigator.clipboard?.writeText(shareUrl);
      setToast("分享链接已复制");
    } catch {
      setToast("分享链接已准备好");
    }
  };

  const openTaskWork = (item: TaskItem) => {
    if (!item.workId) return;
    const work = works.find((candidate) => candidate.id === item.workId);
    if (work) {
      setTaskDetail(null);
      setDetailWork(work);
    }
  };

  if (shareWork) {
    return <div className="prototype-frame light-frame"><SharePage work={shareWork} onBack={() => setShareWork(null)} onShare={() => setToast("分享面板已打开")} onCopy={copyShareLink} />{toast && <Toast text={toast} />}</div>;
  }

  if (detailWork) {
    const isPublic = visibilityOverrides[detailWork.id] ?? detailWork.visibility === "公开展示";
    return <div className="prototype-frame dark-frame"><WorkViewer work={detailWork} mineMode={tab === "mine"} onBack={() => setDetailWork(null)} onCreate={() => goCreate(detailWork)} onShare={() => setShareWork(detailWork)} onDownload={download} onDelete={() => setSheet("delete")} isPublic={isPublic} onPublish={() => setSheet(isPublic ? "unpublish" : "publish")} />{sheet && <Sheet kind={sheet} onClose={() => setSheet(null)} onContinue={continueGeneration} onProgress={() => {}} onPublish={() => { setSheet(null); setToast(sheet === "publish" ? "公开申请已提交后台审核" : "撤回申请已提交后台处理"); }} onDelete={() => { setDeleted((items) => [...items, detailWork.id]); setDetailWork(null); setSheet(null); setToast("已从我的作品中移除"); }} />}{toast && <Toast text={toast} />}</div>;
  }

  if (taskDetail) {
    return <div className="prototype-frame light-frame"><TaskDetail item={taskDetail} onBack={() => setTaskDetail(null)} onOpenWork={() => openTaskWork(taskDetail)} onRetry={() => { setTaskDetail(null); goCreate(); }} />{toast && <Toast text={toast} />}</div>;
  }

  return <div className={`prototype-frame ${theme}-frame`}>
    <a className="skip-link" href="#main-content">跳到主要内容</a>
    <main id="main-content" className="app-main">
      {tab === "gallery" && <Gallery works={visibleWorks} onOpen={setDetailWork} onCreate={goCreate} />}
      {tab === "create" && <CreateFlow stage={stage} setStage={setStage} memorySelections={memorySelections} selectedMemories={selectedMemories} chooseMemory={chooseMemory} canConfirmMemories={canConfirmMemories} consent={consent} setConsent={setConsent} face={face} faceInput={faceInput} addFile={addFile} verify={verify} appearance={appearance} setAppearance={setAppearance} appearanceImage={appearanceImage} appearanceInput={appearanceInput} canNext={canNext} taskState={taskState} published={published} onSubmit={submitGeneration} onOpenResult={() => setDetailWork(selectedWork)} onMine={() => { setTab("mine"); setMineTab("tasks"); }} onPublish={() => setSheet("publish")} onDownload={download} onShare={() => setShareWork(selectedWork)} />}
      {tab === "mine" && <Mine mineTab={mineTab} setMineTab={setMineTab} tasks={taskItems} works={visibleWorks.slice(0, 4)} onOpenTask={setTaskDetail} onOpenWork={setDetailWork} onCreate={() => goCreate()} onShare={setShareWork} onDownload={download} onDelete={(work) => { setDetailWork(work); setSheet("delete"); }} onExit={() => setToast("已退出登录")} />}
    </main>
    {!sheet && <BottomNav tab={tab} setTab={(next) => { setTab(next); if (next === "create") setStage(1); }} />}
    {sheet && <Sheet kind={sheet} onClose={() => setSheet(null)} onContinue={continueGeneration} onProgress={() => { setSheet(null); setTab("mine"); setMineTab("tasks"); }} onPublish={() => { setPublished(true); setSheet(null); setToast("公开申请已提交后台审核"); }} onDelete={() => setSheet(null)} />}
    {toast && <Toast text={toast} />}
  </div>;
}

function Gallery({ works: items, onOpen, onCreate }: { works: Work[]; onOpen: (work: Work) => void; onCreate: (work?: Work) => void }) {
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

  if (!active) return <section className="gallery-page"><GalleryHeader /><div className="state-card"><div className="state-symbol"><Icon name="gallery" size={28} /></div><h2>还没有作品</h2><button className="solid-button" onClick={() => onCreate()}>生成第一支视频</button></div></section>;

  const back1 = items[(safeIndex + 1) % items.length];
  const back2 = items[(safeIndex + 2) % items.length];
  return <section className="gallery-page">
    <GalleryHeader />
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
    </div>
  </section>;
}

function GalleryHeader() {
  return <header className="gallery-header"><div><small>深圳AI影像馆</small><h1>作品展示</h1></div></header>;
}

type CreateFlowProps = {
  stage: Stage;
  setStage: (stage: Stage) => void;
  memorySelections: Record<string, string>;
  selectedMemories: Shot[];
  chooseMemory: (layerId: string, shotId: string) => void;
  canConfirmMemories: boolean;
  consent: boolean;
  setConsent: (value: boolean) => void;
  face: string | null;
  faceInput: React.RefObject<HTMLInputElement | null>;
  addFile: (event: ChangeEvent<HTMLInputElement>, target: "face" | "appearance") => void;
  verify: VerifyState;
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
};

function CreateFlow(props: CreateFlowProps) {
  const pageRef = useRef<HTMLElement>(null);
  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    pageRef.current?.closest<HTMLElement>(".prototype-frame")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [props.stage]);
  return <section ref={pageRef} className="light-page create-page">
    <Header title="视频生成" />
    <StepBar stage={props.stage} />
    {props.stage === 1 && <MaterialStep {...props} />}
    {props.stage === 2 && <SceneStep {...props} />}
    {props.stage === 3 && <GenerationStep {...props} />}
  </section>;
}

function StepBar({ stage }: { stage: Stage }) {
  const labels = ["上传素材", "选择记忆", "视频生成"];
  return <div className="step-bar" aria-label="视频生成步骤">{labels.map((label, index) => <div key={label} aria-current={index + 1 === stage ? "step" : undefined} className={index + 1 === stage ? "active" : index + 1 < stage ? "done" : ""}><i>{index + 1 < stage ? <Icon name="check" size={13} /> : index + 1}</i><span>{label}</span></div>)}</div>;
}

function MaterialStep(props: CreateFlowProps) {
  const verifyCopy = props.verify === "checking" ? ["核验中", "请保持页面开启"] : props.verify === "passed" ? ["核验已通过", "可以继续下一步"] : props.verify === "failed" ? ["核验未通过", "请更换清晰照片"] : ["等待本人核验", "上传照片后自动开始"];
  return <div className="flow-body material-flow">
    <div className="flow-title"><span>第一步</span><h1>上传素材</h1></div>
    <button className="glass-card upload-row" onClick={() => props.faceInput.current?.click()}>{props.face ? <img src={props.face} width="941" height="1672" alt="人脸照片" /> : <span className="upload-placeholder"><Icon name="upload" /></span>}<div><strong>{props.face ? "人脸照片已上传" : "上传人脸照片"}</strong><small>正脸 · 单人 · 清晰无遮挡</small></div><Icon name="upload" /></button>
    <input ref={props.faceInput} className="hidden-input" type="file" name="face_photo" aria-label="选择人脸照片" autoComplete="off" accept="image/jpeg,image/png" onChange={(event) => props.addFile(event, "face")} />
    <div className={`glass-card verify-row ${props.verify}`}><span>{props.verify === "checking" ? <i className="mini-spinner" /> : props.verify === "passed" ? <Icon name="check" size={17} /> : props.verify === "failed" ? "!" : "·"}</span><div><strong>{verifyCopy[0]}</strong><small>{verifyCopy[1]}</small></div>{props.verify === "failed" && <button onClick={() => props.faceInput.current?.click()}>重新上传</button>}</div>
    <section className="glass-card appearance-card"><header><strong>人物形象</strong><small>选择一种生成方式</small></header><div className="choice-grid"><button className={props.appearance === "auto" ? "selected" : ""} onClick={() => props.setAppearance("auto")}><span className="spark">✦</span><strong>自动生成</strong><small>按场景匹配</small></button><button className={props.appearance === "upload" ? "selected" : ""} onClick={() => props.setAppearance("upload")}><Icon name="upload" /><strong>上传形象图</strong><small>服装或全身照</small></button></div>{props.appearance === "upload" && <button className="appearance-upload" onClick={() => props.appearanceInput.current?.click()}>{props.appearanceImage ? <img src={props.appearanceImage} width="941" height="1672" alt="已上传形象" /> : <Icon name="upload" />}<span>{props.appearanceImage ? "形象图已上传" : "选择形象图"}</span></button>}<input ref={props.appearanceInput} className="hidden-input" type="file" name="appearance_photo" aria-label="选择人物形象图" autoComplete="off" accept="image/jpeg,image/png" onChange={(event) => props.addFile(event, "appearance")} /></section>
    <div className="sticky-cta material-cta"><label className={`inline-consent ${props.consent ? "selected" : ""}`}><input type="checkbox" name="material_authorization" checked={props.consent} onChange={(event) => props.setConsent(event.target.checked)} /><i>{props.consent && <Icon name="check" size={13} />}</i><span>确认素材授权</span></label><button className="primary-cta" disabled={!props.canNext} onClick={() => props.setStage(2)}>下一步</button></div>
  </div>;
}

function SceneStep(props: CreateFlowProps) {
  return <div className="flow-body scene-flow">
    <div className="flow-title memory-title"><span>第二步</span><h1>选择记忆</h1><p>居住、续命补给、精神打卡地各选一项，与固定开场组成完整30秒视频。</p></div>
    <div className="memory-layers">{scenes.map((scene, layerIndex) => <section className="glass-card memory-layer" key={scene.id}><header><div><i>0{layerIndex + 1}</i><strong>{scene.name}</strong></div><small>{props.memorySelections[scene.id] ? "已选择" : "三选一"}</small></header><div className="memory-options">{scene.shots.map((shot) => { const selected = props.memorySelections[scene.id] === shot.id; return <button type="button" key={shot.id} aria-pressed={selected} className={selected ? "selected" : ""} onClick={() => props.chooseMemory(scene.id, shot.id)}><img src={shot.image} width="941" height="1672" loading="lazy" alt={shot.name} /><span><strong>{shot.name}</strong><small>{shot.tag}</small></span>{selected && <i><Icon name="check" size={13} /></i>}</button>; })}</div></section>)}</div>
    <div className="sticky-cta split"><button className="ghost-cta" onClick={() => props.setStage(1)}>上一步</button><button className="primary-cta" disabled={!props.canConfirmMemories} onClick={() => props.setStage(3)}>完成选择</button></div>
  </div>;
}

function GenerationStep(props: CreateFlowProps) {
  const primaryMemory = props.selectedMemories[0] ?? scenes[0].shots[0];
  const memoryNames = props.selectedMemories.map((memory) => memory.name).join(" · ");
  if (!props.taskState) return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>确认提交</h1></div><div className="summary-memory-grid">{props.selectedMemories.map((memory, index) => <div key={memory.id}><img src={memory.image} width="941" height="1672" alt={memory.name} /><span><small>{["居住模块", "续命补给", "精神打卡地"][index]}</small><strong>{memory.name}</strong></span></div>)}</div><section className="summary-card"><div><span>固定开场</span><strong>稳定，稳定地搬家 · 6秒</strong></div><div><span>我的组合</span><strong>{memoryNames}</strong></div><div><span>视频时长</span><strong>30秒</strong></div><div><span>人物形象</span><strong>{props.appearance === "auto" ? "自动生成" : "已上传形象图"}</strong></div></section><p className="status-note">提交后先进入“待管理员确认”，Mac管理员核对素材、授权与本人核验后才会开始生成。</p><div className="sticky-cta split"><button className="ghost-cta" onClick={() => props.setStage(2)}>返回修改</button><button className="primary-cta" onClick={props.onSubmit}>提交生成申请</button></div></div>;
  if (props.taskState === "pending") return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>等待管理员确认</h1></div><div className="result-status pending"><span>⌛</span><strong>生成申请已提交</strong><small>Mac管理员将核对素材、三层选择、授权与本人核验状态</small></div><section className="summary-card"><div><span>组合</span><strong>{memoryNames}</strong></div><div><span>当前状态</span><strong>待管理员确认</strong></div><div><span>真实生成</span><strong>尚未开始</strong></div></section><div className="sticky-cta"><button className="soft-cta" onClick={props.onMine}>查看我的任务</button></div></div>;
  if (props.taskState === "cancelled") return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>任务已取消</h1></div><div className="result-status failed"><span>×</span><strong>本次申请未进入生成</strong><small>素材仍按Demo长期保存策略保留，可返回修改后重新提交</small></div><div className="sticky-cta"><button className="primary-cta" onClick={() => props.setStage(1)}>修改后重新提交</button></div></div>;
  if (props.taskState === "retrying") return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>重试任务生成中</h1></div><div className="status-visual"><img src={primaryMemory.image} width="941" height="1672" alt={primaryMemory.name} /><span className="render-ring"><i /></span><div><strong>正在重新合成30秒组合</strong><small>68%</small></div></div><div className="progress-track"><i style={{ width: "68%" }} /></div><div className="sticky-cta"><button className="soft-cta" onClick={props.onMine}>查看我的任务</button></div></div>;
  if (props.taskState === "running") return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>视频生成中</h1></div><div className="status-visual"><img src={primaryMemory.image} width="941" height="1672" alt={primaryMemory.name} /><span className="render-ring"><i /></span><div><strong>正在合成记忆片段</strong><small>68%</small></div></div><div className="progress-track"><i style={{ width: "68%" }} /></div><p className="status-note">预计还需 2 分钟</p><div className="sticky-cta"><button className="soft-cta" onClick={props.onMine}>查看我的创作</button></div></div>;
  if (props.taskState === "failed") return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>生成未完成</h1></div><div className="result-status failed"><span>!</span><strong>画面合成中断</strong><small>素材清晰度不足，请调整后重试</small></div><div className="sticky-cta split"><button className="ghost-cta" onClick={() => props.setStage(1)}>修改素材</button><button className="primary-cta" onClick={props.onSubmit}>重新生成</button></div></div>;
  return <div className="flow-body generation-flow"><div className="flow-title"><span>第三步</span><h1>视频已完成</h1></div><button className="result-poster" onClick={props.onOpenResult}><img src={primaryMemory.image} width="941" height="1672" alt={primaryMemory.name} /><span><Icon name="play" size={24} /></span><div><strong>我在深圳的生活</strong><small>30秒 · 点击查看视频</small></div></button><div className="result-actions"><button onClick={props.onDownload}><Icon name="download" />下载</button><button onClick={props.onShare}><Icon name="share" />分享</button><button className={props.published ? "published" : ""} onClick={props.onPublish} disabled={props.published}><Icon name="gallery" />{props.published ? "审核中" : "申请公开"}</button></div></div>;
}

function Mine({ mineTab, setMineTab, tasks, works: mineWorks, onOpenTask, onOpenWork, onCreate, onShare, onDownload, onDelete, onExit }: { mineTab: "tasks" | "works"; setMineTab: (tab: "tasks" | "works") => void; tasks: TaskItem[]; works: Work[]; onOpenTask: (task: TaskItem) => void; onOpenWork: (work: Work) => void; onCreate: () => void; onShare: (work: Work) => void; onDownload: () => void; onDelete: (work: Work) => void; onExit: () => void }) {
  return <section className="light-page mine-page"><Header title="我的" /><div className="profile"><div className="avatar">林</div><div><strong>林先生</strong><small>账号 138****6628 · 已登录</small></div><button onClick={onExit}>退出登录</button></div><div className="mine-tabs"><button className={mineTab === "tasks" ? "selected" : ""} onClick={() => setMineTab("tasks")}>创作任务</button><button className={mineTab === "works" ? "selected" : ""} onClick={() => setMineTab("works")}>我的作品</button></div>{mineTab === "tasks" ? <div className="task-list">{tasks.map((task) => <TaskRow key={task.id} task={task} onClick={() => onOpenTask(task)} />)}</div> : <div className="mine-work-list">{mineWorks.map((work) => <article key={work.id}><button className="work-main" onClick={() => onOpenWork(work)}><img src={work.image} width="941" height="1672" loading="lazy" alt={work.title} /><div><strong>{work.title}</strong><small>{work.scene} · {work.time}</small><span className={`visibility ${work.visibility === "公开展示" ? "public" : work.visibility === "发布中" ? "pending" : ""}`}>{work.visibility}</span></div></button><div className="work-quick"><IconButton name="download" label="下载" onClick={onDownload} /><IconButton name="share" label={`分享${work.title}`} onClick={() => onShare(work)} /><IconButton name="delete" label="删除" onClick={() => onDelete(work)} /></div></article>)}</div>}<button className="mine-create" onClick={onCreate}><Icon name="create" />生成新视频</button></section>;
}

function TaskRow({ task, onClick }: { task: TaskItem; onClick: () => void }) {
  const label = taskStatusLabel[task.status];
  return <button className="task-row" onClick={onClick}><img src={task.image} width="941" height="1672" loading="lazy" alt={task.title} /><div><strong>{task.title}</strong><small>{task.scene} · {task.time}</small>{(task.status === "running" || task.status === "retrying") && <span className="row-progress"><i style={{ width: `${task.progress}%` }} /></span>}</div><em className={task.status}>{label}</em></button>;
}

function TaskDetail({ item, onBack, onOpenWork, onRetry }: { item: TaskItem; onBack: () => void; onOpenWork: () => void; onRetry: () => void }) {
  const label = taskStatusLabel[item.status];
  return <section className="light-page detail-page"><Header title="任务详情" back={onBack} /><div className="task-cover"><img src={item.image} width="941" height="1672" alt={item.title} /><span className={item.status}>{label}</span></div><section className="detail-info"><h1>{item.title}</h1><div><span>记忆组合</span><strong>{item.scene}</strong></div><div><span>视频结构</span><strong>固定开场＋三层选择 · 30秒</strong></div><div><span>提交时间</span><strong>{item.time}</strong></div><div><span>当前状态</span><strong>{label}</strong></div></section>{item.status === "pending" && <div className="failure-reason pending"><strong>等待 Mac 管理员确认</strong><small>确认前不会调用生成服务，也不会进入生成中。</small></div>}{(item.status === "running" || item.status === "retrying") && <><div className="progress-track"><i style={{ width: `${item.progress}%` }} /></div><p className="status-note">正在合成30秒记忆组合 · {item.progress}%</p></>}{item.status === "failed" && <div className="failure-reason"><strong>画面合成中断</strong><small>素材清晰度不足，请调整后重试</small></div>}{item.status === "cancelled" && <div className="failure-reason"><strong>管理员已取消本次申请</strong><small>你可以修改素材或组合后重新提交。</small></div>}<div className="detail-bottom">{item.status === "success" ? <button className="primary-cta" onClick={onOpenWork}>查看视频</button> : item.status === "failed" || item.status === "cancelled" ? <button className="primary-cta" onClick={onRetry}>修改后重新提交</button> : <button className="soft-cta" onClick={onBack}>返回我的创作</button>}</div></section>;
}

function SharePage({ work, onBack, onShare, onCopy }: { work: Work; onBack: () => void; onShare: () => void; onCopy: () => void }) {
  const [playing, setPlaying] = useState(true);
  const toggle = () => setPlaying((value) => !value);
  return <section className="share-page">
    <header className="share-header"><IconButton name="back" label="返回作品详情" onClick={onBack} /><h1>分享作品</h1><span /></header>
    <div className="share-scroll">
      <div className="share-preview-label"><div><small>动态海报预览</small><strong>视频已嵌入</strong></div><span><i /> 可直接播放</span></div>
      <article className="dynamic-poster" aria-label={`${work.title}动态分享海报`}>
        <header className="poster-brand"><div className="poster-brand-mark" aria-hidden="true">AI</div><div><strong>深圳AI影像馆</strong><small>城市记忆生成计划</small></div><span>动态影像</span></header>
        <button className="poster-video" type="button" onClick={toggle} aria-label={playing ? "暂停海报视频" : "播放海报视频"}>
          <CinematicLoop work={work} playing={playing} />
          <i className="poster-video-shade" />
          <span className="poster-video-status"><i />{playing ? "正在播放" : "已暂停"}</span>
          <span className="poster-video-time">00:08 / {work.duration}</span>
          <span className="poster-play"><Icon name={playing ? "pause" : "play"} size={22} /></span>
          <div className="poster-video-copy"><div className="tag-row">{work.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><h2>{work.title}</h2><p>{work.line}</p></div>
        </button>
        <footer className="poster-footer"><div><small>这是我的深圳记忆</small><strong>打开链接，观看完整动态海报</strong><p>也生成一支属于你的城市影像</p></div><span className="poster-code" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span></footer>
      </article>
      <p className="share-note">分享内容仅包含成品影像，不展示上传素材与核验信息。</p>
    </div>
    <div className="share-actions"><button className="soft-cta" type="button" onClick={onCopy}><Icon name="share" />复制链接</button><button className="primary-cta" type="button" onClick={onShare}><Icon name="share" />分享给朋友</button></div>
  </section>;
}

function WorkViewer({ work, mineMode, onBack, onCreate, onShare, onDownload, onDelete, isPublic, onPublish }: { work: Work; mineMode: boolean; onBack: () => void; onCreate: () => void; onShare: () => void; onDownload: () => void; onDelete: () => void; isPublic: boolean; onPublish: () => void }) {
  const [playing, setPlaying] = useState(true);
  const toggle = () => setPlaying((value) => !value);
  return <section className="work-viewer"><button className="viewer-media" onClick={toggle} aria-label={playing ? "暂停视频" : "播放视频"}><CinematicLoop work={work} playing={playing} /></button><div className="viewer-shade" /><header><IconButton name="back" label="返回" onClick={onBack} /><strong>作品详情</strong><IconButton name="share" label="分享" onClick={onShare} /></header><button className="viewer-play" onClick={toggle} aria-label={playing ? "暂停" : "播放"}><Icon name={playing ? "pause" : "play"} size={26} /></button><div className="viewer-copy"><div className="tag-row">{work.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><h1>{work.title}</h1><p>{work.line}</p>{mineMode ? <div className="viewer-actions"><button onClick={onDownload}><Icon name="download" />下载</button><button onClick={onShare}><Icon name="share" />分享</button><button onClick={onPublish}><Icon name="gallery" />{isPublic ? "取消公开" : "公开"}</button><button onClick={onDelete}><Icon name="delete" />删除</button></div> : <button className="same-style viewer-cta" onClick={onCreate}>生成同款视频 <Icon name="create" size={18} /></button>}</div></section>;
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  return <nav className="bottom-nav" aria-label="主菜单"><button className={tab === "gallery" ? "active" : ""} onClick={() => setTab("gallery")}><Icon name="gallery" /><span>作品展示</span></button><button className={`create-nav ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}><i><Icon name="create" size={25} /></i><span>视频生成</span></button><button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}><Icon name="mine" /><span>我的</span></button></nav>;
}

function Sheet({ kind, onClose, onContinue, onProgress, onPublish, onDelete }: { kind: "busy" | "publish" | "unpublish" | "delete"; onClose: () => void; onContinue: () => void; onProgress: () => void; onPublish: () => void; onDelete: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    return () => previous?.focus();
  }, []);
  const handleDialogKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") onClose();
    if (event.key !== "Tab") return;
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])") ?? [])];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const dialogProps = { ref: dialogRef, tabIndex: -1, className: "sheet-layer", role: "dialog", "aria-modal": true, "aria-label": "操作确认", onKeyDown: handleDialogKey } as const;
  if (kind === "busy") return <div {...dialogProps}><section className="sheet"><IconButton name="close" label="关闭" onClick={onClose} /><div className="sheet-icon"><Icon name="retry" size={25} /></div><h2>已有任务正在处理中</h2><p>同一账号一次只处理一支视频。</p><div className="sheet-actions"><button className="soft-cta" onClick={onProgress}>查看任务状态</button><button className="primary-cta" onClick={onContinue}>演示管理员确认</button></div></section></div>;
  if (kind === "publish") return <div {...dialogProps}><section className="sheet"><IconButton name="close" label="关闭" onClick={onClose} /><div className="sheet-icon"><Icon name="gallery" size={25} /></div><h2>申请公开展示？</h2><p>提交后由后台审核成品；审核通过才会出现在作品展示与分享入口。</p><div className="sheet-actions"><button className="soft-cta" onClick={onClose}>暂不申请</button><button className="primary-cta" onClick={onPublish}>提交公开申请</button></div></section></div>;
  if (kind === "unpublish") return <div {...dialogProps}><section className="sheet"><IconButton name="close" label="关闭" onClick={onClose} /><div className="sheet-icon"><Icon name="gallery" size={25} /></div><h2>申请取消公开？</h2><p>后台处理后将从作品展示与分享入口撤回，作品仍保留在“我的作品”。</p><div className="sheet-actions"><button className="soft-cta" onClick={onClose}>保持公开</button><button className="primary-cta" onClick={onPublish}>提交撤回申请</button></div></section></div>;
  return <div {...dialogProps}><section className="sheet"><IconButton name="close" label="关闭" onClick={onClose} /><div className="sheet-icon danger"><Icon name="delete" size={25} /></div><h2>从我的作品中移除？</h2><p>这里只移除前端作品记录；Mac中的原始资产仍由管理员按长期保存策略手动处理。</p><div className="sheet-actions"><button className="soft-cta" onClick={onClose}>取消</button><button className="danger-cta" onClick={onDelete}>确认移除</button></div></section></div>;
}

function Toast({ text }: { text: string }) {
  return <div className="toast" role="status">{text}</div>;
}
