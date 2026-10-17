import React, { useState } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';
import { CharacterSheet, ActiveEffect } from '../../types/character';
import { CLASS_THEMES } from '../../data/classThemes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterSheet;
  onAddEffect: (effect: ActiveEffect) => void;
}

export const ActiveEffectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  character,
  onAddEffect,
}) => {
  if (!isOpen) return null;

  const theme = CLASS_THEMES[character.classId] || CLASS_THEMES.mago;

  const [name, setName] = useState('');
  const [durationRounds, setDurationRounds] = useState<number>(10);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEffect: ActiveEffect = {
      id: `eff-${Date.now()}`,
      name: name.trim(),
      durationRounds: Number(durationRounds) || 1,
      concentration: false,
      notes: notes.trim() || undefined,
    };

    onAddEffect(newEffect);
    setName('');
    setDurationRounds(10);
    setNotes('');
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
                Añadir Efecto Activo
              </h2>
              <p className="text-xs text-zinc-400">
                {character.name} • Control de Combate
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Nombre del Efecto
            </label>
            <input
              type="text"
              placeholder="Ej. Bendición, Escudo de Fe..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Duración (Turnos)
              </label>
              <input
                type="number"
                min="1"
                value={durationRounds}
                onChange={(e) => setDurationRounds(parseInt(e.target.value) || 1)}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Notas / Descripción (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. +2 a la CA, +1d4 a tiradas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

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
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Añadir Efecto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
