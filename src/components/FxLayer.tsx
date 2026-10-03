import { useEffect, useRef } from 'react';
import { THEMES, type Fx } from '../fxThemes';

type P = { f: Fx; x: number; y: number; s: number; vx: number; vy: number; a: number; g: string; c: string; ph: number; rot: number; life?: number };
const r = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];

/** Capa de ambiente: va detrás del contenido. `burst` (número que sube) lanza una ráfaga extra. */
export function FxLayer({ themeKey, tint = '', burst = 0 }: { themeKey: string; tint?: string; burst?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const psRef = useRef<P[]>([]);

  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!;
    const t = THEMES[themeKey] ?? THEMES.mago;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const acc = getComputedStyle(cv).getPropertyValue('--c-accent').trim() || '#fff';
    let W = 0, H = 0, raf = 0, last = performance.now();

    const resize = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * d; cv.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const make = (f: Fx, init: boolean): P => {
      const vx = r(...f.vx), vy = r(...f.vy), side = !init && Math.abs(vy) < 5;
      const col = pick(f.colors);
      return {
        f, vx, vy,
        x: side ? (vx > 0 ? -20 : W + 20) : r(0, W),
        y: side || init ? r(0, H) : vy < 0 ? H + 20 : -20,
        s: r(...f.size), a: r(...(f.alpha ?? [0.3, 0.8])),
        g: f.glyphs ? pick(f.glyphs) : '', c: col === 'accent' ? acc : col,
        ph: r(0, 6.28), rot: r(0, 6.28),
      };
    };

    resize();
    const ps = t.fx.flatMap(f => Array.from({ length: f.count }, () => make(f, true)));
    psRef.current = ps;
    const rip: { x: number; y: number; r: number }[] = [];
    const down = (e: PointerEvent) => { if (t.ripple) rip.push({ x: e.clientX, y: e.clientY, r: 0 }); };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (document.hidden) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      ctx.clearRect(0, 0, W, H);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i], f = p.f;
        p.ph += dt; p.x += (p.vx + Math.sin(p.ph) * (f.sway ?? 0)) * dt; p.y += p.vy * dt; p.rot += (f.spin ?? 0) * dt;
        if (p.life !== undefined && (p.life -= dt) <= 0) { ps.splice(i, 1); continue; }
        if (p.y < -90 || p.y > H + 90 || p.x < -90 || p.x > W + 90) {
          if (p.life !== undefined) ps.splice(i, 1); else Object.assign(p, make(f, false));
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.a * (f.twinkle ? 0.5 + 0.5 * Math.sin(p.ph * 3) : 1);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = ctx.strokeStyle = p.c;
        if (f.glow) { ctx.shadowColor = p.c; ctx.shadowBlur = f.glow; }
        if (f.shape === 'text') { ctx.font = `${p.s}px "Segoe UI Symbol", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.g, 0, 0); }
        else if (f.shape === 'leaf') { ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s / 2.2, 0, 0, 6.28); ctx.fill(); }
        else if (f.shape === 'spark') { ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-p.s, 0); ctx.lineTo(p.s, 0); ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(0, 0, p.s, 0, 6.28); ctx.fill(); }
        ctx.restore();
      }
      for (let i = rip.length - 1; i >= 0; i--) {
        const q = rip[i]; q.r += 140 * dt;
        if (q.r > 110) { rip.splice(i, 1); continue; }
        ctx.globalAlpha = 1 - q.r / 110; ctx.strokeStyle = acc; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.28); ctx.stroke(); ctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(draw);
    addEventListener('resize', resize); addEventListener('pointerdown', down);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointerdown', down); };
  }, [themeKey, tint]);

  useEffect(() => {
    const ps = psRef.current, cv = ref.current;
    if (!burst || !cv || !ps.length) return;
    for (let i = 0; i < 28; i++) { const b = pick(ps); ps.push({ ...b, x: r(0, cv.clientWidth), y: r(cv.clientHeight * 0.4, cv.clientHeight), life: 2.5 }); }
  }, [burst]);

  return <canvas ref={ref} aria-hidden="true" />;
}
