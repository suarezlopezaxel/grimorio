import React, { useState } from 'react';
import { X, Sparkles, Plus, Save } from 'lucide-react';
import { GrimoireCard } from '../../types/character';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (card: GrimoireCard) => void;
  cardToEdit?: GrimoireCard | null;
}

export const HomebrewCardModal: React.FC<Props> = ({ isOpen, onClose, onSaveCard, cardToEdit }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(cardToEdit?.title || '');
  const [category, setCategory] = useState<GrimoireCard['category']>(cardToEdit?.category || 'attack');
  const [actionType, setActionType] = useState<GrimoireCard['actionType']>(cardToEdit?.actionType || 'Acción');
  const [range, setRange] = useState(cardToEdit?.range || '5 ft');
  const [attackOrDC, setAttackOrDC] = useState(cardToEdit?.attackOrDC || '+5');
  const [target, setTarget] = useState(cardToEdit?.target || '1 Criatura');
  const [effectOrDamage, setEffectOrDamage] = useState(cardToEdit?.effectOrDamage || '1d8 + 3 Daño');
  const [description, setDescription] = useState(cardToEdit?.description || '');
  const [usesMax, setUsesMax] = useState<number>(cardToEdit?.usesMax || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCard: GrimoireCard = {
      id: cardToEdit?.id || `card-${Date.now()}`,
      title: title.trim(),
      category,
      actionType,
      range,
      attackOrDC,
      target,
      effectOrDamage,
      description,
      usesMax: usesMax > 0 ? usesMax : undefined,
      usesLeft: usesMax > 0 ? usesMax : undefined,
    };

    onSaveCard(newCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#121626] via-[#0d101c] to-[#181d30] p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="font-cinzel text-base font-bold text-zinc-100">
              {cardToEdit ? 'Editar Tarjeta Táctica' : 'Crear Tarjeta Homebrew'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Título de la Tarjeta:</label>
            <input
              type="text"
              required
              placeholder="Ej: Vara Relámpago Afilada..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Categoría:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-white"
              >
                <option value="attack">Ataque</option>
                <option value="spell">Conjuro</option>
                <option value="skill">Habilidad</option>
                <option value="item">Objeto</option>
                <option value="reaction">Reacción</option>
                <option value="standard">Estándar 5e</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Tipo de Acción:</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-white"
              >
                <option value="Acción">Acción</option>
                <option value="Acción Adicional">Acción Adicional</option>
                <option value="Reacción">Reacción</option>
                <option value="Movimiento">Movimiento</option>
                <option value="Especial">Especial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Alcance:</label>
              <input
                type="text"
                placeholder="5 ft / 60 ft"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Ataque / CD:</label>
              <input
                type="text"
                placeholder="+7 / CD 15"
                value={attackOrDC}
                onChange={(e) => setAttackOrDC(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Objetivo:</label>
              <input
                type="text"
                placeholder="1 Criatura"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Efecto o Daño:</label>
            <input
              type="text"
              placeholder="Ej: 1d8 + 4 Relámpago"
              value={effectOrDamage}
              onChange={(e) => setEffectOrDamage(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Descripción / Reglas:</label>
            <textarea
              rows={3}
              placeholder="Detalla el efecto de la tarjeta táctica..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-zinc-300 font-semibold">Usos Diarios (0 = ilimitado):</label>
            <input
              type="number"
              min="0"
              max="20"
              value={usesMax}
              onChange={(e) => setUsesMax(parseInt(e.target.value) || 0)}
              className="w-20 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-center text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-cinzel font-bold text-stone-950 text-xs tracking-wider uppercase shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            Guardar Tarjeta en el Grimorio
          </button>
        </form>
      </div>
    </div>
  );
};
