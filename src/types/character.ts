/**
 * Grimorio / Arcanum v5.2 - TypeScript Data Models
 */

export type ClassId =
  | 'bardo'
  | 'druida'
  | 'barbaro'
  | 'clerigo'
  | 'guerrero'
  | 'monje'
  | 'paladin'
  | 'picaro'
  | 'explorador'
  | 'hechicero'
  | 'brujo'
  | 'mago'
  | 'artifice';

export type ElementalAffinity = 'normal' | 'agua' | 'tierra' | 'fuego';

export type AbilityKey = 'FUE' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';

export type ProficiencyLevel = 'none' | 'half' | 'proficient' | 'expertise';

export interface AbilityScore {
  key: AbilityKey;
  label: string;
  score: number;
  proficientSave: boolean;
  notes?: string;
}

export interface SkillEntry {
  name: string;
  ability: AbilityKey;
  level: ProficiencyLevel;
}

export interface HitPoints {
  current: number;
  max: number;
  temp: number;
}

export interface HitDice {
  die: string;
  current: number;
  max: number;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface InventoryItem {
  id: string;
  cardId?: string;
  name: string;
  quantity: number;
  weight: number;
  attuned: boolean;
  requiresAttunement?: boolean;
  equipped?: boolean;
  value: string;
  notes?: string;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface SpellSlot {
  level: number;
  max: number;
  used: number;
}

export interface SpellItem {
  id: string;
  name: string;
  level: number;
  school: string;
  castTime: string;
  range: string;
  damage?: string;
  damageType?: string;
  description: string;
  prepared: boolean;
  isHomebrew?: boolean;
}

export interface WeaponItem {
  id: string;
  name: string;
  attackBonus: number;
  damage: string;
  damageType: string;
  range: string;
  properties: string;
  isHomebrew?: boolean;
}

export interface FeatureItem {
  id: string;
  name: string;
  source: string;
  actionType: 'Pasiva' | '1 Acción' | 'Acción Adicional' | 'Reacción' | 'Especial';
  usesMax?: number;
  usesLeft?: number;
  rechargeOn?: 'Descanso Corto' | 'Descanso Largo' | 'Turno';
  description: string;
  isHomebrew?: boolean;
}

export interface FeatAbilityIncrease {
  ability: AbilityKey;
  amount: number;
  maxScore: number;
}

export interface ItemCardData {
  kind: 'weapon' | 'armor' | 'shield' | 'gear' | 'consumable' | 'magic';
  rarity?: string;
  quantity: number;
  weight: number;
  value: string;
  requiresAttunement: boolean;
  attuned: boolean;
  armorCategory?: 'light' | 'medium' | 'heavy';
  armorClass?: number;
  strengthRequirement?: number;
  stealthDisadvantage?: boolean;
  maxDexBonus?: number;
  weaponAbility?: AbilityKey;
  weaponProficient?: boolean;
  weaponDamage?: string;
  weaponDamageType?: string;
  weaponRange?: string;
  effects: {
    abilityBonuses?: Partial<Record<AbilityKey, number>>;
    armorClassBonus?: number;
    speedBonus?: number;
    attackBonus?: number;
    damageBonus?: number;
    resistances?: string[];
  };
}

export interface GrimoireCard {
  id: string;
  name: string;
  category: 'attack' | 'spell' | 'skill' | 'feat' | 'item' | 'reaction';
  favorite?: boolean;

  /**
   * Regla extra para otorgar/restaurar usos de acción por turno.
   * Ej: si no gastaste tu acción base, te da usos extra; si ya la gastaste, la restaura y además da extra.
   */
  extraTurnUses?: {
    kind: 'action' | 'bonusAction' | 'reaction';
    extraUses: number;
  };
  actionType:
    | 'action' | 'bonus' | 'reaction' | 'movement' | 'free' | 'passive' | 'special'
    | 'Acción' | 'Acción Adicional' | 'Reacción' | 'Movimiento' | 'Especial' | 'Pasiva';
  description: string;
  source: string;
  tags: string[];
  featCategory?: string;
  featRuleCategory?: 'origin' | 'general' | 'fighting_style' | 'epic_boon';
  featPrerequisite?: string;
  featMinimumLevel?: number;
  featRequiredClass?: ClassId;
  featRequiredAbility?: AbilityKey;
  featRequiredAbilityScore?: number;
  featRepeatable?: boolean;
  featAbilityIncreases?: FeatAbilityIncrease[];
  featSkillProficiencies?: string[];
  featExpertiseSkills?: string[];
  featAdditionalBenefits?: string;
  /** Legacy single-increase fields; retained for cards created before multi-benefit feats. */
  featAbility?: AbilityKey;
  featModifier?: number;
  uses: {
    max: number;
    recharge: 'none' | 'short' | 'long' | 'dawn' | 'dusk' | 'turn' | 'round' | 'other';
    current: number;
  };
  showIn: {
    sheet: boolean;
    combat: boolean;
  };
  // Campos específicos por categoría
  attackType?: 'melee' | 'ranged' | 'spell';
  baseWeapon?: string;
  ability?: AbilityKey;
  proficient?: boolean;
  magicBonus?: number;
  attackBonus?: number;
  range?: { normal: number; long: number; };
  damage?: { dice: string; mod: number; type: string; }[];
  versatileDamage?: string;
  properties?: string[];
  ammo?: { type: string; count: number; };
  conditionalDamage?: { text: string; dice: string; }[];
  equipped?: boolean;
  item?: ItemCardData;
  level?: number;
  school?: string;
  castingTime?: string;
  area?: { shape: 'none' | 'sphere' | 'cone' | 'line' | 'cube' | 'cylinder'; size: number; };
  components?: { V: boolean; S: boolean; M: boolean; materialText: string; materialCost: number; consumed: boolean; };
  duration?: string;
  concentration?: boolean;
  ritual?: boolean;
  resolution?: 'attack' | 'save' | 'none';
  save?: { ability: AbilityKey; onSuccess: 'none' | 'half' | 'other'; };
  dcOrAttack?: number;
  effects?: { dice: string; type: 'damage' | 'healing'; }[];
  higherLevels?: { level: number; dice: string; }[];
  cantripScaling?: { level: number; dice: string; }[];
  classes?: AbilityKey[];
  status?: 'known' | 'prepared' | 'always prepared';
}
  id: string;
  title: string;
  category: 'attack' | 'spell' | 'skill' | 'item' | 'reaction' | 'standard';
  actionType: 'Acción' | 'Acción Adicional' | 'Reacción' | 'Especial' | 'Movimiento';
  range: string;
  attackOrDC: string;
  target: string;
  effectOrDamage: string;
  description: string;
  usesMax?: number;
  usesLeft?: number;
  recharge?: string;
  trigger?: string;
  imageUrl?: string;
  isStandard5e?: boolean;
}

export interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'ally' | 'enemy';
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  conditions: string[];
}

export interface ActiveEffect {
  id: string;
  name: string;
  durationRounds: number;
  notes?: string;
  concentration: boolean;
}

export interface BeastForm {
  id?: string;
  name: string;
  cr: string;
  hp: number;
  ac: number;
  speed: string;
  attacks: string;
  senses: string;
  size?: string;
  creatureType?: string;
  skills?: string;
  resistances?: string;
  vulnerabilities?: string;
  immunities?: string;
  traits?: string;
  notes?: string;
}

export interface CharacterSheet {
  spells: SpellItem[];
  id: string;
  name: string;
  epithet: string;
  classId: ClassId;
  subclass: string;
  level: number;
  xp: number;
  species: string;
  alignment: string;
  background: string;
  portraitUrl: string;
  inspiration: boolean;
  elementalAffinity: ElementalAffinity;

  // Combat Core
  armorClass: number;
  manualArmorClass: boolean;
  armorTypeDescription: string;
  initiativeBonus: number;
  speed: number;
  proficiencyBonus: number;

  hitPoints: HitPoints;
  hitDice: HitDice;
  deathSaves: DeathSaves;

  // Abilities
  abilities: Record<AbilityKey, AbilityScore>;
  keyAbility?: AbilityKey | null;
  skills: SkillEntry[];

  // Conditions & Defenses
  activeConditions: string[];
  exhaustion: number;
  defenses: {
    resistances: string[];
    vulnerabilities: string[];
    immunities: string[];
  };

  // Inventory
  inventory: InventoryItem[];
  currency: Currency;
  carryingCapacityMax: number;
  attunementSlotsUsed: number;

  // Spellcasting
  spellSlots: SpellSlot[];
  knownSpells: SpellItem[];
  spellcastingAbility: AbilityKey;
  spellSaveDC: number;
  spellAttackBonus: number;

  // Attacks & Features
  weapons: WeaponItem[];
  features: FeatureItem[];

  // Class-specific Mechanics
  classResources: {
    bard?: {
      inspirationCurrent: number;
      inspirationMax: number;
      die: string;
      instrument?: 'laud' | 'flauta' | 'tambor' | 'violin';
    };
    druid?: {
      wildShapeCurrent: number;
      wildShapeMax: number;
      activeForm: BeastForm | null;
      forms?: BeastForm[];
    };
    barbarian?: {
      rageCurrent: number;
      rageMax: number;
      isRaging: boolean;
    };
    cleric?: {
      channelDivinityCurrent: number;
      channelDivinityMax: number;
      domain: 'vida' | 'luz' | 'tempestad' | 'guerra' | 'engano' | 'conocimiento';
    };
    fighter?: {
      secondWindUsesCurrent: number;
      secondWindUsesMax: number;
      actionSurgeUsed: boolean;
    };
    monk?: {
      kiCurrent: number;
      kiMax: number;
    };
    paladin?: {
      layOnHandsCurrent: number;
      layOnHandsMax: number;
      oath: string;
      auraActive: boolean;
    };
    rogue?: {
      inStealth: boolean;
      sneakAttackDice: string;
      stolenLootCount: number;
    };
    ranger?: {
      favoredEnemy: string;
      favoredTerrain: string;
      quarryMarked: boolean;
    };
    sorcerer?: {
      sorceryPointsCurrent: number;
      sorceryPointsMax: number;
      activeMetamagic: string[];
      wildMagicCount: number;
    };
    warlock?: {
      pactSlotsCurrent: number;
      pactSlotsMax: number;
      pactSlotLevel: number;
      patron: 'infernal' | 'primigenio' | 'feerico' | 'celestial';
    };
    wizard?: {
      arcaneRecoveryUsed: boolean;
      spellbookCurrentPage: number;
    };
    artificer?: {
      infusedItemsCount: number;
      infusedItemsMax: number;
      activeInfusions: string[];
    };
  };

  // Tactical Cards for Grimoire
  cards: GrimoireCard[];
}
