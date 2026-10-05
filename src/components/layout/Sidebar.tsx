import React from 'react';
import {
  Shield,
  Swords,
  Layers,
  FileEdit,
  FolderOpen,
  UserPlus,
  Save,
  Check,
  Sparkles,
  Dice5,
} from 'lucide-react';
import { CharacterSheet } from '../../types/character';

export type ActiveTab = 'sheet' | 'combat' | 'grimoire' | 'creator';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onSaveSheet: () => void;
  onOpenManageModal: () => void;
  onOpenNewCharacter: () => void;
  isSavedJustNow: boolean;
  character: CharacterSheet;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onSaveSheet,
  onOpenManageModal,
  onOpenNewCharacter,
  isSavedJustNow,
  character,
}) => {
  const navItems: { id: ActiveTab; label: string; roman: string; icon: React.ReactNode }[] = [
    { id: 'sheet', label: 'Hoja de Personaje', roman: 'I', icon: <Shield className="h-5 w-5" /> },
    { id: 'combat', label: 'Turno de Combate', roman: 'II', icon: <Swords className="h-5 w-5" /> },
    { id: 'grimoire', label: 'Grimorio de Tarjetas', roman: 'III', icon: <Layers className="h-5 w-5" /> },
    { id: 'creator', label: 'Creador de Personaje', roman: 'IV', icon: <FileEdit className="h-5 w-5" /> },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-30 flex w-72 flex-col justify-between border-r border-[#1e2235] bg-[#0c0d16]/95 backdrop-blur-xl transition-all duration-300">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#1e2235] px-5 py-4">
          <div className="flex items-center gap-3">
            {/* SVG d20 Logo */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600/30 to-purple-600/30 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-400 fill-emerald-500/20 stroke-current" strokeWidth="1.6">
                <polygon points="12 2, 22 8.5, 22 15.5, 12 22, 2 15.5, 2 8.5" />
                <polyline points="2 8.5, 12 14, 22 8.5" />
                <polyline points="12 14, 12 22" />
                <polyline points="2 8.5, 12 2, 22 8.5" />
              </svg>
            </div>

            <div>
              <div className="font-cinzel text-sm font-bold tracking-wider text-emerald-400">
                GRIMORIO
              </div>
              <div className="text-[11px] font-mono text-zinc-400">Arcanum v5.2</div>
            </div>
          </div>

          {/* Pulsing jewel socket */}
          <div className="jewel-socket h-4 w-4 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-800 gem-pulse" />
        </div>

        {/* Navigation Section: Códice Principal */}
        <div className="px-4 py-5">
          <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-cinzel">
            Códice Principal
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-900/60 to-purple-800/40 text-purple-100 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                      : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 hover:border hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? 'text-purple-300' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                      {item.icon}
                    </span>
                    <span className="font-sans text-xs tracking-wide">{item.label}</span>
                  </div>
                  <span className="font-cinzel text-xs font-bold text-zinc-500 group-hover:text-purple-300">
                    {item.roman}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Hero Management Section (Bottom) */}
      <div className="border-t border-[#1e2235] p-4 space-y-2.5 bg-[#090a10]/80">
        <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-cinzel">
          <span>Gestión de Héroes</span>
          <Dice5 className="h-3.5 w-3.5 text-zinc-600" />
        </div>

        {/* Guardar Ficha button */}
        <button
          onClick={onSaveSheet}
          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer shadow-lg ${
            isSavedJustNow
              ? 'bg-emerald-500 text-stone-950 shadow-emerald-500/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 shadow-emerald-950/40 hover:brightness-105'
          }`}
        >
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>Guardar Ficha</span>
          </div>
          {isSavedJustNow ? <Check className="h-4 w-4 stroke-[3]" /> : <Check className="h-4 w-4 opacity-75" />}
        </button>

        <div className="grid grid-cols-2 gap-2">
          {/* Fichas Pasadas */}
          <button
            onClick={onOpenManageModal}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#12131e] px-2 py-2.5 text-[11px] font-semibold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition cursor-pointer"
          >
            <FolderOpen className="h-3.5 w-3.5 text-purple-400" />
            <span>Fichas</span>
          </button>

          {/* Crear Nuevo */}
          <button
            onClick={onOpenNewCharacter}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#12131e] px-2 py-2.5 text-[11px] font-semibold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
            <span>Crear Nuevo</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
