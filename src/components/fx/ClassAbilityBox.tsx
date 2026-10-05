import React from 'react';
import { Dices, Sparkles } from 'lucide-react';
import { AbilityKey, ClassId } from '../../types/character';

interface Props {
  abilityKey: AbilityKey;
  label: string;
  score: number;
  mod: number;
  proficientSave: boolean;
  saveBonus: number;
  isSpellPrimary: boolean;
  classId: ClassId;
  onRoll: () => void;
  onToggleSave: () => void;
}

export const ClassAbilityBox: React.FC<Props> = ({
  abilityKey,
  label,
  score,
  mod,
  proficientSave,
  saveBonus,
  isSpellPrimary,
  classId,
  onRoll,
  onToggleSave,
}) => {
  const formatMod = (m: number) => (m >= 0 ? `+${m}` : `${m}`);

  const getBoxThemeClass = () => {
    switch (classId) {
      case 'barbaro': return 'theme-box-barbaro';
      case 'druida': return 'theme-box-druida';
      case 'bardo': return 'theme-box-bardo';
      case 'clerigo': return 'theme-box-clerigo';
      case 'guerrero': return 'theme-box-guerrero';
      case 'monje': return 'theme-box-monje';
      case 'paladin': return 'theme-box-paladin';
      case 'picaro': return 'theme-box-picaro';
      case 'explorador': return 'theme-box-explorador';
      case 'hechicero': return 'theme-box-hechicero';
      case 'brujo': return 'theme-box-brujo';
      case 'mago': return 'theme-box-mago';
      case 'artifice': return 'theme-box-artifice';
      default: return 'theme-box-mago';
    }
  };

  const getModThemeClass = () => {
    switch (classId) {
      case 'barbaro': return 'theme-mod-barbaro';
      case 'druida': return 'theme-mod-druida';
      case 'bardo': return 'theme-mod-bardo';
      case 'clerigo': return 'theme-mod-clerigo';
      case 'guerrero': return 'theme-mod-guerrero';
      case 'monje': return 'theme-mod-monje';
      case 'paladin': return 'theme-mod-paladin';
      case 'picaro': return 'theme-mod-picaro';
      case 'explorador': return 'theme-mod-explorador';
      case 'hechicero': return 'theme-mod-hechicero';
      case 'brujo': return 'theme-mod-brujo';
      case 'mago': return 'theme-mod-mago';
      case 'artifice': return 'theme-mod-artifice';
      default: return 'theme-mod-mago';
    }
  };

  const renderOrnamentation = () => {
    switch (classId) {
      case 'barbaro':
        return (
          <>
            {/* Real Carved Bone Corners */}
            <span className="pointer-events-none absolute -top-1 -left-1 text-sm select-none drop-shadow">🦴</span>
            <span className="pointer-events-none absolute -top-1 -right-1 text-sm select-none scale-x-[-1] drop-shadow">🦴</span>
            <span className="pointer-events-none absolute -bottom-1 -left-1 text-xs select-none rotate-45 drop-shadow">🦴</span>
            <span className="pointer-events-none absolute -bottom-1 -right-1 text-xs select-none -rotate-45 drop-shadow">🦴</span>
            {/* Blood-etched Runes in watermark */}
            <div className="pointer-events-none absolute inset-x-2 top-6 flex justify-between text-[10px] text-red-500/25 font-mono select-none">
              <span>ᚱ</span>
              <span>ᚦ</span>
            </div>
            <div className="pointer-events-none absolute inset-x-2 bottom-8 flex justify-between text-[10px] text-red-500/25 font-mono select-none">
              <span>ᛟ</span>
              <span>ᛏ</span>
            </div>
          </>
        );

      case 'druida':
        return (
          <>
            {/* Living Wood & Vines */}
            <span className="pointer-events-none absolute top-1 left-1.5 text-xs text-emerald-400 select-none">🍃</span>
            <span className="pointer-events-none absolute top-1 right-1.5 text-xs text-emerald-400 select-none scale-x-[-1]">🍃</span>
            <span className="pointer-events-none absolute bottom-1 left-1.5 text-xs text-amber-500/80 select-none">🌿</span>
            <span className="pointer-events-none absolute bottom-1 right-1.5 text-xs text-amber-500/80 select-none">🌿</span>
            {/* Amber drop bead */}
            <div className="pointer-events-none absolute top-2 right-6 w-2 h-2 rounded-full bg-amber-400/80 shadow-[0_0_6px_#f59e0b]" />
          </>
        );

      case 'bardo':
        return (
          <>
            {/* Treble clefs & horns */}
            <span className="pointer-events-none absolute top-1 left-1.5 text-sm text-amber-300/90 select-none">𝄞</span>
            <span className="pointer-events-none absolute top-1 right-1.5 text-sm text-amber-300/90 select-none scale-x-[-1]">𝄞</span>
            <span className="pointer-events-none absolute bottom-1 left-2 text-[11px] text-amber-400/70 select-none">📯</span>
            <span className="pointer-events-none absolute bottom-1 right-2 text-[11px] text-amber-400/70 select-none">♫</span>
            {/* 5-line musical stave lines */}
            <div className="pointer-events-none absolute inset-x-4 top-7 h-2 flex flex-col justify-between opacity-30">
              <div className="border-t border-amber-300" />
              <div className="border-t border-amber-300" />
              <div className="border-t border-amber-300" />
            </div>
          </>
        );

      case 'clerigo':
        return (
          <>
            {/* Gothic pointed arch cross */}
            <span className="pointer-events-none absolute top-1 left-1.5 text-xs text-amber-300 select-none">✠</span>
            <span className="pointer-events-none absolute top-1 right-1.5 text-xs text-amber-300 select-none">✠</span>
            <span className="pointer-events-none absolute bottom-1 left-2 text-[10px] text-amber-400/70 select-none">✦</span>
            <span className="pointer-events-none absolute bottom-1 right-2 text-[10px] text-amber-400/70 select-none">✦</span>
            {/* Gothic arch aura */}
            <div className="pointer-events-none absolute top-0 inset-x-6 h-3 border-b border-amber-400/30 rounded-b-full" />
          </>
        );

      case 'guerrero':
        return (
          <>
            {/* Riveted heavy metal armor plate studs */}
            <div className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 shadow-sm border border-slate-600" />
            <div className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 shadow-sm border border-slate-600" />
            <div className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 shadow-sm border border-slate-600" />
            <div className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 shadow-sm border border-slate-600" />
          </>
        );

      case 'monje':
        return (
          <>
            {/* Sumi-e vermilion seal & zen marks */}
            <span className="pointer-events-none absolute top-1.5 right-1.5 text-[9px] font-bold text-rose-200 bg-rose-950 border border-rose-500/70 px-1 py-0.5 rounded shadow-sm select-none">
              氣
            </span>
            <span className="pointer-events-none absolute bottom-1 left-1.5 text-[10px] text-rose-400/60 select-none">☯</span>
          </>
        );

      case 'paladin':
        return (
          <>
            {/* Angelic wings & holy halo */}
            <span className="pointer-events-none absolute top-1 left-1 text-xs text-sky-300 select-none">🪽</span>
            <span className="pointer-events-none absolute top-1 right-1 text-xs text-sky-300 select-none scale-x-[-1]">🪽</span>
            <div className="pointer-events-none absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
          </>
        );

      case 'picaro':
        return (
          <>
            {/* Stitched seam & playing card corner & brass lockpick */}
            <span className="pointer-events-none absolute top-1 left-1.5 text-xs text-amber-400 select-none">♠</span>
            <span className="pointer-events-none absolute top-1 right-1.5 text-xs text-purple-300 select-none">🗡️</span>
            <span className="pointer-events-none absolute bottom-1 left-1.5 text-[10px] text-amber-500/80 select-none">🗝️</span>
            <span className="pointer-events-none absolute bottom-1 right-1.5 text-[10px] text-amber-400/80 select-none">♦</span>
            {/* Cross-stitching line in brass */}
            <div className="pointer-events-none absolute inset-x-5 bottom-8 text-[8px] text-amber-500/40 font-mono tracking-widest text-center select-none">
              ×--×--×--×
            </div>
          </>
        );

      case 'explorador':
        return (
          <>
            {/* Compass rose & wild paw prints */}
            <span className="pointer-events-none absolute top-1 left-1.5 text-xs text-lime-400 select-none">🧭</span>
            <span className="pointer-events-none absolute bottom-1 right-1.5 text-xs text-lime-500/70 select-none">🐾</span>
          </>
        );

      case 'hechicero':
        return (
          <>
            {/* Pulsing lightning sparks */}
            <span className="pointer-events-none absolute top-1 left-1.5 text-xs text-pink-400 select-none animate-pulse">⚡</span>
            <span className="pointer-events-none absolute top-1 right-1.5 text-xs text-cyan-300 select-none animate-pulse">✵</span>
          </>
        );

      case 'brujo':
        return (
          <>
            {/* Eldritch eye & sigil */}
            <span className="pointer-events-none absolute top-1 left-1.5 text-xs text-emerald-400 select-none">👁️</span>
            <span className="pointer-events-none absolute bottom-1 right-1.5 text-xs text-emerald-500/80 select-none">🜏</span>
          </>
        );

      case 'mago':
        return (
          <>
            {/* Arcane rune & gilded bracket */}
            <span className="pointer-events-none absolute top-1 left-1.5 text-xs text-indigo-300 select-none">🜛</span>
            <span className="pointer-events-none absolute top-1 right-1.5 text-xs text-indigo-300 select-none">✧</span>
          </>
        );

      case 'artifice':
        return (
          <>
            {/* Rotating brass gear & caliper */}
            <span className="pointer-events-none absolute top-1 left-1.5 text-xs text-orange-400 spin-slow select-none">⚙️</span>
            <div className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 border border-orange-700 shadow-sm" />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative flex flex-col items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] ${getBoxThemeClass()}`}
    >
      {renderOrnamentation()}

      {/* Primary Key Spellcaster Tag */}
      {isSpellPrimary && (
        <span className="absolute -top-3 rounded-full bg-amber-400 text-stone-950 font-black px-2.5 py-0.5 text-[9px] uppercase tracking-wider shadow-lg z-10 border border-amber-300">
          CLAVE
        </span>
      )}

      {/* Ability Header: Title & Dice Launcher */}
      <div className="flex items-center justify-between w-full text-xs font-bold mb-2 font-cinzel z-10">
        <span className="tracking-wider uppercase">{label}</span>
        <button
          onClick={onRoll}
          className="p-1 rounded opacity-75 hover:opacity-100 hover:bg-black/30 transition cursor-pointer"
          title={`Tirar d20 + ${mod}`}
        >
          <Dices className="h-4 w-4" />
        </button>
      </div>

      {/* Big Modifier Button */}
      <button
        onClick={onRoll}
        className={`my-1.5 flex h-16 w-16 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10 ${getModThemeClass()}`}
      >
        <div className="text-center">
          <span className="font-cinzel text-2xl font-black block leading-none drop-shadow-sm">
            {formatMod(mod)}
          </span>
          <span className="text-[9px] font-mono font-bold opacity-90 block tracking-widest mt-0.5">
            MOD
          </span>
        </div>
      </button>

      {/* Score Text Pill */}
      <div className="mt-2 text-xs font-mono font-medium opacity-90 z-10">
        PUNTUACIÓN <strong className="font-bold text-sm ml-0.5">{score}</strong>
      </div>

      {/* Saving Throw Toggle Button */}
      <button
        onClick={onToggleSave}
        className={`mt-2.5 flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition cursor-pointer z-10 ${
          proficientSave
            ? 'border-amber-400/80 bg-black/40 text-amber-300 shadow-sm font-bold'
            : 'border-white/10 bg-black/30 opacity-75 hover:opacity-100'
        }`}
        title="Competencia en Tirada de Salvación (clic para alternar)"
      >
        <span className="text-[10px]">Salvación</span>
        <span className="font-bold font-mono text-xs">{formatMod(saveBonus)}</span>
      </button>
    </div>
  );
};
