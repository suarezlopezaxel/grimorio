import React from 'react';
import { ScreenId, ClassKey } from '../types';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  currentClass: ClassKey;
  onSelectClass: (c: ClassKey) => void;
  onSaveSheet: () => void;
  onOpenLoadModal: () => void;
  onNewSheet: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  currentClass,
  onSelectClass,
  onSaveSheet,
  onOpenLoadModal,
  onNewSheet,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: ScreenId; label: string; icon: string; roman: string }[] = [
    { id: 'hoja-de-personaje', label: 'Hoja de Personaje', icon: 'shield_person', roman: 'I' },
    { id: 'turno-de-combate', label: 'Turno de Combate', icon: 'swords', roman: 'II' },
    { id: 'grimorio-de-tarjetas', label: 'Grimorio de Tarjetas', icon: 'style', roman: 'III' },
    { id: 'creador-de-personaje', label: 'Creador de Personaje', icon: 'edit_document', roman: 'IV' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#0f0d16] z-50 flex flex-col justify-between border-r border-white/5 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Header Brand */}
          <div className="h-20 px-4 flex items-center justify-between bg-[#1c1a24]/40 border-b border-white/5">
            <div className="flex items-center gap-3">
              {/* D20 Arcane Rune Emblem */}
              <div className="w-9 h-9 rounded-lg bg-[#211e28] flex items-center justify-center border border-[var(--theme-primary,#fbbf24)]/30 shadow-[0_0_12px_rgba(251,191,36,0.2)]">
                <svg className="w-6 h-6 text-[var(--theme-primary,#fbbf24)]" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="12,2 17,9 7,9" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <polygon points="7,9 12,22 17,9" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
                  <circle cx="12" cy="11.5" r="2.5" fill="currentColor" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-runic text-xs text-[var(--theme-primary,#fbbf24)] tracking-widest uppercase font-bold">
                  Grimorio
                </span>
                <span className="text-[11px] text-[var(--theme-secondary,#d0bcff)] font-medium">
                  Arcanum v5.2
                </span>
              </div>
            </div>

            {/* Pulsing jewel socket */}
            <div className="jewel-socket w-5 h-5 rounded-full bg-[#2b2932] flex items-center justify-center border border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-secondary,#d0bcff)] gem-pulse"></div>
            </div>
          </div>

          {/* Section: Códice Principal */}
          <div className="px-4 pt-4 pb-1">
            <span className="font-runic text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Códice Principal
            </span>
          </div>

          <nav className="flex flex-col gap-1.5 px-3 mt-1">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-[var(--theme-secondary-container,#571bc1)] text-[var(--theme-on-secondary-container,#ffffff)] font-semibold shadow-[0_0_14px_rgba(87,27,193,0.35)] border border-[var(--theme-secondary,#d0bcff)]/30'
                      : 'text-gray-300 hover:bg-[#211e28] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        isActive ? 'text-[var(--theme-primary,#fbbf24)]' : 'text-gray-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-garamond text-base tracking-wide font-medium">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-runic text-xs text-gray-400 font-bold">{item.roman}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Runas de Gestión */}
        <div className="flex flex-col p-3 gap-2 bg-[#1c1a24]/50 border-t border-white/5">
          <div className="px-1 flex items-center justify-between">
            <span className="font-runic text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Gestión de Héroes
            </span>
            <span className="material-symbols-outlined text-gray-500 text-sm">token</span>
          </div>

          {/* Botón Guardar Ficha */}
          <button
            onClick={onSaveSheet}
            className="flex items-center justify-between w-full px-3.5 py-2 rounded-lg bg-[var(--theme-primary,#fbbf24)] text-[#261a00] font-bold text-xs transition-all hover:brightness-110 shadow-[0_0_14px_rgba(251,191,36,0.3)] active:scale-98"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">save</span>
              <span>Guardar Ficha</span>
            </div>
            <span className="material-symbols-outlined text-sm">check_circle</span>
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            {/* Botón Fichas Pasadas */}
            <button
              onClick={onOpenLoadModal}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#211e28] text-gray-200 text-xs hover:bg-[#2b2932] hover:text-white transition-colors border border-white/10 font-medium"
              title="Usar fichas de personaje pasadas"
            >
              <span className="material-symbols-outlined text-sm text-[var(--theme-secondary,#d0bcff)]">folder_shared</span>
              <span>Fichas Pasadas</span>
            </button>

            {/* Botón Crear Personaje Nuevo */}
            <button
              onClick={onNewSheet}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#211e28] text-gray-200 text-xs hover:bg-[#2b2932] hover:text-white transition-colors border border-white/10 font-medium"
              title="Crear un nuevo personaje"
            >
              <span className="material-symbols-outlined text-sm text-emerald-400">person_add</span>
              <span>Crear Nuevo</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
