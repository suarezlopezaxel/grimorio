import React from 'react';
import { Cog, Wrench, Sparkles, Shield, Swords } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
}

const INFUSIONS = [
  { name: 'Arma Mejorada (+1)', target: 'Arma simple o marcial', bonus: '+1 a tiradas de ataque y daño mágicos' },
  { name: 'Defensa Mejorada (+1)', target: 'Armadura o escudo', bonus: '+1 a la Clase de Armadura' },
  { name: 'Arma Retornante (+1)', target: 'Arma arrojadiza', bonus: 'Regresa volando a tu mano inmediatamente tras impactar' },
  { name: 'Enfoque Arcano Radiante', target: 'Vara o cetro', bonus: '+1 a tiradas de ataque de conjuro y luz perpetua' },
];

export const ArtificerInfusionModule: React.FC<Props> = ({ character, onUpdate }) => {
  const artData = character.classResources.artificer || {
    infusedItemsCount: 2,
    infusedItemsMax: 2,
    activeInfusions: ['Arma Mejorada (+1)', 'Defensa Mejorada (+1)'],
  };

  const toggleInfusion = (name: string) => {
    const exists = artData.activeInfusions.includes(name);
    let updatedList = [...artData.activeInfusions];
    if (exists) {
      updatedList = updatedList.filter((i) => i !== name);
    } else {
      if (updatedList.length >= artData.infusedItemsMax) {
        updatedList.shift();
      }
      updatedList.push(name);
    }

    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        artificer: {
          ...artData,
          activeInfusions: updatedList,
          infusedItemsCount: updatedList.length,
        },
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-orange-500/40 bg-gradient-to-br from-[#24160d]/90 via-[#140b06]/95 to-[#2a1a10]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Rotating copper cog watermark */}
      <div className="pointer-events-none absolute right-2 -bottom-4 text-orange-400/10 text-8xl spin-slow select-none">
        ⚙️
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-400/50 bg-orange-500/20 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <Cog className="h-6 w-6 spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-base font-bold text-orange-100 tracking-wide">
                Banco de Infusiones & Taller Arcano
              </h3>
              <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-200 border border-orange-500/30">
                {artData.infusedItemsCount} / {artData.infusedItemsMax} Infusiones Activas
              </span>
            </div>
            <p className="text-xs text-orange-200/70">
              Imbuye objetos ordinarios con magia de forja para potenciar al grupo
            </p>
          </div>
        </div>
      </div>

      {/* Workshop Bench Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
        {INFUSIONS.map((inf) => {
          const isActive = artData.activeInfusions.includes(inf.name);
          return (
            <button
              key={inf.name}
              onClick={() => toggleInfusion(inf.name)}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                isActive
                  ? 'border-orange-400 bg-orange-950/50 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'border-orange-900/30 bg-[#140b06]/60 opacity-60 hover:opacity-100'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                  isActive ? 'border-orange-400 bg-orange-500/30 text-orange-200' : 'border-zinc-700 bg-zinc-800 text-zinc-500'
                }`}
              >
                <Wrench className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-xs font-bold text-orange-100 truncate">{inf.name}</span>
                  <span className={`text-[10px] font-bold ${isActive ? 'text-orange-300' : 'text-zinc-500'}`}>
                    {isActive ? 'INFUSO' : 'DESACTIVADO'}
                  </span>
                </div>
                <div className="text-[10px] text-orange-300/60">{inf.target}</div>
                <div className="text-[11px] text-orange-200/80 mt-1">{inf.bonus}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
