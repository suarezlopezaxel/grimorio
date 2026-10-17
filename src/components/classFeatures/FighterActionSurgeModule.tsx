import React from 'react';
import { Shield, Swords, RotateCcw, Heart, Zap, Sparkles } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onRollDiceFormula?: (formula: string, onResult: (result: number) => void) => void;
}

export const FighterActionSurgeModule: React.FC<Props> = ({ character, onUpdate, onRollDiceFormula }) => {
  const fighterData = character.classResources.fighter || {
    secondWindUsesCurrent: 0,
    secondWindUsesMax: 0,
    actionSurgeUsed: false,
  };

  const calcSecondWindMax = (level: number) => {
    if (level >= 10) return 4;
    if (level >= 4) return 3;
    return 2;
  };

  const calcActionSurgeMax = (level: number) => {
    if (level >= 17) return 2;
    return 1;
  };

  const actionSurgeMax = calcActionSurgeMax(character.level);
  const actionSurgeCurrent = typeof fighterData.actionSurgeCurrent === 'number'
    ? fighterData.actionSurgeCurrent
    : (fighterData.actionSurgeUsed ? 0 : actionSurgeMax);

  const useSecondWind = () => {
    // DEBUG: verificar decremento de cargas
    console.log('[SecondWind] BEFORE', {
      secondWindUsesCurrent: fighterData.secondWindUsesCurrent,
      secondWindUsesMax: fighterData.secondWindUsesMax,
    });
    const nextUsesCurrent = Math.max(0, (fighterData.secondWindUsesCurrent ?? 0) - 1);
    console.log('[SecondWind] nextUsesCurrent', nextUsesCurrent);
    // eslint-disable-next-line no-console
    console.log('[SecondWind] SAVING fighter', {
      prev: fighterData.secondWindUsesCurrent,
      next: nextUsesCurrent,
    });
    if ((fighterData.secondWindUsesCurrent ?? 0) <= 0) return;

    // Descontamos UNA carga inmediatamente (D&D 2024: se consume una vez usado).
    // Nota: el heal llega async (modal). Guardamos también el decremento dentro del callback
    // para evitar que un state stale lo vuelva a dejar en el valor anterior.
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        fighter: {
          ...fighterData,
          secondWindUsesCurrent: nextUsesCurrent,
        },
      },
    });

    // D&D 2024: regain hit points = 1d10 + fighter level.
    // DiceTrayModal ya calculará el finalResult y lo entregará por callback.
    onRollDiceFormula?.(`1d10 + ${character.level}`, (finalResult) => {
      // IMPORTANTE: usar el valor actual del recurso. Si usamos el `character` del closure,
      // podemos re-escribir fighter.secondWindUsesCurrent/Max con un valor viejo.
      onUpdate({
        ...character,
        classResources: {
          ...character.classResources,
          fighter: {
            ...(character.classResources.fighter ?? {
              secondWindUsesCurrent: 0,
              secondWindUsesMax: 0,
              actionSurgeUsed: false,
            }),
            secondWindUsesCurrent: nextUsesCurrent,
          },
        },
        hitPoints: {
          ...character.hitPoints,
          current: Math.min(character.hitPoints.max, character.hitPoints.current + finalResult),
        },
      });
    });
  };

  const useActionSurge = () => {
    const current = typeof fighterData.actionSurgeCurrent === 'number'
      ? fighterData.actionSurgeCurrent
      : (fighterData.actionSurgeUsed ? 0 : actionSurgeMax);
    if (current <= 0) return;
    const nextCurrent = Math.max(0, current - 1);
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        fighter: {
          ...fighterData,
          actionSurgeCurrent: nextCurrent,
          actionSurgeUsed: nextCurrent === 0,
        },
      },
    });
  };

  const restoreMartialEmblems = () => {
    const fighter = character.classResources.fighter ?? {
      secondWindUsesCurrent: 0,
      secondWindUsesMax: 0,
      actionSurgeUsed: false,
    };
    const secondWindMax = calcSecondWindMax(character.level);
    const actionMax = calcActionSurgeMax(character.level);

    // D&D 2024: Un descanso corto devuelve 1 uso de segundo aliento y todos los de action surge.
    // Un descanso largo devuelve todos. Aquí al hacer clic en el botón de descanso podemos recargar 1 uso o todos según convenga, 
    // pero para cumplir con "Un descanso corto devuelve 1 uso de segundo aliento", sumamos 1 sin superar el máximo.
    const currentSecondWind = fighter.secondWindUsesCurrent ?? 0;
    const restoredSecondWind = Math.min(secondWindMax, currentSecondWind + 1);

    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        fighter: {
          ...fighter,
          secondWindUsesMax: secondWindMax,
          secondWindUsesCurrent: restoredSecondWind,
          actionSurgeMax: actionMax,
          actionSurgeCurrent: actionMax,
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
          disabled={!(fighterData.secondWindUsesCurrent > 0)}
          className={`group relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-300 ${
            !(fighterData.secondWindUsesCurrent > 0)
              ? 'border-zinc-800 bg-zinc-900/60 opacity-40 cursor-not-allowed filter grayscale'
              : 'border-amber-500/70 bg-gradient-to-r from-[#2a1c12] via-[#3d2919] to-[#2a1c12] shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:border-amber-400 hover:scale-[1.01] cursor-pointer'
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
              !(fighterData.secondWindUsesCurrent > 0)
                ? 'border-zinc-700 bg-zinc-800 text-zinc-500'
                : 'border-amber-400 bg-amber-500/30 text-amber-200 shadow-[0_0_12px_#f59e0b]'
            }`}
          >
            <Heart className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-sm font-bold text-slate-100">Segundo Aliento</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  fighterData.secondWindUsesCurrent > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {fighterData.secondWindUsesCurrent} / {calcSecondWindMax(character.level)} Disponibles
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Recupera <strong className="text-amber-200">1d10 + {character.level} PG</strong> (1 uso por descanso corto)
            </p>
          </div>
        </button>

        {/* Action Surge */}
        <button
          onClick={useActionSurge}
          disabled={actionSurgeCurrent <= 0}
          className={`group relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-300 ${
            actionSurgeCurrent > 0
              ? 'border-blue-400/70 bg-gradient-to-r from-[#142338] via-[#1d3557] to-[#142338] shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:border-blue-300 hover:scale-[1.01] cursor-pointer'
              : 'border-zinc-800 bg-zinc-900/60 opacity-40 cursor-not-allowed filter grayscale'
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
              actionSurgeCurrent > 0
                ? 'border-blue-400 bg-blue-500/30 text-blue-200 shadow-[0_0_12px_#38bdf8]'
                : 'border-zinc-700 bg-zinc-800 text-zinc-500'
            }`}
          >
            <Zap className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-sm font-bold text-slate-100">Action Surge</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  actionSurgeCurrent > 0
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {actionSurgeCurrent} / {actionSurgeMax} Disponibles
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Gana <strong className="text-blue-200">1 Acción adicional</strong> (solo una por turno)
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
