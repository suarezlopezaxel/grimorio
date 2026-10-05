import React, { useState } from 'react';
import { Flame, ShieldAlert, Sparkles, RotateCcw } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onTriggerShake?: () => void;
}

export const BarbarianRageModule: React.FC<Props> = ({ character, onUpdate, onTriggerShake }) => {
  const barbData = character.classResources.barbarian || {
    rageCurrent: 3,
    rageMax: 3,
    isRaging: false,
  };

  const [screaming, setScreaming] = useState(false);

  const toggleRage = () => {
    const nextState = !barbData.isRaging;
    let nextCurrent = barbData.rageCurrent;

    if (nextState) {
      if (barbData.rageCurrent <= 0) return;
      nextCurrent -= 1;
      setScreaming(true);
      if (onTriggerShake) {
        onTriggerShake();
      }
      setTimeout(() => setScreaming(false), 800);
    }

    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        barbarian: {
          ...barbData,
          isRaging: nextState,
          rageCurrent: nextCurrent,
        },
      },
    });
  };

  const restoreRages = () => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        barbarian: {
          ...barbData,
          rageCurrent: barbData.rageMax,
          isRaging: false,
        },
      },
    });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 p-5 backdrop-blur-md ${
        barbData.isRaging
          ? 'border-red-600 bg-gradient-to-br from-[#3b0a0a] via-[#240606] to-[#400e0e] shadow-[0_0_30px_rgba(239,68,68,0.5)]'
          : 'border-red-900/40 bg-gradient-to-br from-[#200c0c]/90 via-[#140808]/95 to-[#240e0e]/90'
      }`}
    >
      {/* Stone Carved Norse Runes Background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-around text-red-900/20 text-4xl font-mono select-none">
        <span>ᚠ</span>
        <span>ᚦ</span>
        <span>ᚨ</span>
        <span>ᚱ</span>
        <span>ᚲ</span>
        <span>ᚷ</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl font-bold shadow-inner transition ${
              barbData.isRaging
                ? 'border-red-400 bg-red-600 text-white animate-pulse'
                : 'border-red-500/30 bg-red-950/40 text-red-400'
            }`}
          >
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-red-100 tracking-wide">
                Furia Berserker (Camino de la Sangre)
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold border transition ${
                  barbData.isRaging
                    ? 'border-red-400 bg-red-500/30 text-red-200 animate-pulse'
                    : 'border-red-800 bg-red-950/30 text-red-400'
                }`}
              >
                {barbData.isRaging ? '¡FURIA ACTIVA!' : `${barbData.rageCurrent} / ${barbData.rageMax} Furias`}
              </span>
            </div>
            <p className="text-xs text-red-200/70">
              Resistencia a Contundente, Perforante y Cortante • +2 daño cuerpo a cuerpo
            </p>
          </div>
        </div>

        <button
          onClick={restoreRages}
          className="flex items-center gap-1.5 rounded-lg border border-red-800/40 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900/50 hover:border-red-600 transition"
          title="Recuperar en descanso largo"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Calmar Espíritu (Recargar)</span>
        </button>
      </div>

      {/* Visceral Claw Scratch Marks (Marcas de Garra) as Counter */}
      <div className="my-4 rounded-xl border border-red-900/50 bg-[#120606]/90 p-4 shadow-inner">
        <div className="flex items-center justify-between text-xs text-red-300 mb-3 font-cinzel">
          <span className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-red-500" /> Marcas de Garra Totémicas:
          </span>
          <span className="text-[11px] text-red-400 font-mono">
            {barbData.rageCurrent} cargas de batalla listas
          </span>
        </div>

        {/* Claw marks visual */}
        <div className="grid grid-cols-4 gap-3 py-2">
          {Array.from({ length: barbData.rageMax }).map((_, idx) => {
            const isAvailable = idx < barbData.rageCurrent;
            return (
              <div
                key={idx}
                className={`relative flex h-14 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                  isAvailable
                    ? 'border-red-600 bg-gradient-to-b from-[#2b0808] to-[#1a0505] shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : 'border-zinc-800 bg-stone-950 opacity-30'
                }`}
              >
                {/* 3 diagonal slash marks SVG */}
                <svg className="w-12 h-10" viewBox="0 0 50 40">
                  <path
                    d="M10,5 L8,35 M24,3 L22,37 M38,6 L36,34"
                    stroke={isAvailable ? '#ef4444' : '#52525b'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className={isAvailable ? 'drop-shadow-[0_0_4px_#dc2626]' : ''}
                  />
                </svg>
                <span className="absolute bottom-1 right-2 text-[9px] font-mono text-red-300/60">
                  Garra {idx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Big Rage Button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={toggleRage}
            disabled={!barbData.isRaging && barbData.rageCurrent <= 0}
            className={`flex-1 py-3 px-4 rounded-xl font-cinzel font-black tracking-widest text-sm uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              barbData.isRaging
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.7)] hover:brightness-110'
                : barbData.rageCurrent > 0
                ? 'bg-gradient-to-r from-red-800 to-red-950 text-red-100 border border-red-500/50 hover:border-red-400 hover:from-red-700 hover:to-red-900 shadow-lg'
                : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            }`}
          >
            <ShieldAlert className="h-5 w-5" />
            {barbData.isRaging ? '💥 APAGAR FURIA (TRANQUILIZARSE)' : '🩸 ¡DESATAR FURIA! (TEMBLOR DE PANTALLA)'}
          </button>
        </div>

        {screaming && (
          <div className="mt-2 text-center text-xs font-black tracking-widest text-red-400 animate-bounce">
            ¡¡¡¡GRAAAAGHHH!!!! LA SANGRE HIERVE EN TU PECHO
          </div>
        )}
      </div>
    </div>
  );
};
