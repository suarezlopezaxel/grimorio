import { ClassId } from '../types/character';

export interface ClassThemeDefinition {
  id: ClassId;
  name: string;
  subtitle: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    surface: string;
    border: string;
    bgGradient: string;
    cardBg: string;
    textAccent: string;
  };
  frameStyle: {
    borderStyle: string;
    cornerIcon: string;
    dividerSymbol: string;
    frameName: string;
    description: string;
  };
  effects: {
    particleType: string;
    screenEffect: string;
    glowColor: string;
  };
  specialMechanics: {
    name: string;
    componentType: string;
    description: string;
  };
}

export const CLASS_THEMES: Record<ClassId, ClassThemeDefinition> = {
  bardo: {
    id: 'bardo',
    name: 'Bardo',
    subtitle: 'Maestro de la Melodía y las Palabras Antiguas',
    palette: {
      primary: '#d4af37',      // Antique Gold
      secondary: '#881337',    // Deep Burgundy
      accent: '#fef08a',       // Score Sheet Cream
      glow: 'rgba(212, 175, 55, 0.4)',
      surface: 'rgba(38, 16, 24, 0.88)',
      border: 'rgba(212, 175, 55, 0.35)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(68, 20, 36, 0.45) 0%, rgba(16, 9, 14, 0.98) 75%)',
      cardBg: 'rgba(46, 20, 30, 0.85)',
      textAccent: '#fef3c7',
    },
    frameStyle: {
      borderStyle: 'staves',
      cornerIcon: 'treble_clef',
      dividerSymbol: '𝄞 ♩ ♪ ♫ ♬ 𝄞',
      frameName: 'Pentagrama Antiguo & Clave Dorada',
      description: 'Pentagramas musicales como líneas divisorias con cuerno y clave de sol en las esquinas.',
    },
    effects: {
      particleType: 'musical_notes',
      screenEffect: 'harmonious_glow',
      glowColor: '#d4af37',
    },
    specialMechanics: {
      name: 'Inspiración de Bardo & Instrumentos',
      componentType: 'lute_piano_strings',
      description: 'Cuerdas pulsables de laúd y teclado que vibran al gastar dados de inspiración.',
    },
  },

  druida: {
    id: 'druida',
    name: 'Druida',
    subtitle: 'Guardián del Círculo Primordial y la Arboleda',
    palette: {
      primary: '#22c55e',      // Moss Emerald
      secondary: '#4d7c0f',    // Forest Leaf
      accent: '#f59e0b',       // Amber Sap
      glow: 'rgba(34, 197, 94, 0.4)',
      surface: 'rgba(16, 28, 18, 0.88)',
      border: 'rgba(34, 197, 94, 0.35)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(20, 50, 24, 0.45) 0%, rgba(10, 18, 12, 0.98) 75%)',
      cardBg: 'rgba(20, 34, 22, 0.85)',
      textAccent: '#86efac',
    },
    frameStyle: {
      borderStyle: 'entwined_branches',
      cornerIcon: 'oak_leaves',
      dividerSymbol: '🌿 ─── 🍂 ─── 🌿',
      frameName: 'Ramas Entrelazadas & Corteza de Roble',
      description: 'Marcos de madera silvestre con raíces en las esquinas y hojas talladas.',
    },
    effects: {
      particleType: 'falling_leaves_fireflies',
      screenEffect: 'forest_mist',
      glowColor: '#22c55e',
    },
    specialMechanics: {
      name: 'Forma Salvaje & Brotes Florales',
      componentType: 'wild_shape_botanical_buds',
      description: 'Selector de bestias en rodajas de tronco de árbol y espacios de conjuro que florecen y se marchitan.',
    },
  },

  barbaro: {
    id: 'barbaro',
    name: 'Bárbaro',
    subtitle: 'Espíritu Totémico y Sed de Sangre Feroz',
    palette: {
      primary: '#ef4444',      // Blood Crimson
      secondary: '#92400e',    // Raw Hide Ochre
      accent: '#f97316',       // Hearth Flame
      glow: 'rgba(249, 115, 22, 0.4)',
      surface: 'rgba(28, 14, 14, 0.92)',
      border: 'rgba(180, 83, 9, 0.45)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(55, 18, 18, 0.5) 0%, rgba(14, 9, 9, 0.98) 75%)',
      cardBg: 'rgba(32, 16, 16, 0.88)',
      textAccent: '#fed7aa',
    },
    frameStyle: {
      borderStyle: 'bone_cord',
      cornerIcon: 'tribal_runes',
      dividerSymbol: 'ᚠ ─── ᚦ ─── ᚱ',
      frameName: 'Huesos, Cuerdas y Runas Talladas',
      description: 'Bordes de piedra rústica y cuero con marcas salvajes.',
    },
    effects: {
      particleType: 'blood_embers',
      screenEffect: 'rage_screen_shake',
      glowColor: '#ef4444',
    },
    specialMechanics: {
      name: 'Furia Temblorosa & Garras de Rabia',
      componentType: 'rage_claw_marks',
      description: 'Contador de furias con marcas de garra en roca y temblor de pantalla inmersivo.',
    },
  },

  clerigo: {
    id: 'clerigo',
    name: 'Clérigo',
    subtitle: 'Voz del Sagrado Dominio y Portador de Milagros',
    palette: {
      primary: '#facc15',      // Divine Radiance Gold
      secondary: '#38bdf8',    // Celestial Azure
      accent: '#ffffff',       // Pure Holy Light
      glow: 'rgba(250, 204, 21, 0.45)',
      surface: 'rgba(28, 26, 20, 0.88)',
      border: 'rgba(250, 204, 21, 0.35)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(60, 50, 20, 0.45) 0%, rgba(14, 14, 16, 0.98) 75%)',
      cardBg: 'rgba(34, 30, 22, 0.85)',
      textAccent: '#fef08a',
    },
    frameStyle: {
      borderStyle: 'gothic_arch',
      cornerIcon: 'holy_relic',
      dividerSymbol: '✦ ─── ✠ ─── ✦',
      frameName: 'Vitral Catedralicio & Arcos Góticos',
      description: 'Arcos ojivales con tracerías y santos emblemas en las esquinas.',
    },
    effects: {
      particleType: 'god_rays_light',
      screenEffect: 'divine_radiance',
      glowColor: '#facc15',
    },
    specialMechanics: {
      name: 'Símbolo Sagrado del Dominio & Canalizar Divinidad',
      componentType: 'holy_domain_altar',
      description: 'Emblema sagrado dinámico que muta según el dominio divino elegido.',
    },
  },

  guerrero: {
    id: 'guerrero',
    name: 'Guerrero',
    subtitle: 'Vanguardia de Acero y Tácticas de Armadura',
    palette: {
      primary: '#94a3b8',      // Forged Steel
      secondary: '#b45309',    // Burnished Bronze
      accent: '#e2e8f0',       // Cold Blade Sheen
      glow: 'rgba(148, 163, 184, 0.35)',
      surface: 'rgba(24, 28, 36, 0.9)',
      border: 'rgba(148, 163, 184, 0.35)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(35, 45, 60, 0.45) 0%, rgba(12, 14, 18, 0.98) 75%)',
      cardBg: 'rgba(28, 34, 44, 0.85)',
      textAccent: '#cbd5e1',
    },
    frameStyle: {
      borderStyle: 'riveted_plate',
      cornerIcon: 'heater_shield',
      dividerSymbol: '⚔ ─── 🛡 ─── ⚔',
      frameName: 'Placas de Acero con Remaches & Escudo',
      description: 'Armadura pesada forjada con escudos heráldicos y remaches metálicos.',
    },
    effects: {
      particleType: 'metal_sheens',
      screenEffect: 'steel_deflection',
      glowColor: '#94a3b8',
    },
    specialMechanics: {
      name: 'Segundo Aliento & Oleada de Acción',
      componentType: 'forged_action_medals',
      description: 'Medallas marciales de metal fundido que se apagan al consumirse.',
    },
  },

  monje: {
    id: 'monje',
    name: 'Monje',
    subtitle: 'Camino del Vacío, Palma de Viento y Equilibrio Ki',
    palette: {
      primary: '#e4e4e7',      // Washi Rice Paper Silk White
      secondary: '#27272a',    // Sumi Black Ink Wash
      accent: '#e11d48',       // Cinnabar Seal Chop Accent
      glow: 'rgba(228, 228, 231, 0.22)',
      surface: 'rgba(20, 20, 24, 0.94)',
      border: 'rgba(113, 113, 122, 0.4)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(39, 39, 42, 0.5) 0%, rgba(9, 9, 11, 0.98) 75%)',
      cardBg: 'rgba(24, 24, 28, 0.9)',
      textAccent: '#f4f4f5',
    },
    frameStyle: {
      borderStyle: 'calligraphy_brush',
      cornerIcon: 'zen_seal',
      dividerSymbol: '☯ ─── 氣 ─── ☯',
      frameName: 'Pincelada Caligráfica & Sello Rojo',
      description: 'Trazos fluidos de tinta tradicional sobre papel de arroz con estampa de laca cinabrio.',
    },
    effects: {
      particleType: 'ink_ripples',
      screenEffect: 'zen_flow',
      glowColor: '#a1a1aa',
    },
    specialMechanics: {
      name: 'Círculos Ensō de Ki',
      componentType: 'enso_ki_circles',
      description: 'Puntos de ki representados como círculos ensō de tinta meditativa.',
    },
  },

  paladin: {
    id: 'paladin',
    name: 'Paladín',
    subtitle: 'Espada de la Justicia y Baluarte del Juramento Sagrado',
    palette: {
      primary: '#38bdf8',      // Royal Azure
      secondary: '#f59e0b',    // Sacred Gold
      accent: '#e0f2fe',       // Argent Silver
      glow: 'rgba(56, 189, 248, 0.45)',
      surface: 'rgba(18, 25, 38, 0.88)',
      border: 'rgba(56, 189, 248, 0.35)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(20, 40, 65, 0.45) 0%, rgba(10, 13, 20, 0.98) 75%)',
      cardBg: 'rgba(22, 32, 48, 0.85)',
      textAccent: '#bae6fd',
    },
    frameStyle: {
      borderStyle: 'winged_shield',
      cornerIcon: 'angelic_wings',
      dividerSymbol: '✧ ─── ⚖ ─── ✧',
      frameName: 'Escudo Alado & Emblema de Juramento',
      description: 'Bordes de plata bruñida con alas celestiales en los vértices.',
    },
    effects: {
      particleType: 'radiant_aura',
      screenEffect: 'sacred_light_pulse',
      glowColor: '#38bdf8',
    },
    specialMechanics: {
      name: 'Imposición de Manos & Juramento Sagrado',
      componentType: 'lay_on_hands_reservoir',
      description: 'Aura pulsante con depósito interactivo de puntos de curación bendita.',
    },
  },

  picaro: {
    id: 'picaro',
    name: 'Pícaro',
    subtitle: 'Sombra Silenciosa, Filo Oculto y Maestro del Engaño',
    palette: {
      primary: '#a855f7',      // Midnight Amethyst
      secondary: '#ca8a04',    // Tarnished Brass
      accent: '#fef08a',       // Antiqued Brass Gold
      glow: 'rgba(168, 85, 247, 0.35)',
      surface: 'rgba(16, 10, 24, 0.94)',
      border: 'rgba(202, 138, 4, 0.45)', // Hand-crafted brass border
      bgGradient: 'radial-gradient(ellipse at 50% 15%, #190a2a 0%, #0d0416 55%, #040108 100%)',
      cardBg: 'rgba(22, 12, 34, 0.9)',
      textAccent: '#fde047',
    },
    frameStyle: {
      borderStyle: 'stitched_leather',
      cornerIcon: 'lockpick_cards',
      dividerSymbol: '♠ ─── 🗡 ─── ♠',
      frameName: 'Cuero Cosido, Ganzúas y Baraja Oculta',
      description: 'Marcos de cuero oscuro cosido a mano con naipes y ganzúas en las costuras.',
    },
    effects: {
      particleType: 'shadow_smoke',
      screenEffect: 'stealth_darkness',
      glowColor: '#a855f7',
    },
    specialMechanics: {
      name: 'Modo Oculto & Bolsa de Ladrón',
      componentType: 'thief_pouch_sneak',
      description: 'La hoja se oscurece al pasar a sigilo con calculadora de dados furtivos.',
    },
  },

  explorador: {
    id: 'explorador',
    name: 'Explorador',
    subtitle: 'Rastreador de las Tierras Salvajes y Cazador Furtivo',
    palette: {
      primary: '#84cc16',      // Olive Chartreuse
      secondary: '#78350f',    // Weathered Buckskin
      accent: '#bef264',       // Wayfinder Lime
      glow: 'rgba(132, 204, 22, 0.4)',
      surface: 'rgba(22, 26, 16, 0.88)',
      border: 'rgba(132, 204, 22, 0.32)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(35, 45, 20, 0.45) 0%, rgba(12, 16, 10, 0.98) 75%)',
      cardBg: 'rgba(28, 34, 20, 0.85)',
      textAccent: '#d9f99d',
    },
    frameStyle: {
      borderStyle: 'cartographic_chart',
      cornerIcon: 'compass_rose',
      dividerSymbol: '➹ ─── 🧭 ─── ➹',
      frameName: 'Carta de Navegación & Rosa de los Vientos',
      description: 'Bordes de mapa cartográfico antiguo con líneas de ruta y brújula.',
    },
    effects: {
      particleType: 'animal_tracks_wind',
      screenEffect: 'wayfinder_compass',
      glowColor: '#84cc16',
    },
    specialMechanics: {
      name: 'Trofeo de Enemigo Predilecto',
      componentType: 'favored_enemy_corkboard',
      description: 'Tablón de corcho con pergaminos clavados de presas y bonos tácticos.',
    },
  },

  hechicero: {
    id: 'hechicero',
    name: 'Hechicero',
    subtitle: 'Conducto de Magia Salvaje y Sangre Dracónica',
    palette: {
      primary: '#ec4899',      // Primordial Chaos Pink
      secondary: '#06b6d4',    // Storm Cyan
      accent: '#fbbf24',       // Dragon Fire Gold
      glow: 'rgba(236, 72, 153, 0.45)',
      surface: 'rgba(28, 16, 28, 0.9)',
      border: 'rgba(236, 72, 153, 0.35)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(55, 18, 45, 0.5) 0%, rgba(14, 8, 16, 0.98) 75%)',
      cardBg: 'rgba(34, 20, 34, 0.85)',
      textAccent: '#fbcfe8',
    },
    frameStyle: {
      borderStyle: 'energy_veins',
      cornerIcon: 'draconic_spark',
      dividerSymbol: '⚡ ─── ✵ ─── ⚡',
      frameName: 'Venas de Energía Vital & Arcanum Viviente',
      description: 'Líneas luminosas que laten por los márgenes conduciendo energía pura.',
    },
    effects: {
      particleType: 'wild_magic_sparks',
      screenEffect: 'mana_surge',
      glowColor: '#ec4899',
    },
    specialMechanics: {
      name: 'Orbes de Hechicería & Tabla Salvaje',
      componentType: 'sorcery_points_orbs',
      description: 'Orbes de energía crepitante que se combinan para metamagia.',
    },
  },

  brujo: {
    id: 'brujo',
    name: 'Brujo',
    subtitle: 'Voz del Pacto Profano y Portador de Susurros Antiguos',
    palette: {
      primary: '#10b981',      // Toxic Eldritch Jade
      secondary: '#7c3aed',    // Void Violet
      accent: '#34d399',       // Nether Flame
      glow: 'rgba(16, 185, 129, 0.45)',
      surface: 'rgba(14, 24, 20, 0.92)',
      border: 'rgba(16, 185, 129, 0.35)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(18, 45, 35, 0.45) 0%, rgba(8, 14, 12, 0.98) 75%)',
      cardBg: 'rgba(18, 30, 26, 0.88)',
      textAccent: '#a7f3d0',
    },
    frameStyle: {
      borderStyle: 'eldritch_sigils',
      cornerIcon: 'patron_eye',
      dividerSymbol: '👁 ─── 🜏 ─── 👁',
      frameName: 'Tentáculos Abisales, Ojos & Sigilos Arcanos',
      description: 'Ojos vigilantes y zarcillos que brotan según el patrón sobrenatural.',
    },
    effects: {
      particleType: 'eldritch_whispers',
      screenEffect: 'void_smoke',
      glowColor: '#10b981',
    },
    specialMechanics: {
      name: 'Grimorio del Patrón & Espacios de Pacto',
      componentType: 'patron_pact_tome',
      description: 'Espacios de conjuro recargables en descanso corto e invocaciones místicas.',
    },
  },

  mago: {
    id: 'mago',
    name: 'Mago',
    subtitle: 'Erudito del Códice Arcano y Maestro de la Urdimbre',
    palette: {
      primary: '#6366f1',      // Astral Indigo
      secondary: '#0ea5e9',    // Arcane Sapphire
      accent: '#e0e7ff',       // Starlight Parchment
      glow: 'rgba(99, 102, 241, 0.45)',
      surface: 'rgba(18, 20, 36, 0.9)',
      border: 'rgba(99, 102, 241, 0.35)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(28, 32, 60, 0.5) 0%, rgba(10, 12, 20, 0.98) 75%)',
      cardBg: 'rgba(24, 26, 44, 0.85)',
      textAccent: '#c7d2fe',
    },
    frameStyle: {
      borderStyle: 'celestial_sigils',
      cornerIcon: 'arcane_circle',
      dividerSymbol: '✶ ─── 🜛 ─── ✶',
      frameName: 'Círculos de Teletransporte & Sellos Arcanos',
      description: 'Sellos arcanos concéntricos giratorios y runas luminosas en suspensión.',
    },
    effects: {
      particleType: 'arcane_runes_orbit',
      screenEffect: 'weave_resonance',
      glowColor: '#6366f1',
    },
    specialMechanics: {
      name: 'Libro de Conjuros Interactivo & Recuperación',
      componentType: 'interactive_spellbook_pages',
      description: 'Páginas que se pasan con fórmulas arcanas y rituales registrados.',
    },
  },

  artifice: {
    id: 'artifice',
    name: 'Artífice',
    subtitle: 'Arquitecto de Engranajes, Alquimia y Forja Infusa',
    palette: {
      primary: '#f97316',      // Burnished Copper
      secondary: '#eab308',    // Polished Brass
      accent: '#38bdf8',       // Blueprint Cyan
      glow: 'rgba(249, 115, 22, 0.4)',
      surface: 'rgba(28, 22, 18, 0.9)',
      border: 'rgba(249, 115, 22, 0.35)',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(55, 35, 20, 0.45) 0%, rgba(14, 12, 10, 0.98) 75%)',
      cardBg: 'rgba(34, 28, 22, 0.85)',
      textAccent: '#fed7aa',
    },
    frameStyle: {
      borderStyle: 'blueprint_rivets',
      cornerIcon: 'cogs_gears',
      dividerSymbol: '⚙ ─── 🗜 ─── ⚙',
      frameName: 'Plano Técnico con Remaches & Engranajes',
      description: 'Esquemas milimétricos en cobre pulido y engranajes que giran lentamente.',
    },
    effects: {
      particleType: 'steam_cogs',
      screenEffect: 'tinkers_hum',
      glowColor: '#f97316',
    },
    specialMechanics: {
      name: 'Banco de Objetos Infundidos',
      componentType: 'infusion_workshop',
      description: 'Taller de forja con ranuras de infusión mágica activas.',
    },
  },
};
