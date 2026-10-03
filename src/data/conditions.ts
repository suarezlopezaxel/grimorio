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
    description: 'No puede ver; falla las pruebas que requieran visión y tiene desventaja en ataques.',
    effects: { attackDisadvantage: true },
  },
  charmed: {
    id: 'charmed',
    name: 'Hechizado',
    description: 'No puede atacar ni elegir como objetivo dañino a quien lo hechizó.',
    effects: {},
  },
  deafened: {
    id: 'deafened',
    name: 'Ensordecido',
    description: 'No puede oír y falla las pruebas que requieran audición.',
    effects: {},
  },
  frightened: {
    id: 'frightened',
    name: 'Asustado',
    description: 'Tiene desventaja en pruebas y ataques mientras la fuente del miedo esté a la vista.',
    effects: { attackDisadvantage: true, abilityCheckDisadvantage: true },
  },
  grappled: {
    id: 'grappled',
    name: 'Agarrado',
    description: 'Su velocidad es 0.',
    effects: { speedZero: true },
  },
  incapacitated: {
    id: 'incapacitated',
    name: 'Incapacitado',
    description: 'No puede realizar acciones ni reacciones.',
    effects: { incapacitated: true },
  },
  invisible: {
    id: 'invisible',
    name: 'Invisible',
    description: 'Tiene ventaja en ataques; los ataques contra él tienen desventaja.',
    effects: { attackAdvantage: true },
  },
  paralyzed: {
    id: 'paralyzed',
    name: 'Paralizado',
    description: 'Incapacitado, velocidad 0 y falla automáticamente salvaciones de Fuerza y Destreza.',
    effects: { incapacitated: true, speedZero: true, autoFailSaves: ['str', 'dex'] },
  },
  petrified: {
    id: 'petrified',
    name: 'Petrificado',
    description: 'Incapacitado y falla automáticamente salvaciones de Fuerza y Destreza.',
    effects: { incapacitated: true, speedZero: true, autoFailSaves: ['str', 'dex'] },
  },
  poisoned: {
    id: 'poisoned',
    name: 'Envenenado',
    description: 'Tiene desventaja en ataques y pruebas de característica.',
    effects: { attackDisadvantage: true, abilityCheckDisadvantage: true },
  },
  prone: {
    id: 'prone',
    name: 'Derribado',
    description: 'Tiene desventaja en ataques; levantarse cuesta movimiento.',
    effects: { attackDisadvantage: true },
  },
  restrained: {
    id: 'restrained',
    name: 'Apresado',
    description: 'Velocidad 0, desventaja en ataques y salvaciones de Destreza.',
    effects: { speedZero: true, attackDisadvantage: true, savingThrowDisadvantageAbilities: ['dex'] },
  },
  stunned: {
    id: 'stunned',
    name: 'Aturdido',
    description: 'Incapacitado, velocidad 0 y falla automáticamente salvaciones de Fuerza y Destreza.',
    effects: { incapacitated: true, speedZero: true, autoFailSaves: ['str', 'dex'] },
  },
  unconscious: {
    id: 'unconscious',
    name: 'Inconsciente',
    description: 'Incapacitado, velocidad 0 y falla automáticamente salvaciones de Fuerza y Destreza.',
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
