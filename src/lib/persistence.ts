import { CONDITION_IDS } from '../data/conditions';
import type { ActiveEffect, AppSettings, CharacterSheet, CombatRoundState, Combatant, ConcentrationState, Currency, DamageModifiers, Encounter, SpellDefinition, TacticalCard } from '../types';
import { migrateSkillProficiencies } from './proficiency';
import { classResourcesForLevel, normalizeSpellSlots } from './classProgression';
import { isValidUpcastDice } from './upcasting';

export function migrate<T>(raw: unknown, fromVersion: number): T | null {
  switch (fromVersion) {
    case 1:
      return raw as T;
    default:
      return null;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCurrency(value: unknown): value is Currency {
  return isRecord(value)
    && ['cp', 'sp', 'ep', 'gp', 'pp'].every((coin) => typeof value[coin] === 'number');
}

export function isAppSettings(value: unknown): value is AppSettings {
  return isRecord(value) && typeof value.autoTrackActions === 'boolean';
}

export function restoreAppSettings(value: AppSettings): AppSettings {
  if (!isAppSettings(value)) {
    throw new Error('La configuración guardada no tiene un formato válido.');
  }
  return value;
}

function isConcentrationState(value: unknown): value is ConcentrationState {
  return isRecord(value)
    && typeof value.spellName === 'string'
    && typeof value.spellLevel === 'number'
    && typeof value.startedRound === 'number';
}

function isActiveEffect(value: unknown): value is ActiveEffect {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && (value.source === undefined || typeof value.source === 'string')
    && (value.note === undefined || typeof value.note === 'string')
    && (value.requiresConcentration === undefined || typeof value.requiresConcentration === 'boolean')
    && (value.roundsRemaining === null
      || (typeof value.roundsRemaining === 'number'
        && Number.isInteger(value.roundsRemaining)
        && value.roundsRemaining > 0));
}

function isCombatant(value: unknown): value is Combatant {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && ['player', 'ally', 'enemy'].includes(String(value.side))
    && typeof value.initiative === 'number'
    && (value.initiativeBonus === undefined || typeof value.initiativeBonus === 'number')
    && (value.hp === undefined || typeof value.hp === 'number')
    && (value.maxHp === undefined || typeof value.maxHp === 'number')
    && (value.ac === undefined || typeof value.ac === 'number')
    && Array.isArray(value.conditions)
    && value.conditions.every((condition) => CONDITION_IDS.includes(String(condition) as typeof CONDITION_IDS[number]))
    && (value.isCurrentCharacter === undefined || typeof value.isCurrentCharacter === 'boolean')
    && (value.notes === undefined || typeof value.notes === 'string');
}

function isEncounter(value: unknown): value is Encounter {
  return isRecord(value)
    && Array.isArray(value.combatants)
    && value.combatants.every(isCombatant)
    && Number.isInteger(value.turnIndex)
    && (value.turnIndex as number) >= 0
    && (value.combatants.length === 0 || (value.turnIndex as number) < value.combatants.length)
    && typeof value.round === 'number'
    && Number.isInteger(value.round)
    && value.round >= 1;
}

function isSpellDefinition(value: unknown): value is SpellDefinition {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.level === 'number'
    && typeof value.school === 'string'
    && typeof value.castingTime === 'string'
    && typeof value.range === 'string'
    && typeof value.components === 'string'
    && typeof value.duration === 'string'
    && typeof value.attackOrDc === 'string'
    && typeof value.damageOrHeal === 'string'
    && typeof value.description === 'string'
    && (value.concentration === undefined || typeof value.concentration === 'boolean')
    && (value.upcast === undefined || (isRecord(value.upcast)
      && typeof value.upcast.dicePerLevel === 'string'
      && isValidUpcastDice(value.upcast.dicePerLevel)));
}

export function isCharacterSheet(value: unknown): value is CharacterSheet {
  if (!isRecord(value)) return false;

  const stringFields = [
    'id', 'name', 'epithet', 'characterClass', 'subclass', 'race', 'background',
    'alignment', 'acType', 'hitDice', 'portraitUrl',
  ];
  const numberFields = [
    'level', 'experience', 'nextLevelXp', 'armorClass', 'initiative', 'speedFeet',
    'proficiencyBonus', 'passivePerception', 'spellSaveDc', 'spellAttackBonus',
    'currentHp', 'maxHp', 'tempHp', 'preparedSpellsCount',
  ];

  const isDamageModifiers = (candidate: unknown): candidate is DamageModifiers => (
    isRecord(candidate)
      && Array.isArray(candidate.resistances)
      && candidate.resistances.every((item) => typeof item === 'string')
      && Array.isArray(candidate.vulnerabilities)
      && candidate.vulnerabilities.every((item) => typeof item === 'string')
      && Array.isArray(candidate.immunities)
      && candidate.immunities.every((item) => typeof item === 'string')
  );

  return stringFields.every((field) => typeof value[field] === 'string')
    && numberFields.every((field) => typeof value[field] === 'number')
    && (!('manualArmorClass' in value) || typeof value.manualArmorClass === 'boolean')
    && (!('inventory' in value) || (Array.isArray(value.inventory) && value.inventory.every((item) => (
      isRecord(item)
        && typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.quantity === 'number'
        && (item.weight === undefined || typeof item.weight === 'number')
        && (item.equipped === undefined || typeof item.equipped === 'boolean')
        && (item.attuned === undefined || typeof item.attuned === 'boolean')
        && (item.kind === undefined || ['weapon', 'armor', 'shield', 'gear', 'consumable', 'magic'].includes(String(item.kind)))
        && (item.armor === undefined || (isRecord(item.armor)
          && typeof item.armor.base === 'number'
          && (item.armor.dexCap === null || typeof item.armor.dexCap === 'number')
          && ['light', 'medium', 'heavy'].includes(String(item.armor.category))))
        && (item.shieldBonus === undefined || typeof item.shieldBonus === 'number')
    ))))
    && (!('currency' in value) || isCurrency(value.currency))
    && (!('classResources' in value) || (Array.isArray(value.classResources) && value.classResources.every((resource) => (
      isRecord(resource)
        && typeof resource.id === 'string'
        && typeof resource.name === 'string'
        && typeof resource.usesMax === 'number'
        && typeof resource.usesRemaining === 'number'
        && ['Descanso Corto', 'Descanso Largo', 'Ninguna'].includes(String(resource.recharge))
        && typeof resource.description === 'string'
    ))))
    && (!('exhaustionLevel' in value) || (typeof value.exhaustionLevel === 'number' && Number.isInteger(value.exhaustionLevel) && value.exhaustionLevel >= 0 && value.exhaustionLevel <= 6))
    && (!('damageModifiers' in value) || isDamageModifiers(value.damageModifiers))
    && typeof value.hasInspiration === 'boolean'
    && isRecord(value.deathSaves)
    && typeof value.deathSaves.successes === 'number'
    && typeof value.deathSaves.failures === 'number'
    && isRecord(value.abilities)
    && Array.isArray(value.skills)
    && value.skills.every((skill) => isRecord(skill)
      && typeof skill.name === 'string'
      && ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'].includes(String(skill.attr))
      && typeof skill.modifier === 'number'
      && (typeof skill.proficiencyLevel === 'undefined'
        || ['none', 'half', 'proficient', 'expertise'].includes(String(skill.proficiencyLevel)))
      && (typeof skill.proficiencyLevel !== 'undefined'
        || typeof skill.isProficient === 'boolean'))
    && Array.isArray(value.spellSlots)
    && (!('spells' in value) || (Array.isArray(value.spells) && value.spells.every(isSpellDefinition)))
    && Array.isArray(value.traits)
    && Array.isArray(value.senses)
    && Array.isArray(value.languages);
}

export function normalizeCharacterSheet(value: CharacterSheet): CharacterSheet {
  const characterWithSlots = {
    ...value,
    spellSlots: normalizeSpellSlots(value.spellSlots),
  };
  return {
    ...migrateSkillProficiencies(characterWithSlots),
    manualArmorClass: value.manualArmorClass ?? true,
    classResources: classResourcesForLevel(
      value.classKey,
      value.level,
      value.classResources,
    ),
  };
}

export function isTacticalCard(value: unknown): value is TacticalCard {
  if (!isRecord(value)) return false;

  const stringFields = [
    'id', 'title', 'typeBadge', 'actionType', 'reach', 'hitBonusOrDc',
    'targetOrArea', 'primaryDamageOrEffect', 'description',
  ];

  return stringFields.every((field) => typeof value[field] === 'string')
    && ['attack', 'skill', 'spell', 'item', 'reaction', 'standard'].includes(String(value.category))
    && (!('consumesResource' in value) || typeof value.consumesResource === 'boolean');
}

export function isTacticalCardArray(value: unknown): value is TacticalCard[] {
  return Array.isArray(value) && value.every(isTacticalCard);
}

export function isCombatRoundState(value: unknown): value is CombatRoundState {
  return isRecord(value)
    && typeof value.round === 'number'
    && typeof value.initiativeScore === 'number'
    && typeof value.isStanding === 'boolean'
    && (typeof value.concentrationSpell === 'string' || value.concentrationSpell === null)
    && typeof value.hasInspiration === 'boolean'
    && typeof value.maxMovement === 'number'
    && typeof value.remainingMovement === 'number'
    && typeof value.hasDash === 'boolean'
    && typeof value.actionUsed === 'boolean'
    && typeof value.bonusActionUsed === 'boolean'
    && typeof value.reactionUsed === 'boolean'
    && (!('encounter' in value) || isEncounter(value.encounter))
    && (!('activeEffects' in value) || (Array.isArray(value.activeEffects) && value.activeEffects.every(isActiveEffect)))
    && (!('conditions' in value) || (Array.isArray(value.conditions) && value.conditions.every((condition) => CONDITION_IDS.includes(String(condition) as typeof CONDITION_IDS[number]))))
    && (!('concentration' in value) || value.concentration === null || isConcentrationState(value.concentration));
}
