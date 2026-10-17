import React from 'react';
import { RotateCcw, Sparkles, Shield } from 'lucide-react';
import { ClassWidget, ClassSubBox } from '../fx/ClassStyledContainer';

interface SpellSlotsProps {
  character: any;
  onUpdate: (updated: any) => void;
}

export const SpellSlotsSection: React.FC<SpellSlotsProps> = ({ character, onUpdate }) => {
  const spellSlots = character.spellSlots ?? [];
  const isWizard = character.classId === 'mago';
  const preparedSpellCount = (character.knownSpells ?? []).filter((spell: any) => spell.prepared).length;

  const wizardLevel: number = character?.level ?? 0;

  // No se bloquea por "una vez por día": el jugador debe poder usarlo siempre.
  const canArcaneRecovery = character?.classId === 'mago';

  const computeArcaneRecoveryMax = () => {
    const half = Math.ceil(wizardLevel / 2);
    return Math.min(5, half);
  };

  const setUsedForTier = (tierIndex: number, nextUsed: number) => {
    const slot = spellSlots[tierIndex];
    if (!slot) return;
    const clamped = Math.max(0, Math.min(slot.max ?? 0, nextUsed));

    onUpdate({
      ...character,
      spellSlots: spellSlots.map((s: any, idx: number) =>
        idx === tierIndex
          ? { ...s, used: clamped, current: Math.max(0, (s.max ?? 0) - clamped) }
          : s
      ),
    });
  };

  const arcaneRecoveryRestoreSlots = () => {
    if (!canArcaneRecovery) return;

    const restoreTotal = computeArcaneRecoveryMax();
    if (restoreTotal <= 0) return;

    // Recupera desde el hechizo más bajo disponible, evitando sobrepasar el 'used'.
    let remaining = restoreTotal;

    const nextSpellSlots = spellSlots.map((slot: any) => ({ ...slot }));

    for (let tierIndex = 0; tierIndex < nextSpellSlots.length; tierIndex++) {
      if (remaining <= 0) break;
      const slot = nextSpellSlots[tierIndex];
      const max = slot.max ?? 0;
      const used = slot.used ?? 0;
      if (max <= 0) continue;

      // 'slots disponibles' para recuperar = used (casillas marcadas) hasta 0.
      const recoverable = Math.min(used, remaining);
      if (recoverable <= 0) continue;

      slot.used = Math.max(0, used - recoverable);
      slot.current = Math.max(0, (max - slot.used));
      remaining -= recoverable;
    }

    onUpdate({
      ...character,
      spellSlots: nextSpellSlots,
      classResources: {
        ...character.classResources,
        wizard: {
          ...(character.classResources?.wizard ?? { arcaneRecoveryUsed: false, spellbookCurrentPage: 1 }),
        // No se bloquea por día: no tocamos arcaneRecoveryUsed
        arcaneRecoveryUsed: (character.classResources?.wizard?.arcaneRecoveryUsed ?? false),
      },
      },
    });
  };

  if (isWizard) {
    return (
      <ClassWidget classId={character.classId} className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 mb-4 px-1">
          <h3 className="font-cinzel text-sm font-bold uppercase tracking-wide text-indigo-50 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-200" />
            Espacios de Conjuro
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-100/80 whitespace-nowrap">
              {preparedSpellCount} Preparados
            </span>
            {canArcaneRecovery && (
              <button
                type="button"
                onClick={arcaneRecoveryRestoreSlots}
                className="rounded-md border border-indigo-400/40 bg-indigo-950/50 p-1.5 text-indigo-200 hover:bg-indigo-900/70 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={computeArcaneRecoveryMax() <= 0}
                title="Recuperación Arcana: recupera espacios de hechizo"
                aria-label="Recuperación Arcana"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 px-1">
          {spellSlots.map((slot: any, tierIndex: number) => {
            if ((slot.max ?? 0) <= 0) return null;
            const tier = slot.level ?? slot.tier ?? tierIndex + 1;
            const used = slot.used ?? 0;
            const available = Math.max(0, (slot.max ?? 0) - used);

            return (
              <ClassSubBox
                key={tier}
                classId={character.classId}
                className="px-3 py-2.5 flex flex-col gap-1.5"
              >
                <div className="font-cinzel text-[11px] font-semibold uppercase tracking-wide text-indigo-100">
                  Nivel {tier} ({available} / {slot.max})
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: slot.max ?? 0 }, (_, i) => {
                    const isAvailable = i >= used;
                    return (
                      <label
                        key={i}
                        className={
                          'cursor-pointer select-none h-4 w-4 rounded-full border transition ' +
                          (isAvailable
                            ? 'border-indigo-300 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.65)]'
                            : 'border-indigo-300/50 bg-indigo-950/70')
                        }
                        title={isAvailable ? 'Disponible' : 'Gastado'}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={!isAvailable}
                          onChange={() =>
                            setUsedForTier(
                              tierIndex,
                              isAvailable ? used + 1 : used - 1
                            )
                          }
                        />
                      </label>
                    );
                  })}
                </div>
              </ClassSubBox>
            );
          })}
        </div>
      </ClassWidget>
    );
  }

  if (character.classId === 'druida') {
    return (
      <ClassWidget classId={character.classId} className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 mb-4 px-1">
          <h3 className="font-cinzel text-sm font-bold text-emerald-200 flex items-center gap-2">
            <span aria-hidden="true">🌱</span>
            Espacios de Hechizo Primordiales
          </h3>
          <span className="text-[11px] text-emerald-200/70 italic">
            Brotes Florales
          </span>
        </div>

        <div className="flex flex-col gap-2 px-1">
          {spellSlots.map((slot: any, tierIndex: number) => {
            if ((slot.max ?? 0) <= 0) return null;
            const tier = slot.level ?? slot.tier ?? tierIndex + 1;
            const used = slot.used ?? 0;
            const available = Math.max(0, (slot.max ?? 0) - used);

            return (
              <ClassSubBox
                key={tier}
                classId={character.classId}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <span className="text-xs font-semibold text-emerald-200 whitespace-nowrap">
                  Nivel {tier} ({available} / {slot.max})
                </span>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {Array.from({ length: slot.max ?? 0 }, (_, i) => {
                    const isAvailable = i >= used;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setUsedForTier(
                            tierIndex,
                            isAvailable ? used + 1 : used - 1
                          )
                        }
                        className={
                          'group flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ' +
                          (isAvailable
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 hover:scale-110 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                            : 'border-amber-900/60 bg-stone-900/80 text-amber-800/60 hover:border-amber-700')
                        }
                        title={
                          isAvailable
                            ? 'Espacio disponible (Florecido)'
                            : 'Espacio gastado (Marchito)'
                        }
                        aria-label={`Nivel ${tier}, espacio ${i + 1}: ${isAvailable ? 'disponible' : 'gastado'}`}
                      >
                        <span className="select-none text-sm transition-transform group-hover:rotate-12" aria-hidden="true">
                          {isAvailable ? '🌸' : '🍂'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ClassSubBox>
            );
          })}
        </div>
      </ClassWidget>
    );
  }

  return (
    <ClassWidget classId={character.classId} className="p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-cinzel text-sm font-bold">Espacios de Hechizo</h3>
        {canArcaneRecovery && (
          <button
            type="button"
            onClick={arcaneRecoveryRestoreSlots}
            className={
              'px-2.5 py-1 rounded-lg border text-[11px] font-semibold ' +
              'border-emerald-400/50 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/40 cursor-pointer'
            }
            disabled={computeArcaneRecoveryMax() <= 0}
            title={'Recupera espacios de hechizo (D. Corto)'}
          >
            Recup. Arcana 1/1
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap" style={{ marginTop: 8 }}>

        {spellSlots.map((slot: any, tierIndex: number) => (
          <ClassSubBox
            key={slot.tier ?? tierIndex}
            classId={character.classId}
            className="px-2.5 py-2 text-[11px] font-semibold flex flex-col gap-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span>Nivel {slot.tier}</span>
              <span className="text-gray-200">{Math.max(0, (slot.max ?? 0) - (slot.used ?? 0))}/{slot.max}</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {Array.from({ length: slot.max ?? 0 }, (_, index) => {
                const max = slot.max ?? 0;
                const used = slot.used ?? 0;
                // De derecha a izquierda: los primeros índices (desde el final) se gastan primero
                const i = max - 1 - index;
                const checked = i < used;
                const isPaladin = character?.classId === 'paladin';
                const isSorcerer = character?.classId === 'hechicero';
                return (
                  <label
                    key={i}
                    className={
                      `cursor-pointer select-none w-6 h-6 rounded border flex items-center justify-center relative transition-all duration-300 ` +
                      (isPaladin
                        ? (!checked
                            ? 'border-cyan-300 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.85)] scale-105'
                            : 'border-cyan-900/60 bg-stone-900/60 text-cyan-700/60 hover:border-cyan-700')
                        : isSorcerer
                        ? (!checked
                            ? 'border-red-400 bg-red-950/40 text-red-300 shadow-[0_0_12px_rgba(248,113,113,0.85)] scale-105'
                            : 'border-red-950/60 bg-stone-900/60 text-red-900/60 hover:border-red-700')
                        : (!checked
                            ? 'border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.85)]'
                            : 'bg-transparent border-gray-700'))
                    }
                    title={checked ? 'Gastado' : 'Disponible'}
                    aria-label={checked ? 'Gastado' : 'Disponible'}
                  >
                    {isPaladin ? (
                      <Shield className={`w-3.5 h-3.5 transition-transform ${!checked ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]' : 'opacity-40'}`} />
                    ) : isSorcerer ? (
                      <svg className={`w-3.5 h-3.5 transition-transform ${!checked ? 'drop-shadow-[0_0_8px_rgba(248,113,113,0.9)] text-red-300' : 'text-red-900/60 opacity-40'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    ) : null}

                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={() => {
                        // Al hacer click en el slot i (de derecha a izquierda), queremos que 'used' pase a ser i + 1 (si no estaba gastado) o i (si ya estaba gastado)
                        const targetUsed = checked ? i : i + 1;
                        setUsedForTier(tierIndex, targetUsed);
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </ClassSubBox>
        ))}
      </div>
    </ClassWidget>
  );
};