import { AbilityKey, GrimoireCard } from '../types/character';

export const getEquippedItems = (cards: GrimoireCard[]) =>
  cards.filter((card) =>
    card.category === 'item'
    && card.equipped
    && card.item,
  );

const getActiveEquippedItems = (cards: GrimoireCard[]) =>
  getEquippedItems(cards).filter((card) =>
    !card.item?.requiresAttunement || card.item.attuned,
  );

export const getItemAbilityBonus = (cards: GrimoireCard[], ability: AbilityKey) =>
  getActiveEquippedItems(cards).reduce(
    (total, card) => total + (card.item?.effects?.abilityBonuses?.[ability] ?? 0),
    0,
  );

export const getEffectiveAbilityScore = (
  cards: GrimoireCard[],
  ability: AbilityKey,
  baseScore: number,
) => {
  const scoreAfterFeats = cards
    .filter((card) => card.category === 'feat' || card.category === 'skill')
    .flatMap((card) => card.featAbilityIncreases ?? (card.featAbility
      ? [{
          ability: card.featAbility,
          amount: card.featModifier ?? 0,
          maxScore: card.featRuleCategory === 'epic_boon' ? 30 : 20,
        }]
      : []))
    .filter((increase) => increase.ability === ability)
    .reduce((score, increase) => increase.amount > 0
      ? (score >= increase.maxScore ? score : Math.min(score + increase.amount, increase.maxScore))
      : score + increase.amount, baseScore);

  return scoreAfterFeats + getItemAbilityBonus(cards, ability);
};

export const getItemEffectTotal = (
  cards: GrimoireCard[],
  effect: 'armorClassBonus' | 'speedBonus' | 'attackBonus' | 'damageBonus',
) =>
  getActiveEquippedItems(cards).reduce(
    (total, card) => total + (card.item?.effects?.[effect] ?? 0),
    0,
  );

export const getEquippedArmorClass = (
  cards: GrimoireCard[],
  baseArmorClass: number,
  dexterityModifier: number,
) => {
  const items = getEquippedItems(cards);
  const armors = items.filter((card) => card.item?.kind === 'armor' && card.item.armorClass != null);
  const shields = items.filter((card) => card.item?.kind === 'shield' && card.item.armorClass != null);
  const armorBase = armors.length
    ? Math.max(...armors.map((card) => {
        const item = card.item!;
        const dexCap = item.maxDexBonus
          ?? (item.armorCategory === 'heavy' ? 0 : item.armorCategory === 'medium' ? 2 : undefined);
        const dexBonus = dexCap == null ? dexterityModifier : Math.min(dexterityModifier, dexCap);
        return item.armorClass! + dexBonus;
      }))
    : baseArmorClass;
  const shieldBonus = shields.reduce((best, card) => Math.max(best, card.item?.armorClass ?? 0), 0);
  return armorBase + shieldBonus + getItemEffectTotal(cards, 'armorClassBonus');
};

export const getEquippedResistances = (cards: GrimoireCard[]) =>
  [...new Set(getActiveEquippedItems(cards).flatMap((card) => card.item?.effects?.resistances ?? []))];

export const getArmorSpeedPenalty = (cards: GrimoireCard[], strengthScore: number) =>
  getEquippedItems(cards).some((card) =>
    card.item?.kind === 'armor'
    && card.item.armorCategory === 'heavy'
    && (card.item.strengthRequirement ?? 0) > strengthScore,
  ) ? 10 : 0;
