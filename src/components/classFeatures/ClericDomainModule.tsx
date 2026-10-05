import React from 'react';
import { Sun, Sparkles, Shield, Zap, Flame, RotateCcw } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
}

const DOMAINS = [
  { id: 'vida', name: 'Dominio de la Vida', icon: '🍷', symbol: 'Cáliz Sagrado de Luz', bonus: 'Curación bendita potenciada' },
  { id: 'luz', name: 'Dominio de la Luz', icon: '☀️', symbol: 'Sol Radiante del Alba', bonus: 'Llamarada protectora radiante' },
  { id: 'tempestad', name: 'Dominio de la Tempestad', icon: '⚡', symbol: 'Relámpago de la Tormenta', bonus: 'Ira máxima del trueno' },
  { id: 'guerra', name: 'Dominio de la Guerra', icon: '⚔️', symbol: 'Espada y Escudo de San Cuthbert', bonus: 'Ataque adicional guiado' },
] as const;

export const ClericDomainModule: React.FC<Props> = ({ character, onUpdate }) => {
  const clericData = character.classResources.cleric || {
    channelDivinityCurrent: 2,
    channelDivinityMax: 2,
    domain: 'vida',
  };

  const currentDomain = DOMAINS.find((d) => d.id === clericData.domain) || DOMAINS[0];

  const setDomain = (domainId: typeof clericData.domain) => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        cleric: {
          ...clericData,
          domain: domainId,
        },
      },
    });
  };

  const spendChannel = () => {
    if (clericData.channelDivinityCurrent <= 0) return;
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        cleric: {
          ...clericData,
          channelDivinityCurrent: clericData.channelDivinityCurrent - 1,
        },
      },
    });
  };

  const restoreChannel = () => {
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        cleric: {
          ...clericData,
          channelDivinityCurrent: clericData.channelDivinityMax,
        },
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-400/40 bg-gradient-to-br from-[#1c1a14]/90 via-[#12110c]/95 to-[#262215]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Gothic stained glass window arch pattern */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 flex justify-center opacity-20">
        <svg viewBox="0 0 200 40" className="w-64 h-full text-amber-300 fill-current">
          <path d="M0,40 Q50,0 100,40 Q150,0 200,40 Z" />
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/60 bg-amber-400/20 text-2xl shadow-[0_0_15px_rgba(250,204,21,0.4)]">
            {currentDomain.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-amber-200 tracking-wide">
                {currentDomain.name}
              </h3>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                {clericData.channelDivinityCurrent} / {clericData.channelDivinityMax} Canalizaciones
              </span>
            </div>
            <p className="text-xs text-amber-200/70">
              Símbolo Sagrado activo: <strong className="text-amber-100">{currentDomain.symbol}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={restoreChannel}
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/50 hover:border-amber-400 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Plegaria de Alba (Recargar)</span>
        </button>
      </div>

      {/* Domain Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
        {DOMAINS.map((domain) => {
          const isSelected = clericData.domain === domain.id;
          return (
            <button
              key={domain.id}
              onClick={() => setDomain(domain.id as any)}
              className={`flex items-center gap-2 rounded-lg border p-2 text-left transition ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_10px_rgba(250,204,21,0.3)]'
                  : 'border-amber-900/30 bg-stone-950/40 hover:border-amber-500/40'
              }`}
            >
              <span className="text-lg">{domain.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-amber-200 truncate">{domain.name.replace('Dominio de la ', '')}</div>
                <div className="text-[10px] text-amber-200/50 truncate">{domain.bonus}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-amber-500/20 pt-3">
        <button
          onClick={spendChannel}
          disabled={clericData.channelDivinityCurrent <= 0}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold font-cinzel uppercase tracking-wider transition ${
            clericData.channelDivinityCurrent > 0
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 hover:brightness-110 shadow-md cursor-pointer'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Canalizar Divinidad: Expulsar Muertos / Poder del Dominio
        </button>
        <span className="text-xs text-amber-300/70 italic">
          Rayos de bendición descienden sobre el altar
        </span>
      </div>
    </div>
  );
};
