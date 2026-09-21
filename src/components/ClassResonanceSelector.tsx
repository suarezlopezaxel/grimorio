import React, { useState } from 'react';
import { ClassKey, ElementAffinity } from '../types';
import { CLASS_THEMES, ELEMENT_ACCENTS } from '../themes';

interface ClassResonanceSelectorProps {
  currentClass: ClassKey;
  onSelectClass: (c: ClassKey) => void;
  currentElement: ElementAffinity;
  onSelectElement: (el: ElementAffinity) => void;
  onSaveSheet: () => void;
  onOpenLoadModal: () => void;
  onNewSheet: () => void;
}

export const ClassResonanceSelector: React.FC<ClassResonanceSelectorProps> = ({
  currentClass,
  onSelectClass,
  currentElement,
  onSelectElement,
  onSaveSheet,
  onOpenLoadModal,
  onNewSheet,
}) => {
  const [showAllClassesModal, setShowAllClassesModal] = useState(false);

  // Quick 4 primary classes on desktop + modal for all 12 paths
  const quickClasses: ClassKey[] = ['mago', 'druida', 'bardo', 'guerrero'];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 bg-[#0f0d16]/80 p-4 rounded-xl shadow-lg border border-white/5 relative overflow-hidden">
      {/* Background magical aura */}
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[var(--theme-glow,rgba(87,27,193,0.2))] blur-3xl pointer-events-none"></div>
      <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-[var(--theme-primary,rgba(251,191,36,0.1))] blur-2xl pointer-events-none"></div>

      {/* Left: Active Profile & File actions */}
      <div className="flex flex-wrap items-center gap-2.5 z-10">
        <div className="flex items-center gap-1.5 bg-[#211e28] px-3 py-1.5 rounded-lg shadow-inner border border-white/5">
          <span className="font-runic text-xs text-[var(--theme-primary,#fbbf24)] tracking-widest font-bold">
            PERFIL ACTIVO
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary,#fbbf24)] animate-ping"></span>
        </div>
        <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSaveSheet}
            id="btn-save"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b2932] hover:bg-[var(--theme-primary,#fbbf24)] hover:text-[#261a00] text-gray-200 transition-all text-xs font-semibold shadow-sm border border-white/5 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm text-[var(--theme-primary,#fbbf24)]">save</span>
            <span>Guardar Ficha</span>
          </button>
          <button
            onClick={onOpenLoadModal}
            id="btn-load"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#211e28] hover:bg-[#2b2932] text-gray-300 hover:text-white transition-all text-xs font-medium border border-white/5"
          >
            <span className="material-symbols-outlined text-sm">folder_open</span>
            <span>Cargar Fichas</span>
          </button>
          <button
            onClick={onNewSheet}
            id="btn-new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#211e28] hover:bg-[#2b2932] text-gray-300 hover:text-white transition-all text-xs font-medium border border-white/5"
          >
            <span className="material-symbols-outlined text-sm text-[var(--theme-secondary,#d0bcff)]">auto_awesome</span>
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      {/* Right: Sintonía de Clase (Class Resonance Tuning) */}
      <div className="flex flex-wrap items-center gap-3 z-10">
        <div className="flex items-center gap-1.5">
          <span className="font-runic text-xs text-gray-400 uppercase tracking-wider hidden md:inline font-bold">
            Sintonía de Clase:
          </span>
          <div className="flex items-center bg-[#1c1a24] p-1 rounded-lg gap-1 border border-white/5">
            {quickClasses.map((clsKey) => {
              const theme = CLASS_THEMES[clsKey];
              const isActive = currentClass === clsKey;
              return (
                <button
                  key={clsKey}
                  onClick={() => onSelectClass(clsKey)}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                    isActive
                      ? 'bg-[var(--theme-secondary-container,#571bc1)] text-[var(--theme-on-secondary-container,#e9ddff)] shadow-sm font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={theme.description}
                >
                  <span className="material-symbols-outlined text-xs">{theme.icon}</span>
                  <span>{theme.name.split('/')[0].trim()}</span>
                </button>
              );
            })}

            {/* "Más clases" dropdown trigger */}
            <button
              onClick={() => setShowAllClassesModal(!showAllClassesModal)}
              className="px-2 py-1 rounded text-xs font-medium text-[var(--theme-primary,#fbbf24)] hover:bg-white/10 flex items-center gap-1"
              title="Ver las 12 Clases con paletas cromáticas"
            >
              <span className="material-symbols-outlined text-xs">palette</span>
              <span>12 Clases / Sendas</span>
              <span className="material-symbols-outlined text-[10px]">expand_more</span>
            </button>
          </div>
        </div>

        {/* Elemental Accents quick pill selector: Agua (azul), Tierra (verde), Fuego (rojo) */}
        <div className="flex items-center gap-1 bg-[#1c1a24] p-1 rounded-lg border border-white/5">
          {(['neutral', 'agua', 'tierra', 'fuego'] as ElementAffinity[]).map((el) => {
            const acc = ELEMENT_ACCENTS[el];
            const isActive = currentElement === el;
            return (
              <button
                key={el}
                onClick={() => onSelectElement(el)}
                className={`p-1 px-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                  isActive
                    ? 'bg-white/10 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  color: isActive ? acc.color : undefined,
                  boxShadow: isActive ? `0 0 8px ${acc.glow}` : undefined,
                }}
                title={`Sintonía Elemental: ${acc.name}`}
              >
                <span className="material-symbols-outlined text-xs">{acc.icon}</span>
                <span className="hidden sm:inline capitalize">{el === 'neutral' ? 'Normal' : el}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full 11-Class Modal Selector */}
      {showAllClassesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1c1a24] border border-[#36333e] rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[var(--theme-primary,#fbbf24)]">palette</span>
                <div>
                  <h3 className="font-runic text-base font-bold text-white uppercase tracking-wider">
                    Sintonizador Cromático por Clase (12 Sendas)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Adapta la atmósfera visual, acentos y energía rúnica del códice
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllClassesModal(false)}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(CLASS_THEMES) as ClassKey[]).map((cKey) => {
                const item = CLASS_THEMES[cKey];
                const isSelected = currentClass === cKey;
                return (
                  <button
                    key={cKey}
                    onClick={() => {
                      onSelectClass(cKey);
                      setShowAllClassesModal(false);
                    }}
                    className={`text-left p-3 rounded-lg border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-[var(--theme-primary,#fbbf24)] bg-white/10 shadow-lg'
                        : 'border-white/5 bg-[#14121b] hover:border-white/20 hover:bg-[#211e28]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-base"
                          style={{ color: item.colors.primary }}
                        >
                          {item.icon}
                        </span>
                        <span className="font-runic text-xs font-bold text-white tracking-wide">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{ backgroundColor: item.colors.primary }}
                          title="Primario"
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{ backgroundColor: item.colors.secondary }}
                          title="Secundario"
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{ backgroundColor: item.colors.accent }}
                          title="Acento"
                        />
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 leading-snug">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
