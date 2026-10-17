import React, { useState } from 'react';
import { X, Dices, RotateCcw, Sparkles, History, Volume2 } from 'lucide-react';

import { CharacterSheet, AbilityKey } from '../../types/character';
import { getEffectiveAbilityScore } from '../../lib/itemEffects';

interface DiceRollResult {
  id: string;
  die: string;
  count: number;
  modifier: number;
  selectedAbility?: AbilityKey | 'none' | 'custom';
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
  onRollComplete?: (result: number) => void;
  character?: CharacterSheet;
}

export const DiceTrayModal: React.FC<Props> = ({ isOpen, onClose, presetFormula, onRollComplete, character }) => {
  const [diceCounts, setDiceCounts] = useState<Record<number, number>>({
    4: 0,
    6: 0,
    8: 0,
    10: 0,
    12: 0,
    20: 1,
    100: 0,
  });
  const [selectedAbility, setSelectedAbility] = useState<AbilityKey | 'none' | 'custom'>('none');
  const [modifier, setModifier] = useState<number>(0);
  const [rollMode, setRollMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const [history, setHistory] = useState<DiceRollResult[]>([]);
  const [latestRoll, setLatestRoll] = useState<DiceRollResult | null>(null);
  const [rollingAnimation, setRollingAnimation] = useState<boolean>(false);

  // Ability keys mapping for D&D 5e
  const abilityList: { key: AbilityKey; label: string; short: string }[] = [
    { key: 'FUE', label: 'Fuerza', short: 'FUE' },
    { key: 'DES', label: 'Destreza', short: 'DES' },
    { key: 'CON', label: 'Constitución', short: 'CON' },
    { key: 'INT', label: 'Inteligencia', short: 'INT' },
    { key: 'SAB', label: 'Sabiduría', short: 'SAB' },
    { key: 'CAR', label: 'Carisma', short: 'CAR' },
  ];

  const getAbilityMod = (key: AbilityKey): number => {
    if (!character || !character.abilities || !character.abilities[key]) return 0;
    const baseScore = character.abilities[key].score;
    const effectiveScore = character.cards
      ? getEffectiveAbilityScore(character.cards, key, baseScore)
      : baseScore;
    return Math.floor((effectiveScore - 10) / 2);
  };

  React.useEffect(() => {
    if (presetFormula && isOpen) {
      const counts: Record<number, number> = { 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0, 100: 0 };
      // Soporta fórmulas tipo: 1d4+2d6+5d10+3d8 (y también espacios)
      // Captura el conteo (opcional) justo antes de 'd'.
      const diceMatches = [...presetFormula.matchAll(/(\d*)\s*d\s*(\d+)/gi)];
      if (diceMatches.length > 0) {
        for (const match of diceMatches) {
          const countStr = (match[1] ?? '').trim();
          const count = countStr ? parseInt(countStr, 10) : 1;
          const die = parseInt(match[2], 10);
          if (counts[die] !== undefined) {
            counts[die] += count;
          }
        }
      } else {
        counts[20] = 1;
      }
      setDiceCounts(counts);

      const modMatch = presetFormula.match(/([+-])\s*(\d+)(?!.*d)/);
      if (modMatch) {
        const sign = modMatch[1];
        const val = parseInt(modMatch[2], 10);
        setModifier(sign === '-' ? -val : val);
        setSelectedAbility('custom');
      } else {
        setModifier(0);
        setSelectedAbility('none');
      }
    } else if (isOpen && !presetFormula) {
      if (selectedAbility !== 'none' && selectedAbility !== 'custom') {
        setModifier(getAbilityMod(selectedAbility));
      }
    }
  }, [presetFormula, isOpen, character]);

  const handleAbilityChange = (value: string) => {
    if (value === 'none') {
      setSelectedAbility('none');
      setModifier(0);
    } else if (value === 'custom') {
      setSelectedAbility('custom');
    } else {
      const key = value as AbilityKey;
      setSelectedAbility(key);
      const mod = getAbilityMod(key);
      setModifier(mod);
    }
  };

  if (!isOpen) return null;

  const rollDice = () => {
    setRollingAnimation(true);

    window.setTimeout(() => {
      const allRolls: { die: number; rolls: number[] }[] = [];
      let totalSum = 0;
      let d20RollsSecond: number[] = [];

      standardDice.forEach((d) => {
        const count = diceCounts[d] || 0;
        if (count > 0) {
          const dieRolls: number[] = [];
          for (let i = 0; i < count; i++) {
            dieRolls.push(Math.floor(Math.random() * d) + 1);
          }
          const dieSum = dieRolls.reduce((a, b) => a + b, 0);
          totalSum += dieSum;
          allRolls.push({ die: d, rolls: dieRolls });

          if (d === 20 && rollMode !== 'normal') {
            const secondRolls: number[] = [];
            for (let i = 0; i < count; i++) {
              secondRolls.push(Math.floor(Math.random() * 20) + 1);
            }
            d20RollsSecond = secondRolls;
            const secondSum = secondRolls.reduce((a, b) => a + b, 0);
            if (rollMode === 'advantage') {
              if (secondSum > dieSum) {
                totalSum = totalSum - dieSum + secondSum;
              }
            } else {
              if (secondSum < dieSum) {
                totalSum = totalSum - dieSum + secondSum;
              }
            }
          }
        }
      });

      if (allRolls.length === 0) {
        const r = Math.floor(Math.random() * 20) + 1;
        totalSum = r;
        allRolls.push({ die: 20, rolls: [r] });
        diceCounts[20] = 1;
      }

      const finalResult = totalSum + modifier;

      const formulaStr = getFormulaStr();

      const isCrit = (diceCounts[20] || 0) > 0 && allRolls.some(ar => ar.die === 20 && ar.rolls.includes(20));

      const newResult: DiceRollResult = {
        id: Date.now().toString(),
        die: formulaStr,
        count: Object.values(diceCounts).reduce((a, b) => a + b, 0),
        modifier,
        selectedAbility,
        mode: rollMode,
        rolls: allRolls.flatMap(ar => ar.rolls),
        rollsSecond: d20RollsSecond.length > 0 ? d20RollsSecond : undefined,
        finalResult,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isCrit,
      };

      setLatestRoll(newResult);
      setHistory((prev) => [newResult, ...prev.slice(0, 15)]);
      setRollingAnimation(false);
      onRollComplete?.(finalResult);
    }, 300);
  };

  const standardDice = [4, 6, 8, 10, 12, 20, 100];

  const getFormulaStr = () => {
    const parts = standardDice
      .filter((d) => (diceCounts[d] || 0) > 0)
      .map((d) => `${diceCounts[d]}d${d}`);
    return parts.length > 0 ? parts.join(' + ') : '1d20';
  };

  const formulaStr = getFormulaStr();
  const totalDiceSelected = Object.values(diceCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/40 bg-[#0d101c] p-6 shadow-2xl text-zinc-100">
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
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-300 font-cinzel">
              Elige los dados (Clic: +1, Clic der: -1):
            </label>
            <button
              onClick={() => setDiceCounts({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0, 100: 0 })}
              className="text-[11px] text-zinc-400 hover:text-white underline"
            >
              Limpiar
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {standardDice.map((d) => {
              const count = diceCounts[d] || 0;
              const hasDice = count > 0;
              return (
                <button
                  key={d}
                  onClick={() => {
                    setDiceCounts(prev => ({
                      ...prev,
                      [d]: (prev[d] || 0) + 1 > 20 ? 0 : (prev[d] || 0) + 1
                    }));
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setDiceCounts(prev => ({
                      ...prev,
                      [d]: Math.max(0, (prev[d] || 0) - 1)
                    }));
                  }}
                  className={`relative flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${
                    hasDice
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'border-zinc-800 bg-[#161a29] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                  title={`d${d} (Clic: +1, Clic der: -1)`}
                >
                  <span className="text-sm">🎲</span>
                  <span>d{d}</span>
                  {hasDice && (
                    <span className="absolute bottom-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded bg-amber-400 px-1 text-[10px] font-black text-zinc-950 shadow">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modifiers & Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Modifier via Character Ability Dropdown */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Modificador: {modifier >= 0 ? `+${modifier}` : modifier}
            </label>
            <select
              value={selectedAbility}
              onChange={(e) => handleAbilityChange(e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="none">Sin mod (+0)</option>
              {abilityList.map(({ key, label, short }) => {
                const mod = getAbilityMod(key);
                const sign = mod >= 0 ? '+' : '';
                return (
                  <option key={key} value={key}>
                    {short} - {label} ({sign}{mod})
                  </option>
                );
              })}
              {selectedAbility === 'custom' && (
                <option value="custom">Fórmula / Manual ({modifier >= 0 ? `+${modifier}` : modifier})</option>
              )}
            </select>
          </div>

          {/* Roll Mode */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Modo de tirada:</label>
            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-700">
              <button
                type="button"
                onClick={() => setRollMode('normal')}
                className={`py-1 text-[11px] font-medium rounded ${rollMode === 'normal' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setRollMode('advantage')}
                className={`py-1 text-[11px] font-medium rounded ${rollMode === 'advantage' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Ventaja
              </button>
              <button
                type="button"
                onClick={() => setRollMode('disadvantage')}
                className={`py-1 text-[11px] font-medium rounded ${rollMode === 'disadvantage' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Desv.
              </button>
            </div>
          </div>
        </div>

        {/* Roll Action Button */}
        <button
          onClick={rollDice}
          disabled={rollingAnimation || totalDiceSelected === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 font-cinzel font-bold text-stone-950 text-sm tracking-wider uppercase shadow-lg hover:brightness-110 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
        >
          {rollingAnimation ? 'Lanzando los dados...' : `¡Lanzar ${formulaStr} ${modifier >= 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`}!`}
        </button>

        {/* Latest Result Banner */}
        {latestRoll && (
          <div className="my-4 rounded-xl border border-emerald-500/40 bg-[#0e1620] p-4 text-center shadow-inner">
            <div className="text-[11px] text-zinc-400 mb-1">
              Resultado de {latestRoll.count}{latestRoll.die}
              {latestRoll.selectedAbility && latestRoll.selectedAbility !== 'none' && latestRoll.selectedAbility !== 'custom' && ` (${latestRoll.selectedAbility})`}
              {latestRoll.modifier !== 0 && ` (${latestRoll.modifier >= 0 ? '+' : ''}${latestRoll.modifier})`}
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
