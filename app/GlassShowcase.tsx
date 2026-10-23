import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { reference } from './guangdang-data';
import './glass-showcase.css';

type GlassShowcaseProps = { paused?: boolean };

const scenes = [
 { image: 5, title: '活动互动', alt: '活动现场的影像互动体验' },
 { image: 8, title: '人物故事', alt: '用光影记录人物的故事' },
 { image: 9, title: '家庭记忆', alt: '一家人共同珍藏的时光' },
 { image: 10, title: '企业故事', alt: '企业与团队的成长历程' },
 { image: 11, title: '城市记忆', alt: '城市建筑与时代记忆' },
];
const wrap = (index: number) => (index + scenes.length) % scenes.length;
const positionFor = (index: number, current: number) => {
 const distance = wrap(index - current);
 return distance > 2 ? distance - scenes.length : distance;
};

export default function GlassShowcase({ paused = false }: GlassShowcaseProps) {
 const [current, setCurrent] = useState(0);
 const fieldRef = useRef<HTMLDivElement>(null);
 const suppressClickUntil = useRef(0);

 useEffect(() => {
  const field = fieldRef.current;
  if (!field) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let gesture: { id: number; x: number; y: number } | null = null;
  const motionDisabled = () => paused || preference.matches || document.body.classList.contains('motion-paused');
  const resetTilt = () => {
   cancelAnimationFrame(frame);
   frame = 0;
   field.classList.remove('gs-interacting');
   field.style.setProperty('--gs-rx', '0deg');
   field.style.setProperty('--gs-ry', '0deg');
   field.style.setProperty('--gs-light-x', '50%');
  };
  const paint = () => {
   frame = 0;
   if (motionDisabled()) { resetTilt(); return; }
   const bounds = field.getBoundingClientRect();
   if (!bounds.width || !bounds.height) return;
   const x = Math.max(-1, Math.min(1, (pointerX - bounds.left) / bounds.width * 2 - 1));
   const y = Math.max(-1, Math.min(1, (pointerY - bounds.top) / bounds.height * 2 - 1));
   field.style.setProperty('--gs-rx', `${(-y * 3).toFixed(2)}deg`);
   field.style.setProperty('--gs-ry', `${(x * 5).toFixed(2)}deg`);
   field.style.setProperty('--gs-light-x', `${50 + x * 24}%`);
  };
  const move = (event: PointerEvent) => {
   if (event.pointerType !== 'mouse' || motionDisabled()) return;
   pointerX = event.clientX;
   pointerY = event.clientY;
   field.classList.add('gs-interacting');
   if (!frame) frame = requestAnimationFrame(paint);
  };
  const begin = (event: PointerEvent) => {
   if (event.pointerType === 'touch' || event.pointerType === 'pen') {
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
   }
  };
  const end = (event: PointerEvent) => {
   if (!gesture || gesture.id !== event.pointerId) return;
   const dx = event.clientX - gesture.x;
   const dy = event.clientY - gesture.y;
   gesture = null;
   if (Math.abs(dx) < 32 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
   suppressClickUntil.current = performance.now() + 400;
   setCurrent(value => wrap(value + (dx < 0 ? 1 : -1)));
  };
  const cancel = () => { gesture = null; resetTilt(); };
  const preferenceChanged = () => { if (motionDisabled()) resetTilt(); };
  const observer = new MutationObserver(preferenceChanged);
  field.addEventListener('pointerdown', begin, { passive: true });
  field.addEventListener('pointermove', move, { passive: true });
  field.addEventListener('pointerleave', resetTilt, { passive: true });
  window.addEventListener('pointerup', end, { passive: true });
  window.addEventListener('pointercancel', cancel, { passive: true });
  preference.addEventListener('change', preferenceChanged);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  preferenceChanged();
  return () => {
   cancel();
   field.removeEventListener('pointerdown', begin);
   field.removeEventListener('pointermove', move);
   field.removeEventListener('pointerleave', resetTilt);
   window.removeEventListener('pointerup', end);
   window.removeEventListener('pointercancel', cancel);
   preference.removeEventListener('change', preferenceChanged);
   observer.disconnect();
  };
 }, [paused]);

 function select(index: number) {
  if (performance.now() < suppressClickUntil.current) return;
  setCurrent(wrap(index));
 }
 function handleKey(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
   event.preventDefault();
   setCurrent(value => wrap(value + (event.key === 'ArrowRight' ? 1 : -1)));
  } else if (event.key === 'Home' || event.key === 'End') {
   event.preventDefault();
   setCurrent(event.key === 'Home' ? 0 : scenes.length - 1);
  }
 }

 return <div ref={fieldRef} className={`lf-visual glass-showcase${paused ? ' gs-paused' : ''}`} role="region" aria-label="影像场景灵感" aria-roledescription="轮播图" onKeyDown={handleKey}>
  <div className="gs-atmosphere" aria-hidden="true" />
  <div className="gs-stage">
   <div className="gs-orbit">
    {scenes.map((scene, index) => {
     const position = positionFor(index, current);
     return <button key={scene.image} type="button" className="gs-card" data-position={position} aria-label={`查看${scene.title}`} aria-pressed={index === current} tabIndex={index === current ? 0 : -1} onClick={() => select(index)} style={{ '--gs-depth': Math.abs(position) } as CSSProperties}>
      <img src={reference(scene.image)} srcSet={`${reference(scene.image).replace('-1920.webp', '-800.webp')} 800w, ${reference(scene.image)} 1920w`} sizes="(min-width: 900px) 240px, (max-height: 650px) 110px, 170px" width="800" height="1000" alt={scene.alt} draggable={false} />
      <span className="gs-card-reflection" aria-hidden="true" />
      <span className="gs-card-caption">{scene.title}</span>
     </button>;
    })}
   </div>
  </div>
  <div className="gs-controls" aria-label="切换影像场景">
   <button type="button" className="gs-arrow" aria-label="上一个影像场景" onClick={() => select(current - 1)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 7-5 5 5 5" /></svg></button>
   {scenes.map((scene, index) => <button type="button" key={scene.image} className="gs-dot" aria-label={`切换到${scene.title}`} aria-current={current === index ? 'true' : undefined} onClick={() => select(index)}><span /></button>)}
   <button type="button" className="gs-arrow" aria-label="下一个影像场景" onClick={() => select(current + 1)}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m10 7 5 5-5 5" /></svg></button>
  </div>
  <span className="gs-status" aria-live="polite" aria-atomic="true">{scenes[current].title}，第 {current + 1} 张，共 {scenes.length} 张</span>
 </div>;
}
