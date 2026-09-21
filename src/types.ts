export type ScreenId = 'hoja-de-personaje' | 'turno-de-combate' | 'grimorio-de-tarjetas' | 'creador-de-personaje';

export type ClassKey = 
  | 'mago' 
  | 'druida' 
  | 'bardo' 
  | 'guerrero' 
  | 'picaro' 
  | 'barbaro' 
  | 'clerigo' 
  | 'hechicero' 
  | 'brujo' 
  | 'monje' 
  | 'artifice'
  | 'homebrew';

export type AbilityCode = 'FUE' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';

export type ElementAffinity = 'neutral' | 'agua' | 'tierra' | 'fuego';

export interface ClassTheme {
  id: ClassKey;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  colors: {
    primary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    accent: string;
    surfaceContainerLow: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    borderGlow: string;
    vignetteGlow: string;
    badgeBg: string;
    badgeText: string;
  };
}

export interface AbilityScore {
  name: string;
  code: AbilityCode;
  base: number;
  modifier: number;
  savingThrow: number;
  isProficientSave: boolean;
  isKeyAttribute?: boolean;
}

export interface Skill {
  name: string;
  attr: 'FUE' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';
  modifier: number;
  isProficient: boolean;
  isExpert?: boolean;
  isHomebrew?: boolean;
}

export interface SpellSlotTier {
  tier: number;
  max: number;
  current: number;
}

export interface WeaponItem {
  id: string;
  name: string;
  attackBonus: number;
  damage: string; // e.g. "1d8 + 3"
  damageType: string; // e.g. "Cortante", "Perforante", "Fuego"
  reach: string; // e.g. "5 ft", "20/60 ft"
  properties: string; // e.g. "Versátil (1d10), Sutil"
  isEquipped?: boolean;
  isHomebrew?: boolean;
}

export interface ArmorItem {
  id: string;
  name: string;
  baseAc: number;
  armorType: string; // "Ligera", "Media", "Pesada", "Escudo", "Mágica"
  stealthDisadvantage: boolean;
  isEquipped: boolean;
  isHomebrew?: boolean;
}

export interface FeatDefinition {
  id: string;
  name: string;
  prerequisite?: string;
  description: string;
  abilityBonuses?: Partial<Record<AbilityCode, number>>;
  isHomebrew?: boolean;
}

export interface SpellDefinition {
  id: string;
  name: string;
  level: number; // 0 = Truco
  school: string;
  castingTime: string; // "1 Acción", "1 Acción Adicional", "1 Reacción"
  range: string;
  components: string; // "V, S, M"
  duration: string;
  concentration: boolean;
  attackOrDc: string;
  damageOrHeal: string;
  description: string;
  isHomebrew?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  itemType: 'Consumible' | 'Poción' | 'Pergamino' | 'Herramienta' | 'Equipo' | 'Homebrew';
  description: string;
  usesRemaining?: number;
  usesMax?: number;
  isHomebrew?: boolean;
}

export interface ClassFeature {
  id: string;
  name: string;
  source: string; // e.g. "Guerrero Nv. 1", "Homebrew"
  actionType: ActionType;
  usesMax?: number;
  usesRemaining?: number;
  recharge?: 'Descanso Corto' | 'Descanso Largo' | 'Ninguna' | string;
  description: string;
  isHomebrew?: boolean;
}

export interface CharacterSheet {
  id: string;
  name: string;
  epithet: string;
  characterClass: string;
  subclass: string;
  level: number;
  race: string;
  background: string;
  alignment: string;
  experience: number;
  nextLevelXp: number;
  hasInspiration: boolean;
  classKey?: ClassKey;
  
  // Tactical Stats
  armorClass: number;
  acType: string;
  initiative: number;
  speedFeet: number;
  proficiencyBonus: number;
  passivePerception: number;
  spellSaveDc: number;
  spellAttackBonus: number;
  
  // Health
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hitDice: string;
  deathSaves: {
    successes: number; // 0..3
    failures: number;  // 0..3
  };
  
  // Attributes & Skills
  abilities: Record<'FUE' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR', AbilityScore>;
  skills: Skill[];
  
  // Spells & Slots
  spellSlots: SpellSlotTier[];
  preparedSpellsCount: number;
  
  // Equipment & Homebrew inventories
  weapons?: WeaponItem[];
  armors?: ArmorItem[];
  feats?: FeatDefinition[];
  spells?: SpellDefinition[];
  inventory?: InventoryItem[];
  classFeatures?: ClassFeature[];

  traits: {
    title: string;
    badge: string;
    badgeType: 'neutral' | 'accent' | 'action';
    description: string;
    isHomebrew?: boolean;
  }[];
  senses: {
    name: string;
    detail: string;
  }[];
  languages: string[];
  portraitUrl: string;
}

export type CardCategory = 'attack' | 'skill' | 'spell' | 'item' | 'reaction' | 'standard';
export type ActionType = 'Acción' | 'Acción Adicional' | 'Reacción' | 'Movimiento' | 'Gratuita';

export interface TacticalCard {
  id: string;
  title: string;
  category: CardCategory;
  typeBadge: string;
  actionType: ActionType;
  levelSlot?: string;
  reach: string;
  hitBonusOrDc: string;
  targetOrArea: string;
  primaryDamageOrEffect: string;
  secondaryEffect?: string;
  resourceDesc?: string;
  resourceMax?: number;
  resourceUsed?: number;
  recharge?: 'Descanso Corto' | 'Descanso Largo' | 'Ninguna' | string;
  scaling?: string;
  durationAndConcentration?: string;
  trigger?: string;
  summaryLine?: string; // e.g. "Second Wind - Acción adicional - 2 usos - Recuperas PG"
  description: string;
  lore?: string;
  imageUrl?: string;
  isHomebrew?: boolean;
  isExpended?: boolean;
  rollFormula?: string;
}

export interface CombatRoundState {
  round: number;
  initiativeScore: number;
  isStanding: boolean;
  concentrationSpell: string | null;
  hasInspiration: boolean;
  maxMovement: number;
  remainingMovement: number;
  hasDash: boolean;
  actionUsed: boolean;
  bonusActionUsed: boolean;
  reactionUsed: boolean;
}

export interface DiceRollResult {
  id: string;
  title: string;
  d20: number;
  modifier: number;
  total: number;
  isNat20: boolean;
  isNat1: boolean;
  subtext?: string;
  timestamp: Date;
  diceSides?: number;
  diceCount?: number;
  advantageMode?: 'normal' | 'advantage' | 'disadvantage';
}
