import type { ConditionEffect, ConditionId } from '../types';

export interface ConditionDefinition {
  id: ConditionId;
  name: string;
  description: string;
  effects: ConditionEffect;
}

export const CONDITION_IDS: ConditionId[] = [
  'blinded', 'charmed', 'deafened', 'frightened', 'grappled',
  'incapacitated', 'invisible', 'paralyzed', 'petrified',
  'poisoned', 'prone', 'restrained', 'stunned', 'unconscious',
];

export const CONDITIONS: Record<ConditionId, ConditionDefinition> = {
  blinded: {
    id: 'blinded',
    name: 'Cegado',
    description: 'No ves, tus ataques tienen desventaja y los ataques contra ti tienen ventaja.',
    effects: { attackDisadvantage: true },
  },
  charmed: {
    id: 'charmed',
    name: 'Hechizado',
    description: 'No puedes atacar ni dañar con efectos al que te hechizó.',
    effects: {},
  },
  deafened: {
    id: 'deafened',
    name: 'Ensordecido',
    description: 'No oyes y fallas pruebas que dependan del oído.',
    effects: {},
  },
  frightened: {
    id: 'frightened',
    name: 'Asustado',
    description: 'Desventaja en pruebas y ataques mientras veas la fuente del miedo, y no puedes acercarte voluntariamente a ella.',
    effects: { attackDisadvantage: true, abilityCheckDisadvantage: true },
  },
  grappled: {
    id: 'grappled',
    name: 'Agarrado',
    description: 'Velocidad 0 y desventaja al atacar a cualquiera que no sea quien te agarra.',
    effects: { speedZero: true },
  },
  incapacitated: {
    id: 'incapacitated',
    name: 'Incapacitado',
    description: 'No puedes realizar acciones, acciones adicionales ni reacciones. Pierdes la concentración.',
    effects: { incapacitated: true },
  },
  invisible: {
    id: 'invisible',
    name: 'Invisible',
    description: 'No afecta tus acciones. Tienes ventaja en la iniciativa y en tus ataques, y los ataques contra ti tienen desventaja.',
    effects: { attackAdvantage: true },
  },
  paralyzed: {
    id: 'paralyzed',
    name: 'Paralizado',
    description: 'Incapacitado (sin acciones, adicionales ni reacciones; pierdes concentración). Velocidad 0, fallas automáticamente salvaciones de Fuerza y Destreza, ataques contra ti con ventaja y los golpes a 5 pies son críticos.',
    effects: { incapacitated: true, speedZero: true, autoFailSaves: ['str', 'dex'] },
  },
  petrified: {
    id: 'petrified',
    name: 'Petrificado',
    description: 'Incapacitado (sin acciones, adicionales ni reacciones; pierdes concentración). Velocidad 0, fallas salvaciones de Fuerza/Destreza, ataques contra ti con ventaja, resistencia a todo el daño, inmune a veneno y enfermedad.',
    effects: { incapacitated: true, speedZero: true, autoFailSaves: ['str', 'dex'] },
  },
  poisoned: {
    id: 'poisoned',
    name: 'Envenenado',
    description: 'Desventaja en tiradas de ataque y pruebas de característica.',
    effects: { attackDisadvantage: true, abilityCheckDisadvantage: true },
  },
  prone: {
    id: 'prone',
    name: 'Derribado',
    description: 'Solo puedes arrastrarte, atacas con desventaja y levantarte te cuesta la mitad de tu movimiento.',
    effects: { attackDisadvantage: true },
  },
  restrained: {
    id: 'restrained',
    name: 'Apresado',
    description: 'Velocidad 0, tus ataques tienen desventaja, los ataques contra ti tienen ventaja y tienes desventaja en salvaciones de Destreza.',
    effects: { speedZero: true, attackDisadvantage: true, savingThrowDisadvantageAbilities: ['dex'] },
  },
  stunned: {
    id: 'stunned',
    name: 'Aturdido',
    description: 'Incapacitado (sin acciones, adicionales ni reacciones; pierdes concentración). Fallas salvaciones de Fuerza/Destreza y los ataques contra ti tienen ventaja.',
    effects: { incapacitated: true, speedZero: true, autoFailSaves: ['str', 'dex'] },
  },
  unconscious: {
    id: 'unconscious',
    name: 'Inconsciente',
    description: 'Incapacitado (sin acciones, adicionales ni reacciones; pierdes concentración). También estás Derribado, velocidad 0, fallas salvaciones de Fuerza/Destreza, ataques con ventaja y críticos a 5 pies.',
    effects: { incapacitated: true, speedZero: true, autoFailSaves: ['str', 'dex'] },
  },
};

export const EXHAUSTION_RULESET = {
  edition: '2014',
  effects: [
    'Nivel 1: desventaja en pruebas de característica.',
    'Nivel 2: velocidad reducida a la mitad.',
    'Nivel 3: desventaja en ataques y salvaciones.',
    'Nivel 4: puntos de golpe máximos reducidos a la mitad.',
    'Nivel 5: velocidad 0.',
    'Nivel 6: muerte.',
  ],
} as const;
