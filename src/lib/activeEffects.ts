import type { ActiveEffect } from '../types';

export interface AdvancedActiveEffects {
  activeEffects: ActiveEffect[];
  expiredEffects: ActiveEffect[];
}

export function advanceActiveEffects(effects: ActiveEffect[]): AdvancedActiveEffects {
  const activeEffects: ActiveEffect[] = [];
  const expiredEffects: ActiveEffect[] = [];

  for (const effect of effects) {
    if (effect.roundsRemaining === null) {
      activeEffects.push(effect);
      continue;
    }

    const roundsRemaining = Math.max(0, effect.roundsRemaining - 1);
    if (roundsRemaining === 0) {
      expiredEffects.push(effect);
    } else {
      activeEffects.push({ ...effect, roundsRemaining });
    }
  }
  return { activeEffects, expiredEffects };
}

export function removeConcentrationEffects(effects: ActiveEffect[]): ActiveEffect[] {
  return effects.filter((effect) => !effect.requiresConcentration);
}
