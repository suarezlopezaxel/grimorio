import { classProgressionFor } from '../data/classes';
import type { CharacterSheet, ClassKey, ClassResource, SpellSlotTier } from '../types';
import { getSkillProficiencyLevel, proficiencyBonusForLevel } from './proficiency';
import { updateHitDicePoolForLevel, getHitDicePool } from './hitDice';
import { effectiveMaxHitPoints } from './conditions';

const FULL = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

const HALF = [
  [2],
  [2],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2],
];

const THIRD = [
  [],
  [],
  [2],
  [3],
  [3],
  [3],
  [4, 2],
  [4, 2],
  [4, 2],
  [4, 3],
  [4, 3],
  [4, 3],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
];

// Brujo: [cantidad, nivel de los espacios]
const PACT = [
  [1, 1],
  [2, 1],
  [2, 2],
  [2, 2],
  [2, 3],
  [2, 3],
  [2, 4],
  [2, 4],
  [2, 5],
  [2, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [4, 5],
  [4, 5],
  [4, 5],
  [4, 5],
];

type CasterType = 'full' | 'half' | 'third';
const CASTER_TYPE: Partial<Record<ClassKey, CasterType>> = {
  bardo: 'full',
  clerigo: 'full',
  druida: 'full',
  hechicero: 'full',
  mago: 'full',
  paladin: 'half',
  explorador: 'half',
  guerrero: 'third',
  picaro: 'third',
};

function normalizeSpellSlotsToNineTiers(slots: SpellSlotTier[]): SpellSlotTier[] {
  const currentSlots = new Map(slots.map((slot) => [slot.tier, slot]));
  return Array.from({ length: 9 }, (_, index) => {
    const tier = index + 1;
    const current = currentSlots.get(tier);
    const max = Math.max(0, current?.max ?? 0);
    const rawCurrent = (current as any)?.current;
    const rawUsed = (current as any)?.used;
    let available = max;
    if (typeof rawUsed === 'number') {
      available = Math.max(0, Math.min(max, max - rawUsed));
    } else if (typeof rawCurrent === 'number') {
      available = Math.max(0, Math.min(max, rawCurrent));
    }
    const usedVal = Math.max(0, max - available);
    return current
      ? { ...current, tier, max, current: available, used: usedVal }
      : { tier, max: 0, current: 0, used: 0 };
  });
}

function spellSlotsMaxesForCasterType(casterType: CasterType, casterLevel: number): number[] {
  const idx = Math.max(1, Math.min(20, Math.floor(casterLevel))) - 1;
  switch (casterType) {
    case 'full':
      return FULL[idx] ?? [];
    case 'half':
      return HALF[idx] ?? [];
    case 'third':
      return THIRD[idx] ?? [];
  }
}

function spellSlotsMaxesForClassLevelDeterministic(classKey: ClassKey | undefined, level: number): { tierMaxes: number[]; isWarlock: boolean } {
  const lvl = Math.max(1, Math.min(20, Math.floor(level)));
  if (!classKey) return { tierMaxes: Array(9).fill(0), isWarlock: false };

  if (classKey === 'brujo') {
    const row = PACT[lvl - 1] ?? [0, 1];
    const [count, pactTier] = row;
    const tierMaxes = Array(9).fill(0);
    const ti = Math.max(1, Math.min(9, pactTier));
    tierMaxes[ti - 1] = count;
    return { tierMaxes, isWarlock: true };
  }

  const casterType = CASTER_TYPE[classKey];
  if (!casterType) return { tierMaxes: Array(9).fill(0), isWarlock: false };
  const arr = spellSlotsMaxesForCasterType(casterType, lvl);
  const tierMaxes = Array(9).fill(0);
  arr.forEach((max, tierIndex) => {
    if (tierIndex < 9) tierMaxes[tierIndex] = max;
  });
  return { tierMaxes, isWarlock: false };
}

 export const ABILITY_SCORE_IMPROVEMENT_LEVELS = [4, 8, 12, 16, 19] as const;

 export function abilityScoreImprovementsBetween(fromLevel: number, toLevel: number): number[] {
   return ABILITY_SCORE_IMPROVEMENT_LEVELS.filter((level) => level > fromLevel && level <= toLevel);
 }

 export function normalizeSpellSlots(slots: SpellSlotTier[]): SpellSlotTier[] {
   return normalizeSpellSlotsToNineTiers(slots);
 }

 export function spellSlotsForClassLevel(
   classKey: ClassKey | undefined,
   level: number,
   existingSlots: SpellSlotTier[] = [],
 ): SpellSlotTier[] {
   const current = normalizeSpellSlotsToNineTiers(existingSlots);
   const { tierMaxes } = spellSlotsMaxesForClassLevelDeterministic(classKey, level);

   return current.map((prev, index) => {
     const max = tierMaxes[index] ?? 0;
     const oldMax = prev.max ?? 0;
     const oldUsed = prev.used ?? 0;
     // Si aumentaron los espacios máximos, mantenemos el used anterior (o 0 si es nuevo slot).
     // Evitamos que 'gained' fuerce a marcar gastados los espacios nuevos o existentes.
     const newUsed = max === 0 ? 0 : Math.min(max, oldUsed);
     return {
       ...prev,
       tier: index + 1,
       max,
       current: max - newUsed,
       used: newUsed,
     };
   });
 }

export function classResourcesForLevel(
  classKey: ClassKey | undefined,
  level: number,
  existing: ClassResource[] = [],
): ClassResource[] {
  const progression = classProgressionFor(classKey);
  if (!progression) return existing;
  return progression.resources
    .filter((resource) => level >= resource.minLevel)
    .map((resource) => {
      const previous = existing.find((item) => item.id === resource.id);
      return {
        id: resource.id,
        name: resource.name,
        usesMax: resource.usesMax,
        usesRemaining: Math.max(0, Math.min(resource.usesMax, previous?.usesRemaining ?? resource.usesMax)),
        recharge: resource.recharge,
        description: resource.description,
      };
    });
}

export function rechargeClassResources(
  resources: ClassResource[] | undefined,
  rest: 'short' | 'long',
): ClassResource[] | undefined {
  if (!resources) return resources;
  return resources.map((resource) => (
    rest === 'long' || resource.recharge === 'Descanso Corto'
      ? { ...resource, usesRemaining: resource.usesMax }
      : resource
  ));
}

export function applyWizardLevelUp(
  character: CharacterSheet,
  newLevel: number,
  hitPointGains: number[],
): CharacterSheet {
  const level = Math.max(character.level, Math.min(20, Math.floor(newLevel)));
  if (level === character.level) return character;

  const proficiencyBonus = Math.ceil(1 + level / 4);
  const spellcastingModifier = Object.values(character.abilities)
    .find((ability) => ability.isKeyAttribute)?.modifier ?? character.abilities.INT.modifier;
  const hpGain = hitPointGains
    .slice(0, level - character.level)
    .reduce((total, gain) => total + Math.max(1, Math.floor(gain)), 0);
  const slots = spellSlotsForClassLevel('mago', level, character.spellSlots);

  const maxHp = character.maxHp + hpGain;
  return {
    ...character,
    level,
    maxHp,
    currentHp: Math.min(
      effectiveMaxHitPoints(maxHp, character.exhaustionLevel ?? 0),
      character.currentHp + hpGain,
    ),
    hitDice: `${level}d${getHitDicePool(character).dieSize}`,
    proficiencyBonus,
    abilities: Object.fromEntries(
      Object.entries(character.abilities).map(([code, ability]) => [code, {
        ...ability,
        savingThrow: ability.modifier + (ability.isProficientSave ? proficiencyBonus : 0),
      }])
    ) as CharacterSheet['abilities'],
    skills: character.skills.map((skill) => ({
      ...skill,
      modifier: character.abilities[skill.attr].modifier + proficiencyBonusForLevel(
        getSkillProficiencyLevel(skill),
        proficiencyBonus,
      ),
    })),
    passivePerception: 10 + character.abilities.SAB.modifier + proficiencyBonusForLevel(
      getSkillProficiencyLevel(character.skills.find((skill) => skill.name === 'Percepción') ?? { proficiencyLevel: 'none' }),
      proficiencyBonus,
    ),
    spellSaveDc: 8 + proficiencyBonus + spellcastingModifier,
    spellAttackBonus: proficiencyBonus + spellcastingModifier,
    spellSlots: slots,
    hitDicePool: updateHitDicePoolForLevel(getHitDicePool(character), level),
    classResources: classResourcesForLevel('mago', level, character.classResources),
  };
}
