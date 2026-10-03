import type { CharacterSheet, Currency, InventoryItem } from '../types';

export const EMPTY_CURRENCY: Currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

export function currencyInGold(currency: Currency): number {
  return currency.cp / 100 + currency.sp / 10 + currency.ep / 2
    + currency.gp + currency.pp * 10;
}

export function inventoryWeight(items: InventoryItem[]): number {
  return items.reduce((total, item) => total + (item.weight ?? 0) * item.quantity, 0);
}

export function attunedItemCount(items: InventoryItem[]): number {
  return items.filter((item) => item.attuned).length;
}

export function computeAC(character: CharacterSheet): number {
  if (character.manualArmorClass === true) return character.armorClass;

  const equipment = character.inventory ?? [];
  const armor = equipment.find((item) => item.equipped && item.kind === 'armor' && item.armor);
  const shield = equipment.find((item) => item.equipped && item.kind === 'shield');
  const shieldBonus = shield?.shieldBonus ?? 0;
  const dexterityModifier = character.abilities.DES.modifier;

  if (!armor?.armor) return 10 + dexterityModifier + shieldBonus;

  const dexterityBonus = armor.armor.dexCap === null
    ? dexterityModifier
    : Math.min(dexterityModifier, armor.armor.dexCap);
  return armor.armor.base + dexterityBonus + shieldBonus;
}
