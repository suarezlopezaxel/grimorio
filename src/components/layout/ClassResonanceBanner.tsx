import React from 'react';
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
import { CharacterSheet, ClassId, ElementalAffinity } from '../../types/character';
import { CLASS_THEMES } from '../../data/classThemes';

interface Props {
  character: CharacterSheet;
  onUpdateClass: (classId: ClassId) => void;
  onUpdateElement: (affinity: ElementalAffinity) => void;
  onSaveSheet: () => void;
  onOpenManageModal: () => void;
  onOpenNewCharacter: () => void;
  onOpenClassSelectorModal: () => void;
}

export const ClassResonanceBanner: React.FC<Props> = ({
  character,
  onUpdateClass,
  onUpdateElement,
  onSaveSheet,
  onOpenManageModal,
  onOpenNewCharacter,
  onOpenClassSelectorModal,
}) => {
  const currentTheme = CLASS_THEMES[character.classId] || CLASS_THEMES.mago;

  const quickClasses: { id: ClassId; name: string; icon: string }[] = [
    { id: 'mago', name: 'Mago', icon: '✦' },
    { id: 'picaro', name: 'Pícaro', icon: '🗡' },
    { id: 'druida', name: 'Druida', icon: '🌿' },
    { id: 'bardo', name: 'Bardo', icon: '𝄞' },
    { id: 'barbaro', name: 'Bárbaro', icon: '🦴' },
    { id: 'guerrero', name: 'Guerrero', icon: '🛡' },
  ];

  const elements: { id: ElementalAffinity; label: string; icon: React.ReactNode }[] = [
    { id: 'normal', label: 'Normal', icon: <Sparkles className="h-3 w-3 text-amber-400" /> },
    { id: 'agua', label: 'Agua', icon: <Droplets className="h-3 w-3 text-cyan-400" /> },
    { id: 'tierra', label: 'Tierra', icon: <Mountain className="h-3 w-3 text-emerald-400" /> },
    { id: 'fuego', label: 'Fuego', icon: <Flame className="h-3 w-3 text-rose-500" /> },
  ];

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-[#232840] bg-gradient-to-r from-[#0d101d] via-[#101526] to-[#0c0f1c] p-4 shadow-xl backdrop-blur-xl">
      {/* Dynamic ambient color glow according to theme */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-25 blur-3xl transition-colors duration-500"
        style={{ backgroundColor: currentTheme.palette.primary }}
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
            onClick={onOpenManageModal}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#141726] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
          >
            <FolderOpen className="h-3.5 w-3.5 text-purple-400" />
            <span>Cargar Fichas</span>
          </button>

          <button
            onClick={onOpenNewCharacter}
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
              const isCurrent = character.classId === qc.id;
              return (
                <button
                  key={qc.id}
                  onClick={() => onUpdateClass(qc.id)}
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
              onClick={onOpenClassSelectorModal}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition cursor-pointer"
            >
              <span>🐾 12 Clases / Sendas</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Elemental Resonance */}
          <div className="flex items-center gap-1 bg-[#0b0c16]/80 p-1 rounded-xl border border-zinc-800">
            {elements.map((el) => {
              const isActive = character.elementalAffinity === el.id;
              return (
                <button
                  key={el.id}
                  onClick={() => onUpdateElement(el.id)}
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
