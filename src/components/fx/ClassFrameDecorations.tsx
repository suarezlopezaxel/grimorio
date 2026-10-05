import React from 'react';
import { ClassId } from '../../types/character';

interface Props {
  classId: ClassId;
}

export const ClassFrameDecorations: React.FC<Props> = ({ classId }) => {
  switch (classId) {
    case 'picaro':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Ambient Midnight-Purple & Brass Inset Glow (No Red!) */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(168,85,247,0.22),inset_0_0_25px_rgba(202,138,4,0.18)]" />

          {/* Stitched Black Leather Perimeter Frame with Brass Dashes */}
          <div className="absolute inset-2.5 sm:inset-4 border border-dashed border-amber-600/40 rounded-2xl pointer-events-none" />
          <div className="absolute inset-3 sm:inset-4.5 border border-purple-900/30 rounded-xl pointer-events-none" />

          {/* Brass Corner Brackets with Rivets */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500/70 rounded-tl-lg bg-gradient-to-br from-amber-600/20 to-transparent">
            <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-sm" />
          </div>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500/70 rounded-tr-lg bg-gradient-to-bl from-amber-600/20 to-transparent">
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-sm" />
          </div>
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500/70 rounded-bl-lg bg-gradient-to-tr from-amber-600/20 to-transparent">
            <span className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-sm" />
          </div>
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500/70 rounded-br-lg bg-gradient-to-tl from-amber-600/20 to-transparent">
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-sm" />
          </div>

          {/* Tucked Playing Cards (Naipes de Sombra) in Top Corners */}
          <div className="absolute top-3 left-10 flex items-center gap-1 opacity-70 select-none transform -rotate-12">
            <div className="px-1.5 py-0.5 rounded bg-zinc-900/90 border border-purple-500/50 text-[10px] font-mono text-purple-200 font-bold shadow-md">
              ♠ A
            </div>
            <div className="px-1.5 py-0.5 rounded bg-zinc-900/90 border border-amber-500/50 text-[10px] font-mono text-amber-300 font-bold shadow-md -ml-2 mt-1">
              ♦ K
            </div>
          </div>
          <div className="absolute top-3 right-10 flex items-center gap-1 opacity-70 select-none transform rotate-12">
            <div className="px-1.5 py-0.5 rounded bg-zinc-900/90 border border-purple-500/50 text-[10px] font-mono text-purple-200 font-bold shadow-md">
              ♣ Q
            </div>
            <div className="px-1.5 py-0.5 rounded bg-zinc-900/90 border border-amber-500/50 text-[10px] font-mono text-amber-300 font-bold shadow-md -ml-2 mt-1">
              ♠ J
            </div>
          </div>

          {/* Lockpicks & Daggers (Ganzúas de Latón) in Bottom Corners */}
          <div className="absolute bottom-3 left-10 flex items-center gap-1.5 text-xs text-amber-400/50 font-mono select-none">
            <span>🗝️</span>
            <span className="text-[10px] tracking-widest text-purple-300/40 font-mono">×-×-× GANZÚA ×-×-×</span>
          </div>
          <div className="absolute bottom-3 right-10 flex items-center gap-1.5 text-xs text-amber-400/50 font-mono select-none">
            <span className="text-[10px] tracking-widest text-purple-300/40 font-mono">×-×-× FILO OCULTO ×-×-×</span>
            <span>🗡️</span>
          </div>

          {/* Subtle Top Stitching Seam Line */}
          <div className="absolute top-1.5 inset-x-20 text-[8px] text-amber-500/35 font-mono tracking-widest text-center select-none overflow-hidden whitespace-nowrap">
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          </div>
        </div>
      );

    case 'bardo':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Ambient Antique Gold Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(212,175,55,0.22)]" />
          <div className="absolute inset-3 sm:inset-4 border border-amber-500/25 rounded-2xl pointer-events-none" />

          {/* Top Corner Treble Clefs */}
          <div className="absolute top-2 left-4 text-3xl text-amber-300/60 select-none drop-shadow">𝄞</div>
          <div className="absolute top-2 right-4 text-3xl text-amber-300/60 select-none scale-x-[-1] drop-shadow">𝄞</div>
          {/* Bottom Horn / Harp corners */}
          <div className="absolute bottom-2 left-4 text-2xl text-amber-400/50 select-none">📯</div>
          <div className="absolute bottom-2 right-4 text-2xl text-amber-400/50 select-none scale-x-[-1]">♫</div>

          {/* Top and Bottom 5-line musical staves border */}
          <div className="absolute top-1 inset-x-14 h-3 flex flex-col justify-between opacity-30">
            <div className="border-t border-amber-300" />
            <div className="border-t border-amber-300" />
            <div className="border-t border-amber-300" />
            <div className="border-t border-amber-300" />
            <div className="border-t border-amber-300" />
          </div>
          <div className="absolute bottom-1 inset-x-14 h-3 flex flex-col justify-between opacity-30">
            <div className="border-t border-amber-300" />
            <div className="border-t border-amber-300" />
            <div className="border-t border-amber-300" />
            <div className="border-t border-amber-300" />
            <div className="border-t border-amber-300" />
          </div>
        </div>
      );

    case 'druida':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Ambient Moss Emerald Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(34,197,94,0.2)]" />
          <div className="absolute inset-3 sm:inset-4 border border-emerald-600/25 rounded-2xl pointer-events-none" />

          {/* Entwined branches and oak leaves in corners */}
          <svg className="absolute top-0 left-0 w-32 h-32 text-emerald-500/30" viewBox="0 0 120 120" fill="currentColor">
            <path d="M0,0 Q60,10 80,60 Q40,40 10,80 Q0,40 0,0 Z" />
            <circle cx="35" cy="35" r="5" fill="#f59e0b" opacity="0.7" />
          </svg>
          <svg className="absolute top-0 right-0 w-32 h-32 text-emerald-500/30 scale-x-[-1]" viewBox="0 0 120 120" fill="currentColor">
            <path d="M0,0 Q60,10 80,60 Q40,40 10,80 Q0,40 0,0 Z" />
            <circle cx="35" cy="35" r="5" fill="#f59e0b" opacity="0.7" />
          </svg>
          {/* Bottom Root corners */}
          <div className="absolute bottom-2 left-4 text-2xl text-emerald-500/50 select-none">🌿</div>
          <div className="absolute bottom-2 right-4 text-2xl text-emerald-500/50 select-none scale-x-[-1]">🌿</div>
        </div>
      );

    case 'barbaro':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Weathered Stone & Raw Bone Frame with subtle Ember Inset Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(180,83,9,0.2),inset_0_0_30px_rgba(185,28,28,0.15)]" />
          <div className="absolute inset-3 sm:inset-4 border border-amber-900/35 rounded-2xl pointer-events-none" />

          {/* Bone & tied cord corners, carved tribal runes */}
          <div className="absolute top-2 left-3 text-amber-500/60 font-mono text-xl select-none flex items-center gap-1">
            <span>🦴</span>
            <span>ᚱᛟ</span>
          </div>
          <div className="absolute top-2 right-3 text-amber-500/60 font-mono text-xl select-none flex items-center gap-1">
            <span>ᛏᛉ</span>
            <span>🦴</span>
          </div>
          <div className="absolute bottom-2 left-3 text-amber-500/60 font-mono text-xl select-none flex items-center gap-1">
            <span>🦴</span>
            <span>ᚷᚹ</span>
          </div>
          <div className="absolute bottom-2 right-3 text-amber-500/60 font-mono text-xl select-none flex items-center gap-1">
            <span>ᛞᚦ</span>
            <span>🦴</span>
          </div>
          {/* Rough notched stone top bar with warm embers */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-900/60 via-orange-600/30 to-amber-900/60" />
        </div>
      );

    case 'clerigo':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Divine Gold Radiance Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(250,204,21,0.22)]" />
          <div className="absolute inset-3 sm:inset-4 border border-amber-400/25 rounded-2xl pointer-events-none" />

          {/* Gothic Cathedral Pointed Arches & Tracery */}
          <svg className="absolute top-0 inset-x-0 w-full h-8 text-amber-300/20" preserveAspectRatio="none" viewBox="0 0 400 30" fill="none" stroke="currentColor">
            <path d="M0,30 Q50,0 100,30 Q150,0 200,30 Q250,0 300,30 Q350,0 400,30" strokeWidth="1.5" />
          </svg>
          <div className="absolute top-2 left-4 text-amber-300/60 text-2xl select-none">✠</div>
          <div className="absolute top-2 right-4 text-amber-300/60 text-2xl select-none">✠</div>
          <div className="absolute bottom-2 left-4 text-amber-400/40 text-xl select-none">✦</div>
          <div className="absolute bottom-2 right-4 text-amber-400/40 text-xl select-none">✦</div>
        </div>
      );

    case 'guerrero':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Steel Sheen Ambient Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(148,163,184,0.22)]" />
          <div className="absolute inset-3 sm:inset-4 border border-slate-500/30 rounded-2xl pointer-events-none" />

          {/* Riveted steel plates and heraldic shields */}
          <div className="absolute top-2 left-4 text-slate-300/50 text-2xl select-none">🛡️</div>
          <div className="absolute top-2 right-4 text-slate-300/50 text-2xl select-none">🛡️</div>
          <div className="absolute bottom-2 left-4 text-slate-400/40 text-xl select-none">⚔️</div>
          <div className="absolute bottom-2 right-4 text-slate-400/40 text-xl select-none">⚔️</div>

          {/* Rivets along the top bar */}
          <div className="absolute top-1 inset-x-12 border-t border-slate-500/30 flex justify-between px-4">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60 shadow-sm" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60 shadow-sm" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60 shadow-sm" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60 shadow-sm" />
          </div>
        </div>
      );

    case 'monje':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Sumi Ink Wash Inset Glow (No Red Glow!) */}
          <div className="absolute inset-0 shadow-[inset_0_0_90px_rgba(0,0,0,0.85)]" />
          <div className="absolute inset-3 sm:inset-4 border border-zinc-700/35 rounded-2xl pointer-events-none" />

          {/* Calligraphic Brush Strokes & Vermilion Seal Corner Stamps */}
          <div className="absolute top-3 left-4 text-zinc-300/80 text-xl font-serif select-none border border-rose-600/60 px-2 py-0.5 rounded shadow-md bg-rose-950/60">
            道
          </div>
          <div className="absolute top-3 right-4 text-zinc-300/80 text-xl font-serif select-none border border-rose-600/60 px-2 py-0.5 rounded shadow-md bg-rose-950/60">
            禪
          </div>
          <div className="absolute bottom-3 left-4 text-zinc-400/50 text-xl select-none">☯</div>
          <div className="absolute bottom-3 right-4 text-zinc-400/50 text-lg font-serif select-none">氣</div>
        </div>
      );

    case 'paladin':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Celestial Azure & Silver Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(56,189,248,0.22)]" />
          <div className="absolute inset-3 sm:inset-4 border border-sky-500/25 rounded-2xl pointer-events-none" />

          {/* Angelic wings & sacred shield */}
          <div className="absolute top-2 left-4 text-sky-300/60 text-3xl select-none">🪽</div>
          <div className="absolute top-2 right-4 text-sky-300/60 text-3xl select-none scale-x-[-1]">🪽</div>
          <div className="absolute bottom-2 left-4 text-amber-300/50 text-2xl select-none">⚖️</div>
          <div className="absolute bottom-2 right-4 text-amber-300/50 text-2xl select-none">✧</div>
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400/20 via-amber-300/40 to-sky-400/20" />
        </div>
      );

    case 'explorador':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Olive Chartreuse & Leather Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_70px_rgba(132,204,22,0.2)]" />
          <div className="absolute inset-3 sm:inset-4 border border-lime-600/25 rounded-2xl pointer-events-none" />

          {/* Compass rose & navigational lines */}
          <div className="absolute top-2 left-4 text-lime-400/50 text-2xl select-none">🧭</div>
          <div className="absolute top-2 right-4 text-lime-400/50 text-xl select-none">🏹</div>
          <div className="absolute bottom-2 left-4 text-lime-400/40 text-xs font-mono select-none">
            LAT 45° 12' N // LON 12° 08' W
          </div>
          <div className="absolute bottom-2 right-4 text-lime-400/40 text-sm select-none">🐾 🐾</div>
        </div>
      );

    case 'hechicero':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Chaos Magenta & Storm Cyan Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(236,72,153,0.25)]" />
          <div className="absolute inset-3 sm:inset-4 border border-pink-500/25 rounded-2xl pointer-events-none" />

          {/* Glowing mana energy conduits */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-pink-500/40 via-amber-400/60 to-cyan-400/40 shadow-[0_0_10px_#ec4899]" />
          <div className="absolute top-2 left-4 text-pink-400/50 text-2xl select-none animate-pulse">⚡</div>
          <div className="absolute top-2 right-4 text-cyan-400/50 text-2xl select-none animate-pulse">⚡</div>
          <div className="absolute bottom-2 left-4 text-pink-400/40 text-xl select-none">✵</div>
          <div className="absolute bottom-2 right-4 text-cyan-400/40 text-xl select-none">✵</div>
        </div>
      );

    case 'brujo':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Toxic Emerald & Void Violet Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(16,185,129,0.22)]" />
          <div className="absolute inset-3 sm:inset-4 border border-emerald-600/25 rounded-2xl pointer-events-none" />

          {/* Creeping eldritch eyes and tentacles */}
          <div className="absolute top-2 left-4 text-emerald-400/50 text-2xl select-none">👁️</div>
          <div className="absolute top-2 right-4 text-purple-400/50 text-2xl select-none">👁️</div>
          <div className="absolute bottom-2 left-4 text-emerald-400/40 text-xl select-none">🜏</div>
          <div className="absolute bottom-2 right-4 text-emerald-400/40 text-xl select-none">🜏</div>
        </div>
      );

    case 'mago':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Astral Starlight Indigo Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(99,102,241,0.22)]" />
          <div className="absolute inset-3 sm:inset-4 border border-indigo-500/25 rounded-2xl pointer-events-none" />

          {/* Rotating celestial arcane circles */}
          <svg className="absolute -top-14 -left-14 w-44 h-44 text-indigo-400/20 spin-slow select-none" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="10, 5" />
            <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" fill="none" />
            <polygon points="100,20 169,140 31,140" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
          <svg className="absolute -top-14 -right-14 w-44 h-44 text-indigo-400/20 spin-slow-rev select-none" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="10, 5" />
            <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" fill="none" />
            <polygon points="100,180 31,60 169,60" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
          <div className="absolute bottom-2 left-4 text-indigo-300/40 text-xl select-none">🜛</div>
          <div className="absolute bottom-2 right-4 text-indigo-300/40 text-xl select-none">✧</div>
        </div>
      );

    case 'artifice':
      return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Burnished Copper Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(249,115,22,0.22)]" />
          <div className="absolute inset-3 sm:inset-4 border border-orange-500/25 rounded-2xl pointer-events-none" />

          {/* Interlocking brass cogs and technical blueprint grid */}
          <div className="absolute top-2 left-4 text-orange-400/50 text-2xl spin-slow select-none">⚙️</div>
          <div className="absolute top-2 right-4 text-orange-400/50 text-2xl spin-slow-rev select-none">⚙️</div>
          <div className="absolute bottom-2 left-4 text-orange-400/40 text-xl select-none">🗜️</div>
          <div className="absolute bottom-2 right-4 text-orange-400/40 text-xl select-none">🔧</div>
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-600/30 via-amber-500/50 to-orange-600/30" />
        </div>
      );

    default:
      return null;
  }
};
