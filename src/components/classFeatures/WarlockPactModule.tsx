import React from 'react';
import { Eye, Flame, Sparkles, RotateCcw, Skull } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
}

export const WarlockPactModule: React.FC<Props> = ({ character, onUpdate }) => {
  const warlockData = character.classResources.warlock || {
    pactSlotsCurrent: 2,
    pactSlotsMax: 2,
    pactSlotLevel: 3,
    patron: 'infernal',
  };

  const toggleSlot = (index: number) => {
    const nextCurrent = index < warlockData.pactSlotsCurrent ? index : index + 1;
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        warlock: {
          ...warlockData,
          pactSlotsCurrent: nextCurrent,
        },
      },
    });
  };

  const restorePactSlots = () => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        warlock: {
          ...warlockData,
          pactSlotsCurrent: warlockData.pactSlotsMax,
        },
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-br from-[#0e1a14]/90 via-[#07110c]/95 to-[#16271e]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Creeping Eldritch Tentacles / Eye Watermark */}
      <div className="pointer-events-none absolute right-2 -bottom-2 text-emerald-400/10 text-8xl select-none">
        👁️
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/50 bg-emerald-500/20 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-emerald-100 tracking-wide">
                Magia del Pacto Profano (Nivel {warlockData.pactSlotLevel})
              </h3>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-200 border border-emerald-500/30">
                {warlockData.pactSlotsCurrent} / {warlockData.pactSlotsMax} Espacios
              </span>
            </div>
            <p className="text-xs text-emerald-200/70">
              Patrón: <strong className="capitalize text-emerald-300">{warlockData.patron}</strong> • Se recargan totalmente con Descanso Corto
            </p>
          </div>
        </div>

        <button
          onClick={restorePactSlots}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-900/50 hover:border-emerald-400 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Comunión del Pacto (Descanso Corto)</span>
        </button>
      </div>

      {/* Eldritch Pact Slots */}
      <div className="my-3 rounded-xl border border-emerald-600/30 bg-[#09140e]/90 p-4 shadow-inner flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-cinzel font-semibold text-emerald-300">
            Sigilos Ocultos Activos:
          </span>
          <div className="flex items-center gap-3">
            {Array.from({ length: warlockData.pactSlotsMax }).map((_, i) => {
              const isAvailable = i < warlockData.pactSlotsCurrent;
              return (
                <button
                  key={i}
                  onClick={() => toggleSlot(i)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition cursor-pointer ${
                    isAvailable
                      ? 'border-emerald-400 bg-emerald-500/30 text-emerald-200 shadow-[0_0_12px_#10b981]'
                      : 'border-zinc-800 bg-stone-950/70 text-zinc-600'
                  }`}
                  title={isAvailable ? 'Espacio listo' : 'Espacio consumido'}
                >
                  <Skull className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        <span className="text-xs text-emerald-300/80 italic font-serif">
          Todos los conjuros de brujo se lanzan automáticamente a su nivel máximo ({warlockData.pactSlotLevel})
        </span>
      </div>
    </div>
  );
};
