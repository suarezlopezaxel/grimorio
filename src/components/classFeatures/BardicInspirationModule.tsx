import React, { useState } from 'react';
import { Music, Volume2, Sparkles } from 'lucide-react';
import { CharacterSheet } from '../../types/character';
import { getEffectiveAbilityScore } from '../../lib/itemEffects';
import { normalizeBardicInspiration } from '../../lib/bardicInspiration';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onEmitNote?: (x: number, y: number) => void;
}

export const BardicInspirationModule: React.FC<Props> = ({ character, onUpdate, onEmitNote }) => {
  const bardData = normalizeBardicInspiration(
    character.classResources.bard,
    character.level,
    getEffectiveAbilityScore(character.cards, 'CAR', character.abilities.CAR.score),
  );
  const instruments = character.cards.filter((card) => {
    if (card.category !== 'item' || (card.item?.kind !== 'gear' && card.item?.kind !== 'magic')) return false;
    const searchableText = [card.name, card.title, card.description, ...(card.tags ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();
    return /instrument|la[uú]d|flauta|tambor|viol[ií]n|lira|arpa|gaita|zampoña/.test(searchableText);
  });

  const [activeString, setActiveString] = useState<number | null>(null);
  const [lastSoundText, setLastSoundText] = useState<string>('♫ Acorde en Do Mayor');
  const availableSpellSlots = character.spellSlots
    .map((slot, index) => {
      const slotWithTier = slot as typeof slot & { tier?: number; current?: number };
      const level = slot.level ?? slotWithTier.tier ?? index + 1;
      const used = slot.used ?? Math.max(0, slot.max - (slotWithTier.current ?? slot.max));
      return { slot, index, level, used, available: Math.max(0, slot.max - used) };
    })
    .filter((slot) => slot.available > 0)
    .sort((a, b) => a.level - b.level);
  const [selectedSlotLevel, setSelectedSlotLevel] = useState<number | null>(
    availableSpellSlots[0]?.level ?? null,
  );
  const selectedSlot = availableSpellSlots.find((slot) => slot.level === selectedSlotLevel)
    ?? availableSpellSlots[0];

  const strumString = (index: number, e: React.MouseEvent) => {
    setActiveString(index);
    if (onEmitNote) {
      onEmitNote(e.clientX, e.clientY);
    }
    const notes = ['♪ Re celestial', '♫ Fa místico', '♬ La triunfal', '♩ Do armónico', '♫ Mi crepuscular'];
    setLastSoundText(notes[index % notes.length]);

    setTimeout(() => {
      setActiveString(null);
    }, 450);
  };

  const spendInspiration = (e: React.MouseEvent) => {
    if (bardData.inspirationCurrent <= 0) return;
    const newCurrent = bardData.inspirationCurrent - 1;
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        bard: {
          ...bardData,
          inspirationCurrent: newCurrent,
        },
      },
    });
    strumString(bardData.inspirationCurrent - 1, e);
  };

  const recoverInspirationWithSlot = () => {
    if (
      character.level < 5
      || bardData.inspirationCurrent >= bardData.inspirationMax
    ) return;

    if (!selectedSlot) return;

    onUpdate({
      ...character,
      spellSlots: character.spellSlots.map((slot, index) => index === selectedSlot.index
        ? {
            ...slot,
            used: selectedSlot.used + 1,
            ...( 'current' in slot && typeof slot.current === 'number'
              ? { current: Math.max(0, slot.current - 1) }
              : {}),
          }
        : slot),
      classResources: {
        ...character.classResources,
        bard: {
          ...bardData,
          inspirationCurrent: bardData.inspirationCurrent + 1,
        },
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-[#260e18]/90 via-[#1a0a12]/95 to-[#2c1320]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Musical Staff Watermark Lines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-around h-16 opacity-15">
        <div className="border-b border-amber-300" />
        <div className="border-b border-amber-300" />
        <div className="border-b border-amber-300" />
        <div className="border-b border-amber-300" />
        <div className="border-b border-amber-300" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-400/50 bg-amber-500/10 text-amber-300 shadow-inner">
            <span className="text-xl">𝄞</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-amber-200 tracking-wide">
                Inspiración de Bardo ({bardData.die})
              </h3>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                {bardData.inspirationCurrent} / {bardData.inspirationMax} Disponibles
              </span>
            </div>
            <p className="text-xs text-amber-200/70">
              Acción adicional: inspira a una criatura que pueda oírte a 60 pies o menos.
            </p>
          </div>
        </div>

        {character.level >= 5 && (
          <div className="flex items-center gap-2">
            <select
              aria-label="Espacio de conjuro para recuperar Inspiración Bárdica"
              value={selectedSlot?.level ?? ''}
              onChange={(event) => setSelectedSlotLevel(Number(event.target.value))}
              disabled={availableSpellSlots.length === 0}
              className="rounded-lg border border-amber-500/30 bg-amber-950/60 px-2 py-1.5 text-xs text-amber-200 disabled:opacity-40"
            >
              {availableSpellSlots.length === 0
                ? <option value="">Sin espacios disponibles</option>
                : availableSpellSlots.map(({ level, available }, index) => (
                    <option key={`${level}-${index}`} value={level}>
                      Espacio de nivel {level} ({available} disponible{available === 1 ? '' : 's'})
                    </option>
                  ))}
            </select>
            <button
              onClick={recoverInspirationWithSlot}
              disabled={
                bardData.inspirationCurrent >= bardData.inspirationMax
                || !selectedSlot
              }
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/50 hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-40 transition"
              title={
                bardData.inspirationCurrent >= bardData.inspirationMax
                  ? 'Ya tienes todos tus usos de Inspiración Bárdica.'
                  : selectedSlot
                  ? `Gasta un espacio de nivel ${selectedSlot.level} para recuperar un uso.`
                  : 'No tienes espacios de conjuro disponibles.'
              }
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recuperar uso</span>
            </button>
          </div>
        )}
      </div>

      {/* Playable Lute / Harp Strings */}
      <div className="my-4 rounded-xl border border-amber-500/30 bg-[#160810]/80 p-4 shadow-inner">
        <div className="flex items-center justify-between text-xs text-amber-300/80 mb-2">
          <span className="flex items-center gap-1">
            <Volume2 className="h-3.5 w-3.5 text-amber-400" /> Acordes musicales (Púlsalos):
          </span>
          <span className="italic text-amber-400 font-mono">{lastSoundText}</span>
        </div>

        <div className="grid grid-cols-5 gap-2 h-20 items-stretch">
          {Array.from({ length: bardData.inspirationMax }, (_, i) => {
            const isAvailable = i < bardData.inspirationCurrent;
            const isStrummed = activeString === i;
            return (
              <button
                key={i}
                onClick={(e) => strumString(i, e)}
                className={`group relative flex flex-col items-center justify-between rounded-lg border transition-all duration-150 overflow-hidden cursor-pointer ${
                  isStrummed
                    ? 'border-amber-300 bg-amber-400/30 scale-95 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                    : isAvailable
                    ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/30 via-[#2a101b] to-amber-950/40 hover:border-amber-400 hover:bg-amber-500/20'
                    : 'border-zinc-800 bg-zinc-900/40 opacity-40'
                }`}
              >
                {/* Lute string wire */}
                <div
                  className={`w-0.5 h-full absolute top-0 left-1/2 -translate-x-1/2 transition-all ${
                    isStrummed
                      ? 'bg-amber-200 shadow-[0_0_8px_#fde047]'
                      : isAvailable
                      ? 'bg-amber-400/70 group-hover:bg-amber-300'
                      : 'bg-zinc-700'
                  }`}
                />
                <span className="relative z-10 text-[10px] font-mono text-amber-400/90 pt-1">
                  Nota {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][i] ?? i + 1}
                </span>
                <span className="relative z-10 text-xs pb-1 font-bold text-amber-200">
                  {isAvailable ? '♪' : '—'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={spendInspiration}
            disabled={bardData.inspirationCurrent <= 0}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              bardData.inspirationCurrent > 0
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md hover:from-amber-400 hover:to-amber-500 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Otorgar Inspiración (+{bardData.die})
          </button>

          <div className="flex items-center gap-1.5 text-xs text-amber-200/60 font-serif">
            <span>Rango: 60 pies</span>
            <span>•</span>
            <span>Tras fallar prueba, ataque o salvación; 1 hora para usarlo</span>
          </div>
        </div>
      </div>

      <div className="border-t border-amber-500/20 pt-3">
        <span className="text-[11px] font-medium text-amber-300/80 block mb-2 uppercase tracking-wider">
          Instrumentos en tus tarjetas de objeto:
        </span>
        {instruments.length === 0 ? (
          <p className="rounded-lg border border-amber-500/20 bg-stone-950/40 p-3 text-xs text-amber-200/60">
            Aún no hay instrumentos. Añade una tarjeta de objeto tipo Equipo y etiquétala como «instrumento».
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {instruments.map((instrument) => (
              <div
                key={instrument.id}
                className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-stone-950/40 p-2"
              >
                <Music className="h-5 w-5 shrink-0 text-amber-300" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-amber-200">{instrument.name || instrument.title}</div>
                  <div className="truncate text-[10px] text-amber-200/50">
                    {instrument.item?.quantity ?? 1} en el inventario
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
