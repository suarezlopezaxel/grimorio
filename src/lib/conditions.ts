import { CONDITIONS } from '../data/conditions';
import type {
  Ability,
  ConditionId,
  DamageModifiers,
  RollKind,
  RollMode,
} from '../types';

export interface ResolvedRollMode {
  mode: RollMode;
  reasons: string[];
  autoFailed?: boolean;
}

export function resolveRollMode(
  base: RollMode,
  conditions: ConditionId[],
  rollKind: RollKind,
  ability?: Ability,
): ResolvedRollMode {
  return resolveRollModeWithExhaustion(base, conditions, rollKind, ability, 0);
}

export function resolveRollModeWithExhaustion(
  base: RollMode,
  conditions: ConditionId[],
  rollKind: RollKind,
  ability: Ability | undefined,
  exhaustionLevel: number,
): ResolvedRollMode {
  let hasAdvantage = base === 'advantage';
  let hasDisadvantage = base === 'disadvantage';
  let autoFailed = false;
  const reasons: string[] = [];

  for (const condition of conditions) {
    const definition = CONDITIONS[condition];
    const effect = definition.effects;
    const grantsAdvantage = rollKind === 'attack' && !!effect.attackAdvantage;
    const grantsDisadvantage = (rollKind === 'attack' && !!effect.attackDisadvantage)
      || (rollKind === 'check' && !!effect.abilityCheckDisadvantage)
      || (rollKind === 'save' && (!!effect.savingThrowDisadvantage
        || (!!ability && effect.savingThrowDisadvantageAbilities?.includes(ability))));
    if (grantsAdvantage) {
      hasAdvantage = true;
      reasons.push(`Ventaja: ${definition.name}`);
    }
    if (grantsDisadvantage) {
      hasDisadvantage = true;
      reasons.push(`Desventaja: ${definition.name}`);
    }
    if (rollKind === 'save' && ability && effect.autoFailSaves?.includes(ability)) {
      autoFailed = true;
      reasons.push(`Fallo automático: ${definition.name}`);
    }
  }

  if (exhaustionRollDisadvantage(exhaustionLevel, rollKind)) {
    hasDisadvantage = true;
    reasons.push(`Desventaja: Agotamiento ${Math.max(0, Math.min(6, Math.floor(exhaustionLevel)))}`);
  }

  if (hasAdvantage && hasDisadvantage) {
    return { mode: 'normal', reasons: ['Ventaja y desventaja se cancelan', ...reasons], autoFailed };
  }
  return {
    mode: hasAdvantage ? 'advantage' : hasDisadvantage ? 'disadvantage' : 'normal',
    reasons: [...new Set(reasons)],
    autoFailed,
  };
}

export function exhaustionRollDisadvantage(level: number, rollKind: RollKind): boolean {
  const exhaustion = Math.max(0, Math.min(6, Math.floor(level)));
  return (rollKind === 'check' && exhaustion >= 1)
    || ((rollKind === 'attack' || rollKind === 'save') && exhaustion >= 3);
}

export function effectiveSpeed(
  speed: number,
  exhaustionLevel: number,
  conditions: ConditionId[],
): number {
  if (conditions.some((condition) => CONDITIONS[condition].effects.speedZero)) return 0;
  const exhaustion = Math.max(0, Math.min(6, Math.floor(exhaustionLevel)));
  if (exhaustion >= 5) return 0;
  return exhaustion >= 2 ? Math.max(0, Math.floor(speed / 2)) : Math.max(0, speed);
}

export function effectiveMaxHitPoints(maxHp: number, exhaustionLevel: number): number {
  if (exhaustionLevel >= 6) return 0;
  return Math.max(1, Math.floor(maxHp / (exhaustionLevel >= 4 ? 2 : 1)));
}

function normalizeDamageType(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase();
}

export function applyDamage(amount: number, type: string, mods: DamageModifiers): number {
  const damage = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
  const normalizedType = normalizeDamageType(type);
  if (!normalizedType) return damage;

  const includesType = (values: string[]) => values.some((item) => normalizeDamageType(item) === normalizedType);
  if (includesType(mods.immunities)) return 0;
  const resistant = includesType(mods.resistances);
  const vulnerable = includesType(mods.vulnerabilities);
  if (resistant && vulnerable) return damage;
  if (resistant) return Math.floor(damage / 2);
  if (vulnerable) return damage * 2;
  return damage;
}
