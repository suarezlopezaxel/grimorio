import React, { useState } from 'react';
import { EyeOff, Eye, Package, Skull, Lock, Coins } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onToggleStealthMode?: (active: boolean) => void;
}

export const RogueStealthModule: React.FC<Props> = ({ character, onUpdate, onToggleStealthMode }) => {
  const rogueData = character.classResources.rogue || {
    inStealth: false,
    sneakAttackDice: `${Math.ceil(character.level / 2)}d6`,
    stolenLootCount: 3,
  };

  const toggleStealth = () => {
    const nextStealth = !rogueData.inStealth;
    if (onToggleStealthMode) {
      onToggleStealthMode(nextStealth);
    }
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        rogue: {
          ...rogueData,
          inStealth: nextStealth,
        },
      },
    });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 p-5 backdrop-blur-md ${
        rogueData.inStealth
          ? 'border-purple-600 bg-gradient-to-br from-[#120a1c] via-[#090510] to-[#160a22] shadow-[0_0_30px_rgba(168,85,247,0.4)]'
          : 'border-purple-900/40 bg-gradient-to-br from-[#160e22]/90 via-[#0d0914]/95 to-[#1c122a]/90'
      }`}
    >
      {/* Stitched leather seams effect & tucked cards */}
      <div className="pointer-events-none absolute inset-x-0 top-0 border-b border-dashed border-amber-600/30" />
      <div className="pointer-events-none absolute right-2 top-2 text-purple-400/20 text-3xl font-mono select-none">
        ♠ 🂡
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
              rogueData.inStealth
                ? 'border-purple-400 bg-purple-600/30 text-purple-200 shadow-[0_0_15px_#a855f7]'
                : 'border-purple-500/30 bg-purple-950/40 text-purple-400'
            }`}
          >
            {rogueData.inStealth ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-purple-100 tracking-wide">
                Ataque Furtivo ({rogueData.sneakAttackDice})
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold border transition ${
                  rogueData.inStealth
                    ? 'border-purple-400 bg-purple-500/30 text-purple-200 animate-pulse'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                }`}
              >
                {rogueData.inStealth ? 'EN SOMBRAS (OCULTO)' : 'VISIBLE'}
              </span>
            </div>
            <p className="text-xs text-purple-200/70">
              Añade <strong className="text-purple-300 font-mono">+{rogueData.sneakAttackDice}</strong> de daño si tienes ventaja o un aliado a 5 pies
            </p>
          </div>
        </div>

        <button
          onClick={toggleStealth}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-cinzel font-bold tracking-wider uppercase transition cursor-pointer ${
            rogueData.inStealth
              ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-lg border border-purple-400/60'
              : 'bg-gradient-to-r from-purple-900 to-stone-900 text-purple-200 border border-purple-600/40 hover:border-purple-400'
          }`}
        >
          {rogueData.inStealth ? (
            <>
              <Eye className="h-4 w-4" /> Salir de las Sombras
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" /> Entrar en Sigilo (Oscurecer Hoja)
            </>
          )}
        </button>
      </div>

      {/* Thief's Pouch (Bolsa de Ladrón) */}
      <div className="rounded-xl border border-purple-800/30 bg-[#0d0716]/90 p-3.5 shadow-inner flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-purple-300">
          <Package className="h-4 w-4 text-amber-400" />
          <span className="font-semibold">Bolsa Secreta de Contrabando & Ganzúas:</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-purple-200/80">
          <span className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-zinc-400" /> Juego de Ganzúas (+6 Juego de Manos)
          </span>
          <span className="flex items-center gap-1">
            <Coins className="h-3.5 w-3.5 text-amber-400" /> 3 Gemas Robadas (150 po)
          </span>
        </div>
      </div>
    </div>
  );
};
