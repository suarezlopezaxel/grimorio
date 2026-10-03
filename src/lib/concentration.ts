import type { CombatRoundState, ConcentrationState } from '../types';

export function concentrationDC(damage: number): number {
  return Math.max(10, Math.floor(damage / 2));
}

export function getActiveConcentration(combatState: CombatRoundState): ConcentrationState | null {
  if (combatState.concentration !== undefined) return combatState.concentration;
  return combatState.concentrationSpell
    ? {
        spellName: combatState.concentrationSpell,
        spellLevel: 0,
        startedRound: combatState.round,
      }
    : null;
}
