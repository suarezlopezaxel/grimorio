import React from 'react';
import {
  Menu,
  Sparkles,
  Undo2,
  Save,
  FolderOpen,
  UserPlus,
  Dice5,
  Dices,
} from 'lucide-react';
import { CharacterSheet } from '../../types/character';
import { CLASS_THEMES } from '../../data/classThemes';

interface Props {
  character: CharacterSheet;
  onToggleMobileSidebar: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onSaveSheet: () => void;
  onOpenManageModal: () => void;
  onOpenNewCharacter: () => void;
  onOpenDiceTray: () => void;
}

export const Header: React.FC<Props> = ({
  character,
  onToggleMobileSidebar,
  onUndo,
  canUndo,
  onSaveSheet,
  onOpenManageModal,
  onOpenNewCharacter,
  onOpenDiceTray,
}) => {
  const theme = CLASS_THEMES[character.classId] || CLASS_THEMES.mago;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#1b1e2e] bg-[#0c0d16]/90 px-4 md:px-6 backdrop-blur-xl">
      {/* Left: Mobile hamburger + Character lockup */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
          aria-label="Abrir Menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Emblem icon */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg border text-sm shadow-md"
          style={{
            borderColor: theme.palette.border,
            backgroundColor: `${theme.palette.primary}20`,
            color: theme.palette.textAccent,
          }}
        >
          <Sparkles className="h-4 w-4" />
        </div>

        {/* Name, Level, Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-cinzel text-base md:text-lg font-bold tracking-wide text-zinc-100">
              {character.name || 'Héroe sin nombre'}
            </h1>
            <span
              className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border"
              style={{
                borderColor: theme.palette.primary,
                color: theme.palette.textAccent,
                backgroundColor: `${theme.palette.primary}20`,
              }}
            >
              NIVEL {character.level}
            </span>
          </div>

          <div className="text-[11px] text-zinc-400 truncate max-w-xs md:max-w-md">
            {theme.name} ({character.subclass || 'Sin subclase'}) • {character.species || 'Especie'}
          </div>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Deshacer */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#12131f] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Deshacer última acción (Ctrl+Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
          <span>Deshacer</span>
        </button>

        {/* Guardar */}
        <button
          onClick={onSaveSheet}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-stone-950 transition shadow-md cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Guardar</span>
        </button>

        {/* Fichas Pasadas */}
        <button
          onClick={onOpenManageModal}
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#12131f] px-3 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-950/40 hover:border-purple-600/40 transition cursor-pointer"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span>Fichas Pasadas</span>
        </button>

        {/* Nuevo Héroe */}
        <button
          onClick={onOpenNewCharacter}
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#12131f] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
          <span>Nuevo Héroe</span>
        </button>

        {/* Quick d20 Tray launcher */}
        <button
          onClick={onOpenDiceTray}
          className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-bold font-mono text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400 transition cursor-pointer shadow-sm"
          title="Abrir Bandeja de Dados (d4-d100)"
        >
          <Dices className="h-4 w-4 text-emerald-400" />
          <span>d20</span>
        </button>
      </div>
    </header>
  );
};
