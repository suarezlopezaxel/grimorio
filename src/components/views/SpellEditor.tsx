import React, { useState } from 'react';
import { ClassWidget } from '../fx/ClassStyledContainer';

interface SpellEditorProps {
  character: any;
  onUpdate: (updated: any) => void;
}

export const SpellEditor: React.FC<SpellEditorProps> = ({ character, onUpdate }) => {
  const [newSpell, setNewSpell] = useState({
    name: '',
    level: 0,
    school: '',
    castTime: '',
    range: '',
    damage: '',
    damageType: '',
    description: '',
    prepared: false,
  });

  const addSpell = (selectedSpell) => {
      if (!selectedSpell) return;
      onUpdate({
        ...character,
        spells: [...character.spells, selectedSpell],
      });
    };

  return (
    <ClassWidget classId={character.classId} className="p-4 md:p-5">
      <h3 className="font-cinzel text-sm font-bold">Añadir Hechizo</h3>
      <select
              onChange={(e) => addSpell(JSON.parse(e.target.value))}
              className="rounded border border-gray-300 p-2 mb-2"
            >
              <option value="">Selecciona un hechizo</option>
              {Array.isArray(character?.grimoire)
                ? character.grimoire
                    .filter((card) => card?.type === 'Spell')
                    .map((spell) => (
                      <option key={spell.name} value={JSON.stringify(spell)}>
                        {spell.name}
                      </option>
                    ))
                : null}
            </select>
    </ClassWidget>
  );
};