import React, { useState } from 'react';
import { BookOpen, Sparkles, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
}

export const WizardSpellbookModule: React.FC<Props> = ({ character, onUpdate }) => {
  const wizardData = character.classResources.wizard || {
    arcaneRecoveryUsed: false,
    spellbookCurrentPage: 1,
  };

  const [page, setPage] = useState(wizardData.spellbookCurrentPage || 1);

  const useArcaneRecovery = () => {
    if (wizardData.arcaneRecoveryUsed) return;
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        wizard: {
          ...wizardData,
          arcaneRecoveryUsed: true,
        },
      },
    });
  };

  const restoreRecovery = () => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        wizard: {
          ...wizardData,
          arcaneRecoveryUsed: false,
        },
      },
    });
  };

  const totalPages = Math.max(1, Math.ceil(character.knownSpells.length / 2));
  const displayedSpells = character.knownSpells.slice((page - 1) * 2, page * 2);

  return (
    <div className="relative overflow-hidden rounded-xl border border-indigo-500/40 bg-gradient-to-br from-[#12162a]/90 via-[#0c0e1c]/95 to-[#1a203a]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Arcane seal watermark */}
      <div className="pointer-events-none absolute right-4 -bottom-4 text-indigo-400/10 text-8xl font-mono select-none">
        🜛
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/50 bg-indigo-500/20 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-indigo-100 tracking-wide">
                Grimorio & Recuperación Arcana
              </h3>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-200 border border-indigo-500/30">
                Pág. {page} / {totalPages}
              </span>
            </div>
            <p className="text-xs text-indigo-200/70">
              Recupera hasta <strong className="text-indigo-200">{Math.ceil(character.level / 2)}</strong> niveles de espacios de conjuro en un descanso corto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={useArcaneRecovery}
            disabled={wizardData.arcaneRecoveryUsed}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              !wizardData.arcaneRecoveryUsed
                ? 'border border-indigo-400 bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/50 shadow-sm cursor-pointer'
                : 'border border-zinc-800 bg-zinc-900/50 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{!wizardData.arcaneRecoveryUsed ? 'Usar Recup. Arcana' : 'Usada Hoy'}</span>
          </button>

          <button
            onClick={restoreRecovery}
            className="flex items-center gap-1 rounded-lg border border-indigo-800/40 bg-indigo-950/40 px-2.5 py-1.5 text-xs text-indigo-300 hover:bg-indigo-900/50"
            title="Recargar en descanso largo"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Spellbook Page Flipper */}
      <div className="my-3 rounded-xl border border-indigo-500/30 bg-[#0d1020]/90 p-4 shadow-inner">
        <div className="flex items-center justify-between mb-3 text-xs text-indigo-300 font-cinzel">
          <span>📜 Fórmulas Arcanas del Códice:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1 rounded hover:bg-indigo-950 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-indigo-200">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded hover:bg-indigo-950 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedSpells.map((sp) => (
            <div key={sp.id} className="rounded-lg border border-indigo-800/40 bg-indigo-950/30 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-cinzel text-xs font-bold text-indigo-200">{sp.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {sp.level === 0 ? 'Truco' : `Nivel ${sp.level}`}
                </span>
              </div>
              <div className="text-[11px] text-indigo-300/60 mb-1.5">
                {sp.school} • {sp.castTime} • {sp.range}
              </div>
              <p className="text-[11px] text-indigo-200/80 line-clamp-2">{sp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
