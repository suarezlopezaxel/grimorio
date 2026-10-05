import React from 'react';
import { X, Sparkles, Check, ChevronRight } from 'lucide-react';
import { ClassId } from '../../types/character';
import { CLASS_THEMES } from '../../data/classThemes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentClassId: ClassId;
  onSelectClass: (classId: ClassId) => void;
}

export const ClassSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentClassId,
  onSelectClass,
}) => {
  if (!isOpen) return null;

  const classList = Object.values(CLASS_THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-700 bg-gradient-to-br from-[#10121e] via-[#0b0c14] to-[#151828] p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-zinc-100">
                Sintonía de Sendas & Estéticas de Clase (12 + Artífice)
              </h2>
              <p className="text-xs text-zinc-400">
                Selecciona una clase para adaptar inmediatamente toda la paleta, marcos rúnicos, animaciones y mecánicas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 13 Classes Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {classList.map((theme) => {
            const isSelected = theme.id === currentClassId;

            return (
              <div
                key={theme.id}
                onClick={() => {
                  onSelectClass(theme.id);
                  onClose();
                }}
                className={`group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-2 shadow-lg scale-[1.01]'
                    : 'border-zinc-800 bg-[#121422]/80 hover:border-zinc-700 hover:bg-[#16192a]'
                }`}
                style={{
                  borderColor: isSelected ? theme.palette.primary : undefined,
                  backgroundColor: isSelected ? `${theme.palette.primary}18` : undefined,
                }}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold shadow-sm"
                      style={{
                        backgroundColor: `${theme.palette.primary}30`,
                        color: theme.palette.textAccent,
                        borderColor: theme.palette.border,
                      }}
                    >
                      {theme.name.charAt(0)}
                    </span>
                    <h3 className="font-cinzel text-sm font-bold text-zinc-100">{theme.name}</h3>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      <Check className="h-3 w-3 stroke-[3]" /> Activa
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-zinc-300 font-medium mb-1.5 line-clamp-1">
                  {theme.subtitle}
                </div>

                {/* Aesthetic frame & mechanical details */}
                <div className="space-y-1 text-[10px] text-zinc-400 mb-3">
                  <div>
                    <strong className="text-zinc-300">Marco:</strong> {theme.frameStyle.frameName}
                  </div>
                  <div>
                    <strong className="text-zinc-300">Mecánica:</strong> {theme.specialMechanics.name}
                  </div>
                </div>

                {/* Color swatches */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800/80">
                  <span
                    className="h-3 w-3 rounded-full border border-black/30"
                    style={{ backgroundColor: theme.palette.primary }}
                    title="Color Primario"
                  />
                  <span
                    className="h-3 w-3 rounded-full border border-black/30"
                    style={{ backgroundColor: theme.palette.secondary }}
                    title="Color Secundario"
                  />
                  <span
                    className="h-3 w-3 rounded-full border border-black/30"
                    style={{ backgroundColor: theme.palette.accent }}
                    title="Acento"
                  />
                  <span className="text-[9px] text-zinc-500 ml-auto font-mono">
                    {theme.frameStyle.dividerSymbol}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
