import type { ActionType, SpellDefinition, TrackedAction } from '../types';

function normalizeActionText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

export function trackedActionForActionType(actionType: ActionType): TrackedAction | null {
  switch (actionType) {
    case 'Acción':
      return 'action';
    case 'Acción Adicional':
      return 'bonusAction';
    case 'Reacción':
      return 'reaction';
    default:
      return null;
  }
}

export function trackedActionForSpell(spell: Pick<SpellDefinition, 'castingTime'>): TrackedAction | null {
  const castingTime = normalizeActionText(spell.castingTime);
  if (/\breaccion\b/.test(castingTime)) return 'reaction';
  if (/accion\s+adicional|bonus action/.test(castingTime)) return 'bonusAction';
  if (/\baccion\b|action/.test(castingTime)) return 'action';
  return null;
}

export function combatFlagForAction(action: TrackedAction): 'actionUsed' | 'bonusActionUsed' | 'reactionUsed' {
  switch (action) {
    case 'action':
      return 'actionUsed';
    case 'bonusAction':
      return 'bonusActionUsed';
    case 'reaction':
      return 'reactionUsed';
  }
}
