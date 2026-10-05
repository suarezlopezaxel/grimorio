import React from 'react';
import { Wind, RotateCcw, Zap } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onEmitRipple?: (x: number, y: number) => void;
}

export const MonkKiModule: React.FC<Props> = ({ character, onUpdate, onEmitRipple }) => {
  const monkData = character.classResources.monk || {
    kiCurrent: character.level,
    kiMax: character.level,
  };

  const toggleKiPoint = (index: number, e: React.MouseEvent) => {
    if (onEmitRipple) {
      onEmitRipple(e.clientX, e.clientY);
    }
    const newCurrent = index < monkData.kiCurrent ? index : index + 1;
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        monk: {
          ...monkData,
          kiCurrent: newCurrent,
        },
      },
    });
  };

  const restoreKi = () => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        monk: {
          ...monkData,
          kiCurrent: monkData.kiMax,
        },
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-rose-600/40 bg-gradient-to-br from-[#1c1216]/90 via-[#100d11]/95 to-[#24141c]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Kanji Red Seal Watermark */}
      <div className="pointer-events-none absolute right-4 bottom-2 text-rose-500/20 text-6xl font-serif select-none">
        氣
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-950/40 text-rose-400 shadow-inner">
            <span className="text-xl">☯</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-rose-100 tracking-wide">
                Puntos de Ki (Círculos Ensō Zen)
              </h3>
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-300 border border-rose-500/30">
                {monkData.kiCurrent} / {monkData.kiMax} Ki Disponible
              </span>
            </div>
            <p className="text-xs text-rose-200/70">
              Puntos de energía mística canalizados para Ráfaga de Golpes, Defensa Paciente y Paso del Viento
            </p>
          </div>
        </div>

        <button
          onClick={restoreKi}
          className="flex items-center gap-1.5 rounded-lg border border-rose-600/30 bg-rose-950/40 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/50 hover:border-rose-400 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Meditación Breve (Recargar)</span>
        </button>
      </div>

      {/* Ensō Zen Circles Grid */}
      <div className="my-3 rounded-xl border border-rose-800/30 bg-[#120a0e]/80 p-4 shadow-inner">
        <span className="text-xs font-medium text-rose-300/80 block mb-3 font-cinzel">
          Canalización de Chi Espiritual:
        </span>

        <div className="flex flex-wrap items-center gap-3">
          {Array.from({ length: monkData.kiMax }).map((_, i) => {
            const isFilled = i < monkData.kiCurrent;
            return (
              <button
                key={i}
                onClick={(e) => toggleKiPoint(i, e)}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                  isFilled
                    ? 'scale-105 shadow-[0_0_15px_rgba(225,29,72,0.5)]'
                    : 'opacity-40 hover:opacity-75'
                }`}
                title={isFilled ? 'Ki disponible (Haz clic para gastar)' : 'Ki vacío (Haz clic para recargar)'}
              >
                {/* SVG Ensō Circle */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill={isFilled ? 'rgba(225, 29, 72, 0.25)' : 'none'}
                    stroke={isFilled ? '#e11d48' : '#71717a'}
                    strokeWidth={isFilled ? '7' : '3'}
                    strokeDasharray={isFilled ? '220, 30' : '180, 70'}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {isFilled && (
                    <circle
                      cx="50"
                      cy="50"
                      r="16"
                      fill="#f43f5e"
                      className="animate-pulse shadow-sm"
                    />
                  )}
                </svg>
                <span className="absolute text-[10px] font-bold text-white select-none">
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
