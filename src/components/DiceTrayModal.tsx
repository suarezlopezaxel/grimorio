import React from 'react';
import { DiceRollResult } from '../types';

interface DiceTrayProps {
  latestRoll: DiceRollResult | null;
  isOpen: boolean;
  onClose: () => void;
  rollHistory: DiceRollResult[];
  onRollDice: (
    label: string,
    modifier: number,
    subtext?: string,
    sides?: number,
    count?: number,
    advantageMode?: 'normal' | 'advantage' | 'disadvantage'
  ) => void;
}

export const DiceTrayModal: React.FC<DiceTrayProps> = ({
  latestRoll,
  isOpen,
  onClose,
  rollHistory,
  onRollDice,
}) => {
  const [showHistory, setShowHistory] = React.useState(false);
  const [modifier, setModifier] = React.useState(0);
  const [mode, setMode] = React.useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const dice = [4, 6, 8, 10, 12, 20, 100];

  if (!isOpen && !latestRoll) return null;

  return (
    <div
      id="dice-tray-container"
      className={`fixed bottom-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform ${
        isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-[#0f0d16]/95 border border-[#36333e] backdrop-blur-xl p-3.5 rounded-xl shadow-2xl flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[var(--theme-primary,#fbbf24)]">casino</span>
            <span className="font-runic text-xs font-bold uppercase tracking-wider text-[var(--theme-primary,#fbbf24)]">
              {latestRoll?.title || 'Tirada Arcana'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-xs flex items-center gap-0.5"
              title="Historial de tiradas"
            >
              <span className="material-symbols-outlined text-xs">history</span>
              <span className="text-[10px]">{rollHistory.length}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Cerrar bandeja"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        {/* Current Result */}
        {latestRoll && (
          <div className="flex items-center justify-between bg-[#1c1a24] p-3 rounded-lg border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs text-gray-300 font-mono">
                {latestRoll.diceCount || 1}d{latestRoll.diceSides || 20} ({latestRoll.d20}) {latestRoll.modifier >= 0 ? `+ ${latestRoll.modifier}` : `- ${Math.abs(latestRoll.modifier)}`}
              </span>
              <span className="text-[11px] font-medium tracking-wide">
                {latestRoll.isNat20 ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">flare</span> ¡CRÍTICO NATURAL (20)!
                  </span>
                ) : latestRoll.isNat1 ? (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">skull</span> PIFIA CRÍTICA (1)
                  </span>
                ) : (
                  <span className="text-[var(--theme-secondary,#d0bcff)]">
                    {latestRoll.subtext || 'Resultado final'}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`font-garamond text-3xl font-bold leading-none ${
                  latestRoll.isNat20
                    ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : latestRoll.isNat1
                    ? 'text-red-400'
                    : 'text-[var(--theme-primary,#fbbf24)]'
                }`}
              >
                {latestRoll.total}
              </span>
            </div>
          </div>
        )}

        <div className="border-t border-white/10 pt-2">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {dice.map((sides) => (
              <button
                key={sides}
                onClick={() => onRollDice(`Tirada d${sides}`, modifier, `${mode === 'normal' ? 'Normal' : mode === 'advantage' ? 'Ventaja' : 'Desventaja'}`, sides, 1, mode)}
                className="px-2.5 py-1 rounded bg-[#211e28] hover:bg-[var(--theme-primary,#fbbf24)] hover:text-[#261a00] text-xs font-bold border border-white/5"
              >
                d{sides}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-gray-400 uppercase font-bold" htmlFor="dice-modifier">Mod</label>
            <select
              id="dice-modifier"
              value={modifier}
              onChange={(event) => setModifier(Number(event.target.value))}
              className="bg-[#211e28] text-xs text-white rounded border border-white/10 px-1.5 py-1"
            >
              {Array.from({ length: 16 }, (_, index) => index - 5).map((value) => (
                <option key={value} value={value}>{value >= 0 ? `+${value}` : value}</option>
              ))}
            </select>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as typeof mode)}
              className="bg-[#211e28] text-xs text-white rounded border border-white/10 px-1.5 py-1"
              aria-label="Modo de tirada"
            >
              <option value="normal">Normal</option>
              <option value="advantage">Ventaja</option>
              <option value="disadvantage">Desventaja</option>
            </select>
          </div>
        </div>

        {/* History drawer if expanded */}
        {showHistory && rollHistory.length > 0 && (
          <div className="mt-1 pt-2 border-t border-gray-800/80 max-h-36 overflow-y-auto space-y-1 pr-1 text-xs">
            <div className="text-[10px] uppercase font-runic text-gray-400 tracking-wider">Últimas tiradas:</div>
            {rollHistory.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-gray-300 py-0.5 border-b border-gray-800/40">
                <span className="truncate max-w-[170px]">{r.title}</span>
                <span className="font-mono text-amber-400 font-semibold">{r.total} (d{r.diceSides || 20}: {r.d20})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
