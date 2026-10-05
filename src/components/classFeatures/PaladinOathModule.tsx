import React, { useState } from 'react';
import { Shield, Sparkles, HeartHandshake, RotateCcw } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onTriggerAuraPulse?: () => void;
}

export const PaladinOathModule: React.FC<Props> = ({ character, onUpdate, onTriggerAuraPulse }) => {
  const paladinData = character.classResources.paladin || {
    layOnHandsCurrent: character.level * 5,
    layOnHandsMax: character.level * 5,
    oath: 'Juramento de Devoción',
    auraActive: true,
  };

  const [healAmount, setHealAmount] = useState<number>(5);

  const applyLayOnHands = () => {
    const amount = Math.min(healAmount, paladinData.layOnHandsCurrent);
    if (amount <= 0) return;

    if (onTriggerAuraPulse) {
      onTriggerAuraPulse();
    }

    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        paladin: {
          ...paladinData,
          layOnHandsCurrent: paladinData.layOnHandsCurrent - amount,
        },
      },
    });
  };

  const restorePool = () => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        paladin: {
          ...paladinData,
          layOnHandsCurrent: paladinData.layOnHandsMax,
        },
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-sky-400/40 bg-gradient-to-br from-[#121c29]/90 via-[#0d1520]/95 to-[#1a2738]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Winged Holy Shield Watermark */}
      <div className="pointer-events-none absolute right-2 -bottom-4 text-sky-400/10 text-8xl select-none">
        🛡️
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-300/50 bg-sky-500/20 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-sky-100 tracking-wide">
                Imposición de Manos & {paladinData.oath}
              </h3>
              <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-semibold text-sky-200 border border-sky-500/30">
                {paladinData.layOnHandsCurrent} / {paladinData.layOnHandsMax} PG en Reserva
              </span>
            </div>
            <p className="text-xs text-sky-200/70">
              Aura de Protección activa • Purifica 1 enfermedad o veneno gastando 5 PG
            </p>
          </div>
        </div>

        <button
          onClick={restorePool}
          className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-950/40 px-3 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-900/50 hover:border-sky-400 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Renovar Voto (Descanso Largo)</span>
        </button>
      </div>

      {/* Reservoir Progress Gauge */}
      <div className="my-3 rounded-xl border border-sky-500/30 bg-[#0a121c]/80 p-4 shadow-inner">
        <div className="flex items-center justify-between text-xs text-sky-200 mb-2">
          <span>Reserva Sagrada de Curación:</span>
          <span className="font-bold font-mono text-sky-300">
            {Math.round((paladinData.layOnHandsCurrent / paladinData.layOnHandsMax) * 100)}%
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-sky-950/60 overflow-hidden border border-sky-800/40 mb-4">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-amber-300 to-sky-300 transition-all duration-300 shadow-[0_0_10px_#38bdf8]"
            style={{ width: `${(paladinData.layOnHandsCurrent / paladinData.layOnHandsMax) * 100}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-sky-200">Gastar:</span>
            <input
              type="number"
              min="1"
              max={paladinData.layOnHandsCurrent}
              value={healAmount}
              onChange={(e) => setHealAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 rounded border border-sky-500/40 bg-sky-950/60 px-2 py-1 text-center text-xs font-bold text-sky-100"
            />
            <span className="text-xs text-sky-300/80">PG</span>
          </div>

          <button
            onClick={applyLayOnHands}
            disabled={paladinData.layOnHandsCurrent <= 0}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold font-cinzel tracking-wider uppercase transition ${
              paladinData.layOnHandsCurrent > 0
                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-stone-950 hover:brightness-110 shadow-md cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Canalizar Curación Bendita (Expandir Aura)
          </button>
        </div>
      </div>
    </div>
  );
};
