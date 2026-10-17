import React from 'react';
import { ClassWidget, ClassSubBox } from '../fx/ClassStyledContainer';

interface DeathSavesProps {
  character: any;
  onUpdate: (updated: any) => void;
}

export const DeathSavesSection: React.FC<DeathSavesProps> = ({ character, onUpdate }) => {
  return (
    <ClassWidget classId={character.classId} className="p-4 md:p-5">
      <h3 className="font-cinzel text-sm font-bold">Death Saves</h3>
      <div className="flex gap-2">
        <ClassSubBox classId={character.classId} className="px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1">
          <span>✅ {character.deathSaves.successes} Éxitos</span>
        </ClassSubBox>
        <ClassSubBox classId={character.classId} className="px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1">
          <span>❌ {character.deathSaves.failures} Fallos</span>
        </ClassSubBox>
      </div>
    </ClassWidget>
  );
};