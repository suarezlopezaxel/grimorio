import React, { useState } from 'react';
import { X, Dices, RotateCcw, Sparkles, History, Volume2 } from 'lucide-react';

interface DiceRollResult {
  id: string;
  die: string;
  count: number;
  modifier: number;
  mode: 'normal' | 'advantage' | 'disadvantage';
  rolls: number[];
  rollsSecond?: number[];
  finalResult: number;
  timestamp: string;
  isCrit?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  presetFormula?: string | null;
}

export const DiceTrayModal: React.FC<Props> = ({ isOpen, onClose, presetFormula }) => {
  const [selectedDie, setSelectedDie] = useState<number>(20);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [rollMode, setRollMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const [history, setHistory] = useState<DiceRollResult[]>([]);
  const [latestRoll, setLatestRoll] = useState<DiceRollResult | null>(null);
  const [rollingAnimation, setRollingAnimation] = useState<boolean>(false);

  if (!isOpen) return null;

  const rollDice = () => {
    setRollingAnimation(true);

    setTimeout(() => {
      const rolls: number[] = [];
      for (let i = 0; i < diceCount; i++) {
        rolls.push(Math.floor(Math.random() * selectedDie) + 1);
      }

      let rollsSecond: number[] | undefined;
      let chosenSum = rolls.reduce((a, b) => a + b, 0);

      if (selectedDie === 20 && rollMode !== 'normal') {
        const roll2 = Math.floor(Math.random() * 20) + 1;
        rollsSecond = [roll2];
        if (rollMode === 'advantage') {
          chosenSum = Math.max(rolls[0], roll2);
        } else {
          chosenSum = Math.min(rolls[0], roll2);
        }
      }

      const finalResult = chosenSum + modifier;
      const isCrit = selectedDie === 20 && (rolls[0] === 20 || (rollsSecond && rollsSecond[0] === 20));

      const newResult: DiceRollResult = {
        id: Date.now().toString(),
        die: `d${selectedDie}`,
        count: diceCount,
        modifier,
        mode: rollMode,
        rolls,
        rollsSecond,
        finalResult,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isCrit,
      };

      setLatestRoll(newResult);
      setHistory((prev) => [newResult, ...prev.slice(0, 15)]);
      setRollingAnimation(false);
    }, 300);
  };

  const standardDice = [4, 6, 8, 10, 12, 20, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#121626] via-[#0d101c] to-[#181d30] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Dices className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-base font-bold text-zinc-100">Bandeja de Dados Arcanos</h2>
              <p className="text-[11px] text-zinc-400">Tiradas D&D 5e con ventaja y modificadores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dice Selection Grid */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-zinc-300 block mb-2 font-cinzel">
            Elige el dado:
          </label>
          <div className="grid grid-cols-7 gap-2">
            {standardDice.map((d) => {
              const isSelected = selectedDie === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDie(d)}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'border-zinc-800 bg-[#161a29] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-sm">🎲</span>
                  <span>d{d}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modifiers & Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Quantity */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Cantidad:</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                className="w-8 h-8 rounded border border-zinc-700 bg-zinc-800 font-bold text-zinc-300"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="20"
                value={diceCount}
                onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center py-1 rounded border border-zinc-700 bg-zinc-900 text-xs font-bold text-white font-mono"
              />
              <button
                onClick={() => setDiceCount(Math.min(20, diceCount + 1))}
                className="w-8 h-8 rounded border border-zinc-700 bg-zinc-800 font-bold text-zinc-300"
              >
                +
              </button>
            </div>
          </div>

          {/* Modifier */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Modificador:</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setModifier(modifier - 1)}
                className="w-8 h-8 rounded border border-zinc-700 bg-zinc-800 font-bold text-zinc-300"
              >
                -
              </button>
              <input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                className="w-full text-center py-1 rounded border border-zinc-700 bg-zinc-900 text-xs font-bold text-white font-mono"
              />
              <button
                onClick={() => setModifier(modifier + 1)}
                className="w-8 h-8 rounded border border-zinc-700 bg-zinc-800 font-bold text-zinc-300"
              >
                +
              </button>
            </div>
          </div>

          {/* Advantage / Disadvantage (d20) */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Modo d20:</label>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setRollMode('normal')}
                className={`py-1 rounded text-[10px] font-bold ${
                  rollMode === 'normal' ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-500'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setRollMode('advantage')}
                className={`py-1 rounded text-[10px] font-bold ${
                  rollMode === 'advantage' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-zinc-500'
                }`}
              >
                Ventaja
              </button>
              <button
                onClick={() => setRollMode('disadvantage')}
                className={`py-1 rounded text-[10px] font-bold ${
                  rollMode === 'disadvantage' ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-500'
                }`}
              >
                Desventaja
              </button>
            </div>
          </div>
        </div>

        {/* Roll Action Button */}
        <button
          onClick={rollDice}
          disabled={rollingAnimation}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 font-cinzel font-bold text-stone-950 text-sm tracking-wider uppercase shadow-lg hover:brightness-110 active:scale-[0.99] transition cursor-pointer"
        >
          {rollingAnimation ? 'Lanzando los dados...' : `¡Lanzar ${diceCount}d${selectedDie} ${modifier >= 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`}!`}
        </button>

        {/* Latest Result Banner */}
        {latestRoll && (
          <div className="my-4 rounded-xl border border-emerald-500/40 bg-[#0e1620] p-4 text-center shadow-inner">
            <div className="text-[11px] text-zinc-400 mb-1">
              Resultado de {latestRoll.count}{latestRoll.die} {latestRoll.modifier !== 0 && `(${latestRoll.modifier >= 0 ? '+' : ''}${latestRoll.modifier})`}
              {latestRoll.mode !== 'normal' && ` • ${latestRoll.mode === 'advantage' ? 'Con Ventaja' : 'Con Desventaja'}`}
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className={`font-cinzel text-4xl font-extrabold ${latestRoll.isCrit ? 'text-amber-300 animate-bounce' : 'text-emerald-300'}`}>
                {latestRoll.finalResult}
              </span>
              {latestRoll.isCrit && (
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/40">
                  ¡CRÍTICO NATURAL!
                </span>
              )}
            </div>

            <div className="text-xs text-zinc-400 mt-2 font-mono">
              Dados: [{latestRoll.rolls.join(', ')}]
              {latestRoll.rollsSecond && ` vs [${latestRoll.rollsSecond.join(', ')}]`}
              {latestRoll.modifier !== 0 && ` + (${latestRoll.modifier})`}
            </div>
          </div>
        )}

        {/* Roll History */}
        {history.length > 0 && (
          <div className="mt-3 border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 font-cinzel">
              <History className="h-3.5 w-3.5" />
              <span>Historial de Tiradas Recientes:</span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-zinc-900/60 border border-zinc-800/60">
                  <span className="font-mono text-zinc-300">
                    {h.count}{h.die} {h.modifier !== 0 && `(${h.modifier >= 0 ? '+' : ''}${h.modifier})`}
                  </span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{h.finalResult}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{h.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
