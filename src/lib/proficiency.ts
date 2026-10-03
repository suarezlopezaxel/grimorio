import type { CharacterSheet, ProficiencyLevel, Skill } from '../types';

const PROFICIENCY_LEVELS: ProficiencyLevel[] = ['none', 'half', 'proficient', 'expertise'];

export function getSkillProficiencyLevel(skill: Pick<Skill, 'proficiencyLevel' | 'isProficient' | 'isExpert'>): ProficiencyLevel {
  if (skill.proficiencyLevel && PROFICIENCY_LEVELS.includes(skill.proficiencyLevel)) {
    return skill.proficiencyLevel;
  }
  if (skill.isExpert) return 'expertise';
  return skill.isProficient ? 'proficient' : 'none';
}

export function proficiencyBonusForLevel(
  level: ProficiencyLevel,
  proficiencyBonus: number,
): number {
  switch (level) {
    case 'half':
      return Math.floor(proficiencyBonus / 2);
    case 'proficient':
      return proficiencyBonus;
    case 'expertise':
      return proficiencyBonus * 2;
    default:
      return 0;
  }
}

export function nextProficiencyLevel(level: ProficiencyLevel): ProficiencyLevel {
  const currentIndex = PROFICIENCY_LEVELS.indexOf(level);
  return PROFICIENCY_LEVELS[(currentIndex + 1) % PROFICIENCY_LEVELS.length];
}

export function migrateSkillProficiencies(character: CharacterSheet): CharacterSheet {
  return {
    ...character,
    skills: character.skills.map((skill) => {
      const { isProficient: _isProficient, isExpert: _isExpert, ...rest } = skill;
      return { ...rest, proficiencyLevel: getSkillProficiencyLevel(skill) };
    }),
  };
}
