import React, { useState } from 'react';
import { Music, Play, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
  onEmitNote?: (x: number, y: number) => void;
}

const INSTRUMENTS = [
  { id: 'laud', name: 'Laúd Élfico', icon: '🪕', description: 'Cuerdas de seda estelar con resonancia melancólica.' },
  { id: 'flauta', name: 'Flauta de Pan', icon: '🪈', description: 'Caña tallada por ninfas de arboledas feéricas.' },
  { id: 'tambor', name: 'Tambor de Guerra', icon: '🥁', description: 'Cuero curtido que retumba en el pecho de los aliados.' },
  { id: 'violin', name: 'Violín Encantado', icon: '🎻', description: 'Madera de tejo con arco de crin de pegaso.' },
] as const;

export const BardicInspirationModule: React.FC<Props> = ({ character, onUpdate, onEmitNote }) => {
  const bardData = character.classResources.bard || {
    inspirationCurrent: 4,
    inspirationMax: 4,
    die: 'd8',
    instrument: 'laud',
  };

  const [activeString, setActiveString] = useState<number | null>(null);
  const [lastSoundText, setLastSoundText] = useState<string>('♫ Acorde en Do Mayor');

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

  const restoreInspiration = () => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        bard: {
          ...bardData,
          inspirationCurrent: bardData.inspirationMax,
        },
      },
    });
  };

  const setInstrument = (id: 'laud' | 'flauta' | 'tambor' | 'violin') => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        bard: {
          ...bardData,
          instrument: id,
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
              Presiona una cuerda o gasta un dado para entonar inspiración en combate
            </p>
          </div>
        </div>

        <button
          onClick={restoreInspiration}
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/50 hover:border-amber-400 transition"
          title="Recuperar en descanso corto o largo"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Afinar / Recargar</span>
        </button>
      </div>

      {/* Playable Lute / Harp Strings */}
      <div className="my-4 rounded-xl border border-amber-500/30 bg-[#160810]/80 p-4 shadow-inner">
        <div className="flex items-center justify-between text-xs text-amber-300/80 mb-2">
          <span className="flex items-center gap-1">
            <Volume2 className="h-3.5 w-3.5 text-amber-400" /> Cuerdas del Laúd de Bardo (Púlsalas):
          </span>
          <span className="italic text-amber-400 font-mono">{lastSoundText}</span>
        </div>

        <div className="grid grid-cols-5 gap-2 h-20 items-stretch">
          {[0, 1, 2, 3, 4].map((i) => {
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
                  Nota {['I', 'II', 'III', 'IV', 'V'][i]}
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
            <span>Duración: 10 minutos</span>
          </div>
        </div>
      </div>

      {/* Musical Instrument Selector */}
      <div className="border-t border-amber-500/20 pt-3">
        <span className="text-[11px] font-medium text-amber-300/80 block mb-2 uppercase tracking-wider">
          Instrumento Melódico Sintonizado:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {INSTRUMENTS.map((inst) => {
            const isSelected = bardData.instrument === inst.id;
            return (
              <button
                key={inst.id}
                onClick={() => setInstrument(inst.id as any)}
                className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 shadow-sm'
                    : 'border-amber-500/20 bg-stone-950/40 hover:border-amber-500/40 hover:bg-stone-900/60'
                }`}
              >
                <span className="text-xl">{inst.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-amber-200 truncate">{inst.name}</div>
                  <div className="text-[10px] text-amber-200/50 truncate">{inst.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
