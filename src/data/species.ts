export interface SpeciesStartingTraits {
  traits: Array<{ name: string; description: string }>;
  skillProficiencies: string[];
}

const SPECIES_TRAITS: Record<string, SpeciesStartingTraits> = {
  'elfo de los bosques': {
    traits: [
      { name: 'Visión en la Oscuridad', description: 'Ves en la penumbra a 60 pies como si fuera luz brillante y en la oscuridad como si fuera penumbra.' },
      { name: 'Sentidos Agudos', description: 'Tienes competencia en la habilidad de Percepción.' },
      { name: 'Linaje Feérico', description: 'Tienes ventaja en las tiradas de salvación contra ser hechizado y la magia no puede dormirte.' },
      { name: 'Trance', description: 'No necesitas dormir; meditas profundamente durante 4 horas al día.' },
      { name: 'Entrenamiento Élfico con Armas', description: 'Tienes competencia con espada larga, espada corta, arco corto y arco largo.' },
      { name: 'Pies Ligeros', description: 'Tu velocidad caminando es de 35 pies.' },
      { name: 'Máscara de la Naturaleza', description: 'Puedes intentar esconderte incluso cuando solo estás ligeramente cubierto por follaje, lluvia intensa, nieve, niebla u otro fenómeno natural.' },
    ],
    skillProficiencies: ['Percepción'],
  },
};

export function speciesStartingTraits(name: string): SpeciesStartingTraits | undefined {
  return SPECIES_TRAITS[name.trim().toLocaleLowerCase('es')];
}
