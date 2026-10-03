import type { TacticalCard } from '../types';

export type CardResourceUse =
  | { allowed: true; resourceUsed: number }
  | { allowed: false; reason: 'confirmation-required' };

export function useCardResource(card: TacticalCard, confirmedWithoutUses = false): CardResourceUse {
  const maximum = Math.floor(card.resourceMax ?? 0);
  if (!card.consumesResource || maximum <= 0) {
    return { allowed: true, resourceUsed: card.resourceUsed ?? 0 };
  }

  const used = Math.max(0, Math.min(maximum, Math.floor(card.resourceUsed ?? 0)));
  if (used >= maximum && !confirmedWithoutUses) {
    return { allowed: false, reason: 'confirmation-required' };
  }

  return { allowed: true, resourceUsed: Math.min(maximum, used + 1) };
}

export function undoCardResourceUse(card: TacticalCard): number {
  return Math.max(0, Math.floor(card.resourceUsed ?? 0) - 1);
}
