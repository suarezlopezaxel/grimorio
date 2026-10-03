export type Fx = {
  shape: 'text' | 'leaf' | 'dot' | 'spark';
  colors: string[]; // 'accent' = usa --c-accent actual (clase / elemento / sub)
  count: number;
  size: [number, number];
  vx: [number, number];
  vy: [number, number]; // negativo = sube
  glyphs?: string[];
  alpha?: [number, number];
  sway?: number;
  spin?: number;
  glow?: number;
  twinkle?: boolean;
};

const F = (o: Partial<Fx>): Fx => ({
  shape: 'dot', colors: ['#fff'], count: 20, size: [1, 3], vx: [-8, 8], vy: [-30, -10], ...o,
});

export const THEMES: Record<string, { pip: [string, string]; fx: Fx[]; ripple?: boolean }> = {
  bardo: { pip: ['♪', '♩'], fx: [F({ shape: 'text', glyphs: ['♪', '♫', '♩'], colors: ['#e0b04a', '#f3e6c4'], count: 20, size: [14, 26], vy: [-40, -18], sway: 14, alpha: [0.15, 0.5] })] },
  druida: { pip: ['❀', '✿'], fx: [
    F({ shape: 'leaf', colors: ['#7fb069', '#d9a441', '#a3b86c'], count: 14, size: [4, 7], vx: [-6, 10], vy: [30, 50], sway: 18, spin: 1, alpha: [0.4, 0.8] }),
    F({ shape: 'leaf', colors: ['#5c8a4a', '#b5832f'], count: 14, size: [7, 12], vx: [-4, 6], vy: [55, 80], sway: 24, spin: 1.5, alpha: [0.5, 0.9] }),
    F({ colors: ['#f6e27a'], count: 10, size: [1.5, 2.5], vx: [-6, 6], vy: [-6, 6], sway: 12, glow: 10, twinkle: true }),
  ] },
  barbaro: { pip: ['▮', '▯'], fx: [F({ colors: ['#ff5a2a', '#c0392b', '#ffb347'], count: 40, size: [1, 2.5], vx: [-15, 15], vy: [-70, -25], glow: 8, alpha: [0.3, 0.9] })] },
  clerigo: { pip: ['✚', '✛'], fx: [F({ colors: ['#fff3c4', '#ffffff'], count: 26, size: [1, 2.5], vx: [-4, 4], vy: [12, 26], sway: 8, glow: 6, twinkle: true })] },
  guerrero: { pip: ['◆', '◇'], fx: [F({ shape: 'spark', colors: ['#e6eaee', '#cd7f32'], count: 10, size: [4, 9], vx: [10, 30], vy: [-4, 4], twinkle: true, alpha: [0.2, 0.7] })] },
  monje: { pip: ['◉', '◯'], ripple: true, fx: [F({ colors: ['#efe8d8', '#c8372d'], count: 14, size: [1, 2.5], vx: [-5, 5], vy: [8, 16], sway: 10, alpha: [0.1, 0.35] })] },
  paladin: { pip: ['✠', '✢'], fx: [F({ colors: ['#e8c766', '#cfd8e8'], count: 28, size: [1, 2.8], vx: [-5, 5], vy: [-34, -12], glow: 10, twinkle: true })] },
  picaro: { pip: ['♠', '♤'], fx: [F({ colors: ['#7a4bbf', '#1a1030'], count: 8, size: [40, 90], vx: [8, 22], vy: [-2, 2], sway: 6, alpha: [0.06, 0.16] })] },
  explorador: { pip: ['◈', '◇'], fx: [F({ colors: ['#c8a96a', '#8a9a5b'], count: 18, size: [1, 2], vx: [6, 18], vy: [-2, 2], sway: 6, alpha: [0.15, 0.45] })] },
  hechicero: { pip: ['●', '○'], fx: [F({ colors: ['accent', '#ffb703'], count: 36, size: [1, 3], vx: [-20, 20], vy: [-60, -20], sway: 20, glow: 12, twinkle: true })] },
  brujo: { pip: ['◉', '◎'], fx: [F({ colors: ['accent', '#8cff3f'], count: 14, size: [18, 40], vx: [-6, 6], vy: [-26, -10], sway: 14, alpha: [0.03, 0.1] })] },
  mago: { pip: ['✦', '✧'], fx: [F({ shape: 'text', glyphs: ['ᚠ', 'ᚦ', 'ᚱ', 'ᛟ', 'ᛉ', '✦'], colors: ['#8f7bff', '#4fd1ff'], count: 24, size: [12, 22], vx: [-5, 5], vy: [-24, -8], glow: 12, twinkle: true, alpha: [0.2, 0.6] })] },
  artifice: { pip: ['⚙', '⚬'], fx: [
    F({ shape: 'text', glyphs: ['⚙'], colors: ['#d1803f', '#9ad1c9'], count: 8, size: [18, 44], vx: [-3, 3], vy: [-10, -4], spin: 0.5, alpha: [0.08, 0.22] }),
    F({ colors: ['#ffffff'], count: 12, size: [10, 22], vx: [-4, 4], vy: [-28, -14], alpha: [0.03, 0.08] }),
  ] },
};

/** "Bárbaro" -> "barbaro". Si no existe, usa "mago". */
export const themeKey = (n = '') => {
  const k = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  return k in THEMES ? k : 'mago';
};
