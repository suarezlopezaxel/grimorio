import { classProgressionFor } from '../data/classes';
import type { CharacterSheet, ClassKey, ClassResource, SpellSlotTier } from '../types';
import { getSkillProficiencyLevel, proficiencyBonusForLevel } from './proficiency';
import { updateHitDicePoolForLevel, getHitDicePool } from './hitDice';
import { effectiveMaxHitPoints } from './conditions';

export const ABILITY_SCORE_IMPROVEMENT_LEVELS = [4, 8, 12, 16, 19] as const;

export function abilityScoreImprovementsBetween(fromLevel: number, toLevel: number): number[] {
  return ABILITY_SCORE_IMPROVEMENT_LEVELS.filter((level) => level > fromLevel && level <= toLevel);
}

export function normalizeSpellSlots(slots: SpellSlotTier[]): SpellSlotTier[] {
  const currentSlots = new Map(slots.map((slot) => [slot.tier, slot]));
  return Array.from({ length: 9 }, (_, index) => {
    const tier = index + 1;
    const current = currentSlots.get(tier);
    return current
      ? { ...current, tier, max: Math.max(0, current.max), current: Math.max(0, Math.min(current.max, current.current)) }
      : { tier, max: 0, current: 0 };
  });
}

export function spellSlotsForClassLevel(
  classKey: ClassKey | undefined,
  level: number,
  existingSlots: SpellSlotTier[] = [],
): SpellSlotTier[] {
  const current = normalizeSpellSlots(existingSlots);
  const progression = classProgressionFor(classKey);
  const tableRow = progression?.spellSlots?.[Math.max(1, Math.min(20, Math.floor(level)))];
  if (!tableRow) return current;

  return tableRow.map((max, index) => {
    const previous = current[index];
    const gainedSlots = Math.max(0, max - previous.max);
    return {
      tier: index + 1,
      max,
      current: Math.min(max, previous.current + gainedSlots),
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
