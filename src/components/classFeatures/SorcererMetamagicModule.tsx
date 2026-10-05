import React, { useState } from 'react';
import { Sparkles, Zap, Flame, RotateCcw, Dices } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onTriggerWildSurge?: (result: string) => void;
}

const WILD_SURGE_TABLE = [
  '¡Chispas de arcoíris estallan! Todos los proyectiles brillan con luz de hadas.',
  'Tu piel se vuelve de bronce pulido durante 1 minuto (+1 a la CA).',
  'Lanzas una ráfaga de plumas que ciega brevemente a criaturas a 5 pies.',
  'Puedes teletransportarte hasta 20 pies como acción adicional el próximo turno.',
  'Recuperas tu espacio de conjuro de menor nivel gastado.',
  'Una lluvia de pétalos de orquídea aromáticos cae en un radio de 30 pies.',
];

export const SorcererMetamagicModule: React.FC<Props> = ({ character, onUpdate, onTriggerWildSurge }) => {
  const sorcData = character.classResources.sorcerer || {
    sorceryPointsCurrent: character.level,
    sorceryPointsMax: character.level,
    activeMetamagic: ['Conjuro Acelerado', 'Conjuro Duplicado'],
    wildMagicCount: 0,
  };

  const [lastSurge, setLastSurge] = useState<string | null>(null);

  const togglePoint = (index: number) => {
    const nextCurrent = index < sorcData.sorceryPointsCurrent ? index : index + 1;
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        sorcerer: {
          ...sorcData,
          sorceryPointsCurrent: nextCurrent,
        },
      },
    });
  };

  const restorePoints = () => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        sorcerer: {
          ...sorcData,
          sorceryPointsCurrent: sorcData.sorceryPointsMax,
        },
      },
    });
  };

  const triggerWildMagic = () => {
    const roll = Math.floor(Math.random() * WILD_SURGE_TABLE.length);
    const effect = WILD_SURGE_TABLE[roll];
    setLastSurge(effect);
    if (onTriggerWildSurge) {
      onTriggerWildSurge(effect);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-pink-500/40 bg-gradient-to-br from-[#240e1f]/90 via-[#140812]/95 to-[#2e1227]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Energy Veins */}
      <div className="pointer-events-none absolute inset-0 border-2 border-pink-500/10" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-pink-400/50 bg-pink-500/20 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.4)]">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-pink-100 tracking-wide">
                Puntos de Hechicería & Linaje Primordial
              </h3>
              <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-xs font-semibold text-pink-200 border border-pink-500/30">
                {sorcData.sorceryPointsCurrent} / {sorcData.sorceryPointsMax} Puntos
              </span>
            </div>
            <p className="text-xs text-pink-200/70">
              Canaliza orbes de maná para alterar conjuros con Metamagia o regenerar espacios
            </p>
          </div>
        </div>

        <button
          onClick={restorePoints}
          className="flex items-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-950/40 px-3 py-1.5 text-xs font-medium text-pink-200 hover:bg-pink-900/50 hover:border-pink-400 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restaurar Orbes</span>
        </button>
      </div>

      {/* Floating Glowing Mana Orbs */}
      <div className="my-3 rounded-xl border border-pink-500/30 bg-[#160714]/80 p-4 shadow-inner">
        <span className="text-xs font-cinzel font-semibold text-pink-300 block mb-3">
          Orbes de Energía Vital Crepitante:
        </span>

        <div className="flex flex-wrap items-center gap-3">
          {Array.from({ length: sorcData.sorceryPointsMax }).map((_, i) => {
            const isFilled = i < sorcData.sorceryPointsCurrent;
            return (
              <button
                key={i}
                onClick={() => togglePoint(i)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 cursor-pointer ${
                  isFilled
                    ? 'border-pink-400 bg-gradient-to-tr from-pink-600 via-fuchsia-500 to-amber-300 shadow-[0_0_15px_rgba(236,72,153,0.8)] scale-105'
                    : 'border-zinc-800 bg-stone-900/50 opacity-30 hover:opacity-60'
                }`}
                title={isFilled ? 'Punto disponible (Haz clic para gastar)' : 'Punto gastado'}
              >
                {isFilled && <span className="text-xs font-bold text-white drop-shadow">⚡</span>}
              </button>
            );
          })}
        </div>

        {/* Wild Magic Surge trigger */}
        <div className="mt-4 pt-3 border-t border-pink-500/20 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={triggerWildMagic}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 px-3.5 py-1.5 text-xs font-bold font-cinzel text-white hover:brightness-110 shadow-md cursor-pointer"
          >
            <Dices className="h-4 w-4" />
            Tirar Sobrecarga de Magia Salvaje (d20)
          </button>

          {lastSurge && (
            <span className="text-xs text-pink-200 italic font-serif max-w-md animate-fade-in">
              ✨ {lastSurge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
