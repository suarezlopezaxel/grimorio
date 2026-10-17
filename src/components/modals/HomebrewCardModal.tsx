import React, { useEffect, useMemo, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { AbilityKey, CharacterSheet, ClassId, FeatAbilityIncrease, GrimoireCard, ItemCardData } from '../../types/character';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (card: GrimoireCard) => void;
  cardToEdit?: GrimoireCard | null;
  character: CharacterSheet;
}

export const HomebrewCardModal: React.FC<Props> = ({ isOpen, onClose, onSaveCard, cardToEdit, character }) => {
  const [category, setCategory] = useState<GrimoireCard['category']>(
    cardToEdit?.category === 'skill' ? 'feat' : cardToEdit?.category || 'attack',
  );
  const [name, setName] = useState(cardToEdit?.name || '');

  const [sourceText, setSourceText] = useState<string>((cardToEdit as any)?.source || 'homebrew');

  // Origen (texto libre)
  // Extra usos por turno (acción/acción adicional/reacción)
  const [extraTurnKind, setExtraTurnKind] = useState<NonNullable<GrimoireCard['extraTurnUses']>['kind']>(
    cardToEdit?.extraTurnUses?.kind || 'action',
  );
  const [extraTurnUses, setExtraTurnUses] = useState<number>(cardToEdit?.extraTurnUses?.extraUses ?? 0);

  // Re-hidratar estado cuando se edita una carta distinta.
  // Mantiene consistencia para campos fuera del form actual.
  //
  //   setCategory(cardToEdit.category);
  //   setName(cardToEdit.name || '');
  //   setActionType(
  //     cardToEdit.actionType || (cardToEdit.category === 'reaction' ? 'reaction' : 'action'),
  //   );
  //   setDescription(cardToEdit.description || '');
  //   setTagsText((cardToEdit.tags || []).join(', '));
  //   setUsesMax(cardToEdit.uses?.max ?? 0);
  //   setRecharge(cardToEdit.uses?.recharge || 'none');
  //   setShowInSheet(cardToEdit.showIn?.sheet ?? true);
  //   setShowInCombat(cardToEdit.showIn?.combat ?? false);
  //
  //   // skill/item shared fields
  //   setPropertiesText((cardToEdit.properties || []).join(', '));
  //
  //   const firstEffect = cardToEdit.effects?.[0];
  //   setEffectsText(
  //     firstEffect ? `${(firstEffect as any).dice || ''} ${(firstEffect as any).type || ''}`.trim() : '',
  //   );
  //
  //   setHigherLevelsText(
  //     cardToEdit.higherLevels?.length
  //       ? `${(cardToEdit.higherLevels[0] as any).dice || ''}`.trim()
  //       : '',
  //   );
  //
  //   setEquipped(!!cardToEdit.equipped);
  // }, [cardToEdit]);

  const [actionType, setActionType] = useState<GrimoireCard['actionType']>(
    cardToEdit?.actionType || (cardToEdit?.category === 'reaction' ? 'reaction' : 'Acción'),
  );

  const [description, setDescription] = useState(cardToEdit?.description || '');
  const [featCategory, setFeatCategory] = useState(cardToEdit?.featCategory || '');
  const [featRuleCategory, setFeatRuleCategory] = useState<NonNullable<GrimoireCard['featRuleCategory']>>(
    cardToEdit?.featRuleCategory || 'origin',
  );
  const [featPrerequisite, setFeatPrerequisite] = useState(cardToEdit?.featPrerequisite || '');
  const [featMinimumLevel, setFeatMinimumLevel] = useState(
    cardToEdit?.featMinimumLevel ?? (cardToEdit?.featRuleCategory === 'epic_boon' ? 19 : cardToEdit?.featRuleCategory === 'general' ? 4 : 1),
  );
  const [featRequiredClass, setFeatRequiredClass] = useState<ClassId | ''>(cardToEdit?.featRequiredClass || '');
  const [featRequiredAbility, setFeatRequiredAbility] = useState<AbilityKey | ''>(cardToEdit?.featRequiredAbility || '');
  const [featRequiredAbilityScore, setFeatRequiredAbilityScore] = useState(cardToEdit?.featRequiredAbilityScore ?? 13);
  const [featRepeatable, setFeatRepeatable] = useState(cardToEdit?.featRepeatable ?? false);
  const [featAbilityIncreases, setFeatAbilityIncreases] = useState<FeatAbilityIncrease[]>(() => {
    if (cardToEdit?.featAbilityIncreases) return cardToEdit.featAbilityIncreases;
    if (cardToEdit?.featAbility) {
      return [{
        ability: cardToEdit.featAbility,
        amount: cardToEdit.featModifier ?? 0,
        maxScore: cardToEdit.featRuleCategory === 'epic_boon' ? 30 : 20,
      }];
    }
    return [];
  });
  const [featSkillProficiencies, setFeatSkillProficiencies] = useState<string[]>(cardToEdit?.featSkillProficiencies || []);
  const [featExpertiseSkills, setFeatExpertiseSkills] = useState<string[]>(cardToEdit?.featExpertiseSkills || []);
  const [featAdditionalBenefits, setFeatAdditionalBenefits] = useState(cardToEdit?.featAdditionalBenefits || '');
  const [featValidationError, setFeatValidationError] = useState('');

  const [tagsText, setTagsText] = useState<string>((cardToEdit?.tags || []).join(', '));
  const parsedTags = useMemo(() => {
    return tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsText]);

  const [usesMax, setUsesMax] = useState<number>(cardToEdit?.uses?.max ?? 0);
  const [recharge, setRecharge] = useState<GrimoireCard['uses']['recharge']>(cardToEdit?.uses?.recharge || 'none');

  const [showInSheet, setShowInSheet] = useState<boolean>(cardToEdit?.showIn?.sheet ?? true);
  const [showInCombat, setShowInCombat] = useState<boolean>(cardToEdit?.showIn?.combat ?? true);

  // attack
  const [attackType, setAttackType] = useState<NonNullable<GrimoireCard['attackType']> | ''>(cardToEdit?.attackType || '');
  const [baseWeapon, setBaseWeapon] = useState<string>(cardToEdit?.baseWeapon || '');
  const [ability, setAbility] = useState<AbilityKey | ''>((cardToEdit?.ability as AbilityKey) || '');
  const [proficient, setProficient] = useState<boolean>(cardToEdit?.proficient ?? false);
  const [magicBonus, setMagicBonus] = useState<number>(cardToEdit?.magicBonus ?? 0);
  const [rangeNormal, setRangeNormal] = useState<number>(cardToEdit?.range?.normal ?? 5);
  const [rangeLong, setRangeLong] = useState<number>(cardToEdit?.range?.long ?? 60);
  interface DamageEntry {
    count: number;
    die: string;
    type: string;
  }

  const [damageEntries, setDamageEntries] = useState<DamageEntry[]>(() => {
    if (cardToEdit?.damage && cardToEdit.damage.length > 0) {
      return cardToEdit.damage.map((d: any) => {
        const match = (d.dice || '1d8').match(/(\d*)d(\d+)/i);
        const count = match && match[1] ? parseInt(match[1], 10) : 1;
        const dieVal = match && match[2] ? `d${match[2]}` : 'd8';
        return {
          count: isNaN(count) ? 1 : count,
          die: ['d4', 'd6', 'd8', 'd10', 'd12'].includes(dieVal) ? dieVal : 'd8',
          type: d.type || 'Daño',
        };
      });
    }
    return [{ count: 1, die: 'd8', type: 'Daño' }];
  });

  const [propertiesText, setPropertiesText] = useState<string>((cardToEdit?.properties || []).join(', '));
  const parsedProperties = useMemo(() => propertiesText.split(',').map((p) => p.trim()).filter(Boolean), [propertiesText]);
  const [equipped, setEquipped] = useState<boolean>(cardToEdit?.equipped ?? false);
  const [itemKind, setItemKind] = useState<ItemCardData['kind']>(cardToEdit?.item?.kind ?? 'gear');
  const [itemRarity, setItemRarity] = useState(cardToEdit?.item?.rarity ?? '');
  const [itemQuantity, setItemQuantity] = useState(cardToEdit?.item?.quantity ?? 1);
  const [itemWeight, setItemWeight] = useState(cardToEdit?.item?.weight ?? 0);
  const [itemValue, setItemValue] = useState(cardToEdit?.item?.value ?? '');
  const [requiresAttunement, setRequiresAttunement] = useState(cardToEdit?.item?.requiresAttunement ?? false);
  const [attuned, setAttuned] = useState(cardToEdit?.item?.attuned ?? false);
  const [itemArmorCategory, setItemArmorCategory] = useState<ItemCardData['armorCategory']>(cardToEdit?.item?.armorCategory ?? 'light');
  const [itemArmorClass, setItemArmorClass] = useState(cardToEdit?.item?.armorClass ?? 0);
  const [itemStrengthRequirement, setItemStrengthRequirement] = useState(cardToEdit?.item?.strengthRequirement ?? 0);
  const [itemStealthDisadvantage, setItemStealthDisadvantage] = useState(cardToEdit?.item?.stealthDisadvantage ?? false);
  const [itemMaxDexBonus, setItemMaxDexBonus] = useState(cardToEdit?.item?.maxDexBonus ?? -1);
  const [itemWeaponAbility, setItemWeaponAbility] = useState<AbilityKey>(cardToEdit?.item?.weaponAbility ?? 'FUE');
  const [itemWeaponProficient, setItemWeaponProficient] = useState(cardToEdit?.item?.weaponProficient ?? false);
  const [itemWeaponDamage, setItemWeaponDamage] = useState(cardToEdit?.item?.weaponDamage ?? '');
  const [itemWeaponDamageType, setItemWeaponDamageType] = useState(cardToEdit?.item?.weaponDamageType ?? '');
  const [itemWeaponRange, setItemWeaponRange] = useState(cardToEdit?.item?.weaponRange ?? '');
  const [itemAbilityBonuses, setItemAbilityBonuses] = useState<Partial<Record<AbilityKey, number>>>(
    cardToEdit?.item?.effects?.abilityBonuses ?? {},
  );
  const [itemArmorBonus, setItemArmorBonus] = useState(cardToEdit?.item?.effects?.armorClassBonus ?? 0);
  const [itemSpeedBonus, setItemSpeedBonus] = useState(cardToEdit?.item?.effects?.speedBonus ?? 0);
  const [itemAttackBonus, setItemAttackBonus] = useState(cardToEdit?.item?.effects?.attackBonus ?? 0);
  const [itemDamageBonus, setItemDamageBonus] = useState(cardToEdit?.item?.effects?.damageBonus ?? 0);
  const [itemResistancesText, setItemResistancesText] = useState(
    (cardToEdit?.item?.effects?.resistances ?? []).join(', '),
  );
  const [itemValidationError, setItemValidationError] = useState('');

  const [hitBonusOrDc, setHitBonusOrDc] = useState<string>((cardToEdit as any)?.hitBonusOrDc || '');
  const [targetOrArea, setTargetOrArea] = useState<string>((cardToEdit as any)?.targetOrArea || '');

  // spell
  const [level, setLevel] = useState<number>(cardToEdit?.level ?? 0);
  const [school, setSchool] = useState<string>(cardToEdit?.school || '');
  const [castingTime, setCastingTime] = useState<string>(cardToEdit?.castingTime || 'acción');
  // Texto libre de alcance (ej. "5 ft / 60 ft" o "Libre")
  const [reachText, setReachText] = useState<string>(cardToEdit?.reach ?? (typeof (cardToEdit as any)?.range === 'string' ? (cardToEdit as any).range : ''));

  const [rangeText, setRangeText] = useState<string>('');
  const [duration, setDuration] = useState<string>(cardToEdit?.duration || 'instantáneo');
  const [concentration, setConcentration] = useState<boolean>(cardToEdit?.concentration ?? false);
  const [ritual, setRitual] = useState<boolean>(cardToEdit?.ritual ?? false);
  const [resolution, setResolution] = useState<'attack' | 'save' | 'none'>((cardToEdit?.resolution as any) || 'attack');
  const [saveAbility, setSaveAbility] = useState<AbilityKey | ''>((cardToEdit?.save?.ability as AbilityKey) || '');
  const [saveOnSuccess, setSaveOnSuccess] = useState<'none' | 'half' | 'other'>(cardToEdit?.save?.onSuccess || 'half');
  const [effectsText, setEffectsText] = useState<string>(() => {
    const first = cardToEdit?.effects?.[0];
    return first ? `${first.dice} ${first.type}` : '';
  });
  const [higherLevelsText, setHigherLevelsText] = useState<string>(cardToEdit?.higherLevels?.[0]?.dice ?? '');
  const [classesText, setClassesText] = useState<string>('');

  // reaction
  const [triggerText, setTriggerText] = useState<string>((cardToEdit as any)?.trigger || '');
  const [effectText, setEffectText] = useState<string>((cardToEdit as any)?.effect || '');

  useEffect(() => {
    if (!isOpen) return;
    if (!cardToEdit) {
      setCategory('attack');
      setName('');
      setActionType('Acción');
      setDescription('');
      setTagsText('');
      setUsesMax(0);
      setRecharge('none');
      setFeatCategory('');
      setFeatRuleCategory('origin');
      setFeatPrerequisite('');
      setFeatMinimumLevel(1);
      setFeatRequiredClass('');
      setFeatRequiredAbility('');
      setFeatRequiredAbilityScore(13);
      setFeatRepeatable(false);
      setFeatAbilityIncreases([]);
      setFeatSkillProficiencies([]);
      setFeatExpertiseSkills([]);
      setFeatAdditionalBenefits('');
      setFeatValidationError('');
      setItemKind('gear');
      setItemRarity('');
      setItemQuantity(1);
      setItemWeight(0);
      setItemValue('');
      setRequiresAttunement(false);
      setAttuned(false);
      setItemArmorCategory('light');
      setItemArmorClass(0);
      setItemStrengthRequirement(0);
      setItemStealthDisadvantage(false);
      setItemMaxDexBonus(-1);
      setItemWeaponAbility('FUE');
      setItemWeaponProficient(false);
      setItemWeaponDamage('');
      setItemWeaponDamageType('');
      setItemWeaponRange('');
      setItemAbilityBonuses({});
      setItemArmorBonus(0);
      setItemSpeedBonus(0);
      setItemAttackBonus(0);
      setItemDamageBonus(0);
      setItemResistancesText('');
      setItemValidationError('');
      return;
    }
    setFeatCategory(cardToEdit.featCategory || '');
    setFeatRuleCategory(cardToEdit.featRuleCategory || 'origin');
    setFeatPrerequisite(cardToEdit.featPrerequisite || '');
    setFeatMinimumLevel(
      cardToEdit.featMinimumLevel
        ?? (cardToEdit.featRuleCategory === 'epic_boon' ? 19 : cardToEdit.featRuleCategory === 'general' ? 4 : 1),
    );
    setFeatRequiredClass(cardToEdit.featRequiredClass || '');
    setFeatRequiredAbility(cardToEdit.featRequiredAbility || '');
    setFeatRequiredAbilityScore(cardToEdit.featRequiredAbilityScore ?? 13);
    setFeatRepeatable(cardToEdit.featRepeatable ?? false);
    setFeatAbilityIncreases(cardToEdit.featAbilityIncreases || (
      cardToEdit.featAbility
        ? [{
            ability: cardToEdit.featAbility,
            amount: cardToEdit.featModifier ?? 0,
            maxScore: cardToEdit.featRuleCategory === 'epic_boon' ? 30 : 20,
          }]
        : []
    ));
    setFeatSkillProficiencies(cardToEdit.featSkillProficiencies || []);
    setFeatExpertiseSkills(cardToEdit.featExpertiseSkills || []);
    setFeatAdditionalBenefits(cardToEdit.featAdditionalBenefits || '');
    setFeatValidationError('');

    setExtraTurnKind(cardToEdit.extraTurnUses?.kind || 'action');
    setExtraTurnUses(cardToEdit.extraTurnUses?.extraUses ?? 0);
  }, [isOpen, cardToEdit]);

  useEffect(() => {
    if (!cardToEdit) return;
    setCategory(cardToEdit.category === 'skill' ? 'feat' : cardToEdit.category);
    setName(cardToEdit.name);
    setActionType(cardToEdit.actionType);
    setDescription(cardToEdit.description);
    setFeatCategory(cardToEdit.featCategory || '');
    setUsesMax(cardToEdit.uses?.max ?? 0);
    setRecharge(cardToEdit.uses?.recharge || 'none');
    setShowInSheet(cardToEdit.showIn?.sheet ?? true);
    setShowInCombat(cardToEdit.showIn?.combat ?? true);
    setTagsText((cardToEdit.tags || []).join(', '));
    setAttackType(cardToEdit.attackType || '');
    setBaseWeapon(cardToEdit.baseWeapon || '');
    setAbility((cardToEdit.ability as AbilityKey) || '');
    setProficient(cardToEdit.proficient ?? false);
    setMagicBonus(cardToEdit.magicBonus ?? 0);
    setRangeNormal(cardToEdit.range?.normal ?? 5);
    setRangeLong(cardToEdit.range?.long ?? 60);
    if (cardToEdit.damage && cardToEdit.damage.length > 0) {
      setDamageEntries(
        cardToEdit.damage.map((d: any) => {
          const match = (d.dice || '1d8').match(/(\d*)d(\d+)/i);
          const count = match && match[1] ? parseInt(match[1], 10) : 1;
          const dieVal = match && match[2] ? `d${match[2]}` : 'd8';
          return {
            count: isNaN(count) ? 1 : count,
            die: ['d4', 'd6', 'd8', 'd10', 'd12'].includes(dieVal) ? dieVal : 'd8',
            type: d.type || 'Daño',
          };
        })
      );
    } else {
      setDamageEntries([{ count: 1, die: 'd8', type: 'Daño' }]);
    }
    setPropertiesText((cardToEdit.properties || []).join(', '));
    setEquipped(cardToEdit.equipped ?? false);
    setItemKind(cardToEdit.item?.kind ?? 'gear');
    setItemRarity(cardToEdit.item?.rarity ?? '');
    setItemQuantity(cardToEdit.item?.quantity ?? 1);
    setItemWeight(cardToEdit.item?.weight ?? 0);
    setItemValue(cardToEdit.item?.value ?? '');
    setRequiresAttunement(cardToEdit.item?.requiresAttunement ?? false);
    setAttuned(cardToEdit.item?.attuned ?? false);
    setItemArmorCategory(cardToEdit.item?.armorCategory ?? 'light');
    setItemArmorClass(cardToEdit.item?.armorClass ?? 0);
    setItemStrengthRequirement(cardToEdit.item?.strengthRequirement ?? 0);
    setItemStealthDisadvantage(cardToEdit.item?.stealthDisadvantage ?? false);
    setItemMaxDexBonus(cardToEdit.item?.maxDexBonus ?? -1);
    setItemWeaponAbility(cardToEdit.item?.weaponAbility ?? 'FUE');
    setItemWeaponProficient(cardToEdit.item?.weaponProficient ?? false);
    setItemWeaponDamage(cardToEdit.item?.weaponDamage ?? '');
    setItemWeaponDamageType(cardToEdit.item?.weaponDamageType ?? '');
    setItemWeaponRange(cardToEdit.item?.weaponRange ?? '');
    setItemAbilityBonuses(cardToEdit.item?.effects?.abilityBonuses ?? {});
    setItemArmorBonus(cardToEdit.item?.effects?.armorClassBonus ?? 0);
    setItemSpeedBonus(cardToEdit.item?.effects?.speedBonus ?? 0);
    setItemAttackBonus(cardToEdit.item?.effects?.attackBonus ?? 0);
    setItemDamageBonus(cardToEdit.item?.effects?.damageBonus ?? 0);
    setItemResistancesText((cardToEdit.item?.effects?.resistances ?? []).join(', '));
    setItemValidationError('');
    setLevel(cardToEdit.level ?? 0);
    setSchool(cardToEdit.school || '');
    setCastingTime(cardToEdit.castingTime || 'acción');
    setDuration(cardToEdit.duration || 'instantáneo');
    setConcentration(cardToEdit.concentration ?? false);
    setRitual(cardToEdit.ritual ?? false);
    setResolution((cardToEdit.resolution as any) || 'attack');
    setSaveAbility((cardToEdit.save?.ability as AbilityKey) || '');
    setSaveOnSuccess(cardToEdit.save?.onSuccess || 'half');
    setEffectsText(() => {
      const e0 = cardToEdit.effects?.[0];
      return e0 ? `${e0.dice} ${e0.type}` : '';
    });
    setTriggerText((cardToEdit as any).trigger || '');
    setEffectText((cardToEdit as any).effect || '');

    // attack fields
    setHitBonusOrDc((cardToEdit as any).hitBonusOrDc || '');
    setTargetOrArea((cardToEdit as any).targetOrArea || '');
  }, [cardToEdit]);
  // legacy block removed during refactor

  // NOTE: Bloque legacy `newCard` eliminado.
  // La creación del payload ahora se hace exclusivamente en `handleSubmit`.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (category === 'item' && (itemKind === 'armor' || itemKind === 'shield') && itemArmorClass <= 0) {
      setItemValidationError('Indica una CA base o un bonificador de CA mayor que cero.');
      return;
    }
    if (category === 'item' && requiresAttunement && attuned) {
      const attunedCount = character.cards.filter((card) =>
        card.id !== cardToEdit?.id && card.item?.requiresAttunement && card.item.attuned,
      ).length;
      if (attunedCount >= 3) {
        setItemValidationError('Un personaje solo puede estar sintonizado con tres objetos a la vez.');
        return;
      }
    }
    setItemValidationError('');
    const requiredLevel = Math.max(
      featMinimumLevel,
      featRuleCategory === 'epic_boon' ? 19 : featRuleCategory === 'general' ? 4 : 1,
    );
    if (category === 'feat') {
      if (character.level < requiredLevel) {
        setFeatValidationError(`Esta dote requiere nivel ${requiredLevel}; tu personaje es nivel ${character.level}.`);
        return;
      }
      if (featRequiredClass && character.classId !== featRequiredClass) {
        setFeatValidationError(`Esta dote requiere la clase ${featRequiredClass}.`);
        return;
      }
      const requiredAbilityScore = featRequiredAbility
        ? character.cards
            .filter((card) => card.id !== cardToEdit?.id && card.category === 'feat')
            .flatMap((card) => card.featAbilityIncreases || (
              card.featAbility
                ? [{
                    ability: card.featAbility,
                    amount: card.featModifier ?? 0,
                    maxScore: card.featRuleCategory === 'epic_boon' ? 30 : 20,
                  }]
                : []
            ))
            .filter((increase) => increase.ability === featRequiredAbility)
            .reduce((score, increase) => increase.amount > 0
              ? (score >= increase.maxScore ? score : Math.min(score + increase.amount, increase.maxScore))
              : score + increase.amount, character.abilities[featRequiredAbility].score)
        : 0;
      if (featRequiredAbility && requiredAbilityScore < featRequiredAbilityScore) {
        setFeatValidationError(`Esta dote requiere ${featRequiredAbility} ${featRequiredAbilityScore} o más.`);
        return;
      }
      const alreadyOwned = character.cards.some((card) =>
        card.id !== cardToEdit?.id
        && (card.category === 'feat' || card.category === 'skill')
        && (card.name || card.title).trim().toLowerCase() === name.trim().toLowerCase()
      );
      if (alreadyOwned && !featRepeatable) {
        setFeatValidationError('Esta dote ya está registrada y no se puede repetir.');
        return;
      }
      setFeatValidationError('');
    }
    const common = {
      id: cardToEdit?.id || `card-${Date.now()}`,
      name: name.trim(),
      title: name.trim(),
      category,
      actionType: category === 'reaction' ? ('Reacción' as const) : (actionType as any),
      reach: (reachText ?? '').trim(),
      hitBonusOrDc: hitBonusOrDc,
      targetOrArea: targetOrArea, 
      primaryDamageOrEffect: '',
      secondaryEffect: undefined,
      resourceDesc: undefined,
      resourceMax: undefined,
      resourceUsed: undefined,
      consumesResource: undefined,
      description,
      source: sourceText.trim() || 'homebrew',
      tags: parsedTags,
      uses: {
        max: usesMax > 0 ? usesMax : 0,
        current: usesMax > 0 ? Math.min(cardToEdit?.uses?.current ?? usesMax, usesMax) : 0,
        recharge,
      },
      showIn: { sheet: showInSheet, combat: showInCombat },
    };

    if (category === 'feat') {
      onSaveCard({
        ...common,
        featCategory: featCategory.trim(),
        featRuleCategory,
        featPrerequisite: featPrerequisite.trim(),
        featMinimumLevel: requiredLevel,
        featRequiredClass: featRequiredClass || undefined,
        featRequiredAbility: featRequiredAbility || undefined,
        featRequiredAbilityScore: featRequiredAbility ? featRequiredAbilityScore : undefined,
        featRepeatable,
        featAbilityIncreases,
        featSkillProficiencies,
        featExpertiseSkills,
        featAdditionalBenefits: featAdditionalBenefits.trim(),
      } as GrimoireCard);
      onClose();
      return;
    }

    const buildAttack = (): GrimoireCard => {
      const effectOrDamageStr = damageEntries.map((e) => `${e.count}${e.die} ${e.type}`).join(' + ');
      return {
        ...(common as any),
        effectOrDamage: effectOrDamageStr ? effectOrDamageStr : undefined,
        range: undefined,
        attackType: attackType ? (attackType as any) : undefined,
        baseWeapon: baseWeapon || undefined,
        ability: (ability || undefined) as any,
        proficient,
        magicBonus,
        damage: damageEntries.map((e) => ({
          dice: `${e.count}${e.die}`,
          mod: 0,
          type: e.type || 'Daño',
        })) as any,
        properties: parsedProperties,
        equipped,
        extraTurnUses: extraTurnUses > 0 ? { kind: extraTurnKind, extraUses: extraTurnUses } : undefined,
      };
    };

    const parseEffects = () => {
      const txt = effectsText.trim();
      if (!txt) return null;
      const parts = txt.split(' ');
      const dice = parts[0] || '1d8';
      const rest = parts.slice(1).join(' ');
      const type: 'damage' | 'healing' = rest.toLowerCase().includes('cur') ? 'healing' : 'damage';
      return { dice, type };
    };

    const buildSpell = (): GrimoireCard => {
      const effectOrDamageStr = damageEntries.map((e) => `${e.count}${e.die} ${e.type}`).join(' + ');
      return {
        ...(common as any),
        effectOrDamage: effectOrDamageStr ? effectOrDamageStr : undefined,
        range: rangeNormal && rangeLong ? `${rangeNormal}/${rangeLong}` : undefined,
        level,
        school: school || undefined,
        castingTime,
        duration,
        concentration: level === 0 ? false : concentration,
        ritual: level === 0 ? false : ritual,
        resolution,
        save:
          resolution === 'save' && saveAbility
            ? { ability: saveAbility as any, onSuccess: saveOnSuccess }
            : undefined,
        damage: damageEntries.map((e) => ({
          dice: `${e.count}${e.die}`,
          mod: 0,
          type: e.type || 'Daño',
        })) as any,
        effects: undefined,
        cantripScaling: level === 0 ? undefined : undefined,
      };
    };

    const buildReaction = (): GrimoireCard => {
      const effectOrDamageStr = damageEntries
        .map((e) => `${e.count}${e.die} ${e.type}`)
        .join(' + ');

      return {
        ...(common as any),
        actionType: 'reaction',
        trigger: triggerText.trim() || 'Cuando... ',
        effect: effectText || undefined,
        effectOrDamage: effectOrDamageStr ? effectOrDamageStr : undefined,
        damage: damageEntries.map((e) => ({
          dice: `${e.count}${e.die}`,
          mod: 0,
          type: e.type || 'Daño',
        })) as any,
      } as any;
    };

    if (category === 'attack') {
      onSaveCard(buildAttack());
      onClose();
      return;
    }
    if (category === 'spell') {
      onSaveCard(buildSpell());
      onClose();
      return;
    }
    if (category === 'reaction') {
      onSaveCard(buildReaction());
      onClose();
      return;
    }

    const buildSkill = (): GrimoireCard => {
      const eff = effectsText.trim();
      const effects = eff
        ? (() => {
            const [a, ...rest] = eff.split(' ');
            const dice = a || '1d6';
            const typeText = rest.join(' ').trim().toLowerCase();
            const type: 'damage' | 'healing' = typeText.includes('cur') ? 'healing' : 'damage';
            return [{ dice, type }];
          })()
        : undefined;

      return {
        ...(common as any),
        effectOrDamage: effectsText.trim() ? effectsText.trim() : undefined,
        equipped,
        properties: parsedProperties,
        resolution,
        save:
          resolution === 'save' && saveAbility
            ? { ability: saveAbility as any, onSuccess: saveOnSuccess }
            : undefined,
        effects: effects ? (effects as any) : undefined,
        higherLevels: higherLevelsText.trim()
          ? [{ level: 0, dice: higherLevelsText.trim() } as any]
          : undefined,
      } as any;
    };

    const buildItem = (): GrimoireCard => {
      const effectOrDamageStr = damageEntries
        .map((e) => `${e.count}${e.die} ${e.type}`)
        .join(' + ');

      return {
        ...(common as any),
        effectOrDamage: effectOrDamageStr ? effectOrDamageStr : undefined,
        equipped,
        damage: damageEntries.map((e) => ({
          dice: `${e.count}${e.die}`,
          mod: 0,
          type: e.type || 'Daño',
        })) as any,
        item: {
          kind: itemKind,
          rarity: itemRarity.trim() || undefined,
          quantity: Math.max(0, itemQuantity || 0),
          weight: Math.max(0, itemWeight || 0),
          value: itemValue.trim(),
          requiresAttunement,
          attuned: requiresAttunement && attuned,
          ...(itemKind === 'armor' ? {
            armorCategory: itemArmorCategory,
            armorClass: Math.max(0, itemArmorClass),
            strengthRequirement: Math.max(0, itemStrengthRequirement) || undefined,
            stealthDisadvantage: itemStealthDisadvantage,
            maxDexBonus: itemMaxDexBonus < 0 ? undefined : itemMaxDexBonus,
          } : {}),
          ...(itemKind === 'shield' ? { armorClass: Math.max(0, itemArmorClass) } : {}),
          ...(itemKind === 'weapon' ? {
            weaponAbility: itemWeaponAbility,
            weaponProficient: itemWeaponProficient,
            weaponDamage: itemWeaponDamage.trim() || undefined,
            weaponDamageType: itemWeaponDamageType.trim() || undefined,
            weaponRange: itemWeaponRange.trim() || undefined,
          } : {}),
          effects: {
            abilityBonuses: Object.fromEntries(
              Object.entries(itemAbilityBonuses).filter(([, bonus]) => bonus),
            ) as Partial<Record<AbilityKey, number>>,
            armorClassBonus: itemArmorBonus || undefined,
            speedBonus: itemSpeedBonus || undefined,
            attackBonus: itemAttackBonus || undefined,
            damageBonus: itemDamageBonus || undefined,
            resistances: itemResistancesText.split(',').map((entry) => entry.trim()).filter(Boolean),
          },
        },
        properties: parsedProperties,
        range: rangeNormal && rangeLong ? `${rangeNormal}/${rangeLong}` : undefined,
        effects:
          effectsText.trim()
            ? ([
                (
                  () => {
                    const [a, ...rest] = effectsText.trim().split(' ');
                    const dice = a || '1d6';
                    const typeText = rest.join(' ').trim().toLowerCase();
                    const type: 'damage' | 'healing' = typeText.includes('cur') ? 'healing' : 'damage';
                    return { dice, type };
                  }
                )(),
              ] as any)
            : undefined,
        higherLevels:
          higherLevelsText.trim()
            ? [{ level: 0, dice: higherLevelsText.trim() } as any]
            : undefined,
      } as any;
    };

    if (category === 'skill') {
      onSaveCard(buildSkill());
      onClose();
      return;
    }
    if (category === 'item') {
      onSaveCard(buildItem());
      onClose();
      return;
    }

    onSaveCard(common as any);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#121626] via-[#0d101c] to-[#181d30] p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="font-cinzel text-base font-bold text-zinc-100">
              {cardToEdit ? 'Editar Tarjeta Homebrew' : 'Crear Tarjeta Homebrew'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs"
          >
          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Nombre:</label>
            <input
              type="text"
              required
              placeholder="Ej: Vara Relámpago Afilada..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Tipo de tarjeta:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GrimoireCard['category'])}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-white"
              >
                <option value="attack">Ataque</option>
                <option value="spell">Hechizo</option>
                <option value="feat">Dote</option>
                <option value="item">Objeto</option>
                <option value="reaction">Reacción</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Tipo de Acción:</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as GrimoireCard['actionType'])}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-white"
              >
                <option value="Acción">Acción</option>
                <option value="Acción Adicional">Acción Adicional</option>
                <option value="Reacción">Reacción</option>
                <option value="Movimiento">Movimiento</option>
                <option value="Pasiva">Pasiva</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-zinc-300 font-semibold block mb-1">Extra de recursos de turno (opcional):</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Tipo de extra:</label>
                  <select
                    value={extraTurnKind}
                    onChange={(e) => setExtraTurnKind(e.target.value as NonNullable<GrimoireCard['extraTurnUses']>['kind'])}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-white"
                  >
                    <option value="action">Acción</option>
                    <option value="bonusAction">Acción Adicional</option>
                    <option value="reaction">Reacción</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Usos extra (0 para desactivar):</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={extraTurnUses}
                    onChange={(e) => setExtraTurnUses(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {category === 'feat' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Categoría según reglas 2024:</label>
                  <select
                    value={featRuleCategory}
                    onChange={(e) => {
                      const nextCategory = e.target.value as NonNullable<GrimoireCard['featRuleCategory']>;
                      setFeatRuleCategory(nextCategory);
                      const defaultMaximum = nextCategory === 'epic_boon' ? 30 : 20;
                      setFeatMinimumLevel(nextCategory === 'epic_boon' ? 19 : nextCategory === 'general' ? 4 : 1);
                      setFeatAbilityIncreases((previous) => previous.map((increase) => ({
                        ...increase,
                        maxScore: defaultMaximum,
                      })));
                    }}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  >
                    <option value="origin">Origen</option>
                    <option value="general">General</option>
                    <option value="fighting_style">Estilo de combate</option>
                    <option value="epic_boon">Don épico</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Categoría personalizada:</label>
                  <input
                    type="text"
                    value={featCategory}
                    onChange={(e) => setFeatCategory(e.target.value)}
                    placeholder="Ej: magia lunar"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Nivel mínimo:</label>
                <input
                  type="number"
                  min={featRuleCategory === 'epic_boon' ? 19 : featRuleCategory === 'general' ? 4 : 1}
                  step="1"
                  value={featMinimumLevel}
                  onChange={(e) => setFeatMinimumLevel(Math.max(
                    featRuleCategory === 'epic_boon' ? 19 : featRuleCategory === 'general' ? 4 : 1,
                    Number(e.target.value),
                  ))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Clase requerida (opcional):</label>
                  <select
                    value={featRequiredClass}
                    onChange={(e) => setFeatRequiredClass(e.target.value as ClassId | '')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  >
                    <option value="">Cualquiera</option>
                    {([
                      ['barbaro', 'Bárbaro'], ['bardo', 'Bardo'], ['clerigo', 'Clérigo'],
                      ['druida', 'Druida'], ['guerrero', 'Guerrero'], ['monje', 'Monje'],
                      ['paladin', 'Paladín'], ['picaro', 'Pícaro'], ['explorador', 'Explorador'],
                      ['hechicero', 'Hechicero'], ['brujo', 'Brujo'], ['mago', 'Mago'], ['artifice', 'Artífice'],
                    ] as [ClassId, string][]).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Característica mínima (opcional):</label>
                  <div className="flex gap-2">
                    <select
                      value={featRequiredAbility}
                      onChange={(e) => setFeatRequiredAbility(e.target.value as AbilityKey | '')}
                      className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-white"
                    >
                      <option value="">Ninguna</option>
                      <option value="FUE">FUE</option>
                      <option value="DES">DES</option>
                      <option value="CON">CON</option>
                      <option value="INT">INT</option>
                      <option value="SAB">SAB</option>
                      <option value="CAR">CAR</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={featRequiredAbilityScore}
                      onChange={(e) => setFeatRequiredAbilityScore(Math.max(1, Number(e.target.value)))}
                      disabled={!featRequiredAbility}
                      className="w-16 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-white disabled:opacity-40"
                      aria-label="Puntuación mínima requerida"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Otros requisitos (solo referencia):</label>
                <input
                  type="text"
                  value={featPrerequisite}
                  onChange={(e) => setFeatPrerequisite(e.target.value)}
                  placeholder="Ej: competencia con armas marciales"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                />
                <p className="mt-1 text-[10px] text-zinc-500">
                  Los requisitos adicionales escritos aquí no se validan automáticamente.
                </p>
              </div>
              <label className="flex items-center gap-2 text-zinc-300">
                <input
                  type="checkbox"
                  checked={featRepeatable}
                  onChange={(e) => setFeatRepeatable(e.target.checked)}
                />
                Se puede elegir más de una vez
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-semibold">Aumentos de característica:</label>
                  <button
                    type="button"
                    onClick={() => setFeatAbilityIncreases((previous) => [
                      ...previous,
                      { ability: 'INT', amount: 0, maxScore: featRuleCategory === 'epic_boon' ? 30 : 20 },
                    ])}
                    className="rounded bg-zinc-800 px-2 py-1 text-emerald-300"
                  >
                    + Agregar aumento
                  </button>
                </div>
                {featAbilityIncreases.length === 0 && (
                  <p className="text-[10px] text-zinc-500">Esta dote no aumenta características.</p>
                )}
                <p className="text-[10px] text-zinc-500">
                  Máximo sugerido: 20; 30 para dones épicos. Puedes cambiarlo para una regla homebrew.
                </p>
                {featAbilityIncreases.map((increase, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400">Característica</label>
                      <select
                        value={increase.ability}
                        onChange={(e) => setFeatAbilityIncreases((previous) => previous.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, ability: e.target.value as AbilityKey } : item
                        ))}
                        className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-white"
                      >
                        <option value="FUE">FUE</option>
                        <option value="DES">DES</option>
                        <option value="CON">CON</option>
                        <option value="INT">INT</option>
                        <option value="SAB">SAB</option>
                        <option value="CAR">CAR</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Modificador</label>
                      <input
                        type="number"
                        step="1"
                        value={increase.amount}
                        onChange={(e) => setFeatAbilityIncreases((previous) => previous.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, amount: Number(e.target.value) } : item
                        ))}
                        className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Máximo</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={increase.maxScore}
                        onChange={(e) => setFeatAbilityIncreases((previous) => previous.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, maxScore: Math.max(1, Number(e.target.value)) } : item
                        ))}
                        className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-white"
                      />
                    </div>
                    <button
                      type="button"
                      aria-label="Eliminar aumento"
                      onClick={() => setFeatAbilityIncreases((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
                      className="rounded px-2 py-2 text-rose-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-zinc-300 font-semibold block">Competencias y pericias otorgadas:</label>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-800 bg-zinc-950/50 p-2 sm:grid-cols-3">
                  {character.skills.map((skill) => (
                    <label key={skill.name} className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                      <input
                        type="checkbox"
                        checked={featSkillProficiencies.includes(skill.name)}
                        onChange={(e) => setFeatSkillProficiencies((previous) =>
                          e.target.checked
                            ? [...previous, skill.name]
                            : previous.filter((name) => name !== skill.name)
                        )}
                      />
                      Competente: {skill.name}
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-800 bg-zinc-950/50 p-2 sm:grid-cols-3">
                  {character.skills.map((skill) => (
                    <label key={skill.name} className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                      <input
                        type="checkbox"
                        checked={featExpertiseSkills.includes(skill.name)}
                        onChange={(e) => setFeatExpertiseSkills((previous) =>
                          e.target.checked
                            ? [...previous, skill.name]
                            : previous.filter((name) => name !== skill.name)
                        )}
                      />
                      Pericia: {skill.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Otros beneficios o reglas:</label>
                <textarea
                  rows={2}
                  value={featAdditionalBenefits}
                  onChange={(e) => setFeatAdditionalBenefits(e.target.value)}
                  placeholder="Competencias, opciones u otros efectos de la dote..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                />
              </div>
            </>
          )}

          {category !== 'feat' && (
            <>
          {category === 'attack' && (
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Tipo de Ataque:</label>
              <select
                value={attackType || 'melee'}
                onChange={(e) => setAttackType(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
              >
                <option value="melee">Cuerpo a Cuerpo (CaC)</option>
                <option value="ranged">Distancia (Dist)</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-zinc-300 font-semibold block mb-1">Alcance:</label>
              <input
                type="text"
                placeholder="Ej: 5 ft / 60 ft o Libre"
                value={reachText}
                onChange={(e) => setReachText(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-white"
              />
            </div>

            <div className="hidden md:block" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Ataque / CD:</label>
              <input
                type="text"
                value={hitBonusOrDc}
                onChange={(e) => setHitBonusOrDc(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                placeholder="Ej: +5 o 15"
              />
            </div>
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Objetivo:</label>
              <input
                type="text"
                value={targetOrArea}
                onChange={(e) => setTargetOrArea(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                placeholder="Ej: 1 Criatura / Área"
              />
            </div>
          </div>

          {/* Ataque y Objeto/Hechizo/Reacción: mismo sistema de daño compuesto */}
          {category === 'attack' || category === 'item' || category === 'spell' || category === 'reaction' ? (
            <div className="space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
              <label className="text-zinc-300 font-semibold block mb-1">Configuración de Daño:</label>
              {damageEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 bg-zinc-950/60 p-2 rounded border border-zinc-800">
                  <div className="w-20">
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Cantidad</label>
                    <select
                      value={entry.count}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        setDamageEntries(prev => prev.map((item, i) => i === index ? { ...item, count: val } : item));
                      }}
                      className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white text-xs"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Tipo de dado</label>
                    <select
                      value={entry.die}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDamageEntries(prev => prev.map((item, i) => i === index ? { ...item, die: val } : item));
                      }}
                      className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white text-xs uppercase"
                    >
                      <option value="d4">D4</option>
                      <option value="d6">D6</option>
                      <option value="d8">D8</option>
                      <option value="d10">D10</option>
                      <option value="d12">D12</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Tipo de daño</label>
                    <input
                      type="text"
                      value={entry.type}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDamageEntries(prev => prev.map((item, i) => i === index ? { ...item, type: val } : item));
                      }}
                      placeholder="Ej: cortante, fuego..."
                      className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white text-xs"
                    />
                  </div>
                  {damageEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDamageEntries(prev => prev.filter((_, i) => i !== index))}
                      className="mt-4 px-2 py-1 text-rose-400 hover:text-rose-300 text-xs"
                      title="Eliminar daño"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setDamageEntries(prev => [...prev, { count: 1, die: 'd8', type: 'Daño' }])}
                className="mt-1 px-3 py-1.5 rounded bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold"
              >
                + Añadir tipo de daño
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-zinc-300 font-semibold block mb-1">Daño (desplegables):</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Dado de daño</label>
                  <select
                    value={damageEntries[0]?.die ?? 'd8'}
                    onChange={(e) => {
                      const die = e.target.value;
                      setDamageEntries((prev) => [{
                        count: prev[0]?.count ?? 1,
                        die,
                        type: prev[0]?.type ?? 'Daño',
                      }, ...prev.slice(1)]);
                    }}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="d4">D4</option>
                    <option value="d6">D6</option>
                    <option value="d8">D8</option>
                    <option value="d10">D10</option>
                    <option value="d12">D12</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={0}
                    value={damageEntries[0]?.count ?? 1}
                    onChange={(e) => {
                      const count = Math.max(0, parseInt(e.target.value, 10) || 0);
                      setDamageEntries((prev) => [{
                        count,
                        die: prev[0]?.die ?? 'd8',
                        type: prev[0]?.type ?? 'Daño',
                      }, ...prev.slice(1)]);
                    }}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Tipo</label>
                  <select
                    value={damageEntries[0]?.type ?? 'Daño'}
                    onChange={(e) => {
                      const type = e.target.value;
                      setDamageEntries((prev) => [{
                        count: prev[0]?.count ?? 1,
                        die: prev[0]?.die ?? 'd8',
                        type,
                      }, ...prev.slice(1)]);
                    }}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Daño">Daño</option>
                    <option value="Curar">Curar</option>
                  </select>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500">
                Vista previa:{' '}
                {
                  damageEntries
                    .filter((e) => e.count > 0)
                    .map((e) => `${e.count}${e.die}`)
                    .join(' + ') || '—'
                }
              </p>

              <p className="text-[10px] text-zinc-500">Usa “+ Añadir tipo de daño” para sumar más dados.</p>
            </div>
          )}
            </>
          )}

          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Origen (texto libre):</label>
            <input
              type="text"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
              placeholder="ej: Manual X, homebrew del grupo..."
            />
          </div>

          <div>
            <label className="text-zinc-300 font-semibold block mb-1">Descripción:</label>
            <textarea
              rows={3}
              placeholder="Detalla el efecto de la tarjeta táctica..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
            />
          </div>

          {featValidationError && category === 'feat' && (
            <p role="alert" className="rounded border border-rose-500/40 bg-rose-950/30 p-2 text-rose-200">
              {featValidationError}
            </p>
          )}

          {category === 'spell' && (
            <div className="space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Nivel del Hechizo:</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="0">Truco (Nivel 0)</option>
                    <option value="1">Nivel 1</option>
                    <option value="2">Nivel 2</option>
                    <option value="3">Nivel 3</option>
                    <option value="4">Nivel 4</option>
                    <option value="5">Nivel 5</option>
                    <option value="6">Nivel 6</option>
                    <option value="7">Nivel 7</option>
                    <option value="8">Nivel 8</option>
                    <option value="9">Nivel 9</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Escuela:</label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                    placeholder="ej: Evocación, Abjuración..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Duración:</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                    placeholder="ej: Instantáneo, 1 minuto..."
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={concentration}
                      onChange={(e) => setConcentration(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-700 text-teal-500 focus:ring-0"
                    />
                    Concentración
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={ritual}
                      onChange={(e) => setRitual(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-700 text-teal-500 focus:ring-0"
                    />
                    Ritual
                  </label>
                </div>
              </div>
            </div>
          )}

          {category === 'skill' && (
            <div className="space-y-3">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Propiedades (coma):</label>
                <input
                  type="text"
                  value={propertiesText}
                  onChange={(e) => setPropertiesText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                  placeholder="ej: pasiva, concentración, etc"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Efecto (ej: 1d6 daño / curar 1d6):</label>
                <input
                  type="text"
                  value={effectsText}
                  onChange={(e) => setEffectsText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                  placeholder="1d6 damage / curar 1d6"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Escalado / notas (skill):</label>
                <input
                  type="text"
                  value={higherLevelsText}
                  onChange={(e) => setHigherLevelsText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                  placeholder="ej: +1d6 a nivel 5"
                />
              </div>
            </div>
          )}

          {category === 'item' && (
            <div className="space-y-3">
              <label className="block text-zinc-300 font-semibold">
                Etiquetas:
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
                  placeholder="ej. instrumento, musical"
                />
                <span className="mt-1 block text-xs font-normal text-zinc-500">
                  Usa la etiqueta «instrumento» para mostrarlo en el módulo de Bardo.
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-zinc-300 font-semibold">
                  Tipo de objeto:
                  <select value={itemKind} onChange={(e) => setItemKind(e.target.value as ItemCardData['kind'])} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white">
                    <option value="weapon">Arma</option>
                    <option value="armor">Armadura</option>
                    <option value="shield">Escudo</option>
                    <option value="gear">Equipo</option>
                    <option value="consumable">Consumible</option>
                    <option value="magic">Objeto mágico</option>
                  </select>
                </label>
                <label className="text-zinc-300 font-semibold">
                  Rareza:
                  <select value={itemRarity} onChange={(e) => setItemRarity(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white">
                    <option value="">No aplica</option>
                    <option value="Común">Común</option>
                    <option value="Poco común">Poco común</option>
                    <option value="Raro">Raro</option>
                    <option value="Muy raro">Muy raro</option>
                    <option value="Legendario">Legendario</option>
                    <option value="Artefacto">Artefacto</option>
                  </select>
                </label>
                <label className="text-zinc-300 font-semibold">
                  Cantidad:
                  <input type="number" min="0" value={itemQuantity} onChange={(e) => setItemQuantity(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
                </label>
                <label className="text-zinc-300 font-semibold">
                  Peso (lb):
                  <input type="number" min="0" step="0.1" value={itemWeight} onChange={(e) => setItemWeight(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
                </label>
                <label className="text-zinc-300 font-semibold">
                  Valor:
                  <input value={itemValue} onChange={(e) => setItemValue(e.target.value)} placeholder="ej. 15 po" className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
                </label>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Equipada:</label>
                  <select
                    value={equipped ? 'yes' : 'no'}
                    onChange={(e) => setEquipped(e.target.value === 'yes')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="no">No</option>
                    <option value="yes">Sí</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Propiedades (coma):</label>
                  <input
                    type="text"
                    value={propertiesText}
                    onChange={(e) => setPropertiesText(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                    placeholder="curada, arrojadiza, etc"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-zinc-300 text-sm">
                <input type="checkbox" checked={requiresAttunement} onChange={(e) => setRequiresAttunement(e.target.checked)} />
                Requiere sintonización
              </label>
              {requiresAttunement && (
                <label className="flex items-center gap-2 text-zinc-300 text-sm">
                  <input type="checkbox" checked={attuned} onChange={(e) => setAttuned(e.target.checked)} />
                  Está sintonizado
                </label>
              )}
              {itemValidationError && <p className="text-sm text-rose-300">{itemValidationError}</p>}

              {itemKind === 'armor' && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-zinc-300 font-semibold">Categoría de armadura:
                    <select value={itemArmorCategory} onChange={(e) => setItemArmorCategory(e.target.value as NonNullable<ItemCardData['armorCategory']>)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white">
                      <option value="light">Ligera</option>
                      <option value="medium">Media</option>
                      <option value="heavy">Pesada</option>
                    </select>
                  </label>
                  <label className="text-zinc-300 font-semibold">CA base:
                    <input type="number" min="0" value={itemArmorClass} onChange={(e) => setItemArmorClass(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
                  </label>
                  <label className="text-zinc-300 font-semibold">Máx. bonificador DES (-1 = sin límite):
                    <input type="number" min="-1" value={itemMaxDexBonus} onChange={(e) => setItemMaxDexBonus(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
                  </label>
                  <label className="text-zinc-300 font-semibold">FUE requerida:
                    <input type="number" min="0" value={itemStrengthRequirement} onChange={(e) => setItemStrengthRequirement(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
                  </label>
                  <label className="col-span-2 flex items-center gap-2 text-zinc-300 text-sm">
                    <input type="checkbox" checked={itemStealthDisadvantage} onChange={(e) => setItemStealthDisadvantage(e.target.checked)} />
                    Desventaja en Sigilo
                  </label>
                </div>
              )}
              {itemKind === 'shield' && (
                <label className="block text-zinc-300 font-semibold">Bonificador de CA:
                  <input type="number" min="0" value={itemArmorClass} onChange={(e) => setItemArmorClass(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
                </label>
              )}
              {itemKind === 'weapon' && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-zinc-300 font-semibold">Característica:
                    <select value={itemWeaponAbility} onChange={(e) => setItemWeaponAbility(e.target.value as AbilityKey)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white">
                      {(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const).map((abilityKey) => <option key={abilityKey} value={abilityKey}>{abilityKey}</option>)}
                    </select>
                  </label>
                  <label className="text-zinc-300 font-semibold">Daño:
                    <input value={itemWeaponDamage} onChange={(e) => setItemWeaponDamage(e.target.value)} placeholder="1d8" className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
                  </label>
                  <label className="text-zinc-300 font-semibold">Tipo de daño:
                    <input value={itemWeaponDamageType} onChange={(e) => setItemWeaponDamageType(e.target.value)} placeholder="Cortante" className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
                  </label>
                  <label className="text-zinc-300 font-semibold">Alcance:
                    <input value={itemWeaponRange} onChange={(e) => setItemWeaponRange(e.target.value)} placeholder="5 pies / 20-60 pies" className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white" />
                  </label>
                  <label className="col-span-2 flex items-center gap-2 text-zinc-300 text-sm">
                    <input type="checkbox" checked={itemWeaponProficient} onChange={(e) => setItemWeaponProficient(e.target.checked)} />
                    Añadir competencia al ataque
                  </label>
                </div>
              )}

              <div className="rounded-lg border border-zinc-700 p-3 space-y-3">
                <p className="text-zinc-200 font-semibold">Efectos estructurados (solo mientras esté equipado)</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const).map((abilityKey) => (
                    <label key={abilityKey} className="text-xs text-zinc-300">{abilityKey}
                      <input type="number" value={itemAbilityBonuses[abilityKey] ?? 0} onChange={(e) => setItemAbilityBonuses((current) => ({ ...current, [abilityKey]: Number(e.target.value) || 0 }))} className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white" />
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-zinc-300">Bonificador adicional de CA
                    <input type="number" value={itemArmorBonus} onChange={(e) => setItemArmorBonus(Number(e.target.value) || 0)} className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white" />
                  </label>
                  <label className="text-xs text-zinc-300">Velocidad (pies)
                    <input type="number" value={itemSpeedBonus} onChange={(e) => setItemSpeedBonus(Number(e.target.value) || 0)} className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white" />
                  </label>
                  <label className="text-xs text-zinc-300">Ataque
                    <input type="number" value={itemAttackBonus} onChange={(e) => setItemAttackBonus(Number(e.target.value) || 0)} className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white" />
                  </label>
                  <label className="text-xs text-zinc-300">Daño
                    <input type="number" value={itemDamageBonus} onChange={(e) => setItemDamageBonus(Number(e.target.value) || 0)} className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white" />
                  </label>
                </div>
                <label className="block text-xs text-zinc-300">Resistencias (separadas por coma)
                  <input value={itemResistancesText} onChange={(e) => setItemResistancesText(e.target.value)} placeholder="fuego, veneno" className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-white" />
                </label>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Efecto (ej: 1d6 daño / curar 1d6):</label>
                <input
                  type="text"
                  value={effectsText}
                  onChange={(e) => setEffectsText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:outline-none"
                  placeholder="1d6 damage / curar 1d6"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-zinc-300 font-semibold">Usos (0 = ilimitado):</label>
            <input
              type="number"
              min="0"
              value={usesMax}
              onChange={(e) => setUsesMax(parseInt(e.target.value) || 0)}
              className="w-20 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-center text-white"
            />
          </div>
          {(category === 'feat' || category === 'item') && usesMax > 0 && (
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Recuperación de usos:</label>
              <select
                value={recharge}
                onChange={(e) => setRecharge(e.target.value as GrimoireCard['uses']['recharge'])}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              >
                <option value="short">Descanso corto</option>
                <option value="long">Descanso largo</option>
                <option value="dawn">Amanecer</option>
                <option value="dusk">Anochecer</option>
                <option value="turn">Turno</option>
                <option value="round">Ronda</option>
                <option value="other">Otro</option>
                <option value="none">No se recupera</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-cinzel font-bold text-stone-950 text-xs tracking-wider uppercase shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            Guardar Tarjeta en el Grimorio
          </button>
        </form>
      </div>
    </div>
  );
};
