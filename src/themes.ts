import { ClassKey, ClassTheme, ElementAffinity } from './types';

export const CLASS_THEMES: Record<ClassKey, ClassTheme> = {
  mago: {
    id: 'mago',
    name: 'Mago',
    subtitle: 'Zafiro Profundo & Índigo Arcano',
    description: 'Azul zafiro profundo, índigo arcano y plata lunar, con destellos cian de energía mágica.',
    icon: 'magic_button',
    colors: {
      primary: '#fbbf24',          // Oro arcano
      primaryContainer: '#fbbf24',
      onPrimaryContainer: '#261a00',
      secondary: '#d0bcff',        // Índigo / amatista arcano
      secondaryContainer: '#571bc1',
      onSecondaryContainer: '#c4abff',
      accent: '#38bdf8',           // Destello cian lunar
      surfaceContainerLow: '#1c1a24',
      surfaceContainer: '#211e28',
      surfaceContainerHigh: '#2b2932',
      borderGlow: 'rgba(87, 27, 193, 0.45)',
      vignetteGlow: 'rgba(87, 27, 193, 0.25)',
      badgeBg: 'rgba(87, 27, 193, 0.3)',
      badgeText: '#d0bcff'
    }
  },
  druida: {
    id: 'druida',
    name: 'Druida / Explorador',
    subtitle: 'Verde Planta & Esmeralda Rúnico',
    description: 'Tonos verde planta, esmeralda rúnico y maderas nobles.',
    icon: 'forest',
    colors: {
      primary: '#a3e635',          // Verde brote vivo / oro verde
      primaryContainer: '#65a30d',
      onPrimaryContainer: '#142900',
      secondary: '#34d399',        // Esmeralda rúnico
      secondaryContainer: '#065f46',
      onSecondaryContainer: '#a7f3d0',
      accent: '#ca8a04',           // Madera noble / ocre
      surfaceContainerLow: '#152119',
      surfaceContainer: '#1a291f',
      surfaceContainerHigh: '#23382b',
      borderGlow: 'rgba(16, 185, 129, 0.4)',
      vignetteGlow: 'rgba(5, 150, 105, 0.22)',
      badgeBg: 'rgba(6, 95, 70, 0.4)',
      badgeText: '#6ee7b7'
    }
  },
  bardo: {
    id: 'bardo',
    name: 'Bardo',
    subtitle: 'Iridiscente & Tornasolado',
    description: 'Acentos iridiscentes y tornasolados sobre fondo oscuro.',
    icon: 'music_note',
    colors: {
      primary: '#f472b6',          // Rosa iridiscente tornasol
      primaryContainer: '#ec4899',
      onPrimaryContainer: '#2d0617',
      secondary: '#38bdf8',        // Azul prismático
      secondaryContainer: '#7c3aed',
      onSecondaryContainer: '#e9d5ff',
      accent: '#fbbf24',           // Ámbar prismático
      surfaceContainerLow: '#1f1627',
      surfaceContainer: '#271c32',
      surfaceContainerHigh: '#352544',
      borderGlow: 'rgba(236, 72, 153, 0.45)',
      vignetteGlow: 'rgba(124, 58, 237, 0.25)',
      badgeBg: 'rgba(124, 58, 237, 0.35)',
      badgeText: '#f472b6'
    }
  },
  guerrero: {
    id: 'guerrero',
    name: 'Guerrero / Paladín',
    subtitle: 'Rojo Carmesí & Acero Templado',
    description: 'Rojo carmesí de batalla y acero templado bruñido.',
    icon: 'shield',
    colors: {
      primary: '#f87171',          // Carmesí de batalla
      primaryContainer: '#dc2626',
      onPrimaryContainer: '#380606',
      secondary: '#94a3b8',        // Acero templado bruñido
      secondaryContainer: '#475569',
      onSecondaryContainer: '#f1f5f9',
      accent: '#fbbf24',           // Oro de honor del paladín
      surfaceContainerLow: '#241718',
      surfaceContainer: '#2c1c1d',
      surfaceContainerHigh: '#3b2527',
      borderGlow: 'rgba(220, 38, 38, 0.45)',
      vignetteGlow: 'rgba(185, 28, 28, 0.25)',
      badgeBg: 'rgba(153, 27, 27, 0.4)',
      badgeText: '#fca5a5'
    }
  },
  picaro: {
    id: 'picaro',
    name: 'Pícaro',
    subtitle: 'Gris Antracita & Ámbar Eléctrico',
    description: 'Gris antracita, sombras púrpuras y destellos ámbar eléctrico para sigilo.',
    icon: 'visibility_off',
    colors: {
      primary: '#fbbf24',          // Ámbar eléctrico de sigilo
      primaryContainer: '#d97706',
      onPrimaryContainer: '#2b1400',
      secondary: '#a855f7',        // Sombras púrpuras
      secondaryContainer: '#3b0764',
      onSecondaryContainer: '#f3e8ff',
      accent: '#64748b',           // Antracita frío
      surfaceContainerLow: '#18171d',
      surfaceContainer: '#1e1c24',
      surfaceContainerHigh: '#27242e',
      borderGlow: 'rgba(217, 119, 6, 0.45)',
      vignetteGlow: 'rgba(59, 7, 100, 0.35)',
      badgeBg: 'rgba(59, 7, 100, 0.5)',
      badgeText: '#fcd34d'
    }
  },
  barbaro: {
    id: 'barbaro',
    name: 'Bárbaro',
    subtitle: 'Ocre Tierra & Sangre Seca',
    description: 'Ocre tierra, rojo óxido de sangre seca, cuero curtido y blancos de hueso desgastado.',
    icon: 'swords',
    colors: {
      primary: '#ea580c',          // Rojo óxido / sangre seca
      primaryContainer: '#c2410c',
      onPrimaryContainer: '#270802',
      secondary: '#d97706',        // Ocre tierra y cuero
      secondaryContainer: '#78350f',
      onSecondaryContainer: '#fef3c7',
      accent: '#e2e8f0',           // Blanco hueso desgastado
      surfaceContainerLow: '#221915',
      surfaceContainer: '#2b1f1a',
      surfaceContainerHigh: '#392923',
      borderGlow: 'rgba(194, 65, 12, 0.45)',
      vignetteGlow: 'rgba(120, 53, 15, 0.28)',
      badgeBg: 'rgba(120, 53, 15, 0.4)',
      badgeText: '#fdba74'
    }
  },
  clerigo: {
    id: 'clerigo',
    name: 'Clérigo',
    subtitle: 'Marfil Luminoso & Dorado Sagrado',
    description: 'Blanco marfil luminoso, dorado sagrado y azul celeste suave, con brillos de luz divina.',
    icon: 'sunny',
    colors: {
      primary: '#fef08a',          // Dorado sagrado radiante
      primaryContainer: '#eab308',
      onPrimaryContainer: '#2b1e00',
      secondary: '#7dd3fc',        // Azul celeste suave divino
      secondaryContainer: '#0369a1',
      onSecondaryContainer: '#e0f2fe',
      accent: '#f8fafc',           // Blanco marfil luminoso
      surfaceContainerLow: '#1c1b21',
      surfaceContainer: '#24222b',
      surfaceContainerHigh: '#302d39',
      borderGlow: 'rgba(234, 179, 8, 0.45)',
      vignetteGlow: 'rgba(234, 179, 8, 0.2)',
      badgeBg: 'rgba(234, 179, 8, 0.25)',
      badgeText: '#fef08a'
    }
  },
  hechicero: {
    id: 'hechicero',
    name: 'Hechicero',
    subtitle: 'Magenta Ardiente & Violeta Eléctrico',
    description: 'Magenta ardiente, violeta eléctrico y carmesí vivo con resplandores dorados, como poder en bruto que se desborda.',
    icon: 'bolt',
    colors: {
      primary: '#f43f5e',          // Carmesí vivo ardiente
      primaryContainer: '#e11d48',
      onPrimaryContainer: '#33020c',
      secondary: '#a855f7',        // Violeta eléctrico
      secondaryContainer: '#6b21a8',
      onSecondaryContainer: '#f3e8ff',
      accent: '#facc15',           // Resplandor dorado de poder bruto
      surfaceContainerLow: '#221520',
      surfaceContainer: '#2c1a29',
      surfaceContainerHigh: '#3a2336',
      borderGlow: 'rgba(225, 29, 72, 0.48)',
      vignetteGlow: 'rgba(168, 85, 247, 0.25)',
      badgeBg: 'rgba(107, 33, 168, 0.45)',
      badgeText: '#fda4af'
    }
  },
  brujo: {
    id: 'brujo',
    name: 'Brujo',
    subtitle: 'Púrpura Abisal & Verde Espectral',
    description: 'Púrpura abisal, negro vacío y verde tóxico espectral, con toques de rojo ascua de pacto oscuro.',
    icon: 'skull',
    colors: {
      primary: '#10b981',          // Verde tóxico espectral
      primaryContainer: '#059669',
      onPrimaryContainer: '#012015',
      secondary: '#c084fc',        // Púrpura abisal
      secondaryContainer: '#3b0764',
      onSecondaryContainer: '#f3e8ff',
      accent: '#f87171',           // Rojo ascua de pacto oscuro
      surfaceContainerLow: '#15131b',
      surfaceContainer: '#1c1924',
      surfaceContainerHigh: '#262232',
      borderGlow: 'rgba(16, 185, 129, 0.45)',
      vignetteGlow: 'rgba(59, 7, 100, 0.4)',
      badgeBg: 'rgba(16, 185, 129, 0.25)',
      badgeText: '#6ee7b7'
    }
  },
  monje: {
    id: 'monje',
    name: 'Monje',
    subtitle: 'Naranja Azafrán & Piedra Serena',
    description: 'Naranja azafrán, beige pergamino y gris piedra serena, con acentos de bronce y blanco neblina.',
    icon: 'self_improvement',
    colors: {
      primary: '#f97316',          // Naranja azafrán
      primaryContainer: '#ea580c',
      onPrimaryContainer: '#2b0c00',
      secondary: '#cbd5e1',        // Blanco neblina / pergamino
      secondaryContainer: '#475569',
      onSecondaryContainer: '#f8fafc',
      accent: '#b45309',           // Bronce / piedra serena
      surfaceContainerLow: '#1f1b19',
      surfaceContainer: '#27221f',
      surfaceContainerHigh: '#352e2a',
      borderGlow: 'rgba(249, 115, 22, 0.45)',
      vignetteGlow: 'rgba(180, 83, 9, 0.22)',
      badgeBg: 'rgba(71, 85, 105, 0.4)',
      badgeText: '#fed7aa'
    }
  },
  artifice: {
    id: 'artifice',
    name: 'Artífice',
    subtitle: 'Cobre Bruñido & Azul Acero',
    description: 'Cobre bruñido, latón envejecido y azul acero, con destellos turquesa de energía y engranajes.',
    icon: 'settings_suggest',
    colors: {
      primary: '#06b6d4',          // Destellos turquesa de energía
      primaryContainer: '#0891b2',
      onPrimaryContainer: '#03252d',
      secondary: '#d97706',        // Cobre bruñido & latón envejecido
      secondaryContainer: '#78350f',
      onSecondaryContainer: '#fef3c7',
      accent: '#64748b',           // Azul acero
      surfaceContainerLow: '#171e22',
      surfaceContainer: '#1d262c',
      surfaceContainerHigh: '#27343c',
      borderGlow: 'rgba(6, 182, 212, 0.45)',
      vignetteGlow: 'rgba(6, 182, 212, 0.2)',
      badgeBg: 'rgba(8, 145, 178, 0.35)',
      badgeText: '#67e8f9'
    }
  },
  homebrew: {
    id: 'homebrew',
    name: 'Homebrew / Personalizado',
    subtitle: 'Rúnico Forjado & Espectro Libre',
    description: 'Tonos místicos adaptables con acentos dorados y esmeralda cósmico para creaciones únicas.',
    icon: 'construction',
    colors: {
      primary: '#eab308',
      primaryContainer: '#ca8a04',
      onPrimaryContainer: '#241a00',
      secondary: '#2dd4bf',
      secondaryContainer: '#0f766e',
      onSecondaryContainer: '#ccfbf1',
      accent: '#a855f7',
      surfaceContainerLow: '#181b1d',
      surfaceContainer: '#1f2326',
      surfaceContainerHigh: '#292f33',
      borderGlow: 'rgba(234, 179, 8, 0.45)',
      vignetteGlow: 'rgba(45, 212, 191, 0.25)',
      badgeBg: 'rgba(15, 118, 110, 0.4)',
      badgeText: '#5eead4'
    }
  }
};

export const ELEMENT_ACCENTS: Record<ElementAffinity, { name: string; color: string; bg: string; border: string; glow: string; icon: string }> = {
  neutral: {
    name: 'Neutral',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.15)',
    border: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.4)',
    icon: 'auto_awesome'
  },
  agua: {
    name: 'Agua (Azul)',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.18)',
    border: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
    icon: 'water_drop'
  },
  tierra: {
    name: 'Tierra (Verde)',
    color: '#4ade80',
    bg: 'rgba(74, 222, 128, 0.18)',
    border: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.45)',
    icon: 'terrain'
  },
  fuego: {
    name: 'Fuego (Rojo)',
    color: '#f87171',
    bg: 'rgba(248, 113, 113, 0.18)',
    border: '#f87171',
    glow: 'rgba(248, 113, 113, 0.45)',
    icon: 'local_fire_department'
  }
};
