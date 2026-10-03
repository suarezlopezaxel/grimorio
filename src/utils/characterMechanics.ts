import { AbilityCode, CharacterSheet, TacticalCard } from '../types';
import { getSkillProficiencyLevel, proficiencyBonusForLevel } from '../lib/proficiency';

export interface DiceFormula {
  count: number;
  sides: number;
  modifier: number;
}

export function parseDiceFormula(formula?: string): DiceFormula | null {
  const match = formula?.trim().match(/^(\d*)d(\d+)(?:\s*([+-])\s*(\d+))?(?=\s|$)/i);
  if (!match) return null;

  const count = Number(match[1] || 1);
  const sides = Number(match[2]);
  const modifier = Number(match[4] || 0) * (match[3] === '-' ? -1 : 1);
  if (!Number.isSafeInteger(count) || count < 1 || count > 100) return null;
  if (!Number.isSafeInteger(sides) || sides < 2 || sides > 1000) return null;
  if (!Number.isSafeInteger(modifier)) return null;

  return { count, sides, modifier };
}

export function getAbilityModifier(character: CharacterSheet, code: AbilityCode): number {
  const featBonus = (character.feats || []).reduce(
    (total, feat) => total + (feat.abilityBonuses?.[code] || 0),
    0
  );
  return Math.floor((character.abilities[code].base + featBonus - 10) / 2);
}

export function getSavingThrowModifier(character: CharacterSheet, code: AbilityCode): number {
  return getAbilityModifier(character, code) +
    (character.abilities[code].isProficientSave ? character.proficiencyBonus : 0);
}

export function getSkillModifier(character: CharacterSheet, skillName: string): number {
  const skill = character.skills.find((item) => item.name === skillName);
  if (!skill) return 0;
  const proficiencyBonus = proficiencyBonusForLevel(
    getSkillProficiencyLevel(skill),
    character.proficiencyBonus,
  );
  return getAbilityModifier(character, skill.attr) + proficiencyBonus;
}

export function getSpellAttackModifier(character: CharacterSheet): number {
  const keyAbility = (Object.keys(character.abilities) as AbilityCode[]).find(
    (code) => character.abilities[code].isKeyAttribute
  ) || 'INT';
  return character.proficiencyBonus + getAbilityModifier(character, keyAbility);
}

export function getTacticalCardDamageRoll(card: TacticalCard, character?: CharacterSheet): DiceFormula | null {
  const formula = parseDiceFormula(card.damageFormula) || parseDiceFormula(card.primaryDamageOrEffect);
  if (!formula) return null;
  const modifier = card.rollAbility && character
    ? getAbilityModifier(character, card.rollAbility) + (card.rollProficient ? character.proficiencyBonus : 0)
    : formula.modifier;
  return { ...formula, modifier };
}
