import type { SpellDefinition } from '../types';
import { parseDiceExpression } from './critical';

export function isValidUpcastDice(expression: string): boolean {
  if (!/^\s*\d*d\d+(?:\s*\+\s*\d*d\d+)*\s*$/i.test(expression)) return false;
  const parsed = parseDiceExpression(expression);
  return !!parsed
    && parsed.dice.length > 0
    && parsed.modifier === 0
    && parsed.dice.every((die) => die.sign > 0);
}

function splitDamageExpression(expression: string): { diceExpression: string; suffix: string } | null {
  const match = /^(\s*[+-]?\s*(?:\d*d\d+|\d+)(?:\s*[+-]\s*(?:\d*d\d+|\d+))*)(.*)$/i.exec(expression);
  if (!match || !parseDiceExpression(match[1])) return null;
  return { diceExpression: match[1].replace(/\s+/g, ''), suffix: match[2] };
}

export function upcastDamage(
  baseExpr: string,
  upcast: SpellDefinition['upcast'] | undefined,
  baseLevel: number,
  slotLevel: number,
): string {
  const split = splitDamageExpression(baseExpr);
  if (!split || !upcast || slotLevel <= baseLevel) return baseExpr;

  if (!isValidUpcastDice(upcast.dicePerLevel)) return baseExpr;
  const perLevel = parseDiceExpression(upcast.dicePerLevel);
  if (!perLevel) return baseExpr;

  const base = parseDiceExpression(split.diceExpression);
  if (!base) return baseExpr;
  const dice = [...base.dice];
  const levelsAdded = Math.max(0, Math.floor(slotLevel) - Math.floor(baseLevel));
  for (let level = 0; level < levelsAdded; level += 1) {
    perLevel.dice.forEach((term) => dice.push({ ...term }));
  }

  const consolidated = new Map<string, number>();
  dice.forEach((term) => {
    const key = `${term.sign}:${term.sides}`;
    consolidated.set(key, (consolidated.get(key) ?? 0) + term.count);
  });
  const dicePart = Array.from(consolidated.entries())
    .filter(([, count]) => count > 0)
    .map(([key, count], index) => {
      const [sign, sides] = key.split(':');
      const signPrefix = sign === '-1' ? '-' : index > 0 ? '+' : '';
      return `${signPrefix}${count}d${sides}`;
    })
    .join('');
  const modifierPart = base.modifier === 0
    ? ''
    : `${base.modifier > 0 ? '+' : ''}${base.modifier}`;
  return `${dicePart}${modifierPart}${split.suffix}`;
}
