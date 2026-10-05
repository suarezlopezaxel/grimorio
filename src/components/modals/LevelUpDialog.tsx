import React, { useState } from 'react';
import { X, Sparkles, ArrowUpCircle, Heart, Zap } from 'lucide-react';
import { CharacterSheet, AbilityKey } from '../../types/character';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterSheet;
  onConfirmLevelUp: (newLevel: number, hpIncrease: number, statBoosts?: { stat1: AbilityKey; stat2?: AbilityKey }) => void;
}

export const LevelUpDialog: React.FC<Props> = ({ isOpen, onClose, character, onConfirmLevelUp }) => {
  if (!isOpen) return null;

  const nextLevel = character.level + 1;
  const dieSize = parseInt(character.hitDice.die.replace(/\D/g, '')) || 8;
  const conMod = Math.floor((character.abilities.CON.score - 10) / 2);
  const averageHp = Math.max(1, Math.floor(dieSize / 2) + 1 + conMod);

  const [hpChoice, setHpChoice] = useState<'average' | 'roll'>('average');
  const [rolledHp, setRolledHp] = useState<number>(averageHp);
  const [hasRolled, setHasRolled] = useState(false);

  const rollHitDie = () => {
    const roll = Math.floor(Math.random() * dieSize) + 1;
    const total = Math.max(1, roll + conMod);
    setRolledHp(total);
    setHasRolled(true);
  };

  const handleConfirm = () => {
    const finalHp = hpChoice === 'average' ? averageHp : rolledHp;
    onConfirmLevelUp(nextLevel, finalHp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/50 bg-gradient-to-br from-[#181522] via-[#0d0c16] to-[#1a1728] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <ArrowUpCircle className="h-6 w-6 text-amber-400" />
            <h2 className="font-cinzel text-lg font-bold text-amber-200">
              ¡Ascenso a Nivel {nextLevel}!
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-zinc-300">
            Tu poder heroico se expande. Ganas un nuevo dado de golpe ({character.hitDice.die.split('d')[1] || 'd8'}), aumento de puntos de golpe y espacios de conjuro ampliados.
          </p>

          {/* HP Selection */}
          <div className="rounded-xl border border-zinc-800 bg-[#12131f] p-3.5">
            <span className="font-cinzel text-xs font-bold text-zinc-200 block mb-2">
              Incremento de Puntos de Golpe:
            </span>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setHpChoice('average')}
                className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer ${
                  hpChoice === 'average'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                }`}
              >
                <div>Media Fija:</div>
                <div className="text-sm font-mono font-bold text-white">+{averageHp} PG</div>
                <div className="text-[10px] text-zinc-400">({Math.floor(dieSize / 2) + 1} + {conMod} CON)</div>
              </button>

              <button
                onClick={() => {
                  setHpChoice('roll');
                  if (!hasRolled) rollHitDie();
                }}
                className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer ${
                  hpChoice === 'roll'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                }`}
              >
                <div>Tirar 1d{dieSize}:</div>
                <div className="text-sm font-mono font-bold text-emerald-400">+{rolledHp} PG</div>
                <div className="text-[10px] text-zinc-400">Tirada al azar</div>
              </button>
            </div>

            {hpChoice === 'roll' && (
              <button
                onClick={rollHitDie}
                className="w-full py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
              >
                🎲 Volver a tirar 1d{dieSize} + {conMod}
              </button>
            )}
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-cinzel font-bold text-stone-950 text-xs tracking-wider uppercase shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            Confirmar Ascenso a Nivel {nextLevel}
          </button>
        </div>
      </div>
    </div>
  );
};
