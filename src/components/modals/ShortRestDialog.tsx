import React, { useState } from 'react';
import { X, Moon, Heart, Sparkles } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterSheet;
  onApplyHealing: (hpRegained: number, diceSpent: number) => void;
}

export const ShortRestDialog: React.FC<Props> = ({ isOpen, onClose, character, onApplyHealing }) => {
  if (!isOpen) return null;

  const dieSize = parseInt(character.hitDice.die.replace(/\D/g, '')) || 8;
  const conMod = Math.floor((character.abilities.CON.score - 10) / 2);
  const [diceToSpend, setDiceToSpend] = useState<number>(1);
  const [healingRolled, setHealingRolled] = useState<number | null>(null);

  const rollDiceHealing = () => {
    let total = 0;
    for (let i = 0; i < diceToSpend; i++) {
      total += Math.max(1, Math.floor(Math.random() * dieSize) + 1 + conMod);
    }
    setHealingRolled(total);
  };

  const confirmHealing = () => {
    const total = healingRolled !== null ? healingRolled : diceToSpend * (Math.floor(dieSize / 2) + 1 + conMod);
    onApplyHealing(total, diceToSpend);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-[#121626] via-[#0d101c] to-[#161a2e] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Moon className="h-6 w-6 text-indigo-400" />
            <h2 className="font-cinzel text-lg font-bold text-indigo-200">Descanso Corto (1 hora)</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span>Dados de Golpe Disponibles:</span>
            <span className="font-mono font-bold text-amber-300">
              {character.hitDice.current} / {character.hitDice.max} ({character.hitDice.die})
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#161828] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300">¿Cuántos dados gastar?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDiceToSpend(Math.max(1, diceToSpend - 1))}
                  className="w-8 h-8 rounded border border-zinc-700 bg-zinc-800 text-sm font-bold text-white"
                >
                  -
                </button>
                <span className="font-mono font-bold text-sm text-indigo-300">{diceToSpend}</span>
                <button
                  onClick={() => setDiceToSpend(Math.min(character.hitDice.current, diceToSpend + 1))}
                  className="w-8 h-8 rounded border border-zinc-700 bg-zinc-800 text-sm font-bold text-white"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={rollDiceHealing}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-cinzel text-xs font-bold transition"
            >
              🎲 Tirar {diceToSpend}d{dieSize} + {diceToSpend * conMod} (CON)
            </button>

            {healingRolled !== null && (
              <div className="text-center py-2 rounded bg-indigo-950/60 border border-indigo-500/30">
                <span className="text-xs text-zinc-300">Puntos de Golpe Recuperados:</span>
                <div className="font-cinzel text-2xl font-bold text-emerald-400">+{healingRolled} PG</div>
              </div>
            )}
          </div>

          <button
            onClick={confirmHealing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-cinzel font-bold text-stone-950 text-xs tracking-wider uppercase shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            Confirmar Descanso y Recuperar PG
          </button>
        </div>
      </div>
    </div>
  );
};
