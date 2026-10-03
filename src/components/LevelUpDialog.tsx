import React, { useState } from 'react';

interface LevelUpDialogProps {
  currentLevel: number;
  targetLevel: number;
  hitDie: number;
  constitutionModifier: number;
  onCancel: () => void;
  onConfirm: (method: 'roll' | 'average') => void;
}

export const LevelUpDialog: React.FC<LevelUpDialogProps> = ({
  currentLevel,
  targetLevel,
  hitDie,
  constitutionModifier,
  onCancel,
  onConfirm,
}) => {
  const [method, setMethod] = useState<'roll' | 'average'>('average');
  const asiLevels = [4, 8, 12, 16, 19].filter((level) => level > currentLevel && level <= targetLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-up-title"
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#1c1a24] p-5 shadow-2xl"
      >
        <h2 id="level-up-title" className="font-garamond text-xl font-bold text-white">
          Progresión de Mago: nivel {currentLevel} → {targetLevel}
        </h2>
        <p className="mt-2 text-xs text-gray-300">
          Por cada nivel ganas puntos de golpe: 1d{hitDie} + CON ({constitutionModifier}), mínimo 1.
        </p>
        <fieldset className="mt-4 space-y-2">
          <legend className="mb-2 text-xs font-bold uppercase text-gray-400">Aumento de puntos de golpe</legend>
          <label className="flex items-center gap-2 rounded bg-[#211e28] p-2 text-sm text-gray-200">
            <input type="radio" checked={method === 'average'} onChange={() => setMethod('average')} />
            Promedio: {Math.max(1, Math.floor(hitDie / 2) + 1 + constitutionModifier)} PG por nivel
          </label>
          <label className="flex items-center gap-2 rounded bg-[#211e28] p-2 text-sm text-gray-200">
            <input type="radio" checked={method === 'roll'} onChange={() => setMethod('roll')} />
            Tirar 1d{hitDie} + CON por cada nivel
          </label>
        </fieldset>
        {asiLevels.length > 0 && (
          <p className="mt-3 rounded border border-amber-300/20 bg-amber-500/10 p-2 text-xs text-amber-200">
            Recuerda elegir una mejora de característica o dote en nivel {asiLevels.join(', ')}.
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded bg-white/10 px-3 py-2 text-xs text-gray-300">
            Cancelar
          </button>
          <button type="button" onClick={() => onConfirm(method)} className="rounded bg-[var(--theme-primary,#fbbf24)] px-3 py-2 text-xs font-bold text-black">
            Aplicar progresión
          </button>
        </div>
      </section>
    </div>
  );
};
