import React, { useEffect, useRef } from 'react';
import { ClassId } from '../../types/character';

interface Props {
  classId: ClassId;
  isShaking: boolean;
  isStealth: boolean;
  isRaging: boolean;
  auraActive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  text?: string;
  color?: string;
  layer?: number; // for druid leaves parallax
  rotation?: number;
  rotSpeed?: number;
  isShadow?: boolean; // for Rogue shifting shadows
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const FxLayer: React.FC<Props> = ({ classId, isShaking, isStealth, isRaging, auraActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Water ripple / note burst listener
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (classId === 'monje') {
        ripplesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: 5,
          maxRadius: 80,
          alpha: 0.8,
        });
      } else if (classId === 'bardo') {
        const notes = ['♩', '♪', '♫', '♬'];
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push({
            x: e.clientX + (Math.random() * 40 - 20),
            y: e.clientY + (Math.random() * 20 - 10),
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.5 - Math.random() * 2,
            size: 16 + Math.random() * 8,
            alpha: 1,
            decay: 0.015,
            text: notes[Math.floor(Math.random() * notes.length)],
            color: '#facc15',
          });
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [classId]);

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize initial ambient particles for the class
    particlesRef.current = [];
    const count = classId === 'druida' ? 30 : classId === 'bardo' ? 18 : classId === 'picaro' ? 16 : 22;

    for (let i = 0; i < count; i++) {
      if (classId === 'druida') {
        // Multi-layered parallax leaves + fireflies
        const isFirefly = i < 8;
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: isFirefly ? (Math.random() - 0.5) * 0.8 : (Math.random() - 0.3) * 1.2,
          vy: isFirefly ? (Math.random() - 0.5) * 0.5 : 0.8 + Math.random() * 1.5,
          size: isFirefly ? 3 : 8 + Math.random() * 12,
          alpha: isFirefly ? 0.8 : 0.5 + Math.random() * 0.5,
          decay: 0,
          color: isFirefly ? '#fbbf24' : Math.random() > 0.4 ? '#4ade80' : '#d97706',
          layer: isFirefly ? 0 : Math.floor(Math.random() * 3) + 1,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
        });
      } else if (classId === 'picaro') {
        // Shifting Shadows drifting softly across the background
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.4,
          size: 90 + Math.random() * 140,
          alpha: 0.3 + Math.random() * 0.4,
          decay: 0,
          isShadow: true,
        });
      } else if (classId === 'bardo') {
        const notes = ['♩', '♪', '♫', '♬'];
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.8 - Math.random() * 1.2,
          size: 14 + Math.random() * 10,
          alpha: 0.3 + Math.random() * 0.6,
          decay: 0.003,
          text: notes[Math.floor(Math.random() * notes.length)],
          color: '#facc15',
        });
      } else if (classId === 'explorador') {
        // Animal tracks along borders
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() > 0.5 ? Math.random() * 80 : height - Math.random() * 80,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.3,
          size: 12 + Math.random() * 6,
          alpha: 0.2 + Math.random() * 0.4,
          decay: 0.002,
          text: '🐾',
          color: '#84cc16',
        });
      } else if (classId === 'barbaro') {
        // Embers
        particlesRef.current.push({
          x: Math.random() * width,
          y: height - Math.random() * height * 0.5,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -1.2 - Math.random() * 2,
          size: 2 + Math.random() * 3,
          alpha: 0.4 + Math.random() * 0.6,
          decay: 0.005,
          color: Math.random() > 0.5 ? '#ef4444' : '#f97316',
        });
      } else if (classId === 'hechicero') {
        // Chaotic mana sparks
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 2 + Math.random() * 3,
          alpha: 0.6,
          decay: 0.02,
          color: Math.random() > 0.5 ? '#ec4899' : '#06b6d4',
        });
      } else if (classId === 'brujo') {
        // Eldritch green/void purple wisps
        particlesRef.current.push({
          x: Math.random() * width,
          y: height - Math.random() * height * 0.7,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.6 - Math.random() * 1.2,
          size: 3 + Math.random() * 4,
          alpha: 0.3 + Math.random() * 0.5,
          decay: 0.006,
          color: Math.random() > 0.4 ? '#10b981' : '#a855f7',
        });
      } else if (classId === 'paladin') {
        // Holy light motes
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.5 - Math.random() * 1,
          size: 2.5 + Math.random() * 3.5,
          alpha: 0.3 + Math.random() * 0.5,
          decay: 0.004,
          color: Math.random() > 0.5 ? '#38bdf8' : '#fde047',
        });
      } else if (classId === 'guerrero') {
        // Steel metallic glints
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: 2 + Math.random() * 2.5,
          alpha: 0.2 + Math.random() * 0.5,
          decay: 0.008,
          color: '#e2e8f0',
        });
      } else if (classId === 'mago') {
        // Shimmering celestial runes
        const runes = ['✧', '✶', '🜛', '✦', 'ᛃ'];
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.6 - Math.random() * 0.8,
          size: 12 + Math.random() * 8,
          alpha: 0.3 + Math.random() * 0.5,
          decay: 0.004,
          text: runes[Math.floor(Math.random() * runes.length)],
          color: '#818cf8',
        });
      } else {
        // Artificer / Cleric / Monk subtle sparks
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size: 2 + Math.random() * 3,
          alpha: 0.3 + Math.random() * 0.4,
          decay: 0.008,
          color: classId === 'artifice' ? '#f97316' : classId === 'clerigo' ? '#facc15' : '#f43f5e',
        });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Cleric God Rays Canvas Draw
      if (classId === 'clerigo') {
        const grad = ctx.createLinearGradient(width * 0.5, 0, width * 0.4, height);
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.12)');
        grad.addColorStop(0.5, 'rgba(250, 204, 21, 0.04)');
        grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(width * 0.3, 0);
        ctx.lineTo(width * 0.7, 0);
        ctx.lineTo(width * 0.9, height);
        ctx.lineTo(width * 0.1, height);
        ctx.closePath();
        ctx.fill();
      }

      // 2. Monk Water Ripples
      if (classId === 'monje' && ripplesRef.current.length > 0) {
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const r = ripplesRef.current[i];
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(225, 29, 72, ${r.alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          r.radius += 2.2;
          r.alpha -= 0.02;
          if (r.alpha <= 0 || r.radius >= r.maxRadius) {
            ripplesRef.current.splice(i, 1);
          }
        }
      }

      // 3. Render Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (p.text) {
          // Musical notes or arcane runes
          ctx.save();
          ctx.font = `${p.size}px serif`;
          ctx.fillStyle = p.color || '#fff';
          ctx.globalAlpha = p.alpha;
          ctx.fillText(p.text, p.x, p.y);
          ctx.restore();
        } else if (p.layer) {
          // Druid Leaf shape
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color || '#22c55e';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.rotSpeed && p.rotation !== undefined) {
            p.rotation += p.rotSpeed;
          }
        } else if (p.isShadow) {
          // Rogue Shifting Shadows
          ctx.save();
          ctx.beginPath();
          const grad = ctx.createRadialGradient(p.x, p.y, p.size * 0.1, p.x, p.y, p.size);
          grad.addColorStop(0, 'rgba(40, 15, 60, 0.45)');
          grad.addColorStop(0.5, 'rgba(20, 8, 32, 0.25)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.globalAlpha = p.alpha;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // Simple glowing circle (embers, sparks, fireflies)
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color || '#f59e0b';
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = p.size * 2;
          ctx.shadowColor = p.color || '#f59e0b';
          ctx.fill();
          ctx.restore();
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.decay > 0) {
          p.alpha -= p.decay;
        }

        // Screen boundary wraps or respawns
        if (p.y < -30 || p.y > height + 30 || p.x < -30 || p.x > width + 30 || p.alpha <= 0) {
          p.x = Math.random() * width;
          p.y = classId === 'druida' ? -10 : height + 10;
          p.alpha = 0.5 + Math.random() * 0.5;
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [classId]);

  return (
    <>
      {/* Fullscreen Canvas for Particles and Weather FX */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      />

      {/* Barbarian Violent Rage Vignette */}
      {isRaging && (
        <div className="pointer-events-none fixed inset-0 z-10 rage-vignette" />
      )}

      {/* Rogue Deep Stealth Darkness Veil */}
      {isStealth && (
        <div className="pointer-events-none fixed inset-0 z-10 bg-black/35 backdrop-brightness-75 transition-all duration-500 shadow-[inset_0_0_150px_rgba(10,5,20,0.9)]" />
      )}

      {/* Paladin Holy Aura Pulsing Sheen */}
      {auraActive && classId === 'paladin' && (
        <div className="pointer-events-none fixed inset-0 z-0 bg-radial from-sky-400/10 via-transparent to-transparent opacity-60 animate-pulse" />
      )}
    </>
  );
};
