import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Save, Trash2, Download, Upload, RotateCcw, Check, Sparkles } from 'lucide-react';
import { CharacterSheet } from '../../types/character';
import { CLASS_THEMES } from '../../data/classThemes';
import { DEFAULT_CHARACTERS } from '../../data/defaultCharacters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentCharacter: CharacterSheet;
  onLoadCharacter: (char: CharacterSheet) => void;
  onResetDefaults: () => void;
}

const STORAGE_KEY = 'grimorio_arcanum_saved_sheets_v5';

export const ManageSheetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentCharacter,
  onLoadCharacter,
  onResetDefaults,
}) => {
  const [savedList, setSavedList] = useState<CharacterSheet[]>([]);
  const [slotName, setSlotName] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedList(JSON.parse(stored));
      } else {
        setSavedList(DEFAULT_CHARACTERS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CHARACTERS));
      }
    } catch {
      setSavedList(DEFAULT_CHARACTERS);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveCurrentToStorage = () => {
    const updated = [...savedList];
    const existingIndex = updated.findIndex((c) => c.id === currentCharacter.id);

    const sheetToSave = {
      ...currentCharacter,
      name: slotName.trim() || currentCharacter.name || 'Héroe Guardado',
    };

    if (existingIndex >= 0) {
      updated[existingIndex] = sheetToSave;
    } else {
      updated.unshift(sheetToSave);
    }

    setSavedList(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSlotName('');
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const deleteFromStorage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedList.filter((c) => c.id !== id);
    setSavedList(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentCharacter, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentCharacter.name || 'personaje'}_ficha.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.name && parsed.classId) {
            onLoadCharacter(parsed);
            onClose();
          }
        } catch (err) {
          console.error('Error al importar ficha:', err);
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-br from-[#121422] via-[#0d0e18] to-[#181a2e] p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-zinc-100">Gestión de Fichas de Héroes</h2>
              <p className="text-xs text-zinc-400">Guarda, carga y exporta tus personajes de D&D 5e</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Save Current */}
        <div className="mb-4 rounded-xl border border-zinc-800 bg-[#161826] p-3.5 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder={`Nombre para guardar (Actual: ${currentCharacter.name})...`}
            value={slotName}
            onChange={(e) => setSlotName(e.target.value)}
            className="w-full flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-purple-400 focus:outline-none"
          />
          <button
            onClick={saveCurrentToStorage}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-stone-950 transition cursor-pointer"
          >
            {copiedNotification ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>{copiedNotification ? '¡Guardado con Éxito!' : 'Guardar Ficha Actual'}</span>
          </button>
        </div>

        {/* Saved Characters List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-4">
          <div className="text-xs font-cinzel font-semibold text-zinc-400 mb-2">
            Fichas Disponibles ({savedList.length}):
          </div>

          {savedList.map((char) => {
            const theme = CLASS_THEMES[char.classId] || CLASS_THEMES.mago;
            const isCurrent = char.id === currentCharacter.id;

            return (
              <div
                key={char.id}
                onClick={() => {
                  onLoadCharacter(char);
                  onClose();
                }}
                className={`group flex items-center justify-between rounded-xl border p-3 transition cursor-pointer ${
                  isCurrent
                    ? 'border-purple-500 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'border-zinc-800 bg-[#131522] hover:border-zinc-700 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg border text-base font-bold shadow-inner"
                    style={{
                      borderColor: theme.palette.border,
                      backgroundColor: `${theme.palette.primary}20`,
                      color: theme.palette.textAccent,
                    }}
                  >
                    {char.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel text-sm font-bold text-zinc-100">{char.name}</span>
                      <span
                        className="rounded px-1.5 py-0.2 text-[9px] font-bold border uppercase"
                        style={{
                          borderColor: theme.palette.primary,
                          color: theme.palette.textAccent,
                        }}
                      >
                        Nvl. {char.level}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          ACTIVA
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-400">
                      {theme.name} ({char.subclass || 'Sin subclase'}) • {char.species}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => deleteFromStorage(char.id, e)}
                    className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40"
                    title="Eliminar esta ficha"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Export / Import / Reset */}
        <div className="border-t border-zinc-800 pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={exportJSON}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar JSON</span>
            </button>

            <label className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>Importar JSON</span>
              <input type="file" accept=".json" onChange={importJSON} className="hidden" />
            </label>
          </div>

          <button
            onClick={() => {
              onResetDefaults();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restablecer Fichas por Defecto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
