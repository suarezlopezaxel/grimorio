import { AbilityKey } from '../types/character';

export const STANDARD_SKILL_ABILITIES: Record<string, AbilityKey> = {
  Acrobacias: 'DES',
  Arcanos: 'INT',
  Atletismo: 'FUE',
  Engaño: 'CAR',
  Historia: 'INT',
  Intimidación: 'CAR',
  Investigación: 'INT',
  'Juego de Manos': 'DES',
  Medicina: 'SAB',
  Naturaleza: 'INT',
  Percepción: 'SAB',
  Perspicacia: 'SAB',
  Persuasión: 'CAR',
  Religión: 'INT',
  Sigilo: 'DES',
  Supervivencia: 'SAB',
  'Trato con Animales': 'SAB',
  Interpretación: 'CAR',
};

export const abilityForSkill = (name: string, fallback: AbilityKey): AbilityKey =>
  STANDARD_SKILL_ABILITIES[name] ?? fallback;
