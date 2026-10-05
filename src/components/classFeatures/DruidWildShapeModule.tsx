import React, { useState } from 'react';
import { PawPrint, Shield, Heart, Zap, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { CharacterSheet, BeastForm } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
}

const BEAST_PRESETS: BeastForm[] = [
  {
    name: 'Oso Pardo',
    cr: 'CR 1',
    hp: 34,
    ac: 11,
    speed: '40 pies, trepar 30 pies',
    attacks: 'Mordisco (+5, 1d8+4 perf) y Garras (+5, 2d6+4 cort)',
    senses: 'Olfato agudo (ventaja en percepción de olor)',
  },
  {
    name: 'Lobo Huargo (Dire Wolf)',
    cr: 'CR 1',
    hp: 37,
    ac: 14,
    speed: '50 pies',
    attacks: 'Mordisco (+5, 2d6+3 perf, derribo CD 13 FUE)',
    senses: 'Oído y olfato agudo, Tácticas de Manada',
  },
  {
    name: 'Águila Gigante',
    cr: 'CR 1',
    hp: 26,
    ac: 13,
    speed: '10 pies, volar 80 pies',
    attacks: 'Pico (+5, 1d6+3 perf) y Talones (+5, 2d6+3 cort)',
    senses: 'Vista aguda (ventaja en percepción)',
  },
  {
    name: 'Pantera de Sombras',
    cr: 'CR 1/4',
    hp: 18,
    ac: 12,
    speed: '50 pies, trepar 40 pies',
    attacks: 'Garras (+4, 1d4+2) y Mordisco (+4, 1d6+2)',
    senses: 'Visión en la oscuridad 60 ft, Abalanzarse',
  },
];

export const DruidWildShapeModule: React.FC<Props> = ({ character, onUpdate }) => {
  const druidData = character.classResources.druid || {
    wildShapeCurrent: 2,
    wildShapeMax: 2,
    activeForm: null,
  };

  const [selectedBeast, setSelectedBeast] = useState<BeastForm>(BEAST_PRESETS[0]);

  const toggleForm = (beast: BeastForm) => {
    if (druidData.activeForm?.name === beast.name) {
      // Revert to normal form
      onUpdate({
        ...character,
        classResources: {
          ...character.classResources,
          druid: {
            ...druidData,
            activeForm: null,
          },
        },
      });
    } else {
      // Consume 1 wild shape use if not already transformed
      const newUses = druidData.activeForm ? druidData.wildShapeCurrent : Math.max(0, druidData.wildShapeCurrent - 1);
      onUpdate({
        ...character,
        classResources: {
          ...character.classResources,
          druid: {
            ...druidData,
            wildShapeCurrent: newUses,
            activeForm: beast,
          },
        },
      });
    }
  };

  const restoreWildShape = () => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        druid: {
          ...druidData,
          wildShapeCurrent: druidData.wildShapeMax,
        },
      },
    });
  };

  // Toggle a spell slot from blooming bud to wilted twig
  const toggleSpellSlot = (slotLevel: number, index: number) => {
    const slots = [...character.spellSlots];
    const target = slots.find((s) => s.level === slotLevel);
    if (!target) return;

    if (index < target.used) {
      // restore
      target.used -= 1;
    } else {
      // spend
      target.used += 1;
    }

    onUpdate({
      ...character,
      spellSlots: slots,
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-br from-[#122616]/90 via-[#0d1c10]/95 to-[#1a331f]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Woodgrain & Vine Frame Accents */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 w-32 h-32 opacity-15 text-emerald-400">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M10,90 Q40,40 90,20 Q60,70 10,90 Z" />
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/50 bg-emerald-500/10 text-emerald-300 shadow-inner">
            <PawPrint className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-emerald-200 tracking-wide">
                Forma Salvaje (Círculo de la Luna)
              </h3>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40">
                {druidData.wildShapeCurrent} / {druidData.wildShapeMax} Usos
              </span>
            </div>
            <p className="text-xs text-emerald-200/70">
              {druidData.activeForm
                ? `Forma activa: ${druidData.activeForm.name} (Ganas sus PG y sentidos)`
                : 'Selecciona una bestia en tarjeta de tronco para metamorfosearte'}
            </p>
          </div>
        </div>

        <button
          onClick={restoreWildShape}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400 transition"
          title="Recuperar en descanso corto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Comunión Arbórea (Recargar)</span>
        </button>
      </div>

      {/* Beast Selector on Tree Trunk Cut Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        {BEAST_PRESETS.map((beast) => {
          const isActive = druidData.activeForm?.name === beast.name;
          const isSelected = selectedBeast.name === beast.name;

          return (
            <div
              key={beast.name}
              onClick={() => setSelectedBeast(beast)}
              className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-200 ${
                isActive
                  ? 'border-amber-400 bg-gradient-to-b from-[#3a2c16] via-[#241a0d] to-[#3a2c16] shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.02]'
                  : isSelected
                  ? 'border-emerald-400 bg-gradient-to-b from-[#1b3320] to-[#122215]'
                  : 'border-emerald-900/60 bg-gradient-to-b from-[#142618]/70 to-[#0e1c11]/80 hover:border-emerald-600/70'
              }`}
              style={{
                backgroundImage: `radial-gradient(ellipse at center, rgba(62,39,35,0.3) 0%, rgba(20,36,22,0.8) 100%)`,
              }}
            >
              {/* Tree trunk concentric rings subtle overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-xl border border-amber-900/20" />

              <div className="flex items-center justify-between mb-1.5">
                <span className="font-cinzel text-xs font-bold text-amber-200">{beast.name}</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {beast.cr}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs mb-2">
                <div className="flex items-center gap-1 text-emerald-300">
                  <Heart className="h-3 w-3 text-red-400" />
                  <span className="font-bold">{beast.hp} PG</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-300">
                  <Shield className="h-3 w-3 text-blue-400" />
                  <span>{beast.ac} CA</span>
                </div>
              </div>

              <div className="text-[10px] text-emerald-200/70 mb-2 line-clamp-2">{beast.attacks}</div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleForm(beast);
                }}
                disabled={!isActive && druidData.wildShapeCurrent <= 0}
                className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold tracking-wide transition flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-md'
                    : druidData.wildShapeCurrent > 0
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isActive ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> En Forma (Revertir)
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" /> Metamorfosear
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Botanical Blooming Spell Slots */}
      <div className="mt-4 rounded-xl border border-emerald-500/30 bg-[#0c180e]/90 p-4 shadow-inner">
        <div className="flex items-center justify-between text-xs text-emerald-300 mb-3">
          <span className="flex items-center gap-1.5 font-cinzel font-semibold">
            🌱 Espacios de Conjuro Primordiales (Brotes Florales):
          </span>
          <span className="text-[11px] text-emerald-200/60 italic">
            Florecen al estar disponibles y se marchitan al gastarse
          </span>
        </div>

        <div className="space-y-2">
          {character.spellSlots.slice(0, 3).map((slot) => {
            if (slot.max === 0) return null;
            return (
              <div key={slot.level} className="flex items-center justify-between bg-emerald-950/30 rounded-lg px-3 py-1.5 border border-emerald-800/40">
                <span className="text-xs font-semibold text-emerald-200">
                  Nivel {slot.level} ({slot.max - slot.used} / {slot.max})
                </span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: slot.max }).map((_, i) => {
                    const isAvailable = i >= slot.used;
                    return (
                      <button
                        key={i}
                        onClick={() => toggleSpellSlot(slot.level, i)}
                        className={`group relative flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${
                          isAvailable
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 hover:scale-110 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                            : 'border-amber-900/60 bg-stone-900/80 text-amber-800/50 hover:border-amber-700'
                        }`}
                        title={isAvailable ? 'Espacio disponible (Florecido)' : 'Espacio marchito (Gastado)'}
                      >
                        <span className="text-sm select-none transition-transform group-hover:rotate-12">
                          {isAvailable ? '🌸' : '🍂'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
