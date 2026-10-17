import React from 'react';
import { ClassWidget, ClassSubBox } from '../fx/ClassStyledContainer';
import { Plus } from 'lucide-react';

interface DefensesProps {
  character: any;
  newResistance: string;
  setNewResistance: (val: string) => void;
  resistanceType: 'Resistencia' | 'Inmunidad' | 'Vulnerabilidad';
  setResistanceType: (val: 'Resistencia' | 'Inmunidad' | 'Vulnerabilidad') => void;
  addDefense: () => void;
  removeDefense: (type: 'resistances' | 'immunities' | 'vulnerabilities', index: number) => void;
}

export const DefensesSection: React.FC<DefensesProps> = ({
  character,
  newResistance,
  setNewResistance,
  resistanceType,
  setResistanceType,
  addDefense,
  removeDefense,
}) => {
  return (
    <ClassWidget classId={character.classId} className="p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h3 className="font-cinzel text-sm font-bold flex items-center gap-2">
          <span>🛡️</span>
          <span>Defensas, Inmunidades & Vulnerabilidades</span>
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={resistanceType}
            onChange={(e) => setResistanceType(e.target.value as any)}
            className="rounded bg-black/40 border border-white/10 px-2 py-1 text-xs"
          >
            <option value="Resistencia">Resistencia</option>
            <option value="Inmunidad">Inmunidad</option>
            <option value="Vulnerabilidad">Vulnerabilidad</option>
          </select>
          <input
            type="text"
            placeholder="Añadir..."
            value={newResistance}
            onChange={(e) => setNewResistance(e.target.value)}
            className="rounded bg-black/40 border border-white/10 px-2 py-1 text-xs"
          />
          <button
            onClick={addDefense}
            className="flex items-center gap-1 rounded bg-black/40 border border-white/10 px-2 py-1 text-xs hover:bg-black/60"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {character.defenses.resistances.map((res: string, i: number) => (
          <ClassSubBox key={i} classId={character.classId} className="px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1">
            <span>🛡️</span>
            <span>{res}</span>
            <button onClick={() => removeDefense('resistances', i)} className="ml-1 text-white/50 hover:text-white">×</button>
          </ClassSubBox>
        ))}
        {character.defenses.immunities.map((im: string, i: number) => (
          <ClassSubBox key={i} classId={character.classId} className="px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1">
            <span>✨</span>
            <span>{im}</span>
            <button onClick={() => removeDefense('immunities', i)} className="ml-1 text-white/50 hover:text-white">×</button>
          </ClassSubBox>
        ))}
        {character.defenses.vulnerabilities.map((v: string, i: number) => (
          <ClassSubBox key={i} classId={character.classId} className="px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1">
            <span>🔥</span>
            <span>{v}</span>
            <button onClick={() => removeDefense('vulnerabilities', i)} className="ml-1 text-white/50 hover:text-white">×</button>
          </ClassSubBox>
        ))}
      </div>
    </ClassWidget>
  );
};
