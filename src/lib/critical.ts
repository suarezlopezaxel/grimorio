export interface DiceTerm {
  count: number;
  sides: number;
  sign: 1 | -1;
}

export interface ParsedDiceExpression {
  dice: DiceTerm[];
  modifier: number;
}

export function doubleDice(expr: string): string {
  return expr.replace(/(\d*)d(\d+)/gi, (_, rawCount: string, sides: string) => {
    const count = Number(rawCount || 1);
    return `${count * 2}d${sides}`;
  });
}

export function parseDiceExpression(expr: string): ParsedDiceExpression | null {
  const compact = expr.replace(/\s+/g, '');
  if (!compact) return null;

  const dice: DiceTerm[] = [];
  let modifier = 0;
  let index = 0;

  while (index < compact.length) {
    let sign: 1 | -1 = 1;
    if (compact[index] === '+' || compact[index] === '-') {
      sign = compact[index] === '-' ? -1 : 1;
      index += 1;
    } else if (index !== 0) {
      return null;
    }

    const remaining = compact.slice(index);
    if (dice.length > 0 && (/^[a-záéíóúüñ]/i.test(remaining) || remaining.startsWith('('))) break;
    const diceMatch = /^(\d*)d(\d+)/i.exec(remaining);
    if (diceMatch) {
      const count = Number(diceMatch[1] || 1);
      const sides = Number(diceMatch[2]);
      if (!Number.isSafeInteger(count) || count < 1 || count > 100
        || !Number.isSafeInteger(sides) || sides < 2 || sides > 1000) return null;
      dice.push({ count, sides, sign });
      index += diceMatch[0].length;
      continue;
    }

    const numberMatch = /^\d+/.exec(remaining);
    if (!numberMatch) return null;
    modifier += sign * Number(numberMatch[0]);
    index += numberMatch[0].length;
  }

  return dice.length > 0 && Number.isSafeInteger(modifier) ? { dice, modifier } : null;
}
