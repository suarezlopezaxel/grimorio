import { CharacterSheet, TacticalCard, CombatRoundState } from '../types';

export const DEFAULT_CHARACTER: CharacterSheet = {
  id: 'lyra-shadowwhisper',
  name: 'Lyra Lunargentea',
  epithet: 'Heredera Astral',
  characterClass: 'Maga (Orden Escribas)',
  subclass: 'Hechicero del Caos',
  level: 5,
  race: 'Semielfa Astral',
  background: 'Erudita Arcana',
  alignment: 'Caótico Bueno',
  experience: 14250,
  nextLevelXp: 23000,
  hasInspiration: true,
  classKey: 'mago',

  // Tactical Stats
  armorClass: 15,
  acType: 'Mágica',
  initiative: 2,
  speedFeet: 30,
  proficiencyBonus: 3,
  passivePerception: 14,
  spellSaveDc: 15,
  spellAttackBonus: 7,

  // Health
  currentHp: 32,
  maxHp: 32,
  tempHp: 0,
  hitDice: '5d6',
  deathSaves: {
    successes: 0,
    failures: 0,
  },

  // Six Monumental Attributes
  abilities: {
    FUE: { name: 'Fuerza', code: 'FUE', base: 8, modifier: -1, savingThrow: -1, isProficientSave: false },
    DES: { name: 'Destreza', code: 'DES', base: 14, modifier: 2, savingThrow: 2, isProficientSave: false },
    CON: { name: 'Constitución', code: 'CON', base: 14, modifier: 2, savingThrow: 2, isProficientSave: false },
    INT: { name: 'Inteligencia', code: 'INT', base: 18, modifier: 4, savingThrow: 7, isProficientSave: true, isKeyAttribute: true },
    SAB: { name: 'Sabiduría', code: 'SAB', base: 12, modifier: 1, savingThrow: 4, isProficientSave: true },
    CAR: { name: 'Carisma', code: 'CAR', base: 10, modifier: 0, savingThrow: 0, isProficientSave: false },
  },

  // 18 Disciplines
  skills: [
    { name: 'Acrobacias', attr: 'DES', modifier: 2, isProficient: false },
    { name: 'Arcanos', attr: 'INT', modifier: 7, isProficient: true },
    { name: 'Atletismo', attr: 'FUE', modifier: -1, isProficient: false },
    { name: 'Engaño', attr: 'CAR', modifier: 0, isProficient: false },
    { name: 'Historia', attr: 'INT', modifier: 7, isProficient: true },
    { name: 'Intimidación', attr: 'CAR', modifier: 0, isProficient: false },
    { name: 'Investigación', attr: 'INT', modifier: 7, isProficient: true },
    { name: 'Juego de Manos', attr: 'DES', modifier: 2, isProficient: false },
    { name: 'Medicina', attr: 'SAB', modifier: 1, isProficient: false },
    { name: 'Naturaleza', attr: 'INT', modifier: 4, isProficient: false },
    { name: 'Percepción', attr: 'SAB', modifier: 4, isProficient: true },
    { name: 'Perspicacia', attr: 'SAB', modifier: 1, isProficient: false },
    { name: 'Persuasión', attr: 'CAR', modifier: 0, isProficient: false },
    { name: 'Religión', attr: 'INT', modifier: 4, isProficient: false },
    { name: 'Sigilo', attr: 'DES', modifier: 2, isProficient: false },
    { name: 'Supervivencia', attr: 'SAB', modifier: 1, isProficient: false },
    { name: 'Trato con Animales', attr: 'SAB', modifier: 1, isProficient: false },
    { name: 'Interpretación', attr: 'CAR', modifier: 0, isProficient: false },
  ],

  // Spell Slots
  spellSlots: [
    { tier: 1, max: 4, current: 4 },
    { tier: 2, max: 3, current: 3 },
    { tier: 3, max: 2, current: 2 },
  ],
  preparedSpellsCount: 9,
  weapons: [
    {
      id: 'lyra-wand',
      name: 'Vara Relámpago Afilada',
      attackBonus: 7,
      damage: '1d8 + 4',
      damageType: 'Relámpago',
      reach: '5 ft',
      properties: 'Mágica, Versátil',
      isEquipped: true,
    },
  ],
  spells: [
    {
      id: 'lyra-magic-missile',
      name: 'Proyectil Mágico',
      level: 1,
      school: 'Evocación',
      castingTime: '1 Acción',
      range: '120 ft',
      components: 'V, S',
      duration: 'Instantáneo',
      concentration: false,
      attackOrDc: 'Automático',
      damageOrHeal: '3d4 + 3 Fuerza',
      description: 'Tres dardos de fuerza impactan automáticamente a criaturas elegidas.',
    },
    {
      id: 'lyra-fire-bolt',
      name: 'Rayo de Fuego',
      level: 0,
      school: 'Evocación',
      castingTime: '1 Acción',
      range: '120 ft',
      components: 'V, S',
      duration: 'Instantáneo',
      concentration: false,
      attackOrDc: '+7 Ataque',
      damageOrHeal: '2d10 Fuego',
      description: 'Lanzas un rayo ígneo contra una criatura u objeto.',
    },
  ],

  // Traits of the Living Grimoire
  traits: [
    {
      title: 'Pluma de Mago • Copia Instantánea',
      badge: 'PASIVA',
      badgeType: 'neutral',
      description: 'Transcribir conjuros al libro solo toma 2 minutos por nivel en lugar de 2 horas. No requiere costo en tintas arcanas exóticas.'
    },
    {
      title: 'Transmutación Elemental de Daño',
      badge: 'ESPACIO REQUERIDO',
      badgeType: 'accent',
      description: 'Al lanzar un conjuro que cause daño usando un espacio de magia, puedes reemplazar temporalmente su tipo por otro daño de un conjuro conocido del mismo nivel.'
    },
    {
      title: 'Manifestación del Espíritu del Grimorio',
      badge: '1 ACCIÓN',
      badgeType: 'action',
      description: 'Invocas una proyección flotante y translúcida de tu códice. Puedes percibir a través de él y lanzar conjuros desde su ubicación espacial.'
    }
  ],

  senses: [
    { name: 'Visión en la Oscuridad', detail: '60 pies' },
    { name: 'Sentido Arcano Pasivo', detail: '14' },
  ],

  languages: ['Común', 'Élfico', 'Celestial', 'Dracónico'],
  portraitUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80'
};

export const DEFAULT_COMBAT_STATE: CombatRoundState = {
  round: 3,
  initiativeScore: 18,
  isStanding: true,
  concentrationSpell: 'Escudo de Fe',
  hasInspiration: true,
  maxMovement: 30,
  remainingMovement: 30,
  hasDash: false,
  actionUsed: false,
  bonusActionUsed: false,
  reactionUsed: false,
};

export const DEFAULT_TACTICAL_CARDS: TacticalCard[] = [
  {
    id: 'card-1',
    title: 'Vara Relámpago Afilada',
    category: 'attack',
    typeBadge: 'Arma Mágica • Cuerpo a Cuerpo',
    actionType: 'Acción',
    reach: '5 ft (C/C)',
    hitBonusOrDc: '+7',
    targetOrArea: '1 Criatura',
    primaryDamageOrEffect: '1d8 + 4',
    secondaryEffect: '+ 1d6 contundente',
    resourceDesc: 'Recurso: Municipal / Sin Límite',
    description: 'Forjada por el gremio de escribas de la tormenta. Si el objetivo viste armadura de metal, la tirada de ataque gana ventaja automática.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    rollFormula: '1d20+7'
  },
  {
    id: 'card-2',
    title: 'Ecos Arcanos de Escriba',
    category: 'skill',
    typeBadge: 'Dote Homebrew • Nivel 4',
    actionType: 'Acción Adicional',
    reach: 'Uno mismo',
    hitBonusOrDc: '+1 CD Salvación',
    targetOrArea: 'Uno mismo (1 Asalto)',
    primaryDamageOrEffect: 'Alteración Elemental',
    resourceDesc: 'Usos Diarios: 3 Disponibles',
    resourceMax: 3,
    resourceUsed: 1,
    description: 'Puedes transcribir mentalmente el tipo de daño del próximo conjuro que lances. Cambia el elemento a fuego, frío, relámpago, ácido o fuerza sin gastar componentes materiales.',
    imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'card-3',
    title: 'Saeta Bruja Mejorada',
    category: 'spell',
    typeBadge: 'Evocación • V, S, M',
    actionType: 'Acción',
    levelSlot: 'Nivel 1',
    reach: '60 ft',
    hitBonusOrDc: '+7',
    targetOrArea: '1 Criatura',
    primaryDamageOrEffect: '2d12 Relámpago',
    secondaryEffect: '1d12 continuo con acción',
    resourceDesc: 'Gasta: Slot Nivel 1+ (Concentración 1 min)',
    description: 'En turnos subsecuentes, puedes usar una acción para infligir 1d12 de daño relámpago automáticamente mientras mantengas concentración. Escalado: +1d12 por nivel de slot superior.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    rollFormula: '1d20+7'
  },
  {
    id: 'card-4',
    title: 'Poción de Curación Mayor',
    category: 'item',
    typeBadge: 'Poción Rara • Alquimia',
    actionType: 'Acción Adicional',
    reach: 'Uno mismo o Toque',
    hitBonusOrDc: 'Automático',
    targetOrArea: '1 Criatura',
    primaryDamageOrEffect: '4d4 + 4 PV',
    resourceDesc: 'Frascos en Bolsa: 2 Unidades',
    resourceMax: 2,
    resourceUsed: 0,
    description: 'Líquido rojo resplandeciente con aroma a corteza de árbol sagrado y canela salvaje. Beberlo cierra de golpe laceraciones profundas.',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
    rollFormula: '4d4+4'
  },
  {
    id: 'card-5',
    title: 'Contramedida Rúnica',
    category: 'reaction',
    typeBadge: 'Defensa Rúnica • Abjuración',
    actionType: 'Reacción',
    reach: 'Uno mismo',
    hitBonusOrDc: 'Reacción Inmediata',
    targetOrArea: 'Uno mismo',
    primaryDamageOrEffect: 'Mitiga 50%',
    secondaryEffect: '+1d6 elemental al sig. golpe',
    trigger: 'Cuando recibes daño de Fuego, Frío, Relámpago, Ácido o Trueno proveniente de un ataque o conjuro.',
    resourceDesc: 'Uso por Combate: 1 Disponible',
    resourceMax: 1,
    resourceUsed: 0,
    description: 'Ganas resistencia al tipo de daño activador contra ese ataque y tu siguiente ataque cuerpo a cuerpo inflige +1d6 extra del mismo tipo elemental absorbido.',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'card-6',
    title: 'Acciones Estándar (8 en 1)',
    category: 'standard',
    typeBadge: 'D&D 5ª Edición • Reglas Base',
    actionType: 'Acción',
    reach: 'Variable',
    hitBonusOrDc: 'Reglamentario',
    targetOrArea: 'Campo Táctico',
    primaryDamageOrEffect: 'Maniobras Básicas',
    description: 'Despliega cualquier maniobra reglamentaria disponible para cualquier criatura durante su turno de acción (Correr, Esquivar, Destrabarse, Ayudar, Esconderse, Preparar, Agarrar, Empujar).',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
  }
];

export const STANDARD_5E_ACTIONS = [
  {
    name: 'Correr (Dash)',
    icon: 'directions_run',
    color: '#fbbf24',
    desc: 'Obtienes movimiento adicional para el turno actual equivalente a tu velocidad actual con modificadores.'
  },
  {
    name: 'Esquivar (Dodge)',
    icon: 'security',
    color: '#d0bcff',
    desc: 'Hasta el inicio de tu próximo turno, cualquier ataque en tu contra tiene desventaja si puedes ver al atacante, y tienes ventaja en tiradas de salvación de Destreza.'
  },
  {
    name: 'Destrabarse (Disengage)',
    icon: 'transfer_within_a_station',
    color: '#facc15',
    desc: 'Tu movimiento no provoca ataques de oportunidad durante el resto del turno actual.'
  },
  {
    name: 'Ayudar (Help)',
    icon: 'front_hand',
    color: '#38bdf8',
    desc: 'Prestas auxilio a un aliado. Otorga ventaja en la siguiente prueba de característica o en el siguiente ataque contra un objetivo a 5 ft.'
  },
  {
    name: 'Esconderse (Hide)',
    icon: 'visibility_off',
    color: '#94a3b8',
    desc: 'Haces una prueba de Destreza (Sigilo) para volverte inadvertido superando la Percepción Pasiva del enemigo.'
  },
  {
    name: 'Preparar Acción (Ready)',
    icon: 'hourglass_bottom',
    color: '#f87171',
    desc: 'Eliges una circunstancia desencadenante. Cuando ocurra antes de tu próximo turno, ejecutas la acción gastando tu Reacción.'
  },
  {
    name: 'Agarrar (Grapple)',
    icon: 'sports_kabaddi',
    color: '#fb923c',
    desc: 'Prueba opuesta: Tu Atletismo vs su Atletismo o Acrobacias. Reduce la velocidad del objetivo a 0 pies si tienes éxito.'
  },
  {
    name: 'Empujar (Shove)',
    icon: 'swipe_right',
    color: '#cbd5e1',
    desc: 'Prueba opuesta de Atletismo. Puedes derribar a la criatura (dejarla tumbada / prone) o alejarla 5 ft de ti.'
  }
];
