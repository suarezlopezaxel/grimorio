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
  name: string;
  quantity: number;
  weight: number;
  attuned: boolean;
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

export interface GrimoireCard {
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
  name: string;
  cr: string;
  hp: number;
  ac: number;
  speed: string;
  attacks: string;
  senses: string;
}

export interface CharacterSheet {
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
      instrument: 'laud' | 'flauta' | 'tambor' | 'violin';
    };
    druid?: {
      wildShapeCurrent: number;
      wildShapeMax: number;
      activeForm: BeastForm | null;
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
      secondWindUsed: boolean;
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
