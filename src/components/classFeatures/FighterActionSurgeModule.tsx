import React from 'react';
import { Shield, Swords, RotateCcw, Heart, Zap, Sparkles } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onRollHeal?: (formula: string) => void;
}

export const FighterActionSurgeModule: React.FC<Props> = ({ character, onUpdate, onRollHeal }) => {
  const fighterData = character.classResources.fighter || {
    secondWindUsed: false,
    actionSurgeUsed: false,
  };

  const useSecondWind = () => {
    if (fighterData.secondWindUsed) return;
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        fighter: {
          ...fighterData,
          secondWindUsed: true,
        },
      },
    });
    if (onRollHeal) {
      onRollHeal(`1d10 + ${character.level}`);
    }
  };

  const useActionSurge = () => {
    if (fighterData.actionSurgeUsed) return;
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        fighter: {
          ...fighterData,
          actionSurgeUsed: true,
        },
      },
    });
  };

  const restoreMartialEmblems = () => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        fighter: {
          secondWindUsed: false,
          actionSurgeUsed: false,
        },
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-600/50 bg-gradient-to-br from-[#181d26]/90 via-[#10141a]/95 to-[#222936]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Plate armor bevels and rivets */}
      <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-slate-500/20" />
      <div className="pointer-events-none absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-400/40 shadow-inner" />
      <div className="pointer-events-none absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-400/40 shadow-inner" />
      <div className="pointer-events-none absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-400/40 shadow-inner" />
      <div className="pointer-events-none absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-400/40 shadow-inner" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-400/40 bg-slate-700/30 text-slate-200 shadow-inner">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-bold text-slate-100 tracking-wide">
              Emblemas Marciales Forjados
            </h3>
            <p className="text-xs text-slate-400">
              Las insignias arden al rojo vivo y se apagan en frío al consumir su ventaja táctica
            </p>
          </div>
        </div>

        <button
          onClick={restoreMartialEmblems}
          className="flex items-center gap-1.5 rounded-lg border border-slate-600/40 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700/50 hover:border-slate-400 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reforjar en Descanso</span>
        </button>
      </div>

      {/* Forged Metal Medals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
        {/* Segundo Aliento */}
        <button
          onClick={useSecondWind}
          disabled={fighterData.secondWindUsed}
          className={`group relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-300 ${
            !fighterData.secondWindUsed
              ? 'border-amber-500/70 bg-gradient-to-r from-[#2a1c12] via-[#3d2919] to-[#2a1c12] shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:border-amber-400 hover:scale-[1.01] cursor-pointer'
              : 'border-zinc-800 bg-zinc-900/60 opacity-40 cursor-not-allowed filter grayscale'
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
              !fighterData.secondWindUsed
                ? 'border-amber-400 bg-amber-500/30 text-amber-200 shadow-[0_0_12px_#f59e0b]'
                : 'border-zinc-700 bg-zinc-800 text-zinc-500'
            }`}
          >
            <Heart className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-sm font-bold text-slate-100">Segundo Aliento</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  !fighterData.secondWindUsed
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {!fighterData.secondWindUsed ? 'ENCENDIDO' : 'APAGADO'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Recupera <strong className="text-amber-200">1d10 + {character.level} PG</strong> como Acción Adicional
            </p>
          </div>
        </button>

        {/* Oleada de Acción */}
        <button
          onClick={useActionSurge}
          disabled={fighterData.actionSurgeUsed}
          className={`group relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-300 ${
            !fighterData.actionSurgeUsed
              ? 'border-blue-400/70 bg-gradient-to-r from-[#142338] via-[#1d3557] to-[#142338] shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:border-blue-300 hover:scale-[1.01] cursor-pointer'
              : 'border-zinc-800 bg-zinc-900/60 opacity-40 cursor-not-allowed filter grayscale'
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
              !fighterData.actionSurgeUsed
                ? 'border-blue-400 bg-blue-500/30 text-blue-200 shadow-[0_0_12px_#38bdf8]'
                : 'border-zinc-700 bg-zinc-800 text-zinc-500'
            }`}
          >
            <Zap className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-sm font-bold text-slate-100">Oleada de Acción</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  !fighterData.actionSurgeUsed
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {!fighterData.actionSurgeUsed ? 'ENCENDIDO' : 'APAGADO'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Gana <strong className="text-blue-200">1 Acción adicional</strong> en tu turno inmediatamente
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
