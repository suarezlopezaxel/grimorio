import type { CharacterSheet, HitDicePool } from '../types';

function isHitDieSize(value: number): value is HitDicePool['dieSize'] {
  return value === 6 || value === 8 || value === 10 || value === 12;
}

function getClassHitDie(characterClass: string): HitDicePool['dieSize'] {
  const name = characterClass.toLocaleLowerCase('es');
  if (name.includes('bárbaro') || name.includes('barbaro')) return 12;
  if (['guerrero', 'paladín', 'paladin', 'explorador'].some((className) => name.includes(className))) return 10;
  if (name.includes('mago') || name.includes('hechicero')) return 6;
  return 8;
}

export function parseHitDice(expression: string): { count: number; dieSize: HitDicePool['dieSize'] } | null {
  const match = /^\s*(\d+)\s*d\s*(6|8|10|12)\s*$/i.exec(expression);
  if (!match) return null;

  const count = Number(match[1]);
  const dieSize = Number(match[2]);
  if (!Number.isSafeInteger(count) || count < 1 || !isHitDieSize(dieSize)) return null;
  return { count, dieSize };
}

export function getHitDicePool(character: CharacterSheet): HitDicePool {
  const total = Math.max(1, Math.floor(character.level));
  const existing = character.hitDicePool;
  if (existing && isHitDieSize(existing.dieSize) && Number.isFinite(existing.total) && existing.total > 0) {
    const previousTotal = Math.floor(existing.total);
    if (previousTotal < 1) return getDefaultHitDicePool(character, total);
    const remaining = Number.isFinite(existing.remaining)
      ? Math.max(0, Math.min(previousTotal, Math.floor(existing.remaining)))
      : 0;
    const scaledRemaining = previousTotal === total
      ? remaining
      : Math.floor((remaining / previousTotal) * total);
    return {
      dieSize: existing.dieSize,
      total,
      remaining: Math.max(0, Math.min(total, scaledRemaining)),
    };
  }

  return getDefaultHitDicePool(character, total);
}

function getDefaultHitDicePool(character: CharacterSheet, total: number): HitDicePool {
  const parsed = parseHitDice(character.hitDice);
  return {
    dieSize: parsed?.dieSize ?? getClassHitDie(character.characterClass),
    total,
    remaining: total,
  };
}

export function updateHitDicePoolForLevel(
  pool: HitDicePool,
  newLevel: number,
): HitDicePool {
  const total = Math.max(1, Math.floor(newLevel));
  const validTotal = Number.isFinite(pool.total) && pool.total > 0 ? pool.total : total;
  const validRemaining = Number.isFinite(pool.remaining)
    ? Math.max(0, Math.min(validTotal, pool.remaining))
    : validTotal;
  const remaining = validTotal > 0
    ? Math.floor((validRemaining / validTotal) * total)
    : total;
  return {
    dieSize: pool.dieSize,
    total,
    remaining: Math.max(0, Math.min(total, remaining)),
  };
}

export function updateHitDiceDieSize(
  expression: string,
  character: CharacterSheet,
): HitDicePool {
  const pool = getHitDicePool(character);
  const parsed = parseHitDice(expression);
  return {
    ...pool,
    dieSize: parsed?.dieSize ?? getClassHitDie(character.characterClass),
  };
}

export function shortRestHeal(rolls: number[], conMod: number): number {
  return rolls.reduce((healing, roll) => healing + Math.max(0, roll + conMod), 0);
}

export function longRestHitDiceRecovery(total: number): number {
  return Math.max(1, Math.floor(total / 2));
}
