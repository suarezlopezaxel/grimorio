import React from 'react';
import { ClassWidget, ClassSubBox } from '../fx/ClassStyledContainer';
import { InventoryItem } from '../../types/character';
import { Trash2, Plus } from 'lucide-react';

interface InventoryProps {
  character: any;
  onUpdate: (updated: any) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
}

export const InventorySection: React.FC<InventoryProps> = ({ character, onUpdate, addItem, removeItem, updateItem }) => {
  const [currencyDraft, setCurrencyDraft] = React.useState<Record<string, string>>({});

  return (
    <ClassWidget classId={character.classId} className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-cinzel text-sm font-bold">Inventario & Bolsa de Equipo</h3>
          <span className="text-xs opacity-75">
            • Peso: {character.inventory.reduce((a: number, b: InventoryItem) => a + b.weight * b.quantity, 0)} / {character.carryingCapacityMax} lb
            • Sintonizados: {character.inventory.filter((i: InventoryItem) => i.attuned).length}/3
          </span>
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-1 rounded-lg bg-black/40 hover:bg-black/60 border border-white/15 px-3 py-1 text-xs font-semibold transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Añadir Objeto</span>
        </button>
      </div>

      {/* Currency row */}
      <div className="grid grid-cols-5 gap-2 mb-3 text-center text-xs">
        {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map((key, idx) => {
          const label = (['CP', 'SP', 'EP', 'GP', 'PP'] as const)[idx];
          const value: number = Number(character.currency?.[key] ?? 0);
          const draft = currencyDraft[key] ?? String(value);

          return (
            <ClassSubBox key={key} className="p-1.5" classId={character.classId}>
              <label className="text-[10px] opacity-75 block font-mono" htmlFor={`cur-${key}`}>
                {label}
              </label>
              <input
                id={`cur-${key}`}
                type="text"
                inputMode="numeric"
                value={draft}
                onChange={(e) => {
                  const raw = e.target.value;
                  // Importante: no forzamos onUpdate a 0 mientras escriben.
                  // Solo guardamos el estado temporal; en onBlur normalizamos y persistimos.
                  setCurrencyDraft((prev) => ({
                    ...prev,
                    [key]: raw,
                  }));
                }}
                onBlur={(e) => {
                  const raw = e.target.value;
                  const next = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);

                  // Limpia el borrador para que el input vuelva a respaldarse en character.currency
                  setCurrencyDraft((prev) => {
                    const copy = { ...prev };
                    delete copy[key];
                    return copy;
                  });

                  onUpdate({
                    ...character,
                    currency: {
                      ...(character.currency ?? {}),
                      [key]: next,
                    },
                  });
                }}
                className="w-full font-bold font-mono text-sm text-center rounded border border-white/10 bg-black/40 px-1 py-0.5"
              />
            </ClassSubBox>
          );
        })}
      </div>

      {/* Items List */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {character.inventory.map((item: InventoryItem) => (
          <ClassSubBox
            key={item.id}
            classId={character.classId}
            className="flex items-center justify-between text-xs py-2 px-3"
          >
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                className="w-10 rounded border border-white/10 bg-black/40 px-1 py-0.5 text-center"
              />
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                className="rounded border border-white/10 bg-black/40 px-1 py-0.5"
              />
              <span className="text-[10px] opacity-60">{item.weight} lb{item.value ? ` · ${item.value}` : ''}</span>
            </div>
            {item.cardId && (
              <div className="flex items-center gap-2">
                {item.equipped !== undefined && (
                  <button onClick={() => updateItem(item.id, { equipped: !item.equipped })} className={`rounded px-2 py-1 text-[10px] font-bold ${item.equipped ? 'bg-emerald-900/60 text-emerald-200' : 'bg-black/30 text-zinc-400'}`}>
                    {item.equipped ? 'Equipado' : 'Equipar'}
                  </button>
                )}
                {item.requiresAttunement && (
                  <button
                    onClick={() => {
                      if (!item.attuned && character.inventory.filter((entry: InventoryItem) =>
                        entry.id !== item.id && entry.requiresAttunement && entry.attuned,
                      ).length >= 3) {
                        alert('Un personaje solo puede estar sintonizado con tres objetos a la vez.');
                        return;
                      }
                      updateItem(item.id, { attuned: !item.attuned });
                    }}
                    className={`rounded px-2 py-1 text-[10px] font-bold ${item.attuned ? 'bg-amber-900/60 text-amber-200' : 'bg-black/30 text-zinc-400'}`}
                  >
                    {item.attuned ? 'Sintonizado' : 'Sintonizar'}
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => removeItem(item.id)}
              className="text-white/50 hover:text-rose-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </ClassSubBox>
        ))}
      </div>
    </ClassWidget>
  );
};
