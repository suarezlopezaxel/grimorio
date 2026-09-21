import React from 'react';
import { CharacterSheet } from '../types';

interface HeaderProps {
  character: CharacterSheet;
  onOpenMobileMenu: () => void;
  onTriggerQuickRoll: () => void;
  onSaveSheet: () => void;
  onOpenLoadModal: () => void;
  onNewSheet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  character,
  onOpenMobileMenu,
  onTriggerQuickRoll,
  onSaveSheet,
  onOpenLoadModal,
  onNewSheet,
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-[#14121b]/90 backdrop-blur-xl z-30 border-b border-white/5 arcane-vignette flex items-center justify-between px-4 lg:px-6 shadow-md">
      {/* Left: Mobile trigger & Character title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-[#211e28] text-gray-300 hover:text-white"
          title="Abrir Menú"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        {/* Small Emblem */}
        <div className="hidden sm:flex w-8 h-8 rounded bg-[#1c1a24] items-center justify-center border border-[var(--theme-primary,#fbbf24)]/20 text-[var(--theme-primary,#fbbf24)]">
          <span className="material-symbols-outlined text-lg">auto_awesome</span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-garamond text-lg lg:text-xl text-white font-semibold tracking-wide truncate">
              {character.name || 'Héroe Sin Nombre'}
            </span>
            <span className="jewel-socket px-2 py-0.5 rounded bg-[#2b2932] font-runic text-[10px] text-[var(--theme-primary,#fbbf24)] font-bold border border-white/5 shrink-0">
              NIVEL {character.level}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium truncate max-w-[180px] sm:max-w-xs md:max-w-md">
            {character.characterClass} / {character.subclass || 'Sin subclase'} • {character.race}
          </span>
        </div>
      </div>

      {/* Right: Quick Actions & Management */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Guardar Ficha button */}
        <button
          onClick={onSaveSheet}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs hover:brightness-110 shadow-sm transition-all active:scale-95"
          title="Guardar la ficha del personaje"
        >
          <span className="material-symbols-outlined text-sm font-bold">save</span>
          <span className="hidden sm:inline">Guardar</span>
        </button>

        {/* Fichas Pasadas button */}
        <button
          onClick={onOpenLoadModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#211e28] hover:bg-[#2b2932] border border-white/10 text-gray-200 text-xs font-medium transition-all"
          title="Usar fichas de personaje pasadas"
        >
          <span className="material-symbols-outlined text-sm text-[var(--theme-secondary,#d0bcff)]">folder_shared</span>
          <span className="hidden md:inline">Fichas Pasadas</span>
        </button>

        {/* Crear Personaje button */}
        <button
          onClick={onNewSheet}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#211e28] hover:bg-[#2b2932] border border-white/10 text-gray-200 text-xs font-medium transition-all"
          title="Crear un personaje nuevo"
        >
          <span className="material-symbols-outlined text-sm text-emerald-400">person_add</span>
          <span className="hidden md:inline">Nuevo Héroe</span>
        </button>

        {/* Quick D20 Roll button */}
        <button
          onClick={onTriggerQuickRoll}
          className="p-2 rounded-lg bg-[#211e28] hover:bg-[#2b2932] border border-white/5 text-[var(--theme-primary,#fbbf24)] hover:brightness-125 transition-all shadow-sm flex items-center gap-1.5 text-xs font-medium"
          title="Tirar dado d20"
        >
          <span className="material-symbols-outlined text-base">casino</span>
          <span className="hidden xl:inline">d20</span>
        </button>
      </div>
    </header>
  );
};
