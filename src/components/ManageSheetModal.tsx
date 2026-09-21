import React, { useState, useEffect } from 'react';
import { CharacterSheet, TacticalCard, ClassKey } from '../types';

interface ManageSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCharacter: CharacterSheet;
  currentCards: TacticalCard[];
  onLoadCharacter: (char: CharacterSheet, cards?: TacticalCard[], classKey?: ClassKey) => void;
  onResetDefaults: () => void;
}

interface SavedSlot {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  date: string;
  charData: CharacterSheet;
  cardsData: TacticalCard[];
  classKey?: ClassKey;
}

export const ManageSheetModal: React.FC<ManageSheetModalProps> = ({
  isOpen,
  onClose,
  currentCharacter,
  currentCards,
  onLoadCharacter,
  onResetDefaults,
}) => {
  const [savedSlots, setSavedSlots] = useState<SavedSlot[]>([]);
  const [newSlotName, setNewSlotName] = useState('');

  const STORAGE_KEY = 'grimorio_arcanum_saved_heroes';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSavedSlots(JSON.parse(stored));
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    const slotTitle = newSlotName.trim() || currentCharacter.name || 'Heroe Arcano';
    const newSlot: SavedSlot = {
      id: `slot-${Date.now()}`,
      name: slotTitle,
      characterClass: currentCharacter.characterClass,
      level: currentCharacter.level,
      date: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      charData: currentCharacter,
      cardsData: currentCards,
      classKey: currentCharacter.classKey,
    };

    const updated = [newSlot, ...savedSlots.slice(0, 9)];
    setSavedSlots(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    setNewSlotName('');
  };

  const handleDeleteSlot = (id: string) => {
    const updated = savedSlots.filter((s) => s.id !== id);
    setSavedSlots(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleExportJson = () => {
    const exportData = {
      character: currentCharacter,
      cards: currentCards,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const safeName = currentCharacter.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase() || 'heroe_arcano';
    downloadAnchor.setAttribute('download', `${safeName}_ficha.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedCharacter = parsed.character || parsed;
        if (importedCharacter?.id && importedCharacter?.name) {
          onLoadCharacter(importedCharacter, parsed.cards, importedCharacter.classKey);
          onClose();
        }
      } catch {
        alert('El archivo no tiene un formato de ficha JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#1c1a24] border border-[#36333e] rounded-xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-[var(--theme-primary,#fbbf24)]">
              folder_open
            </span>
            <div>
              <h3 className="font-garamond text-xl font-bold text-white">
                Bóveda de Códices & Fichas Guardadas
              </h3>
              <p className="text-xs text-gray-400">
                Guarda tus personajes en el grimorio local o expórtalos en archivo JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Quick Save Current */}
        <div className="bg-[#0f0d16] p-3.5 rounded-lg border border-white/5 mb-4">
          <span className="font-runic text-[10px] text-gray-400 uppercase font-bold block mb-1">
            Guardar Ficha Activa
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`ej. ${currentCharacter.name} (Sesión 4)`}
              value={newSlotName}
              onChange={(e) => setNewSlotName(e.target.value)}
              className="flex-1 bg-[#1c1a24] text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[var(--theme-primary,#fbbf24)]"
            />
            <button
              onClick={handleSaveCurrent}
              className="px-4 py-2 rounded-lg bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs hover:brightness-110 shadow-sm whitespace-nowrap"
            >
              Guardar en Bóveda
            </button>
          </div>
        </div>

        {/* Saved Slots List */}
        <div className="space-y-2 mb-4">
          <span className="font-runic text-[10px] text-gray-400 uppercase font-bold block">
            Fichas en Bóveda ({savedSlots.length})
          </span>

          {savedSlots.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#0f0d16] border border-white/5 text-center text-xs text-gray-400">
              No hay fichas guardadas en la memoria local aún. Guarda la ficha actual arriba para crear una copia de seguridad.
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {savedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-2.5 rounded-lg bg-[#0f0d16] border border-white/5 flex items-center justify-between hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col">
                    <span className="font-garamond text-base font-bold text-white leading-tight">
                      {slot.name}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Nv. {slot.level} • {slot.characterClass} ({slot.date})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onLoadCharacter(slot.charData, slot.cardsData, slot.classKey);
                        onClose();
                      }}
                      className="px-3 py-1 rounded bg-[var(--theme-secondary-container,#571bc1)] text-white text-xs font-semibold hover:brightness-110"
                    >
                      Cargar
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1 rounded text-gray-500 hover:text-red-400"
                      title="Eliminar registro"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* JSON Export / Import and Reset */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
          <button
            onClick={handleExportJson}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#211e28] hover:bg-[#2b2932] text-gray-200 border border-white/5"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Exportar JSON</span>
          </button>

          <label className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#211e28] hover:bg-[#2b2932] text-gray-200 border border-white/5 cursor-pointer">
            <span className="material-symbols-outlined text-sm">upload</span>
            <span>Importar JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (window.confirm('¿Restablecer el personaje a los valores por defecto del grimorio?')) {
                onResetDefaults();
                onClose();
              }
            }}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#211e28] hover:bg-red-950 text-red-300 border border-white/5"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Restablecer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
