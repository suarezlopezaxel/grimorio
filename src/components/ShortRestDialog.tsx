import React from 'react';
import type { HitDicePool } from '../types';

interface ShortRestDialogProps {
  hitDicePool: HitDicePool;
  diceToSpend: number;
  onDiceToSpendChange: (count: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ShortRestDialog: React.FC<ShortRestDialogProps> = ({
  hitDicePool,
  diceToSpend,
  onDiceToSpendChange,
  onCancel,
  onConfirm,
}) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="short-rest-title"
      className="bg-[#1c1a24] border border-white/10 rounded-xl max-w-sm w-full p-5 shadow-2xl"
    >
      <h2 id="short-rest-title" className="font-garamond text-xl text-white font-bold">
        Descanso corto
      </h2>
      <p className="mt-2 text-sm text-gray-300">
        Elige cuántos dados de golpe gastar. Cada dado recupera 1d{hitDicePool.dieSize} + modificador de Constitución.
      </p>
      <label htmlFor="short-rest-hit-dice" className="mt-4 block text-xs text-gray-400 uppercase font-bold">
        Dados por gastar (disponibles: {hitDicePool.remaining}/{hitDicePool.total})
      </label>
      <select
        id="short-rest-hit-dice"
        value={diceToSpend}
        onChange={(event) => onDiceToSpendChange(Number(event.target.value))}
        className="mt-1 w-full rounded-lg bg-[#0f0d16] border border-white/10 text-white px-3 py-2 focus:outline-none focus:border-[var(--theme-primary,#fbbf24)]"
      >
        {Array.from({ length: hitDicePool.remaining + 1 }, (_, count) => (
          <option key={count} value={count}>{count}</option>
        ))}
      </select>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg bg-[#211e28] text-gray-300 text-xs border border-white/10 hover:text-white"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-2 rounded-lg bg-[var(--theme-primary,#fbbf24)] text-[#261a00] text-xs font-bold hover:brightness-110"
        >
          Completar descanso
        </button>
      </div>
    </section>
  </div>
);
