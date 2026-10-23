import { useEffect, useRef } from 'react';
import { reference } from './guangdang-data';
import './lightfield-visual.css';

type LightfieldVisualProps = { paused?: boolean };

const fieldPhotos = [
 { id: 11, className: 'lf-frame lf-frame-back', width: 110, height: 70, sizes: '(min-width: 900px) 150px, 110px' },
 { id: 8, className: 'lf-frame lf-frame-side', width: 145, height: 88, sizes: '(min-width: 900px) 190px, (max-width: 359px) 125px, 145px' },
 { id: 5, className: 'lf-frame lf-frame-front', width: 125, height: 80, sizes: '(min-width: 900px) 165px, 125px' },
];

export default function LightfieldVisual({ paused = false }: LightfieldVisualProps) {
 const fieldRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const field = fieldRef.current;
  if (!field) return;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let pressed = false;
  let latestX = 0;
  let latestY = 0;

  const disabled = () => paused || motionPreference.matches || document.body.classList.contains('motion-paused');
  const reset = () => {
   pressed = false;
   cancelAnimationFrame(frame);
   frame = 0;
   field.classList.remove('lf-interacting');
   field.style.setProperty('--lf-rx', '0deg');
   field.style.setProperty('--lf-ry', '0deg');
  };
  const applyTilt = () => {
   frame = 0;
   if (disabled()) { reset(); return; }
   const bounds = field.getBoundingClientRect();
   if (!bounds.width || !bounds.height) return;
   const x = Math.max(-1, Math.min(1, (latestX - bounds.left) / bounds.width * 2 - 1));
   const y = Math.max(-1, Math.min(1, (latestY - bounds.top) / bounds.height * 2 - 1));
   field.style.setProperty('--lf-rx', `${(-y * 7).toFixed(2)}deg`);
   field.style.setProperty('--lf-ry', `${(x * 11).toFixed(2)}deg`);
  };
  const move = (event: PointerEvent) => {
   if (disabled() || (event.pointerType !== 'mouse' && !pressed)) return;
   latestX = event.clientX;
   latestY = event.clientY;
   field.classList.add('lf-interacting');
   if (!frame) frame = requestAnimationFrame(applyTilt);
  };
  const begin = (event: PointerEvent) => {
   if (disabled()) return;
   pressed = true;
   move(event);
  };
  const preferenceChanged = () => { if (disabled()) reset(); };
  const bodyObserver = new MutationObserver(preferenceChanged);

  if (paused) reset();
  field.addEventListener('pointerdown', begin, { passive: true });
  field.addEventListener('pointermove', move, { passive: true });
  field.addEventListener('pointerleave', reset, { passive: true });
  field.addEventListener('pointercancel', reset, { passive: true });
  window.addEventListener('pointerup', reset, { passive: true });
  motionPreference.addEventListener('change', preferenceChanged);
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  return () => {
   reset();
   field.removeEventListener('pointerdown', begin);
   field.removeEventListener('pointermove', move);
   field.removeEventListener('pointerleave', reset);
   field.removeEventListener('pointercancel', reset);
   window.removeEventListener('pointerup', reset);
   motionPreference.removeEventListener('change', preferenceChanged);
   bodyObserver.disconnect();
  };
 }, [paused]);

 return <div ref={fieldRef} className={`lf-visual${paused ? ' lf-paused' : ''}`} role="img" aria-label="银色光学透镜与三张悬浮影像画框，连接城市、人物和活动故事">
  <div className="lf-ground" aria-hidden="true" />
  <div className="lf-object" aria-hidden="true">
   <span className="lf-wire" />
   <div className={fieldPhotos[0].className}>
    <img src={reference(fieldPhotos[0].id)} srcSet={`${reference(fieldPhotos[0].id).replace('-1920.webp', '-800.webp')} 800w, ${reference(fieldPhotos[0].id)} 1920w`} sizes={fieldPhotos[0].sizes} width={fieldPhotos[0].width} height={fieldPhotos[0].height} alt="" draggable={false} />
   </div>
   <div className="lf-lens"><span className="lf-lens-core" /><span className="lf-lens-highlight" /></div>
   <div className="lf-ring lf-ring-first"><span /></div>
   <div className="lf-ring lf-ring-second"><span /></div>
   {fieldPhotos.slice(1).map(photo => <div key={photo.id} className={photo.className}>
    <img src={reference(photo.id)} srcSet={`${reference(photo.id).replace('-1920.webp', '-800.webp')} 800w, ${reference(photo.id)} 1920w`} sizes={photo.sizes} width={photo.width} height={photo.height} alt="" draggable={false} />
   </div>)}
  </div>
  <span className="lf-caption" aria-hidden="true">YOUR STORY, REIMAGINED.</span>
  <span className="lf-tally" aria-hidden="true">01 — ∞</span>
 </div>;
}
