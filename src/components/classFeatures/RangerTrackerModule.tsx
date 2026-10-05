import React, { useState } from 'react';
import { Compass, Target, Footprints, MapPin } from 'lucide-react';
import { CharacterSheet } from '../../types/character';

interface Props {
  character: CharacterSheet;
  onUpdate: (updated: CharacterSheet) => void;
}

const ENEMIES = ['Monstruosidades', 'No-Muertos', 'Dragones', 'Gigantes', 'Bestias', 'Demonios & Diablos'];

export const RangerTrackerModule: React.FC<Props> = ({ character, onUpdate }) => {
  const rangerData = character.classResources.ranger || {
    favoredEnemy: 'No-Muertos',
    favoredTerrain: 'Bosques y Ruinas',
    quarryMarked: true,
  };

  const [enemy, setEnemy] = useState(rangerData.favoredEnemy);

  const updateEnemy = (newEnemy: string) => {
    setEnemy(newEnemy);
    onUpdate({
      ...character,
      classResources: {
        ...character.classResources,
        ranger: {
          ...rangerData,
          favoredEnemy: newEnemy,
        },
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-lime-600/40 bg-gradient-to-br from-[#182012]/90 via-[#0e140a]/95 to-[#202916]/90 p-5 shadow-xl backdrop-blur-md">
      {/* Nautical Compass Rose Watermark */}
      <div className="pointer-events-none absolute right-4 -bottom-4 text-lime-500/10 text-8xl font-mono select-none">
        🧭
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime-400/50 bg-lime-500/20 text-lime-200 shadow-[0_0_15px_rgba(132,204,22,0.4)]">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-bold text-lime-100 tracking-wide">
              Explorador: Enemigo Predilecto & Mapa de Rastreo
            </h3>
            <p className="text-xs text-lime-200/70">
              Terreno Predilecto: <strong className="text-lime-200">{rangerData.favoredTerrain}</strong> • Ventaja en Supervivencia e Historia de presas
            </p>
          </div>
        </div>
      </div>

      {/* Pinned Corkboard Bounty Trophy */}
      <div className="rounded-xl border-2 border-[#5c4033] bg-[#2a1c12]/90 p-4 shadow-inner">
        <div className="flex items-center justify-between mb-3 text-xs text-amber-200">
          <span className="flex items-center gap-1.5 font-cinzel font-bold text-amber-300">
            📌 Tablón de Presa Clavada con Chincheta:
          </span>
          <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
            <Target className="h-3.5 w-3.5 text-lime-400" /> +1d6 Daño (Marca del Cazador)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ENEMIES.map((e) => {
            const isSelected = enemy === e;
            return (
              <button
                key={e}
                onClick={() => updateEnemy(e)}
                className={`relative rounded-lg border p-2.5 text-left transition ${
                  isSelected
                    ? 'border-lime-400 bg-lime-950/60 shadow-[0_0_12px_rgba(132,204,22,0.3)]'
                    : 'border-amber-900/40 bg-[#1e130c]/80 hover:border-lime-600/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-100">{e}</span>
                  {isSelected && <span className="text-xs text-lime-400">📍 Fijado</span>}
                </div>
                <div className="text-[10px] text-amber-200/50 mt-1">Rastreo sin penalización</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
