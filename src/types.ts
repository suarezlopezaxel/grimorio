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
export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type RollMode = 'normal' | 'advantage' | 'disadvantage';
export type RollKind = 'attack' | 'check' | 'save';
export type ProficiencyLevel = 'none' | 'half' | 'proficient' | 'expertise';
export type TrackedAction = 'action' | 'bonusAction' | 'reaction';
export type ConditionId =
  | 'blinded' | 'charmed' | 'deafened' | 'frightened' | 'grappled'
  | 'incapacitated' | 'invisible' | 'paralyzed' | 'petrified'
  | 'poisoned' | 'prone' | 'restrained' | 'stunned' | 'unconscious';

export interface ConditionEffect {
  attackDisadvantage?: boolean;
  attackAdvantage?: boolean;
  abilityCheckDisadvantage?: boolean;
  savingThrowDisadvantage?: boolean;
  savingThrowDisadvantageAbilities?: Ability[];
  speedZero?: boolean;
  autoFailSaves?: Ability[];
  incapacitated?: boolean;
}

export interface DamageModifiers {
  resistances: string[];
  vulnerabilities: string[];
  immunities: string[];
}

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
  proficiencyLevel: ProficiencyLevel;
  isProficient?: boolean;
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
  concentration?: boolean;
  upcast?: { dicePerLevel: string };
  attackOrDc: string;
  damageOrHeal: string;
  description: string;
  isHomebrew?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  itemType?: 'Consumible' | 'Poción' | 'Pergamino' | 'Herramienta' | 'Equipo' | 'Homebrew';
  description?: string;
  usesRemaining?: number;
  usesMax?: number;
  isHomebrew?: boolean;
  weight?: number;
  equipped?: boolean;
  attuned?: boolean;
  kind?: 'weapon' | 'armor' | 'shield' | 'gear' | 'consumable' | 'magic';
  armor?: {
    base: number;
    dexCap: number | null;
    category: 'light' | 'medium' | 'heavy';
  };
  shieldBonus?: number;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface ClassResource {
  id: string;
  name: string;
  usesMax: number;
  usesRemaining: number;
  recharge: 'Descanso Corto' | 'Descanso Largo' | 'Ninguna';
  description: string;
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

export interface HitDicePool {
  dieSize: 6 | 8 | 10 | 12;
  total: number;
  remaining: number;
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
  manualArmorClass?: boolean;
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
  hitDicePool?: HitDicePool;
  exhaustionLevel?: number;
  damageModifiers?: DamageModifiers;
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
  currency?: Currency;
  classFeatures?: ClassFeature[];
  classResources?: ClassResource[];

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
  consumesResource?: boolean;
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
  damageFormula?: string;
  rollAbility?: AbilityCode;
  rollProficient?: boolean;
}

export interface CombatRoundState {
  round: number;
  initiativeScore: number;
  isStanding: boolean;
  concentrationSpell: string | null;
  concentration?: ConcentrationState | null;
  conditions?: ConditionId[];
  activeEffects?: ActiveEffect[];
  encounter?: Encounter;
  hasInspiration: boolean;
  maxMovement: number;
  remainingMovement: number;
  hasDash: boolean;
  actionUsed: boolean;
  bonusActionUsed: boolean;
  reactionUsed: boolean;
}

export interface AppSettings {
  autoTrackActions: boolean;
}

export interface Combatant {
  id: string;
  name: string;
  side: 'player' | 'ally' | 'enemy';
  initiative: number;
  initiativeBonus?: number;
  hp?: number;
  maxHp?: number;
  ac?: number;
  conditions: ConditionId[];
  isCurrentCharacter?: boolean;
  notes?: string;
}

export interface Encounter {
  combatants: Combatant[];
  turnIndex: number;
  round: number;
}

export interface ActiveEffect {
  id: string;
  name: string;
  source?: string;
  roundsRemaining: number | null;
  requiresConcentration?: boolean;
  note?: string;
}

export interface ConcentrationState {
  spellName: string;
  spellLevel: number;
  startedRound: number;
}

export interface DiceRollResult {
  id: string;
  title: string;
  d20: number;
  natural?: number;
  modifier: number;
  total: number;
  isNat20: boolean;
  isNat1: boolean;
  subtext?: string;
  timestamp: Date;
  diceSides?: number;
  diceCount?: number;
  advantageMode?: 'normal' | 'advantage' | 'disadvantage';
  diceFormula?: string;
  isCriticalDamage?: boolean;
  autoFailed?: boolean;
}

export interface DiceRollOutcome {
  natural: number;
  total: number;
  autoFailed?: boolean;
}
