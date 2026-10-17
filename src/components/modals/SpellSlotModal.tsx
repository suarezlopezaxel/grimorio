import React, { useState } from 'react';
import { X, Sparkles, Dices } from 'lucide-react';
import { CharacterSheet, GrimoireCard } from '../../types/character';
import { CLASS_THEMES } from '../../data/classThemes';
import { ClassWidgetFrame } from '../fx/ClassWidgetFrame';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  card: GrimoireCard | null;
  character: CharacterSheet;
  onConfirmSlot: (chosenTier: number) => void;
}

export const SpellSlotModal: React.FC<Props> = ({
  isOpen,
  onClose,
  card,
  character,
  onConfirmSlot,
}) => {
  if (!isOpen || !card) return null;

  const theme = CLASS_THEMES[character.classId] || CLASS_THEMES.mago;
  const spellLevel = card.level ?? 1;
  const slots = character.spellSlots ?? [];
  const eligibleSlots = slots.filter((s) => s.tier >= spellLevel);

  const [selectedTier, setSelectedTier] = useState<number>(
    eligibleSlots.find((s) => (s.used ?? 0) < (s.max ?? 0))?.tier || spellLevel
  );

  const handleConfirm = () => {
    const target = slots.find((s) => s.tier === selectedTier);
    if (!target || target.tier < spellLevel) {
      alert('Nivel de espacio inválido.');
      return;
    }
    if ((target.used ?? 0) >= (target.max ?? 0)) {
      alert(`No quedan espacios disponibles de Nivel ${selectedTier}.`);
      return;
    }
    onConfirmSlot(selectedTier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700 bg-[#0d0f17] shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{
            borderColor: theme.palette.border,
            backgroundColor: `${theme.palette.primary}15`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl border shadow-inner"
              style={{
                borderColor: theme.palette.border,
                backgroundColor: `${theme.palette.primary}30`,
                color: theme.palette.textAccent,
              }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-base font-bold text-zinc-100">
                Lanzar Hechizo
              </h2>
              <p className="text-xs text-zinc-400">
                {card.name || card.title} • Nivel {spellLevel === 0 ? 'Cantrip' : spellLevel}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-zinc-300">
            Selecciona el nivel de espacio de hechizo que deseas gastar para lanzar este hechizo (mínimo nivel {spellLevel}):
          </p>

          {eligibleSlots.length === 0 ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-center text-xs text-rose-300">
              No tienes espacios de hechizo de nivel {spellLevel} o superior disponibles.
            </div>
          ) : (
            <div className="space-y-2">
              {eligibleSlots.map((slot) => {
                const available = (slot.max ?? 0) - (slot.used ?? 0);
                const isSelected = selectedTier === slot.tier;
                const isExhausted = available <= 0;

                return (
                  <div
                    key={slot.tier}
                    onClick={() => !isExhausted && setSelectedTier(slot.tier)}
                    className={`flex items-center justify-between rounded-xl border p-3 transition ${
                      isExhausted
                        ? 'opacity-40 border-zinc-800 bg-zinc-900/40 cursor-not-allowed'
                        : isSelected
                        ? 'border-purple-500 bg-purple-950/40 shadow-[0_0_12px_rgba(168,85,247,0.25)] cursor-pointer'
                        : 'border-zinc-800 bg-[#131522] hover:border-zinc-700 hover:bg-zinc-800/60 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="spellSlotTier"
                        checked={isSelected}
                        disabled={isExhausted}
                        onChange={() => setSelectedTier(slot.tier)}
                        className="accent-purple-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-cinzel text-xs font-bold text-zinc-100">
                          Espacio de Nivel {slot.tier}
                        </span>
                        <div className="text-[11px] text-zinc-400">
                          Disponibles: {available} de {slot.max}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                        isExhausted
                          ? 'border-rose-500/30 bg-rose-950/45 text-rose-300'
                          : available > 0
                          ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isExhausted ? 'Agotado' : `${available} libres`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={eligibleSlots.length === 0}
              onClick={handleConfirm}
              className="flex items-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 px-4 py-2 text-xs font-bold text-white transition shadow-md cursor-pointer"
            >
              <Dices className="h-4 w-4" />
              <span>Gastar Espacio y Tirar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
