import type { ClassKey, ClassResource } from '../types';

export interface ClassProgression {
  hitDie: 6 | 8 | 10 | 12;
  skillChoices: string[];
  skillProficiencies: number;
  spellSlots?: Record<number, number[]>;
  resources: Array<Omit<ClassResource, 'usesRemaining'> & { minLevel: number }>;
  startingTraits: Array<{ name: string; description: string; minLevel: number }>;
}

const WIZARD_SPELL_SLOTS: Record<number, number[]> = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

export const CLASS_PROGRESSION: Partial<Record<ClassKey, ClassProgression>> = {
  mago: {
    hitDie: 6,
    skillChoices: ['Arcanos', 'Historia', 'Perspicacia', 'Investigación', 'Medicina', 'Religión'],
    skillProficiencies: 2,
    spellSlots: WIZARD_SPELL_SLOTS,
    resources: [{
      id: 'wizard-arcane-recovery',
      name: 'Recuperación Arcana',
      usesMax: 1,
      recharge: 'Descanso Largo',
      description: 'Una vez por día, recupera espacios de conjuro durante un descanso corto.',
      minLevel: 1,
    }],
    startingTraits: [
      {
        name: 'Lanzamiento de Conjuros',
        description: 'Puedes lanzar conjuros de mago usando Inteligencia como característica de lanzamiento.',
        minLevel: 1,
      },
      {
        name: 'Recuperación Arcana',
        description: 'Una vez al día, al terminar un descanso corto, recuperas espacios de conjuro de nivel 5 o inferior.',
        minLevel: 1,
      },
    ],
  },
};

export function classProgressionFor(classKey?: ClassKey): ClassProgression | undefined {
  return classKey ? CLASS_PROGRESSION[classKey] : undefined;
}
