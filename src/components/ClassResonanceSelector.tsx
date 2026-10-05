import React, { useState } from 'react';
import {
  Save,
  FolderOpen,
  PlusCircle,
  Sparkles,
  Droplets,
  Mountain,
  Flame,
  ChevronDown,
} from 'lucide-react';
import { ClassKey, ElementAffinity } from '../types';
import { CLASS_THEMES } from '../themes';

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

  const quickClasses: { id: ClassKey; name: string; icon: string }[] = [
    { id: 'mago', name: 'Mago', icon: '✦' },
    { id: 'picaro', name: 'Pícaro', icon: '🗡' },
    { id: 'druida', name: 'Druida', icon: '🌿' },
    { id: 'bardo', name: 'Bardo', icon: '𝄞' },
  ];

  const elements: { id: ElementAffinity; label: string; icon: React.ReactNode }[] = [
    { id: 'neutral', label: 'Normal', icon: <Sparkles className="h-3 w-3 text-amber-400" /> },
    { id: 'agua', label: 'Agua', icon: <Droplets className="h-3 w-3 text-cyan-400" /> },
    { id: 'tierra', label: 'Tierra', icon: <Mountain className="h-3 w-3 text-emerald-400" /> },
    { id: 'fuego', label: 'Fuego', icon: <Flame className="h-3 w-3 text-rose-500" /> },
  ];

  const currentTheme = CLASS_THEMES[currentClass];

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-[#232840] bg-gradient-to-r from-[#0d101d] via-[#101526] to-[#0c0f1c] p-4 shadow-xl backdrop-blur-xl">
      {/* Dynamic ambient color glow according to theme */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-25 blur-3xl transition-colors duration-500"
        style={{ backgroundColor: currentTheme.primary }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Active Profile Badge & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="tracking-wide">PERFIL ACTIVO</span>
          </div>

          <button
            onClick={onSaveSheet}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-600/40 bg-[#0f1d18] px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 transition cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 text-emerald-400" />
            <span>Guardar Ficha</span>
          </button>

          <button
            onClick={onOpenLoadModal}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#141726] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
          >
            <FolderOpen className="h-3.5 w-3.5 text-purple-400" />
            <span>Cargar Fichas</span>
          </button>

          <button
            onClick={onNewSheet}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#141726] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Nuevo</span>
          </button>
        </div>

        {/* Right: Sintonía de Clase & Afinidades */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 font-cinzel">
            <span>Sintonía de Clase:</span>
          </div>

          {/* Quick 4 classes */}
          <div className="flex items-center gap-1 bg-[#0b0c16]/80 p-1 rounded-xl border border-zinc-800">
            {quickClasses.map((qc) => {
              const isCurrent = currentClass === qc.id;
              return (
                <button
                  key={qc.id}
                  onClick={() => onSelectClass(qc.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                    isCurrent
                      ? 'bg-zinc-800 text-white font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-xs">{qc.icon}</span>
                  <span>{qc.name}</span>
                </button>
              );
            })}

            {/* 12 Clases / Sendas Dropdown Launcher */}
            <button
              onClick={() => setShowAllClassesModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition cursor-pointer"
            >
              <span>🐾 12 Clases / Sendas</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Elemental Resonance */}
          <div className="flex items-center gap-1 bg-[#0b0c16]/80 p-1 rounded-xl border border-zinc-800">
            {elements.map((el) => {
              const isActive = currentElement === el.id;
              return (
                <button
                  key={el.id}
                  onClick={() => onSelectElement(el.id)}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {el.icon}
                  <span className="hidden sm:inline">{el.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-high)] text-gray-300 hover:text-white transition-all text-xs font-medium border border-[var(--theme-surface-high)]"
          >
            <span className="material-symbols-outlined text-sm text-[var(--theme-secondary)]">auto_awesome</span>
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
          <div className="flex items-center bg-transparent p-1 rounded-lg gap-1 border border-white/5">
            {quickClasses.map((clsKey) => {
              const theme = CLASS_THEMES[clsKey];
              const isActive = currentClass === clsKey;
              return (
                <button
                  key={clsKey}
                  onClick={() => onSelectClass(clsKey)}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                    isActive
                      ? 'bg-[var(--theme-secondary-container)] text-[var(--theme-on-secondary-container)] shadow-sm font-semibold'
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
              className="px-2 py-1 rounded text-xs font-medium text-[var(--theme-primary)] hover:bg-white/10 flex items-center gap-1"
              title="Ver las 12 Clases con paletas cromáticas"
            >
              <span className="material-symbols-outlined text-xs">palette</span>
              <span>12 Clases / Sendas</span>
              <span className="material-symbols-outlined text-[10px]">expand_more</span>
            </button>
          </div>
        </div>

        {/* Elemental Accents quick pill selector: Agua (azul), Tierra (verde), Fuego (rojo) */}
        <div className="flex items-center gap-1 bg-transparent p-1 rounded-lg border border-white/5">
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
          <div className="themed-panel bg-transparent border border-[var(--theme-surface-high)] rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[var(--theme-primary)]">palette</span>
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
                        ? 'border-[var(--theme-primary)] bg-white/10 shadow-lg'
                        : 'border-[var(--theme-surface-high)] bg-[var(--theme-surface-low)] hover:border-white/20 hover:bg-[var(--theme-surface)]'
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
