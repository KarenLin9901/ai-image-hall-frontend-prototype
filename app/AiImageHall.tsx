"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Screen =
  | "home"
  | "works"
  | "consent"
  | "face"
  | "verify-consent"
  | "verify-provider"
  | "verify-processing"
  | "verify-result"
  | "body"
  | "voice"
  | "voice-consent"
  | "record"
  | "memory"
  | "place"
  | "line"
  | "confirm"
  | "progress"
  | "result"
  | "share"
  | "public-work";

type VerifyMock = "pass" | "fail" | "timeout";
type TaskMock = "success" | "fail";
type VoiceMode = "ai" | "record";
type MaterialMode = "upload" | "system";
type ShareScope = "private" | "link" | "public";

export const APP_BASE_PATH = "/ai-image-hall-frontend-prototype";

function normalizePath(pathname: string) {
  if (pathname === APP_BASE_PATH || pathname === `${APP_BASE_PATH}/`) return "/";
  return pathname.startsWith(`${APP_BASE_PATH}/`) ? pathname.slice(APP_BASE_PATH.length) : pathname;
}

function publicPath(pathname: string) {
  return `${APP_BASE_PATH}${pathname === "/" ? "/" : pathname}`;
}

const paths: Record<Screen, string> = {
  home: "/",
  works: "/works",
  consent: "/consent",
  face: "/create/face",
  "verify-consent": "/verify/consent",
  "verify-provider": "/verify/provider",
  "verify-processing": "/verify/processing",
  "verify-result": "/verify/result",
  body: "/create/body",
  voice: "/create/voice",
  "voice-consent": "/create/voice-consent",
  record: "/create/record",
  memory: "/create/memory",
  place: "/create/place",
  line: "/create/line",
  confirm: "/create/confirm",
  progress: "/task/demo-task",
  result: "/result/demo-task",
  share: "/share/demo-task",
  "public-work": "/work/demo-share",
};

const routeEntries = Object.entries(paths) as [Screen, string][];

function screenFromPath(pathname: string): Screen {
  const routePath = normalizePath(pathname);
  if (routePath.startsWith("/task/")) return "progress";
  if (routePath.startsWith("/result/")) return "result";
  if (routePath.startsWith("/share/")) return "share";
  if (routePath.startsWith("/work/")) return "public-work";
  return routeEntries.find(([, path]) => path === routePath)?.[0] ?? "home";
}

const memories = [
  {
    id: "dongmen",
    name: "东门",
    image: "/images/city-04.jpg",
    tag: "老街记忆与城市烟火",
    places: [
      {
        id: "old-street",
        name: "深圳墟老街记忆",
        tag: "在旧街巷里遇见深圳的过去",
        lines: ["老街还在，故事也一直都在。", "从深圳墟出发，我又走回熟悉的东门。", "每一条旧街，都藏着一段深圳记忆。"],
      },
      {
        id: "mcdonalds",
        name: "麦当劳开业记忆",
        tag: "重返城市新生活开始的那一天",
        lines: ["那一天，新鲜的味道第一次走进深圳。", "东门的热闹，也曾从这一刻重新开始。", "一间餐厅，见证了一座城的年轻与开放。"],
      },
      {
        id: "walking-street",
        name: "东门步行街烟火",
        tag: "在人潮与霓虹中感受城市脉搏",
        lines: ["人潮来往，这里一直是深圳最热闹的地方。", "熟悉的街口，装着一代人的青春。", "灯光亮起，东门的故事才刚刚开场。"],
      },
    ],
  },
  {
    id: "huaqiangbei",
    name: "华强北",
    image: "/images/city-01.jpg",
    tag: "电子街与创业年代",
    places: [
      {
        id: "seg",
        name: "赛格电子市场",
        tag: "走进中国电子第一街的高光时刻",
        lines: ["一块屏幕、一颗芯片，也能连接整个世界。", "这里的每一层楼，都跳动着创新的速度。", "从柜台到世界，华强北从不缺少可能。"],
      },
      {
        id: "one-meter",
        name: "一米柜台创业",
        tag: "从一方小柜台看见创业热潮",
        lines: ["一米柜台，也能成为梦想起飞的地方。", "机会很小，勇气却可以很大。", "无数个普通人，在这里写下创业第一步。"],
      },
      {
        id: "tech-street",
        name: "科技街区新生",
        tag: "在霓虹与科技中看见城市更新",
        lines: ["老街区不断更新，创新的脚步从未停下。", "今天的华强北，依然比想象更快一步。", "科技改变生活，也让这里不断年轻。"],
      },
    ],
  },
  {
    id: "shekou",
    name: "蛇口",
    image: "/images/city-03.jpg",
    tag: "改革起点与海港新生",
    places: [
      {
        id: "first-blast",
        name: "开山第一炮",
        tag: "回到改革开放的历史起点",
        lines: ["一声炮响，打开了向未来出发的道路。", "从这一刻起，蛇口开始书写新的时间。", "敢闯敢试，是这片土地最早的回声。"],
      },
      {
        id: "time-is-money",
        name: "时间就是金钱",
        tag: "重温激励一代建设者的时代声音",
        lines: ["时间就是金钱，效率就是生命。", "把握每一刻，才有机会走在时代前面。", "一句口号，唤醒了一座城市的速度。"],
      },
      {
        id: "sea-world",
        name: "海上世界与明华轮",
        tag: "在海港灯火中遇见浪漫蛇口",
        lines: ["海风吹过明华轮，也吹来了新的生活。", "港湾的灯亮起，蛇口拥有了另一种浪漫。", "从远航到相聚，这艘船见证城市变迁。"],
      },
    ],
  },
] as const;

const stepNames = ["授权确认", "上传人脸照片", "完成本人核验", "选择人物形象", "选择你的声音", "选择记忆", "确认并生成"];

const recordText =
  "清晨的风从窗边轻轻吹过，我沿着熟悉的街道慢慢向前。路旁的树叶在阳光下闪动，远处传来温柔的音乐。今天，我想把这一刻认真记录下来，也期待在新的故事里，看见更真实、更勇敢、更从容的自己。";

function TopBar({
  title = "AI影像馆",
  back,
  action,
}: {
  title?: string;
  back?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <header className="topbar">
      <div className="top-slot">
        {back && (
          <button className="icon-button" onClick={back} aria-label="返回">
            ←
          </button>
        )}
      </div>
      <div className="brand">{title}</div>
      <div className="top-slot top-action">{action}</div>
    </header>
  );
}

function Step({ current, label }: { current: number; label: string }) {
  return (
    <div className="step step-overview">
      <span>第 {current} 步 · {label}</span>
      <span>{current}/7</span>
      <div className="step-track">
        <i style={{ width: `${(current / 7) * 100}%` }} />
      </div>
      <ol className="all-steps" aria-label="制作步骤">
        {stepNames.map((name, index) => (
          <li key={name} className={index + 1 === current ? "active" : index + 1 < current ? "done" : ""}>
            <i>{index + 1 < current ? "✓" : index + 1}</i>
            <span>{name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="primary-button" onClick={onClick} disabled={disabled}>
      {children}
      <span>↗</span>
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="secondary-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="check-row">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="fake-check">{checked ? "✓" : ""}</span>
      <span>{children}</span>
    </label>
  );
}

function MediaBadge({ children }: { children: React.ReactNode }) {
  return <span className="media-badge">{children}</span>;
}

function PortraitPlaceholder({
  kind,
  uploaded,
  preview,
}: {
  kind: "face" | "appearance";
  uploaded: boolean;
  preview?: string;
}) {
  if (preview) {
    return (
      <div className={`reference-upload ${kind}`}>
        <img className="upload-preview" src={preview} alt={kind === "face" ? "人脸照片预览" : "形象图预览"} />
        <span>已上传</span>
      </div>
    );
  }
  return (
    <div className={`reference-upload ${kind} ${uploaded ? "uploaded" : ""}`}>
      <img src="/images/appearance-reference-v1.png" alt={kind === "face" ? "正脸照片案例参考" : "人物形象图案例参考"} />
      <span>{uploaded ? "案例图已选用" : "案例参考图"}</span>
      <p>{kind === "face" ? "清晰正脸 · 单人无遮挡" : "全身入镜 · 形象清晰"}</p>
    </div>
  );
}

export default function AiImageHall() {
  const [screen, setScreen] = useState<Screen>("home");
  const [projectConsent, setProjectConsent] = useState(false);
  const [faceReady, setFaceReady] = useState(false);
  const [facePreview, setFacePreview] = useState<string>();
  const [verifyConsent, setVerifyConsent] = useState(false);
  const [verifyMock, setVerifyMock] = useState<VerifyMock>("pass");
  const [bodyReady, setBodyReady] = useState(false);
  const [bodyPreview, setBodyPreview] = useState<string>();
  const [materialMode, setMaterialMode] = useState<MaterialMode>("upload");
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("ai");
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [memoryId, setMemoryId] = useState("dongmen");
  const [placeId, setPlaceId] = useState("old-street");
  const [dialogue, setDialogue] = useState("老街还在，故事也一直都在。");
  const [submitConfirmed, setSubmitConfirmed] = useState(false);
  const [taskMock, setTaskMock] = useState<TaskMock>("success");
  const [taskStage, setTaskStage] = useState(0);
  const [taskFailed, setTaskFailed] = useState(false);
  const [shareScope, setShareScope] = useState<ShareScope>("private");
  const [demoPanel, setDemoPanel] = useState(false);
  const [publicWorksEmpty, setPublicWorksEmpty] = useState(false);
  const [toast, setToast] = useState("");
  const faceInput = useRef<HTMLInputElement>(null);
  const bodyInput = useRef<HTMLInputElement>(null);
  const currentMemory = memories.find((memory) => memory.id === memoryId) ?? memories[0];
  const currentPlace = currentMemory.places.find((place) => place.id === placeId) ?? currentMemory.places[0];

  const navigate = (next: Screen) => {
    window.history.pushState({}, "", publicPath(paths[next]));
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    const previous: Partial<Record<Screen, Screen>> = {
      works: "home",
      consent: "home",
      face: "consent",
      "verify-consent": "face",
      "verify-provider": "verify-consent",
      "verify-processing": "verify-provider",
      "verify-result": "verify-consent",
      body: "verify-consent",
      voice: "body",
      "voice-consent": "voice",
      record: "voice-consent",
      memory: voiceMode === "record" ? "record" : "voice",
      place: "memory",
      line: "place",
      confirm: "line",
      progress: "confirm",
      result: "home",
      share: "result",
      "public-work": "works",
    };
    navigate(previous[screen] ?? "home");
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  useEffect(() => {
    setScreen(screenFromPath(window.location.pathname));
    const handler = () => setScreen(screenFromPath(window.location.pathname));
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      setRecordSeconds((value) => {
        if (value >= 29) {
          setRecording(false);
          setAudioReady(true);
          return 30;
        }
        return value + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => {
    if (screen !== "verify-processing") return;
    const timer = window.setTimeout(() => {
      navigate(verifyMock === "pass" ? "body" : "verify-result");
    }, verifyMock === "timeout" ? 2400 : 1500);
    return () => window.clearTimeout(timer);
  }, [screen, verifyMock]);

  useEffect(() => {
    if (screen !== "progress" || taskFailed) return;
    const timer = window.setInterval(() => {
      setTaskStage((value) => {
        if (taskMock === "fail" && value >= 1) {
          setTaskFailed(true);
          window.clearInterval(timer);
          return value;
        }
        if (value >= 3) {
          window.clearInterval(timer);
          window.setTimeout(() => navigate("result"), 650);
          return 3;
        }
        return value + 1;
      });
    }, 1300);
    return () => window.clearInterval(timer);
  }, [screen, taskMock, taskFailed]);

  useEffect(() => {
    const saved = window.localStorage.getItem("aih-prototype-draft");
    if (!saved) return;
    try {
      const draft = JSON.parse(saved);
      setFaceReady(Boolean(draft.faceReady));
      setBodyReady(Boolean(draft.bodyReady));
      setMaterialMode(draft.materialMode === "system" ? "system" : "upload");
      setVoiceMode(draft.voiceMode === "record" ? "record" : "ai");
      setMemoryId(draft.memoryId ?? "dongmen");
      setPlaceId(draft.placeId ?? "old-street");
      setDialogue(draft.dialogue ?? dialogue);
    } catch {
      window.localStorage.removeItem("aih-prototype-draft");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "aih-prototype-draft",
      JSON.stringify({ faceReady, bodyReady, materialMode, voiceMode, memoryId, placeId, dialogue }),
    );
  }, [faceReady, bodyReady, materialMode, voiceMode, memoryId, placeId, dialogue]);

  const handleImage = (
    file: File | undefined,
    type: "face" | "body",
  ) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "face") {
      setFaceReady(true);
      setFacePreview(url);
    } else {
      setBodyReady(true);
      setBodyPreview(url);
    }
  };

  const resetTask = () => {
    setTaskStage(0);
    setTaskFailed(false);
    setSubmitConfirmed(false);
    navigate("memory");
  };

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return (
          <main className="screen home-screen">
            <TopBar
              action={
                <button className="text-button" onClick={() => navigate("works")}>
                  作品分享
                </button>
              }
            />
            <section className="hero">
              <video
                className="hero-video"
                src="/media/demo-video-15s.mp4"
                poster="/images/demo-video-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
              />
              <MediaBadge>静音播放</MediaBadge>
              <div className="hero-sheet">
                <div className="eyebrow">把你放进故事里</div>
                <h1>你的影像，<br />现在开场。</h1>
                <p>完成本人核验，上传个人素材，选择一段深圳记忆，生成属于你的15秒竖屏影像。</p>
                <PrimaryButton onClick={() => navigate("consent")}>开始制作</PrimaryButton>
              </div>
            </section>
            <section className="quick-facts">
              <span>15秒成片</span><i />
              <span>9:16竖屏</span><i />
              <span>九段记忆</span>
            </section>
          </main>
        );

      case "works":
        return (
          <main className="screen dark-screen">
            <TopBar title="作品分享" back={goBack} />
            {publicWorksEmpty ? (
              <div className="empty-state">
                <div className="empty-orb">✦</div>
                <h2>还没有分享作品</h2>
                <p>制作你的第一条深圳记忆影像。</p>
                <PrimaryButton onClick={() => navigate("consent")}>开始制作</PrimaryButton>
              </div>
            ) : (
              <section className="work-feed">
                {[0, 1, 2].map((index) => {
                  const memory = memories[index];
                  return (
                    <article className="work-card" key={memory.id}>
                      {index === 0 ? (
                        <video src="/media/demo-video-15s.mp4" poster="/images/demo-video-poster.jpg" autoPlay muted loop playsInline />
                      ) : (
                        <img src={memory.image} alt={`${memory.name}作品`} />
                      )}
                      <div className="work-overlay">
                        <MediaBadge>静音</MediaBadge>
                        <div>
                          <span className="eyebrow">作品分享</span>
                          <h2>{memory.name}</h2>
                          <p>{memory.tag} · 15秒竖屏影像</p>
                          <button
                            className="glass-button"
                            onClick={() => {
                              setMemoryId(memory.id);
                              setPlaceId(memory.places[0].id);
                              setDialogue(memory.places[0].lines[0]);
                              navigate("consent");
                            }}
                          >
                            生成同款 ↗
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </main>
        );

      case "consent":
        return (
          <main className="screen">
            <TopBar back={goBack} />
            <Step current={1} label="授权确认" />
            <section className="page-intro">
              <span className="eyebrow">PROJECT CONSENT</span>
              <h1>授权确认</h1>
              <p>开始前，请确认你理解照片、声音和生成作品的使用范围。</p>
            </section>
            <div className="glass-panel consent-panel">
              <div className="icon-orb">⌁</div>
              <h3>素材与隐私说明</h3>
              <ul>
                <li><span>01</span>照片仅用于本次人物影像生成</li>
                <li><span>02</span>个人声音需另行单独授权</li>
                <li><span>03</span>分享前由你决定公开范围</li>
              </ul>
              <button className="inline-link" onClick={() => notify("已打开隐私说明（演示）")}>查看完整隐私说明 →</button>
            </div>
            <div className="bottom-actions">
              <CheckRow checked={projectConsent} onChange={setProjectConsent}>
                我已阅读并同意《用户协议》和《隐私说明》
              </CheckRow>
              <PrimaryButton disabled={!projectConsent} onClick={() => navigate("face")}>同意并继续</PrimaryButton>
            </div>
          </main>
        );

      case "face":
        return (
          <main className="screen">
            <TopBar back={goBack} />
            <Step current={2} label="上传人脸照片" />
            <section className="page-intro compact">
              <span className="eyebrow">FACE MATERIAL</span>
              <h1>上传人脸照片</h1>
              <p>请上传一张清晰正脸照片。下一步还需要通过实时活体核验，确认照片与你本人一致。</p>
            </section>
            <PortraitPlaceholder kind="face" uploaded={faceReady} preview={facePreview} />
            <div className="tip-grid">
              <span>✓ 单人正脸</span><span>✓ 光线均匀</span>
              <span>✓ 五官无遮挡</span><span>✓ JPG / PNG</span>
            </div>
            <input
              ref={faceInput}
              hidden
              type="file"
              accept="image/jpeg,image/png"
              onChange={(event) => handleImage(event.target.files?.[0], "face")}
            />
            <div className="bottom-actions">
              <PrimaryButton onClick={() => faceInput.current?.click()}>{faceReady ? "更换人脸照片" : "上传人脸照片"}</PrimaryButton>
              {!faceReady && <SecondaryButton onClick={() => setFaceReady(true)}>使用示例照片体验</SecondaryButton>}
              {faceReady && <SecondaryButton onClick={() => navigate("verify-consent")}>下一步：本人核验</SecondaryButton>}
              <p className="fine-print">上传成功仅代表素材可用，不代表本人核验通过。</p>
            </div>
          </main>
        );

      case "verify-consent":
        return (
          <main className="screen">
            <TopBar back={goBack} />
            <Step current={3} label="完成本人核验" />
            <section className="page-intro">
              <span className="eyebrow">IDENTITY CHECK</span>
              <h1>验证是你本人</h1>
              <p>为了确认上传的人脸照片属于你本人，我们将调用第三方服务进行实时活体核验。</p>
            </section>
            <div className="glass-panel privacy-panel">
              <div className="shield">◇</div>
              <div>
                <strong>仅用于本次身份一致性核验</strong>
                <p>不用于训练或其他用途。核验页面及结果由第三方服务提供。</p>
              </div>
            </div>
            <button className="inline-link wide-link" onClick={() => notify("第三方处理说明已展开（演示）")}>查看第三方处理说明与隐私政策 →</button>
            <div className="bottom-actions">
              <CheckRow checked={verifyConsent} onChange={setVerifyConsent}>我同意进行实时活体核验</CheckRow>
              <PrimaryButton disabled={!verifyConsent} onClick={() => navigate("verify-provider")}>同意并开始核验</PrimaryButton>
              <SecondaryButton onClick={() => navigate("face")}>暂不核验</SecondaryButton>
            </div>
          </main>
        );

      case "verify-provider":
        return (
          <main className="screen provider-screen">
            <TopBar title="第三方活体核验（示意）" back={goBack} />
            <Step current={3} label="完成本人核验" />
            <section className="provider-copy">
              <span className="eyebrow">SECURE VERIFY</span>
              <h1>请将脸部<br />置于框内</h1>
              <p>保持正对屏幕和环境光线充足。</p>
            </section>
            <div className="face-frame">
              <div className="scan-line" />
              <div className="face-oval">
                <div className="mini-face">●</div>
              </div>
              <span>第三方活体核验界面（示意）</span>
            </div>
            <div className="secure-note">◇ 数据传输已加密</div>
            <div className="bottom-actions">
              <PrimaryButton onClick={() => navigate("verify-processing")}>模拟完成核验</PrimaryButton>
              <SecondaryButton onClick={() => navigate("verify-consent")}>取消核验</SecondaryButton>
            </div>
          </main>
        );

      case "verify-processing":
        return (
          <main className="screen center-screen">
            <TopBar back={goBack} />
            <Step current={3} label="完成本人核验" />
            <div className="status-orb"><i /><b /><span>◇</span></div>
            <div className="center-copy">
              <span className="eyebrow">VERIFYING</span>
              <h1>核验结果<br />处理中</h1>
              <p>正在确认照片与本人是否一致，请稍候。</p>
              <div className="status-pill">处理中 · 不显示虚假百分比</div>
            </div>
          </main>
        );

      case "verify-result":
        return (
          <main className="screen">
            <TopBar back={goBack} />
            <Step current={3} label="完成本人核验" />
            <section className="page-intro">
              <span className="eyebrow error-text">{verifyMock === "timeout" ? "VERIFY EXPIRED" : "VERIFY FAILED"}</span>
              <h1>{verifyMock === "timeout" ? "核验已超时" : "核验未通过"}</h1>
              <p>{verifyMock === "timeout" ? "本次核验会话已失效，请重新开始。" : "第三方返回：照片与本人一致性不足。"}</p>
            </section>
            <div className="glass-panel error-panel">
              <span>!</span>
              <div>
                <strong>{verifyMock === "timeout" ? "VERIFY_EXPIRED" : "FACE_MISMATCH"}</strong>
                <p>{verifyMock === "timeout" ? "请重新取得一次性核验会话。" : "请检查光线，或更换更清晰的正脸素材照。"}</p>
              </div>
            </div>
            <div className="bottom-actions">
              <PrimaryButton onClick={() => navigate("verify-consent")}>重新核验</PrimaryButton>
              <SecondaryButton onClick={() => {
                setFaceReady(false);
                setFacePreview(undefined);
                setVerifyConsent(false);
                navigate("face");
              }}>更换人脸素材照</SecondaryButton>
            </div>
          </main>
        );

      case "body":
        return (
          <main className="screen">
            <TopBar back={goBack} action={<span className="success-chip">核验通过 ✓</span>} />
            <Step current={4} label="选择人物形象" />
            <section className="page-intro compact">
              <span className="eyebrow">CHARACTER MATERIAL</span>
              <h1>选择人物形象</h1>
              <p>上传一张形象图，或者由系统自动生成身体与服装。</p>
            </section>
            <div className="material-tabs">
              <button className={materialMode === "upload" ? "selected" : ""} onClick={() => { setMaterialMode("upload"); setBodyReady(false); setBodyPreview(undefined); }}>
                <strong>上传形象图</strong><small>参考你的体型与穿着</small>
              </button>
              <button className={materialMode === "system" ? "selected" : ""} onClick={() => { setMaterialMode("system"); setBodyReady(true); setBodyPreview(undefined); }}>
                <strong>系统自动生成</strong><small>自动匹配身体与服装</small>
              </button>
            </div>
            {materialMode === "upload" ? (
              <PortraitPlaceholder kind="appearance" uploaded={bodyReady} preview={bodyPreview} />
            ) : (
              <div className="system-appearance">
                <img src="/images/appearance-reference-v1.png" alt="系统自动生成人物形象示意" />
                <div><span>AI SYSTEM LOOK</span><strong>系统形象已选择</strong><p>生成时将根据已核验的人脸、场景和台词，自动匹配身体与服装。</p></div>
              </div>
            )}
            <input
              ref={bodyInput}
              hidden
              type="file"
              accept="image/jpeg,image/png"
              onChange={(event) => handleImage(event.target.files?.[0], "body")}
            />
            <div className="bottom-actions">
              {materialMode === "upload" && <PrimaryButton onClick={() => bodyInput.current?.click()}>{bodyReady ? "更换形象图" : "上传形象图"}</PrimaryButton>}
              {materialMode === "upload" && !bodyReady && <SecondaryButton onClick={() => setBodyReady(true)}>使用案例形象图体验</SecondaryButton>}
              {bodyReady && <SecondaryButton onClick={() => navigate("voice")}>下一步：选择你的声音</SecondaryButton>}
            </div>
          </main>
        );

      case "voice":
        return (
          <main className="screen dark-screen">
            <TopBar back={goBack} />
            <Step current={5} label="选择你的声音" />
            <section className="page-intro compact">
              <span className="eyebrow">VOICE</span>
              <h1>选择你的声音</h1>
              <p>选择生成台词的声音方式。你也可以录制一段约30秒的人声。</p>
            </section>
            <div className="option-stack">
              {([
                ["ai", "✦", "AI自动匹配", "推荐 · 根据场景、年龄与台词选择声音"],
                ["record", "●", "录制你的声音", "跟读一段约30秒文本"],
              ] as const).map(([mode, icon, title, sub]) => (
                <button key={mode} className={`select-card ${voiceMode === mode ? "selected" : ""}`} onClick={() => setVoiceMode(mode)}>
                  <span className="option-icon">{icon}</span>
                  <span><strong>{title}</strong><small>{sub}</small></span>
                  <i>{voiceMode === mode ? "✓" : ""}</i>
                </button>
              ))}
            </div>
            <div className="bottom-actions">
              <PrimaryButton onClick={() => navigate(voiceMode === "record" ? "voice-consent" : "memory")}>
                {voiceMode === "record" ? "继续录制" : "确认声音并继续"}
              </PrimaryButton>
            </div>
          </main>
        );

      case "voice-consent":
        return (
          <main className="screen dark-screen">
            <TopBar back={goBack} />
            <Step current={5} label="选择你的声音" />
            <section className="page-intro">
              <span className="eyebrow">VOICE CONSENT</span>
              <h1>使用我的声音</h1>
              <p>个人声音是敏感素材，需要你再次单独确认。</p>
            </section>
            <div className="glass-panel voice-privacy">
              <div className="shield">◇</div>
              <h3>仅用于生成本次影像</h3>
              <p>不用于训练或其他用途。未经确认的临时录音将在退出流程后清理。</p>
              <div className="privacy-points"><span>不公开原始录音</span><span>不展示真实身份</span><span>可以改用默认音色</span></div>
            </div>
            <div className="bottom-actions">
              <CheckRow checked={voiceConsent} onChange={setVoiceConsent}>我同意本次使用我的声音</CheckRow>
              <PrimaryButton disabled={!voiceConsent} onClick={() => navigate("record")}>同意并继续</PrimaryButton>
              <SecondaryButton onClick={() => {
                setVoiceMode("ai");
                setVoiceConsent(false);
                navigate("memory");
              }}>改用AI自动匹配</SecondaryButton>
            </div>
          </main>
        );

      case "record":
        return (
          <main className="screen dark-screen">
            <TopBar title="录制你的声音" back={goBack} />
            <Step current={5} label="选择你的声音" />
            <div className="record-copy">
              <span className="eyebrow">READ ALOUD</span>
              <h1>跟读这段文字</h1>
              <div className="script-card">{recordText}</div>
            </div>
            <div className={`waveform ${recording ? "live" : ""}`}>
              {Array.from({ length: 25 }).map((_, index) => <i key={index} style={{ height: `${16 + ((index * 17) % 42)}px` }} />)}
            </div>
            <div className="timer">{String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:{String(recordSeconds % 60).padStart(2, "0")} <span>/ 00:30</span></div>
            <button
              className={`record-button ${recording ? "recording" : ""}`}
              onClick={() => {
                if (recordSeconds >= 30) {
                  setRecordSeconds(0);
                  setAudioReady(false);
                }
                setRecording(!recording);
              }}
              aria-label={recording ? "停止录音" : "开始录音"}
            >
              <i />
            </button>
            <p className="record-tip">建议有效人声不少于25秒，保持环境安静。</p>
            <div className="bottom-actions inline-bottom">
              {audioReady || recordSeconds >= 25 ? (
                <>
                  <SecondaryButton onClick={() => { setRecordSeconds(0); setAudioReady(false); }}>重新录音</SecondaryButton>
                  <PrimaryButton onClick={() => { setAudioReady(true); navigate("memory"); }}>确认使用</PrimaryButton>
                </>
              ) : (
                <SecondaryButton onClick={() => { setRecordSeconds(30); setAudioReady(true); }}>使用30秒示例录音</SecondaryButton>
              )}
              <button className="inline-link" onClick={() => { setVoiceMode("ai"); navigate("memory"); }}>改用AI自动匹配</button>
            </div>
          </main>
        );

      case "memory":
        return (
          <main className="screen dark-screen">
            <TopBar back={goBack} />
            <Step current={6} label="选择记忆" />
            <section className="page-intro compact">
              <span className="eyebrow">CHOOSE A MEMORY</span>
              <h1>先选择一段<br />深圳记忆</h1>
              <p>从东门、华强北或蛇口开始，再选择其中的代表性小场景。</p>
            </section>
            <div className="scene-scroll">
              {memories.map((memory) => (
                <button key={memory.id} className={`scene-card ${memoryId === memory.id ? "selected" : ""}`} onClick={() => {
                  setMemoryId(memory.id);
                  setPlaceId(memory.places[0].id);
                  setDialogue(memory.places[0].lines[0]);
                }}>
                  <img src={memory.image} alt={memory.name} />
                  <span><strong>{memory.name}</strong><small>{memory.tag}</small></span>
                  {memoryId === memory.id && <i>✓</i>}
                </button>
              ))}
            </div>
            <div className="bottom-actions">
              <PrimaryButton onClick={() => navigate("place")}>下一步：选择小场景</PrimaryButton>
            </div>
          </main>
        );

      case "place":
        return (
          <main className="screen dark-screen">
            <TopBar back={goBack} />
            <Step current={6} label="选择记忆" />
            <section className="page-intro compact">
              <span className="eyebrow">{currentMemory.name.toUpperCase()}</span>
              <h1>选择{currentMemory.name}<br />代表性场景</h1>
              <p>每个小场景对应一套专属视频脚本。当前内容为交互示意，后续可配置替换。</p>
            </section>
            <div className="option-stack place-stack">
              {currentMemory.places.map((place, index) => (
                <button key={place.id} className={`select-card ${placeId === place.id ? "selected" : ""}`} onClick={() => {
                  setPlaceId(place.id);
                  setDialogue(place.lines[0]);
                }}>
                  <span className="option-icon">{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{place.name}</strong><small>{place.tag}</small></span>
                  <i>{placeId === place.id ? "✓" : ""}</i>
                </button>
              ))}
            </div>
            <div className="bottom-actions">
              <PrimaryButton onClick={() => navigate("line")}>下一步：选择台词</PrimaryButton>
              <SecondaryButton onClick={() => navigate("memory")}>更换大场景</SecondaryButton>
            </div>
          </main>
        );

      case "line":
        return (
          <main className="screen dark-screen">
            <TopBar back={goBack} />
            <Step current={6} label="选择记忆" />
            <section className="page-intro compact">
              <span className="eyebrow">{currentMemory.name} · {currentPlace.name}</span>
              <h1>选择一句<br />你想表达的话</h1>
            </section>
            <div className="line-list">
              {currentPlace.lines.map((line, index) => (
                <button key={line} className={dialogue === line ? "selected" : ""} onClick={() => setDialogue(line)}>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <span>{line}</span>
                  <b>{dialogue === line ? "✓" : ""}</b>
                </button>
              ))}
            </div>
            <div className="bottom-actions">
              <PrimaryButton onClick={() => navigate("confirm")}>确认台词并继续</PrimaryButton>
              <SecondaryButton onClick={() => navigate("place")}>更换小场景</SecondaryButton>
            </div>
          </main>
        );

      case "confirm":
        return (
          <main className="screen dark-screen">
            <TopBar title="确认并生成" back={goBack} />
            <Step current={7} label="确认并生成" />
            <section className="page-intro compact">
              <span className="eyebrow">FINAL CHECK</span>
              <h1>确认你的<br />影像方案</h1>
              <p>请核对素材、声音、记忆场景和台词。开始生成后，本次任务不可修改。</p>
            </section>
            <div className="summary-list">
              <div><span className="summary-icon">◉</span><p><strong>人脸素材照</strong><small>已上传</small></p><b>✓</b></div>
              <div><span className="summary-icon">◇</span><p><strong>本人核验</strong><small>已通过</small></p><b>✓</b></div>
              <div><span className="summary-icon">♙</span><p><strong>人物形象</strong><small>{materialMode === "upload" ? "已上传形象图" : "系统自动生成"}</small></p><button onClick={() => navigate("body")}>修改</button></div>
              <div><span className="summary-icon">♫</span><p><strong>你的声音</strong><small>{voiceMode === "ai" ? "AI自动匹配" : "录制你的声音"}</small></p><button onClick={() => navigate("voice")}>修改</button></div>
              <div><img src={currentMemory.image} alt="" /><p><strong>{currentMemory.name} · {currentPlace.name}</strong><small>{dialogue}</small></p><button onClick={() => navigate("memory")}>修改</button></div>
            </div>
            <div className="bottom-actions">
              <CheckRow checked={submitConfirmed} onChange={setSubmitConfirmed}>我已核对以上内容，确认开始生成</CheckRow>
              <PrimaryButton disabled={!submitConfirmed} onClick={() => {
                setTaskStage(0);
                setTaskFailed(false);
                navigate("progress");
              }}>确认并开始生成</PrimaryButton>
              <SecondaryButton onClick={() => navigate("line")}>返回修改</SecondaryButton>
            </div>
          </main>
        );

      case "progress": {
        const stageNames = ["素材准备", "人物与场景合成", "音画处理", "成品封装"];
        return (
          <main className="screen dark-screen progress-screen">
            <TopBar back={goBack} />
            <div className="progress-visual">
              <img src={currentMemory.image} alt={`${currentMemory.name}生成预览`} />
              <div className="progress-shimmer" />
            </div>
            <section className="progress-sheet">
              <span className="eyebrow">{taskFailed ? "GENERATION PAUSED" : "CREATING"}</span>
              <h1>{taskFailed ? "生成暂未完成" : "正在生成你的影像"}</h1>
              <p>{taskFailed ? "人物与场景合成服务暂时繁忙，请稍后重试。" : "可以离开此页面，完成后会在作品中看到。"}</p>
              <div className="stage-list">
                {stageNames.map((name, index) => (
                  <div key={name} className={index < taskStage ? "done" : index === taskStage ? (taskFailed ? "failed" : "active") : ""}>
                    <i>{index < taskStage ? "✓" : index + 1}</i>
                    <span>{name}</span>
                    <small>{index < taskStage ? "已完成" : index === taskStage ? (taskFailed ? "失败" : "进行中") : "等待中"}</small>
                  </div>
                ))}
              </div>
              {taskFailed && (
                <div className="button-row">
                  <SecondaryButton onClick={() => navigate("home")}>返回首页</SecondaryButton>
                  <PrimaryButton onClick={() => { setTaskFailed(false); setTaskMock("success"); setTaskStage(0); }}>重新生成</PrimaryButton>
                </div>
              )}
            </section>
          </main>
        );
      }

      case "result":
        return (
          <main className="screen dark-screen result-screen">
            <TopBar title="生成完成" back={goBack} />
            <section className="result-video">
              <video src="/media/demo-video-15s.mp4" poster="/images/demo-video-poster.jpg" autoPlay muted loop playsInline />
              <MediaBadge>静音 · 00:15</MediaBadge>
              <div className="result-glow" />
            </section>
            <section className="result-copy">
              <span className="eyebrow">YOUR FILM IS READY</span>
              <h1>你的影像<br />已经完成</h1>
            </section>
            <div className="bottom-actions">
              <PrimaryButton onClick={() => notify("已触发成品下载（演示）")}>下载成品</PrimaryButton>
              <SecondaryButton onClick={() => navigate("share")}>分享作品</SecondaryButton>
              <button className="inline-link" onClick={resetTask}>再做一条 →</button>
            </div>
          </main>
        );

      case "share":
        return (
          <main className="screen dark-screen">
            <TopBar title="分享作品" back={goBack} />
            <img className="share-preview" src="/images/demo-video-poster.jpg" alt="生成作品预览" />
            <section className="page-intro compact">
              <span className="eyebrow">PRIVACY FIRST</span>
              <h1>选择公开范围</h1>
              <p>默认仅自己可见。任何公开操作都需要你单独确认。</p>
            </section>
            <div className="scope-list">
              {([
                ["private", "◇", "仅自己可见", "默认 · 不创建公开链接"],
                ["link", "↗", "通过链接分享", "获得链接的人可以查看"],
                ["public", "◎", "发布到作品分享", "将在作品分享页公开展示"],
              ] as const).map(([scope, icon, title, sub]) => (
                <button key={scope} className={shareScope === scope ? "selected" : ""} onClick={() => setShareScope(scope)}>
                  <span>{icon}</span><p><strong>{title}</strong><small>{sub}</small></p><i>{shareScope === scope ? "●" : "○"}</i>
                </button>
              ))}
            </div>
            <div className="notice-card privacy-notice">
              <span>◇</span>
              <p>公开内容仅包含生成视频，不展示原始照片、录音、真实姓名或任务信息。</p>
            </div>
            <div className="bottom-actions">
              <PrimaryButton onClick={() => {
                if (shareScope === "private") {
                  notify("已保存为仅自己可见");
                  navigate("result");
                } else {
                  navigate("public-work");
                }
              }}>确认{shareScope === "private" ? "保存" : "分享"}</PrimaryButton>
              <SecondaryButton onClick={() => navigate("result")}>取消</SecondaryButton>
            </div>
          </main>
        );

      case "public-work":
        return (
          <main className="screen dark-screen public-work-screen">
            <TopBar title="AI影像馆" back={goBack} />
            <video src="/media/demo-video-15s.mp4" poster="/images/demo-video-poster.jpg" autoPlay muted loop playsInline />
            <MediaBadge>静音 · 00:15</MediaBadge>
            <div className="public-sheet">
              <span className="eyebrow">{shareScope === "public" ? "作品分享" : "链接分享"}</span>
              <h1>{currentMemory.name} · {currentPlace.name}</h1>
              <p>一段由 AI影像馆生成的15秒竖屏影像。</p>
              <PrimaryButton onClick={() => {
                setProjectConsent(false);
                navigate("consent");
              }}>生成同款</PrimaryButton>
              <p className="fine-print">不展示原始照片、声音、真实姓名或核验信息。</p>
            </div>
          </main>
        );
    }
  };

  const routeLabel = useMemo(() => {
    const index = routeEntries.findIndex(([key]) => key === screen);
    return `${index + 1}/20`;
  }, [screen]);

  return (
    <div className="site-shell">
      <div className="ambient-word">AI IMAGE HALL</div>
      <div className="phone-shell">
        {renderScreen()}
        {toast && <div className="toast">{toast}</div>}
      </div>
      <aside className="prototype-note">
        <span>CLICKABLE DEMO · {routeLabel}</span>
        <h2>AI影像馆<br />前台交互原型</h2>
        <p>完整主链路、失败状态与分享确认均可点击演示。</p>
        <div className="route-pill">{paths[screen]}</div>
      </aside>
      <button className="demo-toggle" onClick={() => setDemoPanel(!demoPanel)} aria-label="打开演示状态面板">⌁</button>
      {demoPanel && (
        <aside className="demo-panel">
          <div className="demo-title">
            <div><span>演示控制台</span><small>仅原型可见</small></div>
            <button onClick={() => setDemoPanel(false)}>×</button>
          </div>
          <label>活体核验结果
            <select value={verifyMock} onChange={(event) => setVerifyMock(event.target.value as VerifyMock)}>
              <option value="pass">核验通过</option>
              <option value="fail">核验失败</option>
              <option value="timeout">核验超时</option>
            </select>
          </label>
          <label>生成任务结果
            <select value={taskMock} onChange={(event) => setTaskMock(event.target.value as TaskMock)}>
              <option value="success">生成成功</option>
              <option value="fail">生成失败</option>
            </select>
          </label>
          <label className="switch-line">
            <span>公开作品空状态</span>
            <input type="checkbox" checked={publicWorksEmpty} onChange={(event) => setPublicWorksEmpty(event.target.checked)} />
          </label>
          <div className="demo-shortcuts">
            <button onClick={() => navigate("verify-provider")}>跳到活体核验</button>
            <button onClick={() => { setTaskStage(0); setTaskFailed(false); navigate("progress"); }}>跳到生成进度</button>
            <button onClick={() => navigate("result")}>跳到成品</button>
          </div>
          <button className="reset-button" onClick={() => {
            window.localStorage.removeItem("aih-prototype-draft");
            window.location.href = `${APP_BASE_PATH}/`;
          }}>重置全部演示数据</button>
        </aside>
      )}
    </div>
  );
}
